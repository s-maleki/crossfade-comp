/**
 * Bench calibration for PT2257 GERR and CERR.
 *
 * The datasheet lists both as 0.5 dB typical, with no min, max, or test
 * condition. Leapfrog never clicks on that error — the live tap is the same
 * physical channel across an integer boundary — but the crossfade span becomes
 * B(n+1) − A(n) or A(n+1) − B(n) instead of 1.00 dB. The analog 100 mV/dB law
 * then walks the wrong slope.
 *
 * Each code is an average of repeated meter readings, referenced to VA at
 * code 0, the tap that is live at 0 dB GR, so a static level offset between
 * the channels stays in the B column. Referencing B to its own code 0 would
 * hide that offset and the odd anchors would be wrong. Insertion loss that is
 * common to both channels is never in the table; makeup absorbs it.
 *
 * Stored error at code c is att(c) − c, where att is dB down from VA(0).
 * Runtime anchors alternate channels. If the next code on the idle channel
 * does not rise, it is skipped and the crossfade spans the following code
 * (nominally 2 dB). k is the exact amplitude inverse between those measured
 * taps, not a linear fraction of the command.
 */

import {
  kForExactAttenuationDb,
  mixedAttenuationDb,
} from "./interpolation";

/** Codes 0..41: 0–40 dB of GR plus the far tap of the last interval. */
export const CAL_CODE_COUNT = 42;
export const CAL_LAST_CODE = 41;
export const CAL_MAX_GR_DB = 40;

export type Channel = "A" | "B";

export type LadderErrors = {
  /** attA(c) − c, dB down from VA at code 0. errA[0] is 0 if VA(0) is the reference. */
  errA: readonly number[];
  /** attB(c) − c, dB down from the same VA(0). errB[0] is the open-tap channel offset. */
  errB: readonly number[];
};

/**
 * Attenuation of one tap relative to VA at code 0.
 * A constant shift of errA[0] cancels, so commanded 0 dB stays on the open A tap.
 */
export function relativeAttenuationDb(
  ladder: LadderErrors,
  channel: Channel,
  code: number,
): number {
  const err = channel === "A" ? ladder.errA[code] : ladder.errB[code];
  if (err === undefined || ladder.errA[0] === undefined) {
    throw new Error(`missing ladder entry ${channel}[${code}]`);
  }
  return code + err - ladder.errA[0];
}

export type CalSegment = {
  nearChannel: Channel;
  nearCode: number;
  farChannel: Channel;
  farCode: number;
  /** Relative dB at kFar = 0. */
  nearDb: number;
  /** Relative dB at kFar = 1. */
  farDb: number;
};

/**
 * Walk the alternating anchors. The idle channel is programmed to the next
 * code that is strictly more attenuated than the live tap. A code that does
 * not rise is dropped; the span then lands on a later code of that same
 * idle channel, so the two ends stay on opposite pins.
 */
export function buildCalSegments(
  ladder: LadderErrors,
  maxCode = CAL_LAST_CODE,
  maxGrDb = CAL_MAX_GR_DB,
): CalSegment[] {
  const segments: CalSegment[] = [];
  let nearChannel: Channel = "A";
  let nearCode = 0;
  let nearDb = 0;

  for (let guard = 0; guard <= maxCode; guard++) {
    const farChannel: Channel = nearChannel === "A" ? "B" : "A";
    let farCode = -1;
    let farDb = 0;
    for (let code = nearCode + 1; code <= maxCode; code++) {
      const db = relativeAttenuationDb(ladder, farChannel, code);
      if (db > nearDb) {
        farCode = code;
        farDb = db;
        break;
      }
    }
    if (farCode < 0) break;
    segments.push({
      nearChannel,
      nearCode,
      farChannel,
      farCode,
      nearDb,
      farDb,
    });
    if (farDb >= maxGrDb) break;
    nearChannel = farChannel;
    nearCode = farCode;
    nearDb = farDb;
  }
  return segments;
}

