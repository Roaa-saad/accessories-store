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
    id: 4,
    label: "Hair Clips",
  },
  sale: {
    id: 5,
    label: "Bundles", // 👈 بدل SALE
  },
};

const Category = () => {
  const { name } = useParams();
  const [products, setProducts] = useState([]);
  const { updateCartCount, showAddedNotification } = useCart();

  useEffect(() => {
    const category = CATEGORY_CONFIG[name];
    if (!category) return;

    getProducts().then((data) => {
      const filtered = data.filter(
        (p) => p.category?.id === category.id
      );
      setProducts(filtered);
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
        {products.length === 0 ? (
          <p style={{ textAlign: "center", opacity: 0.6 }}>
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
