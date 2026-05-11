'use client';

import { useState } from 'react';
import CitySelector from './CitySelector';
import PaymentMethods from './PaymentMethods';
import WhatsAppLogo from './WhatsAppLogo';
import { isCityEligibleForCashOnDelivery } from '@/app/utils/cashOnDeliveryChecker';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutFormProps {
  cartItems: CartItem[];
}

const WHATSAPP_NUMBER = '573001234567';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Hola! Estoy interesado en un producto pero mi ciudad no tiene pago contra entrega, me ayudan?'
);

export default function CheckoutForm({ cartItems }: CheckoutFormProps) {
  const [selectedCity, setSelectedCity] = useState('');
  const [isCashOnDeliveryEligible, setIsCashOnDeliveryEligible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCitySelect = (city: string, eligible: boolean) => {
    setSelectedCity(city);
    setIsCashOnDeliveryEligible(eligible);
    setSelectedPayment('');
  };

  const handlePaymentMethodSelect = (method: string) => {
    if (method === 'cash' && !isCashOnDeliveryEligible) {
      return;
    }
    setSelectedPayment(method);
  };

  const handleCheckout = () => {
    if (!selectedCity || !selectedPayment) {
      alert('Por favor completa todos los campos');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      alert(`Procesando pago con ${selectedPayment} para ${selectedCity}`);
      setIsProcessing(false);
    }, 2000);
  };

  const paymentMethods = isCashOnDeliveryEligible
    ? ['card', 'pse', 'nequi', 'daviplata', 'cash']
    : ['card', 'pse', 'nequi', 'daviplata'];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold text-trust-dark mb-6">Finalizar Compra Segura</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <CitySelector onCitySelect={handleCitySelect} />

          <PaymentMethods
            availableMethods={paymentMethods}
            selectedMethod={selectedPayment}
            selectedSub=""
            cashEligible={isCashOnDeliveryEligible}
            onSelectMethod={handlePaymentMethodSelect}
          />

          {!isCashOnDeliveryEligible && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>
                  Verifica con nosotros si hay disponibilidad de Pago contra entrega.
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 font-semibold text-green-600 hover:text-green-700 underline inline-flex items-center gap-1"
                  >
                    <WhatsAppLogo size="1em" />
                    Contactar Ventas WhatsApp
                  </a>
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="bg-trust-light rounded-lg p-6">
          <h3 className="text-xl font-semibold text-trust-dark mb-4">Resumen del Pedido</h3>

          <div className="space-y-3 mb-6 border-b border-gray-300 pb-4">
            {cartItems.length === 0 ? (
              <p className="text-gray-600 text-sm">Tu carrito está vacío</p>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-semibold text-trust-dark">
                    ${(item.price * item.quantity).toLocaleString('es-CO')}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-lg font-bold text-trust-green">
              <span>Total:</span>
              <span>${total.toLocaleString('es-CO')}</span>
            </div>
          </div>

          {selectedCity && (
            <div className="mb-6 p-3 bg-white rounded border border-trust-green">
              <p className="text-xs text-gray-600">Entrega en:</p>
              <p className="font-semibold text-trust-dark">{selectedCity}</p>
            </div>
          )}

          {/* Trust Badges */}
          <div className="mb-6 space-y-3">
            <p className="text-xs font-semibold text-gray-700 uppercase">Métodos de Pago Seguros</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded text-center">
                <p className="text-xs font-semibold text-trust-dark">🔒 SSL</p>
                <p className="text-xs text-gray-600">Encriptado</p>
              </div>
              <div className="bg-white p-2 rounded text-center">
                <p className="text-xs font-semibold text-trust-dark">💳 Wompi</p>
                <p className="text-xs text-gray-600">Seguro</p>
              </div>
              <div className="bg-white p-2 rounded text-center">
                <p className="text-xs font-semibold text-trust-dark">🏦 PSE</p>
                <p className="text-xs text-gray-600">ACH</p>
              </div>
              <div className="bg-white p-2 rounded text-center">
                <p className="text-xs font-semibold text-trust-dark">📱 Nequi</p>
                <p className="text-xs text-gray-600">Billetera</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={!selectedCity || !selectedPayment || isProcessing || cartItems.length === 0}
            className="w-full bg-trust-dark text-white font-semibold py-3 rounded-lg hover:bg-trust-green transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing && <div className="spinner" />}
            {isProcessing ? 'Procesando...' : 'Finalizar Compra Segura'}
          </button>

          <p className="text-xs text-center text-gray-600 mt-3">
            Tu información está protegida con encriptación SSL
          </p>
        </div>
      </div>
    </div>
  );
}
