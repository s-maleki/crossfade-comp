export function BlockDiagram() {
  return (
    <svg
      viewBox="0 0 960 520"
      className="h-auto w-full"
      role="img"
      aria-label="BlendStep compressor block diagram"
    >
      <rect width="960" height="520" fill="transparent" />
      <text
        x="24"
        y="28"
        fill="#e7d3a1"
        fontFamily="ui-monospace, monospace"
        fontSize="11"
        letterSpacing="0.18em"
      >
        AUDIO PATH
      </text>
      <text
        x="24"
        y="300"
        fill="#9fd6c4"
        fontFamily="ui-monospace, monospace"
        fontSize="11"
        letterSpacing="0.18em"
      >
        SIDECHAIN · LOG DOMAIN
      </text>

      <Box x={24} y={52} w={110} h={64} title="Input" sub="buffer / split" />
      <Box x={168} y={40} w={150} h={44} title="PT2257 A" sub="att = N or N+1 dB" />
      <Box x={168} y={96} w={150} h={44} title="PT2257 B" sub="the adjacent tap" />
      <Box
        x={360}
        y={52}
        w={170}
        h={64}
        title="Analog crossfader"
        sub="vout = A + k(B−A)"
        accent
      />
      <Box x={568} y={52} w={140} h={64} title="Makeup" sub="0 to +20 dB" />
      <Box x={742} y={52} w={110} h={64} title="Output" sub="220 Ω" />

      <Arrow x1={134} y1={84} x2={168} y2={62} />
      <Arrow x1={134} y1={84} x2={168} y2={118} />
      <Arrow x1={318} y1={62} x2={360} y2={76} />
      <Arrow x1={318} y1={118} x2={360} y2={92} />
      <Arrow x1={530} y1={84} x2={568} y2={84} />
      <Arrow x1={708} y1={84} x2={742} y2={84} />

      <Box x={24} y={324} w={130} h={58} title="HPF" sub="~80 Hz, switchable" />
      <Box x={176} y={324} w={150} h={58} title="Rectifier" sub="full-wave peak" />
      <Box x={348} y={324} w={150} h={58} title="Attack / release" sub="linear RC, dB/s release" />
      <Box x={520} y={324} w={130} h={58} title="Log amp" sub="100 mV/dB" />
      <Box x={672} y={310} w={170} h={86} title="Threshold · ratio · max GR" sub="GR = (1−1/R)(L−T)" />

      <path
        d="M79 116 L79 324"
        fill="none"
        stroke="#9fd6c4"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <Arrow x1={154} y1={353} x2={176} y2={353} color="#9fd6c4" />
      <Arrow x1={326} y1={353} x2={348} y2={353} color="#9fd6c4" />
      <Arrow x1={498} y1={353} x2={520} y2={353} color="#9fd6c4" />
      <Arrow x1={650} y1={353} x2={672} y2={353} color="#9fd6c4" />

      <path
        d="M757 396 L757 430 L445 430 L445 148"
        fill="none"
        stroke="#e7d3a1"
        strokeWidth="1.6"
      />
      <polygon points="445,148 440,160 450,160" fill="#e7d3a1" />
      <text
        x="460"
        y="424"
        fill="#e7d3a1"
        fontFamily="ui-monospace, monospace"
        fontSize="11"
      >
        k, analog · 0–1 across each 1 dB
      </text>

      <Box
        x={360}
        y={168}
        w={250}
        h={70}
        title="MCU leapfrog (not in audio)"
        sub="I²C idle-channel updates + VN staircase"
        muted
      />
      <path
        d="M485 238 L485 310"
        fill="none"
        stroke="#8a8478"
        strokeWidth="1.3"
        strokeDasharray="3 3"
      />
      <text
        x="500"
        y="268"
        fill="#b7b1a6"
        fontFamily="ui-monospace, monospace"
        fontSize="10"
      >
        ADC samples VGR only
      </text>
    </svg>
  );
}

function Box({
  x,
  y,
  w,
  h,
  title,
  sub,
  accent,
  muted,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub: string;
  accent?: boolean;
  muted?: boolean;
}) {
  const fill = accent ? "#3a2a12" : muted ? "#1c1b19" : "#241f1a";
  const stroke = accent ? "#e7b56a" : muted ? "#6b6560" : "#c4b49a";
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="8"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.4"
      />
      <text
        x={x + 12}
        y={y + 24}
        fill="#f6efe3"
        fontFamily="Georgia, serif"
        fontSize="13"
      >
        {title}
      </text>
      <text
        x={x + 12}
        y={y + 44}
        fill="#cbbfa8"
        fontFamily="ui-monospace, monospace"
        fontSize="10"
      >
        {sub}
      </text>
    </g>
  );
}

function Arrow({
  x1,
  y1,
  x2,
  y2,
  color = "#d8c7a5",
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
}) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const ah = 7;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.6" />
      <polygon
        fill={color}
        points={`${x2},${y2} ${x2 - ah * Math.cos(angle - 0.45)},${y2 - ah * Math.sin(angle - 0.45)} ${x2 - ah * Math.cos(angle + 0.45)},${y2 - ah * Math.sin(angle + 0.45)}`}
      />
    </g>
  );
}
