'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import data from '@/app/data/colombianCities.json';

const accent = '#FFD400';

interface CitySelectorProps {
  onCitySelect: (city: string, isCashOnDeliveryEligible: boolean) => void;
}

export default function CitySelector({ onCitySelect }: CitySelectorProps) {
  const [selectedDept, setSelectedDept] = useState('');
  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const deptRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  const departments = useMemo(() => data.map(d => d.department).sort(), []);

  const citiesInDept = useMemo(() => {
    if (!selectedDept) return [];
    const dept = data.find(d => d.department === selectedDept);
    return dept ? dept.cities : [];
  }, [selectedDept]);

  const filteredCities = useMemo(() => {
    if (!query) return citiesInDept;
    return citiesInDept.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
  }, [query, citiesInDept]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (deptRef.current && !deptRef.current.contains(e.target as Node)) setIsDeptOpen(false);
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setIsCityOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCitySelect = (cityName: string) => {
    const city = citiesInDept.find(c => c.name === cityName);
    setSelectedCity(cityName);
    setQuery(cityName);
    setIsCityOpen(false);
    if (city) onCitySelect(cityName, city.cashOnDelivery);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* DEPARTAMENTO */}
      <div ref={deptRef} style={{ position: 'relative' }}>
        <label style={{ display: 'block', fontFamily: '"DM Mono", monospace', fontSize: '9px', color: accent, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>
          Departamento
        </label>
        <button
          onClick={() => setIsDeptOpen(!isDeptOpen)}
          style={{
            width: '100%',
            padding: '12px 14px',
            background: 'var(--surface)',
            border: `1px solid ${selectedDept ? accent : 'var(--border)'}`,
            color: selectedDept ? 'var(--text)' : 'var(--text-muted)',
            fontFamily: '"DM Mono", monospace',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = accent; }}
          onMouseLeave={(e) => { if (!selectedDept) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
        >
          {selectedDept || 'Selecciona departamento...'}
        </button>

        {isDeptOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#1e1e1e',
            border: '1px solid var(--border)',
            borderTop: 'none',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 50,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
            {departments.map((dept) => (
              <button
                key={dept}
                onMouseDown={() => { setSelectedDept(dept); setIsDeptOpen(false); setSelectedCity(''); setQuery(''); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '12px',
                  color: 'var(--text)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface2)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
              >
                {dept}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CIUDAD */}
      {selectedDept && (
        <div ref={cityRef} style={{ position: 'relative' }}>
          <label style={{ display: 'block', fontFamily: '"DM Mono", monospace', fontSize: '9px', color: accent, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>
            Ciudad de Entrega
          </label>
          <input
            type="text"
            placeholder="Busca tu ciudad..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedCity(''); setIsCityOpen(true); }}
            onFocus={() => setIsCityOpen(true)}
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'var(--surface)',
              border: `1px solid ${selectedCity ? accent : 'var(--border)'}`,
              color: 'var(--text)',
              fontFamily: '"DM Mono", monospace',
              fontSize: '13px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocusCapture={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = accent; }}
            onBlurCapture={(e) => { if (!selectedCity) (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--border)'; }}
          />

          {isCityOpen && filteredCities.length > 0 && (
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
              {filteredCities.slice(0, 20).map((city) => (
                <button
                  key={city.name}
                  onMouseDown={() => handleCitySelect(city.name)}
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

          {selectedCity && (
            <div style={{ marginTop: '8px', fontFamily: '"DM Mono", monospace', fontSize: '10px', color: accent, letterSpacing: '1px' }}>
              ✓ {selectedCity}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
