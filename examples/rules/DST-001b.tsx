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
import { useId, useRef, useState } from "react";

import { DeleteOne } from "./confirm";
import { DialogPicture, drawnRing, Outcome, Still, useSay } from "./dialog";
import type { RuleExamples } from "./frame";
import { Toast, ToastRegion } from "./toast";

/*
 * DST-001b: ask before a step only when it cannot be reversed and destroys
 * something of value, or when a mistake would cost a lot. Never ask before
 * any other step.
 *
 *   - Do: the March readings are stored nowhere else, so deleting them asks
 *     first, in the system's AlertDialog (DLG-003 to DLG-005).
 *   - Do: resetting a dashboard's layout runs at once. The tiles move back to
 *     the default order, and a message with Undo brings back the old order
 *     (DST-001a). The scene starts just after a reset, with the message showing.
 *   - Don't: hiding a column, which the same button shows again, asks first.
 */

function Readings() {
  return (
    <DeleteOne
      scene={{
        heading: "Meter readings for March",
        present: "31 readings, stored only here.",
        gone: "No readings for March.",
        trigger: "Delete March readings",
        title: "Delete the March readings?",
        description: "The 31 readings are stored nowhere else. Once deleted, they cannot be brought back.",
        actionLabel: "Delete readings",
        deleted: "Deleted. The March readings are gone. (In this example, Reset example brings them back.)",
        kept: "Cancelled. The March readings are kept.",
      }}
    />
  );
}

const standard = ["Sales", "Orders", "Visitors"];
const own = ["Visitors", "Sales", "Orders"];

function Dashboard() {
  // The scene starts just after a reset: tiles in the default order, the message showing.
  const [order, setOrder] = useState(standard);
  const [before, setBefore] = useState(own);
  const [message, setMessage] = useState<number | null>(0);
  const [said, say] = useSay();
  const resetRef = useRef<HTMLButtonElement>(null);
  const tilesRef = useRef<HTMLOListElement>(null);
  const headingId = useId();
  const isStandard = order.join() === standard.join();

  const reset = () => {
    say("");
    if (isStandard) {
      say("The layout is already the default one.");
      return;
    }
    setBefore(order);
    setOrder(standard);
    setMessage((m) => (m ?? 0) + 1);
  };

  const undo = () => {
    setOrder(before);
    setMessage(null);
    say("Undone. Your own layout is back.");
    // The message and its Undo are gone; focus goes to the tiles that came back (DST-001a).
    requestAnimationFrame(() => tilesRef.current?.focus());
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="w-full max-w-sm rounded-lg border border-border bg-background p-4 text-sm text-foreground">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 id={headingId} className="m-0 text-base font-semibold">
            Dashboard
          </h4>
          <Button ref={resetRef} variant="outline" size="sm" onClick={reset}>
            Reset layout
          </Button>
        </div>
        <ol
          ref={tilesRef}
          tabIndex={-1}
          aria-labelledby={headingId}
          className="m-0 mt-3 grid list-none grid-cols-3 gap-2 rounded-sm p-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {order.map((t) => (
            <li key={t} className="rounded-md border border-border bg-card p-2 text-center">
              {t}
            </li>
          ))}
        </ol>
      </div>
      <div className="w-full max-w-sm">
        <ToastRegion>
          {message !== null && (
            <Toast
              key={message}
              action={
                <Button variant="outline" size="sm" onClick={undo}>
                  Undo
                </Button>
              }
              onClose={() => {
                setMessage(null);
                requestAnimationFrame(() => resetRef.current?.focus());
              }}
            >
              Layout reset to the default
            </Toast>
          )}
        </ToastRegion>
      </div>
      <Outcome>{said}</Outcome>
    </div>
  );
}

const items = [
  { item: "Desk lamp", price: "$49", stock: "12" },
  { item: "Paper tray", price: "$15", stock: "40" },
];

function Columns() {
  const [shown, setShown] = useState(true);
  const [asking, setAsking] = useState(false);
  const [said, say] = useSay();
  const captionId = useId();

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Still>
        <DialogPicture
          title="Hide the Price column?"
          footer={
            <>
              <Button variant="outline" tabIndex={-1} className={drawnRing}>
                Cancel
              </Button>
              <Button tabIndex={-1}>Hide column</Button>
            </>
          }
        >
          You can show it again with the same button.
        </DialogPicture>
      </Still>

      <div className="w-full max-w-sm rounded-lg border border-border bg-background p-4 text-sm text-foreground">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 id={captionId} className="m-0 text-base font-semibold">
            Stock
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              say("");
              if (shown) setAsking(true);
              else {
                setShown(true);
                say("The Price column is shown.");
              }
            }}
          >
            {shown ? "Hide Price column" : "Show Price column"}
          </Button>
        </div>
        <table aria-labelledby={captionId} className="mt-3 w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="py-1.5 font-medium">Item</th>
              {shown && <th className="py-1.5 font-medium">Price</th>}
              <th className="py-1.5 font-medium">In stock</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.item} className="border-b border-border last:border-0">
                <td className="py-1.5">{r.item}</td>
                {shown && <td className="py-1.5">{r.price}</td>}
                <td className="py-1.5">{r.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog
        open={asking}
        onOpenChange={(next) => {
          if (!next && asking) {
            setAsking(false);
            say("Cancelled. The Price column is still shown.");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hide the Price column?</AlertDialogTitle>
            <AlertDialogDescription>You can show it again with the same button.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel />
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                setAsking(false);
                setShown(false);
                say("The Price column is hidden.");
              }}
            >
              Hide column
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Outcome>{said}</Outcome>
    </div>
  );
}

export const DST001b: RuleExamples = {
  id: "DST-001b",
  examples: [
    {
      kind: "do",
      title: "Ask before data that cannot come back",
      caption: (
        <>
          The March readings are stored nowhere else, so <em>Delete March readings</em> asks first. The question names
          what is lost, starts on <em>Cancel</em> and marks <em>Delete readings</em> as dangerous.
        </>
      ),
      Demo: Readings,
    },
    {
      kind: "do",
      title: "Reset at once, with Undo",
      caption: (
        <>
          The layout has just been reset to the default, with no question, and the message offers <em>Undo</em>, which
          brings back your own order. People seldom do this, but <em>Undo</em> reverses all of it, so there is nothing
          to ask about.
        </>
      ),
      Demo: Dashboard,
    },
    {
      kind: "dont",
      title: "Ask before a step that one click reverses",
      caption: (
        <>
          <em>Hide Price column</em> asks first, although the same button shows the column again. Questions like this
          teach people to confirm without reading, and then the one question that matters is skipped too.
        </>
      ),
      Demo: Columns,
    },
  ],
};
