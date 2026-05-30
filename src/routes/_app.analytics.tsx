
import { createFileRoute } from "@tanstack/react-router";
import { useGlobal } from "@/context/GlobalContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from "recharts";
import { fanText, FAN_HEADERS } from "@/utils/fanText";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — RaceIQ" }] }),
  component: AnalyticsPage,
});

const DRIVER_NUMBERS: Record<string, number> = {
  "Max Verstappen": 1,
  "Charles Leclerc": 16,
  "Lewis Hamilton": 44,
  "George Russell": 63,
  "Carlos Sainz": 55,
  "Lando Norris": 4,
  "Fernando Alonso": 14,
  "Oscar Piastri": 81,
  "Sergio Perez": 11,
  "Lance Stroll": 18,
};

const SESSION_KEY = "latest";
const API_BASE = "https://api.openf1.org/v1";

function AnalyticsPage() {
  const { fanMode, selectedTeam } = useGlobal();
  const drivers = Object.keys(DRIVER_NUMBERS);
  const [driver, setDriver] = useState("George Russell");
  const [lapData, setLapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  const fetchDriverData = async (driverName: string) => {
    setLoading(true);
    setLapData([]);
    const driverNum = DRIVER_NUMBERS[driverName] || 63;

    try {
      let sessionKey = SESSION_KEY;
      const [lapRes, stintRes, sessionRes] = await Promise.all([
        fetch(`${API_BASE}/laps?session_key=${sessionKey}&driver_number=${driverNum}`),
        fetch(`${API_BASE}/stints?session_key=${sessionKey}&driver_number=${driverNum}`),
        fetch(`${API_BASE}/sessions?session_key=${sessionKey}`)
      ]);

      let laps = await lapRes.json();
      let stints = await stintRes.json();
      let sessions = await sessionRes.json();

      if (!Array.isArray(laps) || laps.length === 0) {
        const sessRes = await fetch(`${API_BASE}/sessions?session_type=Race&order_by=date_start`);
        const allSessions = await sessRes.json();
        if (Array.isArray(allSessions) && allSessions.length > 0) {
          const sorted = allSessions.sort((a: any, b: any) =>
            new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
          );
          sessionKey = String(sorted[0].session_key);
          setSessionInfo(sorted[0]);
          const [l2, s2] = await Promise.all([
            fetch(`${API_BASE}/laps?session_key=${sessionKey}&driver_number=${driverNum}`),
            fetch(`${API_BASE}/stints?session_key=${sessionKey}&driver_number=${driverNum}`)
          ]);
          laps = await l2.json();
          stints = await s2.json();
        }
      } else {
        if (Array.isArray(sessions) && sessions.length > 0) setSessionInfo(sessions[0]);
      }

      if (!Array.isArray(laps) || laps.length === 0) { setLoading(false); return; }

      const compoundMap: Record<number, string> = {};
      if (Array.isArray(stints)) {
        stints.forEach((stint: any) => {
          for (let i = stint.lap_start; i <= (stint.lap_end || 999); i++) {
            compoundMap[i] = stint.compound || "UNKNOWN";
          }
        });
      }

      const pitLaps = Array.isArray(stints) ? stints.slice(1).map((s: any) => s.lap_start) : [18, 36];

      const mapped = laps.map((l: any) => ({
        lap: l.lap_number,
        time: l.lap_duration || 90,
        s1: l.duration_sector_1 || 0,
        s2: l.duration_sector_2 || 0,
        s3: l.duration_sector_3 || 0,
        compound: compoundMap[l.lap_number] || "MEDIUM",
        isPit: pitLaps.includes(l.lap_number),
        event: pitLaps.includes(l.lap_number) ? "PIT" : null,
      })).filter((l: any) => l.time && l.time > 0);

      setLapData(mapped);
    } catch (err) { console.error("Analytics fetch error:", err); }
    setLoading(false);
  };

  useEffect(() => { fetchDriverData(driver); }, [driver]);

  const chartData = lapData.map((l) => ({
    lap: l.lap,
    time: parseFloat(l.time?.toFixed(3) || "0"),
    gap: parseFloat((l.time - 85).toFixed(2)),
  }));

  const fastest = lapData.length > 0 ? Math.min(...lapData.filter((l) => !l.event).map((l) => l.time)) : 85;
  const pitLapNumbers = lapData.filter((l) => l.isPit).map((l) => l.lap);

  return (
    <div style={{ padding: "32px 32px 80px" }}>
      <div className="eyebrow">{fanMode ? FAN_HEADERS.analytics : "ANALYTICS"}</div>
      <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-0.025em", marginTop: 4 }}>Lap-by-lap performance</h1>

      {sessionInfo && (
        <div style={{ marginTop: 12, padding: "6px 14px", background: "rgba(0,113,227,0.08)", border: "1px solid #0071E3", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#0071E3" }}>
          📡 {sessionInfo.session_name} — {sessionInfo.circuit_short_name} {sessionInfo.year} · Session {sessionInfo.session_key}
        </div>
      )}

      <select className="input-base" style={{ maxWidth: 280, marginTop: 16 }} value={driver} onChange={(e) => setDriver(e.target.value)}>
        {drivers.map((d) => <option key={d}>{d}</option>)}
      </select>

      {loading && (
        <div className="glass" style={{ padding: 24, marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="shimmer" style={{ height: 24, width: 200 }} />
          <div className="shimmer" style={{ height: 280 }} />
        </div>
      )}

      {!loading && lapData.length === 0 && (
        <div className="glass" style={{ padding: 24, marginTop: 16, textAlign: "center", color: "#8F8F8F" }}>
          No lap data available for {driver}
        </div>
      )}

      {!loading && lapData.length > 0 && (
        <>
          <div className="glass" style={{ padding: 24, marginTop: 16 }}>
            <div className="eyebrow">LAP TIMES — {driver} (#{DRIVER_NUMBERS[driver]})</div>
            <div style={{ width: "100%", height: 320, marginTop: 16 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="rgba(15,16,18,0.06)" />
                  <XAxis dataKey="lap" tick={{ fontSize: 11, fill: "#8F8F8F" }} interval={4} />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#8F8F8F" }} />
                  <Tooltip contentStyle={{ background: "rgba(253,253,253,0.95)", border: "1px solid rgba(15,16,18,0.08)", borderRadius: 12, fontSize: 12 }} formatter={(v: any) => [`${v}s`, "Lap Time"]} />
                  <Line type="monotone" dataKey="time" stroke={selectedTeam?.color || "#0F1012"} strokeWidth={1.5} dot={false} />
                  {pitLapNumbers.map((pitLap) => (
                    <ReferenceLine key={pitLap} x={pitLap} stroke="#E3001E" strokeDasharray="3 3" label={{ value: "PIT", fontSize: 10, fill: "#E3001E" }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass" style={{ padding: 24, marginTop: 16 }}>
            <div className="eyebrow">SECTOR TIMES</div>
            <div style={{ overflowX: "auto", marginTop: 12 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ color: "#8F8F8F", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 11 }}>
                    {["Lap", "S1", "S2", "S3", "Total", "Compound", "Δ Fastest"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid rgba(15,16,18,0.08)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lapData.slice(0, 30).map((l) => (
                    <tr key={l.lap} style={{ background: l.isPit ? "rgba(227,0,30,0.06)" : l.time === fastest ? "rgba(123,47,255,0.08)" : undefined, fontStyle: l.isPit ? "italic" : undefined }}>
                      <td style={{ padding: "8px 12px" }} className="font-display">{l.lap}</td>
                      <td style={{ padding: "8px 12px" }} className="font-display">{l.s1?.toFixed(3) || "—"}</td>
                      <td style={{ padding: "8px 12px" }} className="font-display">{l.s2?.toFixed(3) || "—"}</td>
                      <td style={{ padding: "8px 12px" }} className="font-display">{l.s3?.toFixed(3) || "—"}</td>
                      <td style={{ padding: "8px 12px" }} className="font-display">{l.time?.toFixed(3)}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, background: l.compound === "SOFT" ? "rgba(227,0,30,0.1)" : l.compound === "MEDIUM" ? "rgba(245,166,35,0.1)" : l.compound === "HARD" ? "rgba(15,16,18,0.06)" : "rgba(0,166,81,0.1)", color: l.compound === "SOFT" ? "#E3001E" : l.compound === "MEDIUM" ? "#F5A623" : l.compound === "HARD" ? "#0F1012" : "#00A651" }}>
                          {l.compound}
                        </span>
                      </td>
                      <td style={{ padding: "8px 12px" }} className="font-display">+{(l.time - fastest).toFixed(3)}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass" style={{ padding: 24, marginTop: 16 }}>
            <div className="eyebrow">PERFORMANCE GAP VS 85s BASELINE</div>
            <div style={{ width: "100%", height: 200, marginTop: 16 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <CartesianGrid stroke="rgba(15,16,18,0.06)" />
                  <XAxis dataKey="lap" tick={{ fontSize: 11, fill: "#8F8F8F" }} interval={4} />
                  <YAxis tick={{ fontSize: 11, fill: "#8F8F8F" }} />
                  <ReferenceLine y={0} stroke="rgba(15,16,18,0.25)" strokeDasharray="3 3" />
                  <Tooltip contentStyle={{ background: "rgba(253,253,253,0.95)", border: "1px solid rgba(15,16,18,0.08)", borderRadius: 12, fontSize: 12 }} formatter={(v: any) => [`${v}s`, "Gap vs Baseline"]} />
                  <Area type="monotone" dataKey="gap" stroke="#E3001E" fill="rgba(227,0,30,0.12)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


