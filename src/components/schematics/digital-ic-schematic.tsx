import {
  CapV,
  Chip,
  Dot,
  Gnd,
  Hop,
  Port,
  ResistorH,
  ResistorV,
  SchematicFrame,
  Txt,
  Wire,
} from "./symbols";

export function DigitalIcSchematic() {
  return (
    <SchematicFrame
      dwg="DWG-05"
      rev="H"
      title="PT2257 control, Arduino Nano leapfrog, VN staircase"
      viewBox="0 0 1200 560"
      notes="The microcontroller never touches audio. It watches VGR and writes the idle PT2257 channel. Blank EEPROM: D3 is the integer-dB staircase VN and D2 is high on odd N so the analog Vk inverter triangles k. A valid ladder table: D9 is 10-bit Vk (weight of channel B), D2 stays low, and the Vk jumper moves from U5B to the D9 filter. I²C pull-ups go to +5 V; PT2257 VDD is +9 V so 5 V is a legal HIGH (VIH min is 0.4 VDD = 3.6 V). Wait 200 ms after 9 V appears before the first transaction. Always send the 10 dB byte first so a decade crossing glitches mute-ward. Address 0x44. Left: 0xB0|tens then 0xA0|ones. Right: 0x30|tens then 0x20|ones. Never a 2-channel command. Never rewrite the live tap. Hysteresis 0.08 dB. Isolation gate: idle mix weight under 2 %. Mute 0x78/0x79. Init after 200 ms: unmute, A=0 dB, B=1 dB. Serial 115200 is the bench cal port only."
    >
      <Txt x={24} y={22} size={12} weight="bold">
        Leapfrog controller
      </Txt>
      <Chip
        x={50}
        y={56}
        w={210}
        h={300}
        name="Arduino Nano"
        pins={[
          { side: "L", n: 5, label: "+5V", yy: 88 },
          { side: "L", n: 3, label: "GND", yy: 340 },
          { side: "R", n: 4, label: "SDA A4", yy: 120 },
          { side: "R", n: 9, label: "PWM D9", yy: 160 },
          { side: "R", n: 5, label: "SCL A5", yy: 200 },
          { side: "R", n: 3, label: "PWM D3", yy: 250 },
          { side: "R", n: 2, label: "A2 VGR", yy: 295 },
          { side: "R", n: 2, label: "D2 inv", yy: 340 },
        ]}
      />
      <Wire d="M 50 340 H 28" />
      <Gnd x={28} y={340} />
      <Wire d="M 50 88 H 28" />
      <Dot x={28} y={88} />
      <Txt x={22} y={76} anchor="end">
        +5 V
      </Txt>

      <Chip
        x={640}
        y={56}
        w={200}
        h={250}
        name="PT2257"
        pins={[
          { side: "L", n: 6, label: "VDD 9V", yy: 88 },
          { side: "L", n: 4, label: "SDA", yy: 120 },
          { side: "L", n: 5, label: "SCL", yy: 200 },
          { side: "L", n: 3, label: "VSS", yy: 280 },
          { side: "R", n: 1, label: "LIN", yy: 110 },
          { side: "R", n: 8, label: "RIN", yy: 150 },
          { side: "R", n: 2, label: "LOUT", yy: 200 },
          { side: "R", n: 7, label: "ROUT", yy: 240 },
        ]}
      />
      <Wire d="M 640 280 H 610" />
      <Gnd x={610} y={280} />
      <Wire d="M 640 88 H 610" />
      <Dot x={610} y={88} />
      <Txt x={600} y={76} anchor="end">
        +9 V
      </Txt>
      <Wire d="M 852 110 H 920" />
      <Port x={920} y={110} label="LIN DWG-01" dir="out" />
      <Wire d="M 852 150 H 920" />
      <Port x={920} y={150} label="RIN DWG-01" dir="out" />
      <Wire d="M 852 200 H 920" />
      <Port x={920} y={200} label="LOUT = VA" dir="out" />
      <Wire d="M 852 240 H 920" />
      <Port x={920} y={240} label="ROUT = VB" dir="out" />

      <Wire d="M 272 120 H 628" />
      <Wire d="M 272 160 H 330" />
      <Port x={330} y={160} label="Vk cal" dir="out" />
      <Wire d="M 272 200 H 628" />
      <Dot x={360} y={120} />
      <Dot x={440} y={200} />

      <Wire d="M 28 88 V 46 H 440" />
      <Dot x={360} y={46} />
      <Dot x={440} y={46} />
      <ResistorV x={360} y1={46} y2={120} refDes="R80" value="4.7k" label="left" />
      <ResistorV x={440} y1={46} y2={105} refDes="R81" value="4.7k" />
      <Wire d="M 440 105 V 113" />
      <Hop x={440} y={120} />
      <Wire d="M 440 127 V 200" />
      <Txt x={452} y={40} size={10}>
        +5 V
      </Txt>

      <Wire d="M 272 295 H 360" />
      <Port x={360} y={295} label="VGR DWG-03" dir="out" />
      <Wire d="M 272 340 H 360" />
      <Port x={360} y={340} label="to U5 / Q11" dir="out" />

      <Txt x={400} y={380} size={12} weight="bold">
        VN LPF
      </Txt>
      <Wire d="M 272 250 H 520 V 400" />
      <ResistorH x1={520} x2={620} y={400} refDes="R82" value="1k" />
      <Dot x={620} y={400} />
      <CapV x={620} y1={400} y2={480} refDes="C30" value="100n" />
      <Gnd x={620} y={480} />
      <ResistorH x1={620} x2={740} y={400} refDes="R83" value="1k" />
      <Dot x={740} y={400} />
      <CapV x={740} y1={400} y2={480} refDes="C31" value="100n" />
      <Gnd x={740} y={480} />
      <Wire d="M 740 400 H 860" />
      <Port x={860} y={400} label="VN 100 mV/dB" dir="out" />
    </SchematicFrame>
  );
}
