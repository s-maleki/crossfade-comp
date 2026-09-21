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
      rev="G"
      title="Log converter, threshold, ratio, max GR, Vfrac"
      viewBox="0 0 1200 760"
      notes="100 mV per dB is the analog bus from here to the interpolator. Glue Q1/Q2 together; leftover VT tempco is about 0.33 %/°C. Q1 is the transdiode in U3D feedback: Vlog = −VT ln(Iin/Iref) ≈ 3.00 mV/dB at U3D output. U4A scales that to 100 mV/dB. Threshold and ratio are applied in the dB domain so the digital attenuator is programmed in the same units it uses. RV5 0–2.6 V = 0–26 dB. RV7 +4.0 V = 40 dB max GR. U5A is a matched-resistor subtractor so a lagging MCU cannot open k past the far tap. VN is the 1 dB PWM staircase from the Nano. Odd-N GPIO inverts Vk so the analog mix triangles 0-1-0. VdB and VGR continue on the named ports rather than wrapping the sheet."
    >
      <Txt x={24} y={28} size={12} weight="bold">
        Log amp
      </Txt>

      <Port x={36} y={120} label="Venv" />
      <ResistorH x1={48} x2={184} y={120} refDes="R34" value="10k" label="below" />
      <Dot x={184} y={120} />
      <Wire d="M 184 120 H 200" />
      <OpAmp x={200} y={104} name="U3D" />
      <Wire d="M 200 88 H 176 V 200" />
      <Gnd x={176} y={200} />

      <Npn x={360} y={56} name="Q1 2N3904" />
      <Wire d="M 264 104 H 300 V 38 H 378" />
      <Dot x={378} y={38} />
      <Wire d="M 378 38 H 342 V 56" />
      <Wire d="M 378 74 V 120 H 184" />

      <Npn x={360} y={168} name="Q2 2N3904" />
      <Wire d="M 342 56 V 168" />
      <Wire d="M 378 186 V 230" />
      <Gnd x={378} y={230} />
      <ResistorH x1={378} x2={520} y={150} refDes="R35" value="499k" />
      <Dot x={378} y={150} />
      <Wire d="M 520 150 H 560" />
      <Txt x={568} y={154}>+5 V · Iref 10 µA</Txt>

      <Wire d="M 378 38 H 470" />
      <Port x={470} y={38} label="Vlog" dir="out" />

      <Port x={520} y={270} label="Vlog" />
      <Wire d="M 530 270 H 620" />
      <OpAmp x={620} y={286} name="U4A" />
      <ResistorH x1={620} x2={520} y={302} refDes="R37" value="301" label="below" />
      <Wire d="M 520 302 V 350" />
      <Gnd x={520} y={350} />
      <ResistorH x1={684} x2={580} y={240} refDes="R36" value="10k0" />
      <Wire d="M 684 240 V 286" />
      <Wire d="M 580 240 V 302 H 620" />
      <Wire d="M 684 286 H 780" />
      <Dot x={780} y={286} />
      <Port x={780} y={286} label="VdB 100 mV/dB" dir="out" />

      <Txt x={24} y={400} size={12} weight="bold">
        Threshold, ratio, max GR
      </Txt>
      <Port x={36} y={460} label="VdB" />
      <Wire d="M 46 460 H 200" />
      <OpAmp x={200} y={476} name="U4B" />
      <Port x={36} y={430} label="+2.6 V" />
      <ResistorV x={90} y1={430} y2={510} refDes="RV5" value="10k thr" />
      <Wire d="M 46 430 H 90" />
      <Dot x={90} y={430} />
      <Gnd x={90} y={510} />
      <Dot x={90} y={492} />
      <Wire d="M 90 492 H 200" />

      <DiodeH x1={264} x2={360} y={476} refDes="D5" />
      <Dot x={360} y={476} />
      <Txt x={300} y={500} size={10}>
        excess
      </Txt>
      <ResistorH x1={360} x2={490} y={476} refDes="RV6" value="10k ratio" label="below" />
      <Wire d="M 490 476 V 530" />
      <Gnd x={490} y={530} />
      <Dot x={430} y={476} />
      <Wire d="M 430 476 V 430 H 560" />
      <OpAmp x={560} y={446} name="U4C" />
      <Wire d="M 560 462 H 546 V 504 H 624 V 446" />
      <Wire d="M 624 446 H 700" />
      <Dot x={700} y={446} />
      <Txt x={708} y={438}>VGR</Txt>
      <DiodeH x1={700} x2={790} y={446} refDes="D6" />
      <Dot x={790} y={446} />
      <ResistorV x={840} y1={410} y2={520} refDes="RV7" value="10k maxGR" />
      <Wire d="M 790 446 H 840" />
      <Dot x={840} y={446} />
      <Gnd x={840} y={520} />
      <Wire d="M 700 446 H 960" />
      <Port x={960} y={446} label="VGR" dir="out" />

      <Txt x={24} y={570} size={12} weight="bold">
        Fractional dB
      </Txt>
      <Port x={36} y={630} label="VGR" />
      <ResistorH x1={48} x2={150} y={630} refDes="R53" value="10k" />
      <Dot x={150} y={630} />
      <Wire d="M 150 630 H 188" />
      <ResistorV x={150} y1={630} y2={710} refDes="R54" value="10k" label="left" />
      <Gnd x={150} y={710} />
      <OpAmp x={188} y={646} name="U5A" />
      <Port x={36} y={662} label="VN" />
      <ResistorH x1={48} x2={188} y={662} refDes="R50" value="10k" label="below" />
      <ResistorH x1={252} x2={188} y={710} refDes="R51" value="10k" label="below" />
      <Wire d="M 252 710 V 646" />
      <Wire d="M 188 710 V 662" />

      <Wire d="M 252 646 V 630 H 340" />
      <OpAmp x={340} y={646} name="U5B" />
      <ResistorV x={340} y1={662} y2={730} refDes="R55" value="10k" />
      <Gnd x={340} y={730} />
      <ResistorH x1={404} x2={340} y={575} refDes="R52" value="499k" />
      <Wire d="M 404 575 V 646" />
      <Wire d="M 340 575 V 662" />
      <Wire d="M 404 646 H 560" />
      <Port x={560} y={646} label="Vk 0–5 V DWG-04" dir="out" />
    </SchematicFrame>
  );
}
