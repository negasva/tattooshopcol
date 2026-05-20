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
  cac: number | null
): ProductMetrics {
  const ops = computeOps(
    product.price,
    product.costo!,
    product.costo_envio ?? 40000,
    product.tasa_devolucion ?? 25,
    product.costo_devolucion ?? 36000
  );

  const rentabilidadReal = cac !== null ? ops.gNeta - cac : null;
  const roi =
    rentabilidadReal !== null && ops.costoTotal > 0
      ? (rentabilidadReal / ops.costoTotal) * 100
      : null;
  const gananciaAcumulada =
    unidades > 0 && rentabilidadReal !== null ? rentabilidadReal * unidades : null;
  const puntoEquilibrio =
    cac !== null && ops.gNeta > 0 ? Math.ceil(cac / ops.gNeta) : null;

  let alerta: ProductMetrics['alerta'] = 'sin-cac';
  if (cac !== null) {
    if (roi !== null && roi > 100) alerta = 'estrella';
    else if (rentabilidadReal !== null && rentabilidadReal < 0) alerta = 'perdida';
    else if (rentabilidadReal !== null && rentabilidadReal < ops.gNeta * 0.3) alerta = 'riesgo';
    else alerta = 'ok';
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

export function buildSimScenarios(
  metrics: ProductMetrics[],
  targetGain: number
): SimScenario[] {
  const rentables = metrics.filter(
    (m) => m.rentabilidadReal !== null && m.rentabilidadReal > 0
  );
  if (rentables.length === 0 || targetGain <= 0) return [];

  const scenarios: SimScenario[] = [];

  // Scenario 1: Best ROI kit only
  const best = [...rentables].sort((a, b) => (b.roi ?? 0) - (a.roi ?? 0))[0];
  const n1 = Math.ceil(targetGain / best.rentabilidadReal!);
  scenarios.push({
    label: 'Kit estrella',
    description: `Solo vendiendo ${best.product.name}`,
    lines: [{ productName: best.product.name, unidades: n1, ganancia: n1 * best.rentabilidadReal! }],
    totalUnidades: n1,
    totalGanancia: n1 * best.rentabilidadReal!,
  });

  // Scenario 2: Equal mix across all profitable products
  if (rentables.length > 1) {
    const sumRent = rentables.reduce((s, m) => s + m.rentabilidadReal!, 0);
    const nEach = Math.ceil(targetGain / sumRent);
    scenarios.push({
      label: 'Mix equitativo',
      description: `${nEach} unidades de cada kit`,
      lines: rentables.map((m) => ({
        productName: m.product.name,
        unidades: nEach,
        ganancia: nEach * m.rentabilidadReal!,
      })),
      totalUnidades: nEach * rentables.length,
      totalGanancia: nEach * sumRent,
    });
  }

  // Scenario 3: Weighted by ROI
  if (rentables.length > 1) {
    const totalROI = rentables.reduce((s, m) => s + (m.roi ?? 0), 0);
    const weightedAvgRent = rentables.reduce(
      (s, m) => s + ((m.roi ?? 0) / totalROI) * m.rentabilidadReal!,
      0
    );
    const totalN = weightedAvgRent > 0 ? Math.ceil(targetGain / weightedAvgRent) : 0;
    const lines = rentables.map((m) => {
      const n = Math.ceil(((m.roi ?? 0) / totalROI) * totalN);
      return { productName: m.product.name, unidades: n, ganancia: n * m.rentabilidadReal! };
    });
    scenarios.push({
      label: 'Mix por ROI',
      description: 'Ponderado según rentabilidad de cada kit',
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
