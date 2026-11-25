import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { describeFocus, FocusLine } from "./focus-demo";

/*
 * Helpers for the examples of FRM-012a, FRM-012b and FRM-013. For the
 * examples only. They are not components of the system.
 *
 *   - Screen draws a small "page" with a label strip, so a change of context
 *     can be simulated: the example swaps one Screen for another and nothing
 *     real is navigated, sent or reloaded. With `arrive`, focus goes to the
 *     strip when the page appears, as it would on a new page.
 *   - useFocusTrace reads document.activeElement a moment after every focus
 *     change or change in the scene, and FocusTrace shows it. The line is
 *     hidden from assistive technology.
 */

/** A drawn page. Its strip names it, so a swap to another page can be seen. */
export function Screen({ label, arrive, children }: { label: string; arrive?: boolean; children: ReactNode }) {
  const strip = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (arrive) strip.current?.focus();
  }, [arrive]);
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-background text-sm">
      <p
        ref={strip}
        tabIndex={arrive ? -1 : undefined}
        className="m-0 border-b border-border bg-muted px-3 py-1 text-xs text-muted-foreground outline-offset-[-2px] focus:outline-2 focus:outline-ring"
      >
        Page: <strong className="font-medium text-foreground">{label}</strong>
      </p>
      <div className="grid gap-3 p-4">{children}</div>
    </div>
  );
}

const DIALOGS = '[role="dialog"], [role="alertdialog"]';

function nameFor(el: Element): string {
  const own = el.getAttribute("data-focus-name");
  if (own) return own;
  const label = (el as HTMLInputElement).labels?.[0]?.textContent;
  if (label) return label.replace(/\s*\(required\)\s*$/, "").trim();
  return describeFocus(el);
}

/** Where focus is, while it is inside the scene that gets `ref` (or in a dialog opened from it). */
export function useFocusTrace() {
  const ref = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  const inside = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const read = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const el = document.activeElement;
      if (!el || el === document.body || el === document.documentElement) {
        // Focus has fallen to the page: say so only if it was here a moment ago.
        if (inside.current) setText(describeFocus(null));
        return;
      }
      if (ref.current?.contains(el) || el.closest(DIALOGS)) {
        inside.current = true;
        setText(nameFor(el));
      } else if (inside.current) {
        inside.current = false;
        setText("");
      }
    }, 30);
  }, []);

  useEffect(() => {
    const arrive = (e: Event) => {
      if (e.target instanceof Element && (ref.current?.contains(e.target) || e.target.closest(DIALOGS)))
        inside.current = true;
      read();
    };
    document.addEventListener("focusin", arrive);
    document.addEventListener("focusout", read);
    const watch = new MutationObserver(read);
    if (ref.current) watch.observe(ref.current, { childList: true, subtree: true });
    return () => {
      document.removeEventListener("focusin", arrive);
      document.removeEventListener("focusout", read);
      watch.disconnect();
      clearTimeout(timer.current);
    };
  }, [read]);

  return { text, ref };
}

export function FocusTrace({ text }: { text: string }) {
  return <FocusLine text={text} empty="Click or Tab into the scene to follow focus." />;
}
