import {
  Dot,
  Gnd,
  ink,
  Jfet,
  OpAmp,
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
      rev="C"
      title="Voltage-controlled crossfader · difference interpolator + Cgd cancel"
      viewBox="0 0 1180 900"
      notes="The JFET only sees B−A, about 10.9 % of tap A at 1 dB. Internal Cgd dumps dVgs/dt onto the drain (Vk′). CV1, driven from −Vgs, lands on that same drain — not on the gate. U2C is a voltage source, so a capacitor into the gate is absorbed and Cgd current does not change. Invert Vgs after RV1 so pinch-off trim is inside the cancel loop. Do not tap the D2 / U5 k-triangle invert; that is a different signal."
    >
      <Txt x={24} y={28} size={12} weight="bold">
        Difference amp · Vdiff = VB − VA
      </Txt>
      <Txt x={24} y={70}>VB</Txt>
      <Wire d="M 50 70 H 80" />
      <ResistorH x1={80} x2={180} y={70} refDes="R60" value="10k" />
      <Wire d="M 180 70 V 54 H 220" />
      <OpAmp x={220} y={70} name="U2A" />
      <ResistorH x1={284} x2={180} y={30} refDes="R62" value="10k" />
      <Wire d="M 180 30 V 70" />

      <Txt x={24} y={130}>VA</Txt>
      <Wire d="M 50 130 H 80" />
      <ResistorH x1={80} x2={180} y={130} refDes="R61" value="10k" />
      <Wire d="M 180 130 V 86 H 220" />
      <ResistorV x={180} y1={130} y2={190} refDes="R63" value="10k" />
      <Gnd x={180} y={190} />
      <Wire d="M 284 70 H 340" />
      <Txt x={348} y={66}>Vdiff</Txt>

      <Txt x={430} y={28} size={12} weight="bold">
        Linearized N-JFET shunt
      </Txt>
      <ResistorH x1={340} x2={440} y={70} refDes="R64" value="22k" />
      <Dot x={470} y={70} />
      <Txt x={478} y={56}>Vk′</Txt>
      <Jfet x={470} y={140} name="Q10 2N5457" />
      <Wire d="M 470 70 V 122" />
      <Wire d="M 470 158 V 200" />
      <Gnd x={470} y={200} />
      <ResistorH x1={452} x2={370} y={140} refDes="R65" value="470k" />
      <Wire d="M 370 140 V 200" />
      <Gnd x={370} y={200} />
      <ResistorH x1={470} x2={550} y={158} refDes="R66" value="470k" />
      <Wire d="M 370 140 H 360 V 300" />

      <path
        d="M 488 122 V 130"
        fill="none"
        stroke={ink}
        strokeWidth="1.2"
        strokeDasharray="3 2"
      />
      <path d="M 482 130 h 12" stroke={ink} strokeWidth="1.4" />
      <path d="M 482 138 h 12" stroke={ink} strokeWidth="1.4" />
      <path
        d="M 488 138 V 148"
        fill="none"
        stroke={ink}
        strokeWidth="1.2"
        strokeDasharray="3 2"
      />
      <Txt x={506} y={136} size={10}>
        Cgd internal
      </Txt>

      <Txt x={700} y={28} size={12} weight="bold">
        Neutralization onto the drain
      </Txt>
      <Wire d="M 470 70 H 620" />
      <Dot x={620} y={70} />
      <TrimmerCapH x1={620} x2={730} y={70} refDes="CV1" value="2-10p" />
      <Txt x={626} y={108} size={10}>
        Ctrim ≈ Cgd (2–6 pF at Vds ≈ 0)
      </Txt>
      <Wire d="M 730 70 H 1100 V 480" />
      <Dot x={1100} y={480} />

      <Txt x={24} y={228} size={12} weight="bold">
        Vgs driver · invert Vk, include pinch-off trim
      </Txt>
      <Txt x={24} y={300}>Vk 0–5 V</Txt>
      <Wire d="M 90 300 H 120" />
      <ResistorH x1={120} x2={210} y={300} refDes="R70" value="22k" />
      <Wire d="M 210 300 V 316 H 250" />
      <Dot x={210} y={300} />
      <OpAmp x={250} y={300} name="U2C" />
      <Wire d="M 250 284 H 200 V 380" />
      <Gnd x={200} y={380} />
      <ResistorH x1={314} x2={210} y={260} refDes="RV1" value="10k trim" />
      <Wire d="M 314 260 V 300" />
      <Wire d="M 210 260 V 316" />
      <Wire d="M 314 300 H 400" />
      <Dot x={360} y={300} />
      <Txt x={410} y={296}>Vgs 0 to −Vp</Txt>
      <Txt x={410} y={318} size={10}>
        trim: Vk = 5 V, Q10 just pinched off
      </Txt>

      <rect
        x={24}
        y={410}
        width={1140}
        height={200}
        fill="none"
        stroke={ink}
        strokeWidth="1.1"
        strokeDasharray="5 3"
        rx="6"
      />
      <Txt x={500} y={432} size={12} weight="bold">
        −Vgs generator · U2D spare of the same TL074
      </Txt>
      <Txt x={40} y={480}>Vgs</Txt>
      <Wire d="M 400 300 V 480 H 80" />
      <ResistorH x1={80} x2={180} y={480} refDes="R71" value="10k" />
      <Wire d="M 180 480 V 496 H 220" />
      <Dot x={180} y={480} />
      <OpAmp x={220} y={480} name="U2D" />
      <Wire d="M 220 464 H 170 V 560" />
      <Gnd x={170} y={560} />
      <ResistorH x1={284} x2={180} y={440} refDes="R72" value="10k" />
      <Wire d="M 284 440 V 480" />
      <Wire d="M 180 440 V 496" />
      <Wire d="M 284 480 H 360" />
      <Txt x={370} y={476}>Vgs_inv = −Vgs</Txt>
      <ResistorH x1={360} x2={470} y={480} refDes="R73" value="1k" />
      <Wire d="M 470 480 H 1100" />
      <Txt x={360} y={518} size={10}>
        R73 at U2D pin 14, then a short run to CV1. Optional 22p C0G across R72 if the invert rings.
      </Txt>
      <Txt x={360} y={540} size={10}>
        Unity invert so Ctrim = Cgd. Do not drive CV1 from Vk (0–5 V) or from Nano D2.
      </Txt>

      <Txt x={24} y={640} size={12} weight="bold">
        Recombine · Vmix = VA + k(VB − VA)
      </Txt>
      <Txt x={24} y={690}>VA</Txt>
      <Wire d="M 50 690 H 80" />
      <ResistorH x1={80} x2={180} y={690} refDes="R67" value="10k" />
      <Wire d="M 180 690 V 674 H 220" />
      <OpAmp x={220} y={690} name="U2B" />
      <Wire d="M 470 70 V 16 H 1160 V 690 H 284" />
      <ResistorH x1={180} x2={220} y={706} refDes="R68" value="10k" />
      <ResistorV x={180} y1={706} y2={770} refDes="R69" value="10k" />
      <Gnd x={180} y={770} />
      <Wire d="M 284 690 H 400" />
      <Txt x={410} y={694}>Vmix to makeup DWG-01</Txt>

      <Txt x={700} y={660} size={10}>
        |B−A|/|A| = 0.1087 at 1 dB. 0.5 % JFET THD on Vdiff ≈ 0.05 % audio.
      </Txt>
      <Txt x={700} y={680} size={10}>
        k=0 isolation: 200 Ω / 22 kΩ ≈ 41 dB on Vdiff, ~60 dB vs VA.
      </Txt>
      <Txt x={700} y={708} size={10}>
        Drain current i = Cgd · dVgs/dt. Cancel i = Ctrim · d(−Vgs)/dt.
      </Txt>
      <Txt x={700} y={728} size={10}>
        4 pF · 3.5 V / 0.25 ms into 22 kΩ is a 1.2 mV tick (−41 dB on 100 mVrms).
      </Txt>
      <Txt x={700} y={748} size={10}>
        Do not put CV1 on the gate. Do not snub Vgs with 1 kΩ+1 nF unless you
      </Txt>
      <Txt x={700} y={768} size={10}>
        want to slow attack; neutralization keeps dVgs/dt.
      </Txt>
    </SchematicFrame>
  );
}
