/**
 * Ping-pong / leapfrog pair programming.
 *
 * Only the unused (mix weight ≈ 0) digital channel is updated, and only
 * when gain reduction crosses a tap boundary. The analog crossfade k
 * triangles 0→1→0→1 so that the just-updated channel stays silent
 * until it becomes the far tap of the next 1 dB interval.
 */

export type LeapfrogState = {
  /** Programmed attenuation of PT2257 left (channel A), dB. */
  attA: number;
  /** Programmed attenuation of PT2257 right (channel B), dB. */
  attB: number;
  /** Analog mix: 0 = all A, 1 = all B. */
  k: number;
  /** 0: A is the near (lower) tap; 1: B is the near tap. */
  phase: 0 | 1;
  /** floor(GR / step) */
  n: number;
  /** Fractional dB in [0, 1). */
  fraction: number;
  /** Channel that would be safe to write (mix weight near 0). */
  idleChannel: "A" | "B";
};

export function leapfrogFromGainReduction(
  grDb: number,
  stepDb = 1,
): LeapfrogState {
  const gr = Math.max(0, grDb);
  const scaled = gr / stepDb;
  const n = Math.floor(scaled + 1e-12);
  const fraction = scaled - n;
  const near = n * stepDb;
  const far = (n + 1) * stepDb;

  if (n % 2 === 0) {
    return {
      attA: near,
      attB: far,
      k: fraction,
      phase: 0,
      n,
      fraction,
      idleChannel: fraction < 0.5 ? "B" : "A",
    };
  }

  return {
    attA: far,
    attB: near,
    k: 1 - fraction,
    phase: 1,
    n,
    fraction,
    idleChannel: fraction < 0.5 ? "A" : "B",
  };
}

export function mixWeightA(state: LeapfrogState): number {
  return 1 - state.k;
}

export function mixWeightB(state: LeapfrogState): number {
  return state.k;
}

/**
 * True update rule used in firmware: rewrite the idle channel only when
 * its mix weight is below `isolation` (default 2 %).
 */
export function shouldUpdateIdle(
  state: LeapfrogState,
  isolation = 0.02,
): boolean {
  const idleWeight =
    state.idleChannel === "A" ? mixWeightA(state) : mixWeightB(state);
  return idleWeight <= isolation;
}

export function resultingAttenuationDb(
  state: LeapfrogState,
  mixFn: (a: number, b: number, k: number) => number,
): number {
  return mixFn(state.attA, state.attB, state.k);
}
