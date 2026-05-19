import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      }
    };
    const tick = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive = t.closest("a,button,input,select,textarea,[role='button'],[data-interactive]");
      if (ringRef.current) {
        ringRef.current.style.width = interactive ? "56px" : "36px";
        ringRef.current.style.height = interactive ? "56px" : "36px";
        ringRef.current.style.opacity = interactive ? "0.5" : "1";
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} aria-hidden style={{
        width: 10, height: 10, background: "#0F1012", borderRadius: "50%",
        mixBlendMode: "difference", position: "fixed", left: 0, top: 0,
        pointerEvents: "none", zIndex: 99999,
      }} />
      <div ref={ringRef} aria-hidden style={{
        width: 36, height: 36, border: "1px solid rgba(15,16,18,0.25)", borderRadius: "50%",
        position: "fixed", left: 0, top: 0, pointerEvents: "none", zIndex: 99998,
        transition: "width 0.3s, height 0.3s, opacity 0.3s",
      }} />
    </>
  );
}
