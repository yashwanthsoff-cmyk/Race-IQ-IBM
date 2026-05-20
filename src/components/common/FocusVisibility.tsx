import { useEffect } from "react";

/**
 * Tracks cursor position and updates each .glass element with proximity-based
 * CSS variables that drive a "focus visibility" effect:
 *   --focus  (0..1)  — 1 when cursor is over/very near the card, 0 when far
 *   --mx,--my (px)   — cursor position relative to the card (for spotlight)
 *
 * The CSS in styles.css consumes these to reduce blur/fog and add a radial
 * spotlight on the hovered/near card.
 */
export default function FocusVisibility() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;

    // Proximity falloff in pixels — within NEAR => focus=1, beyond FAR => 0
    const NEAR = 0;
    const FAR = 260;

    let mx = -9999, my = -9999;
    let raf = 0;
    let pending = false;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!pending) {
        pending = true;
        raf = requestAnimationFrame(update);
      }
    };

    const update = () => {
      pending = false;
      const cards = document.querySelectorAll<HTMLElement>(".glass");
      for (let i = 0; i < cards.length; i++) {
        const el = cards[i];
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;

        // Distance from cursor to nearest edge of the card (0 if inside)
        const dx = Math.max(r.left - mx, 0, mx - r.right);
        const dy = Math.max(r.top - my, 0, my - r.bottom);
        const dist = Math.hypot(dx, dy);

        let focus = 0;
        if (dist <= NEAR) focus = 1;
        else if (dist >= FAR) focus = 0;
        else focus = 1 - (dist - NEAR) / (FAR - NEAR);
        // Ease out
        focus = focus * focus * (3 - 2 * focus);

        el.style.setProperty("--focus", focus.toFixed(3));
        el.style.setProperty("--mx", `${mx - r.left}px`);
        el.style.setProperty("--my", `${my - r.top}px`);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    // Initial pass after mount so cards aren't stuck at max fog
    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return null;
}
