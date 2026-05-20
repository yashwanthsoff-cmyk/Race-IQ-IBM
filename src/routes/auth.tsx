import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useGlobal } from "@/context/GlobalContext";
import { useState } from "react";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "Authorization — RaceIQ" }],
  }),
  component: AuthGate,
});

function AuthGate() {
  const { selectedTeam, setAuthorized } = useGlobal();
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [ok, setOk] = useState(false);

  const team = selectedTeam;
  const color = team?.color || "#0F1012";

  if (typeof window !== "undefined" && !team) {
    // Soft redirect
    setTimeout(() => nav({ to: "/select" }), 0);
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === "PITLANE2024") {
      setOk(true); setErr(false);
      setTimeout(() => { setAuthorized(true); nav({ to: "/dashboard" }); }, 800);
    } else {
      setErr(true);
      setTimeout(() => setErr(false), 500);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="glass" style={{
        width: "min(480px, 100%)", padding: 36, position: "relative", overflow: "hidden",
        transform: ok ? "scale(1.01)" : "scale(1)", transition: "transform 0.5s var(--ease-out)",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: color }} />

        <div className="eyebrow">RACE AUTHORIZATION REQUIRED</div>
        <h1 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 300, letterSpacing: "-0.02em", marginTop: 12 }}>
          Enter session access code
        </h1>
        <p style={{ fontSize: 17, color: "#8F8F8F", marginTop: 12 }}>
          Issued by your Race Engineer.
        </p>

        {team && (
          <div className="pill" style={{ marginTop: 20, background: color, color: "#FDFDFD", borderColor: "transparent" }}>
            <Lock size={11} /> {team.name}
          </div>
        )}

        <form onSubmit={submit} style={{ marginTop: 28 }}>
          <input
            type="password"
            className={`input-base ${err ? "animate-shake" : ""}`}
            placeholder="Access code"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            style={{
              border: err ? "1px solid #E3001E" : "1px solid transparent",
              fontFamily: "Inter", letterSpacing: "0.3em",
            }}
            onFocus={(e) => (e.target.style.borderColor = color)}
            onBlur={(e) => (e.target.style.borderColor = err ? "#E3001E" : "transparent")}
            autoFocus
          />
          {err && <div style={{ marginTop: 10, color: "#E3001E", fontSize: 13 }}>Invalid code. Hint: PITLANE2024</div>}
          <button type="submit" className="btn-primary" style={{ marginTop: 16, width: "100%" }}>
            Authorize and Enter
          </button>
        </form>
      </div>
    </div>
  );
}
