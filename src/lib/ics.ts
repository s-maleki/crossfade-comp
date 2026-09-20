export type VolumeIc = {
  name: string;
  verdict: "prototype" | "upgrade" | "avoid";
  package: string;
  channels: number;
  stepDb: number;
  rangeDb: string;
  interface: string;
  supply: string;
  thd: string;
  snr: string;
  separation: string;
  headroom: string;
  notes: string;
};

export const VOLUME_ICS: VolumeIc[] = [
  {
    name: "PT2257",
    verdict: "prototype",
    package: "DIP-8",
    channels: 2,
    stepDb: 1,
    rangeDb: "0 to −79 dB",
    interface: "I²C, 100 kHz max, addr 0x44",
    supply: "5–9 V single (abs max 12 V)",
    thd: "0.003 % @ 200 mVrms; 0.07 % @ 2 Vrms",
    snr: "120 dB A-wtd typical (ref. full scale)",
    separation: "120 dB typical",
    headroom: "2.3 Vrms typical at 9 V",
    notes:
      "Independent left/right 10 dB + 1 dB codes. Not specified pop-free. Decade crossings can glitch the idle channel internally; analog isolation must swallow that. Fast-attack limited by 100 kHz I²C.",
  },
  {
    name: "PT2258",
    verdict: "prototype",
    package: "DIP-20",
    channels: 6,
    stepDb: 1,
    rangeDb: "0 to −79 dB",
    interface: "I²C, same 10 dB/1 dB coding family",
    supply: "5–9 V",
    thd: "0.005 % typical @ 200 mVrms",
    snr: "105 dB A-wtd typical",
    separation: "100 dB typical",
    headroom: "2.5 Vrms typical",
    notes:
      "Works if two of six channels are used as the adjacent taps. Extra silicon, extra coupling. No advantage over PT2257 for a mono pedal.",
  },
  {
    name: "M62429",
    verdict: "avoid",
    package: "DIP-8",
    channels: 2,
    stepDb: 1,
    rangeDb: "0 to −83 dB + mute",
    interface: "2-wire serial (not I²C)",
    supply: "5 V typical",
    thd: "0.01 % typical @ 0.5 Vrms",
    snr: "~5 µV residual (muted)",
    separation: "80 dB typical",
    headroom: "1.5 Vrms in / 1.3 Vrms out",
    notes:
      "Headroom is too low for 2 Vrms guitar without a 6–12 dB pad and makeup, which burns noise figure. 80 dB separation is marginal for leapfrog isolation.",
  },
  {
    name: "LM1972",
    verdict: "upgrade",
    package: "SOIC-20 (through-hole adapter)",
    channels: 2,
    stepDb: 0.5,
    rangeDb: "0 to −47.5 dB in 0.5 dB; then 1 dB to −78 dB",
    interface: "3-wire SPI-like, 2 MHz",
    supply: "4.5–12 V total (±5 V from 9 V is ideal)",
    thd: "0.0008 % typical, 0.003 % max",
    snr: "120 dB typical",
    separation: "110 dB typical",
    headroom: "5.5 Vpk at ±6 V",
    notes:
      "Datasheet specifies pop-free tap changes and 0.5 dB steps. A tap update is ~20 µs, so 20 dB of attack in 1 ms is easy. Best IC if the extra package is acceptable.",
  },
];
