import { CompressorLab } from "@/components/compressor-lab";
import { SiteHeader } from "@/components/site-header";

export default function LabPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader active="/lab" />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        <div className="max-w-3xl">
          <h2 className="font-heading text-3xl text-amber-50">
            Compressor control law
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Feed-forward: the detector watches the input, not the output. After
            a log converter the analog math is the textbook hard-knee law{" "}
            <span className="font-mono">GR = (1 − 1/R)(L − T)</span>, clamped
            to max GR. Makeup lives after the interpolator so it cannot change
            the sidechain. Attack and release are not in this plot — they filter
            L before the law, so a fast 15 kHz burst still compresses according
            to the peak detector, not according to each half-cycle.
          </p>
        </div>
        <CompressorLab />
      </main>
    </div>
  );
}
