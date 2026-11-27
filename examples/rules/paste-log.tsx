import { useRef, useState, type ClipboardEvent } from "react";

/*
 * What the paste readouts say about the last paste into a field, for the
 * Don'ts of FRM-017, FRM-017a and FRM-017c that write their field out in the
 * rule file. For the examples only; not a component of the system.
 *
 * The hook only watches. It never cancels or changes a paste, so the field
 * itself stays in the rule file, where the mistake is written out.
 */

type Control = HTMLInputElement | HTMLTextAreaElement;

export type PasteLast = { len: number; kept?: number; blocked?: boolean };

/** The "Last paste" line of a readout. */
export function pasteLastText(last: PasteLast | null): string {
  if (last === null) return "(none yet)";
  if (last.blocked) return `${last.len} characters, cancelled: nothing was added`;
  if (last.kept === undefined || last.kept >= last.len) return `${last.len} characters in, all kept`;
  return last.kept <= 0 ? `${last.len} characters pasted, none kept` : `${last.len} characters in, ${last.kept} kept`;
}

export function usePasteLog() {
  const [last, setLast] = useState<PasteLast | null>(null);
  const pending = useRef<{ before: number; len: number } | null>(null);
  return {
    last,
    /** Call from onPaste on a paste the field takes. */
    onPaste(e: ClipboardEvent<Control>) {
      const el = e.currentTarget;
      const text = e.clipboardData.getData("text");
      const replaced = (el.selectionEnd ?? 0) - (el.selectionStart ?? 0);
      pending.current = { before: el.value.length - replaced, len: text.length };
      // A paste that adds nothing fires no input event, so settle the readout after the event.
      window.setTimeout(() => {
        if (pending.current) {
          setLast({ len: pending.current.len, kept: Math.max(0, el.value.length - pending.current.before) });
          pending.current = null;
        }
      }, 0);
    },
    /** Call from onChange with the value the field now holds. */
    changed(next: string) {
      if (pending.current) {
        setLast({ len: pending.current.len, kept: next.length - pending.current.before });
        pending.current = null;
      }
    },
    /** Note a paste that a handler cancelled, given its text. */
    blocked(text: string) {
      setLast({ len: text.length, blocked: true });
    },
    /** Note a paste that something else cancels, from a capture handler that only watches. */
    cancelled(e: ClipboardEvent<HTMLElement>) {
      setLast({ len: e.clipboardData.getData("text").length, blocked: true });
    },
  };
}

/** The "The field holds" line of a readout: how much text the field has, in characters. */
export function fieldHolds(value: string): string {
  return `${value.length} ${value.length === 1 ? "character" : "characters"}`;
}
