import {
  Dot,
  Gnd,
  Jfet,
  OpAmp,
  Port,
  ResistorH,
  ResistorV,
  SchematicFrame,
  TrimmerCapH,
  Txt,
  Wire,
} from "./symbols";

export function CrossfaderSchematic() {
  return (
    <SchematicFrame
      dwg="DWG-04"
      rev="G"
      title="Voltage-controlled crossfader · difference interpolator + Cgd cancel"
      viewBox="0 0 1200 780"
      notes="Vdiff = VB − VA. Half-Vds linearization is R65 (Vgs to gate) and R66 (drain to gate). Parasitic Cgd dumps dVgs/dt onto Vk′; CV1 from −Vgs lands on that same drain (Ctrim ≈ Cgd, typically 2–6 pF at Vds ≈ 0). U2B is an inverting summer, so Vmix is polarity-flipped relative to the guitar — makeup does not care. |B−A|/|A| = 0.1087 at 1 dB. 4 pF · 3.5 V / 0.25 ms into 22 kΩ is a 1.2 mV tick. Do not tap D2 for CV1. Do not snub Vgs with 1 kΩ+1 nF unless you want to slow attack. R73 sits at U2D pin 14; optional 22 pF across R72. Trim RV1: Vk = 5 V, Q10 just pinched off. Vk′ and −Vgs continue on the named ports — they are not wrapped around the sheet."
    >
      <Txt x={24} y={28} size={12} weight="bold">
        Difference amp
      </Txt>
      <Txt x={430} y={28} size={12} weight="bold">
        JFET shunt
      </Txt>
      <Txt x={780} y={28} size={12} weight="bold">
        Drain neutralization
      </Txt>

      <Port x={36} y={96} label="VB" />
      <ResistorH x1={48} x2={150} y={96} refDes="R60" value="10k" />
      <Dot x={150} y={96} />
      <Wire d="M 150 96 H 200" />
      <ResistorV x={150} y1={96} y2={176} refDes="R63" value="10k" label="left" />
      <Gnd x={150} y={176} />

      <Port x={36} y={128} label="VA" />
      <ResistorH x1={48} x2={184} y={128} refDes="R61" value="10k" label="below" />
      <Dot x={184} y={128} />
      <Wire d="M 184 128 H 200" />

      <OpAmp x={200} y={112} name="U2A" />
      <ResistorH x1={264} x2={184} y={60} refDes="R62" value="10k" />
      <Wire d="M 264 60 V 112" />
      <Wire d="M 184 60 V 128" />

      <Wire d="M 264 112 H 300" />
      <Txt x={270} y={132}>Vdiff</Txt>
      <ResistorH x1={300} x2={430} y={112} refDes="R64" value="22k" />
      <Wire d="M 430 112 H 500" />
      <Dot x={500} y={112} />

      <Jfet x={500} y={208} name="Q10 2N5457" />
      <Wire d="M 500 112 V 190" />
      <Wire d="M 500 226 V 280" />
      <Gnd x={500} y={280} />

      <ResistorV x={430} y1={112} y2={208} refDes="R66" value="470k" label="left" />
      <Dot x={430} y={112} />
      <Dot x={430} y={208} />
      <Wire d="M 430 208 H 482" />

      <Dot x={310} y={208} />
      <ResistorH x1={310} x2={482} y={208} refDes="R65" value="470k" label="below" />
      <Wire d="M 310 208 V 400" />
      <Txt x={322} y={198}>Vgs</Txt>

      <Dot x={640} y={112} />
      <Wire d="M 500 112 H 790" />
      <Txt x={648} y={100}>Vk′</Txt>
      <TrimmerCapH x1={790} x2={910} y={112} refDes="CV1" value="2-10p" />
      <Wire d="M 910 112 H 960" />
      <Port x={960} y={112} label="−Vgs" dir="out" />

      <Wire d="M 640 112 V 250" />
      <Port x={640} y={250} label="Vk′" dir="out" />

      <Txt x={24} y={318} size={12} weight="bold">
        Vgs driver
      </Txt>
      <Txt x={980} y={318} size={12} weight="bold">
        U2D invert
      </Txt>

      <Port x={36} y={416} label="Vk 0–5 V" />
      <ResistorH x1={48} x2={184} y={416} refDes="R70" value="22k" label="below" />
      <Dot x={184} y={416} />
      <Wire d="M 184 416 H 200" />
      <OpAmp x={200} y={400} name="U2C" />
      <Wire d="M 200 384 H 172 V 470" />
      <Gnd x={172} y={470} />
      <ResistorH x1={264} x2={184} y={348} refDes="RV1" value="10k trim" />
      <Wire d="M 264 348 V 400" />
      <Wire d="M 184 348 V 416" />
      <Wire d="M 264 400 H 310" />
      <Dot x={310} y={400} />

      <Wire d="M 310 400 H 620 V 416" />
      <ResistorH x1={620} x2={700} y={416} refDes="R71" value="10k" label="below" />
      <OpAmp x={700} y={400} name="U2D" />
      <Wire d="M 700 384 H 684 V 470" />
      <Gnd x={684} y={470} />
      <ResistorH x1={764} x2={680} y={348} refDes="R72" value="10k" />
      <Dot x={680} y={348} />
      <Dot x={680} y={416} />
      <Wire d="M 764 348 V 400" />
      <Wire d="M 680 348 V 416" />
      <Wire d="M 764 400 H 820" />
      <Txt x={770} y={388}>−Vgs</Txt>
      <ResistorH x1={820} x2={940} y={400} refDes="R73" value="1k" />
      <Wire d="M 940 400 H 1000" />
      <Port x={1000} y={400} label="−Vgs" dir="out" />

      <Txt x={24} y={508} size={12} weight="bold">
        Recombine · Vmix = −(VA + Vk′)
      </Txt>

      <Port x={36} y={626} label="VA" />
      <ResistorH x1={48} x2={184} y={626} refDes="R67" value="10k" label="below" />
      <Dot x={184} y={626} />
      <Wire d="M 184 626 H 200" />
      <OpAmp x={200} y={610} name="U2B" />
      <Wire d="M 200 594 H 172 V 680" />
      <Gnd x={172} y={680} />
      <ResistorH x1={264} x2={184} y={556} refDes="R69" value="10k" />
      <Wire d="M 264 556 V 610" />
      <Wire d="M 184 556 V 626" />
      <Wire d="M 264 610 H 380" />
      <Port x={380} y={610} label="Vmix DWG-01" dir="out" />

      <Port x={36} y={720} label="Vk′" />
      <ResistorH x1={48} x2={184} y={720} refDes="R68" value="10k" />
      <Dot x={184} y={720} />
      <Wire d="M 184 720 V 626" />
    </SchematicFrame>
  );
}
