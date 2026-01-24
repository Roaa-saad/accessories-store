import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { getProducts, addToCart } from "../api/api";

/* mapping ثابت */
const CATEGORY_MAP = {
  necklaces: 2,
  bracelets: 4,
  rings: 1,
  earrings: 6,
  "hair-clips": 2,   // ✅ كده صح
  sale: 5
};

const Category = () => {
  const { name } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then((data) => {
      const categoryId = CATEGORY_MAP[name];

      const filtered = data.filter(
        (p) => p.category?.id === categoryId
      );

      setProducts(filtered);
    });
  }, [name]);

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />

      <h2 className="section-title">
        {name.replace("-", " ")}
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
