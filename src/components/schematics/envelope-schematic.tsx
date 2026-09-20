import {
  CapH,
  CapV,
  DiodeH,
  Dot,
  Gnd,
  Label,
  OpAmp,
  ResistorH,
  ResistorV,
  SchematicFrame,
  Wire,
  ink,
} from "./symbols";

export function EnvelopeSchematic() {
  return (
    <SchematicFrame
      dwg="DWG-02"
      title="Sidechain HPF, precision rectifier, attack / release"
      viewBox="0 0 1100 640"
      notes="Attack and release sit on the linear peak detector, before the log converter. An RC discharge is exponential in voltage and therefore linear in dB/s — the right domain for a compressor. Precision rectifier diodes are inside the op-amp loop so Vf drops out. BAT85 Schottky speeds the 10–15 kHz envelope."
    >
      <Label x={24} y={28}>From Vbuf · detector only, not the audio gain path</Label>
      <Wire d="M 40 80 H 80" />
      <Label x={24} y={68}>Vbuf</Label>
      <CapH x1={80} x2={150} y={80} refDes="C20" value="22n" />
      <Dot x={170} y={80} />
      <ResistorV x={170} y1={80} y2={150} refDes="R20" value="100k" />
      <Gnd x={170} y={150} />
      <Label x={180} y={70}>S1 shorts C20 to bypass HPF · fc ≈ 72 Hz</Label>
      <OpAmp x={210} y={92} name="U1D" />
      <Wire d="M 170 80 H 210" />
      <Wire d="M 210 128 H 190 V 92 H 210" />
      <Wire d="M 280 92 H 340" />

      <Label x={340} y={50}>Full-wave precision rectifier</Label>
      <OpAmp x={360} y={92} name="U3A" />
      <ResistorH x1={340} x2={360} y={80} refDes="R30" value="10k" />
      <Wire d="M 360 56 H 430" />
      <DiodeH x1={430} x2={500} y={56} refDes="D2 BAT85" />
      <Wire d="M 360 128 H 400 V 160" />
      <DiodeH x1={360} x2={430} y={128} refDes="D3" />
      <ResistorH x1={430} x2={500} y={128} refDes="R31" value="10k" />
      <Dot x={500} y={128} />
      <Wire d="M 500 56 V 128" />
      <OpAmp x={540} y={140} name="U3B" />
      <ResistorH x1={500} x2={540} y={128} refDes="R32" value="10k" />
      <ResistorH x1={540} x2={640} y={176} refDes="R33" value="10k" />
      <Wire d="M 610 140 H 640 V 176" />
      <Wire d="M 610 140 H 700" />
      <Label x={660} y={128}>Vrect</Label>

      <Label x={40} y={240}>Peak detector · attack / release</Label>
      <Wire d="M 700 140 V 280 H 760" />
      <DiodeH x1={760} x2={840} y={280} refDes="D4 BAT85" />
      <ResistorH x1={840} x2={930} y={280} refDes="RV3" value="1k+50k" />
      <Dot x={960} y={280} />
      <CapV x={960} y1={280} y2={380} refDes="C21" value="1µ film" />
      <Gnd x={960} y={380} />
      <ResistorV x={1020} y1={280} y2={380} refDes="RV4" value="47k+1M" />
      <Gnd x={1020} y={380} />
      <Wire d="M 960 280 H 1020" />
      <OpAmp x={960} y={220} name="U3C" />
      <Wire d="M 960 256 H 940 V 220 H 960" />
      <Wire d="M 1030 220 H 1080" />
      <Label x={1040} y={208}>Venv</Label>

      <rect x="40" y="430" width="1020" height="180" fill="none" stroke={ink} strokeDasharray="4 3" />
      <Label x={56} y={454}>Time constants with C21 = 1.0 µF</Label>
      <Label x={56} y={478}>
        Attack τ = (1k + RV3) · C21 → 1 ms … 51 ms. Minimum 1k prevents diode-charge clicks.
      </Label>
      <Label x={56} y={502}>
        Release τ = (47k + RV4) · C21 → 47 ms … 1.05 s. Because V(t) = V0 e^(−t/τ), dB(t) falls at 8.69/τ dB per second.
      </Label>
      <Label x={56} y={526}>
        Fast attack example: 20 dB of GR in 10 ms is 2 dB/ms. PT2257 I²C (~0.3 ms/channel write) can follow that. 1 ms attack cannot.
      </Label>
      <Label x={56} y={550}>
        10–15 kHz audio: the rectifier diodes switch at 20–30 kHz. U3 should be TL074 or better (NE5532). Residual 2f ripple is the attack capacitor’s job; it must not AM the audio path — it only feeds the log amp.
      </Label>
      <Label x={56} y={574}>
        Place the detector after the input buffer, never after the attenuator: this is feed-forward. The envelope does not ride the output.
      </Label>
    </SchematicFrame>
  );
}
