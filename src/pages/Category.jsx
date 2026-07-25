import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { getProducts, addToCart } from "../api/api";
import { useCart } from "../context/CartContext";

/* ================= CATEGORY CONFIG ================= */
const CATEGORY_CONFIG = {
  necklaces: { label: "Necklaces", canonicalName: "necklaces" },
  bracelets: { label: "Bracelets & Bangles", canonicalName: "bracelets" },
  rings: { label: "Rings", canonicalName: "rings" },
  earrings: { label: "Earrings", canonicalName: "earrings" },
  "key-chains": { label: "Keychains", canonicalName: "keychains" },
  sale: { label: "Bundles", canonicalName: "sale" },
};

/*
 * Convert database category variations to one stable value.
 * Existing database rows are intentionally not changed.
 */
function normalizeCategoryName(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  const aliases = {
    necklace: "necklaces",
    necklaces: "necklaces",
    bracelet: "bracelets",
    bracelets: "bracelets",
    bangle: "bracelets",
    bangles: "bracelets",
    ring: "rings",
    rings: "rings",
    earing: "earrings",
    earings: "earrings",
    earring: "earrings",
    earrings: "earrings",
    keychain: "keychains",
    keychains: "keychains",
    bundle: "sale",
    bundles: "sale",
    sale: "sale",
  };

  return aliases[normalized] || normalized;
}

function getProductCategoryName(product) {
  return (
    product?.category?.name ||
    product?.category_name ||
    product?.category ||
    ""
  );
}

const Category = () => {
  const { name } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { updateCartCount, showAddedNotification } = useCart();

  useEffect(() => {
    let cancelled = false;
    const category = CATEGORY_CONFIG[name];

    setLoading(true);

    if (!category) {
      setProducts([]);
      setLoading(false);
      return undefined;
    }

    getProducts()
      .then((allProducts) => {
        if (cancelled) return;

        const categoryProducts = Array.isArray(allProducts)
          ? allProducts.filter(
              (product) =>
                normalizeCategoryName(getProductCategoryName(product)) ===
                category.canonicalName
            )
          : [];

        setProducts(categoryProducts);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Category products error:", err);
          setProducts([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
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

  const visibleProducts = products.filter((product) => !product.hidden);

  return (
    <>
      <Navbar />

      <h2 className="section-title">{CATEGORY_CONFIG[name]?.label}</h2>

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
          visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={handleAddToCart}
            />
          ))
        )}
      </div>
    </>
  );
};

export default Category;
