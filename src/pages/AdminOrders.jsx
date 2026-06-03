import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import CartItem from "../components/CartItem";
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
        console.log('Orders received:', data);
        if (data.length > 0) {
          console.log('First order items:', data[0].items);
        }
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
    const code = discountCode.toUpperCase().trim();
    if (code === 'BACKTOLUMIE') {
      return subtotal * 0.1; // 10% discount
    }
    return 0; // FREEGIFT or other codes have no discount
  };

    const processOrderItems = (orderItems) => {
  return orderItems.map(item => {
    const price =
      item.discount_price && item.discount_price > 0
        ? item.discount_price
        : item.price;

    return {
      ...item,
      name: item.product_name || item.name,
      final_price: price,
      original_price: price,
      quantity: item.quantity || 1
    };
  });
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

  const cancelOrder = async (orderId) => {
  try {
    const res = await fetch(
      `${apiUrl}/admin/orders/${orderId}/cancel`,
      {
        method: "PUT",
      }
    );

    if (!res.ok) {
      alert("Failed to cancel order ❌");
      return;
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.order_id === orderId
          ? {
              ...o,
              is_cancelled: true,
              is_delivered: false,
            }
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
                <h3>Order #{String(order.order_id).padStart(3, '0')}</h3>

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

              <div className="order-note">
                <strong>Note:</strong> {order.notes && order.notes.trim() ? order.notes : <span style={{color:'#b7a78c'}}>No note</span>}
              </div>
            </div>

            {/* ===== STATUS ===== */}
            <div className="order-status">
                <span
                  className={`status-badge ${
                    order.is_cancelled
                      ? "cancelled"
                      : order.is_delivered
                      ? "delivered"
                      : "pending"
                  }`}
                >
                  {order.is_cancelled
                    ? "Cancelled ❌"
                    : order.is_delivered
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

                <button
                  className="cancel-btn"
                  onClick={() => cancelOrder(order.order_id)}
                  disabled={order.is_cancelled}
                >
                  {order.is_cancelled
                    ? "Cancelled"
                    : "Cancel Order"}
                </button>
            </div>

            {/* ===== ITEMS & TOTAL ===== */}
            {(() => {
              const isNewOrder = order.order_id > 62;
              
              const processedItems = isNewOrder 
                ? processOrderItems(order.items) 
                : order.items.map(item => {
                    const price = item.discount_price && item.discount_price > 0 ? item.discount_price : item.price;
                    return {
                      ...item,
                      name: item.product_name || item.name,
                      final_price: price,
                      original_price: price,
                      isHalfOff: false
                    };
                  });

              const subtotal = processedItems.reduce((sum, item) => {
                return sum + (item.final_price * item.quantity);
              }, 0);

              const discountAmount = getDiscountAmount(subtotal, order.discount_code);
              const subtotalAfterDiscount = subtotal - discountAmount;
              const shippingCost = getShippingCost(order.customer_city);

                const shippingFinal =
                  subtotalAfterDiscount >= 600? 0 : shippingCost;

                  {shippingFinal === 0 && (
                      <div style={{ color: "#2e7d32", fontSize: "13px" }}>
                        🎉 Offer Applied
                      </div>
                    )}

                const totalAmount =
                  subtotalAfterDiscount + shippingFinal;

              return (
                <>
                  <div className="order-items" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {processedItems.map((item, idx) => (
                      <CartItem key={`${order.order_id}-${item.product_id}-${idx}`} item={item} />
                    ))}
                  </div>

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
                  {order.discount_code && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                      fontSize: '15px',
                      color: discountAmount > 0 ? '#d4633f' : '#6b5d52'
                    }}>
                      <span>Discount ({order.discount_code}):</span>
                      <span>{discountAmount > 0 ? `-${discountAmount.toFixed(2)}` : '0.00'} EGP</span>
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
                    <span>{shippingFinal === 0
                          ? "Free Shipping"
                          : `${shippingFinal.toFixed(2)} EGP`}</span>
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
                </>
              );
            })()}
          </div>
        ))}
      </main>
    </>
  );
};

export default AdminOrders;
