import { Link, useLocation } from "@tanstack/react-router";
import { useGlobal } from "@/context/GlobalContext";
import {
  LayoutDashboard, Brain, BarChart3, CloudRain, FlaskConical, Activity,
  PieChart, Users, Lightbulb, GraduationCap, Layers, Settings,
} from "lucide-react";

const ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/strategy", label: "AI Strategy", icon: Brain },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/weather", label: "Weather", icon: CloudRain },
  { to: "/simulator", label: "Simulator", icon: FlaskConical },
  { to: "/anomaly", label: "Anomaly", icon: Activity },
  { to: "/probability", label: "Win Probability", icon: PieChart },
  { to: "/competitors", label: "Competitors", icon: Users },
  { to: "/explain", label: "Explainable AI", icon: Lightbulb },
  { to: "/learning", label: "Post-Race Learning", icon: GraduationCap },
  { to: "/multi-team", label: "Multi-Team", icon: Layers },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const { selectedTeam } = useGlobal();
  const loc = useLocation();

  return (
    <aside style={{
      position: "fixed", left: 0, top: 0, width: 240, height: "100vh",
      background: "rgba(253,253,253,0.95)", backdropFilter: "blur(24px)",
      borderRight: "1px solid rgba(15,16,18,0.08)", zIndex: 50,
      padding: "20px 16px", display: "flex", flexDirection: "column", overflowY: "auto",
    }} className="no-scrollbar">
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, padding: "0 8px" }}>
        <span style={{ fontSize: 20, fontWeight: 400, letterSpacing: "-0.02em" }}>RACEIQ</span>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E3001E" }} />
      </Link>

      {selectedTeam && (
        <div style={{ marginBottom: 24, padding: "10px 12px", borderRadius: 12, background: "var(--bg-surface)" }}>
          <div className="eyebrow">Team</div>
          <div style={{ color: selectedTeam.color, fontWeight: 500, fontSize: 14, marginTop: 4 }}>{selectedTeam.name}</div>
          <div className="pill" style={{ marginTop: 8, fontSize: 10, padding: "4px 10px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: selectedTeam.color }} /> P{selectedTeam.standing}
          </div>
        </div>
      )}

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {ITEMS.map((it) => {
          const active = loc.pathname === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to} to={it.to}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 10, fontSize: 14,
                fontWeight: active ? 400 : 300,
                color: active ? "#0F1012" : "#8F8F8F",
                background: active ? "#F2F2F4" : "transparent",
                borderLeft: active ? "2px solid #E3001E" : "2px solid transparent",
                transition: "all 0.3s var(--ease-out)",
              }}
            >
              <Icon size={16} strokeWidth={1.5} />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>
      <div style={{ marginTop: "auto", paddingTop: 16, fontSize: 11, color: "#8F8F8F", textAlign: "center" }}>
        © RaceIQ 2024
      </div>
    </aside>
  );
}
