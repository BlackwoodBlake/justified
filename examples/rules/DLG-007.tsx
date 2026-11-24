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
import { NativeSelect } from "@blackwoodblake/justified-shadcn/native-select";
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";

import { DialogPicture, drawnRing, Outcome, Still, useSay } from "./dialog";
import { FocusLine, PlainDialog, useFocusReadout } from "./focus-demo";
import type { RuleExamples } from "./frame";

/*
 * DLG-007: Tab stays inside a modal dialog and the page behind it is out of use.
 *
 * One scene, a meal planner, in two builds. The Do is the system's Dialog.
 * The Don't is a hand-made dialog (PlainDialog from DLG-006) that moves focus
 * in, returns it and says aria-modal="true", but holds nothing: Tab walks on
 * into the week behind the backdrop, where a button can still be pressed.
 * That is the only thing wrong with it.
 *
 * The dialog has selects and no typed text, so closing it loses nothing
 * that would need a question first.
 */

const DAYS = ["Monday", "Tuesday", "Wednesday"];
const RECIPES = ["Lentil soup", "Roast squash", "Mushroom pasta"];
const SERVINGS = ["1", "2", "3", "4", "5", "6"];

type Plan = Record<string, string>;
type Choice = { day: string; recipe: string; servings: string };
const first: Choice = { day: DAYS[0], recipe: RECIPES[0], servings: "2" };

