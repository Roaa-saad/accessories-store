import { useEffect, useState } from "react";
import { getProducts, addToCart } from "../api/api";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  const handleAddToCart = async (productId) => {
    try {
      const res = await addToCart(productId, 1);
      console.log(res.detail);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />

      <h2 className="section-title">All Products</h2>

      <div className="products-page">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            addToCart={handleAddToCart}
          />
        ))}
      </div>
    </>
  );
};

export default Products;
