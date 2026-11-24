import { Button } from "@blackwoodblake/justified-shadcn/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@blackwoodblake/justified-shadcn/dialog";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { useId, useRef, useState, type FormEvent } from "react";

import { DialogPicture, drawnRing, Outcome, Still, useSay } from "./dialog";
import { DiscardableDialog, type Ending } from "./discard";
import type { RuleExamples } from "./frame";

/*
 * DLG-001: in a dialog with Cancel, Escape does exactly what Cancel does.
 *
 * Every live dialog here is the system's Dialog, where Escape, Cancel and a
 * click on the backdrop take the same path. Each example first draws the
 * dialog, with a note on what Escape does, and opens the live one from a
 * button in the scene.
 *
 *   - Rename folder: Cancel and Escape close with the old name kept.
 *   - New customer (Do): with something typed, Cancel and Escape ask the same
 *     question, which replaces the dialog's content (DLG-002).
 *   - New customer (Don't): Cancel asks, but Escape closes and the input is lost.
 */

const fieldBox = "h-10 rounded-md border border-input bg-background px-3 text-sm leading-10 text-foreground";

function RenameFolder() {
  const [name, setName] = useState("Invoices 2026");
  const [draft, setDraft] = useState(name);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [sent, setSent] = useState(false);
  const [said, say] = useSay();
  const fieldRef = useRef<HTMLInputElement>(null);
  const formId = useId();

  const show = () => {
    setDraft(name);
    setError(undefined);
    setSent(false);
    say("");
    setOpen(true);
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) {
      setError("Enter a name for the folder.");
      setSent(document.activeElement !== fieldRef.current);
      fieldRef.current?.focus();
      return;
    }
    const unchanged = draft.trim() === name;
    setName(draft.trim());
    setOpen(false);
    say(unchanged ? "Saved. The name is unchanged." : `Renamed. The folder is now called ${draft.trim()}.`);
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Still note="Escape: the same as Cancel. The folder keeps its name.">
        <DialogPicture
          title="Rename folder"
          footer={
            <>
              <Button variant="outline" tabIndex={-1}>
                Cancel
              </Button>
              <Button tabIndex={-1}>Save name</Button>
            </>
          }
        >
          <span className="mb-1.5 block font-medium text-foreground">Folder name</span>
          <span className={`block ${fieldBox}`}>Invoices 2026</span>
        </DialogPicture>
      </Still>

      <div className="flex w-full max-w-sm flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background p-4 text-sm">
        <p className="m-0">
          <span className="font-medium">Folder:</span> {name}
        </p>
        <Button variant="outline" size="sm" onClick={show}>
          Rename folder
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          // Escape, Cancel and the backdrop all arrive here, and all keep the old name.
          if (next || !open) return;
          setOpen(false);
          say(`Cancelled. The folder is still called ${name}.`);
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Rename folder</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <form id={formId} noValidate onSubmit={save}>
              <Field label="Folder name" error={error} announce={!sent}>
                <Input
                  ref={fieldRef}
                  autoComplete="off"
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    setSent(false);
                    if (error && e.target.value.trim()) setError(undefined);
                  }}
                />
              </Field>
            </form>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" form={formId}>
              Save name
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Outcome>{said}</Outcome>
    </div>
  );
}

const customerFields = [
  { name: "name", label: "Name", autoComplete: "name", missing: "Enter the customer's name." },
  { name: "address", label: "Address", autoComplete: "street-address" },
];

function NewCustomer({ escapeAsks }: { escapeAsks: boolean }) {
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState(["Ines Park"]);
  const [said, say] = useSay();
  const listId = useId();

  const ended = (ending: Ending, values: Record<string, string>) => {
    if (ending === "saved") {
      setCustomers((all) => [...all, values.name.trim()]);
      say(`Added. ${values.name.trim()} is now in the list.`);
    } else if (ending === "empty") say("Closed. Nothing was typed, so nothing was asked.");
    else if (ending === "discarded") say("Discarded. Nothing was added.");
    else say("Closed by Escape. Everything you typed is gone, and nobody asked.");
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Still
        note={
          escapeAsks
            ? "After Escape, as after Cancel: the question replaces the form."
            : "Cancel asks first. Escape closes at once, and the input is lost."
        }
      >
        {escapeAsks ? (
          // The Do draws the moment after Escape: the question has replaced the form.
          <DialogPicture
            title="Discard the changes?"
            footer={
              <>
                <Button variant="outline" tabIndex={-1} className={drawnRing}>
                  Cancel
                </Button>
                <Button variant="destructive" tabIndex={-1}>
                  Discard changes
                </Button>
              </>
            }
          >
            What you typed will be lost.
          </DialogPicture>
        ) : (
          <DialogPicture
            title="New customer"
            footer={
              <>
                <Button variant="outline" tabIndex={-1}>
                  Cancel
                </Button>
                <Button tabIndex={-1}>Add customer</Button>
              </>
            }
          >
            <span className="mb-1.5 block font-medium text-foreground">Name</span>
            <span className={`block ${fieldBox}`}>Maya Ortiz</span>
            <span className="mt-3 mb-1.5 block font-medium text-foreground">Address</span>
            <span className={`block ${fieldBox}`}>4 Quay Street</span>
          </DialogPicture>
        )}
      </Still>

      <div className="w-full max-w-sm rounded-lg border border-border bg-background p-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 id={listId} className="m-0 text-base font-semibold">
            Customers
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              say("");
              setOpen(true);
            }}
          >
            New customer
          </Button>
        </div>
        <ul aria-labelledby={listId} className="m-0 mt-2 list-none p-0">
          {customers.map((c, i) => (
            <li key={`${c}-${i}`} className="border-b border-border py-1.5 last:border-0">
              {c}
            </li>
          ))}
        </ul>
      </div>

      <DiscardableDialog
        open={open}
        setOpen={setOpen}
        title="New customer"
        saveLabel="Add customer"
        fields={customerFields}
        question="Discard the changes?"
        lossText="What you typed will be lost."
        discardLabel="Discard changes"
        way={escapeAsks ? "replace" : "escape-closes"}
        onEnd={ended}
      />
      <Outcome>{said}</Outcome>
    </div>
  );
}

export const DLG001: RuleExamples = {
  id: "DLG-001",
  examples: [
    {
      kind: "do",
      title: "Escape keeps the old name, as Cancel does",
      caption: (
        <>
          Press <em>Rename folder</em>, change the name and press Escape. The dialog closes and the folder is still
          called what it was, just as if you had pressed <em>Cancel</em>. Focus goes back to <em>Rename folder</em>.
        </>
      ),
      Demo: RenameFolder,
    },
    {
      kind: "do",
      title: "Escape asks the same question as Cancel",
      caption: (
        <>
          Press <em>New customer</em>, type a name and press Escape. The question that <em>Cancel</em> asks replaces the
          form, with focus on its own <em>Cancel</em>. Escape again, or <em>Cancel</em>, brings back the form with
          everything you typed.
        </>
      ),
      Demo: () => <NewCustomer escapeAsks />,
    },
    {
      kind: "dont",
      title: "Escape closes when Cancel would ask",
      caption: (
        <>
          The same dialog, but only <em>Cancel</em> asks. Type a name and press Escape: the dialog closes at once and
          what you typed is gone. The key people press to back out has lost their work.
        </>
      ),
      Demo: () => <NewCustomer escapeAsks={false} />,
    },
  ],
};
