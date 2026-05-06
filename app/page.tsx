'use client';

import { useState } from 'react';
import ProductGrid from './components/ProductGrid';
import ReviewsSection from './components/ReviewsSection';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  tags: string[];
}

interface CartItem extends Product {
  quantity: number;
}

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartNotification, setShowCartNotification] = useState(false);

  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...prevCart, { ...product, quantity: 1 }];
    });

    setShowCartNotification(true);
    setTimeout(() => setShowCartNotification(false), 2000);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-trust-dark to-trust-green text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Bienvenido a TattooShop Colombia
          </h1>
          <p className="text-lg md:text-xl text-trust-light mb-6">
            Los mejores productos para tatuajes con calidad garantizada
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-trust-dark font-semibold py-3 px-8 rounded-lg hover:bg-trust-light transition"
            >
              Explorar Productos
            </button>
            <button
              onClick={() => {
                window.location.href = '/checkout';
              }}
              disabled={cartCount === 0}
              className="bg-yellow-400 text-trust-dark font-semibold py-3 px-8 rounded-lg hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ver Carrito ({cartCount})
            </button>
          </div>
        </div>
      </section>

      {/* Cart Notification */}
      {showCartNotification && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-trust-green text-white px-6 py-3 rounded-lg shadow-lg z-30 animate-pulse">
          ✓ Producto agregado al carrito
        </div>
      )}

      {/* Products Section */}
      <div id="products">
        <ProductGrid onAddToCart={handleAddToCart} />
      </div>

      {/* Reviews Section */}
      <ReviewsSection />

      {/* CTA Section */}
      <section className="bg-trust-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            ¿Preguntas o Necesitas Asesoramiento?
          </h2>
          <p className="text-trust-light mb-6">
            Nuestro equipo está disponible 24/7 en WhatsApp
          </p>
          <a
            href="https://wa.me/573001234567?text=Hola%20TattooShop%20Colombia%21%20Tengo%20una%20pregunta."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-500 text-white font-semibold py-3 px-8 rounded-lg hover:bg-green-600 transition"
          >
            💬 Contactar por WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
