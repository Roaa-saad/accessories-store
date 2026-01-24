import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProducts, updateProduct } from "../api/api";

const EditProduct = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);

  useEffect(() => {
    getProducts().then(data => {
      setForm(data.find(p => p.id === Number(id)));
    });
  }, [id]);

  if (!form) return null;

  const handleSubmit = async () => {
    const data = new FormData();
    Object.keys(form).forEach((key) => {
      data.append(key, form[key]);
    });

    await updateProduct(id, data);
    window.location.href = "/admin/products";
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Edit Product</h2>

      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
      <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

      <input type="file" onChange={e => setForm({ ...form, image: e.target.files[0] })} />

      <button onClick={handleSubmit}>Save</button>
    </div>
  );
};

export default EditProduct;
