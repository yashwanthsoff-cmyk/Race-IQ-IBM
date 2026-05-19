import { createFileRoute, Link } from "@tanstack/react-router";
import { useGlobal } from "@/context/GlobalContext";
import { useState } from "react";
import { callGemini } from "@/services/GeminiAPI";
import { toast } from "sonner";
import { fanText, FAN_HEADERS } from "@/utils/fanText";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/_app/explain")({
  head: () => ({ meta: [{ title: "Explainable AI — RaceIQ" }] }),
  component: ExplainPage,
});

function ExplainPage() {
  const { decisionHistory, updateDecisionOutcome, updateDecisionExplanation, fanMode } = useGlobal();
  const [openId, setOpenId] = useState<string | null>(decisionHistory[0]?.id ?? null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const explain = async (id: string, data: any) => {
    setLoadingId(id);
    try {
      const txt = await callGemini({
        systemPrompt: "Explainable AI for F1 strategy. Explain decision: 1) Primary trigger 2) Supporting evidence (2-3 data points) 3) Risk assessment 4) Alternative considered and why rejected. Under 150 words.",
        userMessage: `Decision: ${data.decision}. Race state: ${JSON.stringify(data.data)}.`,
      });
      updateDecisionExplanation(id, txt);
    } catch (e: any) { toast.error(e.message); }
    setLoadingId(null);
  };

  return (
    <div style={{ padding: "32px 32px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div>
          <div className="eyebrow">{fanMode ? FAN_HEADERS.explain : "EXPLAINABLE AI"}</div>
          <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-0.025em", marginTop: 4 }}>Why each decision was made</h1>
        </div>
        <span className="pill" style={{ marginLeft: "auto", background: "#0F1012", color: "#FDFDFD", borderColor: "transparent" }}>
          POWERED BY IBM WATSONX GRANITE
        </span>
      </div>

      {decisionHistory.length === 0 ? (
        <div className="glass" style={{ padding: 40, marginTop: 24, textAlign: "center" }}>
          <p style={{ color: "#8F8F8F", fontSize: 15 }}>No decisions yet. Generate one from the AI Strategy page.</p>
          <Link to="/strategy" className="btn-ghost" style={{ marginTop: 16, display: "inline-flex" }}>Get AI Strategy</Link>
        </div>
      ) : (
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          {decisionHistory.map((d) => {
            const open = openId === d.id;
            const c = d.decision === "PIT NOW" ? "#E3001E" : d.decision === "STAY OUT" ? "#00A651" : "#F5A623";
            return (
              <div key={d.id} className="glass" style={{ padding: 20 }}>
                <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: "transparent", border: "none" }} onClick={() => setOpenId(open ? null : d.id)}>
                  <span className="pill" style={{ background: c, color: "#FDFDFD", borderColor: "transparent" }}>{d.decision}</span>
                  <span className="font-display" style={{ fontSize: 13 }}>LAP {d.lap}</span>
                  <span style={{ marginLeft: "auto", fontSize: 13, color: "#8F8F8F" }}>{d.confidence}% confidence</span>
                  <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s var(--ease-out)" }} />
                </button>
                {open && (
                  <div style={{ marginTop: 16 }}>
                    <div className="eyebrow">DATA USED</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                      {Object.entries(d.data || {}).map(([k, v]) => (
                        <span key={k} className="pill">{k.toUpperCase()} · {String(v)}</span>
                      ))}
                    </div>
                    <div className="eyebrow" style={{ marginTop: 16 }}>AI REASONING</div>
                    {d.explanation ? (
                      <p style={{ fontSize: 15, marginTop: 8, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{d.explanation}</p>
                    ) : (
                      <button className="btn-ghost" style={{ marginTop: 8, padding: "8px 16px", fontSize: 13 }} onClick={() => explain(d.id, d)} disabled={loadingId === d.id}>
                        {loadingId === d.id ? "Generating..." : "Generate Explanation"}
                      </button>
                    )}
                    <div className="eyebrow" style={{ marginTop: 16 }}>OUTCOME</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      {(["CORRECT", "INCORRECT", "UNKNOWN"] as const).map((o) => (
                        <button key={o} className="pill" onClick={() => updateDecisionOutcome(d.id, o)} style={{
                          background: d.outcome === o ? (o === "CORRECT" ? "#00A651" : o === "INCORRECT" ? "#E3001E" : "var(--bg-surface)") : "var(--bg-surface)",
                          color: d.outcome === o && o !== "UNKNOWN" ? "#FDFDFD" : "#0F1012",
                          borderColor: d.outcome === o ? "transparent" : undefined, cursor: "pointer",
                        }}>{o}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
