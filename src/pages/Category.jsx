import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { getCategories, addToCart } from "../api/api";
import { useCart } from "../context/CartContext";

/* ================= CATEGORY CONFIG ================= */
const CATEGORY_CONFIG = {
  necklaces: { label: "Necklaces", aliases: ["necklace", "necklaces"] },
  bracelets: { label: "Bracelets & Bangles", aliases: ["bracelet", "bracelets", "bangles"] },
  rings: { label: "Rings", aliases: ["ring", "rings"] },
  earrings: { label: "Earrings", aliases: ["earring", "earrings"] },
  "key-chains": { label: "Keychains", aliases: ["keychain", "keychains", "key chains", "key-chains"] },
  sale: { label: "Bundles", aliases: ["bundle", "bundles", "sale"] },
};

const Category = () => {
  const { name } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { updateCartCount, showAddedNotification } = useCart();

  useEffect(() => {
    setLoading(true);

    const category = CATEGORY_CONFIG[name];

    if (!category) {
      setProducts([]);
      setLoading(false);
      return;
    }

    getCategories()
      .then((categories) => {
        const match = categories.find((item) =>
          category.aliases.includes(String(item.name || "").trim().toLowerCase())
        );
        if (!match) return [];
        return fetch(
          `https://accessories-backend-production.up.railway.app/client/categories/${match.id}/products`
        ).then((res) => {
          if (!res.ok) throw new Error("Failed to load category products");
          return res.json();
        });
      })
      .then((data) => {
        console.log("Category API products:", data);

        if (!Array.isArray(data)) {
          setProducts([]);
          setLoading(false);
          return;
        }

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


const visibleProducts = products.filter(
  (p) => !p.hidden
);

  return (
    <>
      <Navbar />

      <h2 className="section-title">
        {CATEGORY_CONFIG[name]?.label}
      </h2>

      <div className="products-page">
        {loading ? (
          <p
            style={{
              textAlign: "center",
              opacity: 0.6,
              gridColumn: "1 / -1",
            }}
          >
            Loading...
          </p>
        ) : visibleProducts.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              opacity: 0.6,
              gridColumn: "1 / -1",
            }}
          >
            No products yet ✨
          </p>
        ) : (
          visibleProducts.map((p) => (
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