export function programmedCodes(segment: CalSegment): { attA: number; attB: number } {
  return {
    attA: segment.nearChannel === "A" ? segment.nearCode : segment.farCode,
    attB: segment.nearChannel === "B" ? segment.nearCode : segment.farCode,
  };
}

export type CalState = {
  segment: CalSegment;
  /** Weight of the far tap. 0 on the near tap, 1 on the far tap. */
  kFar: number;
  /** Weight of channel B in v = (1−k)·A + k·B. This is the PWM duty. */
  kB: number;
  commandedDb: number;
  /** Attenuation the exact mix is aimed at, after end clamps. */
  targetDb: number;
};

export function calibrationAt(
  ladder: LadderErrors,
  commandedDb: number,
  segments?: readonly CalSegment[],
): CalState {
  const segs = segments ?? buildCalSegments(ladder);
  if (segs.length === 0) {
    throw new Error("ladder has no rising span");
  }
  const g = Math.min(Math.max(commandedDb, 0), CAL_MAX_GR_DB);
  let segment = segs[segs.length - 1];
  for (let i = 0; i < segs.length; i++) {
    if (g < segs[i].farDb || i === segs.length - 1) {
      segment = segs[i];
      break;
    }
  }
  const targetDb = Math.min(Math.max(g, segment.nearDb), segment.farDb);
  const kFarRaw = kForExactAttenuationDb(segment.nearDb, segment.farDb, targetDb);
  const kFar = Math.min(1, Math.max(0, kFarRaw));
  const kB = segment.farChannel === "B" ? kFar : 1 - kFar;
  return { segment, kFar, kB, commandedDb: g, targetDb };
}

/** Attenuation the calibrated map actually produces, relative to VA(0). */
export function correctedAttenuationDb(
  ladder: LadderErrors,
  commandedDb: number,
  segments?: readonly CalSegment[],
): number {
  const state = calibrationAt(ladder, commandedDb, segments);
  const codes = programmedCodes(state.segment);
  return mixedAttenuationDb(
    relativeAttenuationDb(ladder, "A", codes.attA),
    relativeAttenuationDb(ladder, "B", codes.attB),
    state.kB,
  );
}

/**
 * What the uncalibrated firmware does: integer leapfrog, k = fractional dB,
 * taps assumed to be exactly the programmed codes. The real ladder is used
 * only when scoring the mix.
 */
export function uncorrectedAttenuationDb(
  ladder: LadderErrors,
  commandedDb: number,
): number {
  const g = Math.min(Math.max(commandedDb, 0), CAL_MAX_GR_DB);
  let n = Math.floor(g + 1e-12);
  if (n > CAL_MAX_GR_DB) n = CAL_MAX_GR_DB;
  const fraction = n >= CAL_MAX_GR_DB ? 0 : g - n;
  if ((n & 1) === 0) {
    return mixedAttenuationDb(
      relativeAttenuationDb(ladder, "A", n),
      relativeAttenuationDb(ladder, "B", n + 1),
      fraction,
    );
  }
  return mixedAttenuationDb(
    relativeAttenuationDb(ladder, "A", n + 1),
    relativeAttenuationDb(ladder, "B", n),
    1 - fraction,
  );
}

export type LawErrorSample = {
  commandedDb: number;
  uncorrectedErrorDb: number;
  correctedErrorDb: number;
};

export function sampleCalibrationLaw(
  ladder: LadderErrors,
  steps = 400,
): LawErrorSample[] {
  const segments = buildCalSegments(ladder);
  const out: LawErrorSample[] = [];
  for (let i = 0; i <= steps; i++) {
    const commandedDb = (CAL_MAX_GR_DB * i) / steps;
    out.push({
      commandedDb,
      uncorrectedErrorDb: uncorrectedAttenuationDb(ladder, commandedDb) - commandedDb,
      correctedErrorDb:
        correctedAttenuationDb(ladder, commandedDb, segments) - commandedDb,
    });
  }
  return out;
}

