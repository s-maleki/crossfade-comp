import {
  CapH,
  CapV,
  Chip,
  Dot,
  Gnd,
  OpAmp,
  Port,
  ResistorH,
  ResistorV,
  SchematicFrame,
  Txt,
  Wire,
} from "./symbols";

export function AudioPathSchematic() {
  return (
    <SchematicFrame
      dwg="DWG-01"
      rev="D"
      title="Audio path — input, dual PT2257 taps, makeup"
      viewBox="0 0 1180 540"
      notes="Both PT2257 channels see the same buffered guitar signal. The IC is single-supply and internally biased near VDD/2, so C12–C15 are required. After those caps the interpolator works around analog ground. Keep the two channel layouts symmetrical; 0.5 dB of tracking error is already the IC limit."
    >
      <Txt x={24} y={22} size={12} weight="bold">
        Input buffer
      </Txt>
      <Txt x={24} y={70}>IN</Txt>
      <Wire d="M 48 70 H 70" />
      <CapH x1={70} x2={140} y={70} refDes="C10" value="1u" />
      <Dot x={160} y={70} />
      <ResistorV x={160} y1={70} y2={140} refDes="R10" value="1M" />
      <Gnd x={160} y={140} />
      <ResistorH x1={160} x2={250} y={70} refDes="R11" value="100" />
      <Dot x={230} y={70} />
      <CapV x={230} y1={70} y2={130} refDes="C11" value="220p" />
      <Gnd x={230} y={130} />
      <Wire d="M 250 70 V 54 H 280" />
      <OpAmp x={280} y={70} name="U1A" />
      <Wire d="M 280 86 H 268 V 118 H 344 V 70" />
      <Wire d="M 344 70 H 400" />
      <Dot x={400} y={70} />
      <Txt x={408} y={62}>Vbuf</Txt>

      <Wire d="M 400 70 V 28 H 490" />
      <ResistorH x1={490} x2={600} y={28} refDes="R13" value="10k" />
      <CapH x1={620} x2={728} y={28} refDes="C13" value="10u" />
      <Wire d="M 600 28 H 620" />

      <Wire d="M 400 70 V 170 H 490" />
      <ResistorH x1={490} x2={600} y={170} refDes="R12" value="10k" />
      <CapH x1={620} x2={728} y={170} refDes="C12" value="10u" />
      <Wire d="M 600 170 H 620" />

      <Wire d="M 400 70 V 220 H 420" />
      <Port x={420} y={220} label="to DWG-02" dir="out" />

      <Chip
        x={740}
        y={4}
        w={160}
        h={200}
        name="U6 PT2257"
        pins={[
          { side: "L", n: 8, label: "RIN", yy: 28 },
          { side: "L", n: 4, label: "SDA", yy: 80 },
          { side: "L", n: 5, label: "SCL", yy: 110 },
          { side: "L", n: 1, label: "LIN", yy: 170 },
          { side: "R", n: 7, label: "ROUT", yy: 50 },
          { side: "R", n: 2, label: "LOUT", yy: 150 },
        ]}
      />
      <Txt x={740} y={224} size={10}>
        VDD +9 V · VSS 0 V
      </Txt>
      <Wire d="M 740 80 H 700 V 250" />
      <Dot x={700} y={250} />
      <Txt x={708} y={254} size={10}>
        SDA
      </Txt>
      <Wire d="M 740 110 H 712 V 270" />
      <Dot x={712} y={270} />
      <Txt x={720} y={274} size={10}>
        SCL · 4.7k to +5 V · DWG-05
      </Txt>

      <CapH x1={912} x2={1008} y={50} refDes="C15" value="10u" />
      <Dot x={1008} y={50} />
      <ResistorV x={1008} y1={50} y2={110} refDes="R16" value="100k" />
      <Gnd x={1008} y={110} />
      <Wire d="M 1008 50 H 1040" />
      <OpAmp x={1040} y={66} name="U1C" />
      <Wire d="M 1040 82 H 1028 V 118 H 1104 V 66" />
      <Wire d="M 1104 66 H 1155" />
      <Txt x={1160} y={70}>VB</Txt>

      <CapH x1={912} x2={1008} y={150} refDes="C14" value="10u" />
      <Dot x={1008} y={150} />
      <Wire d="M 1008 150 H 1040" />
      <OpAmp x={1040} y={166} name="U1B" />
      <ResistorV x={1008} y1={150} y2={214} refDes="R15" value="100k" />
      <Gnd x={1008} y={214} />
      <Wire d="M 1040 182 H 1028 V 214 H 1104 V 166" />
      <Wire d="M 1104 166 H 1155" />
      <Txt x={1160} y={170}>VA</Txt>

      <Txt x={24} y={320} size={12} weight="bold">
        Makeup after interpolator
      </Txt>
      <Txt x={24} y={360}>Vmix</Txt>
      <Wire d="M 58 360 H 80" />
      <CapH x1={80} x2={160} y={360} refDes="C18" value="10u" />
      <Wire d="M 160 360 V 344 H 200" />
      <OpAmp x={200} y={360} name="U4D" />
      <Wire d="M 200 376 H 188 V 430" />
      <ResistorH x1={188} x2={300} y={430} refDes="R40" value="10k" />
      <ResistorH x1={300} x2={420} y={430} refDes="RV2" value="100k" />
      <Wire d="M 420 430 H 360" />
      <Dot x={360} y={430} />
      <Wire d="M 360 430 V 360 H 264" />
      <Txt x={430} y={424} size={10}>
        gain 1 to 11
      </Txt>
      <ResistorH x1={264} x2={370} y={360} refDes="R41" value="220" />
      <CapH x1={370} x2={470} y={360} refDes="C19" value="10u" />
      <Dot x={470} y={360} />
      <ResistorV x={470} y1={360} y2={430} refDes="R42" value="100k" />
      <Gnd x={470} y={430} />
      <Wire d="M 470 360 H 540" />
      <Txt x={550} y={364}>OUT</Txt>
      <Txt x={24} y={510} size={10}>
        U1 = TL074 on +/-9 V. Keep PT2257 analog traces away from SCL/SDA.
      </Txt>
    </SchematicFrame>
  );
}
