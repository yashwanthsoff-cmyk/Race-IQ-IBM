import { useEffect, useState } from "react";
import { F1_FACTS } from "@/utils/constants";
import { useGlobal } from "@/context/GlobalContext";

export default function DidYouKnow() {
  const { fanMode } = useGlobal();
  const [visible, setVisible] = useState(false);
  const [fact, setFact] = useState(F1_FACTS[0]);

  useEffect(() => {
    if (!fanMode) return;
    const showOne = () => {
      setFact(F1_FACTS[Math.floor(Math.random() * F1_FACTS.length)]);
      setVisible(true);
      setTimeout(() => setVisible(false), 8000);
    };
    const t = setTimeout(showOne, 5000);
    const i = setInterval(showOne, 120000);
    return () => { clearTimeout(t); clearInterval(i); };
  }, [fanMode]);

  if (!fanMode || !visible) return null;
  return (
    <div className="glass animate-slide-down" style={{
      position: "fixed", left: 24, bottom: 24, maxWidth: 340, padding: "16px 20px", zIndex: 1000,
    }}>
      <div className="eyebrow" style={{ color: "#E3001E" }}>💡 Did you know?</div>
      <div style={{ fontSize: 15, marginTop: 6, lineHeight: 1.5 }}>{fact}</div>
    </div>
  );
}
