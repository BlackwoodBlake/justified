/*
 * Class strings that several components share, so a behaviour is written
 * once and every component keeps it.
 */

/**
 * Visible keyboard focus in the ring colour (WCAG 2.2, 2.4.7). Sizes come from the focus tokens.
 * On focus, outline-hidden keeps a transparent outline, so forced-colours and
 * high-contrast modes, which drop box-shadow rings, still draw a visible focus outline.
 * The offset is written as ring-offset-[length:var(…)]: tailwind-merge (in cn) drops
 * the shorter ring-offset-(length:…) form, which left the ring without its gap.
 */
export const focusRing =
  "outline-none focus-visible:outline-hidden focus-visible:ring-(length:--focus-ring-width) focus-visible:ring-ring " +
  "focus-visible:ring-offset-[length:var(--focus-ring-offset)] focus-visible:ring-offset-background";

/** Colour changes follow the motion tokens, so reduced motion applies everywhere. */
export const colourTransition = "transition-colors duration-(--motion-duration-fast) ease-standard";

/** Text inputs, textareas and selects look and behave the same. */
export const fieldControl =
  "w-full min-w-0 rounded-md border border-input bg-background px-3 text-base text-foreground " +
  "placeholder:text-muted-foreground aria-invalid:border-destructive " +
  "disabled:cursor-not-allowed disabled:opacity-50 " +
  `${colourTransition} ${focusRing}`;

/**
 * Grows the clickable area of a small control to at least 24 px
 * (2.5.8 Target Size (Minimum)) without changing how it looks.
 */
export const targetArea = "relative after:absolute after:-inset-0.5 after:content-['']";

/**
 * Dialogs (dialog.tsx, alert-dialog.tsx). The backdrop dims the page in both
 * themes and scrolls a dialog that is taller than the window. There is no animation.
 */
export const dialogOverlay = "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-overlay p-4";

/** The box of a dialog, also used to draw one in place. */
export const dialogSurface =
  "relative w-full max-w-md rounded-lg border border-border bg-popover p-5 text-popover-foreground shadow-lg outline-none";

/**
 * The row of buttons. Cancel comes first in the code and on screen; the confirming
 * button is last, at the trailing end (ACT-003a). On a narrow screen the buttons stack
 * in the same order, never reversed (LAY-002, DLG-004).
 */
export const dialogFooter = "mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end";
