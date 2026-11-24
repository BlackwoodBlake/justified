import { Button } from "@blackwoodblake/justified-shadcn/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@blackwoodblake/justified-shadcn/dialog";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { NativeSelect } from "@blackwoodblake/justified-shadcn/native-select";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { DialogPicture, drawnRing, Outcome, Still, useSay } from "./dialog";
import { DiscardableDialog, type Ending } from "./discard";
import type { RuleExamples } from "./frame";
import { FocusLine, PlainDialog, useFocusReadout } from "./focus-demo";

/*
 * DLG-006: focus moves into a modal dialog when it opens, and back to its
 * opener when it closes, or to a logical place nearby if the opener is gone.
 *
 * The Dos use the system's Dialog. The Don'ts that need a dialog which does
 * not move focus use PlainDialog (focus-demo.tsx), a hand-made one, because the system's
 * Dialog does this right. The last Don't uses the system's Dialog and only
 * leaves out the fallback that the rule asks the product to write.
 *
 * A "Focus is on" line under each scene reads document.activeElement. It is
 * hidden from assistive technology and is not a screen reader. The helpers
 * are in focus-demo.tsx.
 */

const fieldBox = "h-10 rounded-md border border-input bg-background px-3 text-sm leading-10 text-foreground";
const stage = "w-full max-w-sm rounded-lg border border-border bg-background p-4 text-sm";

/* ---------------------------------------------------------------- Add expense */

const expenseFields = [
  { name: "amount", label: "Amount", autoComplete: "off", missing: "Enter an amount, for example 12.50." },
  { name: "category", label: "Category", autoComplete: "off", missing: "Enter a category, for example Meals." },
];

/** The Don't's form: the same fields and the same question before typed input is lost. */
function PlainExpense({ onEnd }: { onEnd: (ending: Ending, values: Record<string, string>) => void }) {
  const [values, setValues] = useState({ amount: "", category: "" });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [sent, setSent] = useState(false);
  const [asking, setAsking] = useState(false);
  const formId = useId();
  const refs = useRef<Record<string, HTMLInputElement | null>>({});

  const changed = values.amount.trim() !== "" || values.category.trim() !== "";
  const request = () => (changed ? setAsking(true) : onEnd("empty", values));

  const save = (e: FormEvent) => {
    e.preventDefault();
    const found = Object.fromEntries(
      expenseFields.map((f) => [f.name, values[f.name as "amount"].trim() ? undefined : f.missing]),
    );
    setErrors(found);
    const first = expenseFields.find((f) => found[f.name]);
    if (first) {
      const el = refs.current[first.name];
      setSent(document.activeElement !== el);
      el?.focus();
      return;
    }
    onEnd("saved", values);
  };

  const change = (name: "amount" | "category", v: string) => {
    setValues((all) => ({ ...all, [name]: v }));
    setSent(false);
    if (errors[name] && v.trim()) setErrors((all) => ({ ...all, [name]: undefined }));
  };

  return (
    <PlainDialog
      title={asking ? "Discard the changes?" : "Add expense"}
      description={asking ? "What you typed will be lost." : undefined}
      onEscape={() => (asking ? setAsking(false) : request())}
      focusIn={false}
      returnFocus={false}
    >
      <div hidden={asking}>
        <form id={formId} noValidate onSubmit={save} className="mt-4 grid gap-4">
          {expenseFields.map((f) => (
            <Field key={f.name} label={f.label} error={errors[f.name]} announce={!sent}>
              <Input
                ref={(el) => {
                  refs.current[f.name] = el;
                }}
                autoComplete={f.autoComplete}
                value={values[f.name as "amount"]}
                onChange={(e) => change(f.name as "amount", e.target.value)}
              />
            </Field>
          ))}
        </form>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={request}>
            Cancel
          </Button>
          <Button type="submit" form={formId}>
            Add expense
          </Button>
        </div>
      </div>
      {asking && (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" autoFocus onClick={() => setAsking(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => onEnd("discarded", values)}>
            Discard changes
          </Button>
        </div>
      )}
    </PlainDialog>
  );
}

