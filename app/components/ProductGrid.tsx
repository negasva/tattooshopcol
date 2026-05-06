'use client';

import { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import products from '@/app/data/products.json';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  tags: string[];
}

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
}

const TAG_LABELS: Record<string, string> = {
  bestsellers: '⭐ Bestsellers',
  new: '🆕 Nuevos Arrivals',
  premium: '👑 Premium',
  essentials: '📦 Esenciales',
};

export default function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const groupedProducts = useMemo(() => {
    const groups: Record<string, Product[]> = {};

    products.forEach((product) => {
      product.tags.forEach((tag) => {
        if (!groups[tag]) {
          groups[tag] = [];
        }
        if (!groups[tag].find(p => p.id === product.id)) {
          groups[tag].push(product);
        }
      });
    });

    return groups;
  }, []);

  const filteredGroups = selectedTag
    ? { [selectedTag]: groupedProducts[selectedTag] || [] }
    : groupedProducts;

  const tags = Object.keys(groupedProducts);

  return (
    <section className="py-12 bg-trust-light">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-trust-dark mb-8 text-center">
          Nuestros Productos
        </h2>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 rounded-full transition ${
              selectedTag === null
                ? 'bg-trust-dark text-white'
                : 'bg-white text-trust-dark border border-trust-dark hover:bg-trust-dark hover:text-white'
            }`}
          >
            Ver Todos
          </button>

          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full transition ${
                selectedTag === tag
                  ? 'bg-trust-dark text-white'
                  : 'bg-white text-trust-dark border border-trust-dark hover:bg-trust-dark hover:text-white'
              }`}
            >
              {TAG_LABELS[tag] || tag}
            </button>
          ))}
        </div>

        {Object.entries(filteredGroups).map(([tag, productList]) => (
          <div key={tag} className="mb-12">
            <h3 className="text-2xl font-semibold text-trust-dark mb-6">
              {TAG_LABELS[tag] || tag}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {productList.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
