import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";

/*
 * Shows the names we gave buttons and links, so a sighted reader can see the
 * difference a screen reader or a speech command would meet (ACT-001b, TXT-003).
 *
 * It reads only what the example itself sets: aria-label, then aria-labelledby,
 * then the text inside the element. It does not ask the browser for the
 * computed name and is not a screen reader. It is hidden from assistive
 * technology, which already hears the real name.
 *
 * For the examples only. It is not a component of the system.
 */

const NAMED = "button, a[href], [role='button']";

/** The name the example set on an element. */
export function nameOf(el: Element): string {
  const label = el.getAttribute("aria-label");
  if (label) return label.trim();
  const ids = el.getAttribute("aria-labelledby");
  if (ids) {
    const text = ids
      .split(/\s+/)
      .map((id) => el.ownerDocument.getElementById(id)?.textContent ?? "")
      .join(" ");
    if (text.trim()) return text.replace(/\s+/g, " ").trim();
  }
  return (el.textContent ?? "").replace(/\s+/g, " ").trim();
}

/** Wraps a scene and shows the name of the button or link under focus or the pointer. */
export function NameReadout({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");

  useLayoutEffect(() => {
    const first = ref.current?.querySelector(NAMED);
    if (first) setName(nameOf(first));
  }, []);

  const show = (target: EventTarget) => {
    const el = target instanceof Element ? target.closest(NAMED) : null;
    if (el && ref.current?.contains(el)) setName(nameOf(el));
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <div ref={ref} onFocusCapture={(e) => show(e.target)} onPointerOverCapture={(e) => show(e.target)}>
        {children}
      </div>
      <p
        aria-hidden="true"
        className="m-0 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground"
      >
        Accessible name: <span className="font-medium text-foreground">“{name}”</span>
      </p>
    </div>
  );
}

/** Lists the names of every link inside a scene, as a links list would. */
export function LinkNames({ scope, show }: { scope: RefObject<HTMLElement | null>; show: boolean }) {
  const [names, setNames] = useState<string[]>([]);

  useLayoutEffect(() => {
    if (!show || !scope.current) return;
    setNames([...scope.current.querySelectorAll("a[href]")].map(nameOf));
  }, [scope, show]);

  if (!show) return null;
  return (
    <div
      aria-hidden="true"
      className="w-full rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground"
    >
      <p className="m-0">Links in this scene, by name:</p>
      <ol className="m-0 mt-1 list-decimal pl-5 text-foreground">
        {names.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ol>
    </div>
  );
}
