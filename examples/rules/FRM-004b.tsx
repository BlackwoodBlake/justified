import { Button } from "@blackwoodblake/justified-shadcn/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@blackwoodblake/justified-shadcn/dialog";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { Textarea } from "@blackwoodblake/justified-shadcn/textarea";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { DialogPicture, drawnRing, Outcome, Still, useSay } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * FRM-004b (a guideline, our own choice): before closing a dialog or sheet
 * that does not fill the screen would throw away unsaved changes, ask. When
 * nothing would be lost, close at once. FRM-004a is the same for a
 * full-screen dialog.
 *
 * Built here and not on discard.tsx because this rule needs three things that
 * file does not have: a close icon named Cancel, a value the product filled in
 * (today's date), and the exception for one small change. A change is a value
 * that differs from what the dialog started with. Two or more changed
 * controls, or any change in a multi-line field, ask; one change in one
 * short control does not.
 *
 * The Do asks on every way out (Cancel, the close icon, Escape, a press on
 * the backdrop). The Don't asks on Cancel, the icon and Escape, but a press on
 * the backdrop skips the question.
 */

type Spec = {
  name: string;
  label: string;
  /** What the dialog starts with. A change is a value that differs from this. */
  start: string;
  type?: string;
  multiline?: boolean;
  inputMode?: "numeric";
  missing?: string;
};

type Ending = "empty" | "small" | "discarded" | "lost" | "saved";

const today = "2026-11-24";

const shiftFields: Spec[] = [
  { name: "task", label: "Task", start: "", missing: "Enter the task for this shift." },
  { name: "date", label: "Date", start: today, type: "date", missing: "Enter the date of the shift." },
  {
    name: "needed",
    label: "Volunteers needed",
    start: "",
    inputMode: "numeric",
    missing: "Enter how many volunteers you need.",
  },
];

const renameFields: Spec[] = [
  { name: "name", label: "Name", start: "Weekend rota", missing: "Enter a name for the rota." },
];

function ChangeDialog({
  open,
  setOpen,
  title,
  saveLabel,
  fields,
  question,
  lossText,
  discardLabel,
  skipQuestion,
  onEnd,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  saveLabel: string;
  fields: Spec[];
  question: string;
  lossText: string;
  discardLabel: string;
  /** The Don't: a press on the backdrop closes at once, without the question. */
  skipQuestion?: boolean;
  onEnd: (ending: Ending, values: Record<string, string>) => void;
}) {
  const initial = Object.fromEntries(fields.map((f) => [f.name, f.start]));
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [inline, setInline] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  // The field that took focus after a send. Its message is read with the field, so only its region stays quiet.
  const [quiet, setQuiet] = useState<string | undefined>();
  const formId = useId();
  const questionId = useId();
  const lossId = useId();
  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});
  const questionCancel = useRef<HTMLButtonElement>(null);
  // Where focus was when the person asked to leave, so going back returns there.
  const before = useRef<HTMLElement | null>(null);
  const goingBack = useRef(false);

  // A change is a value that differs from the start. Typing and deleting again is no change.
  const changed = fields.filter((f) => values[f.name].trim() !== f.start.trim());
  const asks = changed.length >= 2 || changed.some((f) => f.multiline);

  // Start from the beginning each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setValues(initial);
    setErrors({});
    setQuiet(undefined);
    setInline(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (inline) questionCancel.current?.focus();
    else if (goingBack.current) {
      goingBack.current = false;
      before.current?.focus();
    }
  }, [inline]);

  const end = (ending: Ending) => {
    setInline(false);
    setOpen(false);
    onEnd(ending, values);
  };

  const requestClose = () => {
    if (asks) {
      before.current = document.activeElement as HTMLElement | null;
      setInline(true);
    } else end(changed.length ? "small" : "empty");
  };

  const back = () => {
    goingBack.current = true;
    setInline(false);
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    const found = Object.fromEntries(fields.map((f) => [f.name, values[f.name].trim() ? undefined : f.missing]));
    setErrors(found);
    const first = fields.find((f) => found[f.name]);
    if (first) {
      const el = fieldRefs.current[first.name];
      // After Enter in the field itself, focus does not move, so the error must be announced.
      setQuiet(document.activeElement !== el ? first.name : undefined);
      el?.focus();
      return;
    }
    end("saved");
  };

  const change = (f: Spec, v: string) => {
    setValues((all) => ({ ...all, [f.name]: v }));
    setQuiet(undefined);
    if (errors[f.name] && v.trim()) setErrors((all) => ({ ...all, [f.name]: undefined }));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) return;
        // In the question, Escape and a press on the backdrop do what its Cancel does: back to the form.
        if (inline) back();
        else requestClose();
      }}
    >
      <DialogContent
        // The close icon throws the input away as Cancel does, so it carries the same name (FRM-003).
        closeLabel="Cancel"
        aria-describedby={inline ? lossId : undefined}
        // While the question shows, its own Cancel is the way back. The icon stays in the page so focus can return to it.
        className={inline ? "[&_[data-slot=dialog-close-icon]]:hidden" : undefined}
        onPointerDownOutside={(e) => {
          if (skipQuestion && !inline) {
            e.preventDefault();
            end(asks ? "lost" : changed.length ? "small" : "empty");
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{inline ? <span id={questionId}>{question}</span> : title}</DialogTitle>
          {inline && (
            <DialogDescription>
              <span id={lossId}>{lossText}</span>
            </DialogDescription>
          )}
        </DialogHeader>

        {/* The form stays in the page while the question shows, so every value is kept. */}
        <div hidden={inline}>
          <DialogBody>
            <form id={formId} noValidate onSubmit={save} className="grid gap-4">
              {fields.map((f) => (
                <Field key={f.name} label={f.label} error={errors[f.name]} announce={quiet !== f.name}>
                  {f.multiline ? (
                    <Textarea
                      ref={(el) => {
                        fieldRefs.current[f.name] = el;
                      }}
                      rows={4}
                      value={values[f.name]}
                      onChange={(e) => change(f, e.target.value)}
                    />
                  ) : (
                    <Input
                      ref={(el) => {
                        fieldRefs.current[f.name] = el;
                      }}
                      type={f.type}
                      inputMode={f.inputMode}
                      autoComplete="off"
                      value={values[f.name]}
                      onChange={(e) => change(f, e.target.value)}
                    />
                  )}
                </Field>
              ))}
            </form>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={requestClose}>
              Cancel
            </Button>
            <Button type="submit" form={formId}>
              {saveLabel}
            </Button>
          </DialogFooter>
        </div>

        {inline && (
          <DialogFooter>
            {/* Focus lands here when the question replaces the form, and the question is read with it. */}
            <Button ref={questionCancel} variant="outline" aria-describedby={`${questionId} ${lossId}`} onClick={back}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => end("discarded")}>
              {discardLabel}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

const fieldBox = "h-10 rounded-md border border-input bg-background px-3 text-sm leading-10 text-foreground";

function FilledShift() {
  return (
    <DialogPicture
      title="New shift"
      footer={
        <>
          <Button variant="outline" tabIndex={-1}>
            Cancel
          </Button>
          <Button tabIndex={-1}>Add shift</Button>
        </>
      }
    >
      <div className="grid gap-3 text-foreground">
        <div>
          <span className="mb-1 block font-medium">Task</span>
          <span className={`block ${fieldBox}`}>Front desk</span>
        </div>
        <div>
          <span className="mb-1 block font-medium">Date</span>
          <span className={`block ${fieldBox}`}>2026-11-24</span>
        </div>
        <div>
          <span className="mb-1 block font-medium">Volunteers needed</span>
          <span className={`block ${fieldBox}`}>4</span>
        </div>
      </div>
    </DialogPicture>
  );
}

function Question() {
  return (
    <DialogPicture
      title="Discard this shift?"
      footer={
        <>
          <Button variant="outline" tabIndex={-1} className={drawnRing}>
            Cancel
          </Button>
          <Button variant="destructive" tabIndex={-1}>
            Discard shift
          </Button>
        </>
      }
    >
      What you filled in will be lost.
    </DialogPicture>
  );
}

function Shifts({ asksOnEveryWay }: { asksOnEveryWay: boolean }) {
  const [shiftOpen, setShiftOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [rota, setRota] = useState("Weekend rota");
  const [shifts, setShifts] = useState(["Gate duty, 2026-11-28, 2 volunteers"]);
  const [said, say] = useSay();
  const listId = useId();

  const shiftEnded = (ending: Ending, v: Record<string, string>) => {
    if (ending === "saved") {
      setShifts((all) => [
        ...all,
        `${v.task.trim()}, ${v.date}, ${v.needed.trim()} ${v.needed.trim() === "1" ? "volunteer" : "volunteers"}`,
      ]);
      say("Saved. The shift is in the list.");
    } else if (ending === "empty") say("Closed. Nothing was changed, so nothing was asked.");
    else if (ending === "small") say("Closed. One small change is quick to make again, so nothing was asked.");
    else if (ending === "lost") say("Closed at once, with no question. What you filled in is gone.");
    else say("Discarded. No shift was added.");
  };

  const renameEnded = (ending: Ending, v: Record<string, string>) => {
    if (ending === "saved") {
      setRota(v.name.trim());
      say(`Saved. The rota is now called ${v.name.trim()}.`);
    } else if (ending === "empty") say(`Closed. Nothing was changed, and the rota is still called ${rota}.`);
    else
      say(`Closed. One short field is quick to fill in again, so nothing was asked. The rota is still called ${rota}.`);
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {asksOnEveryWay ? (
        <Still note="The question has taken New shift's place. Cancel keeps the fields.">
          <Question />
        </Still>
      ) : (
        <Still note="A press outside closes it, and there is no question.">
          <FilledShift />
        </Still>
      )}

      <div className="w-full max-w-sm rounded-lg border border-border bg-background p-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 id={listId} className="m-0 text-base font-semibold">
            {rota}
          </h4>
          <div className="flex flex-wrap gap-2">
            {asksOnEveryWay && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  say("");
                  setRenameOpen(true);
                }}
              >
                Rename rota
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                say("");
                setShiftOpen(true);
              }}
            >
              New shift
            </Button>
          </div>
        </div>
        <ul aria-labelledby={listId} className="m-0 mt-2 list-none p-0">
          {shifts.map((s, i) => (
            <li key={`${s}-${i}`} className="border-b border-border py-1.5 last:border-0">
              {s}
            </li>
          ))}
        </ul>
      </div>

      <ChangeDialog
        open={shiftOpen}
        setOpen={setShiftOpen}
        title="New shift"
        saveLabel="Add shift"
        fields={shiftFields}
        question="Discard this shift?"
        lossText="What you filled in will be lost."
        discardLabel="Discard shift"
        skipQuestion={!asksOnEveryWay}
        onEnd={shiftEnded}
      />
      {asksOnEveryWay && (
        <ChangeDialog
          open={renameOpen}
          setOpen={setRenameOpen}
          title="Rename rota"
          saveLabel="Save name"
          fields={[{ ...renameFields[0], start: rota }]}
          question="Discard the new name?"
          lossText="The new name will be lost."
          discardLabel="Discard name"
          onEnd={renameEnded}
        />
      )}
      <Outcome>{said}</Outcome>
    </div>
  );
}

export const FRM004b: RuleExamples = {
  id: "FRM-004b",
  examples: [
    {
      kind: "do",
      title: "Ask on every way out, and only when it matters",
      caption: (
        <>
          Open <em>New shift</em>, fill in <em>Task</em> and <em>Volunteers needed</em> (today's date was filled in for
          you, so it is no change) and leave by <em>Cancel</em>, the close icon, Escape or a press outside the dialog.
          Each time the question takes the dialog's place, with focus on <em>Cancel</em>, which brings the fields back.
          Then open <em>Rename rota</em>, type a new name and press Escape: it is one short field, so the dialog closes
          at once.
        </>
      ),
      Demo: () => <Shifts asksOnEveryWay />,
    },
    {
      kind: "dont",
      title: "Cancel and Escape ask, a press outside does not",
      caption: (
        <>
          Fill in <em>Task</em> and <em>Volunteers needed</em>. <em>Cancel</em>, the close icon and Escape ask first,
          but a press outside the dialog closes it at once, and everything typed is gone. The question only helps if
          every way out goes through it.
        </>
      ),
      Demo: () => <Shifts asksOnEveryWay={false} />,
    },
  ],
};
