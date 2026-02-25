import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { getProducts, addToCart } from "../api/api";
import { useCart } from "../context/CartContext";

/* ================= CATEGORY CONFIG ================= */
const CATEGORY_CONFIG = {
  necklaces: {
    id: 2,
    label: "Necklaces",
  },
  bracelets: {
    id: 3,
    label: "Bracelets",
  },
  rings: {
    id: 1,
    label: "Rings",
  },
  earrings: {
    id: 6,
    label: "Earrings",
  },
  "hair-clips": {
    id: 7,
    label: "Hair Clips",
  },
  sale: {
    id: 4,
    label: "Bundles",
  },
};

const Category = () => {
  const { name } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { updateCartCount, showAddedNotification } = useCart();

  useEffect(() => {
    setLoading(true);
    const category = CATEGORY_CONFIG[name];
    if (!category) return;

    fetch(`https://accessories-backend-production.up.railway.app/client/categories/${category.id}/products`)
      .then(res => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API error:", err);
        setLoading(false);
      });
  }, [name]);

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      updateCartCount();
      showAddedNotification();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />

      <h2 className="section-title">
        {CATEGORY_CONFIG[name]?.label}
      </h2>

      <div className="products-page">
        {loading ? (
          <p style={{ textAlign: "center", opacity: 0.6, gridColumn: "1 / -1" }}>
            Loading...
          </p>
        ) : products.length === 0 ? (
          <p style={{ textAlign: "center", opacity: 0.6, gridColumn: "1 / -1" }}>
            No products yet ✨
          </p>
        ) : (
          products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              addToCart={handleAddToCart}
            />
          ))
        )}
      </div>
    </>
  );
};

export default Category;
