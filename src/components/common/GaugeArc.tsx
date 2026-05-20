type Props = {
  value: number;
  min?: number;
  max: number;
  size?: number;
  color?: string;
  thickness?: number;
  label?: string;
};

/**
 * Top semicircle gauge. Fully contained inside its SVG viewBox.
 * Arc sweeps from left (180°) up over the top to right (0°).
 */
export default function GaugeArc({
  value,
  min = 0,
  max,
  size = 160,
  color = "#0F1012",
  thickness = 10,
  label,
}: Props) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const pad = thickness / 2 + 2;
  const r = (size - thickness) / 2 - 2;
  const cx = size / 2;
  const cy = pad + r; // arc center; top of arc sits at y = pad
  const height = r + pad * 2;

  // Angle 0 = right (3 o'clock), π = left (9 o'clock). Arc goes over the top.
  const angleFor = (p: number) => Math.PI - Math.PI * p; // 0 → π (left), 1 → 0 (right)
  const point = (a: number) => [cx + r * Math.cos(a), cy - r * Math.sin(a)] as const;

  const [bx1, by1] = point(Math.PI); // left
  const [bx2, by2] = point(0);       // right
  const [vx2, vy2] = point(angleFor(pct));

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${size} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block", maxWidth: size, transformOrigin: "center" }}
      aria-hidden
    >
      <path
        d={`M ${bx1} ${by1} A ${r} ${r} 0 0 1 ${bx2} ${by2}`}
        stroke="#F2F2F4"
        strokeWidth={thickness}
        fill="none"
        strokeLinecap="round"
      />
      {pct > 0 && (
        <path
          d={`M ${bx1} ${by1} A ${r} ${r} 0 0 1 ${vx2} ${vy2}`}
          stroke={color}
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
          style={{ transition: "all 0.5s cubic-bezier(0.2,1,0.3,1)" }}
        />
      )}
      {label && (
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontSize={10}
          fill="#8F8F8F"
          fontFamily="Inter"
        >
          {label}
        </text>
      )}
    </svg>
  );
}
