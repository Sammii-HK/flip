// Two-proportion z-test for A/B testing
export interface VariantStats {
  key: string;
  name: string;
  exposures: number;
  conversions: number;
  rate: number;
  lift: number | null;
  liftPercent: number | null;
  confidence: number | null;
  significant: boolean;
  confidenceInterval: [number, number];
}

export interface ExperimentStats {
  variants: VariantStats[];
  totalExposures: number;
  totalConversions: number;
  hasWinner: boolean;
  winnerKey: string | null;
}

// Standard normal CDF approximation (Abramowitz & Stegun)
function normalCdf(z: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  z = Math.abs(z) / Math.SQRT2;

  const t = 1.0 / (1.0 + p * z);
  const y =
    1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

  return 0.5 * (1.0 + sign * y);
}

function zTest(
  conversionsA: number,
  exposuresA: number,
  conversionsB: number,
  exposuresB: number
): { zScore: number; pValue: number; confidence: number } {
  const pA = exposuresA > 0 ? conversionsA / exposuresA : 0;
  const pB = exposuresB > 0 ? conversionsB / exposuresB : 0;
  const pPooled =
    exposuresA + exposuresB > 0
      ? (conversionsA + conversionsB) / (exposuresA + exposuresB)
      : 0;

  const se = Math.sqrt(
    pPooled * (1 - pPooled) * (1 / (exposuresA || 1) + 1 / (exposuresB || 1))
  );

  if (se === 0) return { zScore: 0, pValue: 1, confidence: 0 };

  const zScore = (pB - pA) / se;
  const pValue = 2 * (1 - normalCdf(Math.abs(zScore)));
  const confidence = (1 - pValue) * 100;

  return { zScore, pValue, confidence };
}

function wilsonInterval(
  conversions: number,
  exposures: number,
  z: number = 1.96
): [number, number] {
  if (exposures === 0) return [0, 0];
  const p = conversions / exposures;
  const n = exposures;
  const denominator = 1 + (z * z) / n;
  const centre = p + (z * z) / (2 * n);
  const margin = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);

  return [
    Math.max(0, (centre - margin) / denominator),
    Math.min(1, (centre + margin) / denominator),
  ];
}

export function computeStats(
  variants: {
    key: string;
    name: string;
    exposures: number;
    conversions: number;
  }[]
): ExperimentStats {
  const control = variants[0];
  const controlRate = control.exposures > 0 ? control.conversions / control.exposures : 0;

  const computed: VariantStats[] = variants.map((v, i) => {
    const rate = v.exposures > 0 ? v.conversions / v.exposures : 0;
    const ci = wilsonInterval(v.conversions, v.exposures);

    if (i === 0) {
      return {
        ...v,
        rate,
        lift: null,
        liftPercent: null,
        confidence: null,
        significant: false,
        confidenceInterval: ci,
      };
    }

    const { confidence } = zTest(
      control.conversions,
      control.exposures,
      v.conversions,
      v.exposures
    );

    const lift = rate - controlRate;
    const liftPercent = controlRate > 0 ? (lift / controlRate) * 100 : null;

    return {
      ...v,
      rate,
      lift,
      liftPercent,
      confidence,
      significant: confidence >= 95,
      confidenceInterval: ci,
    };
  });

  const winner = computed.find((v) => v.significant && (v.lift ?? 0) > 0);

  return {
    variants: computed,
    totalExposures: variants.reduce((s, v) => s + v.exposures, 0),
    totalConversions: variants.reduce((s, v) => s + v.conversions, 0),
    hasWinner: !!winner,
    winnerKey: winner?.key ?? null,
  };
}
