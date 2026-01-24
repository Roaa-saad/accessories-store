import React, { useEffect, useState } from "react";
import { getCart, checkout, removeFromCart } from "../api/api";
import CartItem from "../components/CartItem";
import Navbar from "../components/Navbar";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    const data = await getCart();
    setCart(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleRemove = async (id) => {
    await removeFromCart(id);
    setCart((prev) => prev.filter((item) => item.product_id !== id));
  };

  const handleCheckout = async () => {
    if (!cart.length) return; // ❌ no alert

    try {
      await checkout(form);
      setCart([]); // تفضية الكارت بعد الطلب
    } catch (err) {
      console.error(err);
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
      <Navbar cartCount={cart.length} />

      <div className="page cart-page">
        <h1>Your Cart</h1>

        {loading && <p>Loading your cart…</p>}

        {!loading && cart.length === 0 && (
          <p className="empty-cart">Your cart is empty 🤍</p>
        )}

        {!loading &&
          cart.map((item) => (
            <div key={item.product_id} className="cart-row">
              <CartItem item={item} />

              <button
                className="remove-btn"
                onClick={() => handleRemove(item.product_id)}
              >
                Remove
              </button>
            </div>
          ))}

        {/* TOTAL */}
        {cart.length > 0 && (
          <div className="cart-total">
            <span>Total</span>
            <strong>{total} EGP</strong>
          </div>
        )}

        {/* CHECKOUT */}
        {cart.length > 0 && (
          <div className="checkout-box">
            <h2>Checkout</h2>

            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <input
              placeholder="Address"
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
            />

            <input
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />

            <button className="confirm-btn" onClick={handleCheckout}>
              Confirm Order
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
