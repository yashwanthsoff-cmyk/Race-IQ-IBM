import { createFileRoute } from "@tanstack/react-router";
import { useGlobal } from "@/context/GlobalContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from "recharts";
import { fanText, FAN_HEADERS } from "@/utils/fanText";
import { useState } from "react";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — RaceIQ" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { lapData, fanMode, player1, player2, selectedTeam } = useGlobal();
  const drivers = selectedTeam?.drivers || ["Driver 1", "Driver 2"];
  const [driver, setDriver] = useState(drivers[0]);

  const chartData = lapData.map((l) => ({ lap: l.lap, time: l.time, gap: +(l.time - 85).toFixed(2) }));
  const fastest = Math.min(...lapData.filter((l) => !l.event).map((l) => l.time));

  return (
    <div style={{ padding: "32px 32px 80px" }}>
      <div className="eyebrow">{fanMode ? FAN_HEADERS.analytics : "ANALYTICS"}</div>
      <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-0.025em", marginTop: 4 }}>Lap-by-lap performance</h1>

      <select className="input-base" style={{ maxWidth: 280, marginTop: 24 }} value={driver} onChange={(e) => setDriver(e.target.value)}>
        {drivers.map((d) => <option key={d}>{d}</option>)}
      </select>

      <div className="glass" style={{ padding: 24, marginTop: 16 }}>
        <div className="eyebrow">LAP TIMES — {driver}</div>
        <div style={{ width: "100%", height: 320, marginTop: 16 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid stroke="rgba(15,16,18,0.06)" />
              <XAxis dataKey="lap" tick={{ fontSize: 11, fill: "#8F8F8F" }} interval={4} />
              <YAxis domain={[75, 130]} tick={{ fontSize: 11, fill: "#8F8F8F" }} />
              <Tooltip contentStyle={{ background: "rgba(253,253,253,0.95)", border: "1px solid rgba(15,16,18,0.08)", borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="time" stroke={selectedTeam?.color || "#0F1012"} strokeWidth={1.5} dot={false} />
              <ReferenceLine x={18} stroke="#E3001E" strokeDasharray="3 3" label={{ value: "PIT", fontSize: 10, fill: "#E3001E" }} />
              <ReferenceLine x={36} stroke="#E3001E" strokeDasharray="3 3" label={{ value: "PIT", fontSize: 10, fill: "#E3001E" }} />
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
                {["Lap", "S1", "S2", "S3", "Total", "Compound", "Δ Leader"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid rgba(15,16,18,0.08)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lapData.slice(0, 25).map((l) => (
                <tr key={l.lap} style={{ background: l.event ? "#F2F2F4" : l.time === fastest ? "rgba(123,47,255,0.08)" : undefined, fontStyle: l.event ? "italic" : undefined }}>
                  <td style={{ padding: "8px 12px" }} className="font-display">{l.lap}</td>
                  <td style={{ padding: "8px 12px" }} className="font-display">{l.s1.toFixed(2)}</td>
                  <td style={{ padding: "8px 12px" }} className="font-display">{l.s2.toFixed(2)}</td>
                  <td style={{ padding: "8px 12px" }} className="font-display">{l.s3.toFixed(2)}</td>
                  <td style={{ padding: "8px 12px" }} className="font-display">{l.time.toFixed(2)}</td>
                  <td style={{ padding: "8px 12px" }}>{l.compound}</td>
                  <td style={{ padding: "8px 12px" }} className="font-display">+{(l.time - fastest).toFixed(2)}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass" style={{ padding: 24, marginTop: 16 }}>
        <div className="eyebrow">PERFORMANCE GAP</div>
        <div style={{ width: "100%", height: 200, marginTop: 16 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <CartesianGrid stroke="rgba(15,16,18,0.06)" />
              <XAxis dataKey="lap" tick={{ fontSize: 11, fill: "#8F8F8F" }} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: "#8F8F8F" }} />
              <ReferenceLine y={0} stroke="rgba(15,16,18,0.25)" strokeDasharray="3 3" />
              <Tooltip contentStyle={{ background: "rgba(253,253,253,0.95)", border: "1px solid rgba(15,16,18,0.08)", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="gap" stroke="#E3001E" fill="rgba(227,0,30,0.12)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
