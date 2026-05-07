'use client';

const accent = '#FFD400';

const METHODS: Record<string, { label: string; icon: string; description: string }> = {
  card:       { label: 'Tarjeta Débito/Crédito', icon: '💳', description: 'Visa, Mastercard, American Express' },
  pse:        { label: 'PSE',                    icon: '🏦', description: 'Transferencia bancaria instantánea' },
  nequi:      { label: 'Nequi',                  icon: '📱', description: 'Billetera digital' },
  daviplata:  { label: 'Daviplata',              icon: '💰', description: 'Billetera digital' },
  cash:       { label: 'Pago Contra Entrega',    icon: '🏠', description: 'Pagas cuando recibes tu pedido' },
};

interface PaymentMethodsProps {
  availableMethods: string[];
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
}

export default function PaymentMethods({ availableMethods, selectedMethod, onSelectMethod }: PaymentMethodsProps) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: '"DM Mono", monospace', fontSize: '9px', color: accent, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>
        Método de Pago
      </label>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
        {availableMethods.map((key) => {
          const m = METHODS[key];
          if (!m) return null;
          const active = selectedMethod === key;
          return (
            <button
              key={key}
              onClick={() => onSelectMethod(key)}
              style={{
                background: active ? 'var(--surface2)' : 'var(--surface)',
                border: 'none',
                padding: '14px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                textAlign: 'left',
                transition: 'background 0.15s',
                borderLeft: active ? `3px solid ${accent}` : '3px solid transparent',
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface2)'; }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)'; }}
            >
              <span style={{ fontSize: '22px', flexShrink: 0 }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: active ? accent : 'var(--text)', letterSpacing: '0.5px' }}>{m.label}</div>
                <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: 'var(--text-dim)', marginTop: '2px' }}>{m.description}</div>
              </div>
              {active && <span style={{ color: accent, fontSize: '16px', flexShrink: 0 }}>✓</span>}
            </button>
          );
        })}
      </div>

      {availableMethods.length < 5 && (
        <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: 'var(--text-dim)', marginTop: '10px', lineHeight: 1.6 }}>
          * Otros métodos de pago disponibles según tu ciudad
        </p>
      )}
    </div>
  );
}
