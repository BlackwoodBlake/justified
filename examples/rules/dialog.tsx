import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { dialogFooter, dialogSurface } from "@blackwoodblake/justified-shadcn/styles";
import { cn } from "@blackwoodblake/justified-shadcn/utils";

/*
 * Helpers for the examples. A live dialog in an example is always the
 * system's own Dialog or AlertDialog; these only draw and report.
 *
 *   - DialogPicture draws a dialog in place, inside the example frame, so the
 *     reader sees it at once. It has the same box and footer as the real
 *     Dialog, but it is a labelled group, not a dialog: it does not cover the
 *     page or hold focus.
 *   - Outcome is a polite line under an example that says what just happened.
 *
 * For the examples only. They are not components of the system.
 */

export function DialogPicture({
  title,
  children,
  footer,
  footerClassName,
  titleClassName,
  className,
}: {
  title: string;
  children?: ReactNode;
  /** The buttons, Cancel first. They sit in the same footer as the real Dialog's. */
  footer: ReactNode;
  footerClassName?: string;
  titleClassName?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={id} className={cn(dialogSurface, className)}>
      <h4 id={id} className={cn("m-0 text-base font-semibold leading-snug", titleClassName)}>
        {title}
      </h4>
      {children && <div className="mt-2 text-sm text-muted-foreground">{children}</div>}
      <div className={cn(dialogFooter, footerClassName)}>{footer}</div>
    </div>
  );
}

/** A polite line under an example that says what just happened. */
export function Outcome({ children }: { children?: ReactNode }) {
  return (
    <p role="status" className="m-0 min-h-5 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

/** The real focus ring, drawn on a button in a picture to show where focus starts. */
export const drawnRing =
  "ring-(length:--focus-ring-width) ring-ring ring-offset-[length:var(--focus-ring-offset)] ring-offset-background";

/**
 * A still picture of a dialog as it opens, with a short note under it. It is
 * hidden from assistive technology and cannot be reached: the live dialog
 * that opens from the example's own button tells the same story.
 */
export function Still({ note, children }: { note?: ReactNode; children: ReactNode }) {
  return (
    <div aria-hidden="true" inert className="w-full max-w-sm">
      {children}
      {note && <p className="mt-2 mb-0 text-center text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

/** Empty first, so the same words are read again when they repeat. */
export function useSay() {
  const [said, setSaid] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const say = (s: string) => {
    setSaid("");
    clearTimeout(timer.current);
    if (s) timer.current = setTimeout(() => setSaid(s), 50);
  };
  return [said, say] as const;
}
