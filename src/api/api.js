import axios from "axios";

const API_URL = 'https://accessories-backend-production.up.railway.app';

const API = axios.create({
  baseURL: API_URL,
});

// ================= UTILITY: Fix HTTP to HTTPS =================
const ensureHttps = (url) => {
  if (!url) return url;
  if (typeof url === 'string' && url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
};

// ================= UTILITY: Fix Image URLs in Product =================
const fixProductImageUrls = (product) => {
  if (!product) return product;
  
  if (product.images && Array.isArray(product.images)) {
    product.images = product.images.map((img, index) => {
      // If image is already an object with image_url, just ensure HTTPS
      if (typeof img === 'object' && img.image_url) {
        return {
          ...img,
          image_url: ensureHttps(img.image_url)
        };
      }
      // If image is a string URL, convert to object format
      if (typeof img === 'string') {
        return {
          id: index,
          image_url: ensureHttps(img),
          is_cover: index === 0, // First image is cover by default
          sort_order: index
        };
      }
      return img;
    });
  }
  
  return product;
};

// ================= PRODUCTS =================
export const getProducts = async () => {
  const res = await API.get("/client/products");
  const products = res.data;
  
  // Fix all image URLs to use HTTPS
  if (Array.isArray(products)) {
    return products.map(fixProductImageUrls);
  }
  
  return products;
};

// ================= ADD TO CART =================
export const addToCart = async (product_id, quantity = 1) => {
  const body = `product_id=${product_id}&quantity=${quantity}`;

  const res = await fetch(
    "https://accessories-backend-production.up.railway.app/client/cart/add",
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
  const cart = res.data;
  
  // Fix image URLs in cart items
  // Handle both cart.items array and direct array response
  if (cart && Array.isArray(cart.items)) {
    cart.items = cart.items.map(item => fixProductImageUrls(item));
    return cart;
  } else if (Array.isArray(cart)) {
    return cart.map(item => fixProductImageUrls(item));
  }
  
  return cart;
};

// ================= CHECKOUT =================
export const checkout = async (data) => {
  const body =
    `customer_name=${encodeURIComponent(data.name)}` +
    `&customer_email=${encodeURIComponent(data.email)}` +
    `&customer_phone=${encodeURIComponent(data.phone)}` + // ✅ ADDED
    `&customer_address=${encodeURIComponent(data.address)}`;

  const res = await fetch(
    "https://accessories-backend-production.up.railway.app/client/checkout",
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

// ================= CATEGORIES =================
export const getCategories = async () => {
  const res = await API.get("/client/categories");
  return res.data;
};
