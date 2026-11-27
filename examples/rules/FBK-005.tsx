import { Button } from "@blackwoodblake/justified-shadcn/button";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";
import { Toast, ToastRegion } from "./toast";

/*
 * FBK-005: a toast has at most one action, stays until it is used, and its
 * action can be done from a place that lasts.
 *
 * Two contacts have just been merged, and the list shows the result in both
 * examples (FBK-003). In the Do the toast holds Undo and a close button and
 * stays, and the contact's History can split the two again. In the Don't
 * the toast holds three buttons, goes after six seconds, and there is no
 * History. The toast sits below the list in a region that is in the page
 * from the start, so it covers nothing (KBD-002) and is announced (FBK-004).
 *
 * After Undo or Split contacts, focus goes to the contact that came back
 * (DST-001a). After the close button, it goes to History. In the Don't, if
 * focus is in the toast when it goes, focus moves to the merged row.
 *
 * The opening toast is part of the starting scene, like content that is
 * there when a page loads, and is not meant to be announced. A toast after
 * Reset example is written into the region that is already in the page.
 */

const message = "Anna Brooks and A. Brooks were merged";
const undoWords = "Merge undone. Anna Brooks and A. Brooks are separate again.";
const splitWords = "Contacts split. Anna Brooks and A. Brooks are separate again.";

const focusable = "rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** What the list hands to the toast each example writes out. */
type ToastControls = { undo: () => void; nothing: () => void; close: () => void };

function Contacts({ crowded, toastBody }: { crowded: boolean; toastBody: (c: ToastControls) => ReactNode }) {
  const [merged, setMerged] = useState(true);
  const [toast, setToast] = useState(1);
  const [history, setHistory] = useState(false);
  const [said, setSaid] = useState("");
  const listId = useId();
  const historyId = useId();

  const restoredRef = useRef<HTMLLIElement>(null);
  const mergedRef = useRef<HTMLLIElement>(null);
  const historyRef = useRef<HTMLButtonElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const focusNext = useRef<RefObject | null>(null);
  // The short pause between clearing the status line and writing it again.
  const sayTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    focusNext.current?.current?.focus();
    focusNext.current = null;
  });

  // Don't: the toast goes after six seconds, with its buttons.
  useEffect(() => {
    if (!crowded || !toast) return;
    const t = setTimeout(() => {
      // If focus was in the toast, keep it on the page rather than lose it.
      if (toastRef.current?.contains(document.activeElement)) focusNext.current = mergedRef;
      setToast(0);
    }, 6000);
    return () => clearTimeout(t);
  }, [crowded, toast]);

  const say = (words: string) => {
    setSaid("");
    clearTimeout(sayTimer.current);
    sayTimer.current = setTimeout(() => setSaid(words), 50);
  };
  useEffect(() => () => clearTimeout(sayTimer.current), []);

  const split = (words: string) => {
    setMerged(false);
    setHistory(false);
    // A newer change makes the toast moot.
    setToast(0);
    focusNext.current = restoredRef;
    say(words);
  };

  const close = () => {
    setToast(0);
    focusNext.current = historyRef;
  };

  const reset = () => {
    setMerged(true);
    setHistory(false);
    setSaid("");
    setToast((n) => n + 1);
  };

  const nothing = () => say("View and Share do nothing in this example.");

  const row = "flex min-h-12 flex-wrap items-center justify-between gap-2 py-1.5";
  const item = "border-b border-border last:border-0";

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="rounded-lg border border-border bg-background p-4 text-foreground">
        <h4 id={listId} className="m-0 text-base font-semibold">
          Contacts
        </h4>
        <ul aria-labelledby={listId} className="m-0 mt-2 list-none p-0 text-sm">
          <li ref={mergedRef} tabIndex={crowded ? -1 : undefined} className={`${item} ${focusable}`}>
            <div className={row}>
              <span className="font-medium">Anna Brooks</span>
              {merged && !crowded && (
                <Button
                  ref={historyRef}
                  variant="ghost"
                  size="sm"
                  aria-expanded={history}
                  aria-controls={historyId}
                  onClick={() => setHistory((h) => !h)}
                >
                  History
                </Button>
              )}
            </div>
            {merged && !crowded && (
              <div id={historyId} hidden={!history} className="mb-2 rounded-md bg-muted p-3">
                <p className="m-0">Merged with A. Brooks, 14:02</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => split(splitWords)}>
                  Split contacts
                </Button>
              </div>
            )}
          </li>
          {!merged && (
            <li ref={restoredRef} tabIndex={-1} className={`${row} ${item} ${focusable}`}>
              <span className="font-medium">A. Brooks</span>
            </li>
          )}
        </ul>
      </div>

      <ToastRegion>
        {toast > 0 && (
          <div ref={toastRef} key={toast}>
            {toastBody({ undo: () => split(undoWords), nothing, close })}
          </div>
        )}
      </ToastRegion>

      <Outcome>{said}</Outcome>
      <div className="flex justify-center">
        <Button variant="link" size="sm" onClick={reset}>
          Reset example
        </Button>
      </div>
    </div>
  );
}

type RefObject = { current: HTMLElement | null };

function OneAction() {
  return (
    <Contacts
      crowded={false}
      toastBody={(c) => (
        <Toast
          action={
            <Button variant="outline" size="sm" onClick={c.undo}>
              Undo
            </Button>
          }
          onClose={c.close}
        >
          {message}
        </Toast>
      )}
    />
  );
}

function ThreeActions() {
  return (
    <Contacts
      crowded
      toastBody={(c) => (
        <Toast
          action={
            <div className="flex flex-wrap justify-end gap-1">
              <Button variant="outline" size="sm" onClick={c.undo}>
                Undo
              </Button>
              <Button variant="outline" size="sm" onClick={c.nothing}>
                View
              </Button>
              <Button variant="outline" size="sm" onClick={c.nothing}>
                Share
              </Button>
            </div>
          }
        >
          {message}
        </Toast>
      )}
    />
  );
}

export const FBK005: RuleExamples = {
  id: "FBK-005",
  examples: [
    {
      kind: "do",
      title: "One Undo that waits, and a lasting way back",
      caption: (
        <>
          The toast holds one action, <em>Undo</em>, and a close button, and it stays for as long as you like. Press{" "}
          <em>Undo</em> and both contacts come back. Or close the toast and use <em>History</em>, then{" "}
          <em>Split contacts</em>, to do the same. <em>Reset example</em> merges them again.
        </>
      ),
      Demo: OneAction,
    },
    {
      kind: "dont",
      title: "Three actions and a timer",
      caption: (
        <>
          The toast holds <em>Undo</em>, <em>View</em> and <em>Share</em>, and it goes after six seconds. Wait for it:
          once it has gone, nothing on the page can split the contacts again.
        </>
      ),
      notLinted:
        "The toast is the example's own, drawn in the stage; sonner's Toaster would float over this page, and the rule reads only sonner's toast().",
      Demo: ThreeActions,
    },
  ],
};
