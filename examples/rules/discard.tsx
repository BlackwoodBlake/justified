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

/*
 * A form dialog for the examples of DLG-001 and DLG-002, built from the
 * system's Dialog. It starts empty, so anything typed is a change.
 *
 * Cancel, Escape and a click on the backdrop all go through requestClose.
 * With nothing typed, the dialog closes at once. With something typed, it
 * asks first, in one of three ways:
 *
 *   - "replace" (the Do): the question replaces the dialog's content, with
 *     Cancel and a named, red action, and focus on Cancel. Cancel and Escape
 *     bring back the form as it was, with focus where it was (DLG-002).
 *   - "escape-closes" (a Don't for DLG-001): Cancel asks, but Escape skips
 *     the question and closes, so the typed input is lost.
 *   - "stacked" (a Don't for DLG-002): the question opens as a second dialog
 *     on top of the first.
 *
 * For the examples only. It is not a component of the system.
 */

export type FieldSpec = {
  name: string;
  label: string;
  autoComplete?: string;
  multiline?: boolean;
  /** The error shown when the field is left empty on sending. */
  missing?: string;
};

export type Ending = "empty" | "discarded" | "lost" | "saved";
export type Way = "replace" | "escape-closes" | "stacked";

export function DiscardableDialog({
  open,
  setOpen,
  title,
  saveLabel,
  fields,
  question,
  lossText,
  discardLabel,
  way,
  onEnd,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  saveLabel: string;
  fields: FieldSpec[];
  question: string;
  lossText: string;
  discardLabel: string;
  way: Way;
  onEnd: (ending: Ending, values: Record<string, string>) => void;
}) {
  const blank = Object.fromEntries(fields.map((f) => [f.name, ""]));
  const [values, setValues] = useState<Record<string, string>>(blank);
  const [asking, setAsking] = useState<"no" | "inline" | "stacked">("no");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [sent, setSent] = useState(false);
  const formId = useId();
  const questionId = useId();
  const lossId = useId();
  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});
  const questionCancel = useRef<HTMLButtonElement>(null);
  // Where focus was when the person asked to leave, so going back returns there.
  const before = useRef<HTMLElement | null>(null);
  const goingBack = useRef(false);

  const changed = Object.values(values).some((v) => v.trim() !== "");

  // Start empty each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setValues(blank);
    setErrors({});
    setSent(false);
    setAsking("no");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (asking === "inline") questionCancel.current?.focus();
    if (asking === "no" && goingBack.current) {
      goingBack.current = false;
      before.current?.focus();
    }
  }, [asking]);

  const end = (ending: Ending) => {
    setAsking("no");
    setOpen(false);
    onEnd(ending, values);
  };

  const requestClose = () => {
    if (!changed) return end("empty");
    before.current = document.activeElement as HTMLElement | null;
    setAsking(way === "stacked" ? "stacked" : "inline");
  };

  const back = () => {
    goingBack.current = true;
    setAsking("no");
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    const found = Object.fromEntries(
      fields.map((f) => [f.name, f.missing && !values[f.name].trim() ? f.missing : undefined]),
    );
    setErrors(found);
    const first = fields.find((f) => found[f.name]);
    if (first) {
      const el = fieldRefs.current[first.name];
      // After Enter in the field itself, focus does not move, so the error must be announced.
      setSent(document.activeElement !== el);
      el?.focus();
      return;
    }
    end("saved");
  };

  const inline = asking === "inline";

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (next) return;
          // In the question, Escape does what its Cancel does: back to the form.
          if (inline) back();
          else requestClose();
        }}
      >
        <DialogContent
          showCloseButton={false}
          onEscapeKeyDown={(e) => {
            if (way === "escape-closes" && asking === "no") {
              // The Don't: Escape skips the question that Cancel asks.
              e.preventDefault();
              end(changed ? "lost" : "empty");
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
                  <Field key={f.name} label={f.label} error={errors[f.name]} announce={!sent}>
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
                        autoComplete={f.autoComplete}
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
              <Button
                ref={questionCancel}
                variant="outline"
                aria-describedby={`${questionId} ${lossId}`}
                onClick={back}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => end("discarded")}>
                {discardLabel}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Only in the Don't for DLG-002: the question as a second dialog on top of the first. */}
      {way === "stacked" && (
        <AlertDialog
          open={asking === "stacked"}
          onOpenChange={(next) => {
            if (!next) setAsking("no");
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{question}</AlertDialogTitle>
              <AlertDialogDescription>{lossText}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel />
              <AlertDialogAction
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  end("discarded");
                }}
              >
                {discardLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );

  function change(f: FieldSpec, v: string) {
    setValues((all) => ({ ...all, [f.name]: v }));
    setSent(false);
    if (errors[f.name] && v.trim()) setErrors((all) => ({ ...all, [f.name]: undefined }));
  }
}
