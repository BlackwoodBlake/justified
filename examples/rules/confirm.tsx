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
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@blackwoodblake/justified-shadcn/dialog";
import { CloseIcon } from "@blackwoodblake/justified-shadcn/icons";
import { useState } from "react";

import { DialogPicture, drawnRing, Outcome, Still, useSay } from "./dialog";

/*
 * One thing that a confirmation can delete, for the examples of DLG-003 and
 * DST-001b. The scene shows the thing and a button that asks before it goes.
 * The question is the system's AlertDialog, drawn first and then live.
 *
 * Once deleted, the scene says so and the same button turns into Reset
 * example, so focus comes back to a button that is still there.
 *
 * "no-cancel" is a Don't for DLG-003: a Dialog with only the action and a
 * close icon. Everything else stays as in the Do, so only the rule's point differs.
 *
 * For the examples only. It is not a component of the system.
 */

export type ConfirmScene = {
  heading: string;
  /** What the scene says while the thing is there, and after it is gone. */
  present: string;
  gone: string;
  trigger: string;
  title: string;
  description: string;
  cancelLabel?: string;
  actionLabel: string;
  deleted: string;
  kept: string;
  way?: "alert" | "no-cancel";
};

export function DeleteOne({ scene }: { scene: ConfirmScene }) {
  const [there, setThere] = useState(true);
  const [open, setOpen] = useState(false);
  const [said, say] = useSay();
  const way = scene.way ?? "alert";
  const cancelLabel = scene.cancelLabel ?? "Cancel";

  const keep = () => {
    if (!open) return;
    setOpen(false);
    say(scene.kept);
  };

  const remove = () => {
    setOpen(false);
    setThere(false);
    say(scene.deleted);
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Still>
        <div className="relative">
          <DialogPicture
            titleClassName={way === "no-cancel" ? "pr-10" : undefined}
            title={scene.title}
            footer={
              <>
                {way === "alert" && (
                  <Button variant="outline" tabIndex={-1} className={drawnRing}>
                    {cancelLabel}
                  </Button>
                )}
                <Button variant="destructive" tabIndex={-1}>
                  {scene.actionLabel}
                </Button>
              </>
            }
          >
            {scene.description}
          </DialogPicture>
          {way === "no-cancel" && (
            <span
              className={`absolute top-3 right-3 inline-flex size-10 items-center justify-center rounded-md text-foreground ${drawnRing}`}
            >
              <CloseIcon className="size-4" />
            </span>
          )}
        </div>
      </Still>

      <div className="flex w-full max-w-sm flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background p-4 text-sm">
        <div>
          <h4 className="m-0 text-base font-semibold">{scene.heading}</h4>
          <p className="m-0 mt-1">{there ? scene.present : scene.gone}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            say("");
            if (there) setOpen(true);
            else {
              setThere(true);
              say("Reset. The example is back as it started.");
            }
          }}
        >
          {there ? scene.trigger : "Reset example"}
        </Button>
      </div>

      {way === "alert" ? (
        <AlertDialog
          open={open}
          onOpenChange={(next) => {
            if (!next) keep();
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{scene.title}</AlertDialogTitle>
              <AlertDialogDescription>{scene.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  remove();
                }}
              >
                {scene.actionLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Dialog
          open={open}
          onOpenChange={(next) => {
            if (!next) keep();
          }}
        >
          <DialogContent
            role="alertdialog"
            onOpenAutoFocus={(e) => {
              // Start on the close icon, so the Don't breaks only DLG-003 and not DLG-004 too.
              e.preventDefault();
              (e.currentTarget as HTMLElement).querySelector<HTMLElement>('[data-slot="dialog-close-icon"]')?.focus();
            }}
          >
            <DialogHeader>
              <DialogTitle>{scene.title}</DialogTitle>
              <DialogDescription>{scene.description}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="destructive" onClick={remove}>
                {scene.actionLabel}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Outcome>{said}</Outcome>
    </div>
  );
}
