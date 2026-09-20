import {
  CapH,
  CapV,
  Chip,
  DiodeH,
  Dot,
  Gnd,
  SchematicFrame,
  Txt,
  Wire,
} from "./symbols";

export function PowerSchematic() {
  return (
    <SchematicFrame
      dwg="DWG-06"
      rev="E"
      title="9 V pedal supply · +9 / 0 / -9 and +5 V"
      viewBox="0 0 1200 520"
      notes="Boss-style 9 V DC, tip negative. ICL7660S inverts to −9 V for the op-amp analog-ground system. PT2257 runs from raw +9 V. The Nano and I²C pull-ups run from 78L05. On a 12 V supply, regulate PT2257 to 9 V (operating max 10 V). Do not run LM1972 at ±9 V (max 12 V total); use +5/−5 if that upgrade is fitted. AD633 is not used: it needs ±8 V and adds ~90 µV of 10 kHz noise. After D1: about ±8.7 V. 2 Vrms = 2.8 Vpk. TL074 needs ~1.5 V to the rail, so 7.2 Vpk remains. PT2257 Vomax 2.3 Vrms typical — pad 6 dB if a hot active pickup clips; recover in makeup. 0.1 µF ceramic on every IC rail. Star analog ground at the jack sleeve. Keep the 7660 pump away from the JFET and log pair."
    >
      <Txt x={24} y={28} size={12} weight="bold">
        Barrel jack · tip negative
      </Txt>
      <Txt x={24} y={80}>9 V+</Txt>
      <Wire d="M 58 80 H 80" />
      <DiodeH x1={80} x2={170} y={80} refDes="D1 1N5817" />
      <Dot x={170} y={80} />
      <Wire d="M 170 80 H 208" />
      <Chip
        x={220}
        y={48}
        w={130}
        h={90}
        name="78L05"
        pins={[
          { side: "L", n: 1, label: "IN", yy: 80 },
          { side: "L", n: 2, label: "GND", yy: 118 },
          { side: "R", n: 3, label: "5V", yy: 80 },
        ]}
      />
      <Wire d="M 220 118 H 196" />
      <Gnd x={196} y={118} />
      <CapV x={190} y1={80} y2={170} refDes="C1" value="220u/16V" label="left" />
      <Gnd x={190} y={170} />
      <Dot x={190} y={80} />
      <CapV x={390} y1={80} y2={160} refDes="C6" value="10u" />
      <Gnd x={390} y={160} />
      <Dot x={390} y={80} />
      <Wire d="M 362 80 H 470" />
      <Txt x={478} y={76}>+5 V MCU</Txt>

      <Txt x={24} y={220} size={12} weight="bold">
        Charge pump
      </Txt>
      <Chip
        x={220}
        y={240}
        w={170}
        h={140}
        name="ICL7660S"
        pins={[
          { side: "L", n: 8, label: "V+", yy: 270 },
          { side: "L", n: 3, label: "GND", yy: 350 },
          { side: "R", n: 2, label: "C+", yy: 270 },
          { side: "R", n: 5, label: "Vout", yy: 310 },
          { side: "R", n: 4, label: "C-", yy: 350 },
        ]}
      />
      <Wire d="M 170 80 V 270 H 208" />
      <Dot x={170} y={270} />
      <Wire d="M 220 350 H 196" />
      <Gnd x={196} y={350} />

      <CapH x1={402} x2={510} y={270} refDes="C3" value="10u" />
      <Dot x={510} y={270} />
      <Wire d="M 510 270 V 350 H 402" />
      <Dot x={402} y={350} />

      <Wire d="M 402 310 H 620" />
      <Dot x={450} y={310} />
      <CapV x={450} y1={310} y2={390} refDes="C4" value="10u" label="left" />
      <Gnd x={450} y={390} />
      <Dot x={560} y={310} />
      <CapV x={560} y1={310} y2={400} refDes="C5" value="100u/16V" />
      <Gnd x={560} y={400} />
      <Txt x={628} y={306}>VEE −9 V</Txt>

      <Wire d="M 170 80 V 450 H 620" />
      <Dot x={170} y={450} />
      <Txt x={628} y={454}>VCC +9 V analog</Txt>
    </SchematicFrame>
  );
}
