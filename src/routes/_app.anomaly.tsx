import { createFileRoute } from "@tanstack/react-router";
import { useGlobal } from "@/context/GlobalContext";
import { SENSORS } from "@/utils/dataGenerators";
import GaugeArc from "@/components/common/GaugeArc";
import { fanText, FAN_HEADERS } from "@/utils/fanText";

export const Route = createFileRoute("/_app/anomaly")({
  head: () => ({ meta: [{ title: "Anomaly — RaceIQ" }] }),
  component: AnomalyPage,
});

const getStatus = (s: any, v: number): "NORMAL" | "WARNING" | "CRITICAL" => {
  if (v >= s.crit) return "CRITICAL";
  if (v < s.warn[0] || v > s.warn[1]) return "WARNING";
  return "NORMAL";
};

function AnomalyPage() {
  const { sensors, anomalyAlerts, ackAnomaly, dismissAnomaly, fanMode } = useGlobal();

  return (
    <div style={{ padding: "32px 32px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div>
          <div className="eyebrow">{fanMode ? FAN_HEADERS.anomaly : "ANOMALY"}</div>
          <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-0.025em", marginTop: 4 }}>Vehicle systems health</h1>
        </div>
        <span className="pill" style={{ marginLeft: "auto", background: "#E3001E", color: "#FDFDFD", borderColor: "transparent" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FDFDFD" }} className="animate-pulse-soft" /> LIVE
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 24 }} className="anomaly-grid">
        {SENSORS.map((s) => {
          const v = sensors[s.id] ?? 0;
          const status = getStatus(s, v);
          const color = status === "CRITICAL" ? "#E3001E" : status === "WARNING" ? "#F5A623" : "#00A651";
          return (
            <div key={s.id} className="glass" style={{
              padding: 20, boxShadow: status === "CRITICAL" ? "0 0 0 1.5px #E3001E, inset 0 1px 0 rgba(255,255,255,0.6)" : undefined,
              animation: status === "CRITICAL" ? "pulse-soft 1.6s ease-in-out infinite" : undefined,
            }}>
              <div className="eyebrow">{s.name}</div>
              <GaugeArc value={v} min={s.range[0]} max={s.range[1]} color={color} size={140} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span className="font-display" style={{ fontSize: 22 }}>{v.toFixed(1)}{s.unit}</span>
                <span className="pill" style={{ background: color, color: "#FDFDFD", borderColor: "transparent", fontSize: 10 }}>{status}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass" style={{ padding: 24, marginTop: 16 }}>
        <div className="eyebrow">ANOMALY ALERTS</div>
        {anomalyAlerts.length === 0 ? (
          <div style={{ color: "#00A651", fontSize: 15, marginTop: 16 }}>✓ All systems nominal</div>
        ) : (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8, maxHeight: 380, overflowY: "auto" }}>
            {anomalyAlerts.map((a) => {
              const c = a.severity === "CRITICAL" ? "#E3001E" : "#F5A623";
              return (
                <div key={a.id} style={{
                  borderLeft: `2px solid ${c}`, padding: "10px 14px", background: "var(--bg-surface)", borderRadius: 12,
                  display: "flex", alignItems: "center", gap: 12,
                  animation: !a.acknowledged && a.severity === "CRITICAL" ? "pulse-soft 2s ease-in-out infinite" : undefined,
                }}>
                  <span className="pill" style={{ background: c, color: "#FDFDFD", borderColor: "transparent" }}>{a.severity}</span>
                  <span style={{ fontSize: 14, flex: 1 }}>{a.message}</span>
                  <span style={{ fontSize: 12, color: "#8F8F8F" }}>{new Date(a.timestamp).toLocaleTimeString()}</span>
                  {!a.acknowledged && <button className="btn-ghost" style={{ padding: "4px 12px", fontSize: 11 }} onClick={() => ackAnomaly(a.id)}>ACK</button>}
                  <button className="btn-ghost" style={{ padding: "4px 12px", fontSize: 11 }} onClick={() => dismissAnomaly(a.id)}>Dismiss</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`@media(max-width:768px){.anomaly-grid{grid-template-columns:1fr 1fr !important;}}`}</style>
    </div>
  );
}
