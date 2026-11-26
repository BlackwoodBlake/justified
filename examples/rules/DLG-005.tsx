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
import { useEffect, useId, useRef, useState } from "react";

import { DialogPicture, drawnRing, Outcome, Still, useSay } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * DLG-005: in a destructive confirmation, the destructive button has the
 * danger style, also when the person just asked for the action, and its
 * label names the action.
 *
 * A list of invoices with Delete on each row. Delete opens the system's
 * AlertDialog, which asks before the invoice is erased for good (DST-001b).
 * The three examples differ only in how the two buttons look:
 *
 *   - Do: Delete invoice is red (variant="destructive"), Cancel is outline.
 *   - Don't: Delete invoice looks like any main button, such as Save.
 *   - Don't: Cancel is the filled main button, to steer people away, and
 *     Delete invoice stays red.
 *
 * After a deletion the row goes, and focus moves to the next row's Delete
 * button, or the previous one, or the list's heading when none is left.
 */

type Look = "danger" | "plain" | "steer";

const all = [
  { no: "2026-0412", to: "Lindqvist Bakery", amount: "$1,240" },
  { no: "2026-0413", to: "North Pier Studio", amount: "$380" },
  { no: "2026-0414", to: "Hale & Daughters", amount: "$2,015" },
];

// Cancel drawn as the filled main button: only in the Don't that steers people away.
const filled =
  "border-transparent bg-primary text-primary-foreground not-disabled:not-aria-disabled:hover:bg-primary/90 not-disabled:not-aria-disabled:hover:text-primary-foreground not-disabled:not-aria-disabled:active:bg-[color-mix(in_oklab,var(--primary),var(--foreground)_20%)] not-disabled:not-aria-disabled:active:text-primary-foreground";

function looks(look: Look) {
  return {
    // The plain Don't changes only the action; the steering Don't changes only Cancel.
    action: look === "plain" ? ("default" as const) : ("destructive" as const),
    cancel: look === "steer" ? filled : undefined,
  };
}

function Picture({ look }: { look: Look }) {
  const l = looks(look);
  return (
    <Still>
      <DialogPicture
        title="Delete invoice 2026-0412?"
        footer={
          <>
            <Button variant="outline" tabIndex={-1} className={`${l.cancel ?? ""} ${drawnRing}`}>
              Cancel
            </Button>
            <Button variant={l.action} tabIndex={-1}>
              Delete invoice
            </Button>
          </>
        }
      >
        It is erased for good, and its number cannot be used again.
      </DialogPicture>
    </Still>
  );
}

function Invoices({ look }: { look: Look }) {
  const [rows, setRows] = useState(all);
  const [asking, setAsking] = useState<string | null>(null);
  const [said, say] = useSay();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const deleteRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  // Where focus goes after a row is deleted, since its own Delete button is gone.
  const afterDelete = useRef<HTMLElement | null>(null);
  const deleted = useRef(false);
  const resetRef = useRef<HTMLButtonElement>(null);
  const [resetting, setResetting] = useState(false);
  const l = looks(look);

  useEffect(() => {
    if (!resetting) return;
    setResetting(false);
    deleteRefs.current[all[0].no]?.focus();
  }, [resetting]);

  const remove = (no: string) => {
    const i = rows.findIndex((r) => r.no === no);
    const next = rows[i + 1] ?? rows[i - 1];
    afterDelete.current = next ? deleteRefs.current[next.no] : null;
    deleted.current = true;
    setRows(rows.filter((r) => r.no !== no));
    setAsking(null);
    say(`Deleted. Invoice ${no} is gone.`);
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Picture look={look} />

      <div className="w-full max-w-sm rounded-lg border border-border bg-background p-4 text-sm">
        <h4
          ref={headingRef}
          id={headingId}
          tabIndex={-1}
          className="m-0 rounded-sm text-base font-semibold outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Invoices
        </h4>
        {rows.length > 0 ? (
          <ul aria-labelledby={headingId} className="m-0 mt-2 list-none p-0">
            {rows.map((r) => (
              <li
                key={r.no}
                className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-border py-1.5 last:border-0"
              >
                <span>
                  <span className="font-medium">{r.no}</span> · {r.to} · {r.amount}
                </span>
                <Button
                  ref={(el) => {
                    deleteRefs.current[r.no] = el;
                  }}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    say("");
                    setAsking(r.no);
                  }}
                >
                  Delete<span className="sr-only"> invoice {r.no}</span>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="m-0">No invoices.</p>
            <Button
              ref={resetRef}
              variant="outline"
              size="sm"
              onClick={() => {
                setRows(all);
                say("");
                setResetting(true);
              }}
            >
              Reset example
            </Button>
          </div>
        )}
      </div>

      <AlertDialog
        open={asking !== null}
        onOpenChange={(next) => {
          if (!next && asking) {
            setAsking(null);
            say(`Cancelled. Invoice ${asking} is kept.`);
          }
        }}
      >
        <AlertDialogContent
          onCloseAutoFocus={(e) => {
            // After Cancel, focus goes back to the row's Delete button as usual.
            if (!deleted.current) return;
            deleted.current = false;
            e.preventDefault();
            (afterDelete.current ?? resetRef.current ?? headingRef.current)?.focus();
            afterDelete.current = null;
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invoice {asking}?</AlertDialogTitle>
            <AlertDialogDescription>It is erased for good, and its number cannot be used again.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={l.cancel} />
            <AlertDialogAction
              variant={l.action}
              onClick={(e) => {
                e.preventDefault();
                if (asking) remove(asking);
              }}
            >
              Delete invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Outcome>{said}</Outcome>
    </div>
  );
}

export const DLG005: RuleExamples = {
  id: "DLG-005",
  examples: [
    {
      kind: "do",
      title: "The destructive button is red",
      caption: (
        <>
          Press <em>Delete</em> on a row. The person asked for it, and <em>Delete invoice</em> is still red, with{" "}
          <em>Cancel</em> in outline. The colour is a last cue that the wrong row may be about to go, and the label says
          the same in words.
        </>
      ),
      Demo: () => <Invoices look="danger" />,
    },
    {
      kind: "dont",
      title: "Drawn like any main button",
      caption: (
        <>
          <em>Delete invoice</em> looks just like <em>Save</em> elsewhere in the product. Nothing in its look says that
          this step erases something for good.
        </>
      ),
      Demo: () => <Invoices look="plain" />,
    },
    {
      kind: "dont",
      title: "Cancel styled as the main button",
      caption: (
        <>
          <em>Cancel</em> is filled, to steer people away from deleting, while <em>Delete invoice</em> stays red. The
          styles now push towards the answer the product prefers, and the safe choice looks like the main one.
        </>
      ),
      Demo: () => <Invoices look="steer" />,
    },
  ],
};
