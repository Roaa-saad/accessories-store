import axios from "axios";

// const API_URL = 'https://accessories-backend-production.up.railway.app';
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
    // Validate product with backend
    const response = await fetch(
      "https://accessories-backend-production.up.railway.app/client/cart/add",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: `product_id=${product_id}&quantity=${quantity}`,
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    // Get validated product from response
    const result = await response.json();
    const validatedProduct = result.product;
    
    // Get current cart from localStorage
    const cart = getCartFromStorage();
    
    // Check if product already in cart
    const existingIndex = cart.findIndex(item => item.product_id === product_id);
    
    if (existingIndex !== -1) {
      // Update quantity
      cart[existingIndex].quantity += quantity;
    } else {
      // Add new item with validated product data
      cart.push({
        product_id: validatedProduct.product_id,
        quantity: quantity,
        name: validatedProduct.name,
        price: validatedProduct.price,
        discount_price: validatedProduct.discount_price || null,
        images: validatedProduct.images,
        description: validatedProduct.description
      });
    }
    
    // Save to localStorage
    saveCartToStorage(cart);
    
    return { success: true, product: validatedProduct };
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
  
  const formData = new FormData();
  formData.append('customer_name', data.name);
  formData.append('customer_email', data.email);
  formData.append('customer_phone', data.phone);
  formData.append('customer_address', data.address);
  formData.append('customer_city', data.city);
  formData.append('discount_code', data.discount_code || '');
  formData.append('notes', data.note || '');
  formData.append('total_amount', data.total_amount.toString());
  formData.append('cart_items', JSON.stringify(cart.map(item => ({
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.discount_price && item.discount_price > 0 ? item.discount_price : item.price
  }))));
  
  const response = await fetch(
    "https://accessories-backend-production.up.railway.app/client/checkout",
    {
      method: "POST",
      body: formData,
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
