import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@blackwoodblake/justified-shadcn/alert-dialog";
import { Button } from "@blackwoodblake/justified-shadcn/button";
import { focusRing } from "@blackwoodblake/justified-shadcn/styles";
import { useEffect, useRef, useState, type ReactNode } from "react";

/*
 * Helpers for the examples of FRM-004c and FRM-004d: a page that a person
 * can leave in more than one way.
 *
 * Nothing here touches the real page. A drawn browser window holds a small
 * site; its Back button, its menu links and its "Close tab" button are all
 * simulated, and no beforeunload handler is ever registered. The browser's
 * own prompt on closing a tab is drawn as a still inside the window, because
 * the browser words it and a page cannot show it.
 *
 *   - useBrowser keeps a small history, so Back has somewhere to go.
 *   - useLeaveGuard holds the one question a page asks before it throws
 *     changes away. Every way out goes through attempt().
 *   - LeaveQuestion is the product's question, built as the system's
 *     AlertDialog with the same words as FRM-004a and FRM-004b.
 *   - BrowserWindow draws the window and the browser's prompt.
 *
 * For the examples only. They are not components of the system.
 */

export function useBrowser<P extends string>(first: P[]) {
  const [history, setHistory] = useState<P[]>(first);
  const [index, setIndex] = useState(first.length - 1);
  const [closed, setClosed] = useState<"closed" | "crashed" | false>(false);
  return {
    page: history[index],
    previous: history[index - 1] as P | undefined,
    push(p: P) {
      setHistory((h) => [...h.slice(0, index + 1), p]);
      setIndex(index + 1);
    },
    back() {
      setIndex((i) => Math.max(0, i - 1));
    },
    closed,
    close(how: "closed" | "crashed" = "closed") {
      setClosed(how);
    },
    reopen(p: P) {
      setHistory([p]);
      setIndex(0);
      setClosed(false);
    },
  };
}

export type Pending = { go: () => void; opener: HTMLElement | null };

/** Holds the question while it is open. Pass asks=false and the move runs at once. */
export function useLeaveGuard() {
  const [pending, setPending] = useState<Pending | null>(null);
  const leaving = useRef(false);
  const opener = useRef<HTMLElement | null>(null);
  return {
    pending,
    leaving,
    opener,
    attempt(from: HTMLElement | null, go: () => void, asks: boolean) {
      if (!asks) return go();
      opener.current = from;
      setPending({ go, opener: from });
    },
    stay() {
      leaving.current = false;
      setPending(null);
    },
    leave() {
      leaving.current = true;
      const p = pending;
      setPending(null);
      p?.go();
    },
  };
}

