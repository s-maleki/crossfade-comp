import { SchematicFrame, Txt, ink } from "./symbols";

function Balloon({
  x,
  y,
  n,
}: {
  x: number;
  y: number;
  n: number;
}) {
  return (
    <g>
      <circle cx={x} cy={y} r="10" fill="#f7f1e4" stroke={ink} strokeWidth="1.4" />
      <Txt x={x} y={y + 4} anchor="middle" size={11} weight="bold">
        {String(n)}
      </Txt>
    </g>
  );
}

function Pad({ x, y, r = 5 }: { x: number; y: number; r?: number }) {
  return (
    <circle
      cx={x}
      cy={y}
      r={r}
      fill="#d7c9a8"
      stroke={ink}
      strokeWidth="1.2"
    />
  );
}

export function CgdCompensationLayout() {
  return (
    <SchematicFrame
      dwg="DWG-04A"
      rev="C"
      title="JFET island · neutralization layout (top copper, viewed from component side)"
      viewBox="0 0 1180 640"
      notes="Keep the cancel current in a few millimetres of copper. CV1’s drain pad is the same node as Q10 pin 1 — no via, no stub. Vgs and Vgs_inv run as a tight pair from U2C/U2D and only meet the audio node at Cgd (inside the FET) and at CV1. Source pin 2 goes to AGND with a via under the body. The 7660 charge pump stays off this island."
    >
      <rect
        x={40}
        y={36}
        width={720}
        height={430}
        rx="8"
        fill="#e7dcc6"
        stroke={ink}
        strokeWidth="1.4"
      />
      <Txt x={56} y={58} size={11} weight="bold">
        AGND pour · interpolator island
      </Txt>
      <Txt x={400} y={58} size={10}>
        keep-out: no Vk / Vgs_inv fill under Vk′
      </Txt>

      <rect
        x={70}
        y={80}
        width={250}
        height={150}
        rx="6"
        fill="#ece4d4"
        stroke={ink}
        strokeWidth="1.4"
      />
      <Txt x={195} y={102} anchor="middle" weight="bold">
        U2 TL074
      </Txt>
      <Txt x={195} y={120} anchor="middle" size={10}>
        A difference · B recombine
      </Txt>
      <Txt x={195} y={138} anchor="middle" size={10}>
        C Vgs driver · D −Vgs invert
      </Txt>
      <Txt x={88} y={168} size={10}>
        8 Vgs (U2C out)
      </Txt>
      <Txt x={88} y={190} size={10}>
        14 −Vgs (U2D out) / R73
      </Txt>
      <Txt x={88} y={212} size={10}>
        4 VCC+  ·  11 VEE
      </Txt>
      <Balloon x={40} y={96} n={3} />

      <rect
        x={390}
        y={90}
        width={140}
        height={110}
        rx="6"
        fill="#f7f1e4"
        stroke={ink}
        strokeWidth="1.4"
      />
      <Txt x={460} y={112} anchor="middle" weight="bold">
        Q10 TO-92
      </Txt>
      <Txt x={460} y={130} anchor="middle" size={10}>
        flat toward CV1
      </Txt>
      <Pad x={430} y={162} />
      <Pad x={460} y={162} />
      <Pad x={490} y={162} />
      <Txt x={430} y={186} anchor="middle" size={10}>
        D
      </Txt>
      <Txt x={460} y={186} anchor="middle" size={10}>
        S
      </Txt>
      <Txt x={490} y={186} anchor="middle" size={10}>
        G
      </Txt>
      <Balloon x={534} y={104} n={1} />

      <circle
        cx={460}
        cy={162}
        r="7"
        fill="none"
        stroke={ink}
        strokeWidth="1.1"
        strokeDasharray="3 2"
      />
      <path d="M 460 169 V 210" stroke={ink} strokeWidth="1.5" />
      <circle
        cx={460}
        cy={218}
        r="5"
        fill="none"
        stroke={ink}
        strokeWidth="1.3"
      />
      <circle cx={460} cy={218} r="1.6" fill={ink} />
      <Txt x={472} y={222} size={10}>
        AGND via under body
      </Txt>
      <Balloon x={460} y={252} n={4} />

      <rect
        x={560}
        y={88}
        width={120}
        height={90}
        rx="6"
        fill="#f7f1e4"
        stroke={ink}
        strokeWidth="1.4"
      />
      <Txt x={620} y={110} anchor="middle" weight="bold">
        CV1
      </Txt>
      <Txt x={620} y={128} anchor="middle" size={10}>
        2–10 pF trim
      </Txt>
      <Txt x={620} y={146} anchor="middle" size={10}>
        C0G, top adjust
      </Txt>
      <Pad x={590} y={160} r={6} />
      <Pad x={650} y={160} r={6} />
      <Txt x={590} y={182} anchor="middle" size={9}>
        to D
      </Txt>
      <Txt x={650} y={182} anchor="middle" size={9}>
        to R73
      </Txt>
      <Balloon x={692} y={100} n={2} />

      <path
        d="M 430 162 H 400 V 70 H 590"
        fill="none"
        stroke="#8a5a12"
        strokeWidth="2.4"
      />
      <path
        d="M 590 160 H 430"
        fill="none"
        stroke="#8a5a12"
        strokeWidth="2.4"
      />
      <Txt x={500} y={78} size={10}>
        Vk′ · drain node · 2.4 mm max
      </Txt>
      <Balloon x={400} y={70} n={5} />

      <path
        d="M 200 176 H 360 V 300 H 490"
        fill="none"
        stroke={ink}
        strokeWidth="1.6"
      />
      <path
        d="M 200 190 H 340 V 320 H 650 V 160"
        fill="none"
        stroke="#3d5a3a"
        strokeWidth="1.6"
      />
      <Txt x={250} y={314} size={10}>
        Vgs
      </Txt>
      <Txt x={250} y={340} size={10}>
        Vgs_inv
      </Txt>
      <Balloon x={300} y={300} n={6} />

      <rect
        x={390}
        y={270}
        width={90}
        height={40}
        rx="4"
        fill="#f7f1e4"
        stroke={ink}
        strokeWidth="1.2"
      />
      <Txt x={435} y={295} anchor="middle" size={10}>
        R64 22k
      </Txt>
      <rect
        x={500}
        y={270}
        width={90}
        height={40}
        rx="4"
        fill="#f7f1e4"
        stroke={ink}
        strokeWidth="1.2"
      />
      <Txt x={545} y={295} anchor="middle" size={10}>
        R65/R66
      </Txt>
      <rect
        x={620}
        y={210}
        width={80}
        height={40}
        rx="4"
        fill="#f7f1e4"
        stroke={ink}
        strokeWidth="1.2"
      />
      <Txt x={660} y={235} anchor="middle" size={10}>
        R73 1k
      </Txt>

      <rect
        x={70}
        y={360}
        width={200}
        height={80}
        rx="6"
        fill="#f3d6d0"
        stroke="#8b3a3a"
        strokeWidth="1.4"
        strokeDasharray="5 3"
      />
      <Txt x={170} y={394} anchor="middle" size={11} weight="bold">
        7660 keep-out
      </Txt>
      <Txt x={170} y={414} anchor="middle" size={10}>
        ≥ 25 mm, no shared pour
      </Txt>
      <Balloon x={40} y={380} n={7} />

      <rect
        x={300}
        y={360}
        width={180}
        height={80}
        rx="6"
        fill="#f7f1e4"
        stroke={ink}
        strokeWidth="1.2"
      />
      <Txt x={390} y={394} anchor="middle" size={11}>
        U2B summing
      </Txt>
      <Txt x={390} y={414} anchor="middle" size={10}>
        take Vk′ here, not at CV1
      </Txt>
      <Balloon x={490} y={370} n={8} />

      <Txt x={780} y={58} size={12} weight="bold">
        Place in this order
      </Txt>
      <Txt x={780} y={88} size={11}>
        1  Q10 first. Pin 1 (D) is Vk′. Pin 2 (S) via
      </Txt>
      <Txt x={798} y={106} size={11}>
        to AGND under the body. Pin 3 (G) toward U2.
      </Txt>
      <Txt x={780} y={136} size={11}>
        2  CV1 next to pin 1. Drain pad of the trimmer
      </Txt>
      <Txt x={798} y={154} size={11}>
        on the pin-1 copper, not on a via stub.
      </Txt>
      <Txt x={780} y={184} size={11}>
        3  U2 within 15 mm. Face the C/D edge (pins 8 and
      </Txt>
      <Txt x={798} y={202} size={11}>
        14) at the island so Vgs and −Vgs stay a pair.
      </Txt>
      <Txt x={780} y={232} size={11}>
        4  Source via is Kelvin AGND — do not share it
      </Txt>
      <Txt x={798} y={250} size={11}>
        with the 7660 0 V return.
      </Txt>
      <Txt x={780} y={280} size={11}>
        5  Drain copper is a short fat spur. No CV
      </Txt>
      <Txt x={798} y={298} size={11}>
        fill under it, no I²C under it.
      </Txt>
      <Txt x={780} y={328} size={11}>
        6  Route Vgs and Vgs_inv as a pair, 0.5 mm
      </Txt>
      <Txt x={798} y={346} size={11}>
        apart, away from VA/VB until R64.
      </Txt>
      <Txt x={780} y={376} size={11}>
        7  ICL7660S and C3/C4 stay off the island.
      </Txt>
      <Txt x={780} y={404} size={11}>
        8  Recombine tap at R68, after the island,
      </Txt>
      <Txt x={798} y={422} size={11}>
        so U2B input current does not drop across CV1.
      </Txt>

      <Txt x={56} y={500} size={11} weight="bold">
        Why this geometry
      </Txt>
      <Txt x={56} y={524} size={11}>
        Cgd current is real at the drain pad. Any extra millimetres of Vk′ trace are inductance the invert
      </Txt>
      <Txt x={56} y={542} size={11}>
        path does not share, so the null leaves a spike. R73 lives at U2D pin 8, then a short run to CV1 —
      </Txt>
      <Txt x={56} y={560} size={11}>
        not at the drain — so a shorted trimmer cannot glue U2D onto the audio node. Matched Vgs / −Vgs
      </Txt>
      <Txt x={56} y={578} size={11}>
        delay keeps the two ramps opposite through the attack edge; a long invert hop would be a different
      </Txt>
      <Txt x={56} y={596} size={11}>
        dV/dt and the null would only work midband. Trim from the top with a plastic driver while scoping Vmix.
      </Txt>
    </SchematicFrame>
  );
}
