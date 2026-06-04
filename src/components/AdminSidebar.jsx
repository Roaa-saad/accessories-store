import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const AdminSidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const [pendingOrders, setPendingOrders] = useState(0);

  const fetchPendingOrders = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await axios.get(
        "https://accessories-backend-production.up.railway.app/admin/orders",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const pending = response.data.filter(
          order => !order.is_delivered && !order.is_cancelled
        ).length;
      setPendingOrders(pending);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

useEffect(() => {
  fetchPendingOrders();

  const interval = setInterval(fetchPendingOrders, 30000);

  const handleUpdate = () => {
    fetchPendingOrders();
  };

  window.addEventListener("ordersUpdated", handleUpdate);

  return () => {
    clearInterval(interval);
    window.removeEventListener("ordersUpdated", handleUpdate);
  };
}, []);

  const logout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  return (
    <div className="admin-sidebar">
      <div className="admin-logo">Lumie Admin</div>

      <nav className="admin-links">
        <NavLink to="/admin" onClick={onClose}>
          Dashboard
        </NavLink>

        <NavLink to="/admin/add-product" onClick={onClose}>
          Add Product
        </NavLink>

        <NavLink to="/admin/orders" onClick={onClose} style={{ position: 'relative' }}>
          Orders
          {pendingOrders > 0 && (
            <span style={{
              position: 'absolute',
              top: '50%',
              right: '15px',
              transform: 'translateY(-50%)',
              backgroundColor: '#d63031',
              color: 'white',
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '12px',
              fontWeight: 'bold',
              minWidth: '20px',
              textAlign: 'center'
            }}>
              {pendingOrders}
            </span>
          )}
        </NavLink>
      </nav>

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

export default AdminSidebar;
