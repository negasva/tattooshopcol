'use client';

import { useState } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  tags: string[];
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = () => {
    setIsLoading(true);
    setTimeout(() => {
      onAddToCart(product);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        <h3 className="font-semibold text-trust-dark text-lg mb-2">{product.name}</h3>

        <div className="flex gap-2 mb-3">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-trust-green text-white px-2 py-1 rounded-full"
            >
              {tag === 'bestsellers' && '⭐ Bestseller'}
              {tag === 'new' && '🆕 Nuevo'}
              {tag === 'premium' && '👑 Premium'}
              {tag === 'essentials' && '📦 Esencial'}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-trust-green">
            ${product.price.toLocaleString('es-CO')}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="w-full mt-4 bg-trust-dark text-white py-2 rounded-lg hover:bg-trust-green transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading && <div className="spinner" />}
          {isLoading ? 'Agregando...' : 'Agregar al Carrito'}
        </button>
      </div>
    </div>
  );
}
