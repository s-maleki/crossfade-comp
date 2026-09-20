# BlendStep

A feed-forward guitar compressor that uses a digitally stepped volume IC as the
gain element, with an analog voltage-controlled crossfade between adjacent
attenuation taps.

This is not an LM13700 / CA3080 compressor. The CMOS chip does the decibels.
The analog mixer only fills the 1 dB gaps.

An interactive design notebook (schematics, interpolation lab, compressor law,
leapfrog animator) is the `src/` Next.js app. Firmware, SPICE, and the BOM are
alongside it.

## Why this works

Two channels of a PT2257 see the same input. They are programmed 1 dB apart,
for example −10 dB and −11 dB. An analog mixer implements

```
v = (1 − k) A + k B = A + k (B − A)
```

A and B are the same waveform, so there is no comb filter — only a gain
between the two taps.

A linear amplitude mix is **not** exactly linear in dB. For a 1 dB step the
error peaks at **0.014 dB** (k ≈ 0.5 produces −10.486 dB rather than −10.500 dB).
That is below the PT2257’s own 0.5 dB tracking spec and is inaudible. The exact
dB-linear law

```
k = (10^(−f/20) − 1) / (10^(−Δ/20) − 1)
```

is optional. Do not drive the interpolator from a linear envelope and pretend
the result is a ratio compressor: the logarithm belongs in the sidechain.

The analog element only processes `B − A`, which is 10.9 % of A at 1 dB, so
its distortion and noise are ~19 dB less serious than a VCA on the full signal.

## Architecture

```
input → buffer ┬→ PT2257 A (N dB) ─┐
               ├→ PT2257 B (N+1) ──┤ analog crossfader → makeup → out
               └→ HPF → rectifier → attack/release → log → threshold
                                     → ratio → max GR → k and MCU
```

The microcontroller is not in the audio path. It watches the analog GR voltage,
rewrites the **idle** PT2257 channel at each 1 dB boundary, and emits a 1 dB
staircase so an analog subtractor can extract the fractional dB for the
crossfader.

Leapfrog / ping-pong:

| GR (dB) | A    | B    | k   | silent channel |
|--------:|------|------|-----|----------------|
| 10.0    | −10  | −11  | 0   | B              |
| 10.4    | −10  | −11  | 0.4 | B              |
| 11.0    | −10  | −11  | 1   | A (rewrite to −12) |
| 11.4    | −12  | −11  | 0.6 | A              |
| 12.0    | −12  | −11  | 0   | B (rewrite to −13) |

## Volume IC choice

| IC     | Use        | Why |
|--------|------------|-----|
| **PT2257** | Prototype | DIP-8, 9 V, independent 1 dB L/R, 120 dB separation, 2.3 Vrms headroom |
| PT2258 | Optional   | 6-channel cousin; wasteful in a mono pedal |
| M62429 | Avoid      | 1.5 Vrms in / 1.3 Vrms out, 80 dB separation |
| **LM1972** | Upgrade | Pop-free, 0.5 dB steps, 2 MHz 3-wire, 0.0008 % THD. Use ±5 V rails |

PT2257 I²C is 100 kHz max (~0.3 ms per channel write). That is enough for
typical guitar attack (≥ 5 ms) and not enough for 1 ms / 20 dB. Decade
crossings can glitch the idle channel internally; send the 10 dB code first
and rely on analog isolation.

## Crossfader

Prototype: linearized 2N5457 shunt on `Vdiff = VB − VA`, then `Vmix = VA + Vk′`.
RV1 sets pinch-off. U2D inverts the actual gate voltage and CV1 (2–10 pF)
dumps the opposite charge onto the drain to cancel Cgd feedthrough. Do not
inject that capacitor into the gate — U2C is a voltage source and will eat
the current. Optional: analog PWM (180 kHz triangle + LM311 + CD4053) if you
do not want a JFET trim. Do not PWM the audio from the Arduino.

## Sidechain

- Switchable ~72 Hz HPF
- Precision full-wave rectifier (BAT85)
- Attack 1–50 ms, release 50 ms–1 s on a 1 µF film capacitor
- RC release is linear in dB/s
- Transdiode log pair at 100 mV/dB (0 dB = 100 mV envelope)
- Threshold, ratio `k = 1 − 1/R`, diode clamp for max GR

## Run the notebook

```bash
npm install
npm run verify
npm run dev
```

The dev server listens on [http://127.0.0.1:43147](http://127.0.0.1:43147).

## Build the pedal

See `hardware/bom.csv`, the Schematics tab in the notebook, and
`firmware/leapfrog_pt2257.ino`. Supply is a 9 V guitar-pedal brick (tip
negative). Analog rails are +9 / 0 / −9 via ICL7660S. PT2257 runs from +9 V.
The Nano and I²C pull-ups run from 5 V. Neutralize Q10 Cgd with CV1 from
U2D (`hardware/spice/cgd_neutralize.cir`); layout notes are DWG-04A on the
Build and Schematics pages.

## Expected prototype numbers

| Quantity | Estimate |
|----------|----------|
| Bandwidth | 20 Hz–15 kHz (circuit −3 dB ~ 8 Hz–40 kHz) |
| THD @ 1 Vrms | 0.03–0.05 % |
| Noise | ~8 µV A-weighted |
| GR | 0–40 dB continuous |
| Interpolation error | ≤ 0.015 dB per tap |

Limits that are real and not a reason to abandon the idea: PT2257 matching
(0.5 dB), I²C attack speed, leftover JFET Cgd after CV1 (a single-point null),
and the need to keep integer taps synchronized with analog k.
