'use client';

import { useState } from 'react';

interface PaymentMethodsProps {
  availableMethods: string[];
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
}

const METHOD_LABELS: Record<string, { label: string; icon: string; description: string }> = {
  card: {
    label: 'Tarjeta Débito/Crédito',
    icon: '💳',
    description: 'Visa, Mastercard, American Express',
  },
  pse: {
    label: 'PSE',
    icon: '🏦',
    description: 'Transferencia bancaria instantánea',
  },
  nequi: {
    label: 'Nequi',
    icon: '📱',
    description: 'Billetera digital',
  },
  daviplata: {
    label: 'Daviplata',
    icon: '💰',
    description: 'Billetera digital',
  },
  cash: {
    label: 'Pago Contra Entrega',
    icon: '💵',
    description: 'Paga cuando recibas tu pedido',
  },
};

export default function PaymentMethods({
  availableMethods,
  selectedMethod,
  onSelectMethod,
}: PaymentMethodsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectMethod = (method: string) => {
    setIsLoading(true);
    setTimeout(() => {
      onSelectMethod(method);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-trust-dark mb-3">
        Método de Pago
      </label>

      <div className="space-y-3">
        {availableMethods.map((method) => {
          const methodInfo = METHOD_LABELS[method];
          if (!methodInfo) return null;

          return (
            <button
              key={method}
              onClick={() => handleSelectMethod(method)}
              disabled={isLoading}
              className={`w-full p-4 rounded-lg border-2 transition text-left ${
                selectedMethod === method
                  ? 'border-trust-green bg-green-50'
                  : 'border-gray-300 bg-white hover:border-trust-green'
              } disabled:opacity-50`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{methodInfo.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-trust-dark">{methodInfo.label}</p>
                  <p className="text-xs text-gray-600">{methodInfo.description}</p>
                </div>
                {selectedMethod === method && (
                  <span className="text-trust-green text-xl">✓</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {availableMethods.length < 5 && (
        <p className="text-xs text-gray-600 mt-3">
          * Otros métodos de pago pueden estar disponibles después de seleccionar tu ciudad
        </p>
      )}
    </div>
  );
}