function AddExpense({ plain }: { plain: boolean }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState(["Train ticket, 42.00", "Lunch, 11.50"]);
  const [said, say] = useSay();
  const rootRef = useRef<HTMLDivElement>(null);
  const readout = useFocusReadout(rootRef);
  const listId = useId();

  const show = () => {
    say("");
    readout.start();
    readout.read(150);
    setOpen(true);
  };

  const ended = (ending: Ending, values: Record<string, string>) => {
    setOpen(false);
    if (ending === "saved") {
      setRows((all) => [...all, `${values.category.trim()}, ${values.amount.trim()}`]);
      say(`Added. ${values.category.trim()}, ${values.amount.trim()} is in the list.`);
    } else if (ending === "empty") say("Closed. Nothing was typed.");
    else say("Discarded. Nothing was added.");
    readout.read(250);
  };

  return (
    <div ref={rootRef} className="flex w-full flex-col items-center gap-4">
      {plain ? (
        <Still note="Focus stays on Add expense, behind the dialog.">
          <div className="mb-2 flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3">
            <span className="font-semibold">Expenses</span>
            <Button variant="outline" size="sm" tabIndex={-1} className={drawnRing}>
              Add expense
            </Button>
          </div>
          <DialogPicture
            title="Add expense"
            footer={
              <>
                <Button variant="outline" tabIndex={-1}>
                  Cancel
                </Button>
                <Button tabIndex={-1}>Add expense</Button>
              </>
            }
          >
            <span className="mb-1.5 block font-medium text-foreground">Amount</span>
            <span className={`block ${fieldBox}`} />
          </DialogPicture>
        </Still>
      ) : (
        <Still note="Focus is in Amount at once.">
          <DialogPicture
            title="Add expense"
            footer={
              <>
                <Button variant="outline" tabIndex={-1}>
                  Cancel
                </Button>
                <Button tabIndex={-1}>Add expense</Button>
              </>
            }
          >
            <span className="mb-1.5 block font-medium text-foreground">Amount</span>
            <span className={`block ${fieldBox} ${drawnRing}`} />
            <span className="mt-3 mb-1.5 block font-medium text-foreground">Category</span>
            <span className={`block ${fieldBox}`} />
          </DialogPicture>
        </Still>
      )}

      <div className={stage}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 id={listId} className="m-0 text-base font-semibold">
            Expenses
          </h4>
          <Button variant="outline" size="sm" onClick={show}>
            Add expense
          </Button>
        </div>
        <ul aria-labelledby={listId} className="m-0 mt-2 list-none p-0">
          {rows.map((r, i) => (
            <li key={`${r}-${i}`} className="border-b border-border py-1.5 last:border-0">
              {r}
            </li>
          ))}
        </ul>
      </div>

      {plain ? (
        open && <PlainExpense onEnd={ended} />
      ) : (
        <DiscardableDialog
          open={open}
          setOpen={setOpen}
          title="Add expense"
          saveLabel="Add expense"
          fields={expenseFields}
          question="Discard the changes?"
          lossText="What you typed will be lost."
          discardLabel="Discard changes"
          way="replace"
          onEnd={ended}
        />
      )}
      <FocusLine text={readout.text} empty="Open the dialog to see where focus goes." />
      <Outcome>{said}</Outcome>
    </div>
  );
}

/* ----------------------------------------------------------------- Send back */

type Claim = { id: number; who: string; amount: string };
const CLAIMS: Claim[] = [
  { id: 1041, who: "Anna Berg", amount: "86.00" },
  { id: 1042, who: "Omar Haddad", amount: "214.50" },
  { id: 1043, who: "Lena Voss", amount: "40.00" },
];
const REASONS = ["Receipt is missing", "Category does not fit", "Amount is unclear"];

const focusable =
  "rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function ClaimRows({ claims, ring }: { claims: Claim[]; ring?: number }) {
  return (
    <ul className="m-0 mt-2 list-none p-0">
      {claims.map((c) => (
        <li key={c.id} className="flex items-center justify-between gap-3 border-b border-border py-1.5 last:border-0">
          <span>
            Claim {c.id}, {c.who}
          </span>
          <Button
            variant="outline"
            size="sm"
            tabIndex={-1}
            aria-label={`Send back claim ${c.id}`}
            className={ring === c.id ? drawnRing : undefined}
          >
            Send back
          </Button>
        </li>
      ))}
    </ul>
  );
}

