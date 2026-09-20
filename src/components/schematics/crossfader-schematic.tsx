import {
  Dot,
  Gnd,
  Jfet,
  OpAmp,
  ResistorH,
  ResistorV,
  SchematicFrame,
  Txt,
  Wire,
} from "./symbols";

export function CrossfaderSchematic() {
  return (
    <SchematicFrame
      dwg="DWG-04"
      title="Voltage-controlled crossfader · difference interpolator"
      viewBox="0 0 1180 560"
      notes="This is not a signal VCA. The JFET only sees B−A, about 10.9 % of tap-A amplitude for a 1 dB pair, so its THD and noise are ~19 dB less serious than on the full guitar signal. Linearized VCR (half-Vds to the gate) keeps law error under the 0.014 dB amplitude-mix error. RV1 sets pinch-off so k=1 when Vk is 5 V."
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
      <Txt x={490} y={58}>Vk′</Txt>
      <Jfet x={480} y={140} name="Q10 2N5457" />
      <Wire d="M 480 70 V 122" />
      <Wire d="M 480 158 V 200" />
      <Gnd x={480} y={200} />
      <ResistorH x1={462} x2={380} y={140} refDes="R65" value="470k" />
      <Wire d="M 380 140 V 200" />
      <Gnd x={380} y={200} />
      <ResistorH x1={480} x2={560} y={158} refDes="R66" value="470k" />
      <Wire d="M 380 140 H 360 V 260" />

      <Txt x={24} y={250} size={12} weight="bold">
        Vgs driver
      </Txt>
      <Txt x={24} y={290}>Vk 0–5 V</Txt>
      <Wire d="M 90 290 H 120" />
      <ResistorH x1={120} x2={210} y={290} refDes="R70" value="22k" />
      <Wire d="M 210 290 V 274 H 250" />
      <OpAmp x={250} y={290} name="U2C" />
      <ResistorH x1={250} x2={160} y={330} refDes="RV1" value="10k trim" />
      <Wire d="M 160 330 V 370" />
      <Gnd x={160} y={370} />
      <Wire d="M 250 306 H 160 V 330" />
      <Wire d="M 314 290 H 360" />
      <Txt x={370} y={286}>Vgs 0 to Vp</Txt>
      <Txt x={370} y={310} size={10}>
        trim: Vk=5 V, Q10 just pinched off
      </Txt>

      <Txt x={24} y={410} size={12} weight="bold">
        Recombine · Vmix = VA + k(VB − VA)
      </Txt>
      <Txt x={24} y={450}>VA</Txt>
      <Wire d="M 50 450 H 80" />
      <ResistorH x1={80} x2={180} y={450} refDes="R67" value="10k" />
      <Wire d="M 180 450 V 434 H 220" />
      <OpAmp x={220} y={450} name="U2B" />
      <Wire d="M 480 70 H 700 V 450 H 284" />
      <ResistorH x1={180} x2={220} y={466} refDes="R68" value="10k" />
      <Wire d="M 180 466 V 466" />
      <ResistorV x={180} y1={466} y2={520} refDes="R69" value="10k" />
      <Gnd x={180} y={520} />
      <Wire d="M 284 450 H 360" />
      <Txt x={370} y={454}>Vmix to makeup DWG-01</Txt>

      <Txt x={700} y={250} size={10}>
        |B-A|/|A| = 0.1087 at 1 dB.
      </Txt>
      <Txt x={700} y={270} size={10}>
        0.5 % JFET THD on Vdiff ~ 0.05 % audio THD.
      </Txt>
      <Txt x={700} y={290} size={10}>
        k=0 isolation: 200 ohm / 22k ~ 41 dB on Vdiff,
      </Txt>
      <Txt x={700} y={310} size={10}>
        ~60 dB vs VA. Idle-channel clicks stay buried.
      </Txt>
      <Txt x={700} y={330} size={10}>
        Cgd ~ 3 pF into 22k is 2.4 kHz of CV bleed.
      </Txt>
      <Txt x={700} y={350} size={10}>
        Analog attack already limits dVk/dt. Optional 1k+1nF on the gate.
      </Txt>
    </SchematicFrame>
  );
}
