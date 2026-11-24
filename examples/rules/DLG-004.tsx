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
import { useState } from "react";

import { DialogPicture, drawnRing, Outcome } from "./dialog";
import type { RuleExamples } from "./frame";

/* DLG-004: a destructive confirmation opens with focus on Cancel. */

function DeleteProject({ focusOn }: { focusOn: "cancel" | "delete" }) {
  const [open, setOpen] = useState(false);
  const [said, setSaid] = useState("");

  const close = (outcome: string) => {
    setSaid(outcome);
    setOpen(false);
  };

  // A drawn ring, the same as the real focus ring, on the button where focus starts.
  const ring = drawnRing;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* A picture of the dialog as it opens. The live one opens from the button below. */}
      <div aria-hidden="true" inert className="w-full max-w-sm">
        <DialogPicture
          title="Delete the project Autumn 2026?"
          footer={
            <>
              <Button variant="outline" tabIndex={-1} className={focusOn === "cancel" ? ring : undefined}>
                Cancel
              </Button>
              <Button variant="destructive" tabIndex={-1} className={focusOn === "delete" ? ring : undefined}>
                Delete project
              </Button>
            </>
          }
        >
          Its 14 tasks and their files are removed for everyone. This cannot be undone.
        </DialogPicture>
        <p className="mt-2 mb-0 text-center text-xs text-muted-foreground">
          Focus starts on <em>{focusOn === "cancel" ? "Cancel" : "Delete project"}</em>
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setSaid("");
          setOpen(true);
        }}
      >
        Try it: open the dialog
      </Button>
      {/* Escape and Cancel both close through onOpenChange, with nothing changed (DLG-001). */}
      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          if (!next && open) close("Nothing changed. Autumn 2026 is still there.");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete the project Autumn 2026?</AlertDialogTitle>
            <AlertDialogDescription>
              Its 14 tasks and their files are removed for everyone. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel />
            <AlertDialogAction
              variant="destructive"
              // Only the Don't moves first focus here. The Do keeps AlertDialog's own start on Cancel.
              data-autofocus={focusOn === "delete" ? "" : undefined}
              onClick={(e) => {
                e.preventDefault();
                close("Autumn 2026 was deleted. (Only in this example: open it again to retry.)");
              }}
            >
              Delete project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Outcome>{said}</Outcome>
    </div>
  );
}

export const DLG004: RuleExamples = {
  id: "DLG-004",
  examples: [
    {
      kind: "do",
      title: "Focus starts on Cancel",
      caption: (
        <>
          The dialog opens with focus on <em>Cancel</em>. Open it with the keyboard and press Enter at once: nothing is
          lost. To delete, move to <em>Delete project</em> with Tab first.
        </>
      ),
      Demo: () => <DeleteProject focusOn="cancel" />,
    },
    {
      kind: "dont",
      title: "Focus starts on the destructive button",
      caption: (
        <>
          The dialog opens with focus on <em>Delete project</em>. The same habit, pressing Enter to get the dialog out
          of the way, now deletes the project. The person never chose it.
        </>
      ),
      Demo: () => <DeleteProject focusOn="delete" />,
    },
  ],
};
