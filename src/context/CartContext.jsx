import { createContext, useState, useEffect } from 'react';
import { getCart } from '../api/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  const fetchCartCount = async () => {
    try {
      const data = await getCart();
      const items = Array.isArray(data) ? data : data?.items || [];
      const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCount(count);
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, []);

  const updateCartCount = () => {
    fetchCartCount();
  };

  const showAddedNotification = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  return (
    <CartContext.Provider value={{ 
      cartCount, 
      updateCartCount, 
      showAddedNotification,
      showNotification 
    }}>
      {children}
      
      {/* Notification Popup */}
      {showNotification && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          backgroundColor: '#f4ebe6',
          color: '#8b7355',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          zIndex: 9999,
          animation: 'slideIn 0.3s ease-out',
          fontWeight: '500',
          border: '1px solid #d4c4b8'
        }}>
          ✓ Product added to cart successfully
        </div>
      )}
      
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </CartContext.Provider>
  );
};
