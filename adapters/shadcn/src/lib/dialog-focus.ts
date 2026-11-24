import { useRef, type MouseEvent } from "react";

/*
 * Focus and layering for Dialog and AlertDialog, kept apart from both so
 * either can be added on its own.
 *
 *   - Focus starts on the element marked data-autofocus. In a Dialog without
 *     one, it starts on the first control after the close icon. In an
 *     AlertDialog, Radix starts it on Cancel (DLG-004).
 *   - When the dialog closes, focus goes back to the control that was focused
 *     when it opened, also when it was opened without a trigger (DLG-006).
 *   - A dialog that opens while another is open makes the one beneath inert,
 *     so a screen reader, the keyboard and the mouse reach only the top layer
 *     (DLG-002, DLG-007). Radix's own hiding leaves alone any element that holds a live
 *     region, such as a Field's, so it cannot be relied on for this.
 *   - A press on the dimmed backdrop keeps focus where it was, and a press on
 *     the backdrop's scrollbar does not count as a press outside the dialog.
 */

const TABBABLE = [
  "button",
  "[href]",
  'input:not([type="hidden"])',
  "select",
  "textarea",
  "summary",
  "audio[controls]",
  "video[controls]",
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

const OPEN_DIALOGS =
  '[data-slot="dialog-content"][data-state="open"], [data-slot="alert-dialog-content"][data-state="open"]';

function canTakeFocus(el: HTMLElement) {
  return !el.matches(":disabled") && !el.closest("[inert]") && el.getClientRects().length > 0;
}

export function useDialogFocus({
  onOpenAutoFocus,
  onCloseAutoFocus,
  skipCloseIcon,
}: {
  onOpenAutoFocus?: (e: Event) => void;
  onCloseAutoFocus?: (e: Event) => void;
  /** Start on the first control after the close icon, not on the icon. */
  skipCloseIcon: boolean;
}) {
  const returnTo = useRef<HTMLElement | null>(null);
  const madeInert = useRef<HTMLElement[]>([]);
  return {
    onOpenAutoFocus: (e: Event) => {
      const content = e.currentTarget as HTMLElement;
      const opener = document.activeElement;
      returnTo.current = opener instanceof HTMLElement && opener !== document.body ? opener : null;

      // Only the top layer can be reached while it is open.
      madeInert.current = Array.from(document.querySelectorAll<HTMLElement>(OPEN_DIALOGS)).filter(
        (el) => el !== content && !el.contains(content) && !el.inert,
      );
      for (const el of madeInert.current) el.inert = true;

      onOpenAutoFocus?.(e);
      if (e.defaultPrevented) return;
      let target = content.querySelector<HTMLElement>("[data-autofocus]");
      if (!target && skipCloseIcon) {
        const all = Array.from(content.querySelectorAll<HTMLElement>(TABBABLE)).filter(canTakeFocus);
        target = all.find((el) => !el.closest('[data-slot="dialog-close-icon"]')) ?? all[0] ?? null;
      }
      // Without a target, Radix's own choice stands: AlertDialog starts on Cancel.
      if (!target) return;
      e.preventDefault();
      target.focus({ preventScroll: true });
    },
    onCloseAutoFocus: (e: Event) => {
      // The layer beneath comes back first, so focus can return into it.
      for (const el of madeInert.current) el.inert = false;
      madeInert.current = [];

      onCloseAutoFocus?.(e);
      if (e.defaultPrevented) return;
      e.preventDefault();
      const back = returnTo.current;
      returnTo.current = null;
      if (back?.isConnected) back.focus({ preventScroll: true });
    },
  };
}

/** A press on the dimmed backdrop keeps focus where it was, instead of dropping it on the page. */
export function keepFocusOnBackdrop(e: MouseEvent<HTMLElement>) {
  if (e.target === e.currentTarget) e.preventDefault();
}

type OutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;

/**
 * The backdrop scrolls a tall dialog. Where scrollbars always show, a press on
 * that scrollbar is not a press outside the dialog, so it does not close it.
 */
export function ignoreScrollbarPress(handler?: (e: OutsideEvent) => void) {
  return (e: OutsideEvent) => {
    handler?.(e);
    const press = e.detail.originalEvent;
    const t = press.target;
    if (
      t instanceof HTMLElement &&
      t.getAttribute("data-slot")?.endsWith("overlay") &&
      (press.offsetX > t.clientWidth || press.offsetY > t.clientHeight)
    )
      e.preventDefault();
  };
}
