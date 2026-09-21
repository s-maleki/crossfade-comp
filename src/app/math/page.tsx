import { CalibrationLab } from "@/components/calibration-lab";
import { CrossfadeLab } from "@/components/crossfade-lab";
import { SiteHeader } from "@/components/site-header";

export default function MathPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader active="/math" />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        <div className="max-w-3xl">
          <h2 className="font-heading text-3xl text-amber-50">Interpolation math</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Let A and B be two copies of the same input with voltage gains{" "}
            <span className="font-mono">10^(−A/20)</span> and{" "}
            <span className="font-mono">10^(−B/20)</span>. A linear analog mixer
            implements{" "}
            <span className="font-mono">v = (1−k)·A + k·B = A + k(B−A)</span>.
            Because A and B are coherent and in phase, this is only a gain. A
            linear change in k is not exactly a linear change in dB — but at a
            1 dB tap spacing the error never exceeds 0.015 dB. The PT2257’s
            own GERR and CERR, both 0.5 dB typical, are larger than that. They
            are removed by measuring the ladder once, not by the crossfade.
          </p>
        </div>
        <CrossfadeLab />
        <section className="grid gap-4 md:grid-cols-3">
          <Note title="Do not treat CV as dB">
            A JFET’s Rds versus Vgs is not logarithmic, and a linear PWM duty
            cycle is not logarithmic either. The logarithm belongs in the
            sidechain, where the envelope is converted to 100 mV/dB. After that,
            k only has to walk across a 1 dB-wide interval.
          </Note>
          <Note title="6 dB would be the wrong step">
            Mixing 0 dB and −6 dB at k = 0.5 gives −2.5 dB, a 0.5 dB error.
            That is why the two digital channels stay adjacent. The interpolator
            is not a substitute for the stepped IC; it only fills the gap the IC
            cannot.
          </Note>
          <Note title="Residual, not the full signal">
            |B−A| is 10.9 % of A at 1 dB. Distortion in the analog element is
            applied to that residual. That is the architectural reason this is
            not “an OTA compressor with extra steps.”
          </Note>
        </section>

        <div className="max-w-3xl">
          <h2 className="font-heading text-3xl text-amber-50">GERR and CERR</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            The PT2257 audio table lists joint step gain error (GERR) and
            inter-channel attenuation gain error (CERR) as 0.5 dB typical. There
            is no minimum, maximum, or test condition, so the number is the size
            of the error on a typical part, not a guaranteed bound. Leapfrog
            stays continuous — the same pin is live across each integer boundary
            — but the span of one crossfade is B(n+1) − A(n), which contains one
            step of GERR and the CERR between the two channels. With k tied to a
            1.00 dB command, the local slope runs about 0.5–1.5 dB per commanded
            dB.
          </p>
        </div>
        <CalibrationLab />
        <section className="grid gap-4 md:grid-cols-2">
          <Note title="Do not self-cal at startup">
            The errors are resistor-string ratios. They do not move from one
            power-up to the next. The pedal has no tone source, the sidechain
            rectifier sits ahead of the PT2257, and a BAT85 will not resolve
            0.05 dB at the millivolts of a −40 dB tap. Mute cannot be the
            measurement path, because mute takes the ladders away. A boot
            measurement would need a new injector and a linear detector. Leave
            it out.
          </Note>
          <Note title="One trimmer only fixes the average">
            A series 1 kΩ on the hotter post-buffer feed can pad that channel
            by about 0.8 dB. Null both codes at −20 dB until VA equals VB. That
            cuts the flat part of CERR and leaves the code-dependent step
            error, which is where a coarse 10 dB string usually shows up. The
            EEPROM table removes both. Do not trim and then apply an old table.
          </Note>
          <Note title="Deep codes are averaged">
            At 200 mVrms in, code 40 is about 2 mV out. One meter sample there
            is not a 0.05 dB measurement. The bench pass takes 8 readings
            through code 15, 16 through code 24, and 32 from 25 to 41, averages
            the volts, then converts. The reply shows the sample cloud. A
            peak-to-peak wider than 0.05 / 0.10 / 0.20 dB in those three ranges
            is NOISY: reseat or shield, and do not store it.
          </Note>
          <Note title="One frequency is a hypothesis">
            The stored row is 1 kHz at 200 mVrms. A one-time check, not every
            board, repeats codes 5, 15, 25, 35, and 40 at 100 Hz, 5 kHz, and
            2.0 Vrms. The gate is 0.10 dB: twice the 0.05 dB measurement
            budget, so scatter is not a flag, and above the 0.057 dB mix
            residual of a skipped 2 dB span, so a flag is the table rather than
            the interpolator. A flag is logged and left out of EEPROM. If a
            unit does that, the ladder error at that code depends on frequency
            or level, and a single-condition table does not remove it.
          </Note>
          <Note title="Decade blocks, not coin flips">
            A regression ladder holds +0.5 dB on even 10 dB blocks and −0.5 dB
            on odd blocks, the same error on every code inside the block.
            Interior steps still rise by 1 dB and are not skipped. The crossings
            into codes 10 and 30 are flat, so those two codes drop. The
            crossings into 20 and 40 rise by 2 dB and stay single-code steps.
            Uncorrected, that flat crossing peaks at 1.014 dB. The same map
            tracks the command.
          </Note>
        </section>
      </main>
    </div>
  );
}

function Note({ title, children }: { title: string; children: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="font-medium text-amber-100">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {children}
      </p>
    </div>
  );
}
