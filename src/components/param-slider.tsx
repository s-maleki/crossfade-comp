"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type ParamSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  digits?: number;
  onChange: (value: number) => void;
};

export function ParamSlider({
  label,
  value,
  min,
  max,
  step,
  unit = "",
  digits = 2,
  onChange,
}: ParamSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label className="text-xs tracking-wide text-muted-foreground uppercase">
          {label}
        </Label>
        <span className="font-mono text-sm tabular-nums text-foreground">
          {value.toFixed(digits)}
          {unit}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(next) => {
          const n = Array.isArray(next) ? next[0] : next;
          if (typeof n === "number" && !Number.isNaN(n)) onChange(n);
        }}
      />
    </div>
  );
}
