import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { TEAMS, RADIO_MESSAGES, TOTAL_LAPS, type Team } from "@/utils/constants";
import { generateLapData, generateWeather, initialCompetitors, initialProbability, SENSORS, type LapData } from "@/utils/dataGenerators";

const OPENF1_SESSION = 9523;
const DRIVER_NUMBER = 16;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://xff7vmjz3h.execute-api.eu-north-1.amazonaws.com";

// Driver number → display info mapping
const DRIVER_META: Record<number, { driver: string; name: string; color: string }> = {
  1:  { driver: "VER", name: "Max Verstappen",   color: "#3671C6" },
  16: { driver: "LEC", name: "Charles Leclerc",  color: "#E8002D" },
  44: { driver: "HAM", name: "Lewis Hamilton",   color: "#27F4D2" },
  4:  { driver: "NOR", name: "Lando Norris",     color: "#FF8000" },
  63: { driver: "RUS", name: "George Russell",   color: "#27F4D2" },
  55: { driver: "SAI", name: "Carlos Sainz",     color: "#E8002D" },
  14: { driver: "ALO", name: "Fernando Alonso",  color: "#358C75" },
  81: { driver: "PIA", name: "Oscar Piastri",    color: "#FF8000" },
  11: { driver: "PER", name: "Sergio Perez",     color: "#3671C6" },
  10: { driver: "GAS", name: "Pierre Gasly",     color: "#0093CC" },
};

type Player = { name: string; driver: string };
export type Telemetry = {
  speed: number; throttle: number; brake: number; gear: number; rpm: number;
  compound: "SOFT" | "MEDIUM" | "HARD"; fuelKg: number;
  tireWear: { FL: number; FR: number; RL: number; RR: number };
};
export type AnomalyAlert = { id: string; sensor: string; message: string; severity: "WARNING" | "CRITICAL"; timestamp: number; acknowledged: boolean };
export type Decision = {
  id: string; lap: number; decision: string; confidence: number; urgency: string;
  reasons: string[]; pitWindow: { earliest: number; latest: number }; riskLevel: string;
  timestamp: number; outcome?: "CORRECT" | "INCORRECT" | "UNKNOWN";
  explanation?: string; data: any;
};
export type ChatMsg = { role: "user" | "assistant"; content: string; id: string };
export type Rule = { id: string; text: string; category: string; source: "AI LEARNED" | "CUSTOM"; active: boolean };

type Ctx = {
  selectedTeam: Team | null;
  setSelectedTeam: (t: Team | null) => void;
  player1: Player; setPlayer1: (p: Player) => void;
  player2: Player; setPlayer2: (p: Player) => void;
  authorized: boolean; setAuthorized: (b: boolean) => void;
  fanMode: boolean; setFanMode: (b: boolean) => void;
  voiceMode: boolean; setVoiceMode: (b: boolean) => void;
  apiKey: string; setApiKey: (k: string) => void;
  raceSession: "RACE" | "QUALIFYING" | "PRACTICE"; setRaceSession: (s: any) => void;
  currentLap: number;
  telemetry: Telemetry;
  lapData: LapData[];
  competitors: ReturnType<typeof initialCompetitors>;
  anomalyAlerts: AnomalyAlert[]; ackAnomaly: (id: string) => void; dismissAnomaly: (id: string) => void;
  sensors: Record<string, number>;
  winProbability: ReturnType<typeof initialProbability>;
  radioMessages: { msg: string; timestamp: number }[];
  weather: ReturnType<typeof generateWeather>;
  decisionHistory: Decision[]; addDecision: (d: Decision) => void; updateDecisionOutcome: (id: string, outcome: any) => void; updateDecisionExplanation: (id: string, exp: string) => void;
  chatHistory: ChatMsg[]; addChat: (m: ChatMsg) => void; clearChat: () => void;
  learnedRules: Rule[]; addRule: (r: Rule) => void; toggleRule: (id: string) => void; deleteRule: (id: string) => void;
};

const GlobalContext = createContext<Ctx | null>(null);

const useLocal = <T,>(key: string, init: T): [T, (v: T) => void] => {
  const [v, setV] = useState<T>(init);
  useEffect(() => {
    try { const raw = localStorage.getItem(key); if (raw) setV(JSON.parse(raw)); } catch {}
  }, []);
  const setter = (val: T) => { setV(val); try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };
  return [v, setter];
};

const DEFAULT_RULES: Rule[] = [
  { id: "r1", text: "Pit early if tire wear exceeds 75% on any corner", category: "TIRE", source: "AI LEARNED", active: true },
  { id: "r2", text: "Switch to intermediates when rain probability exceeds 60%", category: "WEATHER", source: "AI LEARNED", active: true },
  { id: "r3", text: "Undercut rival when gap is under 3s and tire age delta > 4 laps", category: "RIVAL", source: "AI LEARNED", active: true },
  { id: "r4", text: "Engage fuel-save mode if fuel/lap exceeds 1.7kg average", category: "FUEL", source: "CUSTOM", active: true },
  { id: "r5", text: "Pit immediately under safety car if outside top 3", category: "SAFETY_CAR", source: "AI LEARNED", active: true },
];

