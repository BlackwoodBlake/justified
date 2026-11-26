import rule from "../../rules/one-emphasised-button.js";
import { run } from "../helpers.js";

/** A dialog with this footer. */
const dialog = (footer) => `
export function Rename({ save }) {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader><DialogTitle>Rename folder</DialogTitle></DialogHeader>
        ${footer}
      </DialogContent>
    </Dialog>
  );
}`;

/** A booking form ending in this row of buttons. */
const booking = (row) => `
export function Booking({ book }) {
  return (
    <form onSubmit={book} className="grid gap-4">
      <Field label="Name"><Input autoComplete="name" /></Field>
      ${row}
    </form>
  );
}`;

run("one-emphasised-button", rule, {
  valid: [
    // One filled button and quieter ones.
    dialog(`<DialogFooter>
      <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
      <Button onClick={save}>Save name</Button>
    </DialogFooter>`),
    // No emphasised button at all is fine.
    `export function Report() {
      return (
        <Card>
          <CardHeader><CardTitle>Monthly report, October</CardTitle></CardHeader>
          <CardFooter className="gap-2">
            <Button variant="secondary">Open report</Button>
            <Button variant="ghost">Download PDF</Button>
          </CardFooter>
        </Card>
      );
    }`,
    `export function Keep() {
      return (
        <SheetFooter>
          <Button variant="outline">Keep the new one</Button>
          <Button variant="outline">Keep the old one</Button>
        </SheetFooter>
      );
    }`,
    // A destructive confirmation: the red button is the one emphasised button.
    `export function Remove() {
      return (
        <AlertDialogFooter>
          <AlertDialogCancel />
          <AlertDialogAction variant="destructive">Delete project</AlertDialogAction>
        </AlertDialogFooter>
      );
    }`,
    // shadcn's login card: one filled, one outline.
    `export function Login() {
      return (
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full">Login</Button>
          <Button variant="outline" className="w-full">Login with Google</Button>
        </CardFooter>
      );
    }`,
    // AlertDialogAction made quieter through buttonVariants, as upstream shadcn does it.
    `export function Leave() {
      return (
        <AlertDialogFooter>
          <AlertDialogAction className={buttonVariants({ variant: "outline" })}>Leave</AlertDialogAction>
          <AlertDialogAction>Stay</AlertDialogAction>
        </AlertDialogFooter>
      );
    }`,
    // Branches of a condition never show together.
    dialog(`<DialogFooter>
      <Button variant="outline">Cancel</Button>
      {editing ? <Button>Save changes</Button> : <Button>Create folder</Button>}
    </DialogFooter>`),
    // What the rule cannot be sure of.
    dialog(`<DialogFooter><Button>Save name</Button>{canPublish && <Button>Publish</Button>}</DialogFooter>`),
    dialog(`<DialogFooter><Button>Save name</Button><Button variant={style}>Publish</Button></DialogFooter>`),
    dialog(`<DialogFooter><Button>Save name</Button><Button {...publishProps}>Publish</Button></DialogFooter>`),
    dialog(`<DialogFooter><Button>Save name</Button><Button className={quiet}>Publish</Button></DialogFooter>`),
    dialog(
      `<DialogFooter><Button>Save name</Button><Button className="bg-transparent text-primary">Publish</Button></DialogFooter>`,
    ),
    dialog(`<DialogFooter><Button>Save name</Button><div><Button>Publish</Button></div></DialogFooter>`),
    dialog(`<DialogFooter>{actions.map((a) => <Button key={a}>{a}</Button>)}</DialogFooter>`),
    // Native buttons and DialogClose on its own carry no button style.
    dialog(
      `<DialogFooter><button type="button">Cancel</button><DialogClose>Close</DialogClose><Button>Save name</Button></DialogFooter>`,
    ),
    // The Do: one filled button in the form's row.
    booking(`<div className="flex justify-end gap-2">
      <Button variant="ghost">Cancel</Button>
      <Button variant="outline">Book and pay now</Button>
      <Button type="submit">Book appointment</Button>
    </div>`),
    // A div that is not only buttons, or not directly in a form.
    booking(
      `<div className="flex gap-2"><p>Two ways to book.</p><Button>Book</Button><Button>Book and pay</Button></div>`,
    ),
    `export function Toolbar() { return <div className="flex gap-2"><Button>Save</Button><Button>Publish</Button></div>; }`,
    // A project whose Button defaults to a quieter style.
    {
      code: dialog(`<DialogFooter><Button>Cancel</Button><Button variant="primary">Save</Button></DialogFooter>`),
      options: [{ emphasisedVariants: ["primary"], defaultVariant: "outline" }],
    },
  ],
  invalid: [
    // The Don't: two filled buttons in a form's row, with the values written out.
    {
      code: booking(`<div className="flex flex-wrap justify-end gap-2">
        <Button variant="ghost">Cancel</Button>
        <Button variant="default" onClick={payNow}>Book and pay now</Button>
        <Button type="submit">Book appointment</Button>
      </div>`),
      errors: [
        {
          messageId: "twoEmphasised",
          data: { count: "2", variants: 'variant "default" or "destructive", or no variant' },
        },
      ],
    },
    // Delete in destructive next to Save in default.
    {
      code: `export function Contact() {
        return (
          <CardFooter className="justify-between">
            <Button variant="destructive">Delete contact</Button>
            <Button type="submit">Save contact</Button>
          </CardFooter>
        );
      }`,
      errors: [{ messageId: "twoEmphasised" }],
    },
    // A filled Cancel inside DialogClose next to the filled action.
    {
      code: dialog(`<DialogFooter>
        <DialogClose asChild><Button>Cancel</Button></DialogClose>
        <Button variant="destructive">Delete project</Button>
      </DialogFooter>`),
      errors: [{ messageId: "twoEmphasised" }],
    },
    // AlertDialogAction is filled by default.
    {
      code: `export function Two() {
        return (
          <AlertDialogFooter>
            <AlertDialogCancel />
            <AlertDialogAction>Save</AlertDialogAction>
            <AlertDialogAction className={buttonVariants({ variant: "destructive" })}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        );
      }`,
      errors: [{ messageId: "twoEmphasised" }],
    },
    // Both branches of a variant condition are emphasised.
    {
      code: dialog(
        `<DialogFooter><Button>Save name</Button><Button variant={danger ? "destructive" : "default"}>Publish</Button></DialogFooter>`,
      ),
      errors: [{ messageId: "twoEmphasised" }],
    },
    // Through a fragment and a condition whose larger branch adds one.
    {
      code: `export function Drawer1() {
        return (
          <DrawerFooter>
            <>
              <Button>Submit</Button>
              {x ? <Button className="w-full">Submit and close</Button> : null}
            </>
          </DrawerFooter>
        );
      }`,
      errors: [{ messageId: "twoEmphasised" }],
    },
    {
      code: `export function Sheet1() {
        return <SheetFooter><SheetClose asChild><Button>Close</Button></SheetClose><Button type="submit">Save changes</Button></SheetFooter>;
      }`,
      errors: [{ messageId: "twoEmphasised" }],
    },
  ],
});