/** The product's question before a page throws unsaved changes away. */
export function LeaveQuestion({
  guard,
  title,
  text,
  discardLabel = "Discard changes",
  afterLeave,
}: {
  guard: ReturnType<typeof useLeaveGuard>;
  title: string;
  text: string;
  discardLabel?: string;
  /** Where focus goes when the person left: the opener is gone by then. */
  afterLeave?: () => void;
}) {
  return (
    <AlertDialog
      open={guard.pending !== null}
      onOpenChange={(open) => {
        if (!open) guard.stay();
      }}
    >
      <AlertDialogContent
        onCloseAutoFocus={(e) => {
          if (guard.leaving.current) {
            guard.leaving.current = false;
            e.preventDefault();
            afterLeave?.();
          } else if (guard.opener.current?.isConnected) {
            // Staying: focus goes back to what was pressed (DLG-006), also where a press does not focus a button.
            e.preventDefault();
            guard.opener.current.focus({ preventScroll: true });
          }
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{text}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel />
          <AlertDialogAction
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              guard.leave();
            }}
          >
            {discardLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Moves focus to the heading of the page that is showing, as a new page does. */
export function focusHeading(root: HTMLElement | null) {
  root?.querySelector<HTMLElement>("[data-page-heading]")?.focus({ preventScroll: true });
}

export type MenuLink = { id: string; label: string };

const linkClass = `inline-flex min-h-8 items-center rounded-sm px-2 text-sm underline-offset-4 hover:underline ${focusRing}`;

export function BrowserWindow({
  label,
  address,
  canBack,
  onBack,
  onClose,
  closedHow,
  onReopen,
  menu,
  current,
  onMenu,
  prompt,
  onStay,
  onLeave,
  children,
  windowRef,
}: {
  label: string;
  address: string;
  canBack: boolean;
  onBack: (opener: HTMLElement) => void;
  onClose: (opener: HTMLElement) => void;
  closedHow: "closed" | "crashed" | false;
  onReopen: () => void;
  menu: MenuLink[];
  current: string;
  onMenu: (id: string, opener: HTMLElement) => void;
  /** Show the browser's own prompt, drawn. */
  prompt: boolean;
  onStay: () => void;
  onLeave: () => void;
  children: ReactNode;
  windowRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const promptCancel = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (prompt) promptCancel.current?.focus();
    else if (wasOpen.current) closeButton.current?.focus();
    wasOpen.current = prompt;
  }, [prompt]);

  return (
    <div
      ref={windowRef}
      role="group"
      aria-label={label}
      className="relative w-full max-w-md overflow-hidden rounded-lg border border-border bg-background text-sm text-foreground shadow-sm"
    >
      <div inert={prompt} className="flex items-center gap-2 border-b border-border bg-muted px-2 py-1.5">
        <Button variant="outline" size="sm" disabled={!canBack || !!closedHow} onClick={(e) => onBack(e.currentTarget)}>
          <span aria-hidden="true">&larr;</span> Back
        </Button>
        <span
          aria-hidden="true"
          className="min-w-0 flex-1 truncate rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground"
        >
          {address}
        </span>
        <Button
          ref={closeButton}
          variant="outline"
          size="sm"
          disabled={!!closedHow}
          onClick={(e) => onClose(e.currentTarget)}
        >
          Close tab
        </Button>
      </div>

      {closedHow ? (
        <div className="grid min-h-64 place-items-center p-6 text-center">
          <div className="grid gap-3">
            <h4 data-page-heading tabIndex={-1} className="m-0 text-sm font-normal text-muted-foreground">
              {closedHow === "crashed" ? "The tab crashed. The browser showed no question." : "This tab is closed."}
            </h4>
            <div>
              <Button variant="outline" size="sm" onClick={onReopen}>
                Reopen tab
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* A drawn menu, not a landmark of the host page: several windows can share one page. */}
          <div inert={prompt} className="flex flex-wrap gap-1 border-b border-border px-2 py-1">
            {menu.map((m) => (
              <a
                key={m.id}
                href={`#${m.id}`}
                aria-current={m.id === current ? "page" : undefined}
                className={`${linkClass} ${m.id === current ? "font-semibold underline" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  onMenu(m.id, e.currentTarget);
                }}
              >
                {m.label}
              </a>
            ))}
          </div>
          <div inert={prompt} className="p-4">
            {children}
          </div>
        </div>
      )}
      {prompt && (
        <div
          className="absolute inset-0 z-10 grid place-items-center bg-overlay p-3"
          onKeyDown={(e) => {
            if (e.key === "Escape") onStay();
            if (e.key === "Tab") {
              // Two buttons: Tab and Shift+Tab swap between them, so focus stays in the prompt.
              const buttons = Array.from(e.currentTarget.querySelectorAll("button"));
              const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
              if (at === (e.shiftKey ? 0 : buttons.length - 1)) {
                e.preventDefault();
                buttons[e.shiftKey ? buttons.length - 1 : 0]?.focus();
              }
            }
          }}
        >
          <div
            role="group"
            aria-label="The browser's own prompt, drawn here"
            className="w-full max-w-64 rounded-lg border border-border bg-background p-4 shadow-md"
          >
            <p className="m-0 text-xs text-muted-foreground">Drawn after the browser&rsquo;s own prompt</p>
            <p className="mt-1 mb-0 text-base font-semibold">Leave site?</p>
            <p className="mt-1 mb-0 text-muted-foreground">Changes you made may not be saved.</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button ref={promptCancel} variant="outline" size="sm" onClick={onStay}>
                Cancel
              </Button>
              <Button size="sm" onClick={onLeave}>
                Leave
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
