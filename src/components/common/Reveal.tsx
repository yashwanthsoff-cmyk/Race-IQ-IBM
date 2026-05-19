import { useEffect, useRef } from "react";

export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    el.classList.add("reveal");
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add("visible");
          obs.unobserve(e.target);
        }
      }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

type Props = React.HTMLAttributes<HTMLDivElement> & { delay?: number };
export default function Reveal({ delay = 0, style, children, ...rest }: Props) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms`, ...style }} {...rest}>
      {children}
    </div>
  );
}
