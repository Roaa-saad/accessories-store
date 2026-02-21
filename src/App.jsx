import { Routes, Route } from "react-router-dom";

/* ===== PUBLIC PAGES ===== */
import Home from "./pages/Home";
import Category from "./pages/Category";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails";
import ReturnPolicy from "./pages/ReturnPolicy";

/* ===== ADMIN PAGES ===== */
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAddProduct from "./pages/AdminAddProduct";
import AdminOrders from "./pages/AdminOrders";

/* ===== PROTECTED ROUTE ===== */
import AdminRoute from "./components/AdminRoute";

const App = () => {
  return (
    <Routes>
      {/* ================= PUBLIC WEBSITE ================= */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/category/:name" element={<Category />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/return-policy" element={<ReturnPolicy />} />

      {/* ================= ADMIN LOGIN ================= */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ================= ADMIN (PROTECTED) ================= */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/add-product"
        element={
          <AdminRoute>
            <AdminAddProduct />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <AdminOrders />
          </AdminRoute>
        }
      />
    </Routes>
  );
};

export default App;
