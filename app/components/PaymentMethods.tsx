'use client';

const accent = '#FFD400';
const COD_FEE = 18000;

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const CardIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '22px', height: '22px' }}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const BankIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '22px', height: '22px' }}><line x1="12" y1="1" x2="12" y2="23"/><path d="M1 6h22M1 10h22M1 14h22M1 18h22"/></svg>;
const PhoneIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '22px', height: '22px' }}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
const HomeIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '22px', height: '22px' }}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const CheckIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}><polyline points="20 6 9 17 4 12"/></svg>;
const NequiIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '22px', height: '22px' }}><path d="M12 2l3 7h7l-5.5 4 2 7-6.5-5-6.5 5 2-7-5.5-4h7z"/></svg>;
const DaviplataIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '22px', height: '22px' }}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 12h10"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="7" y1="15" x2="17" y2="15"/></svg>;
const BancolombiaIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '22px', height: '22px' }}><rect x="2" y="6" width="20" height="12" rx="1"/><path d="M6 10v4M9 10v4M12 10v4M15 10v4M18 10v4"/></svg>;

const METHODS = [
  {
    key: 'card',
    label: 'Tarjeta Débito/Crédito',
    icon: CardIcon,
    description: 'Visa, Mastercard, American Express — Pago seguro con Wompi',
  },
  {
    key: 'pse',
    label: 'PSE',
    icon: BankIcon,
    description: 'Transferencia bancaria inmediata desde tu banco',
  },
  {
    key: 'transfer',
    label: 'Transferencia Bancaria',
    icon: PhoneIcon,
    description: 'Nequi · Daviplata · Bancolombia',
    subOptions: [
      { key: 'nequi',       label: 'Nequi',       icon: NequiIcon, desc: 'Billetera digital Nequi' },
      { key: 'daviplata',   label: 'Daviplata',   icon: DaviplataIcon, desc: 'Billetera Davivienda' },
      { key: 'bancolombia', label: 'Bancolombia', icon: BancolombiaIcon, desc: 'Cuenta Bancolombia' },
    ],
  },
  {
    key: 'cash',
    label: 'Pago Contra Entrega',
    icon: HomeIcon,
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
                <span style={{ color: accent, flexShrink: 0 }}>{typeof m.icon === 'function' ? <m.icon /> : m.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: active ? accent : 'var(--text)', letterSpacing: '0.5px' }}>
                    {m.label}
                    {m.codOnly && <span style={{ marginLeft: '8px', fontSize: '9px', color: '#e55' }}>+{fmt(COD_FEE)}</span>}
                  </div>
                  <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: 'var(--text-dim)', marginTop: '2px', lineHeight: 1.5 }}>{m.description}</div>
                </div>
                {active && <span style={{ color: accent, flexShrink: 0 }}><CheckIcon /></span>}
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
                        <span style={{ color: accent }}>{typeof sub.icon === 'function' ? <sub.icon /> : sub.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: subActive ? accent : 'var(--text-muted)' }}>{sub.label}</div>
                          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '8px', color: 'var(--text-dim)', marginTop: '1px' }}>{sub.desc}</div>
                        </div>
                        {subActive && <span style={{ color: accent }}><CheckIcon /></span>}
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
