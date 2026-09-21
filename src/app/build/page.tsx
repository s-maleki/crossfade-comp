import { CgdLab } from "@/components/cgd-lab";
import { CgdCompensationLayout } from "@/components/schematics/cgd-layout";
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
              <Row k="GERR / CERR, raw" v="0.5 dB typical each" />
              <Row k="Law error, calibrated" v="≤ 0.05 dB after bench RMS" />
              <Row k="Min attack (PT2257)" v="~5 ms for 20 dB GR" />
              <Row k="Min attack (LM1972)" v="~1 ms" />
              <Row k="Cgd tick, uncancelled" v="~1.2 mV / −41 dB on 100 mV" />
              <Row k="Cgd tick, CV1 nulled" v="set by leftover 0.5 pF" />
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
                <span className="text-foreground">CV feedthrough:</span> Q10
                Cgd (~4 pF at Vds ≈ 0) into R64 dumps a tick onto Vk′. DWG-04
                Rev C cancels it with CV1 from −Vgs. Do not put a capacitor
                into the gate: U2C eats that current and the drain tick stays.
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

        <section className="space-y-4">
          <div className="max-w-3xl">
            <h3 className="font-heading text-2xl text-amber-50">
              Cgd neutralization
            </h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              The JFET is a shunt on the 1 dB residual, but its gate-drain
              capacitance still sees the full control swing. That current lands
              on Vk′, which is already in the audio mix. A few picofarads of
              inverted Vgs onto the same node cancel it.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Where the charge actually goes</CardTitle>
              <CardDescription>
                Gate-to-drain feedthrough is a drain-node problem.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                Q10 is an N-JFET with source on AGND and drain at Vk′. U2C
                forces Vgs. Internal Cgd sits between those two nodes, so a
                control edge produces
              </p>
              <p className="font-mono text-foreground">
                i_drain = Cgd · d(Vgs − Vk′)/dt ≈ Cgd · dVgs/dt
              </p>
              <p>
                That current flows through R64 (22 kΩ) into U2A’s low-Z
                output. Cgd·R64 is about 90 ns, so any analog-attack ramp is a
                current pulse whose height is i·R64. A 4 pF, 3.5 V, 0.25 ms
                pinch-off is 56 nA and a 1.2 mV tick — roughly −41 dB on a
                100 mVrms guitar. Quiet passages and fast attack make it
                obvious.
              </p>
              <p>
                The opposite current is
                <span className="font-mono text-foreground"> Ctrim · d(−Vgs)/dt </span>
                dumped onto the same drain. Unity inversion (R71 = R72) makes
                the null Ctrim = Cgd. A 2–10 pF C0G trimmer covers 2N5457 /
                J113 at Vds ≈ 0, where Cgd is larger than the 2 pF Crss
                datasheet number taken at 15 V.
              </p>
              <p>
                <span className="text-foreground">Why not the gate?</span> A
                capacitor from −Vgs into the gate looks into U2C, which is a
                voltage source. Extra gate current is absorbed, Vgs does not
                change, and Cgd keeps injecting. Neutralization has to land on
                Vk′. The 1 kΩ + 1 nF gate snubber is a different trick: it
                slows dVgs/dt and therefore slows attack. Keep it off the
                board unless you want that.
              </p>
            </CardContent>
          </Card>

          <CgdLab />

          <Card>
            <CardHeader>
              <CardTitle>Generate −Vgs from the real gate voltage</CardTitle>
              <CardDescription>
                Invert after RV1. Do not invert Vk, and do not reuse the D2
                k-triangle flag.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <ol className="list-decimal space-y-3 pl-5">
                <li>
                  <span className="text-foreground">U2C is already the inverted, trimmed gate drive.</span>{" "}
                  Vk (0–5 V) into R70, RV1 as feedback, non-inverting input on
                  AGND. Output is Vgs = 0 to −Vp. Trim RV1 so that Vk = 5 V
                  just pinches Q10 off. That is k = 1.
                </li>
                <li>
                  <span className="text-foreground">U2D is the spare quarter of the same TL074.</span>{" "}
                  R71 = R72 = 10 kΩ, non-inverting input on AGND. Output is
                  Vgs_inv = −Vgs, same swing, opposite sign, same package so
                  the two ramps share slew and delay. If U2D rings, 22 pF C0G
                  across R72 (C34).
                </li>
                <li>
                  <span className="text-foreground">R73 (1 kΩ) sits at U2D pin 8, then a short run to CV1.</span>{" "}
                  It keeps a shorted trimmer from gluing the invert output onto
                  Vk′, and it isolates audio on the drain from U2D. At 5 pF the
                  1 kΩ is nothing on a millisecond edge and about 1.6 MΩ of
                  reactance at 20 kHz, so it does not form an audio divider.
                </li>
                <li>
                  <span className="text-foreground">CV1, 2–10 pF, from R73 to Q10 pin 1.</span>{" "}
                  Start at 4 pF. Null on the bench. Ctrim is not a function of
                  Vk’s 5 V scale: if you drove CV1 from Vk you would need
                  Ctrim = Cgd · |Vp| / 5 V, which moves every time you change
                  the FET or RV1.
                </li>
                <li>
                  <span className="text-foreground">Leave D2 / U5 alone.</span>{" "}
                  Nano D2 tells U5 to invert Vk on odd integer-dB steps so the
                  analog mix triangles 0–1–0. That flag is a logic-rate square
                  wave, not −Vgs. Tapping it for CV1 would inject leapfrog
                  edges into the guitar.
                </li>
              </ol>
            </CardContent>
          </Card>

          <CgdCompensationLayout />

          <Card>
            <CardHeader>
              <CardTitle>Lay the island out, then null it</CardTitle>
              <CardDescription>
                The drawing above is the copper. The sequence below is the
                bench procedure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <ol className="list-decimal space-y-3 pl-5">
                <li>
                  Place Q10, CV1, R64, R65, R66, and R73 as one cluster.
                  Drain copper from pin 1 to CV1’s drain pad should be a few
                  millimetres, no via. Source via under the TO-92 to AGND.
                </li>
                <li>
                  Sit U2 so the C/D edge (pin 8 = Vgs, pin 14 = Vgs_inv on
                  a TL074) faces that cluster. Run the two control traces as
                  a pair, 0.5 mm apart, and do not pour them under Vk′.
                </li>
                <li>
                  Keep ICL7660S, C3, and C4 at least 25 mm off the island
                  with their own 0 V return. Charge-pump edges look like Cgd
                  ticks on a scope.
                </li>
                <li>
                  Take the recombine tap (R68) at the U2B end of the Vk′ run,
                  not at the CV1 pad, so U2B input current does not drop
                  across the trimmer land.
                </li>
                <li>
                  <span className="text-foreground">Null:</span> jumper VA to
                  VB so Vdiff is zero (or mute the input and program both
                  taps equal). Scope Vmix, AC-coupled, 2 mV/div. Fire the
                  fastest attack you will use, or step Vk 0 → 5 V. Trim CV1
                  for minimum tick. Cgd varies with Vgs; null at mid-k, then
                  check the 0 and 1 ends. Leftover 0.5 pF is a successful
                  trim.
                </li>
                <li>
                  Restore VA/VB, play a note, and confirm the compressor still
                  attacks. Neutralization must not have become a 1 nF snubber
                  by accident — if attack got slow, CV1 is too large or is
                  shorted.
                </li>
              </ol>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Calibrate the PT2257 ladder once</CardTitle>
            <CardDescription>
              GERR and CERR are properties of this chip, not of the room. Measure
              them on the bench and store the table in EEPROM. Blank EEPROM keeps
              the analog VN path.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <ol className="list-decimal space-y-3 pl-5">
              <li>
                Unplug the output. Feed about 200 mVrms at 1 kHz into the input
                — the datasheet THD condition, well under the 2.3 Vrms clip.
                Meter AC RMS on VA and VB, the U1B and U1C outputs.
              </li>
              <li>
                Open the serial port at 115200.{" "}
                <span className="font-mono text-foreground">G &lt;code&gt;</span>{" "}
                sets both PT2257 channels to that code and freezes leapfrog so
                the sidechain cannot move the taps while you read the meter.
                Codes 0 through 41.
              </li>
              <li>
                Reference both channels to VA at code 0. For each code,{" "}
                <span className="font-mono text-foreground">
                  att = −20 log10(V / VA(0))
                </span>
                , and the stored error is{" "}
                <span className="font-mono text-foreground">
                  round(1000 × (att − code))
                </span>{" "}
                millidB. Send{" "}
                <span className="font-mono text-foreground">A &lt;code&gt; &lt;milli&gt;</span>{" "}
                and{" "}
                <span className="font-mono text-foreground">B &lt;code&gt; &lt;milli&gt;</span>.
                errA at code 0 is 0. errB at code 0 is the open-tap channel offset.
              </li>
              <li>
                <span className="font-mono text-foreground">W</span> writes the
                table once every code has been sent. The Nano then takes Vk from
                10-bit PWM on D9 and holds D2 low. Move the Vk jumper from U5B
                to the D9 filter (R84, C32).{" "}
                <span className="font-mono text-foreground">Z</span> clears the
                magic; move the jumper back to U5B and D3/D2 run the analog
                staircase again.
              </li>
              <li>
                With a valid table, commanded GR is mapped onto the measured
                anchors. k is the exact amplitude mix between those taps, not
                the fractional dB. A code that does not rise is skipped and the
                idle channel is written two or more codes ahead. The idle-channel
                rule is unchanged: a tap is rewritten only while its mix weight
                is under 2 %.
              </li>
            </ol>
            <p>
              A single trimmer is the fallback when you will not run the table.
              About 1 kΩ in series with the hotter of VA or VB, into the 10 kΩ
              crossfader resistors, pads that channel by up to ~0.8 dB. Program
              both codes to −20 dB and trim until VA equals VB. That removes the
              flat CERR only. If you do both, freeze the trimmer before you
              measure the table.
            </p>
          </CardContent>
        </Card>

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
              Uncalibrated, the two taps are only as adjacent as the IC’s
              matching. PT2257 GERR and CERR are each 0.5 dB typical, so the
              local slope can be 0.5–1.5 dB per commanded dB. The bench table
              above removes that static ladder error. What remains is the RMS
              measurement, about 0.05 dB, plus I²C speed and click. LM1972 step
              error is ±0.05 dB below 48 dB GR and is still the right part if
              you do not want to calibrate, or if a write still ticks.
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
            <p>
              Cgd neutralization is a single-point null. Cgd(Vdg) is not
              constant, and U2D is only as inverted as R71/R72 matching. It
              knocks the tick down tens of dB. It does not make a JFET as
              quiet as an LM1972.
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
            <p>hardware/spice/cgd_neutralize.cir — drain tick with / without CV1</p>
            <p>scripts/verify-math.ts — interpolation, Cgd, and ladder calibration</p>
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
