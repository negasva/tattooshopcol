'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/app/lib/supabase';

const accent = '#FFD400';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

function toSlug(name: string) {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

interface Product {
  id: string; name: string; category: string; price: number;
  image_url?: string; discount_percentage?: number; original_price?: number; inventory?: number; tag?: string; specs?: string;
  nivel_recomendado?: string; tipo_uso?: string; complejidad_uso?: number;
}

function salePrice(p: Product) {
  if (p.discount_percentage && p.discount_percentage > 0) {
    if (p.original_price && p.original_price > p.price) return p.price;
    return Math.round(p.price - p.price * (p.discount_percentage / 100));
  }
  return p.price;
}

const STEPS = [
  {
    id: 'level',
    question: '¿Cuál es tu nivel de experiencia?',
    options: [
      { value: 'principiante', label: 'Principiante', desc: 'Estoy empezando, nunca he tatuado', icon: '01' },
      { value: 'intermedio', label: 'Intermedio', desc: 'Ya tengo algo de práctica', icon: '02' },
      { value: 'profesional', label: 'Profesional', desc: 'Trabajo como tatuador/a', icon: '03' },
    ],
  },
  {
    id: 'tipo_producto',
    question: '¿Qué estás buscando?',
    options: [
      { value: 'kit', label: 'Kit completo', desc: 'Máquina + insumos + todo lo necesario para empezar', icon: 'KIT' },
      { value: 'maquina', label: 'Solo la máquina', desc: 'Ya tengo los insumos, busco actualizar o ampliar mi equipo', icon: 'MAQ' },
    ],
  },
  {
    id: 'style',
    question: '¿Qué estilo de tatuaje practicas?',
    options: [
      { value: 'blackwork', label: 'Blackwork / Tribal', desc: 'Líneas y rellenos en negro', icon: 'BLK' },
      { value: 'realismo', label: 'Realismo / Retrato', desc: 'Alta definición y sombreado', icon: 'REA' },
      { value: 'tradicional', label: 'Tradicional / Old School', desc: 'Colores sólidos y contornos', icon: 'TRA' },
      { value: 'acuarela', label: 'Acuarela / Geométrico', desc: 'Degradados y formas', icon: 'ACU' },
    ],
  },
  {
    id: 'budget',
    question: '¿Cuánto quieres invertir?',
    options: [
      { value: 'bajo', label: 'Básico', desc: 'Menos de $200.000 COP', icon: '$' },
      { value: 'medio', label: 'Intermedio', desc: '$200.000 – $600.000 COP', icon: '$$' },
      { value: 'alto', label: 'Profesional', desc: 'Más de $600.000 COP', icon: '$$$' },
    ],
  },
];

// Qué tipo_uso encaja con cada estilo
const STYLE_TIPO: Record<string, string[]> = {
  blackwork:   ['liner', 'ambos'],
  realismo:    ['shader', 'ambos'],
  tradicional: ['ambos', 'colorear'],
  acuarela:    ['colorear', 'ambos'],
};

// Rango de complejidad_uso ideal por nivel (min, max)
const LEVEL_COMPLEJIDAD: Record<string, [number, number]> = {
  principiante: [1, 2],
  intermedio:   [2, 4],
  profesional:  [4, 5],
};

function scoreProduct(p: Product, answers: Record<string, string>): number {
  let score = 0;
  const { level, budget, style, tipo_producto } = answers;
  const cat = p.category;

  if ((p.inventory ?? 0) <= 0) return -1;

  // ── Excluir Insumos siempre ──────────────────────────────────────────────────
  if (cat === 'Insumos') return 0;

  // ── Filtro duro por tipo de producto elegido ─────────────────────────────────
  if (tipo_producto === 'kit' && cat !== 'Kits') return 0;
  if (tipo_producto === 'maquina' && cat !== 'Máquinas') return 0;

  const sp = salePrice(p);

  // ── Budget filter ────────────────────────────────────────────────────────────
  if (budget === 'bajo' && sp > 200000) return 0;
  if (budget === 'medio' && (sp < 50000 || sp > 600000)) return 0;
  if (budget === 'alto' && sp < 200000) score -= 5;
  if (budget === 'alto' && sp >= 600000) score += 3;
  if (budget === 'medio' && sp >= 200000 && sp <= 400000) score += 2;

  // ── nivel_recomendado ────────────────────────────────────────────────────────
  if (p.nivel_recomendado) {
    if (p.nivel_recomendado === level) score += 12;
    else if (
      (level === 'intermedio' && p.nivel_recomendado === 'principiante') ||
      (level === 'profesional' && p.nivel_recomendado === 'intermedio')
    ) score += 4;
    else score -= 6;
  } else {
    if (level === 'principiante' && cat === 'Kits') score += 6;
    if (level === 'intermedio' && (cat === 'Máquinas' || cat === 'Kits')) score += 5;
    if (level === 'profesional' && cat === 'Máquinas') score += 6;
  }

  // ── complejidad_uso ──────────────────────────────────────────────────────────
  if (p.complejidad_uso) {
    const [min, max] = LEVEL_COMPLEJIDAD[level];
    if (p.complejidad_uso >= min && p.complejidad_uso <= max) score += 8;
    else score -= Math.abs(p.complejidad_uso - ((min + max) / 2)) * 3;
  }

  // ── tipo_uso (solo relevante para máquinas) ──────────────────────────────────
  if (p.tipo_uso && cat === 'Máquinas') {
    const compatibles = STYLE_TIPO[style] ?? [];
    if (compatibles.includes(p.tipo_uso)) score += 8;
    else score -= 4;
  }

  // ── Tag bonus ────────────────────────────────────────────────────────────────
  if (p.tag === 'BESTSELLER') score += 3;
  if (p.tag === 'NUEVO') score += 1;

  return score;
}

export default function CalculadoraPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getSupabase().from('products').select('*').then(({ data }) => setProducts(data ?? []));
  }, []);

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isResults = step === STEPS.length;

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [currentStep.id]: value };
    setAnswers(newAnswers);
    if (isLast) {
      setLoading(true);
      setTimeout(() => {
        const scored = products
          .map((p) => ({ p, score: scoreProduct(p, newAnswers) }))
          .filter(({ score }) => score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 6)
          .map(({ p }) => p);
        setResults(scored);
        setStep(STEPS.length);
        setLoading(false);
      }, 600);
    } else {
      setStep(step + 1);
    }
  };

  const reset = () => { setStep(0); setAnswers({}); setResults([]); };

  const addToCart = (p: Product) => {
    try {
      const stored = localStorage.getItem('ts_cart');
      const cart = stored ? JSON.parse(stored) : [];
      const existing = cart.find((i: Product) => i.id === p.id);
      const updated = existing
        ? cart.map((i: Product & { qty: number }) => i.id === p.id ? { ...i, qty: i.qty + 1 } : i)
        : [...cart, { ...p, qty: 1 }];
      localStorage.setItem('ts_cart', JSON.stringify(updated));
      setAddedIds((prev) => new Set(prev).add(p.id));
      setTimeout(() => setAddedIds((prev) => { const s = new Set(prev); s.delete(p.id); return s; }), 1500);
    } catch {}
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 700, background: 'rgba(18,18,18,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 clamp(20px,5vw,80px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        <Link href="/" style={{ color: accent, textDecoration: 'none', fontFamily: '"Bebas Neue", sans-serif', fontSize: '22px', letterSpacing: '2px' }}>TattooShop Colombia</Link>
        <Link href="/" style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1.5px', textDecoration: 'none', textTransform: 'uppercase' }}>← Tienda</Link>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(40px,6vw,72px) clamp(20px,5vw,40px)' }}>
        {/* Header */}
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: accent, letterSpacing: '3px', marginBottom: '12px', fontWeight: 700 }}>CALCULADORA DE KIT</div>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(36px,5vw,64px)', color: 'var(--text)', margin: '0 0 8px', lineHeight: 0.95 }}>
          ENCUENTRA TU<br /><span style={{ color: accent }}>KIT PERFECTO</span>
        </h1>
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 48px' }}>
          Responde 3 preguntas y te recomendamos los productos ideales para ti.
        </p>

        {/* Progress */}
        {!isResults && (
          <div style={{ display: 'flex', gap: '4px', marginBottom: '40px' }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ flex: 1, height: '3px', background: i <= step ? accent : 'var(--surface)', transition: 'background 0.3s' }} />
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '28px', color: accent, letterSpacing: '2px', marginBottom: '12px' }}>CALCULANDO...</div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text-muted)' }}>Analizando tus respuestas</div>
          </div>
        )}

        {/* Question */}
        {!loading && !isResults && currentStep && (
          <div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '12px' }}>
              PREGUNTA {step + 1} DE {STEPS.length}
            </div>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(24px,3.5vw,40px)', color: 'var(--text)', margin: '0 0 28px', lineHeight: 1.1 }}>
              {currentStep.question}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentStep.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    color: 'var(--text)', padding: '16px 20px', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.2s', width: '100%',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = accent; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,212,0,0.05)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)'; }}
                >
                  <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: accent, letterSpacing: '1px', background: 'rgba(255,212,0,0.1)', border: '1px solid rgba(255,212,0,0.3)', padding: '4px 7px', flexShrink: 0, fontWeight: 700 }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '20px', letterSpacing: '1px', color: 'var(--text)', lineHeight: 1 }}>{opt.label}</div>
                    <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{opt.desc}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', color: accent, fontSize: '18px' }}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && isResults && (
          <div>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(28px,4vw,48px)', color: 'var(--text)', margin: '0 0 8px' }}>
              {answers.tipo_producto === 'kit' ? 'TU KIT' : 'TU MÁQUINA'} <span style={{ color: accent }}>RECOMENDADO</span>
            </h2>
            <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 32px' }}>
              {answers.tipo_producto === 'kit'
                ? 'Kits completos seleccionados según tu nivel, estilo y presupuesto.'
                : 'Máquinas seleccionadas según tu nivel, estilo de trabajo y presupuesto.'}
            </p>

            {results.length === 0 ? (
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text-muted)', padding: '40px 0' }}>
                No encontramos productos exactos para tu presupuesto. <Link href="/#productos" style={{ color: accent }}>Ver todos los productos</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1px', background: 'var(--border)', marginBottom: '32px' }}>
                {results.map((p) => {
                  const sp = salePrice(p);
                  const added = addedIds.has(p.id);
                  return (
                    <div key={p.id} style={{ background: 'var(--surface)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {p.image_url && <img src={p.image_url} alt={p.name} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />}
                      <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1.5px' }}>{p.category.toUpperCase()}</div>
                      <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text)', lineHeight: 1.4 }}>{p.name}</div>
                      <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '20px', color: accent }}>{fmt(sp)}</div>
                      <div style={{ display: 'flex', gap: '4px', marginTop: 'auto' }}>
                        <button onClick={() => addToCart(p)}
                          style={{ flex: 1, background: added ? '#25d366' : accent, color: '#111', border: 'none', fontFamily: '"DM Mono", monospace', fontSize: '10px', letterSpacing: '1px', padding: '8px', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s' }}>
                          {added ? '✓ Agregado' : '+ Carrito'}
                        </button>
                        <Link href={`/productos/${toSlug(p.name)}`}
                          style={{ padding: '8px 10px', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace', fontSize: '10px', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                          Ver
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={reset} style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', fontFamily: '"DM Mono", monospace', fontSize: '12px', letterSpacing: '1.5px', padding: '12px 24px', cursor: 'pointer', textTransform: 'uppercase' }}>
                ↺ Volver a calcular
              </button>
              <Link href="/#productos" style={{ background: accent, color: '#111', fontFamily: '"Bebas Neue", sans-serif', fontSize: '18px', letterSpacing: '1.5px', padding: '12px 28px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                VER TODOS LOS PRODUCTOS
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
