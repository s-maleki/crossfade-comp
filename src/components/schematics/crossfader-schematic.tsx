import {
  Dot,
  Gnd,
  ink,
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
      rev="D"
      title="Voltage-controlled crossfader · difference interpolator + Cgd cancel"
      viewBox="0 0 1180 780"
      notes="Vdiff = VB − VA. Half-Vds linearization is R65 (Vgs to gate) and R66 (drain to gate). Cgd dumps dVgs/dt onto Vk′; CV1 from −Vgs lands on that same drain. U2B is an inverting summer, so Vmix is polarity-flipped relative to the guitar — makeup does not care. Do not tap D2 for CV1."
    >
      <Txt x={24} y={24} size={12} weight="bold">
        Difference amp · Vdiff = VB − VA
      </Txt>

      <Port x={36} y={64} label="VB" />
      <ResistorH x1={46} x2={150} y={64} refDes="R60" value="10k" />
      <Dot x={150} y={64} />
      <Wire d="M 150 64 H 220" />
      <ResistorV x={150} y1={64} y2={140} refDes="R63" value="10k" />
      <Gnd x={150} y={140} />

      <Port x={36} y={96} label="VA" />
      <ResistorH x1={46} x2={190} y={96} refDes="R61" value="10k" />
      <Dot x={190} y={96} />
      <Wire d="M 190 96 H 220" />
      <OpAmp x={220} y={80} name="U2A" />
      <ResistorH x1={284} x2={190} y={36} refDes="R62" value="10k" />
      <Wire d="M 284 36 V 80" />
      <Wire d="M 190 36 V 96" />

      <Wire d="M 284 80 H 330" />
      <Txt x={300} y={72}>Vdiff</Txt>
      <ResistorH x1={330} x2={450} y={80} refDes="R64" value="22k" />
      <Wire d="M 450 80 H 500" />
      <Dot x={500} y={80} />
      <Txt x={508} y={68}>Vk′</Txt>

      <Txt x={430} y={24} size={12} weight="bold">
        Linearized N-JFET shunt
      </Txt>
      <Jfet x={500} y={148} name="Q10 2N5457" />
      <Wire d="M 500 80 V 130" />
      <Wire d="M 500 166 V 220" />
      <Gnd x={500} y={220} />

      <Dot x={360} y={148} />
      <ResistorH x1={360} x2={482} y={148} refDes="R65" value="470k" />
      <Wire d="M 500 80 H 575" />
      <Dot x={575} y={80} />
      <ResistorV x={575} y1={80} y2={148} refDes="R66" value="470k" />
      <Wire d="M 575 148 V 190 H 478 V 148 H 482" />
      <Dot x={478} y={148} />

      <path
        d="M 500 130 H 530"
        fill="none"
        stroke={ink}
        strokeWidth="1.2"
        strokeDasharray="3 2"
      />
      <path d="M 530 124 v 12" stroke={ink} strokeWidth="1.5" />
      <path d="M 538 124 v 12" stroke={ink} strokeWidth="1.5" />
      <path
        d="M 538 130 V 148 H 482"
        fill="none"
        stroke={ink}
        strokeWidth="1.2"
        strokeDasharray="3 2"
      />
      <Txt x={544} y={122} size={10}>
        Cgd
      </Txt>

      <Txt x={700} y={24} size={12} weight="bold">
        Neutralization onto the drain
      </Txt>
      <Wire d="M 575 80 H 640" />
      <TrimmerCapH x1={640} x2={750} y={80} refDes="CV1" value="2-10p" />
      <Wire d="M 750 80 H 1060" />
      <Dot x={1060} y={80} />
      <Wire d="M 1060 80 V 300" />
      <Dot x={1060} y={300} />
      <Txt x={760} y={112} size={10}>
        Ctrim ≈ Cgd, 2–6 pF at Vds ≈ 0
      </Txt>

      <Txt x={24} y={252} size={12} weight="bold">
        Vgs driver
      </Txt>
      <Port x={36} y={316} label="Vk" />
      <Txt x={24} y={332} size={10}>
        0–5 V
      </Txt>
      <ResistorH x1={46} x2={180} y={316} refDes="R70" value="22k" />
      <Dot x={180} y={316} />
      <Wire d="M 180 316 H 220" />
      <OpAmp x={220} y={300} name="U2C" />
      <Wire d="M 220 284 H 188 V 370" />
      <Gnd x={188} y={370} />
      <ResistorH x1={284} x2={180} y={264} refDes="RV1" value="10k trim" />
      <Wire d="M 284 264 V 300" />
      <Wire d="M 180 264 V 316" />
      <Wire d="M 284 300 H 400" />
      <Dot x={360} y={300} />
      <Wire d="M 360 300 V 148" />
      <Txt x={372} y={292}>Vgs 0 to −Vp</Txt>
      <Txt x={372} y={328} size={10}>
        trim: Vk = 5 V, Q10 just pinched off
      </Txt>

      <rect
        x={430}
        y={244}
        width={720}
        height={140}
        fill="none"
        stroke={ink}
        strokeWidth="1.1"
        strokeDasharray="5 3"
        rx="6"
      />
      <Txt x={444} y={264} size={12} weight="bold">
        −Vgs generator · U2D
      </Txt>
      <Wire d="M 400 300 V 316 H 470" />
      <ResistorH x1={470} x2={540} y={316} refDes="R71" value="10k" />
      <Dot x={540} y={316} />
      <Wire d="M 540 316 H 560" />
      <OpAmp x={560} y={300} name="U2D" />
      <Wire d="M 560 284 H 548 V 370" />
      <Gnd x={548} y={370} />
      <ResistorH x1={624} x2={540} y={264} refDes="R72" value="10k" />
      <Wire d="M 624 264 V 300" />
      <Wire d="M 540 264 V 316" />
      <Wire d="M 624 300 H 700" />
      <Txt x={632} y={288}>Vgs_inv</Txt>
      <ResistorH x1={700} x2={820} y={300} refDes="R73" value="1k" />
      <Wire d="M 820 300 H 1060" />
      <Txt x={700} y={368} size={10}>
        R73 at U2D pin 14. Optional 22p across R72.
      </Txt>

      <Txt x={24} y={430} size={12} weight="bold">
        Recombine · Vmix = −(VA + Vk′)
      </Txt>
      <Port x={36} y={576} label="VA" />
      <ResistorH x1={46} x2={180} y={576} refDes="R67" value="10k" />
      <Dot x={180} y={576} />
      <Wire d="M 180 576 H 220" />
      <OpAmp x={220} y={560} name="U2B" />
      <Wire d="M 220 544 H 188 V 650" />
      <Gnd x={188} y={650} />
      <ResistorH x1={284} x2={180} y={512} refDes="R69" value="10k" />
      <Wire d="M 284 512 V 560" />
      <Wire d="M 180 512 V 576" />
      <Wire d="M 284 560 H 400" />
      <Port x={400} y={560} label="Vmix" dir="out" />
      <Txt x={408} y={578} size={10}>
        to makeup DWG-01
      </Txt>

      <Wire d="M 500 80 V 16 H 1140" />
      <Dot x={500} y={16} />
      <Dot x={1140} y={16} />
      <Wire d="M 1140 16 V 576" />
      <Dot x={1140} y={576} />
      <ResistorH x1={980} x2={1140} y={576} refDes="R68" value="10k" />
      <Dot x={980} y={576} />
      <Wire d="M 980 576 V 505 H 180 V 576" />

      <Txt x={430} y={432} size={10}>
        |B−A|/|A| = 0.1087 at 1 dB. Inverting summer: overall guitar polarity flips; k law is unchanged.
      </Txt>
      <Txt x={430} y={452} size={10}>
        4 pF · 3.5 V / 0.25 ms into 22 kΩ is a 1.2 mV tick. CV1 nulls it at the drain, not the gate.
      </Txt>
      <Txt x={430} y={472} size={10}>
        Do not snub Vgs with 1 kΩ+1 nF unless you want to slow attack.
      </Txt>
    </SchematicFrame>
  );
}
