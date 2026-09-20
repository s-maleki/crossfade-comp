import {
  CapH,
  CapV,
  Chip,
  Dot,
  Gnd,
  Label,
  OpAmp,
  ResistorH,
  ResistorV,
  SchematicFrame,
  Wire,
  ink,
} from "./symbols";

export function AudioPathSchematic() {
  return (
    <SchematicFrame
      dwg="DWG-01"
      title="Audio path — input, dual PT2257 taps, makeup"
      viewBox="0 0 1100 620"
      notes="Both PT2257 channels see the same buffered guitar signal. AC coupling is required: the IC is single-supply and internally biased near VDD/2. After C14/C15 the interpolator works around analog ground. Keep the two channel layouts symmetrical; 0.5 dB of tracking error is already the IC limit."
    >
      <Label x={24} y={28}>
        9 V guitar / line in · 100 mV–2 V rms
      </Label>
      <Wire d="M 40 80 H 90" />
      <Label x={40} y={70}>IN</Label>
      <CapH x1={90} x2={160} y={80} refDes="C10" value="1µ film" />
      <Dot x={190} y={80} />
      <ResistorV x={190} y1={80} y2={160} refDes="R10" value="1M" />
      <Gnd x={190} y={160} />
      <ResistorH x1={190} x2={270} y={80} refDes="R11" value="100" />
      <CapV x={250} y1={80} y2={140} refDes="C11" value="220p" />
      <Gnd x={250} y={140} />
      <Wire d="M 270 80 H 300" />
      <OpAmp x={300} y={92} name="U1A" />
      <Wire d="M 300 128 H 280 V 92 H 300" />
      <Label x={250} y={88}>FB 0Ω</Label>
      <Wire d="M 370 92 H 430" />
      <Dot x={430} y={92} />
      <Label x={438} y={80}>Vbuf</Label>

      <Wire d="M 430 92 V 200" />
      <ResistorH x1={430} x2={520} y={200} refDes="R12" value="10k" />
      <CapH x1={520} x2={590} y={200} refDes="C12" value="10µ" />
      <Wire d="M 430 92 V 40 H 520" />
      <ResistorH x1={520} x2={600} y={40} refDes="R13" value="10k" />
      <CapH x1={600} x2={670} y={40} refDes="C13" value="10µ" />

      <Chip
        x={690}
        y={20}
        w={160}
        h={220}
        name="U6 PT2257"
        pins={[
          { side: "L", n: 8, label: "RIN", yy: 40 },
          { side: "L", n: 1, label: "LIN", yy: 200 },
          { side: "R", n: 7, label: "ROUT", yy: 70 },
          { side: "R", n: 2, label: "LOUT", yy: 170 },
          { side: "L", n: 4, label: "SDA", yy: 110 },
          { side: "L", n: 5, label: "SCL", yy: 140 },
        ]}
      />
      <Label x={710} y={250}>VDD=9 V · VSS=0 · DIP-8</Label>
      <Wire d="M 670 40 H 676" />
      <Wire d="M 590 200 H 676" />

      <CapH x1={864} x2={940} y={70} refDes="C15" value="10µ" />
      <CapH x1={864} x2={940} y={170} refDes="C14" value="10µ" />
      <Dot x={960} y={70} />
      <Dot x={960} y={170} />
      <ResistorV x={960} y1={70} y2={130} refDes="R16" value="100k" />
      <Gnd x={960} y={130} />
      <ResistorV x={980} y1={170} y2={230} refDes="R15" value="100k" />
      <Gnd x={980} y={230} />

      <OpAmp x={990} y={82} name="U1C" />
      <Wire d="M 940 70 H 990" />
      <Wire d="M 990 118 H 972 V 82 H 990" />
      <Wire d="M 1060 82 H 1088" />
      <Label x={1070} y={70}>VB</Label>

      <OpAmp x={990} y={182} name="U1B" />
      <Wire d="M 940 170 H 990" />
      <Wire d="M 990 218 H 972 V 182 H 990" />
      <Wire d="M 1060 182 H 1088" />
      <Label x={1070} y={170}>VA</Label>

      <Wire d="M 430 92 V 360" />
      <Label x={440} y={340}>to sidechain HPF (DWG-02)</Label>
      <Wire d="M 690 110 H 640 V 280" />
      <Wire d="M 690 140 H 660 V 280" />
      <Label x={560} y={300}>I²C from MCU · 4.7k to +5 V (DWG-05)</Label>

      <Label x={24} y={400}>Makeup after interpolator (DWG-04 output)</Label>
      <Wire d="M 40 440 H 90" />
      <Label x={24} y={428}>Vmix</Label>
      <CapH x1={90} x2={160} y={440} refDes="C18" value="10µ" />
      <OpAmp x={200} y={452} name="U4D" />
      <Wire d="M 160 440 H 200" />
      <Wire d="M 200 488 H 160 V 540" />
      <ResistorH x1={160} x2={250} y={540} refDes="R40" value="10k" />
      <ResistorH x1={250} x2={340} y={540} refDes="RV2" value="100k" />
      <Wire d="M 340 540 V 452 H 270" />
      <Label x={250} y={528}>gain 1…11 · 0 to +21 dB</Label>
      <ResistorH x1={270} x2={360} y={452} refDes="R41" value="220" />
      <CapH x1={360} x2={430} y={452} refDes="C19" value="10µ" />
      <Dot x={450} y={452} />
      <ResistorV x={450} y1={452} y2={520} refDes="R42" value="100k" />
      <Gnd x={450} y={520} />
      <Wire d="M 450 452 H 520" />
      <Label x={500} y={440}>OUT</Label>
      <rect
        x="24"
        y="560"
        width="700"
        height="44"
        fill="none"
        stroke={ink}
        strokeDasharray="3 3"
      />
      <Label x={36} y={586}>
        U1 = TL074. Bipolar ±9 V. Keep PT2257 analog traces away from SCL/SDA.
      </Label>
    </SchematicFrame>
  );
}
