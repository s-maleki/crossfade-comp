"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ParamSlider } from "@/components/param-slider";
import {
  CAL_MAX_GR_DB,
  calibrationAt,
  channelOffsetLadder,
  correctedAttenuationDb,
  peakLawErrors,
  programmedCodes,
  sampleCalibrationLaw,
  uncorrectedAttenuationDb,
} from "@/lib/calibration";

export function CalibrationLab() {
  const [offsetDb, setOffsetDb] = useState(0.5);
  const [gr, setGr] = useState(10.4);
  const ladder = useMemo(() => channelOffsetLadder(offsetDb), [offsetDb]);
  const samples = useMemo(() => sampleCalibrationLaw(ladder, 320), [ladder]);
  const peaks = useMemo(() => peakLawErrors(ladder, 2000), [ladder]);
  const state = calibrationAt(ladder, gr);
  const codes = programmedCodes(state.segment);
  const raw = uncorrectedAttenuationDb(ladder, gr);
  const fixed = correctedAttenuationDb(ladder, gr);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <CardTitle>Law error with a flat channel offset</CardTitle>
          <CardDescription>
            Channel B is {offsetDb.toFixed(2)} dB more attenuated than its code
            at every tap. Uncorrected k still thinks each interval is 1.00 dB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <ParamSlider
            label="B offset (CERR)"
            value={offsetDb}
            min={0}
            max={0.5}
            step={0.05}
            unit=" dB"
            digits={2}
            onChange={setOffsetDb}
          />
          <ParamSlider
            label="Commanded GR"
            value={gr}
            min={0}
            max={CAL_MAX_GR_DB}
            step={0.1}
            unit=" dB"
            digits={1}
            onChange={setGr}
          />
          <div className="grid grid-cols-2 gap-3 font-mono text-sm sm:grid-cols-4">
            <Stat label="Codes" value={`A ${codes.attA} / B ${codes.attB}`} />
            <Stat label="k of B" value={state.kB.toFixed(3)} />
            <Stat label="Uncorrected" value={`${(raw - gr).toFixed(3)} dB`} />
            <Stat label="Calibrated" value={`${(fixed - gr).toFixed(3)} dB`} />
          </div>
          <LawChart samples={samples} gr={gr} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>The span is the error</CardTitle>
          <CardDescription>
            GERR and CERR do not click. They change how many decibels one
            crossfade actually covers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p>
            Peak uncorrected error for this offset is{" "}
            <span className="font-mono">{peaks.uncorrectedAbsDb.toFixed(3)} dB</span>{" "}
            near {peaks.atUncorrectedDb.toFixed(1)} dB GR. After the table, the
            same sweep is{" "}
            <span className="font-mono">{peaks.correctedAbsDb.toExponential(1)} dB</span>
            . Exact k between the measured taps removes the mix-law residual as
            well; on the bench the floor is the RMS measurement plus the A2
            reading, about 0.05 dB.
          </p>
          <p>
            A joint step error does the same thing. Alternating 0.5 dB and
            1.5 dB steps, identical on both channels, leaves about half a
            decibel of ripple if k is still the fractional command. The stored
            ladder absorbs it. A step that does not rise is skipped and the
            idle channel is programmed two codes ahead. A 2 dB span still has
            under 0.06 dB of linear-mix error, and the firmware does not use
            linear k anyway.
          </p>
          <p className="rounded-lg bg-secondary/70 px-3 py-2 font-mono text-xs">
            att(c) = −20 log10(V(c) / VA(0))
            <br />
            stored = att(c) − c
          </p>
          <p>
            Both meters use VA at code 0. That is the tap you hear at zero GR,
            so an open-tap channel offset stays in the B column instead of
            being normalized away.
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

function LawChart({
  samples,
  gr,
}: {
  samples: { commandedDb: number; uncorrectedErrorDb: number; correctedErrorDb: number }[];
  gr: number;
}) {
  const w = 640;
  const h = 200;
  const pad = { l: 52, r: 12, t: 18, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const maxErr = Math.max(
    0.05,
    ...samples.map((s) => Math.abs(s.uncorrectedErrorDb)),
    ...samples.map((s) => Math.abs(s.correctedErrorDb)),
  );
  const x = (g: number) => pad.l + (g / CAL_MAX_GR_DB) * innerW;
  const y = (err: number) => pad.t + (1 - (err + maxErr) / (2 * maxErr)) * innerH;
  const path = (key: "uncorrectedErrorDb" | "correctedErrorDb") =>
    samples
      .map(
        (s, i) =>
          `${i === 0 ? "M" : "L"} ${x(s.commandedDb).toFixed(2)} ${y(s[key]).toFixed(2)}`,
      )
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
      <path d={path("uncorrectedErrorDb")} fill="none" stroke="#e7b56a" strokeWidth="2" />
      <path d={path("correctedErrorDb")} fill="none" stroke="#8fbf9f" strokeWidth="2" />
      <line
        x1={x(gr)}
        x2={x(gr)}
        y1={pad.t}
        y2={h - pad.b}
        stroke="#cbbfa8"
        strokeDasharray="2 3"
      />
      <text x={pad.l} y={14} fill="#cbbfa8" fontSize="10" fontFamily="ui-monospace, monospace">
        Law error (dB) vs commanded GR
      </text>
      <text x={w - pad.r - 118} y={14} fill="#e7b56a" fontSize="10" fontFamily="ui-monospace, monospace">
        raw
      </text>
      <text x={w - pad.r - 78} y={14} fill="#8fbf9f" fontSize="10" fontFamily="ui-monospace, monospace">
        calibrated
      </text>
      <text x={pad.l} y={h - 8} fill="#8a8378" fontSize="10" fontFamily="ui-monospace, monospace">
        0 dB
      </text>
      <text
        x={w - pad.r - 36}
        y={h - 8}
        fill="#8a8378"
        fontSize="10"
        fontFamily="ui-monospace, monospace"
      >
        40 dB
      </text>
      <text
        x={8}
        y={y(maxErr) + 3}
        fill="#8a8378"
        fontSize="9"
        fontFamily="ui-monospace, monospace"
      >
        +{maxErr.toFixed(2)}
      </text>
      <text
        x={8}
        y={y(-maxErr) + 3}
        fill="#8a8378"
        fontSize="9"
        fontFamily="ui-monospace, monospace"
      >
        −{maxErr.toFixed(2)}
      </text>
    </svg>
  );
}
