import { createFileRoute } from "@tanstack/react-router";
import { useGlobal } from "@/context/GlobalContext";
import { fanText, FAN_HEADERS } from "@/utils/fanText";

export const Route = createFileRoute("/_app/competitors")({
  head: () => ({ meta: [{ title: "Competitors — RaceIQ" }] }),
  component: CompetitorsPage,
});

function CompetitorsPage() {
  const { competitors, currentLap, fanMode } = useGlobal();

  return (
    <div style={{ padding: "32px 32px 80px" }}>
      <div className="eyebrow">{fanMode ? FAN_HEADERS.competitors : "COMPETITORS"}</div>
      <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-0.025em", marginTop: 4 }}>Rival intelligence</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginTop: 24 }} className="comp-grid">
        {competitors.map((c) => {
          const pitLap = currentLap + 3 + (c.position % 8);
          const tColor = c.threatLevel === "HIGH" ? "#E3001E" : c.threatLevel === "MEDIUM" ? "#F5A623" : "#00A651";
          return (
            <div key={c.name} className="glass" style={{ padding: 20, borderLeft: `2px solid ${c.teamColor}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="font-display pill" style={{ background: "#0F1012", color: "#FDFDFD", borderColor: "transparent" }}>P{c.position}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 400 }}>{c.name}</div>
                  <div style={{ fontSize: 13, color: "#8F8F8F" }}>{c.team}</div>
                </div>
                <span className="pill" style={{ background: tColor, color: "#FDFDFD", borderColor: "transparent", animation: c.threatLevel === "HIGH" ? "pulse-soft 2s ease-in-out infinite" : undefined }}>
                  {fanText(c.threatLevel + " THREAT", fanMode)}
                </span>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap", fontSize: 13 }}>
                <span className="pill">{c.compound}</span>
                <span className="font-display" style={{ color: "#8F8F8F" }}>{fanText("STINT", fanMode)} {c.stintAge}L</span>
                <span className="font-display" style={{ color: "#8F8F8F" }}>{fanText("GAP", fanMode)} {c.gap}</span>
              </div>
              <div className="glass-sm" style={{ marginTop: 12, padding: 10, background: "var(--bg-surface)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#8F8F8F" }}>{fanText("PIT WINDOW", fanMode)}</span>
                <span className="font-display" style={{ fontSize: 13 }}>LAP {pitLap}–{pitLap + 3}</span>
                <span className="pill" style={{ fontSize: 10 }}>{c.pitConfidence}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`@media(max-width:768px){.comp-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}
