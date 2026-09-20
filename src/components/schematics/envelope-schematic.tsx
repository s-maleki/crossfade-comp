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
      rev="D"
      title="Sidechain HPF, precision rectifier, attack / release"
      viewBox="0 0 1180 520"
      notes="Attack and release sit on the linear peak detector, before the log converter. An RC discharge is exponential in voltage and therefore linear in dB/s. Precision-rectifier diodes sit inside the op-amp loop so Vf drops out. BAT85 speeds 10–15 kHz envelopes. This detector watches Vbuf, never the compressed output."
    >
      <Txt x={24} y={26} size={12} weight="bold">
        HPF and full-wave rectifier
      </Txt>

      <Port x={36} y={80} label="Vbuf" />
      <CapH x1={46} x2={140} y={80} refDes="C20" value="22n" />
      <Dot x={140} y={80} />
      <ResistorV x={140} y1={80} y2={150} refDes="R20" value="100k" />
      <Gnd x={140} y={150} />
      <Wire d="M 140 80 V 64 H 200" />
      <OpAmp x={200} y={80} name="U1D" />
      <Wire d="M 200 96 H 188 V 130 H 264 V 80" />
      <Wire d="M 264 80 H 300" />
      <Dot x={300} y={80} />
      <Txt x={24} y={178} size={10}>
        S1 shorts C20 to bypass · fc ~ 72 Hz
      </Txt>

      <ResistorH x1={300} x2={380} y={80} refDes="R30" value="10k" />
      <Wire d="M 380 80 V 96 H 420" />
      <Dot x={380} y={96} />
      <OpAmp x={420} y={80} name="U3A" />
      <Wire d="M 420 64 H 400 V 150" />
      <Gnd x={400} y={150} />

      <Dot x={484} y={80} />
      <DiodeH x1={484} x2={560} y={80} refDes="D2" />
      <Dot x={560} y={80} />
      <DiodeH x1={484} x2={420} y={112} refDes="D3" />
      <Wire d="M 484 80 V 112" />
      <Wire d="M 420 112 V 96" />
      <ResistorH x1={560} x2={420} y={48} refDes="R31" value="10k" />
      <Wire d="M 560 48 V 80" />
      <Wire d="M 420 48 V 96" />

      <ResistorH x1={560} x2={680} y={80} refDes="R32" value="10k" />
      <Wire d="M 680 80 V 64 H 720" />
      <OpAmp x={720} y={80} name="U3B" />
      <ResistorH x1={784} x2={720} y={96} refDes="R33" value="10k" />
      <Wire d="M 784 80 V 96" />
      <Wire d="M 784 80 H 840" />
      <Dot x={840} y={80} />
      <Txt x={850} y={76}>Vrect</Txt>

      <Txt x={24} y={230} size={12} weight="bold">
        Peak detector · attack / release
      </Txt>
      <Wire d="M 840 80 V 270 H 80" />
      <DiodeH x1={80} x2={160} y={270} refDes="D4 BAT85" />
      <ResistorH x1={160} x2={290} y={270} refDes="RV3" value="1k+50k att" />
      <Dot x={290} y={270} />
      <CapV x={290} y1={270} y2={350} refDes="C21" value="1u" />
      <Gnd x={290} y={350} />
      <Wire d="M 290 270 H 360" />
      <Dot x={360} y={270} />
      <ResistorV x={360} y1={270} y2={350} refDes="RV4" value="47k+1M rel" />
      <Gnd x={360} y={350} />
      <Wire d="M 360 270 H 520" />
      <OpAmp x={520} y={286} name="U3C" />
      <Wire d="M 520 302 H 508 V 340 H 584 V 286" />
      <Wire d="M 584 286 H 680" />
      <Port x={680} y={286} label="Venv" dir="out" />

      <Txt x={24} y={410} size={10}>
        Attack tau = (1k + RV3) * 1u = 1 ms to 51 ms. Release tau = (47k + RV4) * 1u = 47 ms to 1.05 s.
      </Txt>
      <Txt x={24} y={430} size={10}>
        V(t) = V0 e^(-t/tau) so dB falls at 8.69/tau dB per second. The 1k minimum on attack prevents diode-charge clicks.
      </Txt>
      <Txt x={24} y={450} size={10}>
        20 dB in 10 ms is 2 dB/ms — PT2257 I2C (~0.3 ms/write) can follow. A 1 ms attack needs LM1972.
      </Txt>
      <Txt x={24} y={470} size={10}>
        10–15 kHz audio: diodes switch at 20–30 kHz. Residual 2f stays on C21 and never enters the audio path.
      </Txt>
    </SchematicFrame>
  );
}
