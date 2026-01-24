import { NavLink, useNavigate } from "react-router-dom";

const AdminSidebar = ({ onClose }) => {
  const navigate = useNavigate();

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

        <NavLink to="/admin/orders" onClick={onClose}>
          Orders
        </NavLink>
      </nav>

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

export default AdminSidebar;
