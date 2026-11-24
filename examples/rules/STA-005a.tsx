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
import { Checkbox } from "@blackwoodblake/justified-shadcn/checkbox";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { AlertIcon, CheckIcon, TrashIcon } from "@blackwoodblake/justified-shadcn/icons";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { NativeSelect } from "@blackwoodblake/justified-shadcn/native-select";
import { Children, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

import { DialogPicture, drawnRing, Still } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * STA-005a: show that a sent action is under way until the reply comes.
 *
 * Do 1: a hire form. The button shows a spinner and "Sending request …" for
 * the whole wait, the form keeps its answers, and a polite line that is on
 * the page from the start says what is happening and then how it ended.
 * Do 2: a delete confirmation that waits. Cancel, Escape and the close
 * route are unavailable until the reply, and the dialog says it is working.
 * Don't 1 and 2 are the rule's own: no sign at all, and a dialog that closes
 * on Escape while the delete runs on unseen.
 *
 * Every press is guarded while the request is out (STA-005b), also in the
 * Don'ts, so each Don't breaks only STA-005a.
 */

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 motion-safe:animate-spin" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** The one polite line of an example. It is on the page from the start, so what it gets is heard. */
function Status({ children, tone = "ok" }: { children?: ReactNode; tone?: "ok" | "working" | "failed" }) {
  return (
    <p
      role="status"
      className={`m-0 min-h-10 text-sm ${tone === "failed" ? "font-medium text-destructive" : "text-muted-foreground"}`}
    >
      {Children.toArray(children).some(Boolean) && (
        <span className="flex items-start gap-1.5">
          <span className="mt-0.5 shrink-0">
            {tone === "failed" ? (
              <AlertIcon className="size-4" />
            ) : tone === "working" ? (
              <Spinner />
            ) : (
              <CheckIcon className="size-4 text-success" />
            )}
          </span>
          <span>{children}</span>
        </span>
      )}
    </p>
  );
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Phase = "idle" | "sending" | "sent" | "failed";

function HireForm({ sign }: { sign: boolean }) {
  const [tool, setTool] = useState("Floor sander");
  const [day, setDay] = useState("Monday");
  const [days, setDays] = useState("2");
  const [failNext, setFailNext] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | undefined>();
  const [sent, setSent] = useState(false);
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const daysRef = useRef<HTMLInputElement>(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const send = (e: FormEvent) => {
    e.preventDefault();
    // One send at a time (STA-005b), so a second press never starts another.
    if (busy.current) return;
    if (!/^[1-9]\d*$/.test(days.trim())) {
      setError("Enter the number of days as a whole number, such as 2.");
      setPhase("idle");
      setSent(document.activeElement !== daysRef.current);
      daysRef.current?.focus();
      return;
    }
    setError(undefined);
    setSent(false);
    busy.current = true;
    setPhase("sending");
    timer.current = setTimeout(
      () => {
        busy.current = false;
        setPhase(failNext ? "failed" : "sent");
      },
      sign ? 3000 : 4000,
    );
  };

  const sending = phase === "sending";

  return (
    <form
      noValidate
      onSubmit={send}
      className="grid w-full max-w-sm gap-3 rounded-lg border border-border bg-background p-4"
    >
      <h4 className="m-0 text-base font-semibold">Hire a tool</h4>
      <Field label="Tool">
        <NativeSelect value={tool} onChange={(e) => setTool(e.target.value)}>
          <option>Floor sander</option>
          <option>Tile cutter</option>
          <option>Wallpaper steamer</option>
        </NativeSelect>
      </Field>
      <Field label="Collection day">
        <NativeSelect value={day} onChange={(e) => setDay(e.target.value)}>
          {DAYS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Number of days" error={error} announce={!sent}>
        <Input
          ref={daysRef}
          inputMode="numeric"
          autoComplete="off"
          value={days}
          onChange={(e) => {
            setDays(e.target.value);
            if (error && /^[1-9]\d*$/.test(e.target.value.trim())) setError(undefined);
          }}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          aria-disabled={sending || undefined}
          // A second press does nothing while the first is on its way. The button keeps focus and its place.
          onClick={(e) => {
            if (sending) e.preventDefault();
          }}
          className="min-w-48"
        >
          {sending && sign ? (
            <>
              <Spinner />
              Sending request …
            </>
          ) : (
            "Send hire request"
          )}
        </Button>
      </div>

      <Status tone={sign && sending ? "working" : phase === "failed" ? "failed" : "ok"}>
        {sign && sending && "Sending hire request"}
        {phase === "sent" && "Hire request sent. We will confirm it by email."}
        {phase === "failed" &&
          "The hire request was not sent. The booking system did not answer. Your answers are still here. Try again in a moment."}
      </Status>

      {sign && (
        <Field label="Make the booking system not answer next time" layout="inline">
          <Checkbox
            checked={failNext}
            onCheckedChange={(c) => {
              setFailNext(c === true);
              if (!busy.current) setPhase("idle");
            }}
          />
        </Field>
      )}
    </form>
  );
}

function WorkingButtonStill() {
  return (
    <Still note="The button while the reply is on its way. It keeps its width and its focus.">
      <div className="flex justify-center">
        <Button tabIndex={-1} className={`min-w-48 ${drawnRing}`}>
          <Spinner />
          Sending request …
        </Button>
      </div>
    </Still>
  );
}

function DoSend() {
  return (
    <div className="grid w-full justify-items-center gap-4">
      <WorkingButtonStill />
      <HireForm sign />
    </div>
  );
}

function DontSend() {
  return <HireForm sign={false} />;
}

/* ---------- Dialog that deletes ---------- */

const HIRES = ["Floor sander, 2 days", "Tile cutter, 3 days", "Wallpaper steamer, 1 day"];
const TARGET = "Tile cutter, 3 days";

function DeleteHire({ waits }: { waits: boolean }) {
  const [hires, setHires] = useState(HIRES);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const heading = useRef<HTMLHeadingElement>(null);
  const deleteBtn = useRef<HTMLButtonElement>(null);
  const [resets, setResets] = useState(0);
  // After Start again the row is back, so focus goes to its Delete button, not to the page.
  useEffect(() => {
    if (resets > 0) deleteBtn.current?.focus();
  }, [resets]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const reset = () => {
    clearTimeout(timer.current);
    setHires(HIRES);
    setBusy(false);
    setSaid("");
    setResets((n) => n + 1);
  };

  const remove = () => {
    setBusy(true);
    setSaid("");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      // The row with the focused button goes away: focus goes to the list heading, not to the page.
      if (document.activeElement === deleteBtn.current) heading.current?.focus();
      setHires((h) => h.filter((x) => x !== TARGET));
      setBusy(false);
      setOpen(false);
      // In the Don't the dialog is long gone and says nothing about how it ended.
      if (waits) setSaid(`Deleted: ${TARGET}.`);
    }, 3000);
  };

  // Do: nothing closes the dialog until the reply. Don't: Escape and Cancel close it and the delete runs on.
  const change = (next: boolean) => {
    if (!next && busy && waits) return;
    setOpen(next);
  };

  const gone = !hires.includes(TARGET);

  return (
    <div className="grid w-full max-w-sm justify-items-center gap-4">
      <Still note="The dialog while the delete is on its way.">
        <DialogPicture
          title={`Delete the hire ${TARGET}?`}
          footer={
            <>
              <Button variant="outline" tabIndex={-1} className={waits ? "opacity-50" : undefined}>
                Cancel
              </Button>
              <Button variant="destructive" tabIndex={-1} className={drawnRing}>
                <Spinner />
                Deleting …
              </Button>
            </>
          }
        >
          The hire is removed from the list.
        </DialogPicture>
      </Still>

      <div className="grid w-full gap-2 rounded-lg border border-border bg-background p-4">
        <h4 ref={heading} tabIndex={-1} className="m-0 text-base font-semibold outline-none">
          Current hires
        </h4>
        <ul className="m-0 grid list-none gap-2 p-0">
          {hires.map((h) => (
            <li key={h} className="flex items-center justify-between gap-3 text-sm">
              <span>{h}</span>
              {h === TARGET && (
                <Button ref={deleteBtn} variant="outline" size="sm" onClick={() => setOpen(true)}>
                  <TrashIcon />
                  Delete<span className="sr-only"> hire {h}</span>
                </Button>
              )}
            </li>
          ))}
        </ul>
        {gone && (
          <Button variant="ghost" size="sm" onClick={reset} className="justify-self-start">
            Start again
          </Button>
        )}
      </div>
      <Status>{said}</Status>

      <AlertDialog open={open} onOpenChange={change}>
        <AlertDialogContent
          onEscapeKeyDown={(e) => {
            if (busy && waits) e.preventDefault();
          }}
          onCloseAutoFocus={(e) => {
            // The row is gone, so focus goes to the list heading, as the result of the delete decides.
            if (gone) {
              e.preventDefault();
              heading.current?.focus();
            }
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete the hire {TARGET}?</AlertDialogTitle>
            <AlertDialogDescription>The hire is removed from the list.</AlertDialogDescription>
          </AlertDialogHeader>
          <p role="status" className="sr-only">
            {busy && `Deleting the hire ${TARGET}`}
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel
              aria-disabled={busy && waits ? true : undefined}
              className="aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
              onClick={(e) => {
                if (busy && waits) e.preventDefault();
              }}
            />
            <AlertDialogAction
              variant="destructive"
              aria-disabled={busy || undefined}
              className="min-w-36"
              onClick={(e) => {
                e.preventDefault();
                if (!busy) remove();
              }}
            >
              {busy ? (
                <>
                  <Spinner />
                  Deleting …
                </>
              ) : (
                "Delete hire"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export const STA005a: RuleExamples = {
  id: "STA-005a",
  examples: [
    {
      kind: "do",
      title: "The button works until the reply",
      caption: (
        <>
          Press <em>Send hire request</em>. For three seconds the button shows a spinner and "Sending request …", the
          answers stay in the fields and a line says "Sending hire request". Then the line says how it ended. Tick the
          box and send again to see a failure: the button is ready again and every answer is still there.
        </>
      ),
      Demo: DoSend,
    },
    {
      kind: "dont",
      title: "Nothing changes after the press",
      caption: (
        <>
          Press <em>Send hire request</em>. For four seconds the button looks as before and nothing says that the press
          was taken. Then the result appears with no sign in between.
        </>
      ),
      Demo: DontSend,
    },
    {
      kind: "do",
      title: "A delete that cannot be withdrawn waits",
      caption: (
        <>
          Press <em>Delete</em>, then <em>Delete hire</em>. For three seconds the dialog shows "Deleting …".{" "}
          <em>Cancel</em> looks unavailable and does nothing, and so does Escape. Then the dialog closes, the hire is
          gone and focus is on the list heading. Waiting, not stopping, is our own choice for a delete, which cannot be
          called back.
        </>
      ),
      Demo: () => <DeleteHire waits />,
    },
    {
      kind: "dont",
      title: "Escape closes it while it deletes",
      caption: (
        <>
          Press <em>Delete</em>, then <em>Delete hire</em>, and press Escape or <em>Cancel</em> while it says "Deleting
          …". The dialog closes, the delete carries on and a moment later the hire is gone with no word about it.
        </>
      ),
      Demo: () => <DeleteHire waits={false} />,
    },
  ],
};
