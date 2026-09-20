/**
 * Feed-forward compressor control law in the log (dB) domain.
 *
 * Level L (dB) is measured from the envelope after a log converter.
 * For L > threshold T:
 *   GR = (1 - 1/R) * (L - T)
 * clamped to [0, maxGR].
 */

export type CompressorParams = {
  thresholdDb: number;
  ratio: number;
  maxGrDb: number;
  makeupDb: number;
};

export function gainReductionDb(
  levelDb: number,
  thresholdDb: number,
  ratio: number,
  maxGrDb: number,
): number {
  if (ratio <= 1) return 0;
  const excess = levelDb - thresholdDb;
  if (excess <= 0) return 0;
  const gr = (1 - 1 / ratio) * excess;
  return Math.min(Math.max(gr, 0), maxGrDb);
}

export function outputLevelDb(
  levelDb: number,
  params: CompressorParams,
): number {
  return (
    levelDb -
    gainReductionDb(
      levelDb,
      params.thresholdDb,
      params.ratio,
      params.maxGrDb,
    ) +
    params.makeupDb
  );
}

export function ratioFromMix(mix: number): number {
  const k = Math.min(Math.max(mix, 0), 0.999);
  return 1 / (1 - k);
}

export function mixFromRatio(ratio: number): number {
  if (ratio <= 1) return 0;
  return 1 - 1 / ratio;
}

/** Convert a linear envelope voltage to dB relative to vRef. */
export function envelopeVoltageToDb(voltage: number, vRef: number): number {
  if (voltage <= 0 || vRef <= 0) return -Infinity;
  return 20 * Math.log10(voltage / vRef);
}

/** 100 mV/dB analog bus used throughout the analog control path. */
export const VOLTS_PER_DB = 0.1;

export function grVoltageFromDb(grDb: number): number {
  return grDb * VOLTS_PER_DB;
}

export function grDbFromVoltage(volts: number): number {
  return volts / VOLTS_PER_DB;
}

export type TransferPoint = {
  inputDb: number;
  outputDb: number;
  grDb: number;
};

export function compressorCurve(
  params: CompressorParams,
  fromDb = -40,
  toDb = 12,
  step = 0.25,
): TransferPoint[] {
  const points: TransferPoint[] = [];
  for (let inputDb = fromDb; inputDb <= toDb + 1e-9; inputDb += step) {
    const grDb = gainReductionDb(
      inputDb,
      params.thresholdDb,
      params.ratio,
      params.maxGrDb,
    );
    points.push({
      inputDb,
      outputDb: inputDb - grDb + params.makeupDb,
      grDb,
    });
  }
  return points;
}
