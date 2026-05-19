import { createFileRoute } from "@tanstack/react-router";
import { useGlobal } from "@/context/GlobalContext";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { fanText, FAN_HEADERS } from "@/utils/fanText";

export const Route = createFileRoute("/_app/probability")({
  head: () => ({ meta: [{ title: "Win Probability — RaceIQ" }] }),
  component: ProbabilityPage,
});

function ProbabilityPage() {
  const { winProbability, fanMode } = useGlobal();
  const leader = [...winProbability].sort((a, b) => b.probability - a.probability)[0];

  const timeline = Array.from({ length: 30 }).map((_, i) => {
    const row: any = { lap: i + 1 };
    for (const d of winProbability) row[d.driver] = d.history[i] ?? d.probability;
    return row;
  });

  return (
    <div style={{ padding: "32px 32px 80px" }}>
      <div className="eyebrow">{fanMode ? FAN_HEADERS.probability : "WIN PROBABILITY"}</div>
      <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-0.025em", marginTop: 4 }}>
        {fanMode ? `${leader.name.split(" ").slice(-1)[0]} IS WINNING! (${leader.probability.toFixed(0)}% chance)` : "Live win probability"}
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }} className="prob-grid">
        <div className="glass" style={{ padding: 24, position: "relative" }}>
          <div className="eyebrow">PROBABILITY DISTRIBUTION</div>
          <div style={{ width: "100%", height: 360, position: "relative" }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={winProbability} dataKey="probability" nameKey="driver" innerRadius={80} outerRadius={140} paddingAngle={2}>
                  {winProbability.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "rgba(253,253,253,0.95)", border: "1px solid rgba(15,16,18,0.08)", borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div className="eyebrow">LEADER</div>
              <div className="font-display" style={{ fontSize: 20, marginTop: 4 }}>{leader.driver}</div>
              <div className="font-display" style={{ fontSize: 32, color: leader.color }}>{leader.probability.toFixed(0)}%</div>
            </div>
          </div>
        </div>

        <div className="glass" style={{ padding: 24 }}>
          <div className="eyebrow">TOP 5 DRIVERS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {[...winProbability].sort((a, b) => b.probability - a.probability).map((d, i) => (
              <div key={d.driver} className="glass-sm" style={{
                padding: 14, background: "var(--bg-surface)", borderRadius: 16,
                borderLeft: `2px solid ${d.color}`, display: "flex", alignItems: "center", gap: 12,
              }}>
                <span className="font-display pill" style={{
                  background: i === 0 ? "#F5A623" : i === 1 ? "#8F8F8F" : i === 2 ? "#E8700A" : "var(--bg-surface)",
                  color: i < 3 ? "#FDFDFD" : "#0F1012", borderColor: "transparent",
                }}>P{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15 }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: "#8F8F8F" }}>{d.driver}</div>
                </div>
                <span className="font-display" style={{ fontSize: 22, color: d.color }}>{d.probability.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding: 24, marginTop: 16 }}>
        <div className="eyebrow">PROBABILITY TIMELINE</div>
        <div style={{ width: "100%", height: 280, marginTop: 16 }}>
          <ResponsiveContainer>
            <LineChart data={timeline}>
              <CartesianGrid stroke="rgba(15,16,18,0.06)" />
              <XAxis dataKey="lap" tick={{ fontSize: 11, fill: "#8F8F8F" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#8F8F8F" }} />
              <Tooltip contentStyle={{ background: "rgba(253,253,253,0.95)", border: "1px solid rgba(15,16,18,0.08)", borderRadius: 12, fontSize: 12 }} />
              {winProbability.map((d) => (
                <Line key={d.driver} type="monotone" dataKey={d.driver} stroke={d.color} strokeWidth={d.driver === leader.driver ? 2.5 : 1.5} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style>{`@media(max-width:768px){.prob-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}
