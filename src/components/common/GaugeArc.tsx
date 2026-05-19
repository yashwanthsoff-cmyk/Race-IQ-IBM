type Props = {
  value: number;     // current
  min?: number;
  max: number;
  size?: number;
  color?: string;
  thickness?: number;
  label?: string;
};

export default function GaugeArc({ value, min = 0, max, size = 180, color = "#0F1012", thickness = 10, label }: Props) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const r = (size - thickness) / 2;
  const c = size / 2;
  // Semicircle from 180° to 360° (bottom-aligned arc)
  const startAngle = Math.PI;
  const endAngle = startAngle + Math.PI * pct;
  const x1 = c + r * Math.cos(startAngle);
  const y1 = c + r * Math.sin(startAngle);
  const x2 = c + r * Math.cos(endAngle);
  const y2 = c + r * Math.sin(endAngle);
  const largeArc = pct > 0.5 ? 1 : 0;
  const bgEndX = c + r * Math.cos(Math.PI * 2);
  const bgEndY = c + r * Math.sin(Math.PI * 2);

  return (
    <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size / 2 + 8}`} aria-hidden>
      <path d={`M ${x1} ${y1} A ${r} ${r} 0 1 1 ${bgEndX} ${bgEndY}`} stroke="#F2F2F4" strokeWidth={thickness} fill="none" strokeLinecap="round" />
      {pct > 0 && (
        <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`} stroke={color} strokeWidth={thickness} fill="none" strokeLinecap="round"
          style={{ transition: "all 0.5s cubic-bezier(0.2,1,0.3,1)" }} />
      )}
      {label && (
        <text x={c} y={size / 2 - 2} textAnchor="middle" fontSize={10} fill="#8F8F8F" fontFamily="Inter">{label}</text>
      )}
    </svg>
  );
}
