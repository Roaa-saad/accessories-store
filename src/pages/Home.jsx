import { useEffect, useState } from "react";
import { getProducts, addToCart } from "../api/api";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const CATEGORIES = [
  {
    name: "Necklaces",
    slug: "necklaces",
    image: "/categories/necklaces.webp?v=8",
  },
  {
    name: "Bracelets",
    slug: "bracelets",
    image: "/categories/bracelets.webp?v=6",
  },
  {
    name: "Rings",
    slug: "rings",
    image: "/categories/rings.webp?v=6",
  },
  {
    name: "Bundles",
    slug: "sale",
    image: "/categories/sale.webp?v=6",
  },
  {
    name: "Earrings",
    slug: "earrings",
    image: "/categories/earrings.webp?v=6",
  },
  {
    name: "Hair Clips",
    slug: "hair-clips",
    image: "/categories/hair-clips.webp?v=6",
  },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const { updateCartCount, showAddedNotification } = useCart();

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      updateCartCount();
      showAddedNotification();
    } catch (err) {
      console.error(err);
    }
  };

  // ⭐ Featured products فقط
  const featuredProducts = products.filter((p) => p.featured);

  return (
    <>
      <Navbar />

      {/* HERO */}
      <div className="hero">
        <img src="/hero.jpg?v=2" alt="Lumie Hero" loading="eager" fetchpriority="high" decoding="async" />
      </div>

      {/* FEATURED PRODUCTS */}
      {featuredProducts.length > 0 && (
        <>
          <h2 className="section-title">Featured Pieces</h2>

          <div className="products-scroll">
            {featuredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                addToCart={handleAddToCart}
              />
            ))}
          </div>
        </>
      )}

      {/* VIEW ALL */}
      <Link to="/products" className="view-all">
        <span>View all</span>
        <span className="view-arrow">→</span>
      </Link>

      {/* CATEGORIES */}
      <h2 className="section-title">Categories</h2>

      <div className="products-scroll">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            to={`/category/${cat.slug}`}
            className="product-card category-card"
          >
            <img src={cat.image} alt={cat.name} loading="lazy" decoding="async" />

            <div className="category-overlay">
              <span>Shop now</span>
            </div>

            <h3>{cat.name}</h3>
          </Link>
        ))}
      </div>

      {/* ABOUT */}
      <div className="about-box">
        <h2>About Lumie</h2>
        <p>
          Lumie is a small jewelry boutique inspired by softness,
          femininity, and thoughtful details.
        </p>
      </div>

      {/* GIFT */}
      <div className="gift-banner">
        <img src="/gift.jpg" alt="Gift" loading="lazy" />
        <span>Every order is carefully wrapped, just for you.</span>
      </div>
    </>
  );
};

export default Home;
