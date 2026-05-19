import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useGlobal, TEAMS } from "@/context/GlobalContext";
import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/select")({
  head: () => ({
    meta: [
      { title: "Select Team — RaceIQ" },
      { name: "description", content: "Pick your constructor and assign drivers before entering the race." },
    ],
  }),
  component: TeamSelection,
});

function StepDot({ n, active, done }: { n: number; active?: boolean; done?: boolean }) {
  const bg = done || active ? "#0F1012" : "transparent";
  const color = done || active ? "#FDFDFD" : "#8F8F8F";
  return (
    <span style={{
      width: 28, height: 28, borderRadius: "50%", background: bg, color,
      border: "1px solid rgba(15,16,18,0.15)", display: "inline-flex",
      alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 400,
    }} className="font-display">{done ? <Check size={14} /> : n}</span>
  );
}

function TeamSelection() {
  const { selectedTeam, setSelectedTeam, player1, setPlayer1, player2, setPlayer2 } = useGlobal();
  const nav = useNavigate();

  const step = !selectedTeam ? 1 : (!player1.name || !player1.driver || !player2.name || !player2.driver) ? 2 : 3;
  const conflict = player1.driver && player2.driver && player1.driver === player2.driver;
  const ready = step === 3 && !conflict;

  return (
    <div style={{ minHeight: "100vh", padding: "100px 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center" }}>
        <span className="eyebrow">RACE SETUP</span>
        <h1 style={{ fontSize: "clamp(36px, 5vw, 72px)", fontWeight: 300, letterSpacing: "-0.035em", marginTop: 12 }}>
          Choose your race setup
        </h1>
        <p style={{ fontSize: 17, color: "#8F8F8F", marginTop: 16 }}>
          Pick a constructor, assign drivers, and prepare for authorization.
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 32 }}>
        {[1, 2, 3].map((n, i) => (
          <span key={n} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <StepDot n={n} active={step === n} done={step > n} />
            {i < 2 && <span style={{ width: 40, height: 1, background: "rgba(15,16,18,0.15)" }} />}
          </span>
        ))}
      </div>

      {/* Step 1: Teams */}
      <div style={{ marginTop: 56 }}>
        <div className="eyebrow" style={{ textAlign: "center", marginBottom: 24 }}>STEP 1 · SELECT TEAM</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }} className="teams-select-grid">
          {TEAMS.map((t) => {
            const sel = selectedTeam?.id === t.id;
            return (
              <button key={t.id} onClick={() => setSelectedTeam(t)} className="glass" style={{
                padding: 16, textAlign: "left", position: "relative", cursor: "pointer",
                boxShadow: sel ? `0 0 0 1.5px ${t.color}, inset 0 1px 0 rgba(255,255,255,0.6)` : undefined,
                transition: "all 0.3s var(--ease-out)",
                transform: sel ? "scale(1.02)" : undefined,
              }}>
                {sel && (
                  <span style={{ position: "absolute", top: 8, right: 8, width: 18, height: 18, background: t.color, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={11} color="#FDFDFD" />
                  </span>
                )}
                <div style={{ color: t.color, fontSize: 15, fontWeight: 400, lineHeight: 1.2 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: "#8F8F8F", marginTop: 8, display: "flex", justifyContent: "space-between" }}>
                  <span>{t.country}</span>
                  <span className="font-display">P{t.standing}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Players */}
      {selectedTeam && (
        <div style={{ marginTop: 56, animation: "fade-in 0.5s var(--ease-out)" }}>
          <div className="eyebrow" style={{ textAlign: "center", marginBottom: 24 }}>STEP 2 · ASSIGN PLAYERS — {selectedTeam.name}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="players-grid">
            {[
              { p: player1, setP: setPlayer1, label: "PLAYER 1", color: "#E3001E" },
              { p: player2, setP: setPlayer2, label: "PLAYER 2", color: "#0071E3", excludeDriver: player1.driver },
            ].map((cfg, idx) => (
              <div key={idx} className="glass" style={{ padding: 24 }}>
                <div className="eyebrow" style={{ color: cfg.color }}>{cfg.label}</div>
                <input
                  className="input-base"
                  style={{ marginTop: 12 }}
                  placeholder="Name"
                  value={cfg.p.name}
                  onChange={(e) => cfg.setP({ ...cfg.p, name: e.target.value })}
                  onFocus={(e) => (e.target.style.borderColor = cfg.color)}
                  onBlur={(e) => (e.target.style.borderColor = "transparent")}
                />
                <select
                  className="input-base"
                  style={{ marginTop: 12 }}
                  value={cfg.p.driver}
                  onChange={(e) => cfg.setP({ ...cfg.p, driver: e.target.value })}
                >
                  <option value="">Select driver</option>
                  {selectedTeam.drivers.filter((d) => d !== cfg.excludeDriver).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {conflict && (
            <div className="pill" style={{ background: "#E3001E", color: "#FDFDFD", borderColor: "transparent", marginTop: 16, display: "block", maxWidth: 360, marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
              Players must select different drivers
            </div>
          )}
        </div>
      )}

      {/* Step 3: Proceed */}
      {ready && (
        <div className="glass" style={{
          marginTop: 56, padding: 32, borderTop: `3px solid ${selectedTeam!.color}`, animation: "fade-in 0.5s var(--ease-out)",
        }}>
          <div className="eyebrow">STEP 3 · CONFIRM</div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 400, color: selectedTeam!.color }}>{selectedTeam!.name}</div>
              <div style={{ fontSize: 14, color: "#8F8F8F", marginTop: 6 }}>
                P1 {player1.name} · {player1.driver}  ·  P2 {player2.name} · {player2.driver}
              </div>
            </div>
            <button className="btn-primary" onClick={() => nav({ to: "/auth" })}>
              Proceed to Authorization <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 40, textAlign: "center" }}>
        <Link to="/" style={{ fontSize: 13, color: "#8F8F8F" }}>← Back to landing</Link>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @media (max-width: 768px) {
          .teams-select-grid { grid-template-columns: 1fr 1fr !important; }
          .players-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
