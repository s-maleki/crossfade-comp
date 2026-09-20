import { AudioPathSchematic } from "@/components/schematics/audio-path-schematic";
import { CgdCompensationLayout } from "@/components/schematics/cgd-layout";
import { ControlLawSchematic } from "@/components/schematics/control-law-schematic";
import { CrossfaderSchematic } from "@/components/schematics/crossfader-schematic";
import { DigitalIcSchematic } from "@/components/schematics/digital-ic-schematic";
import { EnvelopeSchematic } from "@/components/schematics/envelope-schematic";
import { PowerSchematic } from "@/components/schematics/power-schematic";
import { SiteHeader } from "@/components/site-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = ["audio", "env", "law", "xfade", "digital", "power"] as const;

export default async function SchematicsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const defaultValue = TABS.includes(params.tab as (typeof TABS)[number])
    ? (params.tab as string)
    : "audio";

  return (
    <div className="min-h-screen">
      <SiteHeader active="/schematics" />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <div className="max-w-3xl">
          <h2 className="font-heading text-3xl text-amber-50">Schematics</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Working prototype values. Op-amps are TL074/TL072 on ±9 V. Every
            net on these drawings lands on a pin, a junction, or an off-page
            port. The voltage-controlled element is a 2N5457 used as a
            linearized VCR on the 1 dB difference, not an LM13700 on the
            guitar signal. DWG-04 adds Miller neutralization: U2D inverts Vgs
            and CV1 dumps the opposite charge onto the JFET drain.
          </p>
        </div>
        <Tabs defaultValue={defaultValue}>
          <TabsList variant="line" className="flex flex-wrap">
            <TabsTrigger value="audio">Audio path</TabsTrigger>
            <TabsTrigger value="env">Envelope / AR</TabsTrigger>
            <TabsTrigger value="law">Control law</TabsTrigger>
            <TabsTrigger value="xfade">Crossfader</TabsTrigger>
            <TabsTrigger value="digital">PT2257 / MCU</TabsTrigger>
            <TabsTrigger value="power">Power</TabsTrigger>
          </TabsList>
          <TabsContent value="audio" className="mt-4">
            <AudioPathSchematic />
          </TabsContent>
          <TabsContent value="env" className="mt-4">
            <EnvelopeSchematic />
          </TabsContent>
          <TabsContent value="law" className="mt-4">
            <ControlLawSchematic />
          </TabsContent>
          <TabsContent value="xfade" className="mt-4 space-y-4">
            <CrossfaderSchematic />
            <CgdCompensationLayout />
          </TabsContent>
          <TabsContent value="digital" className="mt-4">
            <DigitalIcSchematic />
          </TabsContent>
          <TabsContent value="power" className="mt-4">
            <PowerSchematic />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
