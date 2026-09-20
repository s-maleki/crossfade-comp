import {
  CapH,
  CapV,
  Chip,
  DiodeH,
  Gnd,
  Label,
  SchematicFrame,
  Wire,
  ink,
} from "./symbols";

export function PowerSchematic() {
  return (
    <SchematicFrame
      dwg="DWG-06"
      title="9 V pedal supply · +9 / 0 / −9 and +5 V"
      viewBox="0 0 1100 480"
      notes="Boss-style 9 V DC. ICL7660S inverts to −9 V for the op-amp analog ground system. PT2257 runs from raw +9 V. The Nano and I²C pull-ups run from 78L05. On a 12 V supply, regulate PT2257 to 9 V (its operating max is 10 V) and keep total LM1972 rails ≤ 12 V if that upgrade is fitted. AD633 is not used: it needs ±8 V and adds ~90 µV of 10 kHz noise."
    >
      <Label x={24} y={28}>Barrel jack · tip negative (guitar-pedal convention)</Label>
      <Wire d="M 40 80 H 80" />
      <Label x={24} y={68}>9 V+</Label>
      <DiodeH x1={80} x2={160} y={80} refDes="D1 1N5817" />
      <Chip
        x={220}
        y={40}
        w={140}
        h={90}
        name="78L05"
        pins={[
          { side: "L", n: 1, label: "IN", yy: 80 },
          { side: "R", n: 3, label: "5 V", yy: 80 },
        ]}
      />
      <Wire d="M 160 80 H 206" />
      <CapV x={180} y1={80} y2={150} refDes="C1" value="220µ/16V" />
      <Gnd x={180} y={150} />
      <CapV x={390} y1={80} y2={150} refDes="C6" value="10µ" />
      <Gnd x={390} y={150} />
      <Wire d="M 360 80 H 430" />
      <Label x={440} y={68}>+5 V MCU</Label>

      <Chip
        x={220}
        y={220}
        w={180}
        h={140}
        name="ICL7660S"
        pins={[
          { side: "L", n: 8, label: "V+", yy: 250 },
          { side: "L", n: 3, label: "GND", yy: 320 },
          { side: "R", n: 5, label: "Vout", yy: 280 },
          { side: "R", n: 2, label: "C+", yy: 250 },
          { side: "R", n: 4, label: "C−", yy: 310 },
        ]}
      />
      <Wire d="M 160 80 V 250 H 206" />
      <Wire d="M 220 320 H 180" />
      <Gnd x={180} y={320} />
      <CapH x1={414} x2={500} y={250} refDes="C3" value="10µ" />
      <Wire d="M 500 250 V 310 H 414" />
      <CapV x={460} y1={280} y2={360} refDes="C5" value="100µ/16V" />
      <Gnd x={460} y={360} />
      <Wire d="M 414 280 H 560" />
      <Label x={570} y={268}>VEE −9 V</Label>
      <Wire d="M 160 80 H 160 V 400 H 560" />
      <Label x={570} y={388}>VCC +9 V analog</Label>
      <Label x={24} y={420}>
        0.1 µF ceramic on every IC rail. Star analog ground at the jack sleeve. Keep 7660 charge-pump away from the JFET and log pair.
      </Label>
      <rect x="620" y="40" width="450" height="200" fill="none" stroke={ink} strokeDasharray="4 3" />
      <Label x={636} y={64}>Headroom at 9 V bipolar</Label>
      <Label x={636} y={88}>±9 V after D1 ≈ ±8.7 V. 2 Vrms = 5.6 Vpp = 2.8 Vpk.</Label>
      <Label x={636} y={112}>TL074 needs ~1.5 V to the rail → 7.2 Vpk remaining. OK.</Label>
      <Label x={636} y={136}>PT2257 Vomax 2.3 Vrms typical. Pad 6 dB if a hot</Label>
      <Label x={636} y={160}>active pickup clips it; recover in makeup.</Label>
      <Label x={636} y={184}>Do not run LM1972 at ±9 V (max 12 V total).</Label>
      <Label x={636} y={208}>Upgrade rails for that IC: +5 V / −5 V from 7905.</Label>
    </SchematicFrame>
  );
}
