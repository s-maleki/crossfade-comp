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

console.log("All interpolation / compressor / leapfrog / Cgd checks passed.");
console.log(
  `  1 dB linear-mix peak error: ${err1.maxAbsErrorDb.toFixed(4)} dB at k=${err1.atK.toFixed(3)}`,
);
console.log(`  Mix of −10 and −11 dB at k=0.5: −${mix10_11_half.toFixed(4)} dB`);
console.log(`  Exact k for −10.5 dB: ${kExact.toFixed(4)}`);
console.log(
  `  Cgd tick 4 pF / 3.5 V / 0.25 ms: ${(tick.tickV * 1e3).toFixed(2)} mV (${tick.tickDbfs.toFixed(1)} dB vs 100 mVrms)`,
);
