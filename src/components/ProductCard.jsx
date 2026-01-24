import { Link } from "react-router-dom";
import { FaShoppingBag } from "react-icons/fa";

const ProductCard = ({ product, addToCart }) => {
  // 👑 هات الكافر أو أول صورة
  const mainImage =
    product.images?.find((img) => img.is_cover) ||
    product.images?.[0];

  return (
    <div className={`product-card ${product.sold_out ? "sold-out" : ""}`}>
      
      {/* IMAGE */}
      <Link to={`/product/${product.id}`} className="product-image-wrapper">
        {mainImage ? (
          <img
            src={mainImage.image_url}
            alt={product.name}
            style={{
              objectFit: "cover",
              objectPosition: `${product.image_pos_x ?? 50}% ${
                product.image_pos_y ?? 50
              }%`,
              transform: `scale(${product.image_scale ?? 1})`,
            }}
          />
        ) : (
          <div className="no-image">No image</div>
        )}

        {/* SOLD OUT OVERLAY */}
        {product.sold_out && (
          <div className="sold-out-overlay">SOLD OUT</div>
        )}
      </Link>

      {/* INFO */}
      <div className="product-info">
        <h3>{product.name}</h3>

        {addToCart && (
          <button
            className="cart-icon"
            onClick={() => addToCart(product.id)}
            aria-label="Add to cart"
            disabled={product.sold_out}
          >
            <FaShoppingBag />
          </button>
        )}
      </div>

      <div className="price">{product.price} EGP</div>
    </div>
  );
};

export default ProductCard;