export function peakLawErrors(
  ladder: LadderErrors,
  steps = 4000,
): {
  uncorrectedAbsDb: number;
  correctedAbsDb: number;
  atUncorrectedDb: number;
  atCorrectedDb: number;
} {
  const segments = buildCalSegments(ladder);
  let uncorrectedAbsDb = 0;
  let correctedAbsDb = 0;
  let atUncorrectedDb = 0;
  let atCorrectedDb = 0;
  for (let i = 0; i <= steps; i++) {
    const g = (CAL_MAX_GR_DB * i) / steps;
    const u = uncorrectedAttenuationDb(ladder, g) - g;
    const c = correctedAttenuationDb(ladder, g, segments) - g;
    if (Math.abs(u) > uncorrectedAbsDb) {
      uncorrectedAbsDb = Math.abs(u);
      atUncorrectedDb = g;
    }
    if (Math.abs(c) > correctedAbsDb) {
      correctedAbsDb = Math.abs(c);
      atCorrectedDb = g;
    }
  }
  return { uncorrectedAbsDb, correctedAbsDb, atUncorrectedDb, atCorrectedDb };
}

/** Both channels ideal. errA[0] and errB[0] are 0. */
export function zeroLadder(codes = CAL_CODE_COUNT): LadderErrors {
  return {
    errA: Array.from({ length: codes }, () => 0),
    errB: Array.from({ length: codes }, () => 0),
  };
}

/**
 * Channel B is `offsetDb` more attenuated than its code, at every code,
 * relative to VA(0). That is a flat CERR. A is ideal, so errA[0] stays 0.
 */
export function channelOffsetLadder(
  offsetDb: number,
  codes = CAL_CODE_COUNT,
): LadderErrors {
  return {
    errA: Array.from({ length: codes }, () => 0),
    errB: Array.from({ length: codes }, () => offsetDb),
  };
}

/**
 * Both ladders share a step pattern of 0.5 dB, then 1.5 dB, repeating.
 * CERR is zero. This is a pure joint-step error at the datasheet typical.
 */
export function alternatingStepLadder(codes = CAL_CODE_COUNT): LadderErrors {
  const err = Array.from({ length: codes }, (_, code) => {
    let att = 0;
    for (let c = 1; c <= code; c++) {
      att += c % 2 === 1 ? 0.5 : 1.5;
    }
    return att - code;
  });
  return { errA: err, errB: [...err] };
}

/**
 * First B step lands on top of A(0) when the two ±0.5 dB extremes stack.
 * relB(1) = 1 + (−0.5) − 0.5 = 0, so the map must skip to B(2).
 */
export function stackedEndpointLadder(codes = CAL_CODE_COUNT): LadderErrors {
  const errA = Array.from({ length: codes }, () => 0);
  const errB = Array.from({ length: codes }, () => 0);
  errA[0] = 0.5;
  errB[1] = -0.5;
  return { errA, errB };
}

/**
 * Host-side conversion. vRef is VA at code 0. Both arrays are the same length
 * as the code list, in RMS volts.
 */
export function ladderErrorsFromRms(
  voltsA: readonly number[],
  voltsB: readonly number[],
  vRef: number,
): LadderErrors {
  if (vRef <= 0) throw new Error("vRef must be positive");
  const toErr = (volts: readonly number[]) =>
    volts.map((v, code) => {
      if (v <= 0) throw new Error(`non-positive RMS at code ${code}`);
      const att = -20 * Math.log10(v / vRef);
      return att - code;
    });
  return { errA: toErr(voltsA), errB: toErr(voltsB) };
}

/**
 * How many meter readings to average at one code.
 * Shallow taps are tens to hundreds of millivolts at the 200 mV bench level.
 * From code 25 the output is a few millivolts, so the meter — not the ladder —
 * is the noise. A fixed override replaces the schedule for the whole pass.
 */
export const METER_SAMPLE_CAP = 32;

