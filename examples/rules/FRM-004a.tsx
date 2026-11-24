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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@blackwoodblake/justified-shadcn/dialog";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { CloseIcon } from "@blackwoodblake/justified-shadcn/icons";
import { Textarea } from "@blackwoodblake/justified-shadcn/textarea";
import { useId, useRef, useState, type FormEvent } from "react";

import { drawnRing, Outcome } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * FRM-004a: before closing a full-screen dialog throws away unsaved
 * changes, ask once. When nothing would be lost, close at once.
 *
 * Each example first draws the dialog as it looks on a phone. "Try it"
 * opens the real one over the whole window. It starts empty, so a change
 * is any text that differs from that.
 */

const ring = drawnRing;

/** A drawing of the full-screen dialog on a phone, with a review typed in. */
function Phone({ asking }: { asking: boolean }) {
  return (
    <div
      aria-hidden="true"
      inert
      className="relative flex h-80 w-60 flex-col overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-sm"
    >
      <div className="flex items-center gap-2 border-b border-border px-2 py-2">
        <span className="inline-flex size-8 items-center justify-center">
          <CloseIcon className="size-4" />
        </span>
        <span className="text-sm font-semibold">Write a review</span>
      </div>
      <div className="flex-1 p-3 text-sm">
        <p className="m-0 font-medium">Harbour Lane Hotel</p>
        <p className="mt-2 mb-0 rounded-md border border-input p-2">
          Quiet room, friendly staff and breakfast until eleven. The only downside was the slow lift.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-border p-3">
        <span className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium">
          Cancel
        </span>
        <span className="inline-flex h-9 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground">
          Publish review
        </span>
      </div>
      {asking && (
        <div className="absolute inset-0 flex items-center justify-center bg-overlay p-3">
          <div className="w-full rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg">
            <p className="m-0 text-sm font-semibold">Discard this review?</p>
            <p className="mt-1 mb-0 text-xs text-muted-foreground">The text you wrote will be lost.</p>
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="outline" size="sm" tabIndex={-1} className={ring}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" tabIndex={-1}>
                Discard review
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WriteReview({ asks }: { asks: boolean }) {
  const [open, setOpen] = useState(false);
  const [asking, setAsking] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [said, setSaid] = useState("");
  const tryRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const formId = useId();

  // A change is text that differs from what the view started with: nothing.
  const changed = text.trim() !== "";

  const finish = (outcome: string) => {
    setAsking(false);
    setOpen(false);
    setSaid(outcome);
    // Focus goes back to Try it: the full-screen dialog returns it to the button that opened it.
  };

  const requestClose = () => {
    if (asks && changed) setAsking(true);
    else
      finish(changed ? "Closed. The review you wrote is gone." : "Closed. Nothing was written, so nothing was asked.");
  };

  const publish = (e: FormEvent) => {
    e.preventDefault();
    if (!changed) {
      setError("Write a few words before you publish the review.");
      textRef.current?.focus();
      return;
    }
    finish("Published. Thank you for your review.");
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Phone asking={asks} />
      <p className="m-0 -mt-2 text-center text-xs text-muted-foreground">
        {asks ? "Cancel and the close icon ask before the review is lost" : "Cancel and the close icon close at once"}
      </p>
      <Button
        ref={tryRef}
        variant="outline"
        size="sm"
        onClick={() => {
          setText("");
          setError(undefined);
          setSaid("");
          setOpen(true);
        }}
      >
        Try it: write a review
      </Button>
      <Outcome>{said}</Outcome>

      {/* Escape, the close icon and Cancel all go through requestClose, so none of them skips the question. */}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) requestClose();
        }}
      >
        {/* The close icon discards as Cancel does, so it carries the same name (FRM-003). */}
        <DialogContent fullScreen closeLabel="Cancel">
          <DialogHeader>
            <DialogTitle>Write a review</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <form id={formId} noValidate onSubmit={publish} className="grid gap-2">
              <p className="m-0 text-sm font-medium">Harbour Lane Hotel</p>
              <Field label="Your review" hint="What should other guests know?" error={error} announce={false}>
                <Textarea
                  ref={textRef}
                  rows={6}
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    if (error && e.target.value.trim()) setError(undefined);
                  }}
                />
              </Field>
            </form>
          </DialogBody>
          <DialogFooter className="grid grid-cols-2">
            <Button variant="outline" onClick={requestClose}>
              Cancel
            </Button>
            <Button type="submit" form={formId}>
              Publish review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* The one short question a full-screen dialog may have on top (DLG-002). Escape here does what its Cancel does. */}
      <AlertDialog
        open={asking}
        onOpenChange={(next) => {
          if (!next) setAsking(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard this review?</AlertDialogTitle>
            <AlertDialogDescription>The text you wrote will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel />
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                finish("Discarded. The review you wrote is gone.");
              }}
            >
              Discard review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Do() {
  return <WriteReview asks />;
}

function Dont() {
  return <WriteReview asks={false} />;
}

export const FRM004a: RuleExamples = {
  id: "FRM-004a",
  examples: [
    {
      kind: "do",
      title: "Ask once before the review is lost",
      caption: (
        <>
          Open the dialog, type a few words and press <em>Cancel</em>, the close icon or Escape. The same question opens
          each time, with focus on its own <em>Cancel</em>, which keeps every word. Open it again and close it without
          typing: it closes at once.
        </>
      ),
      Demo: Do,
    },
    {
      kind: "dont",
      title: "Close at once and lose the text",
      caption: (
        <>
          <em>Cancel</em>, the close icon and Escape close the dialog straight away. A person who pressed the icon by
          mistake, or meant to go back to the page for a moment, loses everything they wrote.
        </>
      ),
      Demo: Dont,
    },
  ],
};
