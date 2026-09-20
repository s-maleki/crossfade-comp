"use client";

import { useMemo, useState } from "react";
import { ParamSlider } from "@/components/param-slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CGD_VDS0_TYP_F,
  CTRIM_MAX_F,
  CTRIM_MIN_F,
  R64_OHMS,
  feedthroughTick,
  residualTick,
  trimCapFarads,
} from "@/lib/cgd";

function formatPico(farads: number): string {
  return `${(farads * 1e12).toFixed(1)} pF`;
}

function formatTick(volts: number): string {
  if (volts >= 0.01) return `${(volts * 1e3).toFixed(2)} mV`;
  if (volts >= 1e-6) return `${(volts * 1e6).toFixed(1)} µV`;
  return `${(volts * 1e9).toFixed(0)} nV`;
}

function formatDb(db: number): string {
  if (!Number.isFinite(db)) return "−∞ dB";
  return `${db.toFixed(1)} dB`;
}

export function CgdLab() {
  const [cgdPf, setCgdPf] = useState(CGD_VDS0_TYP_F * 1e12);
  const [dVgs, setDVgs] = useState(3.5);
  const [attackMs, setAttackMs] = useState(0.25);
  const [ctrimPf, setCtrimPf] = useState(4.0);

  const cgdF = cgdPf * 1e-12;
  const ctrimF = ctrimPf * 1e-12;
  const dt = attackMs * 1e-3;

  const raw = useMemo(
    () => feedthroughTick(cgdF, dVgs, dt, R64_OHMS, 0.1),
    [cgdF, dVgs, dt],
  );
  const target = trimCapFarads(cgdF, dVgs, dVgs);
  const cancelled = useMemo(
    () => residualTick(ctrimF - cgdF, dVgs, dt, R64_OHMS, 0.1),
    [ctrimF, cgdF, dVgs, dt],
  );

  const rawBar = Math.min(100, (raw.tickV / 0.005) * 100);
  const nullBar = Math.min(100, (cancelled.tickV / 0.005) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Size CV1 from the actual gate swing</CardTitle>
        <CardDescription>
          Unity inversion of Vgs makes Ctrim = Cgd. Defaults are a 2N5457 at
          Vds ≈ 0, pinched off in 0.25 ms, looking into R64 = 22 kΩ, referred
          to a 100 mVrms guitar.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-4">
          <ParamSlider
            label="Cgd at Vds ≈ 0"
            value={cgdPf}
            min={1}
            max={8}
            step={0.1}
            unit=" pF"
            digits={1}
            onChange={setCgdPf}
          />
          <ParamSlider
            label="Vgs swing (0 → pinch-off)"
            value={dVgs}
            min={1}
            max={6}
            step={0.1}
            unit=" V"
            digits={1}
            onChange={setDVgs}
          />
          <ParamSlider
            label="Ramp time (fastest analog attack)"
            value={attackMs}
            min={0.1}
            max={10}
            step={0.05}
            unit=" ms"
            digits={2}
            onChange={setAttackMs}
          />
          <ParamSlider
            label="CV1 setting"
            value={ctrimPf}
            min={CTRIM_MIN_F * 1e12}
            max={CTRIM_MAX_F * 1e12}
            step={0.1}
            unit=" pF"
            digits={1}
            onChange={setCtrimPf}
          />
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border border-border/80 bg-secondary/40 p-3 font-mono text-sm">
            <Row k="i = Cgd · dVgs/dt" v={`${(raw.currentA * 1e9).toFixed(1)} nA`} />
            <Row k="Tick into 22 kΩ, no cancel" v={formatTick(raw.tickV)} />
            <Row k="vs 100 mVrms peak" v={formatDb(raw.tickDbfs)} />
            <Row k="Target Ctrim (= Cgd)" v={formatPico(target)} />
            <Row k="Residual after CV1" v={formatTick(cancelled.tickV)} />
            <Row k="Residual vs 100 mVrms" v={formatDb(cancelled.tickDbfs)} />
          </div>
          <div className="space-y-3">
            <Bar label="Uncancelled tick" pct={rawBar} />
            <Bar label="After CV1" pct={nullBar} />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A 4 pF, 3.5 V, 0.25 ms edge is a 1.2 mV tick — about −41 dB on a
            100 mVrms note. Nulling to 0.5 pF leftover drops that another 18 dB.
            Analog attack already limits dVgs/dt; neutralization removes the
            remaining click instead of slowing the compressor.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/50 py-1 last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}

function Bar({ label, pct }: { label: string; pct: number }) {
  return (
    <div>
      <div className="mb-1 text-[11px] tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-stone-800">
        <div
          className="h-full rounded-full bg-amber-200"
          style={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` }}
        />
      </div>
    </div>
  );
}
