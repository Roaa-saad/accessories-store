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

  const [errors, setErrors] = useState({});
  const [orderSuccess, setOrderSuccess] = useState(false);

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

  // ✅ VALIDATION
  const validateForm = () => {
    const newErrors = {};

    // Name validation: minimum 3 characters, only letters and spaces
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    } else if (!/^[a-zA-Z\u0600-\u06FF\s]+$/.test(form.name)) {
      newErrors.name = "Name can only contain letters and spaces";
    }

    // Email validation: valid email format
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation: 10-15 digits (can include +, spaces, dashes, parentheses)
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const phoneDigits = form.phone.replace(/[\s\-+()]/g, '');
      if (!/^\d{10,15}$/.test(phoneDigits)) {
        newErrors.phone = "Phone number must be 10-15 digits";
      }
    }

    // Address validation: minimum 10 characters
    if (!form.address.trim()) {
      newErrors.address = "Address is required";
    } else if (form.address.trim().length < 10) {
      newErrors.address = "Address must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (!cart.length) return;
    if (!validateForm()) return;

    try {
      await checkout(form);

      // ✅ SAVE TOTAL + SHOW THANK YOU
      setOrderSuccess(true);

      setCart([]);
      setForm({
        name: "",
        email: "",
        address: "",
        phone: "",
      });
      setErrors({});
    } catch (err) {
      console.error(err);
      // Display backend error message if available
      const errorMessage = err.message || "Failed to place order. Please try again.";
      alert(errorMessage);
    }
  };

  return (
    <>
      <Navbar cartCount={cart.length} />

      <div className="page cart-page">
        {/* 🌸 THANK YOU PAGE */}
        {orderSuccess ? (
          <div className="thank-you-box">
            <h1>Thank you for your order </h1>

            <p className="thank-you-text">
              Your order has been placed successfully 🤍  
              
            </p>


          </div>
        ) : (
          <>
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
                {errors.name && (
                  <span className="form-error">{errors.name}</span>
                )}

                <input
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
                {errors.email && (
                  <span className="form-error">{errors.email}</span>
                )}

                <input
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
                {errors.address && (
                  <span className="form-error">{errors.address}</span>
                )}

                <input
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
                {errors.phone && (
                  <span className="form-error">{errors.phone}</span>
                )}

                <button className="confirm-btn" onClick={handleCheckout}>
                  Confirm Order
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Cart;
