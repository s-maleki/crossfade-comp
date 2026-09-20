import { BlockDiagram } from "@/components/block-diagram";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FINDINGS = [
  {
    q: "Is adjacent-tap interpolation valid?",
    a: "Yes. A and B are the same waveform, so the mix is just a gain between two taps. No comb filter, no quadrature, no image.",
  },
  {
    q: "What is −10 dB mixed with −11 dB?",
    a: "At k = 0.5 the result is −10.486 dB, not −10.500 dB. Peak law error over the whole step is 0.014 dB.",
  },
  {
    q: "What law does the crossfader need?",
    a: "Linear amplitude k is enough at 1 dB. Exact dB-linear k is (10^(−f/20)−1)/(10^(−Δ/20)−1). Skip it unless you interpolate 6 dB.",
  },
  {
    q: "Is PT2257 actually usable?",
    a: "Yes for a 9 V pedal with attack ≥ 5 ms and leapfrog writes. LM1972 is the upgrade if you want pop-free 0.5 dB taps and 1 ms attack. Skip M62429 — not enough headroom.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader active="/" />
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <Badge variant="secondary" className="mb-3">
              Feed-forward · 9 V · no LM13700
            </Badge>
            <h2 className="font-heading text-3xl leading-tight text-amber-50 sm:text-4xl">
              Discrete 1 dB volume chips can be turned into a continuous analog gain element.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              BlendStep splits a guitar signal into both channels of a PT2257,
              programs those channels one step apart, and analog-crossfades them.
              A conventional compressor sidechain — rectifier, attack/release, log
              converter, threshold, ratio, max GR — produces a dB-domain control
              voltage. The analog mixer only interpolates the 1 dB gap. A small
              microcontroller rewrites the silent channel at each boundary so the
              pair leapfrogs without a step in the output.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Prototype range</CardTitle>
              <CardDescription>Guitar pedal, ordinary through-hole parts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 font-mono text-sm">
              <Row k="Bandwidth" v="20 Hz–15 kHz" />
              <Row k="Level" v="100 mV–2 V rms" />
              <Row k="GR" v="0–40 dB continuous" />
              <Row k="THD" v="~0.03–0.08 % @ 1 V" />
              <Row k="Noise" v="~8 µV A-wtd" />
              <Row k="Supply" v="9 V (12 V optional)" />
            </CardContent>
          </Card>
        </section>

        <section className="rounded-2xl border bg-card/60 p-3 sm:p-5">
          <BlockDiagram />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {FINDINGS.map((item) => (
            <Card key={item.q}>
              <CardHeader>
                <CardTitle className="text-base">{item.q}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/60 py-1 last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span>{v}</span>
    </div>
  );
}
