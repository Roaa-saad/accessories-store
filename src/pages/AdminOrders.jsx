import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/admin-dashboard.css";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/admin/orders")
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

  // ✅ UPDATE DELIVERY STATUS
  const toggleDelivered = async (orderId, currentStatus) => {
    try {
      const body = `delivered=${!currentStatus}`;

      const res = await fetch(
        `http://127.0.0.1:8000/admin/orders/${orderId}/deliver`,
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
                        ? `http://127.0.0.1:8000/uploads/${item.images[0]}`
                        : "/placeholder.jpg"
                    }
                    alt={item.product_name}
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
          </div>
        ))}
      </main>
    </>
  );
};

export default AdminOrders;
