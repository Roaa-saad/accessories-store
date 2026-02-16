import axios from "axios";

const API_URL = 'https://accessories-backend-production.up.railway.app';

const API = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Cache-Control': 'public, max-age=300'
  }
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

// ================= CART - LOCAL STORAGE =================
const CART_KEY = 'lumiie_cart';

const getCartFromStorage = () => {
  try {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
    return [];
  }
};

const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

// ================= ADD TO CART =================
export const addToCart = async (product_id, quantity = 1) => {
  try {
    // Fetch product details
    const allProducts = await getProducts();
    const product = allProducts.find(p => p.product_id === product_id);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    const cart = getCartFromStorage();
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.product_id === product_id);
    
    if (existingItemIndex > -1) {
      // Update quantity
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item with full product details
      cart.push({
        product_id: product.product_id,
        quantity: quantity,
        name: product.name,
        price: product.price,
        images: product.images,
        description: product.description
      });
    }
    
    saveCartToStorage(cart);
    return { success: true, cart };
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

// ================= GET CART =================
export const getCart = async () => {
  const cart = getCartFromStorage();
  
  // Return cart with proper structure
  return cart.map(item => ({
    ...item,
    cart_item_id: item.product_id
  }));
};

// ================= CHECKOUT =================
export const checkout = async (data) => {
  const cart = getCartFromStorage();
  
  const response = await fetch(
    "https://accessories-backend-production.up.railway.app/client/checkout",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone,
        customer_address: data.address,
        customer_city: data.city,
        discount_code: data.discount_code || null,
        notes: data.note || null,
        cart_items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }

  // Clear cart after successful checkout
  localStorage.removeItem(CART_KEY);
  
  return response.json();
};

// ================= REMOVE FROM CART =================
export const removeFromCart = async (product_id) => {
  const cart = getCartFromStorage();
  const updatedCart = cart.filter(item => item.product_id !== product_id);
  saveCartToStorage(updatedCart);
  return { success: true, cart: updatedCart };
};

// ================= CATEGORIES =================
export const getCategories = async () => {
  const res = await API.get("/client/categories");
  return res.data;
};
