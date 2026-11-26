import rule from "../../rules/confirm-button-last.js";
import { run } from "../helpers.js";

/** A dialog with this footer. */
const dialog = (footer) => `
export function Renew({ renew }) {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader><DialogTitle>Renew your library loan for two more weeks?</DialogTitle></DialogHeader>
        ${footer}
      </DialogContent>
    </Dialog>
  );
}`;

/** An alert dialog with this footer. */
const alert = (footer) => `
export function Remove({ remove }) {
  return (
    <AlertDialog>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Delete the project Autumn 2026?</AlertDialogTitle></AlertDialogHeader>
        ${footer}
      </AlertDialogContent>
    </AlertDialog>
  );
}`;

run("confirm-button-last", rule, {
  valid: [
    // Cancel first, the confirming button last.
    dialog(`<DialogFooter>
      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
      <Button onClick={renew}>Renew loan</Button>
    </DialogFooter>`),
    alert(`<AlertDialogFooter>
      <AlertDialogCancel />
      <AlertDialogAction variant="destructive" onClick={remove}>Delete project</AlertDialogAction>
    </AlertDialogFooter>`),
    // Two buttons that fill the footer, in the same order (the Do "Buttons fill the width").
    dialog(`<DialogFooter className="grid grid-cols-2">
      <Button variant="outline">Cancel</Button>
      <Button>Order prints</Button>
    </DialogFooter>`),
    // A single button.
    dialog(`<DialogFooter><DialogClose asChild><Button>Done</Button></DialogClose></DialogFooter>`),
    // DialogClose around the confirming button is not Cancel.
    dialog(`<DialogFooter>
      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
      <DialogClose asChild><Button>Show clinics</Button></DialogClose>
    </DialogFooter>`),
    // No AlertDialogAction and no Cancel: which button confirms takes judgement.
    alert(`<AlertDialogFooter>
      <Button variant="outline" onClick={signOut}>Sign out</Button>
      <Button onClick={stay}>Stay signed in</Button>
    </AlertDialogFooter>`),
    dialog(`<DialogFooter><Button>Save</Button><Button variant="outline">Close</Button></DialogFooter>`),
    // Stacked at every width: the exception for stacked buttons.
    dialog(`<DialogFooter className="sm:flex-col">
      <Button>Renew loan</Button><Button variant="outline">Cancel</Button>
    </DialogFooter>`),
    dialog(`<DialogFooter className="grid">
      <Button>Renew loan</Button><Button variant="outline">Cancel</Button>
    </DialogFooter>`),
    // Reversed only while stacked, as in shadcn's own footer below sm.
    dialog(`<DialogFooter className="flex-col-reverse">
      <Button variant="outline">Cancel</Button><Button>Renew loan</Button>
    </DialogFooter>`),
    // Multi-step: the way out alone at the leading edge, the forward step last.
    dialog(`<DialogFooter>
      <Button variant="ghost">Cancel</Button>
      <Button variant="outline">Change bike</Button>
      <Button>Choose a time</Button>
    </DialogFooter>`),
    // Several actions, the last one confirming.
    alert(`<AlertDialogFooter>
      <AlertDialogCancel />
      <AlertDialogAction variant="outline">Don't save</AlertDialogAction>
      <AlertDialogAction>Save</AlertDialogAction>
    </AlertDialogFooter>`),
    // Order classes that keep the confirming button last.
    dialog(`<DialogFooter>
      <Button className="order-last">Renew loan</Button>
      <Button variant="outline">Cancel</Button>
    </DialogFooter>`),
    // Children the rule cannot be sure of.
    dialog(
      `<DialogFooter>{canRenew && <Button>Renew loan</Button>}<Button variant="outline">Cancel</Button></DialogFooter>`,
    ),
    dialog(
      `<DialogFooter>{footer(<DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>)}</DialogFooter>`,
    ),
    dialog(`<DialogFooter>{actions.map((a) => <Button key={a}>{a}</Button>)}</DialogFooter>`),
    dialog(
      `<DialogFooter><Button>Renew loan</Button><div><Button variant="outline">Cancel</Button></div></DialogFooter>`,
    ),
    dialog(`<DialogFooter><Button>Renew loan</Button><Button variant="outline">{cancelLabel}</Button></DialogFooter>`),
    dialog(
      `<DialogFooter className={footerClass}><Button>Renew loan</Button><Button variant="outline">Cancel</Button></DialogFooter>`,
    ),
    dialog(
      `<DialogFooter className="max-sm:flex-row-reverse"><Button variant="outline">Cancel</Button><Button>Renew</Button></DialogFooter>`,
    ),
    dialog(
      `<DialogFooter><Button variant="outline" className={cls}>Cancel</Button><Button>Renew</Button></DialogFooter>`,
    ),
    // Wrong in the code but right on screen is LAY-002's concern, not this rule's.
    dialog(`<DialogFooter className="flex-row-reverse sm:flex-row-reverse">
      <Button>Renew loan</Button><Button variant="outline">Cancel</Button>
    </DialogFooter>`),
    // Not a dialog footer.
    `export function Bar() { return <div className="flex"><Button>Save</Button><Button variant="outline">Cancel</Button></div>; }`,
    `export function Card1() { return <CardFooter><Button>Save</Button><Button variant="outline">Cancel</Button></CardFooter>; }`,
    // "Cancel" with more words is an action, not the way out.
    dialog(
      `<DialogFooter><Button variant="outline">Keep booking</Button><Button variant="destructive">Cancel booking</Button></DialogFooter>`,
    ),
  ],
  invalid: [
    // The Don't "Confirming button first", written with a real footer.
    {
      code: dialog(`<DialogFooter className="flex-row flex-wrap justify-end">
        <Button onClick={join}>Join waitlist</Button>
        <Button variant="outline">Cancel</Button>
      </DialogFooter>`),
      errors: [{ messageId: "cancelLast", line: 9 }],
    },
    {
      code: dialog(`<DialogFooter>
        <Button type="submit">Save name</Button>
        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
      </DialogFooter>`),
      errors: [{ messageId: "cancelLast" }],
    },
    {
      code: dialog(`<DialogFooter><Button>Renew</Button><DialogClose>Cancel</DialogClose></DialogFooter>`),
      errors: [{ messageId: "cancelLast" }],
    },
    // AlertDialogAction before AlertDialogCancel.
    {
      code: alert(`<AlertDialogFooter>
        <AlertDialogAction variant="destructive" onClick={remove}>Delete project</AlertDialogAction>
        <AlertDialogCancel>Keep project</AlertDialogCancel>
      </AlertDialogFooter>`),
      errors: [{ messageId: "cancelLast" }],
    },
    // A button after the confirming one.
    {
      code: alert(`<AlertDialogFooter>
        <AlertDialogCancel />
        <AlertDialogAction onClick={update}>Update now</AlertDialogAction>
        <Button variant="ghost" onClick={later}>Remind me later</Button>
      </AlertDialogFooter>`),
      errors: [{ messageId: "buttonAfterConfirm" }],
    },
    // Through a fragment.
    {
      code: alert(
        `<AlertDialogFooter><><AlertDialogAction>Archive</AlertDialogAction><AlertDialogCancel /></></AlertDialogFooter>`,
      ),
      errors: [{ messageId: "cancelLast" }],
    },
    // Classes that reverse the row.
    {
      code: dialog(`<DialogFooter className="sm:flex-row-reverse">
        <Button variant="outline">Cancel</Button>
        <Button>Renew loan</Button>
      </DialogFooter>`),
      errors: [{ messageId: "reordered" }],
    },
    {
      code: dialog(`<DialogFooter className={cn("gap-3", "flex-row-reverse")}>
        <Button variant="outline">Cancel</Button>
        <Button>Renew loan</Button>
      </DialogFooter>`),
      errors: [{ messageId: "reordered" }],
    },
    {
      code: dialog(`<DialogFooter>
        <DialogClose asChild><Button variant="outline" className="sm:order-last">Cancel</Button></DialogClose>
        <Button>Renew loan</Button>
      </DialogFooter>`),
      errors: [{ messageId: "reordered" }],
    },
    {
      code: alert(`<AlertDialogFooter>
        <AlertDialogCancel />
        <AlertDialogAction className="order-first">Delete project</AlertDialogAction>
      </AlertDialogFooter>`),
      errors: [{ messageId: "reordered" }],
    },
  ],
});
