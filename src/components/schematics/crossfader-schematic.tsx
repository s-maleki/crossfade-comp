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
      viewBox="0 0 1180 720"
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
      <Txt x={350} y={66}>Vdiff</Txt>

      <Txt x={430} y={28} size={12} weight="bold">
        Linearized N-JFET shunt
      </Txt>
      <ResistorH x1={340} x2={450} y={70} refDes="R64" value="22k" />
      <Dot x={480} y={70} />
      <Txt x={488} y={56}>Vk′</Txt>
      <Jfet x={480} y={140} name="Q10 2N5457" />
      <Wire d="M 480 70 V 122" />
      <Wire d="M 480 158 V 200" />
      <Gnd x={480} y={200} />
      <ResistorH x1={462} x2={380} y={140} refDes="R65" value="470k" />
      <Wire d="M 380 140 V 200" />
      <Gnd x={380} y={200} />
      <ResistorH x1={480} x2={560} y={158} refDes="R66" value="470k" />
      <Wire d="M 380 140 H 360 V 290" />

      <path
        d="M 498 122 V 132"
        fill="none"
        stroke={ink}
        strokeWidth="1.2"
        strokeDasharray="3 2"
      />
      <path
        d="M 492 132 h 12"
        stroke={ink}
        strokeWidth="1.4"
        strokeDasharray="3 2"
      />
      <path
        d="M 492 140 h 12"
        stroke={ink}
        strokeWidth="1.4"
        strokeDasharray="3 2"
      />
      <path
        d="M 498 140 V 148"
        fill="none"
        stroke={ink}
        strokeWidth="1.2"
        strokeDasharray="3 2"
      />
      <Txt x={516} y={138} size={10}>
        Cgd internal
      </Txt>

      <Txt x={640} y={28} size={12} weight="bold">
        Neutralization · onto the drain
      </Txt>
      <Wire d="M 480 70 H 590" />
      <Dot x={590} y={70} />
      <TrimmerCapH x1={590} x2={700} y={70} refDes="CV1" value="2-10p" />
      <Txt x={640} y={108} size={10}>
        Ctrim ≈ Cgd, 2–6 pF at Vds ≈ 0
      </Txt>
      <Wire d="M 700 70 H 820 V 306" />
      <Dot x={820} y={306} />

      <Txt x={24} y={250} size={12} weight="bold">
        Vgs driver · invert Vk, include pinch-off trim
      </Txt>
      <Txt x={24} y={306}>Vk 0–5 V</Txt>
      <Wire d="M 90 306 H 120" />
      <ResistorH x1={120} x2={210} y={306} refDes="R70" value="22k" />
      <Wire d="M 210 306 H 250" />
      <Dot x={210} y={306} />
      <OpAmp x={250} y={290} name="U2C" />
      <Wire d="M 250 274 H 200 V 370" />
      <Gnd x={200} y={370} />
      <ResistorH x1={314} x2={210} y={250} refDes="RV1" value="10k trim" />
      <Wire d="M 314 250 V 290" />
      <Wire d="M 210 250 V 306" />
      <Wire d="M 314 290 H 360" />
      <Dot x={360} y={290} />
      <Txt x={370} y={282}>Vgs 0 to −Vp</Txt>
      <Txt x={360} y={328} size={10}>
        trim: Vk=5 V, Q10 just pinched off
      </Txt>

      <rect
        x={400}
        y={230}
        width={530}
        height={168}
        fill="none"
        stroke={ink}
        strokeWidth="1.1"
        strokeDasharray="5 3"
        rx="6"
      />
      <Txt x={700} y={248} size={12} weight="bold">
        −Vgs generator · U2D spare of TL074
      </Txt>
      <Wire d="M 360 290 V 306 H 420" />
      <ResistorH x1={420} x2={520} y={306} refDes="R71" value="10k" />
      <Wire d="M 520 306 H 560" />
      <Dot x={520} y={306} />
      <OpAmp x={560} y={290} name="U2D" />
      <Wire d="M 560 274 H 540 V 370" />
      <Gnd x={540} y={370} />
      <ResistorH x1={624} x2={520} y={250} refDes="R72" value="10k" />
      <Wire d="M 624 250 V 290" />
      <Wire d="M 520 250 V 306" />
      <Wire d="M 624 290 H 680" />
      <Txt x={632} y={282}>Vgs_inv</Txt>
      <Wire d="M 680 290 V 306" />
      <ResistorH x1={680} x2={780} y={306} refDes="R73" value="1k" />
      <Wire d="M 780 306 H 820" />
      <Txt x={516} y={388} size={10}>
        R73 isolates U2D from Vk′. Optional 22p NP0 across R72 if U2D rings.
      </Txt>

      <Txt x={24} y={430} size={12} weight="bold">
        Recombine · Vmix = VA + k(VB − VA)
      </Txt>
      <Txt x={24} y={490}>VA</Txt>
      <Wire d="M 50 490 H 80" />
      <ResistorH x1={80} x2={180} y={490} refDes="R67" value="10k" />
      <Wire d="M 180 490 V 474 H 220" />
      <OpAmp x={220} y={490} name="U2B" />
      <Wire d="M 480 70 H 480 V 40 H 1100 V 490 H 284" />
      <ResistorH x1={180} x2={220} y={506} refDes="R68" value="10k" />
      <ResistorV x={180} y1={506} y2={560} refDes="R69" value="10k" />
      <Gnd x={180} y={560} />
      <Wire d="M 284 490 H 360" />
      <Txt x={370} y={494}>Vmix to makeup DWG-01</Txt>

      <Txt x={700} y={450} size={10}>
        |B-A|/|A| = 0.1087 at 1 dB. 0.5 % JFET THD on Vdiff
      </Txt>
      <Txt x={700} y={470} size={10}>
        ~ 0.05 % audio THD. k=0 isolation: 200 ohm / 22k ~ 41 dB
      </Txt>
      <Txt x={700} y={490} size={10}>
        on Vdiff, ~60 dB vs VA. Idle-channel clicks stay buried.
      </Txt>
      <Txt x={700} y={518} size={10}>
        Charge at drain: i = Cgd · dVgs/dt. Cancel: i = Ctrim · d(−Vgs)/dt.
      </Txt>
      <Txt x={700} y={538} size={10}>
        4 pF · 3.5 V / 0.25 ms into 22k is a 1.2 mV tick (−41 dB on 100 mVrms).
      </Txt>
      <Txt x={700} y={558} size={10}>
        Do not put CV1 on the gate. Do not slow Vgs with 1k+1nF unless
      </Txt>
      <Txt x={700} y={578} size={10}>
        you want to limit attack; neutralization keeps dVgs/dt.
      </Txt>
    </SchematicFrame>
  );
}
