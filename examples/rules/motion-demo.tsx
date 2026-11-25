import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Switch } from "@blackwoodblake/justified-shadcn/switch";
import { useEffect, useState, type ReactNode } from "react";

/*
 * Helpers for the motion examples (VIS-005, VIS-006, VIS-007).
 *
 *   - MotionStyles holds the keyframes the examples use. Every class starts
 *     with "mdemo-". A scene that is held still carries the class
 *     "mdemo-reduced"; that, or the browser's own setting, swaps each movement
 *     for a fade or for nothing.
 *   - useReducedMotion reads the browser's prefers-reduced-motion with a
 *     listener, so a change takes effect without a reload.
 *   - ReducedSwitch is a switch that simulates the setting inside one
 *     example. The real setting always wins: when the browser asks for less
 *     motion, the switch is on and cannot be turned off.
 *   - replay restarts a CSS animation on an element that stays in place, so
 *     focus is not lost.
 *
 * For the examples only. They are not components of the system.
 */

const css = `
@keyframes mdemo-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes mdemo-shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(8px); } 60% { transform: translateX(-6px); } 80% { transform: translateX(6px); } }
@keyframes mdemo-bounce { 0%, 100% { transform: translateY(0); } 30% { transform: translateY(-10px); } 60% { transform: translateY(0); } 80% { transform: translateY(-4px); } }
@keyframes mdemo-slide { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes mdemo-slide-zoom { from { transform: translateX(100%) scale(0.85); opacity: 0; } to { transform: translateX(0) scale(1); opacity: 1; } }
@keyframes mdemo-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes mdemo-fade-in-quote { from { opacity: 0; } to { opacity: 1; } }

.mdemo-marquee { animation: mdemo-marquee 24s linear infinite; }
.mdemo-marquee[data-paused="true"] { animation-play-state: paused; }
.mdemo-shake { animation: mdemo-shake 450ms ease-in-out; }
.mdemo-bounce { animation: mdemo-bounce 600ms ease-out; }
.mdemo-slide { animation: mdemo-slide 500ms var(--motion-ease-enter, ease-out) both; }
.mdemo-slide-zoom { animation: mdemo-slide-zoom 500ms var(--motion-ease-enter, ease-out) both; }
.mdemo-late { opacity: 0; animation: mdemo-fade 400ms ease-out forwards; }
.mdemo-quote { animation: mdemo-fade-in-quote 400ms ease-out; }

/* The reduced form: the marquee stands still, a slide becomes a fade, shakes and bounces stop. */
.mdemo-reduced .mdemo-marquee { animation: none; }
.mdemo-reduced .mdemo-shake, .mdemo-reduced .mdemo-bounce { animation: none; }
.mdemo-reduced .mdemo-slide { animation: mdemo-fade 250ms ease-out both; }
.mdemo-reduced .mdemo-late { animation: none; }
@media (prefers-reduced-motion: reduce) {
  .mdemo-marquee, .mdemo-shake, .mdemo-bounce { animation: none; }
  .mdemo-slide { animation: mdemo-fade 250ms ease-out both; }
  .mdemo-late { animation: none; }
}
`;

export function MotionStyles() {
  return <style>{css}</style>;
}

/** The browser's own setting, kept up to date. */
export function useSystemReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(query.matches);
    on();
    query.addEventListener("change", on);
    return () => query.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** Reduced motion for one example: the browser's setting or the example's own switch. */
export function useExampleMotion() {
  const system = useSystemReducedMotion();
  const [simulated, setSimulated] = useState(false);
  return { system, simulated, setSimulated, reduced: system || simulated };
}

export function ReducedSwitch({
  system,
  simulated,
  onChange,
}: {
  system: boolean;
  simulated: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <Field
      layout="inline"
      label="Reduced motion"
      hint={system ? "Set by your browser, so it stays on." : "Simulated in this example."}
    >
      <Switch checked={system || simulated} disabled={system} onCheckedChange={onChange} />
    </Field>
  );
}

/** Starts a CSS animation again on an element that stays where it is. */
export function replay(el: HTMLElement | null, className: string) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

/** A small scene wrapper that carries the reduced class. */
export function MotionScene({
  reduced,
  children,
  className,
}: {
  reduced: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${reduced ? "mdemo-reduced " : ""}${className ?? ""}`}>
      <MotionStyles />
      {children}
    </div>
  );
}
