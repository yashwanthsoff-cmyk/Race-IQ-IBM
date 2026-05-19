import { createFileRoute } from "@tanstack/react-router";
import { useGlobal } from "@/context/GlobalContext";
import { useState } from "react";
import { fanText, FAN_HEADERS } from "@/utils/fanText";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_app/learning")({
  head: () => ({ meta: [{ title: "Post-Race Learning — RaceIQ" }] }),
  component: LearningPage,
});

const CATS = ["TIRE", "WEATHER", "RIVAL", "FUEL", "SAFETY_CAR"] as const;
const CAT_COLOR: Record<string, string> = { TIRE: "#F5A623", WEATHER: "#0071E3", RIVAL: "#E3001E", FUEL: "#F5A623", SAFETY_CAR: "#8F8F8F" };

function LearningPage() {
  const { decisionHistory, learnedRules, addRule, toggleRule, deleteRule, fanMode } = useGlobal();
  const [text, setText] = useState("");
  const [cat, setCat] = useState<string>("TIRE");

  const validated = decisionHistory.filter((d) => d.outcome === "CORRECT" || d.outcome === "INCORRECT");
  const correct = validated.filter((d) => d.outcome === "CORRECT").length;
  const accuracy = validated.length ? (correct / validated.length) * 100 : 0;

  const exportRules = () => {
    const blob = new Blob([JSON.stringify(learnedRules, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "raceiq-rules.json"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "32px 32px 80px" }}>
      <div className="eyebrow">{fanMode ? FAN_HEADERS.learning : "POST-RACE LEARNING"}</div>
      <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-0.025em", marginTop: 4 }}>Rules library & accuracy</h1>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginTop: 24 }} className="learn-grid">
        <div className="glass" style={{ padding: 24 }}>
          <div className="eyebrow">STRATEGY RULES LIBRARY</div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <input className="input-base" placeholder="Add a custom rule..." value={text} onChange={(e) => setText(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
            <select className="input-base" value={cat} onChange={(e) => setCat(e.target.value)} style={{ maxWidth: 160 }}>
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
            <button className="btn-primary" onClick={() => {
              if (!text.trim()) return;
              addRule({ id: `r-${Date.now()}`, text, category: cat, source: "CUSTOM", active: true });
              setText("");
            }}>Add Rule</button>
          </div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {learnedRules.map((r) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, background: "var(--bg-surface)", borderRadius: 12 }}>
                <span className="pill" style={{ background: CAT_COLOR[r.category], color: "#FDFDFD", borderColor: "transparent" }}>{r.category}</span>
                <span style={{ flex: 1, fontSize: 15, opacity: r.active ? 1 : 0.5 }}>{r.text}</span>
                <span className="font-display eyebrow">{r.source}</span>
                <button onClick={() => toggleRule(r.id)} className="pill" style={{ background: r.active ? "#00A651" : "var(--bg-surface)", color: r.active ? "#FDFDFD" : "#0F1012", borderColor: "transparent", cursor: "pointer" }}>
                  {r.active ? "ON" : "OFF"}
                </button>
                <button onClick={() => deleteRule(r.id)} className="btn-ghost" style={{ padding: 8 }}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="glass" style={{ padding: 24, textAlign: "center" }}>
            <div className="eyebrow">AI ACCURACY THIS SESSION</div>
            <div className="font-display" style={{
              fontSize: 72, fontWeight: 400, marginTop: 8,
              color: accuracy > 70 ? "#00A651" : accuracy >= 50 ? "#F5A623" : "#E3001E",
            }}>{accuracy.toFixed(0)}%</div>
            <div style={{ fontSize: 13, color: "#8F8F8F", marginTop: 8 }}>
              Based on {validated.length} validated decision{validated.length === 1 ? "" : "s"}
            </div>
            <button className="btn-ghost" style={{ marginTop: 16 }} onClick={exportRules}>Export Rules</button>
          </div>
          <div className="glass" style={{ padding: 24, marginTop: 16 }}>
            <div className="eyebrow">DECISION TIMELINE</div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
              {decisionHistory.length === 0 && <div style={{ color: "#8F8F8F", fontSize: 13 }}>No decisions yet.</div>}
              {decisionHistory.map((d) => {
                const c = d.outcome === "CORRECT" ? "#00A651" : d.outcome === "INCORRECT" ? "#E3001E" : "#F2F2F4";
                return (
                  <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, border: "1px solid rgba(15,16,18,0.2)" }} />
                    <span className="font-display">L{d.lap}</span>
                    <span style={{ flex: 1 }}>{d.decision}</span>
                    <span style={{ color: "#8F8F8F" }}>{d.outcome ?? "UNKNOWN"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:768px){.learn-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}
