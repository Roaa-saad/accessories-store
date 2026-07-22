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
    image: "/categories/necklaces.jpg?v=10",
  },
  {
    name: "Bracelets & Bangles",
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
    image: "/categories/earrings.webp?v=7",
  },
  {
    name: "Key-chains",
    slug: "key-chains",
    image: "/categories/key-chains.webp?v=1",
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
  const featuredProducts = products.filter(
  (p) => p.featured && !p.hidden
);

  return (
    <>
      <Navbar />
      {/* HERO */}
    <div className="hero" style={{ position: "relative" }}>
  <img 
    src="/hero.jpg?v=2" 
    alt="Lumie Hero" 
    loading="eager" 
    fetchpriority="high" 
    decoding="async" 
    style={{ width: "100%", display: "block" }}
  />

  <div
   style={{
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  textAlign: "center",
  color: "#ffffffff",

   background: "rgba(255, 255, 255, 0.2)",
  backdropFilter: "blur(.1px)",
  WebkitBackdropFilter: "blur(.1px)",

  padding: "20px 40px",
  borderRadius: "20px",

  width: "80%",
  maxWidth: "400px",

  boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
  border: "1px solid rgba(255,255,255,0.3)",


  
}}
  >


    <div
      style={{
        fontSize: "32px",
        fontWeight: "600",
        opacity: 0.95,
        fontFamily: "'Playfair Display', serif",
      }}
    >
    Free Shipping on orders over 900 EGP 
    </div>
  </div>
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
