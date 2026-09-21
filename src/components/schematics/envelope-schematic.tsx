import {
  CapH,
  CapV,
  DiodeH,
  Dot,
  Gnd,
  OpAmp,
  Port,
  ResistorH,
  ResistorV,
  SchematicFrame,
  Txt,
  Wire,
} from "./symbols";

export function EnvelopeSchematic() {
  return (
    <SchematicFrame
      dwg="DWG-02"
      rev="G"
      title="Sidechain HPF, precision rectifier, attack / release"
      viewBox="0 0 1200 560"
      notes="Attack and release sit on the linear peak detector, before the log converter. An RC discharge is exponential in voltage and therefore linear in dB/s. Precision-rectifier diodes sit inside the op-amp loop so Vf drops out. BAT85 speeds 10–15 kHz envelopes. This detector watches Vbuf, never the compressed output. S1 (not drawn) shorts C20 to bypass; fc ≈ 72 Hz. Attack τ = (1 kΩ + RV3) · 1 µF = 1–51 ms. Release τ = (47 kΩ + RV4) · 1 µF = 47 ms–1.05 s. V(t) = V0 e^(−t/τ) so dB falls at 8.69/τ dB/s. The 1 kΩ minimum on attack prevents diode-charge clicks. 20 dB in 10 ms is 2 dB/ms — PT2257 I²C (~0.3 ms/write) can follow. A 1 ms attack needs LM1972. Diodes switch at 20–30 kHz; residual 2f stays on C21 and never enters the audio path."
    >
      <Txt x={24} y={28} size={12} weight="bold">
        HPF and full-wave rectifier
      </Txt>

      <Port x={36} y={100} label="Vbuf" />
      <CapH x1={48} x2={140} y={100} refDes="C20" value="22n" />
      <Dot x={140} y={100} />
      <ResistorV x={140} y1={100} y2={180} refDes="R20" value="100k" label="left" />
      <Gnd x={140} y={180} />
      <Wire d="M 140 100 V 84 H 188" />
      <OpAmp x={188} y={100} name="U1D" />
      <Wire d="M 188 116 H 174 V 158 H 252 V 100" />
      <Wire d="M 252 100 H 300" />
      <Dot x={300} y={100} />

      <ResistorH x1={300} x2={390} y={100} refDes="R30" value="10k" />
      <Wire d="M 390 100 V 116 H 430" />
      <Dot x={390} y={116} />
      <OpAmp x={430} y={100} name="U3A" />
      <Wire d="M 430 84 H 412 V 190" />
      <Gnd x={412} y={190} />

      <Dot x={494} y={100} />
      <DiodeH x1={494} x2={580} y={100} refDes="D2" />
      <Dot x={580} y={100} />
      <Wire d="M 494 100 V 152" />
      <DiodeH x1={494} x2={400} y={152} refDes="D3" label="below" />
      <Wire d="M 400 152 V 116 H 430" />
      <Dot x={400} y={116} />
      <ResistorH x1={580} x2={400} y={44} refDes="R31" value="10k" />
      <Wire d="M 580 44 V 100" />
      <Wire d="M 400 44 V 116" />

      <ResistorH x1={580} x2={700} y={100} refDes="R32" value="10k" />
      <Wire d="M 700 100 V 84 H 740" />
      <OpAmp x={740} y={100} name="U3B" />
      <ResistorH x1={804} x2={710} y={176} refDes="R33" value="10k" label="below" />
      <Wire d="M 804 100 V 176" />
      <Wire d="M 710 176 V 116 H 740" />
      <Wire d="M 804 100 H 880" />
      <Dot x={880} y={100} />
      <Port x={880} y={100} label="Vrect" dir="out" />

      <Txt x={24} y={250} size={12} weight="bold">
        Peak detector · attack / release
      </Txt>
      <Port x={36} y={320} label="Vrect" />
      <DiodeH x1={48} x2={140} y={320} refDes="D4 BAT85" />
      <ResistorH x1={140} x2={280} y={320} refDes="RV3" value="1k+50k att" />
      <Dot x={280} y={320} />
      <CapV x={280} y1={320} y2={410} refDes="C21" value="1u" />
      <Gnd x={280} y={410} />
      <Wire d="M 280 320 H 360" />
      <Dot x={360} y={320} />
      <ResistorV x={360} y1={320} y2={410} refDes="RV4" value="47k+1M rel" label="left" />
      <Gnd x={360} y={410} />
      <Wire d="M 360 320 V 304 H 500" />
      <OpAmp x={500} y={320} name="U3C" />
      <Wire d="M 500 336 H 486 V 378 H 564 V 320" />
      <Wire d="M 564 320 H 650" />
      <Port x={650} y={320} label="Venv DWG-03" dir="out" />
    </SchematicFrame>
  );
}
