import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useGlobal, TEAMS } from "@/context/GlobalContext";
import Reveal from "@/components/common/Reveal";
import { useEffect, useState } from "react";
import { ArrowRight, Play } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RaceIQ — Real-time AI Race Intelligence" },
      { name: "description", content: "AI race strategy copilot built for Formula 1. Predictive pit windows, weather impact, and rival modeling in real time." },
      { property: "og:title", content: "RaceIQ — Real-time AI Race Intelligence" },
      { property: "og:description", content: "AI race strategy copilot for Formula 1." },
    ],
  }),
  component: Landing,
});

function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now(); const dur = 2000;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(eased * end));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end]);
  return <span>{v}{suffix}</span>;
}

function Landing() {
  const { setSelectedTeam } = useGlobal();
  const nav = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pickTeam = (t: typeof TEAMS[number]) => { setSelectedTeam(t); nav({ to: "/select" }); };

  return (
    <>
      <nav style={{
        position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 100,
        display: "flex", alignItems: "center", gap: 24,
        padding: scrolled ? "8px 20px" : "12px 28px",
        background: "rgba(253,253,253,0.72)", backdropFilter: "blur(24px)",
        border: "1px solid rgba(15,16,18,0.08)", borderRadius: 40,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
        transition: "padding 0.4s var(--ease-out)",
      }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 400, letterSpacing: "-0.02em" }}>RACEIQ</span>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E3001E" }} />
        </Link>
        <span style={{ width: 1, height: 16, background: "rgba(15,16,18,0.1)" }} />
        <a href="#features" style={{ fontSize: 14 }}>Features</a>
        <a href="#teams" style={{ fontSize: 14 }}>Teams</a>
        <a href="#about" style={{ fontSize: 14 }}>About</a>
        <Link to="/select" className="btn-primary" style={{ padding: "8px 18px", fontSize: 13 }}>
          Enter <ArrowRight size={14} />
        </Link>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: "100vh", maxWidth: 1200, margin: "0 auto", padding: "180px 24px 100px", position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }} className="hero-grid">
          <div>
            <span className="pill" style={{ animation: "fade-in 1s var(--ease-out)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0071E3" }} className="animate-pulse-soft" />
              AI RACE STRATEGY COPILOT
            </span>
            <h1 style={{
              fontSize: "clamp(60px, 9vw, 120px)", fontWeight: 300, letterSpacing: "-0.04em",
              lineHeight: 0.95, marginTop: 24,
            }}>
              Real-time race<br />intelligence
            </h1>
            <p style={{ fontSize: 17, fontWeight: 300, color: "#8F8F8F", lineHeight: 1.7, marginTop: 24, maxWidth: 480 }}>
              AI-powered decisions for engineers, drivers, and teams. Predictive pit windows, rival modeling, weather impact — under 50 milliseconds.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 36 }}>
              <Link to="/select" className="btn-primary">Enter the Pit Lane <ArrowRight size={16} /></Link>
              <a href="#features" className="btn-ghost"><Play size={14} /> Watch Demo</a>
            </div>
          </div>

          <div style={{ position: "relative", minHeight: 460 }}>
            <div className="glass animate-float" style={{
              padding: 28, position: "absolute", top: 40, left: 0, right: 0,
              animation: "float 6s ease-in-out infinite, fade-in 1s var(--ease-out)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00A651" }} className="animate-pulse-soft" />
                  LIVE TELEMETRY
                </div>
                <span className="pill font-display" style={{ fontSize: 10 }}>12ms latency</span>
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "center", height: 64, marginTop: 20 }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} style={{
                    flex: 1, height: "100%",
                    background: i === 5 || i === 6 ? "#E3001E" : "rgba(15,16,18,0.25)",
                    borderRadius: 2, transformOrigin: "center",
                    animation: `wave 1.4s ${i * 0.07}s ease-in-out infinite`,
                  }} />
                ))}
              </div>
              <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", fontSize: 12, color: "#8F8F8F" }}>
                <span>SPEED <strong className="font-display" style={{ color: "#0F1012", marginLeft: 6 }}>312</strong> km/h</span>
                <span>RPM <strong className="font-display" style={{ color: "#0F1012", marginLeft: 6 }}>13,420</strong></span>
              </div>
            </div>

            <div className="glass animate-float" style={{
              position: "absolute", top: 0, right: 0, padding: "12px 18px",
              animation: "float 6s 0.8s ease-in-out infinite", fontSize: 13,
            }}>
              <span className="eyebrow">LAP</span>
              <div className="font-display" style={{ fontSize: 18 }}>34/57 · P3</div>
            </div>

            <div className="glass" style={{
              position: "absolute", bottom: 0, left: 20, padding: "10px 16px",
              background: "#E3001E", color: "#FDFDFD", border: "none",
              animation: "float 6s 1.6s ease-in-out infinite", borderRadius: 40,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
            }}>
              <span className="font-display" style={{ fontSize: 11, letterSpacing: "0.1em" }}>PIT WINDOW · LAP 36–40</span>
            </div>
          </div>
        </div>
      </section>

      {/* About F1 */}
      <Reveal id="about" style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px" }}>
        <span className="eyebrow">ABOUT FORMULA 1</span>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "#0F1012", marginTop: 16, maxWidth: 760 }}>
          Formula 1 is the pinnacle of motorsport — twenty drivers, ten teams, and twenty-four races where every millisecond is engineered. RaceIQ surfaces the decisions that win seasons.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, marginTop: 60 }}>
          {[
            { n: 20, l: "Drivers" },
            { n: 10, l: "Teams" },
            { n: 24, l: "Race Calendar" },
          ].map((s, i) => (
            <div key={s.l} style={{ padding: "0 32px", borderLeft: i ? "1px solid rgba(15,16,18,0.08)" : "none" }}>
              <div className="font-display" style={{ fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 400 }}>
                <CountUp end={s.n} />
              </div>
              <div className="eyebrow" style={{ marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Teams marquee */}
      <div style={{
        background: "#F2F2F4", borderTop: "1px solid rgba(15,16,18,0.08)",
        borderBottom: "1px solid rgba(15,16,18,0.08)", overflow: "hidden", padding: "20px 0", margin: "60px 0",
      }}>
        <div className="animate-marquee" style={{ display: "flex", gap: 48, whiteSpace: "nowrap", width: "max-content" }}>
          {[...TEAMS, ...TEAMS].map((t, i) => (
            <span key={i} style={{ fontSize: 24, fontWeight: 400, color: t.color, letterSpacing: "-0.02em" }}>
              {t.name}
            </span>
          ))}
        </div>
      </div>

      {/* Teams grid */}
      <section id="teams" style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px 140px" }}>
        <Reveal>
          <span className="eyebrow">CONSTRUCTORS</span>
          <h2 style={{ fontSize: "clamp(36px, 5vw, 72px)", fontWeight: 300, letterSpacing: "-0.035em", marginTop: 12 }}>
            The grid<span style={{ color: "#8F8F8F" }}>.</span>
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginTop: 60 }} className="teams-grid">
          {TEAMS.map((t, i) => (
            <Reveal key={t.id} delay={i * 60}>
              <TeamCard team={t} onSelect={() => pickTeam(t)} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(15,16,18,0.08)", padding: "40px 24px", maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#8F8F8F" }}>
        <span>© 2024 RaceIQ — AI race strategy</span>
        <Link to="/select" style={{ fontSize: 13 }}>Enter the pit lane →</Link>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .teams-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>
    </>
  );
}

function TeamCard({ team, onSelect }: { team: typeof TEAMS[number]; onSelect: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="glass"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: 28, borderLeft: `3px solid ${team.color}`,
        boxShadow: hover ? `0 0 0 1px ${team.color}, inset 0 1px 0 rgba(255,255,255,0.6)` : undefined,
        transform: hover ? "scale(1.01)" : "scale(1)",
        transition: "all 0.4s var(--ease-out)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ color: team.color, fontSize: 22, fontWeight: 400, letterSpacing: "-0.02em" }}>{team.name}</h3>
          <div style={{ marginTop: 6, color: "#8F8F8F", fontWeight: 300, fontSize: 14 }}>
            {team.drivers.join(" · ")}
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 14 }}>
          <span style={{ fontSize: 20 }}>{team.country}</span>
          <div className="font-display eyebrow" style={{ marginTop: 4 }}>P{team.standing}</div>
        </div>
      </div>
      <p style={{ marginTop: 20, fontSize: 15, color: "#0F1012", fontWeight: 300, lineHeight: 1.6 }}>
        {team.description}
      </p>
      <button onClick={onSelect} className="btn-ghost" style={{ marginTop: 24, fontSize: 13, padding: "10px 20px" }}>
        SELECT TEAM <ArrowRight size={13} />
      </button>
    </div>
  );
}
