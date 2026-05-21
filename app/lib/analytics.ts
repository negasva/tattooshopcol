import { Product } from './supabase';

// ─── Shared operational metrics ───────────────────────────────────────────────
export interface OpsMetrics {
  gBruta: number;
  gBrutaPct: number;
  gNeta: number;
  gNetaPct: number;
  costoTotal: number;
  impactoDev: number;
  impactoEnvio: number;
  ratioGNvsGB: number;
  colorGN: string;
  label: string;
}

export function computeOps(
  price: number,
  costo: number,
  cEnvio: number,
  tDevPct: number,
  cDev: number
): OpsMetrics {
  const tDev = tDevPct / 100;
  const gBruta = price - costo;
  const gNeta = gBruta * (1 - tDev) - cEnvio - cDev * tDev;
  const costoTotal = costo + cEnvio;
  const gBrutaPct = price > 0 ? (gBruta / price) * 100 : 0;
  const gNetaPct = price > 0 ? (gNeta / price) * 100 : 0;
  const ratioGNvsGB = gBruta > 0 ? (gNeta / gBruta) * 100 : 0;
  const colorGN = ratioGNvsGB > 60 ? '#25d366' : ratioGNvsGB >= 30 ? '#FFD400' : '#e55';
  const label = ratioGNvsGB > 60 ? 'BUENO' : ratioGNvsGB >= 30 ? 'MEDIO' : 'BAJO';
  return {
    gBruta, gBrutaPct, gNeta, gNetaPct, costoTotal,
    impactoDev: gBruta * tDev + cDev * tDev,
    impactoEnvio: cEnvio,
    ratioGNvsGB, colorGN, label,
  };
}

// ─── Per-product enriched metrics (with CAC) ──────────────────────────────────
export interface ProductMetrics {
  product: Product;
  ops: OpsMetrics;
  unidades: number;
  cac: number | null;
  rentabilidadReal: number | null;
  roi: number | null;
  gananciaAcumulada: number | null;
  puntoEquilibrio: number | null;
  alerta: 'estrella' | 'ok' | 'riesgo' | 'perdida' | 'sin-cac';
}

export function buildProductMetrics(
  product: Product,
  unidades: number,
  cac: number | null,
  metaAds: number | null = null
): ProductMetrics {
  const ops = computeOps(
    product.price,
    product.costo!,
    product.costo_envio ?? 40000,
    product.tasa_devolucion ?? 25,
    product.costo_devolucion ?? 36000
  );

  // rentabilidadReal: informational only — shows what margin would be if Meta Ads were split per unit
  const rentabilidadReal = cac !== null ? ops.gNeta - cac : null;

  // ROI: pure margin — how good is this kit's margin independent of ad spend
  // Formula: (Ganancia Neta / Costo Total) × 100
  const roi = ops.costoTotal > 0 ? (ops.gNeta / ops.costoTotal) * 100 : null;

  // gananciaAcumulada: gross margin earned this month (Meta Ads is a fixed monthly cost, not per-unit)
  // Formula: G. Neta/u × Unidades vendidas
  const gananciaAcumulada = unidades > 0 ? ops.gNeta * unidades : null;

  // puntoEquilibrio: units of THIS kit needed to cover the ENTIRE Meta Ads budget (if only selling this kit)
  // Formula: ceil(Gasto Meta Ads / G. Neta/u)
  // Consistent: selling puntoEquilibrio units gives gNeta × pe ≥ metaAds ✓
  const puntoEquilibrio =
    metaAds !== null && metaAds > 0 && ops.gNeta > 0
      ? Math.ceil(metaAds / ops.gNeta)
      : null;

  // alerta: based on pure margin quality — no Meta Ads data required
  let alerta: ProductMetrics['alerta'] = 'sin-cac';
  if (ops.gNeta < 0) {
    alerta = 'perdida';
  } else if (roi !== null && roi > 100) {
    alerta = 'estrella';
  } else if (roi !== null && roi >= 50) {
    alerta = 'ok';
  } else if (roi !== null) {
    alerta = 'riesgo';
  }

  return { product, ops, unidades, cac, rentabilidadReal, roi, gananciaAcumulada, puntoEquilibrio, alerta };
}

// ─── Simulator ────────────────────────────────────────────────────────────────
export interface SimScenario {
  label: string;
  description: string;
  lines: { productName: string; unidades: number; ganancia: number }[];
  totalUnidades: number;
  totalGanancia: number;
}

// effective margin: always gNeta (Meta Ads is a fixed monthly cost, not per-unit)
export function effectiveMargin(m: ProductMetrics): number {
  return m.ops.gNeta;
}

export function buildSimScenarios(
  metrics: ProductMetrics[],
  targetGain: number
): SimScenario[] {
  const rentables = metrics.filter((m) => effectiveMargin(m) > 0);
  if (rentables.length === 0 || targetGain <= 0) return [];

  const scenarios: SimScenario[] = [];

  // Scenario 1: Best margin kit only
  const best = [...rentables].sort((a, b) => effectiveMargin(b) - effectiveMargin(a))[0];
  const n1 = Math.ceil(targetGain / effectiveMargin(best));
  scenarios.push({
    label: 'Kit estrella',
    description: `Solo vendiendo ${best.product.name}`,
    lines: [{ productName: best.product.name, unidades: n1, ganancia: n1 * effectiveMargin(best) }],
    totalUnidades: n1,
    totalGanancia: n1 * effectiveMargin(best),
  });

  // Scenario 2: Equal mix across all profitable products
  if (rentables.length > 1) {
    const sumRent = rentables.reduce((s, m) => s + effectiveMargin(m), 0);
    const nEach = Math.ceil(targetGain / sumRent);
    scenarios.push({
      label: 'Mix equitativo',
      description: `${nEach} unidades de cada kit`,
      lines: rentables.map((m) => ({
        productName: m.product.name,
        unidades: nEach,
        ganancia: nEach * effectiveMargin(m),
      })),
      totalUnidades: nEach * rentables.length,
      totalGanancia: nEach * sumRent,
    });
  }

  // Scenario 3: Weighted by margin
  if (rentables.length > 1) {
    const totalM = rentables.reduce((s, m) => s + effectiveMargin(m), 0);
    const weightedAvg = totalM / rentables.length;
    const totalN = weightedAvg > 0 ? Math.ceil(targetGain / weightedAvg) : 0;
    const lines = rentables.map((m) => {
      const w = effectiveMargin(m) / totalM;
      const n = Math.max(1, Math.round(w * totalN));
      return { productName: m.product.name, unidades: n, ganancia: n * effectiveMargin(m) };
    });
    scenarios.push({
      label: 'Mix por margen',
      description: 'Ponderado según ganancia neta de cada kit',
      lines,
      totalUnidades: lines.reduce((s, l) => s + l.unidades, 0),
      totalGanancia: lines.reduce((s, l) => s + l.ganancia, 0),
    });
  }

  return scenarios;
}

// ─── Month helpers ────────────────────────────────────────────────────────────
export function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthOptions(count = 6): { key: string; label: string }[] {
  const opts = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    opts.push({ key, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return opts;
}

export const COP = (n: number) => `$${Math.round(n).toLocaleString('es-CO')}`;
