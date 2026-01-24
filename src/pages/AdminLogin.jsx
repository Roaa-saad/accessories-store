import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await fetch("http://127.0.0.1:8000/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form), // { email, password }
    });

    if (!res.ok) {
      alert("Wrong credentials");
      return;
    }

    const data = await res.json();

    // ✅ save token
    localStorage.setItem("admin_token", data.access_token);

    // go to admin (smart route: login/dashboard)
    navigate("/admin");
  };

  return (
    <div className="admin-login-page">
      <h1>Admin Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) =>
          setForm({ ...form, password: e.target.value })
        }
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default AdminLogin;
