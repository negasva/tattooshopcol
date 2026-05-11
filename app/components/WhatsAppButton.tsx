'use client';

import WhatsAppLogo from './WhatsAppLogo';

const WHATSAPP_NUMBER = '573001234567';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Hola! Estoy interesado en un producto. Me ayudan?'
);

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-green-600 hover:scale-110 transition-transform z-40"
      title="Contactar por WhatsApp"
    >
      <WhatsAppLogo size="1.5em" />
    </a>
  );
}
