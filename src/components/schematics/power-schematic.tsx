import {
  CapH,
  CapV,
  Chip,
  DiodeH,
  Gnd,
  SchematicFrame,
  Txt,
  Wire,
} from "./symbols";

export function PowerSchematic() {
  return (
    <SchematicFrame
      dwg="DWG-06"
      title="9 V pedal supply · +9 / 0 / -9 and +5 V"
      viewBox="0 0 1180 420"
      notes="Boss-style 9 V DC, tip negative. ICL7660S inverts to -9 V for the op-amp analog-ground system. PT2257 runs from raw +9 V. The Nano and I2C pull-ups run from 78L05. On a 12 V supply, regulate PT2257 to 9 V (operating max 10 V). Do not run LM1972 at +/-9 V (max 12 V total); use +5/-5 if that upgrade is fitted. AD633 is not used: it needs +/-8 V and adds ~90 uV of 10 kHz noise."
    >
      <Txt x={24} y={28} size={12} weight="bold">
        Barrel jack · tip negative
      </Txt>
      <Txt x={24} y={70}>9 V+</Txt>
      <Wire d="M 58 70 H 80" />
      <DiodeH x1={80} x2={160} y={70} refDes="D1 1N5817" />
      <Wire d="M 160 70 H 200" />
      <Chip
        x={220}
        y={40}
        w={130}
        h={70}
        name="78L05"
        pins={[
          { side: "L", n: 1, label: "IN", yy: 70 },
          { side: "R", n: 3, label: "5V", yy: 70 },
        ]}
      />
      <CapV x={180} y1={70} y2={140} refDes="C1" value="220u/16V" />
      <Gnd x={180} y={140} />
      <CapV x={380} y1={70} y2={140} refDes="C6" value="10u" />
      <Gnd x={380} y={140} />
      <Wire d="M 362 70 H 430" />
      <Txt x={440} y={74}>+5 V MCU</Txt>

      <Chip
        x={220}
        y={190}
        w={170}
        h={130}
        name="ICL7660S"
        pins={[
          { side: "L", n: 8, label: "V+", yy: 220 },
          { side: "L", n: 3, label: "GND", yy: 290 },
          { side: "R", n: 2, label: "C+", yy: 220 },
          { side: "R", n: 5, label: "Vout", yy: 255 },
          { side: "R", n: 4, label: "C-", yy: 290 },
        ]}
      />
      <Wire d="M 160 70 V 220 H 208" />
      <Wire d="M 220 290 H 190" />
      <Gnd x={190} y={290} />
      <CapH x1={402} x2={490} y={220} refDes="C3" value="10u" />
      <Wire d="M 490 220 V 290 H 402" />
      <CapV x={450} y1={255} y2={330} refDes="C5" value="100u/16V" />
      <Gnd x={450} y={330} />
      <Wire d="M 402 255 H 560" />
      <Txt x={570} y={259}>VEE -9 V</Txt>
      <Wire d="M 160 70 V 370 H 560" />
      <Txt x={570} y={374}>VCC +9 V analog</Txt>

      <Txt x={700} y={70} size={10}>
        Headroom at 9 V bipolar
      </Txt>
      <Txt x={700} y={90} size={10}>
        After D1: about +/-8.7 V. 2 Vrms = 2.8 Vpk.
      </Txt>
      <Txt x={700} y={110} size={10}>
        TL074 needs ~1.5 V to the rail, so 7.2 Vpk remains. OK.
      </Txt>
      <Txt x={700} y={130} size={10}>
        PT2257 Vomax 2.3 Vrms typical. Pad 6 dB if a
      </Txt>
      <Txt x={700} y={150} size={10}>
        hot active pickup clips; recover in makeup.
      </Txt>
      <Txt x={700} y={190} size={10}>
        0.1 uF ceramic on every IC rail.
      </Txt>
      <Txt x={700} y={210} size={10}>
        Star analog ground at the jack sleeve.
      </Txt>
      <Txt x={700} y={230} size={10}>
        Keep the 7660 pump away from the JFET and log pair.
      </Txt>
    </SchematicFrame>
  );
}
