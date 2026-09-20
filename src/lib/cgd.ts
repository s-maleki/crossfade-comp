/**
 * JFET Cgd feedthrough and Miller neutralization on the interpolator drain.
 *
 * Q10 is a shunt VCR on Vk′. Internal Cgd dumps i = Cgd · dVgs/dt onto that
 * drain, which is the audio residual node. A trimmer from −Vgs onto the same
 * drain cancels the current when Ctrim ≈ Cgd.
 *
 * Injecting −Vgs into the gate does not cancel anything: U2C is a voltage
 * source, so extra gate current is absorbed and Cgd current is unchanged.
 */

export const R64_OHMS = 22_000;

/** 2N5457 Crss max at Vds = 15 V. At Vds ≈ 0 (VCR bias) Cgd is larger. */
export const CRSS_2N5457_AT_15V_MAX_F = 2e-12;

/** Typical Cgd at Vds ≈ 0 V, Vgs near mid-pinch-off. */
export const CGD_VDS0_TYP_F = 4e-12;

/** 2N5457 Ciss max — upper bound on Cgd + Cgs at Vds ≈ 0. */
export const CISS_2N5457_MAX_F = 7e-12;

export const CTRIM_MIN_F = 2e-12;
export const CTRIM_MAX_F = 10e-12;

export type FeedthroughTick = {
  /** Constant current during a linear Vgs ramp, amperes. */
  currentA: number;
  /** Pulse height at the drain into R64, volts. Cgd·R64 is ~90 ns, so a ms-scale ramp is purely resistive. */
  tickV: number;
  /** Tick peak relative to a sine of `referenceRms` (default 100 mV guitar). */
  tickDbfs: number;
};

export function feedthroughTick(
  cgdF: number,
  dVgs: number,
  dtSeconds: number,
  rOhms: number = R64_OHMS,
  referenceRms = 0.1,
): FeedthroughTick {
  const currentA = dtSeconds <= 0 ? 0 : (cgdF * dVgs) / dtSeconds;
  const tickV = currentA * rOhms;
  const peakRef = referenceRms * Math.SQRT2;
  const tickDbfs =
    tickV <= 0 || peakRef <= 0 ? -Infinity : 20 * Math.log10(tickV / peakRef);
  return { currentA, tickV, tickDbfs };
}

/**
 * Trimmer that matches charge: Ctrim · |ΔVinv| = Cgd · |ΔVgs|.
 * Unity inversion (U2D) makes Ctrim = Cgd. Driving Ctrim from Vk (0–5 V)
 * instead of Vgs would require Ctrim = Cgd · |Vp| / 5, which moves with FET
 * selection and with RV1.
 */
export function trimCapFarads(
  cgdF: number,
  vgsSwing: number,
  vinvSwing: number,
): number {
  if (vinvSwing === 0) return 0;
  return cgdF * Math.abs(vgsSwing / vinvSwing);
}

/** Residual tick after a trim mismatch of `mismatchF`. */
export function residualTick(
  mismatchF: number,
  dVgs: number,
  dtSeconds: number,
  rOhms: number = R64_OHMS,
  referenceRms = 0.1,
): FeedthroughTick {
  return feedthroughTick(
    Math.abs(mismatchF),
    dVgs,
    dtSeconds,
    rOhms,
    referenceRms,
  );
}

export function clampTrimFarads(ctrimF: number): number {
  return Math.min(CTRIM_MAX_F, Math.max(CTRIM_MIN_F, ctrimF));
}
