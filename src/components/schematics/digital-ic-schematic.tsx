import {
  Chip,
  CapV,
  Gnd,
  ResistorH,
  SchematicFrame,
  Txt,
  Wire,
} from "./symbols";

export function DigitalIcSchematic() {
  return (
    <SchematicFrame
      dwg="DWG-05"
      title="PT2257 control, Arduino Nano leapfrog, VN staircase"
      viewBox="0 0 1180 500"
      notes="The microcontroller never touches audio. It watches VGR, writes the idle PT2257 channel, and emits the integer-dB staircase VN. I2C pull-ups go to +5 V; PT2257 VDD is +9 V so 5 V is a legal HIGH (VIH min is 0.4 VDD = 3.6 V). Wait 200 ms after 9 V appears before the first transaction. Always send the 10 dB byte first so a decade crossing glitches mute-ward."
    >
      <Txt x={24} y={26} size={12} weight="bold">
        Leapfrog controller
      </Txt>
      <Chip
        x={60}
        y={46}
        w={210}
        h={220}
        name="Arduino Nano"
        pins={[
          { side: "L", n: 5, label: "+5V", yy: 76 },
          { side: "L", n: 3, label: "GND", yy: 240 },
          { side: "R", n: 4, label: "SDA A4", yy: 100 },
          { side: "R", n: 5, label: "SCL A5", yy: 130 },
          { side: "R", n: 3, label: "PWM D3", yy: 170 },
          { side: "R", n: 2, label: "A2 VGR", yy: 200 },
          { side: "R", n: 2, label: "D2 inv", yy: 230 },
        ]}
      />
      <Wire d="M 60 240 H 36" />
      <Gnd x={36} y={240} />
      <Wire d="M 60 76 H 28" />
      <Txt x={24} y={64}>+5 V</Txt>

      <Chip
        x={620}
        y={46}
        w={200}
        h={200}
        name="PT2257"
        pins={[
          { side: "L", n: 6, label: "VDD 9V", yy: 76 },
          { side: "L", n: 4, label: "SDA", yy: 100 },
          { side: "L", n: 5, label: "SCL", yy: 130 },
          { side: "L", n: 3, label: "VSS", yy: 220 },
          { side: "R", n: 1, label: "LIN", yy: 90 },
          { side: "R", n: 8, label: "RIN", yy: 120 },
          { side: "R", n: 2, label: "LOUT", yy: 160 },
          { side: "R", n: 7, label: "ROUT", yy: 190 },
        ]}
      />
      <Wire d="M 620 220 H 590" />
      <Gnd x={590} y={220} />
      <Txt x={840} y={94} size={10}>
        analog I/O · DWG-01
      </Txt>

      <Wire d="M 270 100 H 608" />
      <Wire d="M 270 130 H 608" />
      <ResistorH x1={330} x2={430} y={48} refDes="R80" value="4.7k" />
      <Wire d="M 330 48 V 100" />
      <ResistorH x1={330} x2={430} y={24} refDes="R81" value="4.7k" />
      <Wire d="M 330 24 V 130" />
      <Wire d="M 430 24 H 470 V 12 H 28" />

      <Txt x={24} y={300} size={12} weight="bold">
        VN reconstruction · 62.5 kHz Timer2 PWM on D3
      </Txt>
      <Wire d="M 270 170 V 330 H 320" />
      <ResistorH x1={320} x2={420} y={330} refDes="R82" value="1k" />
      <CapV x={420} y1={330} y2={400} refDes="C30" value="100n" />
      <Gnd x={420} y={400} />
      <ResistorH x1={420} x2={530} y={330} refDes="R83" value="1k" />
      <CapV x={530} y1={330} y2={400} refDes="C31" value="100n" />
      <Gnd x={530} y={400} />
      <Wire d="M 530 330 H 700" />
      <Txt x={710} y={334}>VN 100 mV/dB</Txt>

      <Txt x={24} y={420} size={10}>
        Address 0x44. Left: 0xB0|tens then 0xA0|ones. Right: 0x30|tens then 0x20|ones. Never a 2-channel command. Never rewrite the live tap.
      </Txt>
      <Txt x={24} y={440} size={10}>
        Hysteresis 0.08 dB. Isolation gate: idle mix weight under 2 %. Mute 0x78/0x79. Init after 200 ms: unmute, A=0 dB, B=1 dB, VN=0.
      </Txt>
      <Txt x={24} y={460} size={10}>
        D2 high on odd N so the analog Vk inverter triangles k through 0-1-0 at each 1 dB boundary.
      </Txt>
    </SchematicFrame>
  );
}
