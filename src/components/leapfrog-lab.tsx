"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ParamSlider } from "@/components/param-slider";
import { leapfrogFromGainReduction, mixWeightA, mixWeightB } from "@/lib/leapfrog";

export function LeapfrogLab() {
  const [gr, setGr] = useState(10.4);

  const state = useMemo(() => leapfrogFromGainReduction(gr, 1), [gr]);
  const wA = mixWeightA(state);
  const wB = mixWeightB(state);
  const history = useMemo(() => {
    const rows = [];
    for (let g = 8; g <= 14.001; g += 0.5) {
      rows.push(leapfrogFromGainReduction(g, 1));
    }
    return rows;
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Ping-pong pair</CardTitle>
          <CardDescription>
            Sweep gain reduction through a few 1 dB boundaries. The analog mix
            weight of a channel hits zero before that channel is rewritten.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <ParamSlider
            label="Requested GR"
            value={gr}
            min={0}
            max={24}
            step={0.01}
            unit=" dB"
            digits={2}
            onChange={setGr}
          />
          <ChannelBar
            name="A  left"
            att={state.attA}
            weight={wA}
            live={wA >= wB}
          />
          <ChannelBar
            name="B  right"
            att={state.attB}
            weight={wB}
            live={wB > wA}
          />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Phase {state.phase}: {state.phase === 0 ? "A is near, k rises with f" : "B is near, k falls with f"}.
            Safe to write channel {state.idleChannel} when its weight is under
            about 2 %. Firmware uses 0.08 dB of hysteresis so the pair does not
            chatter at a boundary.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Boundary table</CardTitle>
          <CardDescription>
            Crossing 11 dB does not retune both channels. The live tap stays at
            11 dB; the silent tap leaps from 10 to 12.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto font-mono text-xs">
            <table className="w-full text-left">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-1 pr-3 font-normal">GR</th>
                  <th className="py-1 pr-3 font-normal">A</th>
                  <th className="py-1 pr-3 font-normal">B</th>
                  <th className="py-1 pr-3 font-normal">k</th>
                  <th className="py-1 font-normal">write</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => {
                  const active = Math.abs(row.n + row.fraction - gr) < 0.26;
                  return (
                    <tr
                      key={`${row.n}-${row.fraction}`}
                      className={active ? "bg-amber-200/15 text-amber-100" : ""}
                    >
                      <td className="py-1 pr-3">
                        {(row.n + row.fraction).toFixed(1)}
                      </td>
                      <td className="py-1 pr-3">−{row.attA}</td>
                      <td className="py-1 pr-3">−{row.attB}</td>
                      <td className="py-1 pr-3">{row.k.toFixed(2)}</td>
                      <td className="py-1">{row.idleChannel}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ChannelBar({
  name,
  att,
  weight,
  live,
}: {
  name: string;
  att: number;
  weight: number;
  live: boolean;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between font-mono text-xs">
        <span>
          {name} · −{att} dB
        </span>
        <span className={live ? "text-amber-200" : "text-muted-foreground"}>
          {(weight * 100).toFixed(1)}% mix
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full ${live ? "bg-amber-300" : "bg-teal-700"}`}
          style={{ width: `${Math.max(weight * 100, 1.5)}%` }}
        />
      </div>
    </div>
  );
}
