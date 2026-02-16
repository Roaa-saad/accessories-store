import React, { useEffect, useState } from "react";
import { getCart, checkout, removeFromCart } from "../api/api";
import CartItem from "../components/CartItem";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { updateCartCount } = useCart();

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    city: "",
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
    updateCartCount();
  };

  // ✅ VALIDATION
  const validateForm = () => {
    const newErrors = {};

    // Name validation: minimum 2 characters, only letters and spaces
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (!/^[a-zA-Z\u0600-\u06FF\s]+$/.test(form.name)) {
      newErrors.name = "Name can only contain letters and spaces";
    }

    // Email validation: valid email format
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation: exactly 11 digits (can include +, spaces, dashes, parentheses)
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const phoneDigits = form.phone.replace(/[\s\-+()]/g, '');
      if (!/^\d{11}$/.test(phoneDigits)) {
        newErrors.phone = "Phone number must be exactly 11 digits";
      }
    }

    // Address validation: minimum 10 characters
    if (!form.address.trim()) {
      newErrors.address = "Address is required";
    } else if (form.address.trim().length < 10) {
      newErrors.address = "Address must be at least 10 characters";
    }

    // City validation
    if (!form.city.trim()) {
      newErrors.city = "City is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Shipping charges based on city
  const getShippingCharge = () => {
    const city = form.city;
    
    if (city === 'القاهرة والجيزة') {
      return 65;
    } else if (city === 'المدن الجديدة والضواحي') {
      return 70;
    } else if (city === 'الدلتا والإسكندرية ومدن القناة') {
      return 80;
    } else if (city === 'الصعيد (الفيوم - أسوان)') {
      return 90;
    }
    
    return 0;
  };

  const handleCheckout = async () => {
    if (!cart.length) return;
    if (!validateForm()) return;

    try {
      await checkout(form);
      // ✅ SAVE TOTAL + SHOW THANK YOU
      setOrderSuccess(true);

      setCart([]);
      updateCartCount();
      setForm({
        name: "",
        email: "",
        address: "",
        phone: "",
        city: "",
      });
      setErrors({});
    } catch (err) {
      console.error(err);
      // Display backend error message if available
      const errorMessage = err.message || "Failed to place order. Please try again.";
      alert(errorMessage);
    }
  };

  // Calculate prices
  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.discount_price && item.discount_price > 0 
      ? item.discount_price 
      : item.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  const originalTotal = cart.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  const discount = originalTotal - subtotal;
  const shippingCharge = form.city ? getShippingCharge() : 0;
  const grandTotal = subtotal + shippingCharge;

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
                <div style={{ marginBottom: '10px', paddingBottom: '10px', fontSize: '18px' }}>
                  Subtotal: {originalTotal.toFixed(2)} EGP
                </div>
                
                {discount > 0 && (
                  <div style={{ marginBottom: '10px', paddingBottom: '10px', color: '#d4633f', fontSize: '18px' }}>
                    Discount: -{discount.toFixed(2)} EGP
                  </div>
                )}
                
                {form.city && shippingCharge > 0 && (
                  <div style={{ marginBottom: '10px', paddingBottom: '10px', fontSize: '18px', color: '#8b7355' }}>
                    Shipping ({form.city}): {shippingCharge} EGP
                  </div>
                )}
                
                <div style={{ 
                  paddingTop: '15px',
                  borderTop: '1px solid #e0d5cc',
                  marginTop: '10px',
                  fontSize: '20px'
                }}>
                  <strong>Total: {grandTotal.toFixed(2)} EGP</strong>
                </div>
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

                <select
                  value={form.city}
                  onChange={(e) =>
                    setForm({ ...form, city: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    border: '1.5px solid #d4c4b4',
                    fontSize: '15px',
                    fontFamily: '"Cormorant Garamond", serif',
                    color: '#8b7355',
                    backgroundColor: '#f9f4f0',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <option value="" disabled>Select your city</option>
                  <option value="القاهرة والجيزة">Cairo & Giza</option>
                  <option value="المدن الجديدة والضواحي">New Cities & Suburbs</option>
                  <option value="الدلتا والإسكندرية ومدن القناة">Delta, Alexandria & Canal Cities</option>
                  <option value="الصعيد (الفيوم - أسوان)">Upper Egypt (Fayoum - Aswan)</option>
                </select>
                {errors.city && (
                  <span className="form-error">{errors.city}</span>
                )}

                <input
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
                <p style={{
                  fontSize: '13px',
                  color: '#8b7355',
                  margin: '4px 0 12px 0',
                  fontStyle: 'italic'
                }}>
                  Please provide a WhatsApp number
                </p>
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
