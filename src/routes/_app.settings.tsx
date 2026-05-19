import { createFileRoute } from "@tanstack/react-router";
import { useGlobal } from "@/context/GlobalContext";
import { useState } from "react";
import { toast } from "sonner";
import { callGemini } from "@/services/GeminiAPI";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — RaceIQ" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { apiKey, setApiKey, raceSession, setRaceSession } = useGlobal();
  const [tab, setTab] = useState<"keys" | "notifs" | "prefs">("keys");
  const [show, setShow] = useState(false);
  const [draft, setDraft] = useState(apiKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"" | "ok" | "fail">("");

  const save = () => { setApiKey(draft); toast.success("API key saved"); };
  const test = async () => {
    setTesting(true); setTestResult("");
    setApiKey(draft);
    try {
      await callGemini({ userMessage: "ping", maxTokens: 20 });
      setTestResult("ok"); toast.success("Connection OK");
    } catch (e: any) { setTestResult("fail"); toast.error(e.message); }
    setTesting(false);
  };

  return (
    <div style={{ padding: "32px 32px 80px" }}>
      <div className="eyebrow">SETTINGS</div>
      <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-0.025em", marginTop: 4 }}>Configuration</h1>

      <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
        {([
          ["keys", "API KEYS"], ["notifs", "NOTIFICATIONS"], ["prefs", "PREFERENCES"],
        ] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className="pill" style={{
            background: tab === id ? "#0F1012" : "var(--bg-surface)",
            color: tab === id ? "#FDFDFD" : "#0F1012",
            borderColor: "transparent", cursor: "pointer", padding: "10px 18px",
          }}>{label}</button>
        ))}
      </div>

      {tab === "keys" && (
        <div className="glass" style={{ padding: 24, marginTop: 16, maxWidth: 600 }}>
          <div className="eyebrow">GOOGLE GEMINI</div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input className="input-base" type={show ? "text" : "password"} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="AIzaSy..." />
              <button onClick={() => setShow(!show)} style={{ position: "absolute", right: 8, top: 8, background: "transparent", border: "none", padding: 4 }}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="btn-primary" onClick={save}>Save API Keys</button>
            <button className="btn-ghost" onClick={test} disabled={testing || !draft}>{testing ? "Testing..." : "Test Connection"}</button>
            {testResult === "ok" && <span className="pill" style={{ background: "#00A651", color: "#FDFDFD", borderColor: "transparent" }}>Connected</span>}
            {testResult === "fail" && <span className="pill" style={{ background: "#E3001E", color: "#FDFDFD", borderColor: "transparent" }}>Invalid key</span>}
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: "#00A651" }}>OpenF1 & Open-Meteo · Free · No key required</p>
          <p style={{ marginTop: 8, fontSize: 12, color: "#8F8F8F" }}>
            Get a Gemini API key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>aistudio.google.com/apikey</a>
          </p>
        </div>
      )}

      {tab === "notifs" && (
        <div className="glass" style={{ padding: 24, marginTop: 16, maxWidth: 600 }}>
          <div className="eyebrow">PUSH NOTIFICATION SETTINGS</div>
          <p style={{ fontSize: 14, color: "#8F8F8F", marginTop: 8 }}>Notifications require Firebase FCM setup.</p>
          {["Pit Window Alerts", "Anomaly Alerts", "Weather Change Alerts", "Rival Strategy Alerts", "Win Probability Shifts"].map((n) => (
            <NotifToggle key={n} label={n} />
          ))}
        </div>
      )}

      {tab === "prefs" && (
        <div className="glass" style={{ padding: 24, marginTop: 16, maxWidth: 600 }}>
          <div className="eyebrow">RACE PREFERENCES</div>
          <div style={{ marginTop: 16 }}>
            <div className="eyebrow">Session</div>
            <select className="input-base" style={{ marginTop: 6 }} value={raceSession} onChange={(e) => setRaceSession(e.target.value as any)}>
              <option>RACE</option><option>QUALIFYING</option><option>PRACTICE</option>
            </select>
          </div>
          <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => toast.success("Preferences saved")}>Save Preferences</button>
        </div>
      )}
    </div>
  );
}

function NotifToggle({ label }: { label: string }) {
  const [on, setOn] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid rgba(15,16,18,0.06)" }}>
      <div>
        <div style={{ fontSize: 15 }}>{label}</div>
      </div>
      <button onClick={() => setOn(!on)} style={{
        width: 44, height: 26, borderRadius: 40, padding: 2, border: "none",
        background: on ? "#00A651" : "rgba(15,16,18,0.15)", cursor: "pointer",
        transition: "background 0.3s var(--ease-out)",
      }}>
        <span style={{
          display: "block", width: 22, height: 22, borderRadius: "50%", background: "#FDFDFD",
          transform: `translateX(${on ? 18 : 0}px)`, transition: "transform 0.3s var(--ease-out)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }} />
      </button>
    </div>
  );
}
