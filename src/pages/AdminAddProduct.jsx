import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/admin-dashboard.css";

const AdminAddProduct = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discount_price: "",
    quantity: "",
    category_name: "",
    featured: false, // ⭐ الجديد
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = 'https://accessories-backend-production.up.railway.app';

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  /* ================= ADD IMAGES ================= */
  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("name", form.name);
    data.append("description", form.description);
    data.append("price", Number(form.price));
    data.append("quantity", Number(form.quantity));
    data.append("category_name", form.category_name);
    data.append("featured", form.featured); // ⭐ الجديد

    // ✅ discount (optional)
    if (form.discount_price !== "") {
      data.append(
        "discount_price",
        Number(form.discount_price)
      );
    }

    images.forEach((img) => {
      data.append("images", img);
    });

    const res = await fetch(`${apiUrl}/admin/add`, {
      method: "POST",
      body: data,
    });

    if (!res.ok) {
      alert("Something went wrong 😢");
      setLoading(false);
      return;
    }

    alert("Product added successfully ✨");

    setForm({
      name: "",
      description: "",
      price: "",
      discount_price: "",
      quantity: "",
      category_name: "",
      featured: false,
    });
    setImages([]);
    setLoading(false);
  };

  return (
    <>
      {/* ===== TOGGLE BUTTON ===== */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>

      {/* ===== SIDEBAR ===== */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* ===== CONTENT ===== */}
      <main className="admin-content">
        <h1 className="section-title">Add New Product</h1>

        <form onSubmit={handleSubmit} className="admin-form">
          <input
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />

          {/* 💰 ORIGINAL PRICE */}
          <input
            type="number"
            name="price"
            placeholder="Original Price"
            value={form.price}
            onChange={handleChange}
            required
          />

          {/* 🔥 DISCOUNT PRICE */}
          <input
            type="number"
            name="discount_price"
            placeholder="Discounted Price (optional)"
            value={form.discount_price}
            onChange={handleChange}
          />

          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={form.quantity}
            onChange={handleChange}
            required
          />

          <input
            name="category_name"
            placeholder="Category (ex: Rings)"
            value={form.category_name}
            onChange={handleChange}
            required
          />

          {/* ⭐ FEATURED */}
          <label className="featured-checkbox">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
            />
            Featured piece
          </label>

          {/* 📸 Upload */}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImages}
          />

          {/* 👀 PREVIEW GRID */}
          {images.length > 0 && (
            <div className="image-preview-grid">
              {images.map((img, index) => (
                <div key={index} className="preview-card">
                  <img
                    src={URL.createObjectURL(img)}
                    alt="preview"
                  />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => removeImage(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Add Product"}
          </button>
        </form>
      </main>
    </>
  );
};

export default AdminAddProduct;
