/**
 * Adjacent-tap interpolation math for a digitally stepped attenuator.
 *
 * Two coherent copies of the same audio, programmed Δ dB apart, are mixed:
 *   v = (1 - k) * g(A) + k * g(B)
 * where g(dB) = 10^(-dB/20) and k ∈ [0, 1] is the analog crossfade.
 */

export function linearGainFromAttenuationDb(attenuationDb: number): number {
  return 10 ** (-attenuationDb / 20);
}

export function attenuationDbFromLinearGain(gain: number): number {
  if (gain <= 0) return Infinity;
  return -20 * Math.log10(gain);
}

/** Resulting attenuation of a linear amplitude mix of two taps. */
export function mixedAttenuationDb(
  attADb: number,
  attBDb: number,
  k: number,
): number {
  const gain =
    (1 - k) * linearGainFromAttenuationDb(attADb) +
    k * linearGainFromAttenuationDb(attBDb);
  return attenuationDbFromLinearGain(gain);
}

/**
 * Crossfade k that produces an exact target attenuation between two taps.
 * For a 1 dB step this is only a few percent away from k = fractional dB.
 */
export function kForExactAttenuationDb(
  attADb: number,
  attBDb: number,
  targetDb: number,
): number {
  const ga = linearGainFromAttenuationDb(attADb);
  const gb = linearGainFromAttenuationDb(attBDb);
  const gt = linearGainFromAttenuationDb(targetDb);
  const denom = gb - ga;
  if (Math.abs(denom) < 1e-15) return 0;
  return (gt - ga) / denom;
}

/** Ideal dB-linear interpolation between attA and attA+step. */
export function idealAttenuationDb(
  attADb: number,
  stepDb: number,
  fraction: number,
): number {
  return attADb + fraction * stepDb;
}

export type CrossfadeErrorSample = {
  k: number;
  mixedDb: number;
  idealDb: number;
  errorDb: number;
};

export function sampleLinearCrossfadeError(
  stepDb: number,
  samples = 200,
): CrossfadeErrorSample[] {
  const out: CrossfadeErrorSample[] = [];
  for (let i = 0; i <= samples; i++) {
    const k = i / samples;
    const mixedDb = mixedAttenuationDb(0, stepDb, k);
    const idealDb = idealAttenuationDb(0, stepDb, k);
    out.push({ k, mixedDb, idealDb, errorDb: mixedDb - idealDb });
  }
  return out;
}

export function maxLinearCrossfadeErrorDb(
  stepDb: number,
  samples = 2000,
): { maxAbsErrorDb: number; atK: number; mixedDb: number; idealDb: number } {
  let maxAbsErrorDb = 0;
  let atK = 0;
  let mixedDb = 0;
  let idealDb = 0;
  for (let i = 0; i <= samples; i++) {
    const k = i / samples;
    const mixed = mixedAttenuationDb(0, stepDb, k);
    const ideal = idealAttenuationDb(0, stepDb, k);
    const err = mixed - ideal;
    if (Math.abs(err) > maxAbsErrorDb) {
      maxAbsErrorDb = Math.abs(err);
      atK = k;
      mixedDb = mixed;
      idealDb = ideal;
    }
  }
  return { maxAbsErrorDb, atK, mixedDb, idealDb };
}

/**
 * Residual that the analog interpolator actually processes:
 *   v_out = A + k (B - A)
 * |B - A| / |A| = |10^(-step/20) - 1|
 */
export function differenceResidualRatio(stepDb: number): number {
  return Math.abs(10 ** (-stepDb / 20) - 1);
}

export function differenceResidualDb(stepDb: number): number {
  return 20 * Math.log10(differenceResidualRatio(stepDb));
}
