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
    image: "/categories/necklaces.jpg",
  },
  {
    name: "Bracelets",
    slug: "bracelets",
    image: "/categories/bracelets.jpg",
  },
  {
    name: "Rings",
    slug: "rings",
    image: "/categories/rings.jpg",
  },
  {
    name: "Earrings",
    slug: "earrings",
    image: "/categories/earrings.jpg",
  },
  {
    name: "Hair Clips",
    slug: "hair-clips",
    image: "/categories/hair-clips.jpg",
  },
  {
    name: "Sets on Sale",
    slug: "sale",
    image: "/categories/sale.jpg",
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
        <img src="/hero.jpg" alt="Lumie Hero" />
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
            <img src={cat.image} alt={cat.name} />

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
        <img src="/gift.jpg" alt="Gift" />
        <span>Every order is carefully wrapped, just for you.</span>
      </div>
    </>
  );
};

export default Home;
