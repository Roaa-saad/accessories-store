import { useEffect, useState } from "react";
import { getProducts, addToCart } from "../api/api";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/useCart";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { updateCartCount, showAddedNotification } = useCart();

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
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

  return (
    <>
      <Navbar />

      <h2 className="section-title">All Products</h2>

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

export default Products;
