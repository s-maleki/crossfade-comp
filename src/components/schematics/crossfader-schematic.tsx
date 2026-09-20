import {
  Dot,
  Gnd,
  Jfet,
  Label,
  OpAmp,
  ResistorH,
  ResistorV,
  SchematicFrame,
  Wire,
  ink,
} from "./symbols";

export function CrossfaderSchematic() {
  return (
    <SchematicFrame
      dwg="DWG-04"
      title="Voltage-controlled crossfader · difference interpolator"
      viewBox="0 0 1100 680"
      notes="This is not a signal VCA. The JFET only sees B−A, about 10.9 % of the tap-A amplitude for a 1 dB pair, so JFET THD and noise are ~19 dB less serious than they would be on the full guitar signal. Linearized VCR (Siliconix-style half-Vds feedback) keeps law error well under the 0.014 dB amplitude-mix error. RV1 sets pinch-off so k=1 when Vk is 5 V."
    >
      <Label x={24} y={28}>Difference amplifier · Vdiff = VB − VA</Label>
      <OpAmp x={260} y={120} name="U2A" />
      <Wire d="M 40 80 H 180" />
      <Label x={24} y={68}>VB</Label>
      <ResistorH x1={180} x2={260} y={80} refDes="R60" value="10k" />
      <Wire d="M 40 160 H 180" />
      <Label x={24} y={148}>VA</Label>
      <ResistorH x1={180} x2={260} y={160} refDes="R61" value="10k" />
      <ResistorH x1={260} x2={180} y={48} refDes="R62" value="10k" />
      <Wire d="M 180 48 V 80" />
      <ResistorV x={180} y1={160} y2={230} refDes="R63" value="10k" />
      <Gnd x={180} y={230} />
      <Wire d="M 330 120 H 400" />
      <Label x={360} y={108}>Vdiff</Label>

      <Label x={400} y={28}>Linearized N-JFET shunt · k≈0 when JFET on</Label>
      <ResistorH x1={400} x2={510} y={120} refDes="R64" value="22k" />
      <Dot x={540} y={120} />
      <Label x={550} y={108}>Vk′</Label>
      <Jfet x={540} y={190} name="Q10 2N5457" />
      <Wire d="M 540 120 V 172" />
      <Wire d="M 540 208 V 250" />
      <Gnd x={540} y={250} />
      <ResistorH x1={522} x2={430} y={190} refDes="R65" value="470k" />
      <ResistorH x1={540} x2={620} y={208} refDes="R66" value="470k" />
      <Wire d="M 430 190 V 250" />
      <Gnd x={430} y={250} />
      <Wire d="M 430 190 H 400 V 320" />
      <Label x={300} y={310}>from Vgs driver</Label>

      <OpAmp x={260} y={360} name="U2C" />
      <Wire d="M 80 360 H 200" />
      <Label x={24} y={348}>Vk (0–5 V)</Label>
      <ResistorH x1={200} x2={260} y={348} refDes="R70" value="22k" />
      <ResistorH x1={260} x2={200} y={400} refDes="RV1" value="10k trim" />
      <Wire d="M 200 400 V 440" />
      <Gnd x={200} y={440} />
      <Label x={280} y={430}>trim: Vk=5 V → Q10 just pinched off</Label>
      <Wire d="M 330 360 H 400" />
      <Label x={360} y={348}>Vgs 0 to Vp</Label>
      <Wire d="M 400 360 V 320" />

      <Label x={24} y={500}>Recombine · Vmix = VA + k(VB − VA)</Label>
      <OpAmp x={260} y={560} name="U2B" />
      <Wire d="M 40 520 H 180" />
      <Label x={24} y={508}>VA</Label>
      <ResistorH x1={180} x2={260} y={520} refDes="R67" value="10k" />
      <Wire d="M 540 120 H 700 V 560 H 260" />
      <ResistorH x1={200} x2={260} y={560} refDes="R68" value="10k" />
      <ResistorH x1={260} x2={200} y={600} refDes="R69" value="10k" />
      <Wire d="M 200 600 V 640" />
      <Gnd x={200} y={640} />
      <Wire d="M 330 560 H 430" />
      <Label x={440} y={548}>Vmix to makeup DWG-01</Label>

      <rect x="620" y="300" width="450" height="250" fill="none" stroke={ink} strokeDasharray="4 3" />
      <Label x={636} y={324}>Why this is not “just another VCA compressor”</Label>
      <Label x={636} y={348}>Vout = A + k(B−A). A is already the digitally set gain.</Label>
      <Label x={636} y={372}>|B−A|/|A| = 10^(−0.05)−1 = 0.1087 for 1 dB.</Label>
      <Label x={636} y={396}>If the JFET itself has 0.5 % THD on Vdiff, audio THD ≈ 0.05 %.</Label>
      <Label x={636} y={420}>Isolation at k=0: Rds(on)≈200 Ω / 22k ≈ 0.009 → 41 dB on Vdiff,</Label>
      <Label x={636} y={444}>≈ 60 dB relative to VA. Idle-channel tap glitches stay buried.</Label>
      <Label x={636} y={468}>Cgd feedthrough: 3 pF into 22k is 2.4 kHz of CV bleed. Keep</Label>
      <Label x={636} y={492}>dVk/dt below ~1 V/ms (the analog attack already does this)</Label>
      <Label x={636} y={516}>and/or add 1k+1nF on the gate. 15 kHz audio is not chopped.</Label>
    </SchematicFrame>
  );
}
