import { LeapfrogLab } from "@/components/leapfrog-lab";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VOLUME_ICS } from "@/lib/ics";

export default function ControlPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader active="/control" />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        <div className="max-w-3xl">
          <h2 className="font-heading text-3xl text-amber-50">
            Digital taps without zipper
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            PT2257 can set left and right independently, which is the whole
            reason a stereo volume chip is used in a mono pedal. It cannot
            change attenuation continuously, and it is not specified pop-free.
            The analog mixer therefore holds the live tap while the idle tap is
            rewritten. Fast attack is a race between I²C and dVGR/dt — that is
            a real limit of this IC, not of the interpolation idea.
          </p>
        </div>
        <LeapfrogLab />
        <div className="grid gap-4">
          {VOLUME_ICS.map((ic) => (
            <Card key={ic.name}>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle>{ic.name}</CardTitle>
                  <CardDescription>
                    {ic.package} · {ic.interface}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    ic.verdict === "avoid"
                      ? "destructive"
                      : ic.verdict === "upgrade"
                        ? "default"
                        : "secondary"
                  }
                >
                  {ic.verdict}
                </Badge>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm md:grid-cols-2">
                <Field k="Step / range" v={`${ic.stepDb} dB · ${ic.rangeDb}`} />
                <Field k="Supply" v={ic.supply} />
                <Field k="THD" v={ic.thd} />
                <Field k="SNR" v={ic.snr} />
                <Field k="Separation" v={ic.separation} />
                <Field k="Headroom" v={ic.headroom} />
                <p className="md:col-span-2 leading-relaxed text-muted-foreground">
                  {ic.notes}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[11px] tracking-wide text-muted-foreground uppercase">
        {k}
      </div>
      <div className="font-mono text-sm">{v}</div>
    </div>
  );
}
