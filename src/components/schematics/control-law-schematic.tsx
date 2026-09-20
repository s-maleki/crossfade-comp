import {
  DiodeH,
  Dot,
  Gnd,
  Npn,
  OpAmp,
  ResistorH,
  SchematicFrame,
  Txt,
  Wire,
} from "./symbols";

export function ControlLawSchematic() {
  return (
    <SchematicFrame
      dwg="DWG-03"
      title="Log converter, threshold, ratio, max GR, Vfrac"
      viewBox="0 0 1180 640"
      notes="100 mV per dB is the analog bus from here to the interpolator. Glue Q1/Q2 together; leftover VT tempco is about 0.33 %/°C. Threshold and ratio are applied in the dB domain so the digital attenuator is programmed in the same units it uses. U5A clamps Vfrac to one 1 dB step so a lagging MCU cannot open k past the far tap."
    >
      <Txt x={24} y={28} size={12} weight="bold">
        Log amp · 0 dB at 100 mV envelope
      </Txt>
      <Txt x={24} y={70}>Venv</Txt>
      <Wire d="M 58 70 H 80" />
      <ResistorH x1={80} x2={180} y={70} refDes="R34" value="10k" />
      <Wire d="M 180 70 V 86 H 220" />
      <OpAmp x={220} y={70} name="U3D" />
      <Npn x={340} y={40} name="Q1 2N3904" />
      <Wire d="M 284 70 H 300 V 27 H 351" />
      <Wire d="M 180 70 H 180 V 40 H 325" />
      <Npn x={340} y={130} name="Q2 2N3904" />
      <Wire d="M 351 53 V 90 H 325" />
      <Wire d="M 351 143 V 175" />
      <Gnd x={351} y={175} />
      <ResistorH x1={351} x2={460} y={130} refDes="R35" value="499k" />
      <Txt x={470} y={134}>+5 V · Iref 10 uA</Txt>
      <Txt x={24} y={200} size={10}>
        Vlog = -VT ln(Iin/Iref) ~ 3.00 mV/dB at Q1 collector/U3D output
      </Txt>

      <Wire d="M 284 70 V 230 H 520" />
      <OpAmp x={520} y={246} name="U4A" />
      <Wire d="M 520 230 V 230" />
      <Wire d="M 520 230 H 520" />
      <ResistorH x1={520} x2={430} y={280} refDes="R37" value="301" />
      <Wire d="M 430 280 V 310" />
      <Gnd x={430} y={310} />
      <ResistorH x1={584} x2={680} y={230} refDes="R36" value="10k0" />
      <Wire d="M 584 246 H 680 V 230" />
      <Wire d="M 520 230 H 520" />
      <Wire d="M 500 230 H 520" />
      <Txt x={24} y={246}>from U3D</Txt>
      <Wire d="M 680 230 H 740" />
      <Txt x={750} y={234}>VdB 100 mV/dB</Txt>

      <Txt x={24} y={360} size={12} weight="bold">
        Threshold, ratio, max GR
      </Txt>
      <Wire d="M 740 230 V 390 H 200" />
      <OpAmp x={200} y={406} name="U4B" />
      <ResistorH x1={80} x2={200} y={390} refDes="R38" value="10k" />
      <Txt x={24} y={394}>VdB</Txt>
      <ResistorH x1={80} x2={200} y={422} refDes="RV5" value="10k thr" />
      <Wire d="M 80 422 V 455" />
      <Gnd x={80} y={455} />
      <Txt x={24} y={474} size={10}>
        0–2.6 V = 0–26 dB
      </Txt>
      <DiodeH x1={264} x2={340} y={406} refDes="D5" />
      <Txt x={280} y={430} size={10}>
        excess
      </Txt>
      <Dot x={360} y={406} />
      <ResistorH x1={360} x2={480} y={406} refDes="RV6" value="10k ratio" />
      <Wire d="M 480 406 V 455" />
      <Gnd x={480} y={455} />
      <Wire d="M 430 406 V 370 H 560" />
      <OpAmp x={560} y={386} name="U4C" />
      <Wire d="M 560 402 H 548 V 440 H 624 V 386" />
      <Wire d="M 624 386 H 680" />
      <DiodeH x1={680} x2={760} y={370} refDes="D6" />
      <ResistorH x1={760} x2={860} y={370} refDes="RV7" value="10k maxGR" />
      <Txt x={870} y={374}>4.0 V = 40 dB</Txt>
      <Txt x={690} y={404}>VGR</Txt>
      <Dot x={680} y={386} />

      <Txt x={24} y={508} size={12} weight="bold">
        Fractional dB · Vfrac = clamp(VGR − VN, 0, 0.10 V)
      </Txt>
      <Txt x={24} y={564}>VGR</Txt>
      <Wire d="M 58 564 V 548 H 160" />
      <OpAmp x={160} y={564} name="U5A" />
      <Txt x={24} y={596}>VN</Txt>
      <ResistorH x1={70} x2={160} y={580} refDes="R50" value="10k" />
      <Wire d="M 224 564 H 250" />
      <ResistorH x1={250} x2={340} y={564} refDes="R51" value="10k" />
      <OpAmp x={340} y={564} name="U5B" />
      <ResistorH x1={404} x2={500} y={530} refDes="R52" value="499k" />
      <Wire d="M 404 564 V 530" />
      <Wire d="M 500 530 V 548 H 340" />
      <Wire d="M 404 564 H 560" />
      <Txt x={570} y={568}>Vk 0–5 V to DWG-04</Txt>
      <Txt x={24} y={630} size={10}>
        VN is the 1 dB PWM staircase from the Nano. Odd-N GPIO inverts Vk so the analog mix triangles 0-1-0.
      </Txt>
    </SchematicFrame>
  );
}
