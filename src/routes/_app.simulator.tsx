import { createFileRoute } from "@tanstack/react-router";
import { useGlobal } from "@/context/GlobalContext";
import { useState } from "react";
import { callGemini } from "@/services/GeminiAPI";
import { toast } from "sonner";
import { fanText, FAN_HEADERS } from "@/utils/fanText";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/_app/simulator")({
  head: () => ({ meta: [{ title: "Simulator — RaceIQ" }] }),
  component: SimulatorPage,
});

type Scenario = { lap: number; tireAge: number; gapAhead: number; gapBehind: number; rain: number; tire: string; rival: string; safety: string };
const defScenario = (): Scenario => ({ lap: 34, tireAge: 12, gapAhead: 2.3, gapBehind: 1.8, rain: 15, tire: "MEDIUM", rival: "same lap", safety: "Low" });

function SimulatorPage() {
  const { fanMode } = useGlobal();
  const [scenarios, setScenarios] = useState<Scenario[]>([defScenario()]);
  const [active, setActive] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const updateScenario = (i: number, k: keyof Scenario, v: any) =>
    setScenarios(scenarios.map((s, idx) => idx === i ? { ...s, [k]: v } : s));

  const run = async () => {
    setLoading(true); setResults([]);
    try {
      const all = await Promise.all(scenarios.map((s) => callGemini({
        systemPrompt: "F1 race simulation expert. Return ONLY valid JSON: {predictedPosition:1-10, timeGainedLost:string, riskLevel:'LOW'|'MEDIUM'|'HIGH', recommendation:boolean, reasoning:string, pitLap:number}",
        userMessage: `Lap ${s.lap}, ${s.tire} age ${s.tireAge} laps, gap ahead +${s.gapAhead}s, gap behind -${s.gapBehind}s, rain ${s.rain}%. Rival: ${s.rival}. Safety car: ${s.safety}.`,
        expectJSON: true,
      })));
      setResults(all);
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };

  const s = scenarios[active];
  const fields: Array<[string, keyof Scenario, number, number]> = [
    ["Current Lap", "lap", 1, 57],
    ["Tire Age", "tireAge", 0, 40],
    ["Gap Ahead", "gapAhead", 0, 20],
    ["Gap Behind", "gapBehind", 0, 20],
    ["Rain Probability", "rain", 0, 100],
  ];

  return (
    <div style={{ padding: "32px 32px 80px" }}>
      <div className="eyebrow">{fanMode ? FAN_HEADERS.simulator : "SIMULATOR"}</div>
      <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-0.025em", marginTop: 4 }}>What-if scenarios</h1>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: 16, marginTop: 24 }} className="sim-grid">
        <div className="glass" style={{ padding: 24 }}>
          <div className="eyebrow">BUILD YOUR SCENARIO</div>
          <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
            {scenarios.map((_, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center" }}>
                <button onClick={() => setActive(i)} style={{
                  padding: "6px 12px", borderRadius: 40, fontSize: 12,
                  background: active === i ? "#0F1012" : "var(--bg-surface)",
                  color: active === i ? "#FDFDFD" : "#0F1012", border: "none",
                }}>SC {i + 1}</button>
                {scenarios.length > 1 && (
                  <button onClick={() => { setScenarios(scenarios.filter((_, j) => j !== i)); setActive(0); }}
                    style={{ marginLeft: 2, padding: 4, background: "transparent", border: "none" }}><X size={12} /></button>
                )}
              </span>
            ))}
            {scenarios.length < 4 && (
              <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => { setScenarios([...scenarios, defScenario()]); setActive(scenarios.length); }}>
                <Plus size={12} /> Add
              </button>
            )}
          </div>

          {fields.map(([label, k, min, max]) => (
            <div key={k} style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="eyebrow">{label}</span>
                <span className="font-display" style={{ fontSize: 13 }}>{s[k]}</span>
              </div>
              <input type="range" min={min} max={max} value={s[k] as number}
                onChange={(e) => updateScenario(active, k, +e.target.value)}
                style={{ width: "100%", marginTop: 6, accentColor: "#0F1012" }} />
            </div>
          ))}

          <select className="input-base" style={{ marginTop: 12 }} value={s.tire} onChange={(e) => updateScenario(active, "tire", e.target.value)}>
            <option>SOFT</option><option>MEDIUM</option><option>HARD</option>
          </select>
          <select className="input-base" style={{ marginTop: 8 }} value={s.rival} onChange={(e) => updateScenario(active, "rival", e.target.value)}>
            <option>pit before me</option><option>same lap</option><option>pit after me</option><option>unknown</option>
          </select>
          <select className="input-base" style={{ marginTop: 8 }} value={s.safety} onChange={(e) => updateScenario(active, "safety", e.target.value)}>
            <option>Low</option><option>Medium</option><option>High</option>
          </select>

          <button onClick={run} disabled={loading} className="btn-primary" style={{ marginTop: 16, width: "100%", background: "#0071E3" }}>
            {loading ? "Simulating..." : "Run Simulation"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="results-grid">
          {loading && Array.from({ length: scenarios.length }).map((_, i) => (
            <div key={i} className="glass" style={{ padding: 20 }}>
              <div className="shimmer" style={{ height: 24, width: 120 }} />
              <div className="shimmer" style={{ height: 40, marginTop: 16 }} />
              <div className="shimmer" style={{ height: 14, marginTop: 12 }} />
            </div>
          ))}
          {results.map((r, i) => (
            <div key={i} className="glass" style={{ padding: 20, boxShadow: r.recommendation ? "0 0 0 1.5px #00A651, inset 0 1px 0 rgba(255,255,255,0.6)" : undefined }}>
              <div className="eyebrow">SCENARIO {i + 1}</div>
              <div className="font-display" style={{ fontSize: 36, marginTop: 8 }}>P{r.predictedPosition}</div>
              <div className="font-display" style={{ fontSize: 20, color: String(r.timeGainedLost).startsWith("-") ? "#E3001E" : "#00A651", marginTop: 4 }}>
                {r.timeGainedLost}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                <span className="pill" style={{ background: r.riskLevel === "HIGH" ? "#E3001E" : r.riskLevel === "MEDIUM" ? "#F5A623" : "#00A651", color: "#FDFDFD", borderColor: "transparent" }}>{r.riskLevel}</span>
                {r.recommendation && <span className="pill" style={{ background: "#00A651", color: "#FDFDFD", borderColor: "transparent" }}>RECOMMENDED</span>}
                <span className="pill">PIT LAP {r.pitLap}</span>
              </div>
              <p style={{ fontSize: 14, color: "#8F8F8F", marginTop: 12, lineHeight: 1.5 }}>{r.reasoning}</p>
            </div>
          ))}
          {!loading && results.length === 0 && (
            <div className="glass" style={{ padding: 32, gridColumn: "1 / -1", textAlign: "center", color: "#8F8F8F", fontSize: 15 }}>
              Build scenarios on the left and run simulation to see AI predictions.
            </div>
          )}
        </div>
      </div>

      <style>{`@media(max-width:768px){.sim-grid,.results-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}
