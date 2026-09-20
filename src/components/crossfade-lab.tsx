"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ParamSlider } from "@/components/param-slider";
import {
  differenceResidualRatio,
  kForExactAttenuationDb,
  maxLinearCrossfadeErrorDb,
  mixedAttenuationDb,
  sampleLinearCrossfadeError,
} from "@/lib/interpolation";

export function CrossfadeLab() {
  const [attA, setAttA] = useState(10);
  const [step, setStep] = useState(1);
  const [k, setK] = useState(0.5);
  const attB = attA + step;
  const mixed = mixedAttenuationDb(attA, attB, k);
  const ideal = attA + k * step;
  const exactK = kForExactAttenuationDb(attA, attB, attA + 0.5 * step);
  const residual = differenceResidualRatio(step);
  const err = maxLinearCrossfadeErrorDb(step);
  const samples = useMemo(() => sampleLinearCrossfadeError(step, 160), [step]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <CardTitle>Linear amplitude mix of two taps</CardTitle>
          <CardDescription>
            Same waveform, two programmed attenuations. The mix is coherent —
            there is no comb filter, only a gain between the taps.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <ParamSlider
            label="Channel A"
            value={attA}
            min={0}
            max={40}
            step={1}
            unit=" dB"
            digits={0}
            onChange={setAttA}
          />
          <ParamSlider
            label="Step to channel B"
            value={step}
            min={0.5}
            max={6}
            step={0.5}
            unit=" dB"
            digits={1}
            onChange={setStep}
          />
          <ParamSlider
            label="Crossfade k"
            value={k}
            min={0}
            max={1}
            step={0.01}
            digits={2}
            onChange={setK}
          />
          <div className="grid grid-cols-2 gap-3 font-mono text-sm sm:grid-cols-4">
            <Stat label="A" value={`−${attA.toFixed(1)} dB`} />
            <Stat label="B" value={`−${attB.toFixed(1)} dB`} />
            <Stat label="Linear mix" value={`−${mixed.toFixed(3)} dB`} />
            <Stat
              label="Error vs k·step"
              value={`${(mixed - ideal).toFixed(3)} dB`}
            />
          </div>
          <ErrorChart samples={samples} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Does linear k equal linear dB?</CardTitle>
          <CardDescription>
            No, not in general. Across a 1 dB step the difference is
            inaudible. Across a 6 dB step it is not.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p>
            Mixing −{attA.toFixed(0)} dB and −{attB.toFixed(0)} dB with{" "}
            <span className="font-mono">k = 0.5</span> produces{" "}
            <span className="font-mono">−{mixedAttenuationDb(attA, attB, 0.5).toFixed(3)} dB</span>,
            not the arithmetic midpoint.
          </p>
          <p>
            Peak law error for a {step.toFixed(1)} dB step is{" "}
            <span className="font-mono">{err.maxAbsErrorDb.toFixed(4)} dB</span>{" "}
            at k = {err.atK.toFixed(2)}. For the prototype 1 dB PT2257 taps that
            number is 0.014 dB. A compressor does not need a special antilog
            crossfade law.
          </p>
          <p>
            Exact k for the midpoint is{" "}
            <span className="font-mono">{exactK.toFixed(4)}</span> rather than
            0.5000. Optional: warp k with
          </p>
          <p className="rounded-lg bg-secondary/70 px-3 py-2 font-mono text-xs">
            k = (10^(−f/20) − 1) / (10^(−Δ/20) − 1)
          </p>
          <p>
            The interpolator only processes the difference B − A, which is{" "}
            <span className="font-mono">{(residual * 100).toFixed(2)}%</span> of
            A ({(20 * Math.log10(residual)).toFixed(1)} dB down). Distortion and
            noise in the analog element are reduced by that same factor versus
            putting a VCA on the full signal.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/60 px-3 py-2">
      <div className="text-[10px] tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
      <div className="mt-1 text-foreground">{value}</div>
    </div>
  );
}

function ErrorChart({
  samples,
}: {
  samples: { k: number; errorDb: number }[];
}) {
  const w = 640;
  const h = 180;
  const pad = { l: 44, r: 12, t: 16, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const maxErr = Math.max(0.02, ...samples.map((s) => Math.abs(s.errorDb)));
  const x = (k: number) => pad.l + k * innerW;
  const y = (err: number) => pad.t + (1 - (err + maxErr) / (2 * maxErr)) * innerH;
  const d = samples
    .map((s, i) => `${i === 0 ? "M" : "L"} ${x(s.k).toFixed(2)} ${y(s.errorDb).toFixed(2)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full">
      <rect width={w} height={h} rx="10" fill="#1b1814" />
      <line
        x1={pad.l}
        x2={w - pad.r}
        y1={y(0)}
        y2={y(0)}
        stroke="#6b6458"
        strokeDasharray="4 4"
      />
      <path d={d} fill="none" stroke="#e7b56a" strokeWidth="2" />
      <text x={pad.l} y={14} fill="#cbbfa8" fontSize="10" fontFamily="ui-monospace, monospace">
        Mix error (dB) vs linear k
      </text>
      <text x={pad.l} y={h - 8} fill="#8a8378" fontSize="10" fontFamily="ui-monospace, monospace">
        k = 0
      </text>
      <text
        x={w - pad.r - 28}
        y={h - 8}
        fill="#8a8378"
        fontSize="10"
        fontFamily="ui-monospace, monospace"
      >
        k = 1
      </text>
      <text
        x={8}
        y={y(maxErr) + 3}
        fill="#8a8378"
        fontSize="9"
        fontFamily="ui-monospace, monospace"
      >
        +{maxErr.toFixed(3)}
      </text>
      <text
        x={8}
        y={y(-maxErr) + 3}
        fill="#8a8378"
        fontSize="9"
        fontFamily="ui-monospace, monospace"
      >
        −{maxErr.toFixed(3)}
      </text>
    </svg>
  );
}
