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
            1 dB tap spacing the error never exceeds 0.015 dB, which is lost
            under PT2257’s own 0.5 dB tracking spec.
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