export function samplesForCode(code: number, fixedCount?: number): number {
  if (fixedCount !== undefined) {
    if (fixedCount < 1 || fixedCount > METER_SAMPLE_CAP) {
      throw new Error(`sample count ${fixedCount} is outside 1..${METER_SAMPLE_CAP}`);
    }
    return fixedCount;
  }
  if (code < 0 || code > CAL_LAST_CODE) throw new Error(`code ${code} out of range`);
  if (code <= 15) return 8;
  if (code <= 24) return 16;
  return 32;
}

export type MeterAverage = {
  /** Mean of the sample voltages. att is computed from this, not from the mean of the dB values. */
  meanVolts: number;
  attDb: number;
  /** Population stddev of the per-sample attenuations, dB. */
  stdDb: number;
  /** Per-sample attenuation minus the mean of those attenuations, dB. */
  minOffsetDb: number;
  maxOffsetDb: number;
  peakToPeakDb: number;
};

/**
 * Average the volt readings first, then convert. Averaging decibels would bias
 * the estimate toward the quieter samples.
 */
export function averageMeterSamples(
  volts: readonly number[],
  vRef: number,
): MeterAverage {
  if (volts.length === 0) throw new Error("no samples");
  if (vRef <= 0) throw new Error("vRef must be positive");
  let sum = 0;
  for (const v of volts) {
    if (!(v > 0)) throw new Error("non-positive sample");
    sum += v;
  }
  const meanVolts = sum / volts.length;
  const attDb = -20 * Math.log10(meanVolts / vRef);
  const atts = volts.map((v) => -20 * Math.log10(v / vRef));
  const meanAtt = atts.reduce((a, b) => a + b, 0) / atts.length;
  let acc = 0;
  let minAtt = Infinity;
  let maxAtt = -Infinity;
  for (const att of atts) {
    const d = att - meanAtt;
    acc += d * d;
    if (att < minAtt) minAtt = att;
    if (att > maxAtt) maxAtt = att;
  }
  return {
    meanVolts,
    attDb,
    stdDb: Math.sqrt(acc / atts.length),
    minOffsetDb: minAtt - meanAtt,
    maxOffsetDb: maxAtt - meanAtt,
    peakToPeakDb: maxAtt - minAtt,
  };
}

/**
 * Peak-to-peak gate on the raw samples, before the mean is trusted.
 * 0–15 dB: the signal is large, so anything over 0.05 dB is a connection.
 * 16–24 dB: 0.10 dB.
 * 25–41 dB: 0.20 dB. Thirty-two samples then put the standard error near
 * 0.20/sqrt(32) ≈ 0.035 dB, inside the 0.05 dB law budget. Wider than that,
 * the mean is the noise.
 */
export function meterSpreadLimitDb(code: number): number {
  if (code <= 15) return 0.05;
  if (code <= 24) return 0.1;
  return 0.2;
}

export function meterSpreadIsNoisy(code: number, peakToPeakDb: number): boolean {
  return peakToPeakDb > meterSpreadLimitDb(code);
}

/**
 * A spot-check delta larger than this is a real frequency or level dependence.
 * 0.05 dB is the measurement budget itself (meter plus the ~0.04 dB A2 step),
 * so a 0.05 dB gate would flag scatter. 0.10 dB is twice that floor, still
 * far under the 0.5 dB GERR/CERR the table removes, and above the 0.057 dB
 * mix residual of a skipped 2 dB span. A flag means the single-condition
 * table, not the interpolator, is the error. The spot reading is not stored.
 */
export const SPOT_TOLERANCE_DB = 0.1;

export function spotCheckDelta(
  tableErrDb: number,
  spotErrDb: number,
): { deltaDb: number; withinTolerance: boolean } {
  const deltaDb = spotErrDb - tableErrDb;
  return {
    deltaDb,
    withinTolerance: Math.abs(deltaDb) <= SPOT_TOLERANCE_DB,
  };
}
