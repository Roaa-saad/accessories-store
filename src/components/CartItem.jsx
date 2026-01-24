import React from "react";

const CartItem = ({ item }) => {
  if (!item) return null;

  // 🖼️ build image url safely
  let image = "/placeholder.png";

  if (
    item.images &&
    Array.isArray(item.images) &&
    item.images.length > 0 &&
    item.images[0]
  ) {
    image = `http://127.0.0.1:8000/uploads/${item.images[0]}`;
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
        onError={(e) => {
          e.currentTarget.src = "/placeholder.png";
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
