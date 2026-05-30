import { createFileRoute } from "@tanstack/react-router";
import { useGlobal } from "@/context/GlobalContext";
import { useEffect, useRef, useState } from "react";
import { callStrategy, callCopilot } from "@/services/LambdaAPI";
import { toast } from "sonner";
import { QUICK_PROMPTS, TOTAL_LAPS } from "@/utils/constants";
import { fanText, FAN_HEADERS } from "@/utils/fanText";
import { Send, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_app/strategy")({
  head: () => ({ meta: [{ title: "AI Strategy — RaceIQ" }] }),
  component: StrategyPage,
});

function StrategyPage() {
  const { currentLap, telemetry, addDecision, fanMode, chatHistory, addChat, clearChat } = useGlobal();
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<any | null>(null);
  const [override, setOverride] = useState<any>({
    lap: currentLap, position: 3, tireAge: 12, gap: 2.3, rain: 15, compound: telemetry.compound,
  });
  const [showOverride, setShowOverride] = useState(false);
  const tireAge = 12;
  const gap = 2.3;
  const gapBehind = 1.8;
  const rain = 15;
  const trackTemp = 38;

  const getStrategy = async () => {
    setLoading(true); setStrategy(null);
    try {
      const data = await callStrategy({
        lap: override.lap,
        totalLaps: TOTAL_LAPS,
        tireAge: override.tireAge,
        tireName: override.compound,
        position: override.position,
        gapBehind: String(gapBehind),
        rainChance: String(override.rain),
      });
      setStrategy({
        decision: data.decision || data.recommendation || data.recommended_action || 'STAY OUT',
        confidence: data.confidence_score || data.confidence || 75,
        urgency: data.urgency || data.risk_level || 'MEDIUM',
        reasons: data.reasons
          ? (Array.isArray(data.reasons) ? data.reasons : [data.reasons])
          : data.three_reasons || [data.reasoning || data.plain_english || 'Analyze telemetry'],
        pitWindow: data.pit_window || data.pitWindow || {
          earliest: data.pit_window_start || override.lap + 2,
          latest: data.pit_window_end || override.lap + 5
        },
        riskLevel: data.risk_level || data.riskLevel || 'MEDIUM',
        tireSuggestion: data.tire_suggestion || override.compound,
      });
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };

  const save = () => {
    if (!strategy) return;
    addDecision({
      id: `dec-${Date.now()}`, lap: override.lap,
      decision: strategy.decision, confidence: strategy.confidence,
      urgency: strategy.urgency, reasons: strategy.reasons,
      pitWindow: strategy.pitWindow, riskLevel: strategy.riskLevel,
      timestamp: Date.now(), outcome: "UNKNOWN",
      data: { ...override, tireAge, gap, rain, trackTemp, fuel: telemetry.fuelKg },
    });
    toast.success("Saved to decision history");
  };

  const decisionColor = strategy?.decision?.includes("PIT") ? "#E3001E" : strategy?.decision?.includes("STAY") ? "#00A651" : "#F5A623";
  const urgencyColor = strategy?.urgency === "CRITICAL" || strategy?.urgency === "HIGH" ? "#E3001E" : strategy?.urgency === "MEDIUM" ? "#F5A623" : "#00A651";

  return (
    <div style={{ padding: "32px 32px 80px" }}>
      <div className="eyebrow">{fanMode ? FAN_HEADERS.strategy : "AI STRATEGY"}</div>
      <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-0.025em", marginTop: 4 }}>Decision engine</h1>

      <div className="glass" style={{ padding: 20, marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { l: "LAP", v: `${currentLap}/${TOTAL_LAPS}` },
          { l: "POSITION", v: `P${override.position}` },
          { l: fanText("TIRE AGE", fanMode), v: `${tireAge} LAPS` },
          { l: fanText("GAP", fanMode), v: `+${gap.toFixed(1)}s` },
        ].map((c) => (
          <div key={c.l} style={{ padding: "10px 14px", background: "#F2F2F4", borderRadius: 12, minWidth: 100 }}>
            <div className="eyebrow">{c.l}</div>
            <div className="font-display" style={{ fontSize: 17, marginTop: 2 }}>{c.v}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="btn-ghost" style={{ padding: "10px 18px", fontSize: 13 }} onClick={() => setShowOverride(!showOverride)}>
          {showOverride ? "Hide" : "Show"} manual override
        </button>
        {showOverride && (
          <div className="glass" style={{ padding: 20, marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {(["lap", "position", "tireAge", "gap", "rain"] as const).map((k) => (
              <div key={k}>
                <div className="eyebrow">{k}</div>
                <input className="input-base" type="number" value={override[k]}
                  onChange={(e) => setOverride({ ...override, [k]: +e.target.value })} />
              </div>
            ))}
            <div>
              <div className="eyebrow">Compound</div>
              <select className="input-base" value={override.compound}
                onChange={(e) => setOverride({ ...override, compound: e.target.value })}>
                <option>SOFT</option><option>MEDIUM</option><option>HARD</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <button onClick={getStrategy} disabled={loading} className="btn-accent" style={{ marginTop: 16, width: "100%", fontSize: 17 }}>
        {loading ? "Analysing Race Data..." : "Get AI Strategy"}
      </button>

      {loading && (
        <div className="glass" style={{ padding: 24, marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="shimmer" style={{ height: 32, width: 160 }} />
          <div className="shimmer" style={{ height: 18 }} />
          <div className="shimmer" style={{ height: 18, width: "80%" }} />
          <div className="shimmer" style={{ height: 18, width: "60%" }} />
        </div>
      )}

      {strategy && (
        <div className="glass" style={{ padding: 28, marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span className="font-display" style={{
              padding: "10px 22px", borderRadius: 40, background: decisionColor, color: "#FDFDFD",
              fontSize: 15, letterSpacing: "0.06em",
            }}>{strategy.decision}</span>
            <span className="pill" style={{ background: urgencyColor, color: "#FDFDFD", borderColor: "transparent" }}>{strategy.urgency}</span>
            <span className="pill">RISK · {strategy.riskLevel}</span>
            {strategy.tireSuggestion && (
              <span className="pill" style={{ background: "#0071E3", color: "#FDFDFD", borderColor: "transparent" }}>
                → {strategy.tireSuggestion}
              </span>
            )}
            <span style={{ marginLeft: "auto", fontSize: 13, color: "#8F8F8F" }}>Confidence</span>
            <span className="font-display" style={{ fontSize: 18 }}>{strategy.confidence}%</span>
          </div>
          <div style={{ height: 6, background: "#F2F2F4", borderRadius: 3, marginTop: 12 }}>
            <div style={{ width: `${strategy.confidence}%`, height: "100%", background: decisionColor, borderRadius: 3, transition: "width 0.6s var(--ease-out)" }} />
          </div>
          <ul style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            {strategy.reasons?.map((r: string, i: number) => (
              <li key={i} style={{ borderLeft: "2px solid rgba(15,16,18,0.15)", paddingLeft: 16, fontSize: 17, lineHeight: 1.5 }}>{r}</li>
            ))}
          </ul>
          <div className="glass-sm" style={{
            marginTop: 20, padding: 16, background: "rgba(0,113,227,0.06)", border: "1px solid #0071E3",
            borderRadius: 16, display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span className="eyebrow" style={{ color: "#0071E3" }}>PIT WINDOW</span>
            <span className="font-display" style={{ fontSize: 13, color: "#0071E3" }}>
              LAP {strategy.pitWindow?.earliest}–{strategy.pitWindow?.latest}
            </span>
          </div>
          <button onClick={save} className="btn-ghost" style={{ marginTop: 16, fontSize: 13, padding: "10px 18px" }}>
            Save to Decision History
          </button>
        </div>
      )}

      {strategy?.pitWindow && (
        <div className="glass" style={{ padding: 24, marginTop: 16 }}>
          <div className="eyebrow">STRATEGY TIMELINE</div>
          <div style={{ position: "relative", height: 32, marginTop: 24, background: "#F2F2F4", borderRadius: 4 }}>
            <div style={{
              position: "absolute", top: 0, bottom: 0,
              left: `${(strategy.pitWindow.earliest / TOTAL_LAPS) * 100}%`,
              width: `${((strategy.pitWindow.latest - strategy.pitWindow.earliest) / TOTAL_LAPS) * 100}%`,
              background: "#00A651", borderRadius: 4,
            }} />
            <div style={{ position: "absolute", top: -4, bottom: -4, left: `${(currentLap / TOTAL_LAPS) * 100}%`, width: 2, background: "#E3001E" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "#8F8F8F" }}>
            <span>LAP 1</span><span>LAP {TOTAL_LAPS}</span>
          </div>
        </div>
      )}

      <Copilot />
    </div>
  );
}

function Copilot() {
  const { currentLap, telemetry, fanMode, chatHistory, addChat, clearChat } = useGlobal();
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://xff7vmjz3h.execute-api.eu-north-1.amazonaws.com";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chatHistory, typing]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || typing) return;
    addChat({ role: "user", content: msg, id: `u-${Date.now()}` });
    setInput("");
    setTyping(true);
    try {
      const [telemetryData, strategyData, lapsData, rivalData] = await Promise.all([
        fetch(`${API_BASE}/telemetry`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/strategy`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/laps`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/rival`).then(r => r.json()).catch(() => ({})),
      ]);

      const context = `
LIVE RACE TELEMETRY:
- Speed: ${telemetryData.speed || 0} km/h
- Throttle: ${telemetryData.throttle || 0}%
- Brake: ${telemetryData.brake || 0}%
- Gear: ${telemetryData.gear || 0}
- Tire: ${telemetryData.tire_compound || telemetry.compound || "UNKNOWN"} aged ${telemetryData.stint_age || 0} laps

LIVE STRATEGY:
- Recommendation: ${strategyData.recommendation || strategyData.decision || "STAY"}
- Confidence: ${strategyData.confidence || 0}%
- Reasoning: ${strategyData.reasoning || strategyData.reasons?.[0] || "N/A"}
- Pit Window: Laps ${strategyData.pit_window_start || strategyData.pitWindow?.earliest || "?"} - ${strategyData.pit_window_end || strategyData.pitWindow?.latest || "?"}
- Urgency: ${strategyData.urgency || "LOW"}
- Suggested Tire: ${strategyData.tire_suggestion || "UNKNOWN"}

LAP DATA:
- Current Lap: ${lapsData.lap_number || currentLap || "?"}
- Lap Time: ${lapsData.lap_duration || "?"}s
- Sector 1: ${lapsData.sector_1 || "?"}s
- Sector 2: ${lapsData.sector_2 || "?"}s
- Gap to Leader: ${lapsData.gap_to_leader || 0}s

RIVAL PREDICTION (Driver #16):
- Pit Window: Laps ${rivalData.pit_window_start_lap || "?"} - ${rivalData.pit_window_end_lap || "?"}
- Strategy: ${rivalData.strategy || "Unknown"}
- Confidence: ${rivalData.confidence || 0}%
      `.trim();

      const result = await callCopilot({
        question: msg,
        context,
        lap: currentLap,
        position: 3,
        tireAge: 12,
        tireName: telemetry.compound,
        gapBehind: "1.8",
        rainChance: "15",
        driver: "Our Driver",
        circuit: "Current Circuit",
      });

      const reply = result.direct_answer
        ? [
            `🏎️ ${result.direct_answer}`,
            result.tactical_reasoning ? `\n\n📋 Tactical Reasoning:\n${result.tactical_reasoning}` : "",
            result.recommended_action ? `\n\n🎯 Recommended Action:\n${result.recommended_action}` : "",
            result.risk_assessment?.level ? `\n\n⚠️ Risk: ${result.risk_assessment.level} — ${result.risk_assessment.main_risk || ""}` : "",
            result.undercut_threat ? `\n\n🔄 Undercut Threat: ${result.undercut_threat}` : "",
            result.radio_message ? `\n\n📻 Radio: "${result.radio_message}"` : "",
            result.confidence ? `\n\n✅ Confidence: ${result.confidence}%` : "",
          ].filter(Boolean).join("")
        : result.answer || "Strategy analysis complete.";

      addChat({
        role: "assistant",
        content: reply,
        id: `a-${Date.now()}`,
      });

    } catch (e: any) {
      toast.error(e.message);
      addChat({
        role: "assistant",
        content: "⚠️ Connection error. Check your AWS backend.",
        id: `a-${Date.now()}`,
      });
    }
    setTyping(false);
  };

  const initial = chatHistory.length === 0;

  return (
    <div style={{ marginTop: 40 }}>
      <div className="eyebrow">AI RACE COPILOT</div>
      <div style={{
        marginTop: 8, padding: "6px 14px", background: "rgba(0,166,81,0.1)",
        border: "1px solid #00A651", borderRadius: 20, display: "inline-flex",
        alignItems: "center", gap: 6, fontSize: 12, color: "#00A651"
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00A651", display: "inline-block" }} />
        LIVE TELEMETRY CONNECTED · GROQ llama-3.3-70b
      </div>
      <div className="glass" style={{ marginTop: 12, padding: 0, overflow: "hidden" }}>
        <div ref={scrollRef} style={{ height: 460, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          {initial && (
            <div style={{
              background: "#F2F2F4", padding: 20, borderRadius: 20, borderTopLeftRadius: 4,
              fontSize: 15, color: "#0F1012", borderLeft: "3px solid #0071E3",
              alignSelf: "flex-start", maxWidth: "85%"
            }}>
              <div style={{ fontSize: 11, color: "#0071E3", fontWeight: 600, marginBottom: 8, letterSpacing: "0.06em" }}>
                🤖 RACEIQ COPILOT — ONLINE
              </div>
              <div>Race Copilot online. I have full live telemetry access including speed, tire compound, lap times, gap to leader, and rival predictions.</div>
              <div style={{ marginTop: 8, fontSize: 13, color: "#8F8F8F" }}>
                Ask me anything: pit strategy, tire management, rival threats, race pace, undercut windows.
              </div>
            </div>
          )}
          {chatHistory.map((m) => (
            <div key={m.id} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              background: m.role === "user" ? "#0F1012" : "#F2F2F4",
              color: m.role === "user" ? "#FDFDFD" : "#0F1012",
              borderRadius: m.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
              padding: "14px 18px", fontSize: 15, lineHeight: 1.6,
              borderLeft: m.role === "assistant" ? "3px solid #0071E3" : undefined,
              whiteSpace: "pre-wrap",
            }}>
              {m.role === "assistant" && (
                <div style={{ fontSize: 11, color: "#0071E3", fontWeight: 600, marginBottom: 8, letterSpacing: "0.06em" }}>
                  🤖 RACEIQ COPILOT
                </div>
              )}
              {fanText(m.content, fanMode)}
            </div>
          ))}
          {typing && (
            <div style={{
              alignSelf: "flex-start", background: "#F2F2F4",
              padding: "14px 18px", borderRadius: "20px 20px 20px 4px",
              borderLeft: "3px solid #0071E3", display: "flex", flexDirection: "column", gap: 8
            }}>
              <div style={{ fontSize: 11, color: "#0071E3", fontWeight: 600, letterSpacing: "0.06em" }}>
                🤖 RACEIQ COPILOT — ANALYSING
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{
                    width: 6, height: 6, borderRadius: "50%", background: "#0071E3",
                    animation: `pulse-soft 1.2s ${i * 0.2}s infinite`
                  }} />
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ borderTop: "1px solid rgba(15,16,18,0.08)", padding: 16 }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 12 }} className="no-scrollbar">
            {QUICK_PROMPTS.map((p) => (
              <button key={p} onClick={() => send(p)} style={{
                padding: "8px 14px", fontSize: 13, whiteSpace: "nowrap",
                border: "1px solid rgba(15,16,18,0.08)", borderRadius: 40, background: "transparent",
                cursor: "pointer",
              }}>{fanText(p, fanMode)}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input-base"
              placeholder="Ask your race engineer AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
            />
            <button className="btn-primary" onClick={() => send()} style={{ padding: "12px 18px" }}>
              <Send size={14} />
            </button>
            <button className="btn-ghost" onClick={clearChat} style={{ padding: "12px 14px" }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}