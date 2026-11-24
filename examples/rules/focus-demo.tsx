import { dialogOverlay, dialogSurface } from "@blackwoodblake/justified-shadcn/styles";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

import { nameOf } from "./readout";

/*
 * Helpers for the focus examples of DLG-006 and DLG-007. For the examples
 * only. They are not components of the system.
 *
 *   - useFocusReadout and FocusLine say where focus is, in plain words. The
 *     line is hidden from assistive technology and is not a screen reader.
 *     It follows focus only while focus is inside the example's own scene or
 *     inside a dialog, so another example on the same page does not change it.
 *   - PlainDialog is a hand-made modal dialog for the Don'ts. It does only
 *     what its props say.
 */

/** What has focus, in plain words. */
export function describeFocus(el: Element | null): string {
  if (!el || el === document.body || el === document.documentElement) return "nothing (the start of the page)";
  let name = "";
  if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement)
    name = el.labels?.[0]?.textContent ?? "";
  if (!name) name = nameOf(el);
  name = name.replace(/\s*\(required\)\s*$/, "").trim() || el.tagName.toLowerCase();
  const behind = !!document.querySelector('[role="dialog"]') && !el.closest('[role="dialog"]');
  return behind ? `${name}, behind the dialog` : name;
}

const DIALOGS = '[role="dialog"], [role="alertdialog"]';

/**
 * Reads where focus is, once the example has been opened. It listens only
 * after that, ignores focus anywhere outside `root` and outside a dialog, and
 * stops on unmount.
 */
export function useFocusReadout(root: RefObject<HTMLElement | null>) {
  const [on, setOn] = useState(false);
  const [text, setText] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Whether the last thing read was inside this example.
  const inside = useRef(false);

  const read = useCallback(
    (wait = 30) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const el = document.activeElement;
        const mine = !!el && el !== document.body && (!!root.current?.contains(el) || !!el.closest(DIALOGS));
        if (mine) {
          inside.current = true;
          setText(describeFocus(el));
        } else if ((!el || el === document.body) && inside.current) {
          inside.current = false;
          setText(describeFocus(el));
        } else inside.current = false;
      }, wait);
    },
    [root],
  );

  useEffect(() => {
    if (!on) return;
    const handler = () => read();
    document.addEventListener("focusin", handler);
    document.addEventListener("focusout", handler);
    return () => {
      document.removeEventListener("focusin", handler);
      document.removeEventListener("focusout", handler);
    };
  }, [on, read]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return {
    text,
    read,
    start: () => setOn(true),
    reset: () => {
      clearTimeout(timer.current);
      inside.current = false;
      setText("");
    },
  };
}

/** A line under a scene that says where focus is. Hidden from assistive technology. */
export function FocusLine({ text, empty }: { text: string; empty: string }) {
  return (
    <p aria-hidden="true" className="m-0 min-h-5 text-center text-xs text-muted-foreground">
      {text ? (
        <>
          Focus is on: <strong className="font-medium text-foreground">{text}</strong>
        </>
      ) : (
        empty
      )}
    </p>
  );
}

/**
 * A hand-made modal dialog, drawn like the system's Dialog, that does only
 * what its props say:
 *   - focusIn: move focus to its first control when it opens.
 *   - returnFocus: put focus back on the control that had it when it opened.
 *   - modal: mark it aria-modal. It never makes the page behind inert and
 *     never holds Tab.
 *   - inPlace: render where it is written, not last in the page, so Tab after
 *     its last control goes on to what follows it in the code.
 *   - escapeAnywhere: Escape works wherever focus is while it is open
 *     (a listener on the document, removed when it closes). Otherwise Escape
 *     works from inside it only.
 */
export function PlainDialog({
  title,
  description,
  onEscape,
  focusIn,
  returnFocus,
  modal = false,
  inPlace = false,
  escapeAnywhere = false,
  children,
}: {
  title: string;
  description?: string;
  onEscape: () => void;
  focusIn: boolean;
  returnFocus: boolean;
  modal?: boolean;
  inPlace?: boolean;
  escapeAnywhere?: boolean;
  children: ReactNode;
}) {
  const titleId = useId();
  const box = useRef<HTMLDivElement>(null);
  const escape = useRef(onEscape);
  escape.current = onEscape;

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (focusIn) box.current?.querySelector<HTMLElement>("input, select, textarea, button")?.focus();
    return () => {
      if (returnFocus && opener?.isConnected) opener.focus();
    };
    // The dialog is mounted only while it is open, so this runs once per opening.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!escapeAnywhere) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") escape.current();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [escapeAnywhere]);

  const keys = (e: KeyboardEvent) => {
    if (!escapeAnywhere && e.key === "Escape") onEscape();
  };

  const surface = (
    <div className={dialogOverlay}>
      <div
        ref={box}
        role="dialog"
        aria-modal={modal ? "true" : undefined}
        aria-labelledby={titleId}
        onKeyDown={keys}
        className={dialogSurface}
      >
        <h2 id={titleId} className="m-0 text-base font-semibold leading-snug">
          {title}
        </h2>
        {description && <p className="m-0 mt-2 text-sm text-muted-foreground">{description}</p>}
        {children}
      </div>
    </div>
  );
  return inPlace ? surface : createPortal(surface, document.body);
}
