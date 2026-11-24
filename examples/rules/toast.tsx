import type { ReactNode } from "react";

import { Button } from "@blackwoodblake/justified-shadcn/button";
import { CloseIcon } from "@blackwoodblake/justified-shadcn/icons";

/*
 * A toast for the examples. It is drawn inside the example's stage, not over
 * the page, so it covers no control (KBD-002) and the reader sees it at once.
 *
 * ToastRegion is in the page from the start and is polite, so a toast that
 * appears in it is read out without moving focus (FBK-004). Put it in place
 * before a toast that should be heard is shown. A toast that is part of the
 * scene when the example first appears may be drawn with the region; it is
 * there from the start, like the rest of the page, and is not announced.
 *
 * The toast has at most one action and a close button (FBK-005). Whether it
 * closes by itself is up to the example: a Don't may add a timer.
 *
 * For the examples only. It is not a component of the system.
 */

export function ToastRegion({ children }: { children?: ReactNode }) {
  return (
    <div role="region" aria-label="Notifications" className="w-full">
      <div aria-live="polite" aria-atomic="false" className="flex min-h-0 flex-col gap-2">
        {children}
      </div>
    </div>
  );
}

export function Toast({
  children,
  action,
  onClose,
  closeLabel = "Close message",
}: {
  children: ReactNode;
  /** The one action. Pass more only in a Don't. */
  action?: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
}) {
  return (
    <div className="flex w-full items-center gap-2 rounded-lg border border-border bg-popover py-2 pr-2 pl-4 text-sm text-popover-foreground shadow-md">
      <p className="m-0 flex-1">{children}</p>
      {action}
      {onClose && (
        <Button variant="ghost" size="icon" aria-label={closeLabel} onClick={onClose}>
          <CloseIcon />
        </Button>
      )}
    </div>
  );
}
