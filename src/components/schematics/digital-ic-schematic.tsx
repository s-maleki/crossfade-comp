import {
  Chip,
  Gnd,
  Label,
  ResistorH,
  SchematicFrame,
  Wire,
  ink,
} from "./symbols";

export function DigitalIcSchematic() {
  return (
    <SchematicFrame
      dwg="DWG-05"
      title="PT2257 control, Arduino Nano leapfrog, VN staircase"
      viewBox="0 0 1100 620"
      notes="The microcontroller never touches audio. It only watches VGR, writes the idle PT2257 channel, and emits the integer-dB staircase VN. I²C pull-ups go to +5 V; PT2257 VDD is +9 V so 5 V is a legal HIGH (VIH min is 0.4 VDD = 3.6 V). Wait 200 ms after 9 V appears before the first I²C transaction."
    >
      <Chip
        x={80}
        y={60}
        w={220}
        h={280}
        name="Arduino Nano"
        pins={[
          { side: "R", n: 4, label: "SDA A4", yy: 110 },
          { side: "R", n: 5, label: "SCL A5", yy: 150 },
          { side: "R", n: 3, label: "PWM D3 VN", yy: 200 },
          { side: "R", n: 2, label: "A2 VGR", yy: 250 },
          { side: "R", n: 2, label: "D2 invert", yy: 300 },
          { side: "L", n: 5, label: "+5 V", yy: 90 },
          { side: "L", n: 3, label: "GND", yy: 300 },
        ]}
      />
      <Wire d="M 80 300 H 40" />
      <Gnd x={40} y={300} />

      <Chip
        x={520}
        y={40}
        w={200}
        h={240}
        name="PT2257"
        pins={[
          { side: "L", n: 4, label: "SDA", yy: 110 },
          { side: "L", n: 5, label: "SCL", yy: 150 },
          { side: "L", n: 6, label: "VDD 9V", yy: 70 },
          { side: "L", n: 3, label: "VSS", yy: 250 },
          { side: "R", n: 1, label: "LIN", yy: 90 },
          { side: "R", n: 8, label: "RIN", yy: 130 },
          { side: "R", n: 2, label: "LOUT", yy: 180 },
          { side: "R", n: 7, label: "ROUT", yy: 220 },
        ]}
      />
      <Wire d="M 520 250 H 480" />
      <Gnd x={480} y={250} />
      <Wire d="M 300 110 H 506" />
      <Wire d="M 300 150 H 506" />
      <ResistorH x1={340} x2={430} y={80} refDes="R80" value="4.7k" />
      <Wire d="M 340 80 V 110" />
      <ResistorH x1={340} x2={430} y={40} refDes="R81" value="4.7k" />
      <Wire d="M 340 40 V 150" />
      <Wire d="M 430 40 H 450 V 20 H 40" />
      <Label x={24} y={18}>+5 V</Label>

      <Label x={24} y={380}>VN reconstruction · 62.5 kHz fast PWM, not 490 Hz analogWrite</Label>
      <Wire d="M 300 200 H 360" />
      <ResistorH x1={360} x2={450} y={200} refDes="R82" value="1k" />
      <Wire d="M 450 200 V 240" />
      <Label x={462} y={236}>C30 100n to GND</Label>
      <ResistorH x1={450} x2={540} y={200} refDes="R83" value="1k" />
      <Wire d="M 540 200 V 240" />
      <Label x={552} y={236}>C31 100n</Label>
      <Wire d="M 540 200 H 620" />
      <Label x={630} y={188}>VN · 100 mV/dB staircase</Label>

      <rect x="24" y="430" width="1050" height="160" fill="none" stroke={ink} strokeDasharray="4 3" />
      <Label x={40} y={454}>I²C byte plan · 7-bit address 0x44 (datasheet 0x88 write)</Label>
      <Label x={40} y={478}>
        Left  −10 dB / −1 dB : 0xB0|tens , 0xA0|ones     Right: 0x30|tens , 0x20|ones
      </Label>
      <Label x={40} y={502}>
        Always send the 10 dB byte first so a decade crossing (e.g. −9 → −11) glitches mute-ward (−19 dB) rather than toward 0 dB.
      </Label>
      <Label x={40} y={526}>
        Never issue a 2-channel command. Never rewrite the live channel. Hysteresis 0.08 dB on N. Isolation gate: idle mix weight &lt; 2 %.
      </Label>
      <Label x={40} y={550}>
        Mute byte 0x78 / 0x79. Function-off 0xFF. Init: delay 200 ms, unmute, both channels 0 dB, VN = 0.
      </Label>
      <Label x={40} y={574}>
        GPIO D2 high on odd N so the analog Vk inverter triangles the crossfade. Both channels stay complementary: |attA − attB| = 1 dB except during the ~0.3 ms write.
      </Label>
    </SchematicFrame>
  );
}
