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
      rev="H"
      title="Audio path — input, dual PT2257 taps, makeup"
      viewBox="0 0 1200 640"
      notes="Both PT2257 channels see the same buffered guitar signal. The IC is single-supply and internally biased near VDD/2, so C12–C15 are required. After those caps the interpolator works around analog ground. Keep the two channel layouts symmetrical; 0.5 dB of tracking error is already the IC limit. U1 = TL074 on ±9 V. Makeup U4D is non-inverting, gain 1 + RV2/R40 = 1 to 11. C11 is the RF shunt at U1A’s input, after R11. SCL/SDA leave between the analog rows so they never cut LIN or RIN. Keep PT2257 analog traces away from SCL/SDA."
    >
      <Txt x={24} y={28} size={12} weight="bold">
        Input buffer
      </Txt>

      <Port x={36} y={110} label="IN" />
      <CapH x1={48} x2={160} y={110} refDes="C10" value="1u" />
      <Dot x={160} y={110} />
      <ResistorV x={160} y1={110} y2={190} refDes="R10" value="1M" label="left" />
      <Gnd x={160} y={190} />
      <ResistorH x1={160} x2={260} y={110} refDes="R11" value="100" />
      <Dot x={260} y={110} />
      <CapV x={260} y1={110} y2={180} refDes="C11" value="220p" label="left" />
      <Gnd x={260} y={180} />
      <Wire d="M 260 110 V 94 H 330" />
      <OpAmp x={330} y={110} name="U1A" />
      <Wire d="M 330 126 H 316 V 170 H 394 V 110" />
      <Wire d="M 394 110 H 440" />
      <Dot x={440} y={110} />
      <Txt x={448} y={98}>Vbuf</Txt>

      <Wire d="M 440 110 H 510" />
      <ResistorH x1={510} x2={620} y={110} refDes="R13" value="10k" />
      <Wire d="M 620 110 H 640" />
      <CapH x1={640} x2={730} y={110} refDes="C13" value="10u" />
      <Wire d="M 730 110 H 748" />

      <Wire d="M 440 110 V 250" />
      <Dot x={440} y={250} />
      <Wire d="M 440 250 H 510" />
      <ResistorH x1={510} x2={620} y={250} refDes="R12" value="10k" />
      <Wire d="M 620 250 H 640" />
      <CapH x1={640} x2={730} y={250} refDes="C12" value="10u" />
      <Wire d="M 730 250 H 748" />

      <Wire d="M 440 250 V 320" />
      <Port x={440} y={320} label="Vbuf DWG-02" dir="out" />

      <Chip
        x={760}
        y={48}
        w={160}
        h={236}
        name="U6 PT2257"
        pins={[
          { side: "L", n: 8, label: "RIN", yy: 110 },
          { side: "L", n: 4, label: "SDA", yy: 155 },
          { side: "L", n: 5, label: "SCL", yy: 190 },
          { side: "L", n: 1, label: "LIN", yy: 250 },
          { side: "R", n: 7, label: "ROUT", yy: 110 },
          { side: "R", n: 2, label: "LOUT", yy: 250 },
        ]}
      />
      <Txt x={840} y={314} anchor="middle" size={10}>
        VDD +9 V · VSS 0 V
      </Txt>

      <Wire d="M 760 155 H 700" />
      <Port x={700} y={155} label="SDA DWG-05" />
      <Wire d="M 760 190 H 700" />
      <Port x={700} y={190} label="SCL DWG-05" />

      <CapH x1={932} x2={1010} y={110} refDes="C15" value="10u" />
      <Dot x={1010} y={110} />
      <ResistorV x={1010} y1={110} y2={180} refDes="R16" value="100k" label="left" />
      <Gnd x={1010} y={180} />
      <Wire d="M 1010 110 V 94 H 1080" />
      <OpAmp x={1080} y={110} name="U1C" />
      <Wire d="M 1080 126 H 1066 V 168 H 1144 V 110" />
      <Wire d="M 1144 110 H 1195" />
      <Port x={1195} y={110} label="VB" dir="out" />

      <CapH x1={932} x2={1010} y={250} refDes="C14" value="10u" />
      <Dot x={1010} y={250} />
      <ResistorV x={1010} y1={250} y2={320} refDes="R15" value="100k" label="left" />
      <Gnd x={1010} y={320} />
      <Wire d="M 1010 250 V 234 H 1080" />
      <OpAmp x={1080} y={250} name="U1B" />
      <Wire d="M 1080 266 H 1066 V 308 H 1144 V 250" />
      <Wire d="M 1144 250 H 1195" />
      <Port x={1195} y={250} label="VA" dir="out" />

      <Txt x={24} y={318} size={12} weight="bold">
        Makeup after interpolator
      </Txt>
      <Port x={36} y={440} label="Vmix" />
      <CapH x1={48} x2={140} y={440} refDes="C18" value="10u" />
      <Wire d="M 140 440 V 424 H 190" />
      <OpAmp x={190} y={440} name="U4D" />
      <Wire d="M 190 456 H 168" />
      <Dot x={168} y={456} />
      <ResistorV x={168} y1={456} y2={530} refDes="R40" value="10k" label="left" />
      <Gnd x={168} y={530} />
      <ResistorH x1={254} x2={168} y={365} refDes="RV2" value="100k" />
      <Wire d="M 254 365 V 440" />
      <Wire d="M 168 365 V 456" />
      <Wire d="M 254 440 H 300" />
      <ResistorH x1={300} x2={400} y={440} refDes="R41" value="220" />
      <CapH x1={400} x2={500} y={440} refDes="C19" value="10u" />
      <Dot x={500} y={440} />
      <ResistorV x={500} y1={440} y2={520} refDes="R42" value="100k" />
      <Gnd x={500} y={520} />
      <Wire d="M 500 440 H 580" />
      <Port x={580} y={440} label="OUT" dir="out" />
    </SchematicFrame>
  );
}
