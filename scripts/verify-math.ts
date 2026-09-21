import {
  alternatingStepLadder,
  averageMeterSamples,
  buildCalSegments,
  calibrationAt,
  channelOffsetLadder,
  type LadderErrors,
  ladderErrorsFromRms,
  meterSpreadIsNoisy,
  meterSpreadLimitDb,
  peakLawErrors,
  programmedCodes,
  samplesForCode,
  SPOT_TOLERANCE_DB,
  spotCheckDelta,
  stackedEndpointLadder,
  uncorrectedAttenuationDb,
  zeroLadder,
} from "../src/lib/calibration";
import {
  differenceResidualRatio,
  kForExactAttenuationDb,
  maxLinearCrossfadeErrorDb,
  mixedAttenuationDb,
} from "../src/lib/interpolation";
import { gainReductionDb, mixFromRatio, ratioFromMix } from "../src/lib/compressor";
import { leapfrogFromGainReduction } from "../src/lib/leapfrog";
import { feedthroughTick, residualTick, trimCapFarads } from "../src/lib/cgd";

function assert(cond: boolean, message: string) {
  if (!cond) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

function almost(a: number, b: number, eps = 1e-6) {
  return Math.abs(a - b) <= eps;
}

const mix10_11_0 = mixedAttenuationDb(10, 11, 0);
const mix10_11_1 = mixedAttenuationDb(10, 11, 1);
const mix10_11_half = mixedAttenuationDb(10, 11, 0.5);

assert(almost(mix10_11_0, 10, 1e-9), `k=0 should be 10 dB, got ${mix10_11_0}`);
assert(almost(mix10_11_1, 11, 1e-9), `k=1 should be 11 dB, got ${mix10_11_1}`);
assert(
  mix10_11_half > 10.48 && mix10_11_half < 10.49,
  `linear mid mix should be ~10.486 dB, got ${mix10_11_half}`,
);

const err1 = maxLinearCrossfadeErrorDb(1);
assert(
  err1.maxAbsErrorDb > 0.014 && err1.maxAbsErrorDb < 0.015,
  `1 dB linear-mix error should be ~0.0143 dB, got ${err1.maxAbsErrorDb}`,
);

const err6 = maxLinearCrossfadeErrorDb(6);
assert(
  err6.maxAbsErrorDb > 0.5 && err6.maxAbsErrorDb < 0.52,
  `6 dB linear-mix error should be ~0.51 dB, got ${err6.maxAbsErrorDb}`,
);

const kExact = kForExactAttenuationDb(10, 11, 10.5);
assert(
  kExact > 0.514 && kExact < 0.515,
  `exact k for +0.5 dB should be ~0.5144, got ${kExact}`,
);

const residual = differenceResidualRatio(1);
assert(
  residual > 0.108 && residual < 0.109,
  `1 dB residual ratio should be ~0.1087, got ${residual}`,
);

assert(almost(gainReductionDb(-18, -12, 4, 40), 0), "below threshold GR is 0");
assert(
  almost(gainReductionDb(0, -12, 4, 40), 9),
  "4:1, 12 dB excess → 9 dB GR",
);
assert(almost(gainReductionDb(20, 0, 100, 10), 10), "max GR clamp");
assert(almost(mixFromRatio(4), 0.75), "4:1 mix is 0.75");
assert(almost(ratioFromMix(0.75), 4), "mix 0.75 is 4:1");

const even = leapfrogFromGainReduction(10.25, 1);
assert(even.attA === 10 && even.attB === 11, "even pair 10/11");
assert(almost(even.k, 0.25), `even k should be 0.25, got ${even.k}`);

const odd = leapfrogFromGainReduction(11.25, 1);
assert(odd.attA === 12 && odd.attB === 11, "odd pair 12/11");
assert(almost(odd.k, 0.75), `odd k should be 0.75, got ${odd.k}`);

const boundary = leapfrogFromGainReduction(11, 1);
assert(boundary.attB === 11, "at 11 dB the live tap is 11");
assert(almost(boundary.k, 1) || almost(boundary.k, 0), "boundary fully on one tap");

const tick = feedthroughTick(4e-12, 3.5, 250e-6, 22_000, 0.1);
assert(
  tick.tickV > 1.2e-3 && tick.tickV < 1.25e-3,
  `4 pF / 3.5 V / 0.25 ms into 22k should be ~1.23 mV, got ${tick.tickV}`,
);
assert(
  tick.tickDbfs > -42 && tick.tickDbfs < -40,
  `uncancelled tick should be ~−41 dB on 100 mVrms, got ${tick.tickDbfs}`,
);

assert(
  almost(trimCapFarads(4e-12, 3.5, 3.5), 4e-12),
  "unity invert → Ctrim = Cgd",
);
assert(
  almost(trimCapFarads(4e-12, 3.5, 5), 4e-12 * (3.5 / 5)),
  "driving Ctrim from 5 V Vk would scale Ctrim by |Vp|/5",
);

const leftover = residualTick(0.5e-12, 3.5, 250e-6, 22_000, 0.1);
assert(
  leftover.tickV > 0.15e-3 && leftover.tickV < 0.16e-3,
  `0.5 pF leftover should be ~0.154 mV, got ${leftover.tickV}`,
);

const err2 = maxLinearCrossfadeErrorDb(2);
assert(
  err2.maxAbsErrorDb < 0.06,
  `2 dB linear-mix error should stay under 0.06 dB, got ${err2.maxAbsErrorDb}`,
);

const idealLaw = peakLawErrors(zeroLadder());
assert(
  idealLaw.uncorrectedAbsDb > 0.01 && idealLaw.uncorrectedAbsDb < 0.02,
  `ideal ladder uncorrected error should be the 0.014 dB mix residual, got ${idealLaw.uncorrectedAbsDb}`,
);
assert(
  idealLaw.correctedAbsDb < 1e-6,
  `ideal ladder corrected error should be numerical noise, got ${idealLaw.correctedAbsDb}`,
);

const cerr = channelOffsetLadder(0.5);
const cerrLaw = peakLawErrors(cerr);
assert(
  cerrLaw.uncorrectedAbsDb > 0.4 && cerrLaw.uncorrectedAbsDb < 0.6,
  `0.5 dB CERR should leave several tenths uncorrected, got ${cerrLaw.uncorrectedAbsDb}`,
);
assert(
  cerrLaw.correctedAbsDb < 1e-6,
  `0.5 dB CERR should calibrate out, got ${cerrLaw.correctedAbsDb}`,
);

const gerrLaw = peakLawErrors(alternatingStepLadder());
assert(
  gerrLaw.uncorrectedAbsDb > 0.4,
  `alternating 0.5/1.5 dB steps should leave several tenths uncorrected, got ${gerrLaw.uncorrectedAbsDb}`,
);
assert(
  gerrLaw.correctedAbsDb < 1e-6,
  `alternating step error should calibrate out, got ${gerrLaw.correctedAbsDb}`,
);

const stacked = stackedEndpointLadder();
const stackedSegs = buildCalSegments(stacked);
assert(
  stackedSegs[0].farChannel === "B" && stackedSegs[0].farCode === 2,
  `stacked ±0.5 dB endpoints should skip B(1) for B(2), got ${stackedSegs[0].farChannel}${stackedSegs[0].farCode}`,
);
const stackedLaw = peakLawErrors(stacked);
assert(
  stackedLaw.correctedAbsDb < 1e-6,
  `skipped step should still track commanded GR, got ${stackedLaw.correctedAbsDb}`,
);
assert(
  Math.abs(uncorrectedAttenuationDb(stacked, 0.5) - 0.5) > 0.2,
  "uncorrected map should miss the skipped step",
);

const at10 = calibrationAt(zeroLadder(), 10.25);
const codes10 = programmedCodes(at10.segment);
assert(codes10.attA === 10 && codes10.attB === 11, "calibrated even pair stays 10/11");
assert(at10.kB > 0.24 && at10.kB < 0.27, `even calibrated kB ~0.25, got ${at10.kB}`);

const at11 = calibrationAt(zeroLadder(), 11.25);
const codes11 = programmedCodes(at11.segment);
assert(codes11.attA === 12 && codes11.attB === 11, "calibrated odd pair stays 12/11");
assert(at11.kB > 0.73 && at11.kB < 0.76, `odd calibrated kB ~0.75, got ${at11.kB}`);

const vRef = 0.2;
const voltsA = Array.from({ length: 42 }, (_, code) => vRef * 10 ** (-code / 20));
const voltsB = Array.from(
  { length: 42 },
  (_, code) => vRef * 10 ** (-(code + 0.5) / 20),
);
const fromRms = ladderErrorsFromRms(voltsA, voltsB, vRef);
assert(almost(fromRms.errA[0], 0), "VA(0) reference forces errA[0] = 0");
assert(almost(fromRms.errB[0], 0.5), `open-tap CERR should stay in errB[0], got ${fromRms.errB[0]}`);
assert(
  almost(fromRms.errA[20], 0) && almost(fromRms.errB[20], 0.5),
  "RMS conversion keeps a flat channel offset",
);

assert(samplesForCode(0) === 8 && samplesForCode(15) === 8, "shallow codes average 8");
assert(samplesForCode(16) === 16 && samplesForCode(24) === 16, "mid codes average 16");
assert(samplesForCode(25) === 32 && samplesForCode(41) === 32, "deep codes average 32");
assert(samplesForCode(40, 16) === 16, "fixed sample count overrides depth");

const quiet = averageMeterSamples([0.2, 0.2, 0.2, 0.2], 0.2);
assert(almost(quiet.attDb, 0) && almost(quiet.stdDb, 0), "identical samples average to 0 dB");
assert(!meterSpreadIsNoisy(0, quiet.peakToPeakDb), "a quiet shallow code is CLEAN");

const shallowScatter = averageMeterSamples([0.2, 0.2 * 10 ** (0.08 / 20)], 0.2);
assert(
  meterSpreadIsNoisy(5, shallowScatter.peakToPeakDb),
  "0.08 dB p-p at a shallow code is NOISY",
);
assert(
  !meterSpreadIsNoisy(35, shallowScatter.peakToPeakDb),
  "the same 0.08 dB cloud is still inside the deep-code gate",
);
const deepScatter = averageMeterSamples([0.002, 0.002 * 10 ** (0.3 / 20)], 0.2);
assert(
  meterSpreadIsNoisy(35, deepScatter.peakToPeakDb) &&
    deepScatter.peakToPeakDb > meterSpreadLimitDb(35),
  "0.3 dB p-p at code 35 is NOISY",
);
assert(
  almost(deepScatter.attDb, -20 * Math.log10(((0.002 + 0.002 * 10 ** (0.3 / 20)) / 2) / 0.2)),
  "att comes from the mean voltage",
);

assert(SPOT_TOLERANCE_DB === 0.1, "spot tolerance is 0.10 dB");
assert(spotCheckDelta(0.2, 0.25).withinTolerance, "0.05 dB spot delta is inside tolerance");
assert(spotCheckDelta(0, 0.1).withinTolerance, "0.10 dB spot delta is the limit, not a flag");
assert(!spotCheckDelta(0, 0.11).withinTolerance, "0.11 dB spot delta flags");
assert(!spotCheckDelta(-0.2, 0.35).withinTolerance, "a 0.55 dB spot delta flags");
assert(almost(spotCheckDelta(0.2, 0.25).deltaDb, 0.05), "delta is spot minus table");

// Coarse 10 dB blocks alternate +0.5 and −0.5 dB, held for the whole block.
// Interior 1 dB steps are exact. The only flat crossings are into the low
// blocks (codes 10 and 30). Crossings into the high blocks (20 and 40) rise
// by 2 dB and must not be skipped.
function decadeBlockLadder(): LadderErrors {
  const err = Array.from({ length: 42 }, (_, code) =>
    Math.floor(code / 10) % 2 === 0 ? 0.5 : -0.5,
  );
  return { errA: err, errB: [...err] };
}

const decade = decadeBlockLadder();
const decadeSegs = buildCalSegments(decade);
const decadeSkipped = new Set<number>();
for (const seg of decadeSegs) {
  for (let code = seg.nearCode + 1; code < seg.farCode; code++) decadeSkipped.add(code);
}
assert(
  decadeSkipped.size === 2 && decadeSkipped.has(10) && decadeSkipped.has(30),
  `decade-block skip should drop only codes 10 and 30, got ${[...decadeSkipped].join(",")}`,
);
assert(
  decadeSegs.some((seg) => seg.nearCode === 19 && seg.farCode === 20),
  "the +2 dB step into code 20 must stay a single-code segment",
);
assert(
  decadeSegs.some((seg) => seg.nearCode === 39 && seg.farCode === 40),
  "the +2 dB step into code 40 must stay a single-code segment",
);
assert(
  decadeSegs.some((seg) => seg.nearCode === 15 && seg.farCode === 16),
  "an interior step inside a loud-error block must not be skipped",
);
const decadeLaw = peakLawErrors(decade);
assert(
  decadeLaw.uncorrectedAbsDb > 0.9,
  `decade-block ladder should leave about 1 dB uncorrected, got ${decadeLaw.uncorrectedAbsDb}`,
);
assert(
  decadeLaw.correctedAbsDb < 1e-6,
  `decade-block ladder should calibrate out, got ${decadeLaw.correctedAbsDb}`,
);

console.log("All interpolation / compressor / leapfrog / Cgd / calibration checks passed.");
console.log(
  `  1 dB linear-mix peak error: ${err1.maxAbsErrorDb.toFixed(4)} dB at k=${err1.atK.toFixed(3)}`,
);
console.log(`  Mix of −10 and −11 dB at k=0.5: −${mix10_11_half.toFixed(4)} dB`);
console.log(`  Exact k for −10.5 dB: ${kExact.toFixed(4)}`);
console.log(
  `  0.5 dB CERR law error: ${cerrLaw.uncorrectedAbsDb.toFixed(3)} dB uncorrected, ${cerrLaw.correctedAbsDb.toExponential(1)} dB calibrated`,
);
console.log(
  `  Decade-block law error: ${decadeLaw.uncorrectedAbsDb.toFixed(3)} dB uncorrected, ${decadeLaw.correctedAbsDb.toExponential(1)} dB calibrated`,
);
console.log(
  `  2 dB skip-span linear-mix peak: ${err2.maxAbsErrorDb.toFixed(4)} dB`,
);
console.log(
  `  Cgd tick 4 pF / 3.5 V / 0.25 ms: ${(tick.tickV * 1e3).toFixed(2)} mV (${tick.tickDbfs.toFixed(1)} dB vs 100 mVrms)`,
);
