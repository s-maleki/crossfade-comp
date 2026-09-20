import {
  DiodeH,
  Dot,
  Gnd,
  Npn,
  OpAmp,
  Port,
  ResistorH,
  ResistorV,
  SchematicFrame,
  Txt,
  Wire,
} from "./symbols";

export function ControlLawSchematic() {
  return (
    <SchematicFrame
      dwg="DWG-03"
      rev="D"
      title="Log converter, threshold, ratio, max GR, Vfrac"
      viewBox="0 0 1180 680"
      notes="100 mV per dB is the analog bus from here to the interpolator. Glue Q1/Q2 together; leftover VT tempco is about 0.33 %/°C. Threshold and ratio are applied in the dB domain so the digital attenuator is programmed in the same units it uses. U5A is a matched-resistor subtractor so a lagging MCU cannot open k past the far tap."
    >
      <Txt x={24} y={24} size={12} weight="bold">
        Log amp · 0 dB at 100 mV envelope
      </Txt>

      <Port x={36} y={86} label="Venv" />
      <ResistorH x1={46} x2={180} y={86} refDes="R34" value="10k" />
      <Dot x={180} y={86} />
      <Wire d="M 180 86 H 220" />
      <OpAmp x={220} y={70} name="U3D" />
      <Wire d="M 220 54 H 200 V 175" />
      <Gnd x={200} y={175} />

      <Npn x={340} y={40} name="Q1 2N3904" />
      <Wire d="M 284 70 H 310 V 22 H 358" />
      <Dot x={358} y={22} />
      <Wire d="M 358 22 H 322 V 40" />
      <Wire d="M 358 58 V 86 H 180" />

      <Npn x={340} y={130} name="Q2 2N3904" />
      <Wire d="M 322 40 V 130" />
      <Wire d="M 358 148 V 190" />
      <Gnd x={358} y={190} />
      <ResistorH x1={358} x2={480} y={112} refDes="R35" value="499k" />
      <Txt x={490} y={116}>+5 V · Iref 10 uA</Txt>
      <Txt x={24} y={210} size={10}>
        Q1 transdiode in U3D feedback. Vlog = −VT ln(Iin/Iref) ~ 3.00 mV/dB at U3D output.
      </Txt>

      <Wire d="M 284 70 V 230 H 520" />
      <Dot x={520} y={230} />
      <OpAmp x={520} y={246} name="U4A" />
      <ResistorH x1={520} x2={430} y={262} refDes="R37" value="301" />
      <Wire d="M 430 262 V 310" />
      <Gnd x={430} y={310} />
      <ResistorH x1={584} x2={500} y={200} refDes="R36" value="10k0" />
      <Wire d="M 584 200 V 246" />
      <Wire d="M 500 200 V 262 H 520" />
      <Wire d="M 584 246 H 680" />
      <Dot x={680} y={246} />
      <Txt x={690} y={238}>VdB 100 mV/dB</Txt>

      <Txt x={24} y={350} size={12} weight="bold">
        Threshold, ratio, max GR
      </Txt>
      <Wire d="M 680 246 V 390 H 200" />
      <OpAmp x={200} y={406} name="U4B" />
      <Port x={36} y={390} label="+2.6 V" />
      <ResistorV x={80} y1={390} y2={455} refDes="RV5" value="10k thr" />
      <Wire d="M 46 390 H 80" />
      <Dot x={80} y={390} />
      <Gnd x={80} y={455} />
      <Wire d="M 80 422 H 200" />
      <Dot x={80} y={422} />
      <Txt x={24} y={474} size={10}>
        0–2.6 V = 0–26 dB
      </Txt>
      <DiodeH x1={264} x2={360} y={406} refDes="D5" />
      <Dot x={360} y={406} />
      <Txt x={280} y={430} size={10}>
        excess
      </Txt>
      <ResistorH x1={360} x2={480} y={406} refDes="RV6" value="10k ratio" />
      <Wire d="M 480 406 V 455" />
      <Gnd x={480} y={455} />
      <Dot x={430} y={406} />
      <Wire d="M 430 406 V 370 H 560" />
      <OpAmp x={560} y={386} name="U4C" />
      <Wire d="M 560 402 H 548 V 440 H 624 V 386" />
      <Wire d="M 624 386 H 680" />
      <Dot x={680} y={386} />
      <Txt x={690} y={404}>VGR</Txt>
      <DiodeH x1={680} x2={760} y={386} refDes="D6" />
      <Dot x={760} y={386} />
      <ResistorV x={800} y1={350} y2={450} refDes="RV7" value="10k maxGR" />
      <Wire d="M 760 386 H 800" />
      <Dot x={800} y={386} />
      <Txt x={812} y={354}>+4.0 V = 40 dB</Txt>
      <Gnd x={800} y={450} />

      <Txt x={24} y={508} size={12} weight="bold">
        Fractional dB · Vfrac = clamp(VGR − VN, 0, 0.10 V)
      </Txt>
      <Port x={36} y={548} label="VGR" />
      <ResistorH x1={46} x2={140} y={548} refDes="R53" value="10k" />
      <Dot x={140} y={548} />
      <Wire d="M 140 548 H 160" />
      <ResistorV x={140} y1={548} y2={620} refDes="R54" value="10k" />
      <Gnd x={140} y={620} />
      <OpAmp x={160} y={564} name="U5A" />
      <Port x={36} y={580} label="VN" />
      <ResistorH x1={46} x2={160} y={580} refDes="R50" value="10k" />
      <ResistorH x1={224} x2={160} y={610} refDes="R51" value="10k" />
      <Wire d="M 224 610 V 564" />
      <Wire d="M 160 610 V 580" />
      <Wire d="M 680 386 V 500 H 36 V 548" />
      <Dot x={36} y={548} />

      <Wire d="M 224 564 V 548 H 340" />
      <OpAmp x={340} y={564} name="U5B" />
      <ResistorV x={340} y1={580} y2={640} refDes="R55" value="10k" />
      <Gnd x={340} y={640} />
      <ResistorH x1={404} x2={340} y={530} refDes="R52" value="499k" />
      <Wire d="M 404 530 V 564" />
      <Wire d="M 340 530 V 580" />
      <Wire d="M 404 564 H 560" />
      <Port x={560} y={564} label="Vk 0–5 V to DWG-04" dir="out" />
      <Txt x={24} y={668} size={10}>
        VN is the 1 dB PWM staircase from the Nano. Odd-N GPIO inverts Vk so the analog mix triangles 0-1-0.
      </Txt>
    </SchematicFrame>
  );
}
