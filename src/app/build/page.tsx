import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BuildPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader active="/build" />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        <div className="max-w-3xl">
          <h2 className="font-heading text-3xl text-amber-50">
            Prototype, numbers, limits
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            The interpolating architecture is practical. It is not a toy
            equivalent of an LM13700 compressor, and it is not free of analog
            compressor problems — control-voltage feedthrough, detector ripple
            at 15 kHz, and attack-rate lag still exist. What it removes is the
            OTA as the gain element. Firmware, SPICE, and the BOM live in this
            repository next to the notebook.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Expected performance</CardTitle>
              <CardDescription>9 V prototype, 1 Vrms through-level unless noted.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 font-mono text-sm">
              <Row k="Bandwidth" v="−3 dB ≈ 8 Hz–40 kHz" />
              <Row k="Audio target" v="20 Hz–15 kHz ±0.3 dB" />
              <Row k="THD @ 200 mV" v="~0.01 % (PT2257 limited)" />
              <Row k="THD @ 1 V" v="~0.03–0.05 %" />
              <Row k="THD @ 2 V" v="~0.07–0.1 % (PT2257)" />
              <Row k="Interpolator THD" v="~0.02 % on residual" />
              <Row k="Noise" v="~8 µV A-wtd, ~15 µV 20 kHz" />
              <Row k="SNR @ 1 V" v="~102 dB A-wtd" />
              <Row k="SNR @ 100 mV" v="~82 dB A-wtd" />
              <Row k="GR range" v="0–40 dB (chip to 79 dB)" />
              <Row k="Interpolation error" v="≤ 0.015 dB / tap" />
              <Row k="Min attack (PT2257)" v="~5 ms for 20 dB GR" />
              <Row k="Min attack (LM1972)" v="~1 ms" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>What happens in the awkward cases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                <span className="text-foreground">Rapid GR:</span> Vfrac is
                clamped to 1 dB. If I²C lags, output GR stalls at N+1 until the
                idle channel is rewritten, then advances a dB at a time. That is
                zipper caused by a slow interface, not by the mixer.
              </p>
              <p>
                <span className="text-foreground">15 kHz while k moves:</span>{" "}
                k slews at envelope rates (tens of Hz to a few hundred Hz). The
                result is slow AM of the 11 % residual — the same modulation a
                FET compressor produces. No PWM images if you stay with the JFET.
              </p>
              <p>
                <span className="text-foreground">CV feedthrough:</span> Q10 Cgd
                (~3 pF) into 22 kΩ is a 2.4 kHz coupling pole. Fast Vk edges
                tick. The analog attack already limits dVk/dt; add 1 kΩ + 1 nF
                on the gate if you still hear it.
              </p>
              <p>
                <span className="text-foreground">Decade writes (−9 → −11):</span>{" "}
                send the 10 dB code first so the idle channel glitches toward
                mute. 120 dB PT2257 separation plus JFET isolation keeps it off
                the output.
              </p>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Fundamental limits of this architecture</CardTitle>
            <CardDescription>
              None of these send you back to an OTA as the gain element. They
              bound what a stepped CMOS attenuator plus analog interpolation
              can do.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              The two taps are only as adjacent as the IC’s matching. PT2257
              inter-channel error is specified at 0.5 dB. Interpolation is still
              continuous, but the local slope in dB/k can be 0.5–1.5 dB per
              unit k instead of 1.00. LM1972 step error is ±0.05 dB below 48 dB
              GR and is the right part if you care.
            </p>
            <p>
              Integer and fractional parts must stay synchronized. The analog
              mixer cannot jump 10 dB; only the CMOS ladder can. Fast attack is
              therefore an interface-speed problem. I²C at 100 kHz is the
              PT2257 ceiling. SPI µPots remove it.
            </p>
            <p>
              The interpolator law (JFET Vgs, PWM duty, LDR) is not the
              compressor law. Log conversion has to happen in the sidechain.
              If you drove the JFET from a linear envelope you would get a
              weird hybrid of 1 dB CMOS steps and a FET curve — still
              continuous, no longer a ratio compressor.
            </p>
            <p>
              CMOS T-networks click. Leapfrog plus isolation is a mitigation,
              not a proof of silence. Optical volume chips and the LM1972
              (“pop and click free”) are the honest path if a write still
              ticks on the bench.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Optional analog PWM mixer</CardTitle>
            <CardDescription>
              If JFET pinch-off trim annoys you, replace DWG-04 with a linear
              duty-cycle mixer. Still no MCU in the audio path.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <p>
              NE5532 integrator + Schmitt at ~180 kHz triangle. LM311 compares
              triangle to Vk and swings ±9 V into a CD4053 (VDD=+9, VEE=−9).
              The switch selects VA or VB. A 3-pole 24 kHz reconstruction
              filter follows. Duty cycle is k. Residual |B−A| at 180 kHz is
              about −72 dB after the filter. Logic-level shifting is free
              because LM311 already runs on the analog rails.
            </p>
            <p>
              Do not use a 490 Hz Arduino PWM for this. That would put the
              microcontroller in the audio crossfade, which this design
              refuses, and it would put 490 Hz in the guitar.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Repository files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 font-mono text-sm">
            <p>firmware/leapfrog_pt2257.ino — Nano sketch</p>
            <p>hardware/bom.csv — prototype bill of materials</p>
            <p>hardware/spice/interpolation.cir — mix-law check</p>
            <p>hardware/spice/sidechain.cir — rectifier / AR / log</p>
            <p>scripts/verify-math.ts — interpolation identities</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/60 py-1 last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}
