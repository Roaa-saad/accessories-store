import { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../api/api";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/admin-dashboard.css";

const apiUrl = 'https://accessories-backend-production.up.railway.app';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    getProducts().then((data) => {
      const withDefaults = data.map((p) => ({
        ...p,
        main_image_index: p.main_image_index ?? 0,
        image_pos_x: p.image_pos_x ?? 50,
        image_pos_y: p.image_pos_y ?? 50,
        image_scale: p.image_scale ?? 1,
      }));
      setProducts(withDefaults);
    });
  }, []);

  const updateField = (id, field, value) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  const saveChanges = async (product) => {
    const res = await fetch(
      `${apiUrl}/admin/products/${product.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          image_pos_x: product.image_pos_x,
          image_pos_y: product.image_pos_y,
          image_scale: product.image_scale,
        }),
      }
    );

    if (!res.ok) {
      alert("Failed to save ❌");
      return;
    }

    alert("Saved ✨");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <h1 className="section-title">Products</h1>

        {products.map((p) => (
          <div key={p.id} className="admin-product-box">
            <h3>{p.name}</h3>

            {/* ===== IMAGE PREVIEW (DRAGGABLE) ===== */}
            <div
              className="admin-main-preview"
              onMouseDown={(e) => {
                const startX = e.clientX;
                const startY = e.clientY;
                const startPosX = p.image_pos_x;
                const startPosY = p.image_pos_y;

                const rect =
                  e.currentTarget.getBoundingClientRect();

                const onMove = (ev) => {
                  const dx = ev.clientX - startX;
                  const dy = ev.clientY - startY;

                  const newX =
                    startPosX + (dx / rect.width) * 100;
                  const newY =
                    startPosY + (dy / rect.height) * 100;

                  updateField(
                    p.id,
                    "image_pos_x",
                    Math.min(100, Math.max(0, newX))
                  );
                  updateField(
                    p.id,
                    "image_pos_y",
                    Math.min(100, Math.max(0, newY))
                  );
                };

                const stop = () => {
                  window.removeEventListener(
                    "mousemove",
                    onMove
                  );
                  window.removeEventListener("mouseup", stop);
                };

                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", stop);
              }}
            >
              <img
                src={`https://accessories-backend-production.up.railway.app/uploads/${
                  p.images[p.main_image_index]
                }`}
                draggable={false}
                style={{
                  objectFit: "cover",
                  objectPosition: `${p.image_pos_x}% ${p.image_pos_y}%`,
                  transform: `scale(${p.image_scale})`,
                }}
                alt=""
              />
            </div>

            {/* ===== CONTROLS ===== */}
            <div className="admin-controls">
              <label>Zoom</label>
              <input
                type="range"
                min="0.8"
                max="2"
                step="0.05"
                value={p.image_scale}
                onChange={(e) =>
                  updateField(
                    p.id,
                    "image_scale",
                    Number(e.target.value)
                  )
                }
              />

              <label>Vertical</label>
              <input
                type="range"
                min="0"
                max="100"
                value={p.image_pos_y}
                onChange={(e) =>
                  updateField(
                    p.id,
                    "image_pos_y",
                    Number(e.target.value)
                  )
                }
              />

              <label>Horizontal</label>
              <input
                type="range"
                min="0"
                max="100"
                value={p.image_pos_x}
                onChange={(e) =>
                  updateField(
                    p.id,
                    "image_pos_x",
                    Number(e.target.value)
                  )
                }
              />
            </div>

            {/* ===== ACTIONS ===== */}
            <div className="admin-actions">
              <button
                className="save-btn"
                onClick={() => saveChanges(p)}
              >
                Save
              </button>

              <button
                className="remove-btn"
                onClick={() => handleDelete(p.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default AdminProducts;
