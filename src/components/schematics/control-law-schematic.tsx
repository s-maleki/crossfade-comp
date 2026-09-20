import {
  DiodeH,
  Dot,
  Gnd,
  Label,
  Npn,
  OpAmp,
  ResistorH,
  SchematicFrame,
  Wire,
  ink,
} from "./symbols";

export function ControlLawSchematic() {
  return (
    <SchematicFrame
      dwg="DWG-03"
      title="Log converter, threshold, ratio, max GR, Vfrac"
      viewBox="0 0 1100 720"
      notes="100 mV per dB is the analog bus from here to the interpolator. The log pair should be glued together; leftover VT tempco is about 0.33 %/°C, or 0.33 dB on 10 dB of GR for a 10 °C shift — acceptable on a pedal. Threshold and ratio are applied in the dB domain so the digital attenuator is programmed in the same units it actually uses."
    >
      <Label x={24} y={28}>Log amp · 0 dB at 100 mV envelope = 100 mVrms sine after rectifier</Label>
      <Wire d="M 40 90 H 90" />
      <Label x={24} y={78}>Venv</Label>
      <ResistorH x1={90} x2={180} y={90} refDes="R34" value="10k" />
      <OpAmp x={200} y={110} name="U3D" flip />
      <Wire d="M 180 90 H 130 V 110 H 200" />
      <Npn x={250} y={70} name="Q1 2N3904" />
      <Npn x={250} y={170} name="Q2 2N3904" />
      <Wire d="M 200 110 H 234" />
      <Wire d="M 262 56 V 20 H 200 V 74" />
      <Label x={270} y={40}>Q1 transdiode</Label>
      <Wire d="M 262 184 V 230" />
      <Gnd x={262} y={230} />
      <ResistorH x1={268} x2={360} y={170} refDes="R35" value="499k" />
      <Wire d="M 360 170 H 380" />
      <Label x={380} y={160}>+5 V · Iref ≈ 10 µA</Label>
      <Wire d="M 200 146 H 160 V 20 H 200" />
      <Label x={24} y={48}>Vlog ≈ −VT ln(Iin/Iref) · 3.00 mV/dB</Label>

      <OpAmp x={470} y={80} name="U4A" />
      <Wire d="M 200 20 H 430 V 68 H 470" />
      <ResistorH x1={430} x2={540} y={44} refDes="R36" value="10k0" />
      <ResistorH x1={470} x2={430} y={116} refDes="R37" value="301" />
      <Wire d="M 430 116 V 150" />
      <Gnd x={430} y={150} />
      <Wire d="M 540 80 H 600" />
      <Label x={560} y={68}>VdB 100 mV/dB</Label>

      <Label x={24} y={280}>Threshold and ratio in the dB domain</Label>
      <OpAmp x={200} y={340} name="U4B" />
      <Wire d="M 600 80 V 280 H 120 V 328 H 200" />
      <ResistorH x1={80} x2={200} y={328} refDes="R38" value="10k" />
      <ResistorH x1={80} x2={200} y={360} refDes="RV5" value="10k thr" />
      <Wire d="M 80 360 V 400" />
      <Gnd x={80} y={400} />
      <Label x={24} y={318}>VdB</Label>
      <Label x={24} y={372}>0–2.6 V · 0–26 dB</Label>
      <DiodeH x1={270} x2={340} y={340} refDes="D5" />
      <Label x={300} y={372}>excess = max(L−T, 0)</Label>
      <Dot x={360} y={340} />
      <ResistorH x1={360} x2={470} y={340} refDes="RV6" value="10k ratio" />
      <Wire d="M 470 340 V 400" />
      <Gnd x={470} y={400} />
      <Wire d="M 420 340 V 300" />
      <Label x={430} y={292}>k·excess · k=1−1/R</Label>

      <OpAmp x={560} y={300} name="U4C" />
      <Wire d="M 420 300 H 560" />
      <Wire d="M 560 336 H 540 V 300 H 560" />
      <DiodeH x1={630} x2={710} y={288} refDes="D6 clamp" />
      <ResistorH x1={710} x2={800} y={288} refDes="RV7" value="10k maxGR" />
      <Wire d="M 800 288 H 820" />
      <Label x={820} y={276}>4.0 V = 40 dB</Label>
      <Wire d="M 630 300 H 700" />
      <Label x={710} y={320}>VGR</Label>

      <rect x="24" y="450" width="1050" height="240" fill="none" stroke={ink} strokeDasharray="4 3" />
      <Label x={40} y={474}>Fractional dB extractor · analog minus MCU staircase</Label>
      <Label x={40} y={498}>
        U5A computes Vfrac = clamp(VGR − VN, 0, 0.100 V). VN is a 1 dB staircase from Timer2 PWM (62.5 kHz) through a 2-pole 1.5 kHz filter.
      </Label>
      <OpAmp x={200} y={560} name="U5A" />
      <Wire d="M 700 300 V 430 H 80 V 548 H 200" />
      <Label x={24} y={536}>VGR</Label>
      <ResistorH x1={80} x2={200} y={580} refDes="R50" value="10k" />
      <Wire d="M 40 580 H 80" />
      <Label x={24} y={568}>VN</Label>
      <OpAmp x={400} y={560} name="U5B" />
      <ResistorH x1={270} x2={400} y={560} refDes="R51" value="10k" />
      <ResistorH x1={400} x2={510} y={520} refDes="R52" value="499k" />
      <Wire d="M 470 560 H 510 V 520" />
      <Label x={520} y={548}>×50 · 0–5 V = k</Label>
      <Wire d="M 470 560 H 620" />
      <Label x={630} y={548}>Vk to JFET driver (DWG-04)</Label>
      <Label x={40} y={640}>
        Clamp D7/D8 (not shown) to 0 V and +0.10 V on U5A so a lagging MCU cannot ask the interpolator to span more than 1 dB. Excess GR then waits on the next tap write instead of opening k past the far tap.
      </Label>
      <Label x={40} y={664}>
        For odd 1 dB intervals the firmware inverts the JFET drive so k triangles 0→1→0. That inversion is analog: MCU GPIO drives a 2N7000 that swaps Vk with 5 V−Vk via U5C (half of spare TL072).
      </Label>
    </SchematicFrame>
  );
}
