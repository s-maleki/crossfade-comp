import type { ReactNode } from "react";

export function SchematicFrame({
  dwg,
  title,
  children,
  viewBox,
  notes,
  rev = "B",
}: {
  dwg: string;
  title: string;
  children: ReactNode;
  viewBox: string;
  notes?: string;
  rev?: string;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-stone-300 bg-[#f3eee3] text-[#1c1916] shadow-sm">
      <figcaption className="flex items-center justify-between gap-3 border-b border-[#1c1916]/15 px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase">
        <span>BlendStep · {dwg}</span>
        <span className="truncate text-center">{title}</span>
        <span>Rev {rev}</span>
      </figcaption>
      <div className="overflow-x-auto">
        <svg
          viewBox={viewBox}
          className="h-auto w-full min-w-[860px]"
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
export const paper = "#f3eee3";

export function Txt({
  x,
  y,
  children,
  anchor = "start",
  size = 11,
  weight = "normal",
}: {
  x: number;
  y: number;
  children: string;
  anchor?: "start" | "middle" | "end";
  size?: number;
  weight?: "normal" | "bold";
}) {
  return (
    <text
      x={x}
      y={y}
      fill={ink}
      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      fontSize={size}
      fontWeight={weight}
      textAnchor={anchor}
      stroke={paper}
      strokeWidth={size >= 12 ? 4.5 : 3.4}
      paintOrder="stroke"
      strokeLinejoin="round"
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
  return <path d={d} fill="none" stroke={color} strokeWidth="1.5" />;
}

export function Dot({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="2.3" fill={ink} />;
}

export function Gnd({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M ${x} ${y} v 7`} stroke={ink} strokeWidth="1.5" />
      <path d={`M ${x - 9} ${y + 7} h 18`} stroke={ink} strokeWidth="1.5" />
      <path d={`M ${x - 6} ${y + 11} h 12`} stroke={ink} strokeWidth="1.5" />
      <path d={`M ${x - 3} ${y + 15} h 6`} stroke={ink} strokeWidth="1.5" />
    </g>
  );
}

/** Horizontal resistor. Zigzag is 48 px, centered between x1 and x2. */
export function ResistorH({
  x1,
  x2,
  y,
  refDes,
  value,
  label = "above",
}: {
  x1: number;
  x2: number;
  y: number;
  refDes: string;
  value: string;
  label?: "above" | "below";
}) {
  const mid = (x1 + x2) / 2;
  const z = 24;
  return (
    <g>
      <path d={`M ${x1} ${y} H ${mid - z}`} stroke={ink} strokeWidth="1.5" />
      <path
        d={`M ${mid - z} ${y} l 8 -7 8 14 8 -14 8 14 8 -14 8 7`}
        fill="none"
        stroke={ink}
        strokeWidth="1.5"
      />
      <path d={`M ${mid + z} ${y} H ${x2}`} stroke={ink} strokeWidth="1.5" />
      <Txt x={mid} y={label === "above" ? y - 12 : y + 20} anchor="middle">
        {`${refDes} ${value}`}
      </Txt>
    </g>
  );
}

export function ResistorV({
  x,
  y1,
  y2,
  refDes,
  value,
  label = "right",
}: {
  x: number;
  y1: number;
  y2: number;
  refDes: string;
  value: string;
  label?: "right" | "left";
}) {
  const mid = (y1 + y2) / 2;
  const z = 24;
  return (
    <g>
      <path d={`M ${x} ${y1} V ${mid - z}`} stroke={ink} strokeWidth="1.5" />
      <path
        d={`M ${x} ${mid - z} l -7 8 14 8 -14 8 14 8 -14 8 7 8`}
        fill="none"
        stroke={ink}
        strokeWidth="1.5"
      />
      <path d={`M ${x} ${mid + z} V ${y2}`} stroke={ink} strokeWidth="1.5" />
      <Txt
        x={label === "right" ? x + 12 : x - 12}
        y={mid + 4}
        anchor={label === "right" ? "start" : "end"}
      >
        {`${refDes} ${value}`}
      </Txt>
    </g>
  );
}

export function CapH({
  x1,
  x2,
  y,
  refDes,
  value,
  label = "above",
}: {
  x1: number;
  x2: number;
  y: number;
  refDes: string;
  value: string;
  label?: "above" | "below";
}) {
  const mid = (x1 + x2) / 2;
  return (
    <g>
      <path d={`M ${x1} ${y} H ${mid - 5}`} stroke={ink} strokeWidth="1.5" />
      <path d={`M ${mid - 5} ${y - 11} v 22`} stroke={ink} strokeWidth="1.8" />
      <path d={`M ${mid + 5} ${y - 11} v 22`} stroke={ink} strokeWidth="1.8" />
      <path d={`M ${mid + 5} ${y} H ${x2}`} stroke={ink} strokeWidth="1.5" />
      <Txt x={mid} y={label === "above" ? y - 16 : y + 24} anchor="middle">
        {`${refDes} ${value}`}
      </Txt>
    </g>
  );
}

/** Horizontal trimmer capacitor (arrow through the plates). */
export function TrimmerCapH({
  x1,
  x2,
  y,
  refDes,
  value,
  label = "above",
}: {
  x1: number;
  x2: number;
  y: number;
  refDes: string;
  value: string;
  label?: "above" | "below";
}) {
  const mid = (x1 + x2) / 2;
  return (
    <g>
      <path d={`M ${x1} ${y} H ${mid - 6}`} stroke={ink} strokeWidth="1.5" />
      <path d={`M ${mid - 6} ${y - 12} v 24`} stroke={ink} strokeWidth="1.8" />
      <path d={`M ${mid + 6} ${y - 12} v 24`} stroke={ink} strokeWidth="1.8" />
      <path d={`M ${mid + 6} ${y} H ${x2}`} stroke={ink} strokeWidth="1.5" />
      <path
        d={`M ${mid - 16} ${y + 16} L ${mid + 14} ${y - 16}`}
        stroke={ink}
        strokeWidth="1.3"
      />
      <path
        d={`M ${mid + 8} ${y - 16} h 8 v 8`}
        fill="none"
        stroke={ink}
        strokeWidth="1.3"
      />
      <Txt x={mid} y={label === "above" ? y - 20 : y + 28} anchor="middle">
        {`${refDes} ${value}`}
      </Txt>
    </g>
  );
}

export function CapV({
  x,
  y1,
  y2,
  refDes,
  value,
  label = "right",
}: {
  x: number;
  y1: number;
  y2: number;
  refDes: string;
  value: string;
  label?: "right" | "left";
}) {
  const mid = (y1 + y2) / 2;
  return (
    <g>
      <path d={`M ${x} ${y1} V ${mid - 5}`} stroke={ink} strokeWidth="1.5" />
      <path d={`M ${x - 11} ${mid - 5} h 22`} stroke={ink} strokeWidth="1.8" />
      <path d={`M ${x - 11} ${mid + 5} h 22`} stroke={ink} strokeWidth="1.8" />
      <path d={`M ${x} ${mid + 5} V ${y2}`} stroke={ink} strokeWidth="1.5" />
      <Txt
        x={label === "right" ? x + 14 : x - 14}
        y={mid + 4}
        anchor={label === "right" ? "start" : "end"}
      >
        {`${refDes} ${value}`}
      </Txt>
    </g>
  );
}

/**
 * Op-amp pointing right.
 * Non-inverting input: (x, y - 16)
 * Inverting input:     (x, y + 16)
 * Output:              (x + 64, y)
 */
export function OpAmp({
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
      <polygon
        points={`${x},${y - 32} ${x},${y + 32} ${x + 64},${y}`}
        fill="#f7f1e4"
        stroke={ink}
        strokeWidth="1.5"
      />
      <text x={x + 8} y={y - 10} fontSize="13" fill={ink}>
        +
      </text>
      <text x={x + 9} y={y + 20} fontSize="14" fill={ink}>
        −
      </text>
      <Txt x={x + 28} y={y + 4} size={10}>
        {name}
      </Txt>
    </g>
  );
}

export function DiodeH({
  x1,
  x2,
  y,
  refDes,
  label = "above",
}: {
  x1: number;
  x2: number;
  y: number;
  refDes: string;
  label?: "above" | "below";
}) {
  const mid = (x1 + x2) / 2;
  const dir = x2 >= x1 ? 1 : -1;
  const tip = mid + 8 * dir;
  const back = mid - 9 * dir;
  return (
    <g>
      <path d={`M ${x1} ${y} H ${back}`} stroke={ink} strokeWidth="1.5" />
      <path
        d={`M ${back} ${y - 9} L ${tip} ${y} L ${back} ${y + 9} Z`}
        fill="#f7f1e4"
        stroke={ink}
        strokeWidth="1.4"
      />
      <path d={`M ${tip} ${y - 9} v 18`} stroke={ink} strokeWidth="1.5" />
      <path d={`M ${tip} ${y} H ${x2}`} stroke={ink} strokeWidth="1.5" />
      <Txt x={mid} y={label === "above" ? y - 18 : y + 22} anchor="middle">
        {refDes}
      </Txt>
    </g>
  );
}

/**
 * NPN. Base (x − 18, y), collector (x + 18, y − 18), emitter (x + 18, y + 18).
 */
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
      <circle cx={x} cy={y} r="15" fill="#f7f1e4" stroke={ink} strokeWidth="1.4" />
      <path d={`M ${x - 7} ${y - 9} v 18`} stroke={ink} strokeWidth="1.7" />
      <path d={`M ${x - 18} ${y} H ${x - 7}`} stroke={ink} strokeWidth="1.4" />
      <path d={`M ${x - 7} ${y - 5} L ${x + 11} ${y - 13}`} stroke={ink} strokeWidth="1.4" />
      <path d={`M ${x + 11} ${y - 13} L ${x + 18} ${y - 18}`} stroke={ink} strokeWidth="1.4" />
      <path d={`M ${x - 7} ${y + 5} L ${x + 11} ${y + 13}`} stroke={ink} strokeWidth="1.4" />
      <path d={`M ${x + 11} ${y + 13} L ${x + 18} ${y + 18}`} stroke={ink} strokeWidth="1.4" />
      <path
        d={`M ${x + 3} ${y + 7} l 4 7 6 -2`}
        fill="none"
        stroke={ink}
        strokeWidth="1.2"
      />
      <Txt x={x - 22} y={y + 4} anchor="end" size={10}>
        {name}
      </Txt>
    </g>
  );
}

/**
 * Off-page net. The stub starts at (x, y) and runs toward the circuit
 * (to the right for "in", to the left for "out").
 */
export function Port({
  x,
  y,
  label,
  dir = "in",
}: {
  x: number;
  y: number;
  label: string;
  dir?: "in" | "out";
}) {
  const dx = dir === "in" ? 10 : -10;
  return (
    <g>
      <path d={`M ${x} ${y} h ${dx}`} stroke={ink} strokeWidth="1.5" />
      <circle cx={x} cy={y} r="2.3" fill={ink} />
      <Txt
        x={dir === "in" ? x - 6 : x + 6}
        y={y + 4}
        anchor={dir === "in" ? "end" : "start"}
      >
        {label}
      </Txt>
    </g>
  );
}

/** N-JFET. Drain (x, y-18), source (x, y+18), gate (x-18, y). */
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
      <circle cx={x} cy={y} r="17" fill="#f7f1e4" stroke={ink} strokeWidth="1.4" />
      <path d={`M ${x - 5} ${y - 11} v 22`} stroke={ink} strokeWidth="2" />
      <path d={`M ${x - 5} ${y - 7} H ${x + 11}`} stroke={ink} strokeWidth="1.4" />
      <path d={`M ${x - 5} ${y + 7} H ${x + 11}`} stroke={ink} strokeWidth="1.4" />
      <path d={`M ${x - 18} ${y} H ${x - 5}`} stroke={ink} strokeWidth="1.4" />
      <Txt x={x + 22} y={y + 5} size={10}>
        {name}
      </Txt>
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
        strokeWidth="1.5"
      />
      <Txt x={x + w / 2} y={y + 16} anchor="middle" weight="bold">
        {name}
      </Txt>
      {pins.map((p) => (
        <g key={`${p.side}-${p.n}-${p.label}-${p.yy}`}>
          <path
            d={p.side === "L" ? `M ${x} ${p.yy} h -12` : `M ${x + w} ${p.yy} h 12`}
            stroke={ink}
            strokeWidth="1.5"
          />
          <Txt
            x={p.side === "L" ? x + 8 : x + w - 8}
            y={p.yy + 3}
            anchor={p.side === "L" ? "start" : "end"}
            size={10}
          >
            {`${p.n} ${p.label}`}
          </Txt>
        </g>
      ))}
    </g>
  );
}
