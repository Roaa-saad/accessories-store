import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getProducts, addToCart } from "../api/api";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  // 👑 خليه index الصورة الحالية
  const [activeIndex, setActiveIndex] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    getProducts().then((data) => {
      const found = data.find((p) => p.id === Number(id));
      if (!found) return;

      // 👑 خلّي الكافر هو الصورة الأولى
      const coverIndex = found.images?.findIndex(
        (img) => img.is_cover
      );

      setProduct(found);
      setActiveIndex(coverIndex >= 0 ? coverIndex : 0);
    });
  }, [id]);

  if (!product) return null;

  const isSoldOut = product.sold_out;
  const images = product.images || [];
  const activeImage = images[activeIndex];

  return (
    <>
      <Navbar />

      <div className="product-details-page">
        {/* ===== الصور ===== */}
        <div className="product-gallery">
          <div className="main-image-wrapper">
            {activeImage ? (
              <img
                className="main-image"
                src={activeImage.image_url}
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

            {/* SOLD OUT BADGE */}
            {isSoldOut && (
              <div className="sold-out-badge">Sold out</div>
            )}
          </div>

          {/* thumbnails */}
          <div className="thumbs">
            {images.map((img, index) => (
              <img
                key={img.id ?? index}
                src={img.image_url}
                alt=""
                className={index === activeIndex ? "active" : ""}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* ===== البيانات ===== */}
        <div className="product-info-box">
          <h1>{product.name}</h1>
          <p className="details-price">{product.price} EGP</p>

          <div className="description-box">
            <h3 className="description-title">Description</h3>
            <p className="product-description">
              {product.description}
            </p>
          </div>

          {/* quantity */}
          <div className="qty-box">
            <button
              disabled={isSoldOut}
              onClick={() => setQty(Math.max(1, qty - 1))}
            >
              −
            </button>

            <span>{qty}</span>

            <button
              disabled={isSoldOut}
              onClick={() => setQty(qty + 1)}
            >
              +
            </button>
          </div>

          <button
            className={`add-btn ${isSoldOut ? "disabled" : ""}`}
            disabled={isSoldOut}
            onClick={async () => {
              if (isSoldOut) return;
              try {
                await addToCart(product.id, qty);
              } catch (err) {
                console.error(err);
              }
            }}
          >
            {isSoldOut ? "Sold Out" : "Add to Cart"}
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
