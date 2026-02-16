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
    cityDisplay: "",
    discount_code: "",
    note: "",
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
        cityDisplay: "",
        discount_code: "",
        note: "",
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
                    Shipping: {shippingCharge} EGP
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
                  value={form.cityDisplay}
                  onChange={(e) => {
                    const selectedOption = e.target.options[e.target.selectedIndex];
                    const backendValue = selectedOption.getAttribute('data-value');
                    setForm({ 
                      ...form, 
                      city: backendValue,
                      cityDisplay: e.target.value
                    });
                  }}
                >
                  <option value="" disabled>Select your city</option>
                  <option value="Cairo" data-value="القاهرة والجيزة">Cairo</option>
                  <option value="Giza" data-value="القاهرة والجيزة">Giza</option>
                  <option value="6th October" data-value="المدن الجديدة والضواحي">6th October</option>
                  <option value="Sheikh Zayed" data-value="المدن الجديدة والضواحي">Sheikh Zayed</option>
                  <option value="New Cairo" data-value="المدن الجديدة والضواحي">New Cairo</option>
                  <option value="Shorouk" data-value="المدن الجديدة والضواحي">Shorouk</option>
                  <option value="Obour" data-value="المدن الجديدة والضواحي">Obour</option>
                  <option value="Alexandria" data-value="الدلتا والإسكندرية ومدن القناة">Alexandria</option>
                  <option value="Mansoura" data-value="الدلتا والإسكندرية ومدن القناة">Mansoura</option>
                  <option value="Tanta" data-value="الدلتا والإسكندرية ومدن القناة">Tanta</option>
                  <option value="Zagazig" data-value="الدلتا والإسكندرية ومدن القناة">Zagazig</option>
                  <option value="Damietta" data-value="الدلتا والإسكندرية ومدن القناة">Damietta</option>
                  <option value="Port Said" data-value="الدلتا والإسكندرية ومدن القناة">Port Said</option>
                  <option value="Ismailia" data-value="الدلتا والإسكندرية ومدن القناة">Ismailia</option>
                  <option value="Suez" data-value="الدلتا والإسكندرية ومدن القناة">Suez</option>
                  <option value="Fayoum" data-value="الصعيد (الفيوم - أسوان)">Fayoum</option>
                  <option value="Beni Suef" data-value="الصعيد (الفيوم - أسوان)">Beni Suef</option>
                  <option value="Minya" data-value="الصعيد (الفيوم - أسوان)">Minya</option>
                  <option value="Assiut" data-value="الصعيد (الفيوم - أسوان)">Assiut</option>
                  <option value="Sohag" data-value="الصعيد (الفيوم - أسوان)">Sohag</option>
                  <option value="Qena" data-value="الصعيد (الفيوم - أسوان)">Qena</option>
                  <option value="Luxor" data-value="الصعيد (الفيوم - أسوان)">Luxor</option>
                  <option value="Aswan" data-value="الصعيد (الفيوم - أسوان)">Aswan</option>
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

                <input
                  placeholder="Discount Code (optional)"
                  value={form.discount_code}
                  onChange={(e) =>
                    setForm({ ...form, discount_code: e.target.value })
                  }
                />

                <textarea
                  placeholder="Note (optional)"
                  value={form.note}
                  onChange={(e) =>
                    setForm({ ...form, note: e.target.value })
                  }
                  rows="3"
                />

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
