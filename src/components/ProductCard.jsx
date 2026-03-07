import { Link } from "react-router-dom";
import { FaShoppingBag } from "react-icons/fa";

const ProductCard = ({ product, addToCart }) => {
  const mainImage =
    product.images?.find((img) => img.is_cover) ||
    product.images?.[0];

  const posX = mainImage?.pos_x ?? 50;
  const posY = mainImage?.pos_y ?? 50;
  const scale = mainImage?.scale ?? 1;

  const price = Number(product.price);
  const discountPrice = Number(product.discount_price);

  const hasDiscount =
    discountPrice &&
    discountPrice < price;

const optimizedImage = mainImage?.image_url
  ? mainImage.image_url.includes("/upload/")
    ? mainImage.image_url.replace("/upload/", "/upload/w_600,f_auto,q_auto/")
    : mainImage.image_url
  : null;
  const ImageContent = (
    <>
      {mainImage ? (
        <img
          src={optimizedImage}
          alt={product.name}
          draggable={false}
          loading="lazy"
          decoding="async"
          onMouseDown={product.onDragStart}
          style={{
            objectFit: "cover",
            objectPosition: `${posX}% ${posY}%`,
            transform: `scale(${scale})`,
            transformOrigin: "center",
            cursor: product.onDragStart ? "grab" : "pointer",
            userSelect: "none",
            pointerEvents: product.onDragStart ? "auto" : "none",
          }}
        />
      ) : (
        <div className="no-image">No image</div>
      )}

      {product.sold_out && (
        <div className="sold-out-overlay">SOLD OUT</div>
      )}
      
      {!product.sold_out && hasDiscount && (
        <div className="sale-badge">SALE</div>
      )}
    </>
  );

  return (
    <div className={`product-card ${product.sold_out ? "sold-out" : ""}`}>
      {product.onDragStart ? (
        <div className="product-image-wrapper drag-enabled">
          {ImageContent}
        </div>
      ) : (
        <Link
          to={`/product/${product.id}`}
          className="product-image-wrapper"
        >
          {ImageContent}
        </Link>
      )}

      <div className="product-info">
        <h3>{product.name}</h3>

        {addToCart && (
          <button
            className="cart-icon"
            onClick={() => addToCart(product.id)}
            disabled={product.sold_out}
          >
            <FaShoppingBag />
          </button>
        )}
      </div>

      <div className="price">
        {hasDiscount ? (
          <div className="price-with-discount">
            <span className="old-price">
              {price} 
            </span>
            <span className="new-price">
              {discountPrice} EGP
            </span>
          </div>
        ) : (
          <span>{price} EGP</span>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
