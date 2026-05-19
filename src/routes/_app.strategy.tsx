import { createFileRoute } from "@tanstack/react-router";
import { useGlobal } from "@/context/GlobalContext";
import { useEffect, useRef, useState } from "react";
import { callGemini, GEMINI_MODELS } from "@/services/GeminiAPI";
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
  const [position] = useState(3);
  const tireAge = 12;
  const gap = 2.3;
  const gapBehind = 1.8;
  const rain = 15;
  const trackTemp = 38;

  const getStrategy = async () => {
    setLoading(true); setStrategy(null);
    try {
      const data = await callGemini({
        systemPrompt: "You are an expert Formula 1 race strategist with 20 years experience. Return ONLY valid JSON. No markdown. No backticks. JSON schema: {decision:'PIT NOW'|'STAY OUT'|'PREPARE TO PIT', confidence:0-100, urgency:'CRITICAL'|'HIGH'|'MEDIUM'|'LOW', reasons:[3 strings], pitWindow:{earliest:number,latest:number}, riskLevel:'LOW'|'MEDIUM'|'HIGH'}" + (fanMode ? " Respond in fun, simple, enthusiastic language. No jargon." : ""),
        userMessage: `Race data: Lap ${override.lap}/${TOTAL_LAPS}, P${override.position}, ${override.compound}, tire age ${override.tireAge} laps, gap ahead +${override.gap}s, gap behind -${gapBehind}s, rain ${override.rain}%, track ${trackTemp}°C, fuel ${telemetry.fuelKg.toFixed(1)}kg.`,
        expectJSON: true, temperature: 0.5,
      });
      setStrategy(data);
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

  const decisionColor = strategy?.decision === "PIT NOW" ? "#E3001E" : strategy?.decision === "STAY OUT" ? "#00A651" : "#F5A623";
  const urgencyColor = strategy?.urgency === "CRITICAL" || strategy?.urgency === "HIGH" ? "#E3001E" : strategy?.urgency === "MEDIUM" ? "#F5A623" : "#00A651";

  return (
    <div style={{ padding: "32px 32px 80px" }}>
      <div className="eyebrow">{fanMode ? FAN_HEADERS.strategy : "AI STRATEGY"}</div>
      <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-0.025em", marginTop: 4 }}>Decision engine</h1>

      {/* Situation chips */}
      <div className="glass" style={{ padding: 20, marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { l: "LAP", v: `${currentLap}/${TOTAL_LAPS}` },
          { l: "POSITION", v: `P${position}` },
          { l: fanText("TIRE AGE", fanMode), v: `${tireAge} LAPS` },
          { l: fanText("GAP", fanMode), v: `+${gap.toFixed(1)}s` },
        ].map((c) => (
          <div key={c.l} style={{ padding: "10px 14px", background: "#F2F2F4", borderRadius: 12, minWidth: 100 }}>
            <div className="eyebrow">{c.l}</div>
            <div className="font-display" style={{ fontSize: 17, marginTop: 2 }}>{c.v}</div>
          </div>
        ))}
      </div>

      {/* Manual override */}
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

      {/* Timeline */}
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

      {/* Copilot */}
      <Copilot />
    </div>
  );
}

function Copilot() {
  const { currentLap, telemetry, fanMode, chatHistory, addChat, clearChat } = useGlobal();
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chatHistory, typing]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || typing) return;
    addChat({ role: "user", content: msg, id: `u-${Date.now()}` });
    setInput(""); setTyping(true);
    try {
      const sys = `Expert F1 race engineer AI. Race data: Lap ${currentLap}/${TOTAL_LAPS}, P3, ${telemetry.compound} age 12 laps, gap +2.3s, fuel ${telemetry.fuelKg.toFixed(1)}kg, rain 15%. Answer concisely under 120 words.` + (fanMode ? " Simple non-technical language. Use emojis. DRS=Turbo Boost Zone, Undercut=Secret Pit Move, Stint=Tire Run, Delta=Time Gap." : "");
      const reply = await callGemini({
        model: GEMINI_MODELS.fast, systemPrompt: sys, userMessage: msg,
        conversationHistory: chatHistory.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        maxTokens: 400,
      });
      addChat({ role: "assistant", content: reply, id: `a-${Date.now()}` });
    } catch (e: any) {
      toast.error(e.message);
    }
    setTyping(false);
  };

  const initial = chatHistory.length === 0;

  return (
    <div style={{ marginTop: 40 }}>
      <div className="eyebrow">AI RACE COPILOT</div>
      <div className="glass" style={{ marginTop: 12, padding: 0, overflow: "hidden" }}>
        <div ref={scrollRef} style={{ height: 420, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          {initial && (
            <div style={{ background: "#F2F2F4", padding: 16, borderRadius: 20, borderTopLeftRadius: 4, fontSize: 15, color: "#8F8F8F", borderLeft: "2px solid #0071E3", alignSelf: "flex-start", maxWidth: "75%" }}>
              Race Copilot online. I have full telemetry access. Ask me anything about strategy, tire management, rivals, or race pace.
            </div>
          )}
          {chatHistory.map((m) => (
            <div key={m.id} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "75%",
              background: m.role === "user" ? "#0F1012" : "#F2F2F4",
              color: m.role === "user" ? "#FDFDFD" : "#0F1012",
              borderRadius: m.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
              padding: "12px 16px", fontSize: 15, lineHeight: 1.5,
              borderLeft: m.role === "assistant" ? "2px solid #0071E3" : undefined,
              whiteSpace: "pre-wrap",
            }}>{fanText(m.content, fanMode)}</div>
          ))}
          {typing && (
            <div style={{ alignSelf: "flex-start", background: "#F2F2F4", padding: "12px 16px", borderRadius: "20px 20px 20px 4px", display: "flex", gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#8F8F8F", animation: `pulse-soft 1.2s ${i * 0.2}s infinite` }} />
              ))}
            </div>
          )}
        </div>

        <div style={{ borderTop: "1px solid rgba(15,16,18,0.08)", padding: 16 }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 12 }} className="no-scrollbar">
            {QUICK_PROMPTS.map((p) => (
              <button key={p} onClick={() => send(p)} style={{
                padding: "8px 14px", fontSize: 13, whiteSpace: "nowrap",
                border: "1px solid rgba(15,16,18,0.08)", borderRadius: 40, background: "transparent",
              }}>{fanText(p, fanMode)}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="input-base" placeholder="Ask your race engineer AI..." value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()} />
            <button className="btn-primary" onClick={() => send()} style={{ padding: "12px 18px" }}><Send size={14} /></button>
            <button className="btn-ghost" onClick={clearChat} style={{ padding: "12px 14px" }}><Trash2 size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
