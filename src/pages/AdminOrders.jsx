import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/admin-dashboard.css";

const apiUrl = 'https://accessories-backend-production.up.railway.app';

// Simple SVG placeholder for missing images
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23f4ebe6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch(`${apiUrl}/admin/orders`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Calculate shipping cost based on city
  const getShippingCost = (city) => {
    if (!city) return 0;
    const cityLower = city.toLowerCase();
    
    // Cairo & Giza - 65 EGP
    if (cityLower === 'cairo' || cityLower === 'giza') return 65;
    
    // New Cities - 70 EGP
    if (['6th of october', 'sheikh zayed', 'new cairo', 'heliopolis', 'maadi', 
         'nasr city', 'zamalek', 'dokki'].includes(cityLower)) return 70;
    
    // Delta - 80 EGP
    if (['alexandria', 'tanta', 'mansoura', 'zagazig', 'damietta', 
         'port said', 'ismailia'].includes(cityLower)) return 80;
    
    // Upper Egypt - 90 EGP
    if (['luxor', 'aswan', 'sohag', 'qena', 'asyut', 
         'minya', 'beni suef', 'fayoum'].includes(cityLower)) return 90;
    
    return 0;
  };

  // Calculate discount amount based on code
  const getDiscountAmount = (subtotal, discountCode) => {
    if (!discountCode) return 0;
    if (discountCode.toUpperCase() === 'BACKTOLUMIE') {
      return subtotal * 0.1; // 10% discount
    }
    return 0; // FREEGIFT has no discount
  };

  // ✅ UPDATE DELIVERY STATUS
  const toggleDelivered = async (orderId, currentStatus) => {
    try {
      const body = `delivered=${!currentStatus}`;

      const res = await fetch(
        `${apiUrl}/admin/orders/${orderId}/deliver`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        }
      );

      if (!res.ok) {
        alert("Failed to update order ❌");
        return;
      }

      // 🔄 update UI instantly
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === orderId
            ? { ...o, is_delivered: !currentStatus }
            : o
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* ===== TOGGLE BUTTON ===== */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>

      {/* ===== SIDEBAR ===== */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* ===== CONTENT ===== */}
      <main className="admin-content">
        <h1 className="section-title">Orders</h1>

        {loading && <p>Loading orders…</p>}

        {!loading && orders.length === 0 && (
          <p>No orders yet 🤍</p>
        )}

        {orders.map((order) => (
          <div key={order.order_id} className="order-card">
            {/* ===== ORDER INFO ===== */}
            <div className="order-header">
              <div className="order-main-info">
                <h3>Order #{order.order_id}</h3>

                <p className="order-name">
                  {order.customer_name}
                </p>

                <span className="order-email">
                  {order.customer_email}
                </span>

                <span className="order-phone">
                  {order.customer_phone}
                </span>
              </div>

              <div className="order-address">
                {order.customer_address}
              </div>

              {order.customer_city && (
                <div className="order-city">
                  <strong>City:</strong> {order.customer_city}
                </div>
              )}

              {order.discount_code && (
                <div className="order-discount-code">
                  <strong>Discount Code:</strong> {order.discount_code}
                </div>
              )}

              {order.note && (
                <div className="order-note">
                  <strong>Note:</strong> {order.note}
                </div>
              )}
            </div>

            {/* ===== STATUS ===== */}
            <div className="order-status">
              <span
                className={`status-badge ${
                  order.is_delivered ? "delivered" : "pending"
                }`}
              >
                {order.is_delivered
                  ? "Delivered ✓"
                  : "Pending ⏳"}
              </span>

              <button
                className="deliver-btn"
                onClick={() =>
                  toggleDelivered(
                    order.order_id,
                    order.is_delivered
                  )
                }
              >
                {order.is_delivered
                  ? "Mark as not delivered"
                  : "Mark as delivered"}
              </button>
            </div>

            {/* ===== ITEMS ===== */}
            <div className="order-items">
              {order.items.map((item) => (
                <div
                  key={`${order.order_id}-${item.product_id}`}
                  className="order-item"
                >
                  <img
                    src={
                      item.images?.length
                        ? (typeof item.images[0] === 'object' && item.images[0].image_url)
                          ? item.images[0].image_url
                          : (typeof item.images[0] === 'string' && (item.images[0].startsWith('http://') || item.images[0].startsWith('https://')))
                            ? item.images[0]
                            : `https://accessories-backend-production.up.railway.app/uploads/${item.images[0]}`
                        : PLACEHOLDER_IMAGE
                    }
                    alt={item.name}
                  />

                  <div className="order-item-info">
                    <h4>{item.product_name}</h4>
                    <p>
                      {item.quantity} × {item.price} EGP
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ===== ORDER TOTAL ===== */}
            {(() => {
              // Calculate subtotal from items
              const subtotal = order.items.reduce((sum, item) => 
                sum + (item.price * item.quantity), 0
              );
              
              const discountAmount = getDiscountAmount(subtotal, order.discount_code);
              const subtotalAfterDiscount = subtotal - discountAmount;
              const shippingCost = getShippingCost(order.customer_city);
              const totalAmount = subtotalAfterDiscount + shippingCost;

              return (
                <div className="order-total" style={{
                  marginTop: '15px',
                  paddingTop: '15px',
                  borderTop: '2px solid #e0d5cc'
                }}>
                  {/* Subtotal */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    fontSize: '15px',
                    color: '#6b5d52'
                  }}>
                    <span>Subtotal:</span>
                    <span>{subtotal.toFixed(2)} EGP</span>
                  </div>

                  {/* Discount (if exists) */}
                  {discountAmount > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                      fontSize: '15px',
                      color: '#d4633f'
                    }}>
                      <span>Discount ({order.discount_code}):</span>
                      <span>-{discountAmount.toFixed(2)} EGP</span>
                    </div>
                  )}

                  {/* Shipping */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    fontSize: '15px',
                    color: '#6b5d52'
                  }}>
                    <span>Shipping:</span>
                    <span>{shippingCost.toFixed(2)} EGP</span>
                  </div>

                  {/* Total */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid #e0d5cc',
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    color: '#8b7355'
                  }}>
                    <span>Total:</span>
                    <span>{totalAmount.toFixed(2)} EGP</span>
                  </div>
                </div>
              );
            })()}
          </div>
        ))}
      </main>
    </>
  );
};

export default AdminOrders;
