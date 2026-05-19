import { createFileRoute } from "@tanstack/react-router";
import { useGlobal } from "@/context/GlobalContext";
import { COMPOUND_COLORS, TOTAL_LAPS } from "@/utils/constants";
import GaugeArc from "@/components/common/GaugeArc";
import { fanText, FAN_HEADERS } from "@/utils/fanText";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — RaceIQ" }] }),
  component: Dashboard,
});

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="glass" style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 180 }}>
      <div className="eyebrow">{label}</div>
      {children}
    </div>
  );
}

function Dashboard() {
  const { telemetry, currentLap, radioMessages, fanMode } = useGlobal();
  const t = telemetry;
  const compoundStyle = COMPOUND_COLORS[t.compound];
  const lapPct = (currentLap / TOTAL_LAPS) * 100;

  return (
    <div style={{ padding: "32px 32px 80px" }}>
      <div style={{ height: 2, background: "#F2F2F4", borderRadius: 1, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ width: `${lapPct}%`, height: "100%", background: "#E3001E", transition: "width 0.6s var(--ease-out)" }} />
      </div>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div className="eyebrow">{fanMode ? FAN_HEADERS.dashboard : "DASHBOARD"}</div>
          <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-0.025em", marginTop: 4 }}>Live telemetry</h1>
        </div>
      </div>

      {fanMode && (
        <div className="glass" style={{ overflow: "hidden", padding: 0, marginBottom: 16, background: "#F2F2F4" }}>
          <div className="animate-marquee" style={{ display: "flex", gap: 48, whiteSpace: "nowrap", width: "max-content", padding: "12px 0" }}>
            {[
              "🏁 Big push from P3 around the hairpin!",
              "🔥 Tires are getting toasty — pit stop incoming?",
              "⚡ Rival just set a personal best lap time!",
              "🚦 Rain forecast for the final 10 laps — strategy is on edge!",
            ].concat([
              "🏁 Big push from P3 around the hairpin!",
              "🔥 Tires are getting toasty — pit stop incoming?",
            ]).map((s, i) => (
              <span key={i} style={{ fontSize: 17 }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="metrics-grid">
        <Metric label={fanText("SPEED", fanMode)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginTop: 8 }}>
            <div className="font-display" style={{ fontSize: 48, fontWeight: 400 }}>{t.speed}</div>
            <div style={{ color: "#8F8F8F", fontSize: 13 }}>km/h</div>
          </div>
          <GaugeArc value={t.speed} max={360} color="#0F1012" />
        </Metric>

        <Metric label={fanText("THROTTLE", fanMode)}>
          <div className="font-display" style={{ fontSize: 36, color: "#00A651", marginTop: 8 }}>{t.throttle}%</div>
          <div style={{ height: 6, background: "#F2F2F4", borderRadius: 3, marginTop: 16 }}>
            <div style={{ width: `${t.throttle}%`, height: "100%", background: "#00A651", borderRadius: 3, transition: "width 0.5s var(--ease-out)" }} />
          </div>
        </Metric>

        <Metric label={fanText("BRAKE", fanMode)}>
          <div className="font-display" style={{ fontSize: 36, color: "#E3001E", marginTop: 8 }}>{t.brake}%</div>
          <div style={{ height: 6, background: "#F2F2F4", borderRadius: 3, marginTop: 16 }}>
            <div style={{ width: `${t.brake}%`, height: "100%", background: "#E3001E", borderRadius: 3, transition: "width 0.5s var(--ease-out)" }} />
          </div>
        </Metric>

        <Metric label="GEAR">
          <div className="font-display" style={{ fontSize: 72, fontWeight: 400, textAlign: "center", marginTop: 8 }}>{t.gear}</div>
        </Metric>

        <Metric label={fanText("RPM", fanMode)}>
          <div className="font-display" style={{ fontSize: 36, color: "#0071E3", marginTop: 8 }}>{t.rpm.toLocaleString()}</div>
          <svg width={120} height={120} viewBox="0 0 120 120" style={{ margin: "0 auto" }}>
            <circle cx={60} cy={60} r={48} stroke="#F2F2F4" strokeWidth={8} fill="none" />
            <circle cx={60} cy={60} r={48} stroke="#0071E3" strokeWidth={8} fill="none"
              strokeDasharray={Math.PI * 96}
              strokeDashoffset={Math.PI * 96 * (1 - t.rpm / 15500)}
              strokeLinecap="round" transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dashoffset 0.5s var(--ease-out)" }} />
          </svg>
        </Metric>

        <Metric label="COMPOUND">
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1, marginTop: 8 }}>
            <span className="font-display" style={{
              padding: "16px 32px", borderRadius: 40,
              background: compoundStyle.bg, color: compoundStyle.fg,
              fontSize: 20, letterSpacing: "0.1em",
            }}>{t.compound}</span>
          </div>
        </Metric>
      </div>

      {/* Tire Wear */}
      <div className="glass" style={{ padding: 24, marginTop: 16 }}>
        <div className="eyebrow">TIRE WEAR</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 16 }}>
          {(["FL", "FR", "RL", "RR"] as const).map((c) => {
            const v = t.tireWear[c];
            const color = v >= 85 ? "#E3001E" : v >= 70 ? "#E8700A" : v >= 40 ? "#F5A623" : "#00A651";
            return (
              <div key={c} className="glass-sm" style={{
                background: "#F2F2F4", border: "1px solid rgba(15,16,18,0.05)", borderRadius: 16,
                padding: 16, position: "relative", overflow: "hidden", minHeight: 110,
                boxShadow: v > 85 ? `0 0 0 1.5px #E3001E` : undefined,
                animation: v > 85 ? "pulse-soft 2s ease-in-out infinite" : undefined,
              }}>
                <div style={{ position: "absolute", left: 0, bottom: 0, right: 0, height: `${v}%`, background: color, opacity: 0.18, transition: "height 0.5s var(--ease-out)" }} />
                <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <div className="eyebrow">{c}</div>
                  <div className="font-display" style={{ fontSize: 24, color }}>{v.toFixed(0)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fuel */}
      <div className="glass" style={{ padding: 24, marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 15, fontWeight: 400 }}>FUEL REMAINING</span>
          <span className="font-display" style={{ fontSize: 18 }}>{t.fuelKg.toFixed(1)} kg</span>
        </div>
        <div style={{ height: 8, background: "#F2F2F4", borderRadius: 4, marginTop: 12, overflow: "hidden" }}>
          <div style={{
            width: `${Math.min(100, (t.fuelKg / 50) * 100)}%`, height: "100%",
            background: "linear-gradient(90deg, #E3001E, #F5A623, #00A651)",
            transition: "width 0.5s var(--ease-out)",
          }} />
        </div>
      </div>

      {/* Track Map */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }} className="dashboard-bottom">
        <div className="glass" style={{ padding: 24 }}>
          <div className="eyebrow">TRACK MAP</div>
          <svg width="100%" height={220} viewBox="0 0 400 220">
            <path id="trackPath"
              d="M 40 110 Q 60 40, 140 50 T 260 60 Q 340 70, 350 130 Q 360 190, 280 180 Q 200 170, 140 180 Q 60 190, 40 110 Z"
              stroke="#0F1012" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
            <circle r={5} fill="#E3001E">
              <animateMotion dur="8s" repeatCount="indefinite">
                <mpath href="#trackPath" />
              </animateMotion>
            </circle>
          </svg>
          <div style={{ textAlign: "center", fontSize: 11, color: "#8F8F8F", letterSpacing: "0.1em", marginTop: 8 }}>MONACO</div>
        </div>

        <div className="glass" style={{ padding: 24 }}>
          <div className="eyebrow">TEAM RADIO</div>
          {radioMessages[0] && (
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginTop: 16, gap: 12 }}>
              <div style={{ borderLeft: "2px solid #E3001E", paddingLeft: 16, fontSize: 17, lineHeight: 1.5, flex: 1 }}>
                {fanText(radioMessages[0].msg, fanMode)}
              </div>
              <div style={{ fontSize: 12, color: "#8F8F8F" }}>
                {new Date(radioMessages[0].timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          )}
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
            {radioMessages.slice(1, 4).map((m, i) => (
              <div key={i} style={{ fontSize: 14, color: "#8F8F8F" }}>· {fanText(m.msg, fanMode)}</div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .metrics-grid, .dashboard-bottom { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