const fetchOpenF1 = async (endpoint: string) => {
  try {
    const res = await fetch(`https://api.openf1.org/v1/${endpoint}&session_key=${OPENF1_SESSION}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
};

const askGroq = async (system: string, user: string) => {
  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Authorization": `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3-70b-8192", temperature: 0.3, max_tokens: 512,
        messages: [{ role: "system", content: system }, { role: "user", content: user }]
      })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  } catch { return ""; }
};

// ── Fetch real win probabilities from Lambda ──────────────────────────────────
const fetchWinProbabilities = async (
  prev: ReturnType<typeof initialProbability>
): Promise<ReturnType<typeof initialProbability>> => {
  try {
    const res = await fetch(`${API_BASE}/winprob`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data?.probabilities?.length >= 2) {
      const updated = data.probabilities
        .filter((p: any) => DRIVER_META[p.driver_number])
        .map((p: any) => {
          const meta = DRIVER_META[p.driver_number];
          const existing = prev.find((d) => d.driver === meta.driver);
          const prob = p.win_pct ?? p.probability ?? 0;
          return {
            driver:      meta.driver,
            name:        meta.name,
            color:       meta.color,
            probability: prob,
            history:     [...(existing?.history ?? []), prob].slice(-30),
          };
        })
        .slice(0, 5);

      if (updated.length >= 2) return updated;
    }
  } catch {
    // Silent fail — fall through to mock update below
  }

  // Fallback: gentle random drift on existing data
  const adj = prev.map((d) => ({ ...d, probability: Math.max(1, d.probability + (Math.random() * 8 - 4)) }));
  const sum = adj.reduce((s, d) => s + d.probability, 0);
  return adj.map((d) => ({
    ...d,
    probability: +(d.probability / sum * 100).toFixed(1),
    history: [...(d.history || []), +(d.probability / sum * 100).toFixed(1)].slice(-30),
  }));
};

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [selectedTeam, setSelectedTeamRaw] = useState<Team | null>(null);
  const [player1, setPlayer1Raw] = useState<Player>({ name: "", driver: "" });
  const [player2, setPlayer2Raw] = useState<Player>({ name: "", driver: "" });
  const [authorized, setAuthorized] = useState(false);
  const [fanMode, setFanMode] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [raceSession, setRaceSession] = useState<"RACE" | "QUALIFYING" | "PRACTICE">("RACE");
  const [apiKey, setApiKeyState] = useState("");

  const setApiKey = (k: string) => {
    setApiKeyState(k);
    try { if (k) localStorage.setItem("raceiq_gemini_key", k); else localStorage.removeItem("raceiq_gemini_key"); } catch {}
  };

  useEffect(() => {
    try {
      const team = localStorage.getItem("raceiq_team"); if (team) setSelectedTeamRaw(JSON.parse(team));
      const p1 = localStorage.getItem("raceiq_p1"); if (p1) setPlayer1Raw(JSON.parse(p1));
      const p2 = localStorage.getItem("raceiq_p2"); if (p2) setPlayer2Raw(JSON.parse(p2));
      const auth = localStorage.getItem("raceiq_auth"); if (auth === "1") setAuthorized(true);
      const k = localStorage.getItem("raceiq_gemini_key"); if (k) setApiKeyState(k);
    } catch {}
  }, []);

  const setSelectedTeam = (t: Team | null) => { setSelectedTeamRaw(t); try { t ? localStorage.setItem("raceiq_team", JSON.stringify(t)) : localStorage.removeItem("raceiq_team"); } catch {} };
  const setPlayer1 = (p: Player) => { setPlayer1Raw(p); try { localStorage.setItem("raceiq_p1", JSON.stringify(p)); } catch {} };
  const setPlayer2 = (p: Player) => { setPlayer2Raw(p); try { localStorage.setItem("raceiq_p2", JSON.stringify(p)); } catch {} };
  const setAuthorizedP = (b: boolean) => { setAuthorized(b); try { localStorage.setItem("raceiq_auth", b ? "1" : "0"); } catch {} };

  const [currentLap, setCurrentLap] = useState(34);
  const [telemetry, setTelemetry] = useState<Telemetry>({
    speed: 285, throttle: 78, brake: 0, gear: 7, rpm: 11500,
    compound: "MEDIUM", fuelKg: 38.5,
    tireWear: { FL: 42, FR: 45, RL: 38, RR: 41 },
  });

  const lapData = useMemo(() => generateLapData(), []);
  const [competitors, setCompetitors] = useState(initialCompetitors());
  const [anomalyAlerts, setAnomalyAlerts] = useState<AnomalyAlert[]>([]);
  const [sensors, setSensors] = useState<Record<string, number>>(() => {
    const s: any = {}; for (const x of SENSORS) s[x.id] = (x.min + x.max) / 2; return s;
  });
  const [winProbability, setWinProbability] = useState(initialProbability());
  const [radioMessages, setRadioMessages] = useState<{ msg: string; timestamp: number }[]>([
    { msg: RADIO_MESSAGES[0], timestamp: Date.now() },
  ]);
  const radioIdx = useRef(1);
  const weather = useMemo(() => generateWeather(), []);

  const [decisionHistory, setDecisionHistoryRaw] = useLocal<Decision[]>("raceiq_decisions", []);
  const [chatHistory, setChatHistoryRaw] = useLocal<ChatMsg[]>("raceiq_chat", []);
  const [learnedRules, setLearnedRulesRaw] = useLocal<Rule[]>("raceiq_rules", DEFAULT_RULES);

  // ── Fetch real OpenF1 + Lambda data ────────────────────────────────────────
  useEffect(() => {
    const fetchReal = async () => {
      const [carData, posData, stintData, intervalData] = await Promise.all([
        fetchOpenF1(`car_data?driver_number=${DRIVER_NUMBER}`),
        fetchOpenF1(`position?driver_number=${DRIVER_NUMBER}`),
        Promise.resolve([]),
        Promise.resolve([]),
      ]);

      if (carData.length > 0) {
        const idx = Math.floor(Math.random() * Math.min(carData.length, 100));
        const d = carData[carData.length - 1 - idx] || carData[carData.length - 1];
        setTelemetry((prev) => ({
          ...prev,
          speed: d.speed || prev.speed,
          throttle: d.throttle || prev.throttle,
          brake: d.brake || prev.brake,
          gear: d.n_gear || prev.gear,
          rpm: d.rpm || prev.rpm,
        }));
      }

      if (posData.length > 0) {
        const latest = posData[posData.length - 1];
        setCurrentLap(Math.min(latest?.lap_number || 34, TOTAL_LAPS));
      }

      if (stintData.length > 0) {
        const latest = stintData[stintData.length - 1];
        const compound = (latest?.compound || "MEDIUM").toUpperCase() as "SOFT" | "MEDIUM" | "HARD";
        setTelemetry((prev) => ({ ...prev, compound }));
      }

      if (intervalData.length > 0) {
        const latest = intervalData[intervalData.length - 1];
        const gap = latest?.gap_to_leader || 2.3;
        setCompetitors((cs) => cs.map((c, i) => ({
          ...c,
          gap: i === 0 ? `+${(gap + i * 0.8).toFixed(3)}s` : c.gap,
        })));
      }

      // Check anomalies using Groq
      const latest = carData[carData.length - 1];
      if (latest?.rpm > 13500) {
        const explanation = await askGroq(
          "You are an F1 engineer. Explain this anomaly in one sentence.",
          `RPM is ${latest.rpm}. What is the risk?`
        );
        const alert: AnomalyAlert = {
          id: `rpm-${Date.now()}`, sensor: "Engine RPM",
          message: explanation || `Engine RPM at ${latest.rpm} — above safe threshold`,
          severity: latest.rpm > 14500 ? "CRITICAL" : "WARNING",
          timestamp: Date.now(), acknowledged: false,
        };
        setAnomalyAlerts((a) => [alert, ...a].slice(0, 30));
      }
    };

    fetchReal();
    const interval = setInterval(fetchReal, 120000);
    return () => clearInterval(interval);
  }, []);

  // ── Fetch real win probabilities from Lambda on mount ─────────────────────
  useEffect(() => {
    fetchWinProbabilities(winProbability).then(setWinProbability);
  }, []);

  // ── Simulation ticks for smooth UI updates between real data fetches ───────
  useEffect(() => {
    const t1 = setInterval(() => {
      setTelemetry((p) => {
        const speed = Math.max(180, Math.min(360, p.speed + (Math.random() * 10 - 5)));
        const throttle = Math.max(0, Math.min(100, p.throttle + (Math.random() * 8 - 4)));
        const brake = throttle > 70 ? Math.random() * 5 : Math.random() * 30 + 5;
        const gear = speed < 220 ? 5 : speed < 270 ? 6 : speed < 310 ? 7 : 8;
        const rpm = Math.max(8000, Math.min(15500, speed * 42 + (Math.random() * 500 - 250)));
        return {
          ...p, speed: +speed.toFixed(0), throttle: +throttle.toFixed(0),
          brake: +brake.toFixed(0), gear, rpm: +rpm.toFixed(0),
          fuelKg: Math.max(0, p.fuelKg - 0.02),
          tireWear: {
            FL: Math.min(100, p.tireWear.FL + Math.random() * 0.17 + 0.08),
            FR: Math.min(100, p.tireWear.FR + Math.random() * 0.17 + 0.08),
            RL: Math.min(100, p.tireWear.RL + Math.random() * 0.17 + 0.08),
            RR: Math.min(100, p.tireWear.RR + Math.random() * 0.17 + 0.08),
          },
        };
      });
    }, 3000);

    const t2 = setInterval(() => setCurrentLap((l) => Math.min(TOTAL_LAPS, l + 1)), 30000);

    const t3 = setInterval(() => {
      setCompetitors((cs) => cs.map((c) => ({
        ...c,
        stintAge: c.stintAge + (Math.random() > 0.6 ? 1 : 0),
        gap: `+${(parseFloat(c.gap) + (Math.random() * 0.3 - 0.15)).toFixed(3)}s`,
        lapTime: +(c.lapTime + (Math.random() * 0.2 - 0.1)).toFixed(3),
      })));
    }, 5000);

    const t4 = setInterval(() => {
      setSensors((prev) => {
        const next: any = { ...prev };
        for (const s of SENSORS) {
          const spike = Math.random() < 0.15;
          if (spike) {
            next[s.id] = +(s.range[1] * (0.85 + Math.random() * 0.15)).toFixed(1);
            const severity = next[s.id] >= s.crit ? "CRITICAL" : "WARNING";
            const alert: AnomalyAlert = {
              id: `${s.id}-${Date.now()}`, sensor: s.name,
              message: `${s.name} reading ${next[s.id]}${s.unit} exceeds normal range`,
              severity, timestamp: Date.now(), acknowledged: false,
            };
            setAnomalyAlerts((a) => [alert, ...a].slice(0, 30));
            setTimeout(() => {
              setSensors((p) => ({ ...p, [s.id]: +((s.min + s.max) / 2 + (Math.random() * 2 - 1)).toFixed(1) }));
            }, 16000);
          } else {
            next[s.id] = +(s.min + Math.random() * (s.max - s.min)).toFixed(1);
          }
        }
        return next;
      });
    }, 8000);

    // ── t5: Win probability — fetch from Lambda every 30s ──────────────────
    const t5 = setInterval(() => {
      setWinProbability((prev) => {
        fetchWinProbabilities(prev).then(setWinProbability);
        return prev; // keep existing while fetch runs
      });
    }, 30000);

    const t6 = setInterval(() => {
      const msg = RADIO_MESSAGES[radioIdx.current % RADIO_MESSAGES.length];
      radioIdx.current++;
      setRadioMessages((m) => [{ msg, timestamp: Date.now() }, ...m].slice(0, 8));
    }, 20000);

    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3); clearInterval(t4); clearInterval(t5); clearInterval(t6); };
  }, []);

  const ctx: Ctx = {
    selectedTeam, setSelectedTeam,
    player1, setPlayer1, player2, setPlayer2,
    authorized, setAuthorized: setAuthorizedP,
    fanMode, setFanMode, voiceMode, setVoiceMode,
    apiKey, setApiKey,
    raceSession, setRaceSession,
    currentLap, telemetry, lapData, competitors,
    anomalyAlerts,
    ackAnomaly: (id) => setAnomalyAlerts((a) => a.map((x) => x.id === id ? { ...x, acknowledged: true } : x)),
    dismissAnomaly: (id) => setAnomalyAlerts((a) => a.filter((x) => x.id !== id)),
    sensors, winProbability, radioMessages, weather,
    decisionHistory,
    addDecision: (d) => setDecisionHistoryRaw([d, ...decisionHistory].slice(0, 50)),
    updateDecisionOutcome: (id, outcome) => setDecisionHistoryRaw(decisionHistory.map((d) => d.id === id ? { ...d, outcome } : d)),
    updateDecisionExplanation: (id, exp) => setDecisionHistoryRaw(decisionHistory.map((d) => d.id === id ? { ...d, explanation: exp } : d)),
    chatHistory,
    addChat: (m) => setChatHistoryRaw([...chatHistory, m].slice(-40)),
    clearChat: () => setChatHistoryRaw([]),
    learnedRules,
    addRule: (r) => setLearnedRulesRaw([r, ...learnedRules]),
    toggleRule: (id) => setLearnedRulesRaw(learnedRules.map((r) => r.id === id ? { ...r, active: !r.active } : r)),
    deleteRule: (id) => setLearnedRulesRaw(learnedRules.filter((r) => r.id !== id)),
  };

  return <GlobalContext.Provider value={ctx}>{children}</GlobalContext.Provider>;
}

export function useGlobal() {
  const c = useContext(GlobalContext);
  if (!c) throw new Error("useGlobal must be used within GlobalProvider");
  return c;
}

export { TEAMS };
