import { useEffect, useState, useRef } from "react";
import ProductCard from "../components/ProductCard";
import AdminSidebar from "../components/AdminSidebar";
import ReorderImages from "../components/ReorderImages";
import "../styles/admin-dashboard.css";

const apiUrl = 'https://accessories-backend-production.up.railway.app';

// Utility to ensure HTTPS URLs
const ensureHttps = (url) => {
  if (!url) return url;
  if (typeof url === 'string' && url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
};

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeProductId, setActiveProductId] = useState(null);
  const wrapperRefs = useRef({});
  const token = localStorage.getItem("admin_token");

  /* ================= LOAD PRODUCTS ================= */
  const loadProducts = async () => {
    const data = await fetch(
      `${apiUrl}/client/products`
    ).then((r) => r.json());

    setProducts(
      data.map((p) => ({
        ...p,
        images: p.images?.map(img => ({
          ...img,
          image_url: ensureHttps(img.image_url)
        })),
        posX: p.image_pos_x ?? 50,
        posY: p.image_pos_y ?? 50,
        scale: p.image_scale ?? 1,
        discount_price: p.discount_price ?? null,
        featured: p.featured ?? false, // ⭐ الجديد
      }))
    );
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* ================= WHEEL ZOOM ================= */
  useEffect(() => {
    if (activeProductId === null) return;
    const el = wrapperRefs.current[activeProductId];
    if (!el) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;

      setProducts((prev) =>
        prev.map((p) =>
          p.id === activeProductId
            ? {
                ...p,
                scale: Math.min(
                  2,
                  Math.max(0.6, (p.scale ?? 1) + delta)
                ),
              }
            : p
        )
      );
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [activeProductId]);

  /* ================= UPDATE LOCAL ================= */
  const updateProduct = (id, changes) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...changes } : p))
    );
  };

  /* ================= ADD IMAGE ================= */
  const addImage = async (productId, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(
      `${apiUrl}/admin/products/${productId}/images`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!res.ok) {
      alert("فشل رفع الصورة ❌");
      return;
    }

    await loadProducts();
  };

  /* ================= DELETE IMAGE ================= */
  const deleteImage = async (imageId) => {
    if (!window.confirm("مسح الصورة؟")) return;

    const res = await fetch(
      `${apiUrl}/admin/images/${imageId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      alert("فشل حذف الصورة ❌");
      return;
    }

    await loadProducts();
  };

  /* ================= DELETE PRODUCT ================= */
  const deleteProduct = async (productId) => {
    if (!window.confirm("مسح المنتج بالكامل؟ ❌")) return;

    const res = await fetch(
      `${apiUrl}/admin/delete/${productId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      alert("فشل حذف المنتج ❌");
      return;
    }

    await loadProducts();
  };

  /* ================= SAVE ================= */
  const saveChanges = async (product) => {
    if (!product.images || product.images.length === 0) {
      alert("لازم تضيفي صورة واحدة على الأقل ❌");
      return;
    }

    const cover = product.images.find((i) => i.is_cover);
    if (!cover) {
      alert("لازم تختاري صورة كافر ❌");
      return;
    }

    await fetch(
      `${apiUrl}/admin/products/${product.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          price: product.price,
          discount_price: product.discount_price,
          quantity: product.quantity,
          featured: product.featured, // ⭐ الجديد
          image_pos_x: product.posX,
          image_pos_y: product.posY,
          image_scale: product.scale,
        }),
      }
    );

    await fetch(
      `${apiUrl}/admin/products/${product.id}/images/reorder`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          images: product.images.map((img, index) => ({
            id: img.id,
            sort_order: index,
          })),
          cover_image_id: cover.id,
        }),
      }
    );

    alert("Saved ✨");
  };

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      <div className={sidebarOpen ? "sidebar open" : "sidebar"}>
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="admin-content">
        <h2 className="section-title">Admin Home Preview</h2>

        <div className="products-scroll">
          {products.map((p) => {
            const cover = p.images?.find((i) => i.is_cover);

            return (
              <div key={p.id} className="admin-editor-card">
                {cover && (
                  <div className="cover-preview">
                    <span>Cover preview</span>
                    <img src={cover.image_url} alt="" />
                  </div>
                )}

                {/* IMAGE PREVIEW + DRAG */}
                <div
                  className="product-image-wrapper drag-enabled"
                  ref={(el) => (wrapperRefs.current[p.id] = el)}
                  onMouseEnter={() => setActiveProductId(p.id)}
                  onMouseLeave={() => setActiveProductId(null)}
                >
                  <ProductCard
                    product={{
                      ...p,
                      images: p.images?.map((img) =>
                        img.is_cover
                          ? {
                              ...img,
                              pos_x: p.posX,
                              pos_y: p.posY,
                              scale: p.scale,
                            }
                          : img
                      ),
                    }}
                    addToCart={null}
                  />
                </div>

                {/* FEATURED */}
                <label className="featured-checkbox">
                  <input
                    type="checkbox"
                    checked={p.featured}
                    onChange={(e) =>
                      updateProduct(p.id, {
                        featured: e.target.checked,
                      })
                    }
                  />
                  Featured piece
                </label>

                {/* ADD IMAGE */}
                <div className="add-image">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      addImage(p.id, e.target.files[0])
                    }
                  />
                </div>

                {/* REORDER */}
                <ReorderImages
                  images={p.images}
                  onDelete={deleteImage}
                  onChange={(imgs) =>
                    updateProduct(p.id, { images: imgs })
                  }
                />

                {/* EDIT FIELDS */}
                <div className="admin-fields">
                  <input
                    type="text"
                    value={p.name}
                    placeholder="Product name"
                    onChange={(e) =>
                      updateProduct(p.id, { name: e.target.value })
                    }
                  />

                  <textarea
                    value={p.description}
                    placeholder="Description"
                    onChange={(e) =>
                      updateProduct(p.id, {
                        description: e.target.value,
                      })
                    }
                  />

                  <input
                    type="number"
                    value={p.price}
                    placeholder="Price"
                    onChange={(e) =>
                      updateProduct(p.id, {
                        price: Number(e.target.value),
                      })
                    }
                  />

                  <input
                    type="number"
                    value={p.discount_price ?? ""}
                    placeholder="Discount Price (optional)"
                    onChange={(e) =>
                      updateProduct(p.id, {
                        discount_price: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  />

                  <input
                    type="number"
                    value={p.quantity}
                    placeholder="Quantity"
                    onChange={(e) =>
                      updateProduct(p.id, {
                        quantity: Number(e.target.value),
                      })
                    }
                  />
                </div>

                {/* ACTIONS */}
                <div className="admin-actions">
                  <button
                    className="save-btn"
                    onClick={() => saveChanges(p)}
                  >
                    Save
                  </button>

                  <button
                    className="delete-product-btn"
                    onClick={() => deleteProduct(p.id)}
                  >
                    Delete Product
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
};

export default AdminDashboard;
