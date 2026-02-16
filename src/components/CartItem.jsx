import React from "react";

const apiUrl = 'https://accessories-backend-production.up.railway.app';

// Simple SVG placeholder
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23f4ebe6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";

const CartItem = ({ item }) => {
  if (!item) return null;

  // 🖼️ build image url safely - handle both string and object formats
  let image = PLACEHOLDER_IMAGE;

  if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    const firstImage = item.images[0];
    
    // If image is an object with image_url property
    if (firstImage && typeof firstImage === 'object' && firstImage.image_url) {
      image = firstImage.image_url;
    }
    // If image is a string
    else if (typeof firstImage === 'string') {
      // Check if it's already a full URL (starts with http/https)
      if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
        image = firstImage;
      } else {
        // Otherwise it's a filename, prepend the uploads path
        image = `${apiUrl}/uploads/${firstImage}`;
      }
    }
  }

  return (
    <div
      className="cart-item"
      style={{
        display: "flex",
        gap: "14px",
        alignItems: "center",
        background: "#fff",
        padding: "12px",
        borderRadius: "14px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
      }}
    >
      {/* IMAGE */}
      <img
        src={image}
        alt={item.name}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          e.currentTarget.src = PLACEHOLDER_IMAGE;
        }}
        style={{
          width: "80px",
          height: "80px",
          objectFit: "cover",
          borderRadius: "12px",
          flexShrink: 0,
          background: "#f4ebe6",
        }}
      />

      {/* INFO */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <h4
          style={{
            margin: 0,
            fontSize: "15px",
            fontWeight: 500,
          }}
        >
          {item.name}
        </h4>

        <span style={{ fontSize: "14px", color: "#555" }}>
          {item.price} EGP
        </span>

        <span style={{ fontSize: "13px", color: "#888" }}>
          Qty: {item.quantity}
        </span>
      </div>
    </div>
  );
};

export default CartItem;
