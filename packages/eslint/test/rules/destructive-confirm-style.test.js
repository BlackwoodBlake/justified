import rule from "../../rules/destructive-confirm-style.js";
import { run } from "../helpers.js";

/** An alert dialog with the given footer. */
const alert = (buttons) => `
export function Ask({ onDelete }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant="ghost">Delete</Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete invoice 2026-0412?</AlertDialogTitle>
          <AlertDialogDescription>It is erased for good.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          ${buttons}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}`;

run("destructive-confirm-style", rule, {
  valid: [
    // The Do example, with its values written out.
    alert(
      `<AlertDialogCancel /><AlertDialogAction variant="destructive" onClick={onDelete}>Delete invoice</AlertDialogAction>`,
    ),
    alert(
      `<AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90">Delete project</AlertDialogAction>`,
    ),
    alert(
      `<AlertDialogCancel asChild><Button variant="outline">Cancel</Button></AlertDialogCancel><AlertDialogAction asChild><Button variant="destructive"><Trash2 /> Remove member</Button></AlertDialogAction>`,
    ),
    // shadcn's way: the style through buttonVariants, which is not written out.
    alert(
      `<AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className={buttonVariants({ variant: "destructive" })}>Delete invoice</AlertDialogAction>`,
    ),
    // Not written out: a variant from a lookup, a template class, a spread.
    alert(
      `<AlertDialogCancel className={\`\${steer} ring\`} /><AlertDialogAction variant={l.action}>Delete invoice</AlertDialogAction>`,
    ),
    alert(`<AlertDialogCancel /><AlertDialogAction {...actionProps}>Delete invoice</AlertDialogAction>`),
    alert(`<AlertDialogCancel /><AlertDialogAction>{label}</AlertDialogAction>`),
    // An action that destroys nothing, in its normal style.
    alert(`<AlertDialogCancel /><AlertDialogAction>Send invitation</AlertDialogAction>`),
    // Labels that only end with a destructive word are left to ACT-001a and review.
    alert(`<AlertDialogCancel /><AlertDialogAction>Yes, delete</AlertDialogAction>`),
    // "Cancel subscription" and "Close account" are destructive actions, not Cancel.
    alert(
      `<AlertDialogCancel>Keep subscription</AlertDialogCancel><AlertDialogAction variant="destructive">Cancel subscription</AlertDialogAction>`,
    ),
    alert(`<AlertDialogCancel /><AlertDialogAction variant="destructive">Close account</AlertDialogAction>`),
    // A safe-looking word that still destroys.
    alert(`<AlertDialogCancel /><AlertDialogAction variant="destructive">Send to trash</AlertDialogAction>`),
    // A Cancel Button with no variant beside a red action: the project's default may not be the fill.
    alert(`<Button>Cancel</Button><AlertDialogAction variant="destructive">Delete invoice</AlertDialogAction>`),
    // A filled Cancel in an alert dialog that destroys nothing.
    alert(
      `<AlertDialogCancel variant="default">Stay on page</AlertDialogCancel><AlertDialogAction variant="outline">Leave page</AlertDialogAction>`,
    ),
    // A Cancel whose fill only shows on hover, or whose class is not written out.
    alert(
      `<AlertDialogCancel className="hover:bg-primary/10" /><AlertDialogAction variant="destructive">Delete invoice</AlertDialogAction>`,
    ),
    alert(
      `<AlertDialogCancel className={steer} /><AlertDialogAction variant="destructive">Delete invoice</AlertDialogAction>`,
    ),
    // The component's own hover, and the faded look while disabled.
    alert(
      `<AlertDialogCancel /><Button variant="destructive" className="hover:bg-destructive/90 disabled:opacity-50">Delete project</Button>`,
    ),
    alert(`<AlertDialogCancel /><Button variant="destructive" disabled className="opacity-50">Delete project</Button>`),
    alert(`<AlertDialogCancel /><Button variant="destructive" className="opacity-100">Delete project</Button>`),
    // A plain Dialog may be an edit form whose Delete runs at once with Undo.
    `export function Edit() {
      return (
        <Dialog><DialogContent>
          <DialogFooter>
            <Button variant="ghost" onClick={remove}>Delete contact</Button>
            <Button type="submit">Save contact</Button>
          </DialogFooter>
        </DialogContent></Dialog>
      );
    }`,
    // Outside a dialog.
    `export function Row() { return <Button variant="ghost" size="sm">Delete<span className="sr-only"> invoice 2026-0412</span></Button>; }`,
    `export function Toolbar() { return <Button variant="destructive">Send report</Button>; }`,
    // The trigger sits outside the content.
    `export function T() { return <AlertDialog><AlertDialogTrigger asChild><Button variant="outline">Remove member</Button></AlertDialogTrigger></AlertDialog>; }`,
    // Not reported: a filled Cancel beside a red destructive button. The rule sentence asks only for the danger style on the destructive button.
    alert(
      `<AlertDialogCancel className="border-transparent bg-primary text-primary-foreground hover:bg-primary/90" /><AlertDialogAction variant="destructive">Delete invoice</AlertDialogAction>`,
    ),
    alert(
      `<AlertDialogCancel variant="default">Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-white">Delete project</AlertDialogAction>`,
    ),
    alert(
      `<AlertDialogCancel asChild><Button variant="default">Cancel</Button></AlertDialogCancel><Button variant="destructive">Remove member</Button>`,
    ),
    // A Cancel with variant default beside a red Delete project
    `
    export const A = () => (<AlertDialog><AlertDialogContent><AlertDialogFooter>
      <AlertDialogCancel variant="default">Cancel</AlertDialogCancel>
      <AlertDialogAction variant="destructive">Delete project</AlertDialogAction>
    </AlertDialogFooter></AlertDialogContent></AlertDialog>)`,
    // A tonal Cancel beside a red Delete project
    `
    export const A = () => (<AlertDialog><AlertDialogContent><AlertDialogFooter>
      <AlertDialogCancel className="bg-primary/10 text-primary hover:bg-primary/20">Cancel</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90">Delete project</AlertDialogAction>
    </AlertDialogFooter></AlertDialogContent></AlertDialog>)`,
    // A Cancel through asChild beside a red Delete
    `
    export const A = () => (<AlertDialog><AlertDialogContent><AlertDialogFooter>
      <AlertDialogCancel asChild><Button>Cancel</Button></AlertDialogCancel>
      <AlertDialogAction asChild><Button variant="destructive">Delete</Button></AlertDialogAction>
    </AlertDialogFooter></AlertDialogContent></AlertDialog>)`,
    // A filled Keep my plan beside a red Cancel subscription
    `
    export const A = () => (<AlertDialog><AlertDialogContent><AlertDialogFooter>
      <AlertDialogCancel variant="default">Keep my plan</AlertDialogCancel>
      <AlertDialogAction variant="destructive">Cancel subscription</AlertDialogAction>
    </AlertDialogFooter></AlertDialogContent></AlertDialog>)`,
    // A filled Cancel button beside a red Remove member
    `
    export const A = () => (<AlertDialog><AlertDialogContent><AlertDialogFooter>
      <Button variant="default" onClick={close}>Cancel</Button>
      <Button variant="destructive" onClick={remove}>Remove member</Button>
    </AlertDialogFooter></AlertDialogContent></AlertDialog>)`,
    // A Cancel that fills only on hover
    `
    export const A = () => (<AlertDialog><AlertDialogContent><AlertDialogFooter>
      <AlertDialogCancel className="hover:bg-primary hover:text-primary-foreground">Cancel</AlertDialogCancel>
      <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
    </AlertDialogFooter></AlertDialogContent></AlertDialog>)`,
    // An action labelled Cancel that cancels a booking is the destructive button, so it may be red
    `
    export const A = () => (<AlertDialog><AlertDialogContent><AlertDialogFooter>
      <AlertDialogCancel>Keep booking</AlertDialogCancel>
      <AlertDialogAction variant="destructive">Cancel</AlertDialogAction>
    </AlertDialogFooter></AlertDialogContent></AlertDialog>)`,
  ],
  invalid: [
    // The plain Don't, with its values written out.
    {
      code: alert(`<AlertDialogCancel /><AlertDialogAction variant="default">Delete invoice</AlertDialogAction>`),
      errors: [{ messageId: "missingDanger", data: { text: "Delete invoice" } }],
    },
    {
      // shadcn's AlertDialogAction with no variant looks like the main button.
      code: alert(
        `<AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={onDelete}>Delete project</AlertDialogAction>`,
      ),
      errors: [{ messageId: "missingDanger" }],
    },
    {
      code: alert(
        `<AlertDialogCancel asChild><Button variant="outline">Cancel</Button></AlertDialogCancel><Button onClick={revoke}><KeyRound /> Revoke key</Button>`,
      ),
      errors: [{ messageId: "missingDanger", data: { text: "Revoke key" } }],
    },
    // The danger style on Cancel, or on an action that destroys nothing.
    {
      code: alert(
        `<AlertDialogCancel className="bg-destructive text-white">Cancel</AlertDialogCancel><AlertDialogAction variant="destructive">Delete invoice</AlertDialogAction>`,
      ),
      errors: [{ messageId: "redCancel" }],
    },
    {
      code: alert(
        `<Button variant="destructive" onClick={close}>Cancel</Button><AlertDialogAction variant="destructive">Delete invoice</AlertDialogAction>`,
      ),
      errors: [{ messageId: "redCancel" }],
    },
    {
      code: alert(`<AlertDialogCancel /><AlertDialogAction variant="destructive">Send invitation</AlertDialogAction>`),
      errors: [{ messageId: "redSafe", data: { text: "Send invitation" } }],
    },
    {
      code: alert(`<AlertDialogCancel /><AlertDialogAction variant="destructive">Save changes</AlertDialogAction>`),
      errors: [{ messageId: "redSafe" }],
    },
    // Cancel filled while the destructive action is quiet.
    {
      code: alert(
        `<Button onClick={close}>Cancel</Button><AlertDialogAction variant="outline">Delete invoice</AlertDialogAction>`,
      ),
      errors: [{ messageId: "filledCancel", data: { text: "Delete invoice" } }, { messageId: "missingDanger" }],
    },
    {
      code: alert(
        `<AlertDialogCancel className="bg-primary text-primary-foreground" /><AlertDialogAction variant="ghost">Remove member</AlertDialogAction>`,
      ),
      errors: [{ messageId: "filledCancel" }, { messageId: "missingDanger" }],
    },
    // Cancel given the fill on purpose beside a red destructive button: the Don't example, written out.
    // A destructive button faded while it can be pressed.
    {
      code: alert(
        `<AlertDialogCancel /><AlertDialogAction variant="destructive" className="opacity-60">Delete invoice</AlertDialogAction>`,
      ),
      errors: [{ messageId: "faded", data: { className: "opacity-60" } }],
    },
    {
      code: alert(
        `<AlertDialogCancel /><Button className={cn("bg-destructive/60 text-white")} disabled={!typed}>Delete project</Button>`,
      ),
      errors: [{ messageId: "faded", data: { className: "bg-destructive/60" } }],
    },
  ],
});
