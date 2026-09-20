import {
  CapH,
  CapV,
  DiodeH,
  Dot,
  Gnd,
  OpAmp,
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
      title="Sidechain HPF, precision rectifier, attack / release"
      viewBox="0 0 1180 500"
      notes="Attack and release sit on the linear peak detector, before the log converter. An RC discharge is exponential in voltage and therefore linear in dB/s. Precision-rectifier diodes sit inside the op-amp loop so Vf drops out. BAT85 speeds 10–15 kHz envelopes. This detector watches Vbuf, never the compressed output."
    >
      <Txt x={24} y={26} size={12} weight="bold">
        HPF and full-wave rectifier
      </Txt>

      <Txt x={24} y={80}>Vbuf</Txt>
      <Wire d="M 58 80 H 78" />
      <CapH x1={78} x2={150} y={80} refDes="C20" value="22n" />
      <Dot x={168} y={80} />
      <ResistorV x={168} y1={80} y2={150} refDes="R20" value="100k" />
      <Gnd x={168} y={150} />
      <Wire d="M 168 80 V 64 H 210" />
      <OpAmp x={210} y={80} name="U1D" />
      <Wire d="M 210 96 H 198 V 128 H 274 V 80" />
      <Txt x={24} y={178} size={10}>
        S1 shorts C20 to bypass · fc ~ 72 Hz
      </Txt>

      <ResistorH x1={274} x2={360} y={80} refDes="R30" value="10k" />
      <Wire d="M 360 80 V 64 H 400" />
      <OpAmp x={400} y={80} name="U3A" />
      <DiodeH x1={464} x2={540} y={64} refDes="D2" />
      <Wire d="M 464 80 H 478 V 118" />
      <DiodeH x1={400} x2={478} y={118} refDes="D3" />
      <ResistorH x1={478} x2={560} y={118} refDes="R31" value="10k" />
      <Dot x={560} y={118} />
      <Wire d="M 540 64 V 118" />
      <Wire d="M 540 64 H 560" />

      <ResistorH x1={560} x2={650} y={80} refDes="R32" value="10k" />
      <Wire d="M 650 80 V 64 H 690" />
      <OpAmp x={690} y={80} name="U3B" />
      <ResistorH x1={690} x2={650} y={128} refDes="R33" value="10k" />
      <Wire d="M 650 128 V 160" />
      <Gnd x={650} y={160} />
      <Wire d="M 754 80 H 800" />
      <Dot x={800} y={80} />
      <Txt x={810} y={76}>Vrect</Txt>

      <Txt x={24} y={230} size={12} weight="bold">
        Peak detector · attack / release
      </Txt>
      <Wire d="M 800 80 V 270 H 80" />
      <DiodeH x1={80} x2={160} y={270} refDes="D4 BAT85" />
      <ResistorH x1={160} x2={270} y={270} refDes="RV3" value="1k+50k att" />
      <Dot x={290} y={270} />
      <CapV x={290} y1={270} y2={350} refDes="C21" value="1u" />
      <Gnd x={290} y={350} />
      <ResistorV x={360} y1={270} y2={350} refDes="RV4" value="47k+1M rel" />
      <Gnd x={360} y={350} />
      <Wire d="M 290 270 H 360" />
      <Wire d="M 290 270 H 520" />
      <OpAmp x={520} y={286} name="U3C" />
      <Wire d="M 520 302 H 508 V 336 H 584 V 286" />
      <Wire d="M 584 286 H 650" />
      <Txt x={660} y={290}>Venv</Txt>

      <Txt x={24} y={400} size={10}>
        Attack tau = (1k + RV3) * 1u = 1 ms to 51 ms. Release tau = (47k + RV4) * 1u = 47 ms to 1.05 s.
      </Txt>
      <Txt x={24} y={420} size={10}>
        V(t) = V0 e^(-t/tau) so dB falls at 8.69/tau dB per second. The 1k minimum on attack prevents diode-charge clicks.
      </Txt>
      <Txt x={24} y={440} size={10}>
        20 dB in 10 ms is 2 dB/ms — PT2257 I2C (~0.3 ms/write) can follow. A 1 ms attack needs LM1972.
      </Txt>
      <Txt x={24} y={460} size={10}>
        10–15 kHz audio: diodes switch at 20–30 kHz. Residual 2f stays on C21 and never enters the audio path.
      </Txt>
    </SchematicFrame>
  );
}
