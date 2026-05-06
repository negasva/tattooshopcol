'use client';

import { useState, useEffect } from 'react';
import CheckoutForm from '../components/CheckoutForm';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // In a real app, you'd get this from a context or state management
    // For now, we'll use localStorage or session storage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to load cart from localStorage', e);
      }
    }
  }, []);

  // Mock cart data for demonstration
  const mockCart: CartItem[] = [
    { id: 1, name: 'Tinta Negra Premium', price: 45000, quantity: 1 },
    { id: 2, name: 'Kit Agujas Profesional', price: 75000, quantity: 1 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <CheckoutForm cartItems={cartItems.length > 0 ? cartItems : mockCart} />
    </div>
  );
}
