import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// ================= PRODUCTS =================
export const getProducts = async () => {
  const res = await API.get("/client/products");
  return res.data;
};

// ================= ADD TO CART =================
export const addToCart = async (product_id, quantity = 1) => {
  const body = `product_id=${product_id}&quantity=${quantity}`;

  const res = await fetch(
    "http://127.0.0.1:8000/client/cart/add",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return res.json();
};

// ================= GET CART =================
export const getCart = async () => {
  const res = await API.get("/client/cart");
  return res.data;
};

// ================= CHECKOUT =================
export const checkout = async (data) => {
  const body =
    `customer_name=${encodeURIComponent(data.name)}` +
    `&customer_email=${encodeURIComponent(data.email)}` +
    `&customer_phone=${encodeURIComponent(data.phone)}` + // ✅ ADDED
    `&customer_address=${encodeURIComponent(data.address)}`;

  const res = await fetch(
    "http://127.0.0.1:8000/client/checkout",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return res.json();
};

// ================= REMOVE FROM CART =================
export const removeFromCart = async (product_id) => {
  const res = await API.delete(`/client/cart/remove/${product_id}`);
  return res.data;
};
