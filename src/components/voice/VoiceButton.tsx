import { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";
import { useGlobal } from "@/context/GlobalContext";
import { callGemini, GEMINI_MODELS } from "@/services/GeminiAPI";
import { toast } from "sonner";

type State = "idle" | "listening" | "processing" | "speaking";

export default function VoiceButton() {
  const { voiceMode, currentLap, telemetry, fanMode } = useGlobal();
  const [state, setState] = useState<State>("idle");
  const [transcript, setTranscript] = useState("");
  const recRef = useRef<any>(null);

  useEffect(() => {
    if (!voiceMode) {
      try { recRef.current?.stop?.(); } catch {}
      setState("idle"); setTranscript("");
    }
  }, [voiceMode]);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05; u.pitch = 1;
    setState("speaking");
    u.onend = () => { setState("idle"); setTimeout(() => setTranscript(""), 4000); };
    window.speechSynthesis.speak(u);
  };

  const handleClick = async () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Voice recognition not supported in this browser"); return; }
    if (state === "listening") { try { recRef.current?.stop?.(); } catch {} return; }

    const rec = new SR();
    recRef.current = rec;
    rec.lang = "en-US"; rec.interimResults = true; rec.continuous = false;
    setState("listening"); setTranscript("Listening...");

    rec.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join(" ");
      setTranscript(t);
    };
    rec.onerror = () => { setState("idle"); setTranscript(""); };
    rec.onend = async () => {
      const final = (transcript || "").trim();
      if (!final || final === "Listening...") { setState("idle"); return; }
      setState("processing");
      try {
        const sysBase = `F1 race engineer voice AI. Concise spoken responses under 50 words. Lap ${currentLap}/57, ${telemetry.compound}, tire wear FL ${telemetry.tireWear.FL.toFixed(0)}%, fuel ${telemetry.fuelKg.toFixed(1)}kg.`;
        const sys = fanMode ? sysBase + " Respond in fun, simple, enthusiastic language. No jargon." : sysBase;
        const reply = await callGemini({
          model: GEMINI_MODELS.fast, systemPrompt: sys, userMessage: final, maxTokens: 200,
        });
        setTranscript(reply);
        speak(reply);
      } catch (e: any) {
        toast.error(e.message || "Voice request failed");
        setState("idle"); setTranscript("");
      }
    };
    rec.start();
  };

  if (!voiceMode) return null;

  const borderColor = state === "listening" ? "#E3001E" : state === "processing" ? "#0071E3" : state === "speaking" ? "#00A651" : "rgba(15,16,18,0.08)";

  return (
    <>
      {transcript && (
        <div className="glass" style={{
          position: "fixed", right: 24, bottom: 100, maxWidth: 320, padding: "12px 16px",
          fontSize: 14, zIndex: 9998, borderRadius: 16,
        }}>
          {transcript}
        </div>
      )}
      <button
        onClick={handleClick}
        aria-label="Voice assistant"
        className={state === "listening" ? "animate-pulse-ring" : ""}
        style={{
          position: "fixed", right: 24, bottom: 24, width: 64, height: 64,
          background: "rgba(253,253,253,0.95)", backdropFilter: "blur(24px)",
          border: `1.5px solid ${borderColor}`, borderRadius: "50%",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, transition: "border-color 0.3s var(--ease-out)",
        }}
      >
        {state === "speaking" ? (
          <div style={{ display: "flex", gap: 3, alignItems: "center", height: 24 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} style={{ width: 3, height: 16, background: "#00A651", borderRadius: 2, animation: `wave 1.4s ${i * 0.07}s ease-in-out infinite`, transformOrigin: "center" }} />
            ))}
          </div>
        ) : state === "processing" ? (
          <div className="animate-spin-slow" style={{ width: 24, height: 24, border: "2px solid #0071E3", borderTopColor: "transparent", borderRadius: "50%" }} />
        ) : (
          <Mic size={22} color={state === "listening" ? "#E3001E" : "#0F1012"} />
        )}
      </button>
    </>
  );
}
