import { useEffect, useState, useRef } from "react";
import ProductCard from "../components/ProductCard";
import AdminSidebar from "../components/AdminSidebar";
import ReorderImages from "../components/ReorderImages";
import "../styles/admin-dashboard.css";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeProductId, setActiveProductId] = useState(null);
  const wrapperRef = useRef(null);
  const token = localStorage.getItem("admin_token");

  /* ================= LOAD PRODUCTS ================= */
  const loadProducts = async () => {
    const data = await fetch(
      "http://127.0.0.1:8000/client/products"
    ).then((r) => r.json());

    setProducts(
      data.map((p) => ({
        ...p,
        posX: p.image_pos_x ?? 50,
        posY: p.image_pos_y ?? 50,
        scale: p.image_scale ?? 1,
      }))
    );
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* ================= WHEEL ZOOM (PASSIVE FIX) ================= */
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || activeProductId === null) return;

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

    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
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
      `http://127.0.0.1:8000/admin/products/${productId}/images`,
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
      `http://127.0.0.1:8000/admin/images/${imageId}`,
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
      `http://127.0.0.1:8000/admin/delete/${productId}`,
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
      `http://127.0.0.1:8000/admin/products/${product.id}`,
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
          quantity: product.quantity,
          image_pos_x: product.posX,
          image_pos_y: product.posY,
          image_scale: product.scale,
        }),
      }
    );

    await fetch(
      `http://127.0.0.1:8000/admin/products/${product.id}/images/reorder`,
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

                <div className="admin-fields">
                  <input
                    value={p.name}
                    onChange={(e) =>
                      updateProduct(p.id, { name: e.target.value })
                    }
                    placeholder="Product name"
                  />

                  <textarea
                    value={p.description || ""}
                    onChange={(e) =>
                      updateProduct(p.id, {
                        description: e.target.value,
                      })
                    }
                    placeholder="Description"
                  />

                  <div className="admin-inline">
                    <input
                      type="number"
                      value={p.price}
                      onChange={(e) =>
                        updateProduct(p.id, {
                          price: Number(e.target.value),
                        })
                      }
                      placeholder="Price"
                    />
                    <input
                      type="number"
                      value={p.quantity}
                      onChange={(e) =>
                        updateProduct(p.id, {
                          quantity: Number(e.target.value),
                        })
                      }
                      placeholder="Quantity"
                    />
                  </div>
                </div>

                <label className="add-image-box">
                  + Add image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) =>
                      addImage(p.id, e.target.files[0])
                    }
                  />
                </label>

                {/* IMAGE CONTROL */}
                <div
                  ref={wrapperRef}
                  className="product-image-wrapper"
                  onMouseEnter={() => setActiveProductId(p.id)}
                  onMouseLeave={() => setActiveProductId(null)}
                >
                  <ProductCard
                    product={{
                      ...p,
                      image_pos_x: p.posX,
                      image_pos_y: p.posY,
                      image_scale: p.scale,
                      onDragStart: (e) => {
                        e.preventDefault();

                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startPosX = p.posX;
                        const startPosY = p.posY;
                        const rect =
                          e.currentTarget.getBoundingClientRect();

                        const onMove = (ev) => {
                          const dx = ev.clientX - startX;
                          const dy = ev.clientY - startY;

                          updateProduct(p.id, {
                            posX: Math.min(
                              100,
                              Math.max(
                                0,
                                startPosX +
                                  (dx / rect.width) * 100
                              )
                            ),
                            posY: Math.min(
                              100,
                              Math.max(
                                0,
                                startPosY +
                                  (dy / rect.height) * 100
                              )
                            ),
                          });
                        };

                        const stop = () => {
                          window.removeEventListener(
                            "mousemove",
                            onMove
                          );
                          window.removeEventListener(
                            "mouseup",
                            stop
                          );
                        };

                        window.addEventListener(
                          "mousemove",
                          onMove
                        );
                        window.addEventListener("mouseup", stop);
                      },
                    }}
                    addToCart={null}
                  />
                </div>

                <ReorderImages
                  images={p.images}
                  onDelete={deleteImage}
                  onChange={(imgs) =>
                    updateProduct(p.id, { images: imgs })
                  }
                />

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