function SendBack({ fallback }: { fallback: boolean }) {
  const [claims, setClaims] = useState(CLAIMS);
  const [active, setActive] = useState<Claim | null>(null);
  const [reason, setReason] = useState(REASONS[0]);
  const [said, say] = useSay();
  const rootRef = useRef<HTMLDivElement>(null);
  const readout = useFocusReadout(rootRef);
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  // Where focus goes when the claim that opened the dialog is gone.
  const goTo = useRef<number | "heading" | null>(null);
  const formId = useId();
  const headingId = useId();

  const show = (c: Claim) => {
    say("");
    goTo.current = null;
    setReason(REASONS[0]);
    readout.start();
    readout.read(150);
    setActive(c);
  };

  const reset = () => {
    setClaims(CLAIMS);
    setActive(null);
    say("Reset. The three claims are back.");
    readout.reset();
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!active) return;
    const at = claims.findIndex((c) => c.id === active.id);
    const rest = claims.filter((c) => c.id !== active.id);
    // The claim that took its place, or the one before it, or the heading.
    const next = rest[at] ?? rest[at - 1];
    goTo.current = next ? next.id : "heading";
    setClaims(rest);
    setActive(null);
    say(`Sent back. Claim ${active.id} left the list. Reason: ${reason}.`);
    readout.read(250);
  };

  const noteWith = (n: number) => `After claim ${n} is sent back, focus is on the claim that took its place.`;

  return (
    <div ref={rootRef} className="flex w-full flex-col items-center gap-4">
      {fallback ? (
        <Still note={noteWith(1042)}>
          <div className={stage}>
            <h4 className="m-0 text-base font-semibold">Waiting for approval</h4>
            <ClaimRows claims={[CLAIMS[0], CLAIMS[2]]} ring={1043} />
          </div>
        </Still>
      ) : (
        <Still note="After claim 1042 is sent back, focus is on nothing.">
          <div className={stage}>
            <h4 className="m-0 text-base font-semibold">Waiting for approval</h4>
            <ClaimRows claims={[CLAIMS[0], CLAIMS[2]]} />
          </div>
        </Still>
      )}

      <div ref={root} className={stage}>
        <h4 ref={heading} id={headingId} tabIndex={-1} className={`m-0 text-base font-semibold ${focusable}`}>
          Waiting for approval
        </h4>
        {claims.length === 0 ? (
          <p className="m-0 mt-2 text-muted-foreground">No claims are waiting.</p>
        ) : (
          <ul aria-labelledby={headingId} className="m-0 mt-2 list-none p-0">
            {claims.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 border-b border-border py-1.5 last:border-0"
              >
                <span>
                  Claim {c.id}, {c.who}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  data-claim={c.id}
                  aria-label={`Send back claim ${c.id}`}
                  onClick={() => show(c)}
                >
                  Send back
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog
        open={active !== null}
        onOpenChange={(next) => {
          if (!next) setActive(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          onCloseAutoFocus={(e) => {
            // Only the Do writes the fallback the adapter leaves to the product.
            if (!fallback || goTo.current === null) return;
            e.preventDefault();
            const to = goTo.current;
            goTo.current = null;
            const el =
              to === "heading" ? heading.current : root.current?.querySelector<HTMLElement>(`[data-claim="${to}"]`);
            el?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>Send back claim</DialogTitle>
            <DialogDescription>
              Claim {active?.id} from {active?.who}, {active?.amount}.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <form id={formId} noValidate onSubmit={send}>
              <Field label="Reason">
                <NativeSelect value={reason} onChange={(e) => setReason(e.target.value)}>
                  {REASONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </NativeSelect>
              </Field>
            </form>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" form={formId}>
              Send back claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button variant="ghost" size="sm" onClick={reset}>
        Reset example
      </Button>
      <FocusLine text={readout.text} empty="Send a claim back to see where focus goes." />
      <Outcome>{said}</Outcome>
    </div>
  );
}

export const DLG006: RuleExamples = {
  id: "DLG-006",
  examples: [
    {
      kind: "do",
      title: "Focus goes into the dialog and back to its button",
      caption: (
        <>
          Press <em>Add expense</em>: focus is in <em>Amount</em> at once, and the line under the example says so. Close
          the dialog with <em>Cancel</em>, with Escape, with a click on the dimmed page or by adding an expense: focus
          is on <em>Add expense</em> again each time, and the next Tab goes on from there.
        </>
      ),
      Demo: () => <AddExpense plain={false} />,
    },
    {
      kind: "dont",
      title: "Focus stays behind the dialog and is lost on closing",
      caption: (
        <>
          A hand-made dialog that never moves focus. Press <em>Add expense</em> and look at the line under the example:
          focus is still on the button behind the dialog, and Escape does nothing from there. Tab until you reach the
          dialog and press <em>Cancel</em>: focus is on nothing afterwards, and you have lost your place.
        </>
      ),
      Demo: () => <AddExpense plain />,
    },
    {
      kind: "do",
      title: "The button is gone, so focus goes to the next claim",
      caption: (
        <>
          Press <em>Send back</em> on a claim and then <em>Send back claim</em>. The claim leaves the list and so does
          its button, so focus goes to the claim that took its place, or to the one before it if it was last. Send all
          three back: focus ends on the heading <em>Waiting for approval</em>, above &ldquo;No claims are
          waiting.&rdquo; That choice of places is ours. <em>Cancel</em> and Escape return to the pressed button as
          usual.
        </>
      ),
      Demo: () => <SendBack fallback />,
    },
    {
      kind: "dont",
      title: "The button is gone and focus is lost",
      caption: (
        <>
          The same dialog, but the product writes no fallback. Press <em>Send back</em> and then{" "}
          <em>Send back claim</em>: the button is gone, the system has nowhere to return to, and the line under the
          example says focus is on nothing. A keyboard or screen reader user must find the list again, and in Chrome the
          next Tab starts from the top of the page.
        </>
      ),
      Demo: () => <SendBack fallback={false} />,
    },
  ],
};
