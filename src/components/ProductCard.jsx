import { Link } from "react-router-dom";
import { FaShoppingBag } from "react-icons/fa";

const ProductCard = ({ product, addToCart }) => {
  const mainImage =
    product.images?.find((img) => img.is_cover) ||
    product.images?.[0];

  const ImageContent = (
    <>
      {mainImage ? (
        <img
          src={mainImage.image_url}
          alt={product.name}
          draggable={false}
          onMouseDown={product.onDragStart}
          style={{
            objectFit: "cover",
            objectPosition: `${product.image_pos_x ?? 50}% ${
              product.image_pos_y ?? 50
            }%`,
            transform: `scale(${product.image_scale ?? 1})`,
            cursor: product.onDragStart ? "grab" : "pointer",
            userSelect: "none",
          }}
        />
      ) : (
        <div className="no-image">No image</div>
      )}

      {product.sold_out && (
        <div className="sold-out-overlay">SOLD OUT</div>
      )}
    </>
  );

  return (
    <div className={`product-card ${product.sold_out ? "sold-out" : ""}`}>
      {/* IMAGE */}
      {product.onDragStart ? (
        // 👈 ADMIN (drag enabled – no Link)
        <div className="product-image-wrapper">{ImageContent}</div>
      ) : (
        // 👈 CLIENT (normal Link)
        <Link
          to={`/product/${product.id}`}
          className="product-image-wrapper"
        >
          {ImageContent}
        </Link>
      )}

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
