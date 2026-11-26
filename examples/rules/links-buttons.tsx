import { createContext, useContext, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

import { Outcome, useSay } from "./dialog";
import { nameOf } from "./readout";

/*
 * Helpers for ACT-009, ACT-009a and ACT-009b: what a control is called in
 * code, and where a link would go.
 *
 *   - Scene wraps one example. A plain click on a real link is stopped, so
 *     Storybook never leaves, and a line under the scene says "Would go to
 *     /billing". The link keeps its real href: a click with Ctrl, Cmd or
 *     Shift, a middle click and "Copy link address" still work as they do on
 *     any page. A jump to "#something" really moves, inside the scene.
 *   - RoleList lists what a screen reader's lists of links and buttons would
 *     hold for the scene: a link needs an <a> with an href, a button a
 *     <button>, or an explicit role. A click handler on a div or span adds
 *     nothing to it.
 *
 * For the examples only. Not components of the system.
 */

/**
 * Stop a plain click on a real link so the example never leaves Storybook, and
 * say whether it did. A click with Ctrl, Cmd, Shift or Alt, a middle click and
 * "Copy link address" are left alone, as on any page. Returns false when the
 * click was not stopped.
 */
export function stopPlainClick(e: MouseEvent<Element>): boolean {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  e.preventDefault();
  return true;
}

const SceneContext = createContext<(text: string) => void>(() => {});

/** Say something in the scene's status line. */
export const useSceneSay = () => useContext(SceneContext);

type Found = { role: "link" | "button"; name: string; state: string };

function roleOf(el: Element): "link" | "button" | null {
  const explicit = el.getAttribute("role");
  if (explicit === "link" || explicit === "button") return explicit;
  if (el instanceof HTMLButtonElement) return "button";
  if (el instanceof HTMLAnchorElement && el.hasAttribute("href")) return "link";
  return null;
}

function stateOf(el: Element): string {
  const parts: string[] = [];
  const expanded = el.getAttribute("aria-expanded");
  if (expanded) parts.push(expanded === "true" ? "expanded" : "collapsed");
  const pressed = el.getAttribute("aria-pressed");
  if (pressed) parts.push(pressed === "true" ? "pressed" : "not pressed");
  if (el.getAttribute("aria-haspopup") === "dialog") parts.push("opens a dialog");
  if (el.getAttribute("aria-current")) parts.push("current page");
  return parts.join(", ");
}

/** What a screen reader would list in the scene, read from the markup. */
export function RoleList({ scope, children }: { scope: React.RefObject<HTMLElement | null>; children?: ReactNode }) {
  const [found, setFound] = useState<Found[]>([]);

  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    const read = () => {
      const next: Found[] = [];
      for (const el of root.querySelectorAll("a, button, [role]")) {
        const role = roleOf(el);
        if (role) next.push({ role, name: nameOf(el), state: stateOf(el) });
      }
      setFound((old) => (JSON.stringify(old) === JSON.stringify(next) ? old : next));
    };
    read();
    const watch = new MutationObserver(read);
    watch.observe(root, { subtree: true, childList: true, attributes: true, characterData: true });
    return () => watch.disconnect();
  }, [scope]);

  return (
    <div aria-hidden="true" className="w-full rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
      <p className="m-0">{children ?? "In the list of links and buttons:"}</p>
      {found.length === 0 ? (
        <p className="m-0 mt-1 font-medium text-foreground">Nothing. This scene has no link and no button.</p>
      ) : (
        <ul className="m-0 mt-1 list-none p-0 text-foreground">
          {found.map((f, i) => (
            <li key={i}>
              <span className="font-mono text-xs uppercase text-muted-foreground">{f.role}</span> <span className="font-medium">“{f.name}”</span>
              {f.state && <span className="text-muted-foreground"> ({f.state})</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * One example: the scene, the list of roles and a status line. Plain clicks on
 * links are stopped and reported, so the frame is never left for real.
 */
export function Scene({
  children,
  listLabel,
  showRoles = true,
  className = "",
}: {
  children: ReactNode;
  listLabel?: ReactNode;
  showRoles?: boolean;
  className?: string;
}) {
  const scope = useRef<HTMLDivElement>(null);
  const [said, say] = useSay();

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
    if (!a || !scope.current?.contains(a)) return;
    const href = a.getAttribute("href") ?? "";
    // Every plain click is stopped, downloads and other programs included, so the frame is never left.
    if (!stopPlainClick(e)) return;
    if (href.startsWith("#") && href.length > 1) {
      const target = scope.current.ownerDocument.getElementById(href.slice(1));
      if (target) {
        target.focus();
        target.scrollIntoView({ block: "nearest" });
        say(`Moved to “${nameOf(target)}” on this page.`);
        return;
      }
    }
    say(`Would go to ${href}`);
  };

  return (
    <SceneContext.Provider value={say}>
      <div className={`flex w-full max-w-sm flex-col gap-3 ${className}`}>
        {/* The click handler only stops links from leaving Storybook; it is not a control. */}
        <div ref={scope} onClick={onClick} className="rounded-lg border border-border bg-background p-4">
          {children}
        </div>
        <Outcome>{said}</Outcome>
        {showRoles && <RoleList scope={scope}>{listLabel}</RoleList>}
      </div>
    </SceneContext.Provider>
  );
}
