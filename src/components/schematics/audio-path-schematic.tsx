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
      rev="E"
      title="Audio path — input, dual PT2257 taps, makeup"
      viewBox="0 0 1200 620"
      notes="Both PT2257 channels see the same buffered guitar signal. The IC is single-supply and internally biased near VDD/2, so C12–C15 are required. After those caps the interpolator works around analog ground. Keep the two channel layouts symmetrical; 0.5 dB of tracking error is already the IC limit. U1 = TL074 on ±9 V. Makeup (U4D) is 1 to 11. Keep PT2257 analog traces away from SCL/SDA."
    >
      <Txt x={24} y={28} size={12} weight="bold">
        Input buffer
      </Txt>

      <Port x={36} y={100} label="IN" />
      <CapH x1={48} x2={130} y={100} refDes="C10" value="1u" />
      <Dot x={148} y={100} />
      <ResistorV x={148} y1={100} y2={180} refDes="R10" value="1M" label="left" />
      <Gnd x={148} y={180} />
      <ResistorH x1={148} x2={250} y={100} refDes="R11" value="100" />
      <Dot x={220} y={100} />
      <CapV x={220} y1={100} y2={170} refDes="C11" value="220p" label="left" />
      <Gnd x={220} y={170} />
      <Wire d="M 250 100 V 84 H 280" />
      <OpAmp x={280} y={100} name="U1A" />
      <Wire d="M 280 116 H 266 V 160 H 344 V 100" />
      <Wire d="M 344 100 H 410" />
      <Dot x={410} y={100} />
      <Txt x={418} y={92}>Vbuf</Txt>

      <Wire d="M 410 100 H 470" />
      <ResistorH x1={470} x2={580} y={100} refDes="R13" value="10k" />
      <CapH x1={600} x2={710} y={100} refDes="C13" value="10u" />
      <Wire d="M 580 100 H 600" />
      <Wire d="M 710 100 H 728" />

      <Wire d="M 410 100 V 230 H 470" />
      <ResistorH x1={470} x2={580} y={230} refDes="R12" value="10k" />
      <CapH x1={600} x2={710} y={230} refDes="C12" value="10u" />
      <Wire d="M 580 230 H 600" />
      <Wire d="M 710 230 H 728" />

      <Wire d="M 410 100 V 300" />
      <Port x={410} y={300} label="Vbuf DWG-02" dir="out" />

      <Chip
        x={740}
        y={48}
        w={170}
        h={220}
        name="U6 PT2257"
        pins={[
          { side: "L", n: 8, label: "RIN", yy: 100 },
          { side: "L", n: 4, label: "SDA", yy: 140 },
          { side: "L", n: 5, label: "SCL", yy: 170 },
          { side: "L", n: 1, label: "LIN", yy: 230 },
          { side: "R", n: 7, label: "ROUT", yy: 100 },
          { side: "R", n: 2, label: "LOUT", yy: 230 },
        ]}
      />

      <Wire d="M 740 140 H 700 V 290" />
      <Port x={700} y={290} label="SDA DWG-05" dir="out" />
      <Wire d="M 740 170 H 680 V 320" />
      <Port x={680} y={320} label="SCL DWG-05" dir="out" />

      <CapH x1={922} x2={1020} y={100} refDes="C15" value="10u" />
      <Dot x={1020} y={100} />
      <ResistorV x={1020} y1={100} y2={168} refDes="R16" value="100k" label="left" />
      <Gnd x={1020} y={168} />
      <Wire d="M 1020 100 V 84 H 1048" />
      <OpAmp x={1048} y={100} name="U1C" />
      <Wire d="M 1048 116 H 1034 V 155 H 1112 V 100" />
      <Wire d="M 1112 100 H 1160" />
      <Port x={1160} y={100} label="VB" dir="out" />

      <CapH x1={922} x2={1020} y={230} refDes="C14" value="10u" />
      <Dot x={1020} y={230} />
      <ResistorV x={1020} y1={230} y2={298} refDes="R15" value="100k" label="left" />
      <Gnd x={1020} y={298} />
      <Wire d="M 1020 230 V 214 H 1048" />
      <OpAmp x={1048} y={230} name="U1B" />
      <Wire d="M 1048 246 H 1034 V 285 H 1112 V 230" />
      <Wire d="M 1112 230 H 1160" />
      <Port x={1160} y={230} label="VA" dir="out" />

      <Txt x={24} y={380} size={12} weight="bold">
        Makeup after interpolator
      </Txt>
      <Port x={36} y={440} label="Vmix" />
      <CapH x1={48} x2={140} y={440} refDes="C18" value="10u" />
      <Wire d="M 140 440 V 424 H 180" />
      <OpAmp x={180} y={440} name="U4D" />
      <Wire d="M 180 456 H 164 V 520" />
      <ResistorH x1={164} x2={280} y={520} refDes="R40" value="10k" label="below" />
      <ResistorH x1={280} x2={410} y={520} refDes="RV2" value="100k" label="below" />
      <Dot x={350} y={520} />
      <Wire d="M 410 520 H 350" />
      <Wire d="M 350 520 V 440 H 244" />
      <ResistorH x1={244} x2={360} y={440} refDes="R41" value="220" />
      <CapH x1={360} x2={470} y={440} refDes="C19" value="10u" />
      <Dot x={470} y={440} />
      <ResistorV x={470} y1={440} y2={520} refDes="R42" value="100k" />
      <Gnd x={470} y={520} />
      <Wire d="M 470 440 H 560" />
      <Port x={560} y={440} label="OUT" dir="out" />
    </SchematicFrame>
  );
}
