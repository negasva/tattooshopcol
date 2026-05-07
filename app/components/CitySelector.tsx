'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import cities from '@/app/data/colombianCities.json';

const accent = '#FFD400';

interface CitySelectorProps {
  onCitySelect: (city: string, isCashOnDeliveryEligible: boolean) => void;
}

export default function CitySelector({ onCitySelect }: CitySelectorProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const allCities = useMemo(() => {
    const list: { name: string; cashOnDelivery: boolean }[] = [];
    cities.forEach((c) => {
      list.push({ name: c.city, cashOnDelivery: c.cashOnDelivery });
      c.suburbs.forEach((s) => list.push({ name: s, cashOnDelivery: c.cashOnDelivery }));
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filtered = useMemo(
    () => (query ? allCities.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())) : allCities),
    [query, allCities]
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (name: string) => {
    const city = allCities.find((c) => c.name === name);
    setSelected(name);
    setQuery(name);
    setIsOpen(false);
    if (city) onCitySelect(name, city.cashOnDelivery);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <label style={{ display: 'block', fontFamily: '"DM Mono", monospace', fontSize: '9px', color: accent, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>
        Ciudad de Entrega
      </label>
      <input
        type="text"
        placeholder="Busca tu ciudad..."
        value={query}
        onChange={(e) => { setQuery(e.target.value); setSelected(''); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        style={{
          width: '100%',
          padding: '12px 14px',
          background: 'var(--surface)',
          border: `1px solid ${selected ? accent : 'var(--border)'}`,
          color: 'var(--text)',
          fontFamily: '"DM Mono", monospace',
          fontSize: '13px',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocusCapture={(e) => { (e.target as HTMLInputElement).style.borderColor = accent; }}
        onBlurCapture={(e) => { if (!selected) (e.target as HTMLInputElement).style.borderColor = 'var(--border)'; }}
      />

      {isOpen && filtered.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#1e1e1e',
          border: '1px solid var(--border)',
          borderTop: 'none',
          maxHeight: '220px',
          overflowY: 'auto',
          zIndex: 50,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          {filtered.slice(0, 20).map((city) => (
            <button
              key={city.name}
              onMouseDown={() => handleSelect(city.name)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 14px',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface2)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
            >
              <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text)' }}>{city.name}</span>
              {city.cashOnDelivery && (
                <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '8px', color: '#111', background: accent, padding: '2px 6px', letterSpacing: '1px' }}>
                  C.ENTREGA ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div style={{ marginTop: '8px', fontFamily: '"DM Mono", monospace', fontSize: '10px', color: accent, letterSpacing: '1px' }}>
          ✓ {selected}
        </div>
      )}
    </div>
  );
}
