'use client';

const accent = '#FFD400';
const COD_FEE = 18000;

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const METHODS = [
  {
    key: 'card',
    label: 'Tarjeta Débito/Crédito',
    icon: '💳',
    description: 'Visa, Mastercard, American Express — Pago seguro con Wompi',
  },
  {
    key: 'pse',
    label: 'PSE',
    icon: '🏦',
    description: 'Transferencia bancaria inmediata desde tu banco',
  },
  {
    key: 'transfer',
    label: 'Transferencia Bancaria',
    icon: '📲',
    description: 'Nequi · Daviplata · Bancolombia',
    subOptions: [
      { key: 'nequi',       label: 'Nequi',       icon: '📱', desc: 'Billetera digital Nequi' },
      { key: 'daviplata',   label: 'Daviplata',   icon: '💰', desc: 'Billetera Davivienda' },
      { key: 'bancolombia', label: 'Bancolombia', icon: '🏛', desc: 'Cuenta Bancolombia' },
    ],
  },
  {
    key: 'cash',
    label: 'Pago Contra Entrega',
    icon: '🏠',
    description: `Pagas al recibir — costo adicional de ${fmt(COD_FEE)}`,
    codOnly: true,
  },
];

interface PaymentMethodsProps {
  availableMethods: string[];
  selectedMethod: string;
  selectedSub: string;
  onSelectMethod: (method: string, sub?: string) => void;
  cashEligible: boolean;
}

export default function PaymentMethods({
  availableMethods, selectedMethod, selectedSub, onSelectMethod, cashEligible,
}: PaymentMethodsProps) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: '"DM Mono", monospace', fontSize: '9px', color: accent, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>
        Método de Pago
      </label>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
        {METHODS.filter((m) => availableMethods.includes(m.key)).map((m) => {
          const active = selectedMethod === m.key;
          const disabled = m.codOnly && !cashEligible;
          return (
            <div key={m.key}>
              <button
                onClick={() => !disabled && onSelectMethod(m.key)}
                disabled={disabled}
                style={{
                  width: '100%',
                  background: active ? 'var(--surface2)' : 'var(--surface)',
                  border: 'none',
                  padding: '14px 16px',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                  borderLeft: active ? `3px solid ${accent}` : '3px solid transparent',
                  opacity: disabled ? 0.35 : 1,
                }}
                onMouseEnter={(e) => { if (!active && !disabled) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface2)'; }}
                onMouseLeave={(e) => { if (!active && !disabled) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)'; }}
              >
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{m.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: active ? accent : 'var(--text)', letterSpacing: '0.5px' }}>
                    {m.label}
                    {m.codOnly && <span style={{ marginLeft: '8px', fontSize: '9px', color: '#e55' }}>+{fmt(COD_FEE)}</span>}
                  </div>
                  <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: 'var(--text-dim)', marginTop: '2px', lineHeight: 1.5 }}>{m.description}</div>
                </div>
                {active && <span style={{ color: accent, fontSize: '16px', flexShrink: 0 }}>✓</span>}
              </button>

              {/* Sub-opciones de Transferencia */}
              {active && m.subOptions && (
                <div style={{ background: 'var(--bg)', borderLeft: `3px solid ${accent}`, display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  {m.subOptions.map((sub) => {
                    const subActive = selectedSub === sub.key;
                    return (
                      <button
                        key={sub.key}
                        onClick={() => onSelectMethod(m.key, sub.key)}
                        style={{
                          background: subActive ? `${accent}18` : 'transparent',
                          border: 'none',
                          borderBottom: '1px solid var(--border)',
                          padding: '10px 20px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          textAlign: 'left',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => { if (!subActive) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)'; }}
                        onMouseLeave={(e) => { if (!subActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                      >
                        <span style={{ fontSize: '18px' }}>{sub.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: subActive ? accent : 'var(--text-muted)' }}>{sub.label}</div>
                          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '8px', color: 'var(--text-dim)', marginTop: '1px' }}>{sub.desc}</div>
                        </div>
                        {subActive && <span style={{ color: accent, fontSize: '13px' }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { COD_FEE };
