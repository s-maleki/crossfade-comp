"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ParamSlider } from "@/components/param-slider";
import {
  compressorCurve,
  gainReductionDb,
  mixFromRatio,
  outputLevelDb,
} from "@/lib/compressor";
import { leapfrogFromGainReduction } from "@/lib/leapfrog";
import { mixedAttenuationDb } from "@/lib/interpolation";

export function CompressorLab() {
  const [threshold, setThreshold] = useState(-12);
  const [ratio, setRatio] = useState(4);
  const [maxGr, setMaxGr] = useState(24);
  const [makeup, setMakeup] = useState(6);
  const [level, setLevel] = useState(-6);

  const params = useMemo(
    () => ({
      thresholdDb: threshold,
      ratio,
      maxGrDb: maxGr,
      makeupDb: makeup,
    }),
    [threshold, ratio, maxGr, makeup],
  );

  const gr = gainReductionDb(level, threshold, ratio, maxGr);
  const out = outputLevelDb(level, params);
  const leap = leapfrogFromGainReduction(gr, 1);
  const actualAtt = mixedAttenuationDb(leap.attA, leap.attB, leap.k);
  const curve = useMemo(() => compressorCurve(params), [params]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Control law</CardTitle>
            <CardDescription>
              Analog sidechain after the log converter. Attack and release sit
              on the linear peak detector, so RC release is constant in dB/s.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ParamSlider
              label="Input level"
              value={level}
              min={-36}
              max={12}
              step={0.1}
              unit=" dB"
              digits={1}
              onChange={setLevel}
            />
            <ParamSlider
              label="Threshold"
              value={threshold}
              min={-36}
              max={6}
              step={0.5}
              unit=" dB"
              digits={1}
              onChange={setThreshold}
            />
            <ParamSlider
              label="Ratio"
              value={ratio}
              min={1}
              max={20}
              step={0.1}
              unit=" :1"
              digits={1}
              onChange={setRatio}
            />
            <ParamSlider
              label="Max gain reduction"
              value={maxGr}
              min={1}
              max={40}
              step={1}
              unit=" dB"
              digits={0}
              onChange={setMaxGr}
            />
            <ParamSlider
              label="Makeup"
              value={makeup}
              min={0}
              max={20}
              step={0.5}
              unit=" dB"
              digits={1}
              onChange={setMakeup}
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Ratio pot in the hardware is a linear mix of excess:{" "}
              <span className="font-mono">
                k = 1 − 1/R = {mixFromRatio(ratio).toFixed(3)}
              </span>
              . 0 % is 1:1, 50 % is 2:1, 75 % is 4:1, 100 % is ∞:1.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Transfer curve</CardTitle>
            <CardDescription>
              Output dB vs input dB, plus the operating point. Gain reduction
              never comes from the envelope voltage directly — only from the
              programmed taps plus k.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransferChart
              curve={curve}
              level={level}
              out={out}
              threshold={threshold}
            />
            <div className="mt-4 grid grid-cols-2 gap-3 font-mono text-sm sm:grid-cols-4">
              <Stat label="GR" value={`${gr.toFixed(2)} dB`} />
              <Stat label="Output" value={`${out.toFixed(2)} dB`} />
              <Stat label="Taps" value={`${leap.attA} / ${leap.attB}`} />
              <Stat label="k" value={leap.k.toFixed(3)} />
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>How that GR becomes two taps and a crossfade</CardTitle>
          <CardDescription>
            Integer part programs PT2257. Fractional part is the analog k bus
            at 100 mV/dB after subtracting the MCU staircase VN.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <p className="text-sm leading-relaxed text-muted-foreground md:col-span-2">
            Right now GR is {gr.toFixed(3)} dB, so N = {leap.n} and f ={" "}
            {leap.fraction.toFixed(3)}. Channel A is at −{leap.attA} dB, B at −
            {leap.attB} dB, and k = {leap.k.toFixed(3)} (
            {leap.phase === 0 ? "A is the near tap" : "B is the near tap"}). The
            analog mix is −{actualAtt.toFixed(3)} dB versus the requested −
            {gr.toFixed(3)} dB — the 0.014 dB-class interpolation error, not a
            1 dB zipper.
          </p>
          <div className="rounded-lg bg-secondary/60 p-3 font-mono text-xs leading-6">
            VGR = { (gr * 0.1).toFixed(3) } V
            <br />
            VN = { (leap.n * 0.1).toFixed(3) } V
            <br />
            Vfrac = { (leap.fraction * 0.1).toFixed(3) } V
            <br />
            idle = {leap.idleChannel}
          </div>
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

function TransferChart({
  curve,
  level,
  out,
  threshold,
}: {
  curve: { inputDb: number; outputDb: number }[];
  level: number;
  out: number;
  threshold: number;
}) {
  const w = 720;
  const h = 280;
  const pad = { l: 42, r: 16, t: 16, b: 32 };
  const xMin = -40;
  const xMax = 12;
  const yMin = -40;
  const yMax = 18;
  const x = (db: number) =>
    pad.l + ((db - xMin) / (xMax - xMin)) * (w - pad.l - pad.r);
  const y = (db: number) =>
    pad.t + (1 - (db - yMin) / (yMax - yMin)) * (h - pad.t - pad.b);
  const d = curve
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${x(p.inputDb).toFixed(2)} ${y(p.outputDb).toFixed(2)}`,
    )
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full">
      <rect width={w} height={h} rx="10" fill="#1b1814" />
      <line
        x1={x(xMin)}
        x2={x(xMax)}
        y1={y(xMin)}
        y2={y(xMax)}
        stroke="#3f3a34"
        strokeDasharray="3 3"
      />
      <line
        x1={x(threshold)}
        x2={x(threshold)}
        y1={pad.t}
        y2={h - pad.b}
        stroke="#5d8f82"
        strokeDasharray="4 3"
      />
      <path d={d} fill="none" stroke="#e7b56a" strokeWidth="2.2" />
      <circle cx={x(level)} cy={y(out)} r="5" fill="#f3e6c4" />
      <text x={x(threshold) + 6} y={pad.t + 12} fill="#9fd6c4" fontSize="10" fontFamily="ui-monospace, monospace">
        T
      </text>
      <text x={pad.l} y={h - 10} fill="#8a8378" fontSize="10" fontFamily="ui-monospace, monospace">
        input dB
      </text>
      <text x={8} y={20} fill="#8a8378" fontSize="10" fontFamily="ui-monospace, monospace">
        out
      </text>
    </svg>
  );
}
