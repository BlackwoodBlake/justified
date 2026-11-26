import { useState, type FocusEvent, type KeyboardEvent, type ReactNode, type Ref } from "react";

/*
 * Helpers for the keyboard shortcut examples (KBD-003, KBD-003a, KBD-003b).
 *
 * Many examples share one page, so no shortcut here listens on the document or
 * the window. Each example is a small "page" drawn inside its frame: a region
 * that can take focus and hears the keys pressed while focus is in it. Inside
 * the frame it acts like a whole page: its handler hears every key from every
 * control in it. A line under the region says whether keys reach it now.
 *
 * For the examples only. They are not components of the system.
 */

const ring =
  "outline-none focus-visible:outline-hidden focus-visible:ring-(length:--focus-ring-width) focus-visible:ring-ring " +
  "focus-visible:ring-offset-[length:var(--focus-ring-offset)] focus-visible:ring-offset-background";

/** True when the key came from a field where people type. */
export function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.matches("input, textarea, select, [contenteditable=''], [contenteditable='true']");
}

/** True when Ctrl, Alt or Cmd is held. Shift alone is not a modifier here. */
export function hasModifier(e: { ctrlKey: boolean; altKey: boolean; metaKey: boolean }): boolean {
  return e.ctrlKey || e.altKey || e.metaKey;
}

/** One key drawn as a key cap. */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-sm border border-border bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-foreground">
      {children}
    </kbd>
  );
}

/** A drawn page: it hears keys only while focus is inside it. */
export function PageFrame({
  label,
  onKeyDown,
  children,
  frameRef,
  heardLabel = "Keys reach this page",
  onLeave,
}: {
  label: string;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
  children: ReactNode;
  frameRef?: Ref<HTMLDivElement>;
  heardLabel?: string;
  /** Called when focus leaves the frame. */
  onLeave?: () => void;
}) {
  const [inside, setInside] = useState(false);
  return (
    <div className="flex w-full max-w-sm flex-col gap-1.5">
      <div
        ref={frameRef}
        role="group"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onFocus={() => setInside(true)}
        onBlur={(e: FocusEvent<HTMLDivElement>) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setInside(false);
            onLeave?.();
          }
        }}
        className={`grid gap-3 rounded-lg border border-border bg-background p-3 text-sm ${ring}`}
      >
        {children}
      </div>
      <p aria-hidden="true" className="m-0 text-xs text-muted-foreground">
        {heardLabel}:{" "}
        <span className="font-medium text-foreground">{inside ? "yes" : "no, click inside the frame first"}</span>
      </p>
    </div>
  );
}

/** A visible line for sighted readers; the real announcement is the Outcome line under the example. */
export function KeyRow({ children }: { children: ReactNode }) {
  return <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">{children}</p>;
}

/** Turns a keyboard event into text such as "Alt+Shift+N". */
export function describeKey(e: { key: string; code: string; ctrlKey: boolean; altKey: boolean; metaKey: boolean; shiftKey: boolean }) {
  const parts: string[] = [];
  if (e.ctrlKey) parts.push("Ctrl");
  if (e.altKey) parts.push("Alt");
  if (e.metaKey) parts.push("Cmd");
  if (e.shiftKey) parts.push("Shift");
  const k = e.altKey && e.code.startsWith("Key") ? e.code.slice(3) : e.key.length === 1 ? e.key.toUpperCase() : e.key;
  parts.push(k);
  return parts.join("+");
}

export function RotateIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8a5 5 0 1 0 1.8-3.8" />
      <path d="M3 2.5v3h3" />
    </svg>
  );
}

/** The word a menu item shows beside its name: aria-hidden, so the name stays clean. */
export function ItemKeys({ children }: { children: ReactNode }) {
  return (
    <span aria-hidden="true" className="ml-auto pl-6 text-xs tracking-wide text-muted-foreground">
      {children}
    </span>
  );
}

export const menuItemClass =
  "flex min-h-10 w-full cursor-pointer items-center rounded-sm px-2 text-left text-sm text-foreground hover:bg-accent hover:text-accent-foreground " +
  ring;

/** The name of the Alt key on this platform: Option on a Mac. The keys still match on e.code. */
export function altName(): string {
  if (typeof navigator === "undefined") return "Alt";
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  return /mac/i.test(nav.userAgentData?.platform ?? nav.platform ?? "") ? "Option" : "Alt";
}
