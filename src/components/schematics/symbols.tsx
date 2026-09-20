import type { ReactNode } from "react";

export function SchematicFrame({
  dwg,
  title,
  children,
  viewBox,
  notes,
}: {
  dwg: string;
  title: string;
  children: ReactNode;
  viewBox: string;
  notes?: string;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-stone-300 bg-[#f3eee3] text-[#1c1916] shadow-sm">
      <figcaption className="flex items-center justify-between gap-3 border-b border-[#1c1916]/15 px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase">
        <span>BlendStep · {dwg}</span>
        <span className="truncate text-center">{title}</span>
        <span>Rev A</span>
      </figcaption>
      <div className="overflow-x-auto">
        <svg
          viewBox={viewBox}
          className="h-auto w-full min-w-[720px]"
          role="img"
          aria-label={title}
        >
          {children}
        </svg>
      </div>
      {notes ? (
        <p className="border-t border-[#1c1916]/15 px-3 py-2 text-xs leading-relaxed text-[#4a453c]">
          {notes}
        </p>
      ) : null}
    </figure>
  );
}

export const ink = "#1f1b16";
export const dim = "#6a6256";
export const hi = "#9a4b12";
export const teal = "#0f5f56";

export function Label({
  x,
  y,
  children,
  anchor = "start",
}: {
  x: number;
  y: number;
  children: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      fill={ink}
      fontFamily="ui-monospace, SFMono-Regular, monospace"
      fontSize="11"
      textAnchor={anchor}
    >
      {children}
    </text>
  );
}

export function Wire({
  d,
  color = ink,
}: {
  d: string;
  color?: string;
}) {
  return <path d={d} fill="none" stroke={color} strokeWidth="1.6" />;
}

export function Dot({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="2.4" fill={ink} />;
}

export function Gnd({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M ${x} ${y} v 8`} stroke={ink} strokeWidth="1.6" />
      <path d={`M ${x - 10} ${y + 8} h 20`} stroke={ink} strokeWidth="1.6" />
      <path d={`M ${x - 6} ${y + 12} h 12`} stroke={ink} strokeWidth="1.6" />
      <path d={`M ${x - 3} ${y + 16} h 6`} stroke={ink} strokeWidth="1.6" />
    </g>
  );
}

export function ResistorH({
  x1,
  x2,
  y,
  refDes,
  value,
}: {
  x1: number;
  x2: number;
  y: number;
  refDes: string;
  value: string;
}) {
  const mid = (x1 + x2) / 2;
  return (
    <g>
      <path d={`M ${x1} ${y} H ${mid - 22}`} stroke={ink} strokeWidth="1.6" />
      <path
        d={`M ${mid - 22} ${y} l 4 -8 7 16 7 -16 7 16 7 -16 4 8`}
        fill="none"
        stroke={ink}
        strokeWidth="1.6"
      />
      <path d={`M ${mid + 22} ${y} H ${x2}`} stroke={ink} strokeWidth="1.6" />
      <Label x={mid} y={y - 12} anchor="middle">
        {`${refDes} ${value}`}
      </Label>
    </g>
  );
}

export function ResistorV({
  x,
  y1,
  y2,
  refDes,
  value,
}: {
  x: number;
  y1: number;
  y2: number;
  refDes: string;
  value: string;
}) {
  const mid = (y1 + y2) / 2;
  return (
    <g>
      <path d={`M ${x} ${y1} V ${mid - 22}`} stroke={ink} strokeWidth="1.6" />
      <path
        d={`M ${x} ${mid - 22} l -8 4 16 7 -16 7 16 7 -16 7 8 4`}
        fill="none"
        stroke={ink}
        strokeWidth="1.6"
      />
      <path d={`M ${x} ${mid + 22} V ${y2}`} stroke={ink} strokeWidth="1.6" />
      <Label x={x + 10} y={mid + 4}>
        {`${refDes} ${value}`}
      </Label>
    </g>
  );
}

export function CapH({
  x1,
  x2,
  y,
  refDes,
  value,
}: {
  x1: number;
  x2: number;
  y: number;
  refDes: string;
  value: string;
}) {
  const mid = (x1 + x2) / 2;
  return (
    <g>
      <path d={`M ${x1} ${y} H ${mid - 6}`} stroke={ink} strokeWidth="1.6" />
      <path d={`M ${mid - 6} ${y - 12} v 24`} stroke={ink} strokeWidth="1.8" />
      <path d={`M ${mid + 6} ${y - 12} v 24`} stroke={ink} strokeWidth="1.8" />
      <path d={`M ${mid + 6} ${y} H ${x2}`} stroke={ink} strokeWidth="1.6" />
      <Label x={mid} y={y - 16} anchor="middle">
        {`${refDes} ${value}`}
      </Label>
    </g>
  );
}

export function CapV({
  x,
  y1,
  y2,
  refDes,
  value,
}: {
  x: number;
  y1: number;
  y2: number;
  refDes: string;
  value: string;
}) {
  const mid = (y1 + y2) / 2;
  return (
    <g>
      <path d={`M ${x} ${y1} V ${mid - 6}`} stroke={ink} strokeWidth="1.6" />
      <path d={`M ${x - 12} ${mid - 6} h 24`} stroke={ink} strokeWidth="1.8" />
      <path d={`M ${x - 12} ${mid + 6} h 24`} stroke={ink} strokeWidth="1.8" />
      <path d={`M ${x} ${mid + 6} V ${y2}`} stroke={ink} strokeWidth="1.6" />
      <Label x={x + 16} y={mid + 4}>
        {`${refDes} ${value}`}
      </Label>
    </g>
  );
}

export function OpAmp({
  x,
  y,
  name,
  flip = false,
}: {
  x: number;
  y: number;
  name: string;
  flip?: boolean;
}) {
  const tri = flip
    ? `${x},${y} ${x - 70},${y - 36} ${x - 70},${y + 36}`
    : `${x},${y} ${x + 70},${y - 36} ${x + 70},${y + 36}`;
  const plusX = flip ? x - 18 : x + 14;
  const minusX = plusX;
  return (
    <g>
      <polygon
        points={tri}
        fill="#f7f1e4"
        stroke={ink}
        strokeWidth="1.6"
      />
      <text x={plusX} y={y - 12} fontSize="12" fill={ink}>
        +
      </text>
      <text x={minusX} y={y + 18} fontSize="14" fill={ink}>
        −
      </text>
      <Label x={flip ? x - 48 : x + 22} y={y + 4}>
        {name}
      </Label>
    </g>
  );
}

export function PotV({
  x,
  y1,
  y2,
  refDes,
  value,
}: {
  x: number;
  y1: number;
  y2: number;
  refDes: string;
  value: string;
}) {
  const mid = (y1 + y2) / 2;
  return (
    <g>
      <ResistorV x={x} y1={y1} y2={y2} refDes={refDes} value={value} />
      <path
        d={`M ${x + 26} ${mid} l -10 -5 0 10 z`}
        fill={ink}
      />
    </g>
  );
}

export function DiodeH({
  x1,
  x2,
  y,
  refDes,
}: {
  x1: number;
  x2: number;
  y: number;
  refDes: string;
}) {
  const mid = (x1 + x2) / 2;
  return (
    <g>
      <path d={`M ${x1} ${y} H ${mid - 10}`} stroke={ink} strokeWidth="1.6" />
      <path
        d={`M ${mid - 10} ${y - 10} L ${mid + 8} ${y} L ${mid - 10} ${y + 10} Z`}
        fill="#f7f1e4"
        stroke={ink}
        strokeWidth="1.4"
      />
      <path d={`M ${mid + 8} ${y - 10} v 20`} stroke={ink} strokeWidth="1.6" />
      <path d={`M ${mid + 8} ${y} H ${x2}`} stroke={ink} strokeWidth="1.6" />
      <Label x={mid} y={y - 14} anchor="middle">
        {refDes}
      </Label>
    </g>
  );
}

export function Npn({
  x,
  y,
  name,
}: {
  x: number;
  y: number;
  name: string;
}) {
  return (
    <g>
      <circle cx={x} cy={y} r="16" fill="#f7f1e4" stroke={ink} strokeWidth="1.5" />
      <path d={`M ${x - 8} ${y - 10} v 20`} stroke={ink} strokeWidth="1.8" />
      <path d={`M ${x - 8} ${y - 6} L ${x + 12} ${y - 14}`} stroke={ink} strokeWidth="1.5" />
      <path d={`M ${x - 8} ${y + 6} L ${x + 12} ${y + 14}`} stroke={ink} strokeWidth="1.5" />
      <path
        d={`M ${x + 4} ${y + 8} l 4 8 6 -2`}
        fill="none"
        stroke={ink}
        strokeWidth="1.3"
      />
      <Label x={x - 8} y={y + 32} anchor="middle">
        {name}
      </Label>
    </g>
  );
}

export function Jfet({
  x,
  y,
  name,
}: {
  x: number;
  y: number;
  name: string;
}) {
  return (
    <g>
      <circle cx={x} cy={y} r="18" fill="#f7f1e4" stroke={ink} strokeWidth="1.5" />
      <path d={`M ${x - 6} ${y - 12} v 24`} stroke={ink} strokeWidth="2" />
      <path d={`M ${x - 6} ${y - 8} H ${x + 12}`} stroke={ink} strokeWidth="1.5" />
      <path d={`M ${x - 6} ${y + 8} H ${x + 12}`} stroke={ink} strokeWidth="1.5" />
      <path d={`M ${x - 18} ${y} H ${x - 6}`} stroke={ink} strokeWidth="1.5" />
      <Label x={x} y={y + 34} anchor="middle">
        {name}
      </Label>
    </g>
  );
}

export function Chip({
  x,
  y,
  w,
  h,
  name,
  pins,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  pins: { side: "L" | "R"; n: number; label: string; yy: number }[];
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="6"
        fill="#ece4d4"
        stroke={ink}
        strokeWidth="1.6"
      />
      <Label x={x + w / 2} y={y + 18} anchor="middle">
        {name}
      </Label>
      {pins.map((p) => (
        <g key={`${p.side}-${p.n}-${p.label}-${p.yy}`}>
          <path
            d={
              p.side === "L"
                ? `M ${x} ${p.yy} h -14`
                : `M ${x + w} ${p.yy} h 14`
            }
            stroke={ink}
            strokeWidth="1.6"
          />
          <Label
            x={p.side === "L" ? x + 8 : x + w - 8}
            y={p.yy + 4}
            anchor={p.side === "L" ? "start" : "end"}
          >
            {`${p.n} ${p.label}`}
          </Label>
        </g>
      ))}
    </g>
  );
}
