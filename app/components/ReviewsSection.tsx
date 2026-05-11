'use client';

import { useState } from 'react';
import reviews from '@/app/data/reviews.json';
import WhatsAppLogo from './WhatsAppLogo';

export default function ReviewsSection() {
  const [displayedReviews, setDisplayedReviews] = useState(reviews);

  const renderStars = (stars: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={i < stars ? 'text-yellow-400' : 'text-gray-300'}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-trust-dark mb-2 text-center">
          Opiniones de Nuestros Clientes
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Más de {displayedReviews.length} clientes satisfechos
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedReviews.map((review) => (
            <div
              key={review.id}
              className="bg-trust-light rounded-lg p-6 shadow-md hover:shadow-lg transition"
            >
              <div className="flex items-start gap-4 mb-4">
                {review.photo && (
                  <img
                    src={review.photo}
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-trust-dark">{review.name}</h4>
                  {renderStars(review.stars)}
                </div>
              </div>

              <p className="text-gray-700 text-sm italic">"{review.comment}"</p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 bg-trust-dark text-white rounded-lg text-center">
          <p className="text-lg font-semibold mb-4">
            ¿Tienes una experiencia que compartir?
          </p>
          <p className="text-sm text-trust-light mb-6">
            Tus opiniones nos ayudan a mejorar. Contáctanos en WhatsApp para dejar tu reseña.
          </p>
          <a
            href="https://wa.me/573000000000?text=Hola!%20Quiero%20dejar%20una%20reseña%20sobre%20mis%20compras"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            <WhatsAppLogo size="1.2em" />
            Envía tu reseña por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
