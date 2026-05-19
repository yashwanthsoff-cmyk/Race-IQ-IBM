import { createFileRoute } from "@tanstack/react-router";
import { useGlobal } from "@/context/GlobalContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useEffect, useState } from "react";
import { callGemini } from "@/services/GeminiAPI";
import { toast } from "sonner";
import { fanText, FAN_HEADERS } from "@/utils/fanText";

export const Route = createFileRoute("/_app/weather")({
  head: () => ({ meta: [{ title: "Weather — RaceIQ" }] }),
  component: WeatherPage,
});

function WeatherPage() {
  const { weather, fanMode, currentLap } = useGlobal();
  const current = weather[new Date().getHours()] || weather[12];
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await callGemini({
          systemPrompt: "F1 weather strategy expert. Return ONLY valid JSON: {summary:string, tireRecommendation:string, criticalLap:number, alerts:[{message,severity:'INFO'|'WARNING'|'CRITICAL'}]}",
          userMessage: `${current.temp}°C air, ${current.trackTemp}°C track, ${current.humidity}% humidity, ${current.windSpeed}km/h. Rain trend: ${weather.map((w) => w.rainProb).join(",")}. ${57 - currentLap} laps remaining.`,
          expectJSON: true,
        });
        if (!cancelled) setAnalysis(data);
      } catch (e: any) { /* silent */ }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const rainAlert = current.rainProb > 50;

  return (
    <div style={{ padding: "32px 32px 80px" }}>
      <div className="eyebrow">{fanMode ? FAN_HEADERS.weather : "WEATHER"}</div>
      <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-0.025em", marginTop: 4 }}>Conditions & forecast</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 24 }} className="weather-grid">
        {[
          { l: "AIR TEMP", v: `${current.temp}°C` },
          { l: "HUMIDITY", v: `${current.humidity}%` },
          { l: "WIND", v: `${current.windSpeed} km/h` },
          { l: "TRACK TEMP", v: `${current.trackTemp}°C` },
        ].map((c) => (
          <div key={c.l} className="glass" style={{ padding: 24 }}>
            <div className="eyebrow">{c.l}</div>
            <div className="font-display" style={{ fontSize: 36, marginTop: 8 }}>{c.v}</div>
          </div>
        ))}
      </div>

      {rainAlert && (
        <div style={{ background: "#E3001E", color: "#FDFDFD", padding: 14, borderRadius: 12, marginTop: 16, fontSize: 15 }} className="animate-pulse-soft">
          ⚠ Rain probability {current.rainProb}% — strategy under review
        </div>
      )}

      <div className="glass" style={{ padding: 24, marginTop: 16 }}>
        <div className="eyebrow">24H FORECAST</div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginTop: 12, paddingBottom: 8 }} className="no-scrollbar">
          {weather.map((w, i) => (
            <div key={i} style={{
              minWidth: 80, padding: 12, borderRadius: 16, background: "var(--bg-surface)",
              border: i === new Date().getHours() ? "1.5px solid #0071E3" : "1px solid rgba(15,16,18,0.05)",
              textAlign: "center",
            }}>
              <div className="eyebrow">{w.hour}:00</div>
              <div className="font-display" style={{ fontSize: 18, marginTop: 6 }}>{w.temp}°</div>
              <div style={{ fontSize: 11, color: "#0071E3", marginTop: 4 }}>{w.rainProb}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass" style={{ padding: 24, marginTop: 16 }}>
        <div className="eyebrow">RAIN PROBABILITY</div>
        <div style={{ width: "100%", height: 220, marginTop: 16 }}>
          <ResponsiveContainer>
            <AreaChart data={weather}>
              <CartesianGrid stroke="rgba(15,16,18,0.06)" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#8F8F8F" }} />
              <YAxis tick={{ fontSize: 11, fill: "#8F8F8F" }} />
              <Tooltip contentStyle={{ background: "rgba(253,253,253,0.95)", border: "1px solid rgba(15,16,18,0.08)", borderRadius: 12, fontSize: 12 }} />
              <ReferenceLine y={50} stroke="#F5A623" strokeDasharray="3 3" label={{ value: "PIT THRESHOLD", fontSize: 10, fill: "#F5A623" }} />
              <Area type="monotone" dataKey="rainProb" stroke="#0071E3" fill="rgba(0,113,227,0.15)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass" style={{ padding: 24, marginTop: 16, borderLeft: "2px solid #0071E3" }}>
        <div className="eyebrow">AI WEATHER ANALYSIS</div>
        {loading && <div className="shimmer" style={{ height: 80, marginTop: 12 }} />}
        {analysis && (
          <>
            <p style={{ fontSize: 17, marginTop: 12, lineHeight: 1.6 }}>{analysis.summary}</p>
            <div className="pill" style={{ marginTop: 12, borderColor: "#0071E3" }}>{analysis.tireRecommendation}</div>
            <div className="font-display" style={{ marginTop: 12, fontSize: 13, color: "#E3001E" }}>
              STRATEGY CRITICAL AFTER LAP {analysis.criticalLap}
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              {(analysis.alerts || []).map((a: any, i: number) => {
                const c = a.severity === "CRITICAL" ? "#E3001E" : a.severity === "WARNING" ? "#F5A623" : "#0071E3";
                return <div key={i} className="pill" style={{ background: c, color: "#FDFDFD", borderColor: "transparent", alignSelf: "flex-start" }}>{a.message}</div>;
              })}
            </div>
          </>
        )}
        {!loading && !analysis && <p style={{ fontSize: 14, color: "#8F8F8F", marginTop: 12 }}>Configure your Gemini API key in Settings to enable AI analysis.</p>}
      </div>

      <style>{`@media(max-width:768px){.weather-grid{grid-template-columns:1fr 1fr !important;}}`}</style>
    </div>
  );
}
