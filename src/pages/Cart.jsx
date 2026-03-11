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
  const [orderNumber, setOrderNumber] = useState(null);
  const [discountMessage, setDiscountMessage] = useState({ text: '', type: '' }); // 'valid' or 'invalid'

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

    // Email validation: optional, but if provided must be valid
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
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
  
  // Cairo & Giza
  if (city === 'Cairo' || city === 'Giza') {
    return 70;
  } 
  
  // New Cities
  else if (
    city === '6th October' ||
    city === 'Sheikh Zayed' ||
    city === 'New Cairo' ||
    city === 'Shorouk' ||
    city === 'Obour' ||
    city === 'Badr' ||
    city === 'New Capital'
  ) {
    return 75;
  } 
  
  // Delta + Canal + Alexandria
  else if (
    city === 'Alexandria' ||
    city === 'Beheira' ||
    city === 'Kafr El Sheikh' ||
    city === 'Gharbia' ||
    city === 'Tanta' ||
    city === 'Dakahlia' ||
    city === 'Mansoura' ||
    city === 'Damietta' ||
    city === 'Port Said' ||
    city === 'Ismailia' ||
    city === 'Suez' ||
    city === 'Sharqia' ||
    city === 'Zagazig' ||
    city === 'Qalyubia' ||
    city === 'Monufia'
  ) {
    return 85;
  } 
  
  // Upper Egypt + remote areas
  else if (
    city === 'Fayoum' ||
    city === 'Beni Suef' ||
    city === 'Minya' ||
    city === 'Assiut' ||
    city === 'Sohag' ||
    city === 'Qena' ||
    city === 'Luxor' ||
    city === 'Aswan' ||
    city === 'Red Sea' ||
    city === 'Matrouh' ||
    city === 'New Valley' ||
    city === 'North Sinai' ||
    city === 'South Sinai'
  ) {
    return 95;
  }

  return 85; // default shipping لو محافظة مش موجودة
};

  const handleCheckout = async () => {
    if (!cart.length) return;
    if (!validateForm()) return;

    try {
      const result = await checkout({
        ...form,
        total_amount: grandTotal,
        shipping: shippingChargeFinal
      });
      
      // ✅ Capture order ID and show thank you
      setOrderNumber(result.order_id);
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

  // Calculate discount code discount
  const calculateDiscountCodeDiscount = () => {
    const code = form.discount_code?.trim().toUpperCase();
    if (!code) return 0;
    
    if (code === 'BACKTOLUMIE') {
      return subtotal * 0.10; // 10% discount
    } else if (code === 'FREEGIFT') {
      return 0; // Free gift, no price discount
    }
    return 0;
  };

  // Validate discount code and set message
  const validateDiscountCode = (code) => {
    const upperCode = code.trim().toUpperCase();
    
    if (!upperCode) {
      setDiscountMessage({ text: '', type: '' });
      return;
    }
    
    if (upperCode === 'FREEGIFT') {
      setDiscountMessage({ 
        text: '✓ Valid code! You will get a free gift', 
        type: 'valid' 
      });
    } else if (upperCode === 'BACKTOLUMIE') {
      setDiscountMessage({ 
        text: '✓ 10% discount applied', 
        type: 'valid' 
      });
    } else {
      setDiscountMessage({ 
        text: '✗ Invalid code', 
        type: 'invalid' 
      });
    }
  };

  const discountCodeAmount = calculateDiscountCodeDiscount();
  const subtotalAfterDiscount = subtotal - discountCodeAmount;
  const shippingCharge = form.city ? getShippingCharge() : 0;
  const shippingChargeFinal = subtotalAfterDiscount > 999 ? 0 : shippingCharge;
  const grandTotal = subtotalAfterDiscount + shippingChargeFinal;

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
            
            {orderNumber && (
              <p style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#c9ab7a',
                marginTop: '16px'
              }}>
                Order Number: #{String(orderNumber).padStart(3, '0')}
              </p>
            )}
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
                  Subtotal: {subtotal.toFixed(2)} EGP
                </div>
                
                {discountCodeAmount > 0 && (
                  <div style={{ marginBottom: '10px', paddingBottom: '10px', color: '#d4633f', fontSize: '18px' }}>
                    Discount ({form.discount_code?.toUpperCase()}): -{discountCodeAmount.toFixed(2)} EGP
                  </div>
                )}
                
                {form.city && shippingChargeFinal === 0 ? (
                  <div style={{ marginBottom: '10px', paddingBottom: '10px', fontSize: '18px', color: '#8b7355' }}>
                    Shipping: Free Shipping
                  </div>
                ) : form.city && shippingChargeFinal > 0 && (
                  <div style={{ marginBottom: '10px', paddingBottom: '10px', fontSize: '18px', color: '#8b7355' }}>
                    Shipping: {shippingChargeFinal} EGP
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
                    setForm({ 
                      ...form, 
                      city: e.target.value,
                      cityDisplay: e.target.value
                    });
                  }}
                >
                  <option value="" disabled>Select your city</option>

                      
                      <option value="Cairo">Cairo</option>
                      <option value="Giza">Giza</option>

                      
                      <option value="6th October">6th October</option>
                      <option value="Sheikh Zayed">Sheikh Zayed</option>
                      <option value="New Cairo">New Cairo</option>
                      <option value="Shorouk">Shorouk</option>
                      <option value="Obour">Obour</option>
                      <option value="Badr">Badr</option>
                      <option value="New Capital">New Capital</option>

                     
                      <option value="Alexandria">Alexandria</option>
                      <option value="Beheira">Beheira</option>
                      <option value="Kafr El Sheikh">Kafr El Sheikh</option>
                      <option value="Gharbia">Gharbia</option>
                      <option value="Tanta">Tanta</option>
                      <option value="Dakahlia">Dakahlia</option>
                      <option value="Mansoura">Mansoura</option>
                      <option value="Monufia">Monufia</option>
                      <option value="Qalyubia">Qalyubia</option>
                      <option value="Sharqia">Sharqia</option>
                      <option value="Zagazig">Zagazig</option>
                      <option value="Damietta">Damietta</option>
                      <option value="Port Said">Port Said</option>
                      <option value="Ismailia">Ismailia</option>
                      <option value="Suez">Suez</option>

                     
                      <option value="Fayoum">Fayoum</option>
                      <option value="Beni Suef">Beni Suef</option>
                      <option value="Minya">Minya</option>
                      <option value="Assiut">Assiut</option>
                      <option value="Sohag">Sohag</option>
                      <option value="Qena">Qena</option>
                      <option value="Luxor">Luxor</option>
                      <option value="Aswan">Aswan</option>

                     
                      <option value="Matrouh">Matrouh</option>
                      <option value="Red Sea">Red Sea</option>
                      <option value="New Valley">New Valley</option>
                      <option value="North Sinai">North Sinai</option>
                      <option value="South Sinai">South Sinai</option>
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
                  onChange={(e) => {
                    setForm({ ...form, discount_code: e.target.value });
                    validateDiscountCode(e.target.value);
                  }}
                />
                {discountMessage.text && (
                  <p style={{
                    fontSize: '15px',
                    fontWeight: '500',
                    margin: '6px 0 12px 0',
                    color: discountMessage.type === 'valid' ? '#2e7d32' : '#d32f2f'
                  }}>
                    {discountMessage.text}
                  </p>
                )}

                <textarea
                  placeholder="Tell us your favorite perfume scent. If it’s a gift, add the recipient’s name and your special message"
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
