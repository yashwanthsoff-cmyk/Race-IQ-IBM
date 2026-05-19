import { useGlobal } from "@/context/GlobalContext";
import { TOTAL_LAPS } from "@/utils/constants";
import { toast } from "sonner";

export default function TopNavbar() {
  const { raceSession, currentLap, selectedTeam, player1, player2, fanMode, setFanMode, voiceMode, setVoiceMode } = useGlobal();

  const sessionColor =
    raceSession === "RACE" ? "#00A651" : raceSession === "QUALIFYING" ? "#F5A623" : "#0071E3";

  const toggleFan = () => {
    const next = !fanMode;
    setFanMode(next);
    if (next) toast.success("FAN MODE ACTIVE — Welcome to the race!");
  };

  return (
    <header style={{
      position: "fixed", top: 0, left: 240, right: 0, height: 56, zIndex: 40,
      background: "rgba(253,253,253,0.95)", backdropFilter: "blur(24px)",
      borderBottom: "1px solid rgba(15,16,18,0.08)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span className="pill" style={{ background: sessionColor, color: "#FDFDFD", borderColor: "transparent" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FDFDFD" }} /> {raceSession}
        </span>
        <span className="font-display" style={{ fontSize: 13, color: "#0F1012" }}>
          LAP {currentLap}/{TOTAL_LAPS}
        </span>
      </div>

      <div style={{ fontSize: 15, fontWeight: 400, letterSpacing: "-0.01em" }}>
        MONACO GRAND PRIX 2024
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={toggleFan} className="pill" style={{
          background: fanMode ? "#E3001E" : "var(--bg-surface)", color: fanMode ? "#FDFDFD" : "#0F1012",
          borderColor: fanMode ? "transparent" : undefined, cursor: "pointer",
        }}>FAN MODE {fanMode ? "ON" : "OFF"}</button>
        <button onClick={() => setVoiceMode(!voiceMode)} className="pill" style={{
          background: voiceMode ? "#0071E3" : "var(--bg-surface)", color: voiceMode ? "#FDFDFD" : "#0F1012",
          borderColor: voiceMode ? "transparent" : undefined, cursor: "pointer",
        }}>VOICE {voiceMode ? "ON" : "OFF"}</button>
        {selectedTeam && player1.name && (
          <span className="pill" style={{ background: selectedTeam.color, color: "#FDFDFD", borderColor: "transparent" }}>
            P1 {player1.name}
          </span>
        )}
        {selectedTeam && player2.name && (
          <span className="pill" style={{ background: selectedTeam.color, color: "#FDFDFD", borderColor: "transparent", opacity: 0.85 }}>
            P2 {player2.name}
          </span>
        )}
      </div>
    </header>
  );
}
