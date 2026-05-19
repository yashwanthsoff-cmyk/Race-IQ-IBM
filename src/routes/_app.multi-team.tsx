import { createFileRoute } from "@tanstack/react-router";
import { TEAMS } from "@/utils/constants";
import { useEffect, useState } from "react";
import { callGemini } from "@/services/GeminiAPI";
import { useGlobal } from "@/context/GlobalContext";
import { fanText, FAN_HEADERS } from "@/utils/fanText";
import { Check } from "lucide-react";

export const Route = createFileRoute("/_app/multi-team")({
  head: () => ({ meta: [{ title: "Multi-Team — RaceIQ" }] }),
  component: MultiTeamPage,
});

function MultiTeamPage() {
  const { fanMode } = useGlobal();
  const [selected, setSelected] = useState<string[]>(["redbull", "ferrari"]);
  const [verdict, setVerdict] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      if (selected.length > 2) setSelected(selected.filter((x) => x !== id));
    } else if (selected.length < 4) setSelected([...selected, id]);
  };

  const teams = TEAMS.filter((t) => selected.includes(t.id));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await callGemini({
          systemPrompt: "F1 strategy analyst. Return ONLY valid JSON: {winner:string, verdict:string, rankings:[{team,score,reason}]}",
          userMessage: `Compare strategy efficiency of: ${teams.map((t) => t.name).join(", ")}.`,
          expectJSON: true,
        });
        if (!cancelled) setVerdict(data);
      } catch (e) { /* silent */ }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [selected.join(",")]);

  return (
    <div style={{ padding: "32px 32px 80px" }}>
      <div className="eyebrow">{fanMode ? FAN_HEADERS["multi-team"] : "MULTI-TEAM"}</div>
      <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-0.025em", marginTop: 4 }}>Compare constructors</h1>

      <div className="eyebrow" style={{ marginTop: 24 }}>SELECT 2–4 TEAMS</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginTop: 12 }} className="mt-grid">
        {TEAMS.map((t) => {
          const sel = selected.includes(t.id);
          return (
            <button key={t.id} onClick={() => toggle(t.id)} className="glass" style={{
              padding: 12, textAlign: "left", position: "relative", cursor: "pointer", fontSize: 13,
              boxShadow: sel ? `0 0 0 1.5px ${t.color}, inset 0 1px 0 rgba(255,255,255,0.6)` : undefined,
            }}>
              {sel && <span style={{ position: "absolute", top: 6, right: 6, width: 16, height: 16, borderRadius: "50%", background: t.color, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Check size={10} color="#FDFDFD" /></span>}
              <div style={{ color: t.color, fontWeight: 400 }}>{t.name}</div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${teams.length}, 1fr)`, gap: 12, marginTop: 24 }} className="mt-results">
        {teams.map((t) => {
          const score = 60 + (t.standing * 4 % 35);
          return (
            <div key={t.id} className="glass" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ background: t.color, padding: "12px 16px", color: "#FDFDFD", fontSize: 15, fontWeight: 400 }}>{t.name}</div>
              <div style={{ padding: 20 }}>
                <div className="eyebrow">PIT AVG / FASTEST / ACC</div>
                <div className="font-display" style={{ marginTop: 8, fontSize: 14 }}>
                  {(2.3 + t.standing * 0.05).toFixed(2)}s · {(2.1 + t.standing * 0.03).toFixed(2)}s · {95 - t.standing}%
                </div>
                <div className="eyebrow" style={{ marginTop: 16 }}>EFFICIENCY</div>
                <div className="font-display" style={{
                  fontSize: 36, marginTop: 4,
                  color: score > 80 ? "#00A651" : score >= 60 ? "#F5A623" : "#E3001E",
                }}>{score}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass" style={{ padding: 24, marginTop: 16, boxShadow: "0 0 0 1px rgba(0,166,81,0.3), inset 0 1px 0 rgba(255,255,255,0.6)" }}>
        <div className="eyebrow">AI VERDICT</div>
        {loading && <div className="shimmer" style={{ height: 60, marginTop: 12 }} />}
        {verdict && (
          <>
            <div style={{ fontSize: 17, marginTop: 12 }}>🏆 <strong style={{ color: TEAMS.find((t) => verdict.winner?.includes(t.name))?.color }}>{verdict.winner}</strong></div>
            <p style={{ fontSize: 15, marginTop: 8, color: "#0F1012" }}>{verdict.verdict}</p>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
              {(verdict.rankings || []).map((r: any, i: number) => (
                <div key={i} style={{ fontSize: 13, color: "#8F8F8F" }}>{i + 1}. {r.team} — {r.reason}</div>
              ))}
            </div>
          </>
        )}
        {!loading && !verdict && <p style={{ fontSize: 14, color: "#8F8F8F", marginTop: 12 }}>Configure your Gemini API key to enable AI verdict.</p>}
      </div>

      <style>{`@media(max-width:768px){.mt-grid{grid-template-columns:repeat(2,1fr) !important;}.mt-results{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}