function PlanForm({
  formId,
  choice,
  setChoice,
  onSubmit,
}: {
  formId: string;
  choice: Choice;
  setChoice: (c: Choice) => void;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <form id={formId} noValidate onSubmit={onSubmit} className="grid gap-4">
      <Field label="Day">
        <NativeSelect value={choice.day} onChange={(e) => setChoice({ ...choice, day: e.target.value })}>
          {DAYS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Recipe">
        <NativeSelect value={choice.recipe} onChange={(e) => setChoice({ ...choice, recipe: e.target.value })}>
          {RECIPES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Servings">
        <NativeSelect value={choice.servings} onChange={(e) => setChoice({ ...choice, servings: e.target.value })}>
          {SERVINGS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </NativeSelect>
      </Field>
    </form>
  );
}

function Planner({ plain }: { plain: boolean }) {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<Plan>({});
  const [choice, setChoice] = useState<Choice>(first);
  const [said, say] = useSay();
  const rootRef = useRef<HTMLDivElement>(null);
  const readout = useFocusReadout(rootRef);
  const formId = useId();

  const show = () => {
    say("");
    setChoice(first);
    readout.start();
    readout.read(150);
    setOpen(true);
  };

  const close = (message?: string) => {
    setOpen(false);
    if (message) say(message);
    readout.read(250);
  };

  const add = (e: FormEvent) => {
    e.preventDefault();
    setPlan((p) => ({ ...p, [choice.day]: `${choice.recipe} for ${choice.servings}` }));
    close(`Added. ${choice.day}: ${choice.recipe} for ${choice.servings}.`);
  };

  const footer = (cancel: ReactNode) => (
    <>
      {cancel}
      <Button type="submit" form={formId}>
        Add to plan
      </Button>
    </>
  );

  return (
    <div ref={rootRef} className="flex w-full flex-col items-center gap-4">
      {plain ? (
        <Still note="Tab past Add to plan goes to Mon in the week behind the dialog.">
          <DialogPicture
            title="Plan a meal"
            footer={
              <>
                <Button variant="outline" tabIndex={-1}>
                  Cancel
                </Button>
                <Button tabIndex={-1} className={undefined}>
                  Add to plan
                </Button>
              </>
            }
          >
            <span className="mb-1.5 block font-medium text-foreground">Day</span>
            <span className="block h-10 rounded-md border border-input bg-background px-3 text-sm leading-10 text-foreground">
              Monday
            </span>
          </DialogPicture>
          <div className="mt-2 rounded-lg border border-border bg-background p-3 opacity-70">
            <span className="mb-1 block text-xs font-semibold">This week</span>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" tabIndex={-1} className={drawnRing}>
                Mon
              </Button>
              <Button variant="ghost" size="sm" tabIndex={-1}>
                Tue
              </Button>
              <Button variant="ghost" size="sm" tabIndex={-1}>
                Wed
              </Button>
            </div>
          </div>
        </Still>
      ) : (
        <Still note="Tab on Add to plan goes round to the close icon, Cancel. Shift+Tab on it goes back.">
          <DialogPicture
            title="Plan a meal"
            footer={
              <>
                <Button variant="outline" tabIndex={-1}>
                  Cancel
                </Button>
                <Button tabIndex={-1} className={drawnRing}>
                  Add to plan
                </Button>
              </>
            }
          >
            <span className="mb-1.5 block font-medium text-foreground">Day</span>
            <span className="block h-10 rounded-md border border-input bg-background px-3 text-sm leading-10 text-foreground">
              Monday
            </span>
          </DialogPicture>
        </Still>
      )}

      <div className="w-full max-w-sm rounded-lg border border-border bg-background p-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="m-0 text-base font-semibold">This week</h4>
          <Button variant="outline" size="sm" onClick={show}>
            Plan a meal
          </Button>
        </div>
        {plain && open && (
          <PlainDialog
            title="Plan a meal"
            onEscape={() => close("Cancelled.")}
            focusIn
            returnFocus
            modal
            inPlace
            escapeAnywhere
          >
            <div className="mt-4">
              <PlanForm formId={formId} choice={choice} setChoice={setChoice} onSubmit={add} />
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              {footer(
                <Button variant="outline" onClick={() => close("Cancelled.")}>
                  Cancel
                </Button>,
              )}
            </div>
          </PlainDialog>
        )}
        <ul className="m-0 mt-2 list-none p-0">
          {DAYS.map((d) => (
            <li key={d} className="flex items-center gap-2 border-b border-border py-1 last:border-0">
              <Button
                variant="ghost"
                size="sm"
                className="w-14 justify-start px-2"
                onClick={() => say(`You pressed ${d.slice(0, 3)} in the week.`)}
              >
                {d.slice(0, 3)}
              </Button>
              <span className="text-muted-foreground">{plan[d] ?? "Nothing planned"}</span>
            </li>
          ))}
        </ul>
        <Button variant="link" size="sm" className="mt-1 px-0" onClick={() => say("You pressed Shopping list.")}>
          Shopping list
        </Button>
      </div>

      {!plain && (
        <Dialog
          open={open}
          onOpenChange={(next) => {
            if (!next) close("Cancelled.");
          }}
        >
          <DialogContent closeLabel="Cancel">
            <DialogHeader>
              <DialogTitle>Plan a meal</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <PlanForm formId={formId} choice={choice} setChoice={setChoice} onSubmit={add} />
            </DialogBody>
            <DialogFooter>
              {footer(
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>,
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <FocusLine text={readout.text} empty="Open the dialog, then press Tab, to see where focus goes." />
      <Outcome>{said}</Outcome>
    </div>
  );
}

export const DLG007: RuleExamples = {
  id: "DLG-007",
  examples: [
    {
      kind: "do",
      title: "Tab goes round inside the dialog",
      caption: (
        <>
          Press <em>Plan a meal</em> and press Tab until you pass <em>Add to plan</em>: focus goes round to the close
          icon, named <em>Cancel</em> because it throws the choices away, and Shift+Tab on it goes back to{" "}
          <em>Add to plan</em>. The line under the example never names anything behind the dialog. The days in the week
          and <em>Shopping list</em> cannot be reached by Tab. A click on the dimmed page does not press them: it closes
          the dialog, as <em>Cancel</em> does.
        </>
      ),
      Demo: () => <Planner plain={false} />,
    },
    {
      kind: "dont",
      title: "Tab walks on into the page behind",
      caption: (
        <>
          A hand-made dialog that says it is modal but holds nothing. Press <em>Plan a meal</em> and Tab past{" "}
          <em>Add to plan</em>: focus goes to <em>Mon</em> in the week behind the dimmed page, and the line under the
          example says so. Press Enter: it works while the dialog is still open. Escape still closes the dialog from
          there. The backdrop stops the mouse; nothing stops the keyboard.
        </>
      ),
      Demo: () => <Planner plain />,
    },
  ],
};
