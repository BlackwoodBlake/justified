import { Button } from "@blackwoodblake/justified-shadcn/button";
import { useId, useState } from "react";

import { DialogPicture, drawnRing, Outcome, Still, useSay } from "./dialog";
import { DiscardableDialog, type Ending } from "./discard";
import type { RuleExamples } from "./frame";

/*
 * DLG-002: never open a dialog on top of another one. The question about
 * throwing away typed input replaces the dialog's content instead.
 *
 * Both examples draw the moment after Cancel is pressed in a dialog
 * New note with text typed: in the Do the question has taken the dialog's
 * place, in the Don't a second dialog sits on top of the first. The live
 * dialogs open from New note in the scene and are the system's Dialog; the
 * Don't adds the system's AlertDialog on top, which the rule forbids here.
 */

function DrawnQuestion({ className }: { className?: string }) {
  return (
    <DialogPicture
      className={className}
      title="Discard this note?"
      footer={
        <>
          <Button variant="outline" tabIndex={-1} className={drawnRing}>
            Cancel
          </Button>
          <Button variant="destructive" tabIndex={-1}>
            Discard note
          </Button>
        </>
      }
    >
      What you wrote will be lost.
    </DialogPicture>
  );
}

function Replaced() {
  return (
    <Still note="One dialog. The question has replaced the note, which comes back on Cancel.">
      <DrawnQuestion />
    </Still>
  );
}

function Stacked() {
  return (
    <Still note="Two dialogs. The question sits on top of the note.">
      <div className="relative pb-14">
        <DialogPicture
          title="New note"
          footer={
            <>
              <Button variant="outline" tabIndex={-1}>
                Cancel
              </Button>
              <Button tabIndex={-1}>Save note</Button>
            </>
          }
        >
          <span className="block h-16 rounded-md border border-input bg-background p-2 text-foreground">
            Ask Sam about the
          </span>
        </DialogPicture>
        {/* The backdrop of the second dialog dims the first. */}
        <div className="absolute inset-x-0 top-0 bottom-14 rounded-lg bg-overlay" />
        <div className="absolute inset-x-4 top-14">
          <DrawnQuestion />
        </div>
      </div>
    </Still>
  );
}

function Notes({ stacked }: { stacked: boolean }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(["Order more paper"]);
  const [said, say] = useSay();
  const listId = useId();

  const ended = (ending: Ending, values: Record<string, string>) => {
    if (ending === "saved") {
      setNotes((all) => [...all, values.note.trim()]);
      say("Saved. The note is in the list.");
    } else if (ending === "empty") say("Closed. Nothing was written, so nothing was asked.");
    else say("Discarded. No note was added.");
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {stacked ? <Stacked /> : <Replaced />}

      <div className="w-full max-w-sm rounded-lg border border-border bg-background p-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 id={listId} className="m-0 text-base font-semibold">
            Notes
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              say("");
              setOpen(true);
            }}
          >
            New note
          </Button>
        </div>
        <ul aria-labelledby={listId} className="m-0 mt-2 list-none p-0">
          {notes.map((n, i) => (
            <li key={`${n}-${i}`} className="border-b border-border py-1.5 last:border-0">
              {n}
            </li>
          ))}
        </ul>
      </div>

      <DiscardableDialog
        open={open}
        setOpen={setOpen}
        title="New note"
        saveLabel="Save note"
        fields={[{ name: "note", label: "Note", multiline: true, missing: "Write the note before you save it." }]}
        question="Discard this note?"
        lossText="What you wrote will be lost."
        discardLabel="Discard note"
        way={stacked ? "stacked" : "replace"}
        onEnd={ended}
      />
      <Outcome>{said}</Outcome>
    </div>
  );
}

export const DLG002: RuleExamples = {
  id: "DLG-002",
  examples: [
    {
      kind: "do",
      title: "The question takes the dialog's place",
      caption: (
        <>
          Press <em>New note</em>, write a few words and press <em>Cancel</em>. The question replaces the note in the
          same dialog, with focus on <em>Cancel</em>. Press it, or Escape, and the note comes back as you left it, with
          focus on the <em>Cancel</em> you pressed.
        </>
      ),
      Demo: () => <Notes stacked={false} />,
    },
    {
      kind: "dont",
      title: "A second dialog on top of the first",
      caption: (
        <>
          The same question opens as a new dialog over <em>New note</em>. There are now two layers to keep in mind and
          to close in the right order, and the note is hidden behind a dimmed backdrop.
        </>
      ),
      Demo: () => <Notes stacked />,
    },
  ],
};
