import rule from "../../rules/no-destructive-autofocus.js";
import { run } from "../helpers.js";

/** An alert dialog as shadcn's docs write it, with the given footer. */
const alert = (footer, before = "") => `
export function DeleteProject({ onDelete }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant="destructive">Delete project</Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete the project Autumn 2026?</AlertDialogTitle>
          <AlertDialogDescription>Its 14 tasks are removed for everyone.</AlertDialogDescription>
        </AlertDialogHeader>
        ${before}
        <AlertDialogFooter>
          ${footer}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}`;

/** The live example's pattern: one component, its focus chosen by a prop. */
const shared = (
  uses,
  {
    exported = false,
    attribute = `data-autofocus={focusOn === "delete" ? "" : undefined}`,
    param = "{ focusOn }",
  } = {},
) => `
${exported ? "export " : ""}function DeleteProject(${param}) {
  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogTitle>Delete the project?</AlertDialogTitle>
        <AlertDialogFooter>
          <AlertDialogCancel />
          <AlertDialogAction variant="destructive" ${attribute}>Delete project</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
export const examples = [
  ${uses}
];`;

run("no-destructive-autofocus", rule, {
  valid: [
    // The Do: focus on Cancel.
    alert(`<AlertDialogCancel autoFocus>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>Delete project</AlertDialogAction>`),
    alert(`<Button variant="outline" data-autofocus="">Keep project</Button>
          <Button variant="destructive" onClick={onDelete}>Delete project</Button>`),
    // A destructive button outside a dialog.
    `export const Row = ({ remove }) => <Button variant="destructive" autoFocus onClick={remove}>Remove row</Button>;`,
    // Autofocus on a button that is not destructive, in a dialog.
    `export const Warn = ({ stay }) => (
      <AlertDialogContent><AlertDialogFooter><Button data-autofocus="" onClick={stay}>Stay signed in</Button></AlertDialogFooter></AlertDialogContent>
    );`,
    // Values that never set it, or that the code does not show.
    alert(`<AlertDialogAction variant="destructive" autoFocus={false}>Delete project</AlertDialogAction>`),
    alert(`<AlertDialogAction variant="destructive" data-autofocus={undefined}>Delete project</AlertDialogAction>`),
    alert(`<AlertDialogAction variant="destructive" autoFocus={startHere}>Delete project</AlertDialogAction>`),
    // Every use of the shared component keeps focus off the destructive button.
    shared(`{ kind: "do", Demo: () => <DeleteProject focusOn="cancel" /> }`),
    shared(`<DeleteProject />`, { param: `{ focusOn = "cancel" }` }),
    shared(`<DeleteProject mode="cancel" />`, { param: "props", attribute: `autoFocus={props.mode === "delete"}` }),
    shared(`<DeleteProject focusDelete={false} />`, {
      attribute: `data-autofocus={focusDelete && ""}`,
      param: "{ focusDelete }",
    }),
    // onOpenAutoFocus that focuses Cancel, or something other than a destructive button's ref.
    `export function Confirm({ remove }) {
      const cancel = useRef(null);
      const del = useRef(null);
      return (
        <AlertDialogContent onOpenAutoFocus={(e) => { e.preventDefault(); cancel.current?.focus(); }}>
          <AlertDialogCancel ref={cancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction ref={del} variant="destructive" onClick={remove}>Delete project</AlertDialogAction>
        </AlertDialogContent>
      );
    }`,
    `export const Picture = () => (
      <DialogContent role="alertdialog" onOpenAutoFocus={(e) => { e.preventDefault(); e.currentTarget.querySelector("[data-slot=close]")?.focus(); }}>
        <Button variant="destructive">Delete file</Button>
      </DialogContent>
    );`,
    // A form in a confirmation whose destructive button is not its submit button.
    alert(
      `<AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" type="button" onClick={onDelete}>Delete project</AlertDialogAction>`,
      `<form onSubmit={(e) => e.preventDefault()}><Input aria-label="Project name" /></form>`,
    ),
    // A form in a Dialog with a destructive submit is left to review.
    `export const Close = () => (
      <DialogContent><form><Input name="password" /><Button type="submit" variant="destructive">Close account</Button></form></DialogContent>
    );`,
    // No type: whether it submits depends on the Button in use.
    `export const Typed = () => (
      <AlertDialogContent><form><Input name="name" /><Button variant="destructive">Delete project</Button></form></AlertDialogContent>
    );`,
  ],
  invalid: [
    {
      code: alert(`<AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction autoFocus onClick={onDelete}>Delete project</AlertDialogAction>`),
      errors: [{ messageId: "autofocus", data: { attribute: "autoFocus" } }],
    },
    {
      code: alert(`<AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" data-autofocus="">Erase all data</AlertDialogAction>`),
      errors: [{ messageId: "autofocus", data: { attribute: "data-autofocus" } }],
    },
    {
      // In a Dialog, by text.
      code: `export const Discard = ({ discard }) => (
        <DialogContent><DialogFooter><DialogClose asChild><Button variant="outline">Keep editing</Button></DialogClose>
        <Button autoFocus={true} onClick={discard}>Discard changes</Button></DialogFooter></DialogContent>
      );`,
      errors: [{ messageId: "autofocus" }],
    },
    {
      // A condition in a component used elsewhere: reported where it is written.
      code: shared(`<DeleteProject focusOn="cancel" />`, { exported: true }),
      errors: [{ messageId: "autofocus" }],
    },
    {
      code: alert(
        `<AlertDialogAction variant="destructive" autoFocus={first ? true : undefined}>Delete project</AlertDialogAction>`,
      ),
      errors: [{ messageId: "autofocus" }],
    },
    {
      code: alert(`<AlertDialogAction variant="destructive" autoFocus={step === 2}>Delete project</AlertDialogAction>`),
      errors: [{ messageId: "autofocus" }],
    },
    {
      // The live Don't: reported on the use that focuses the destructive button, not on the Do.
      code: shared(`{ kind: "do", Demo: () => <DeleteProject focusOn="cancel" /> },
  { kind: "dont", Demo: () => <DeleteProject focusOn="delete" /> }`),
      errors: [
        { messageId: "autofocusHere", data: { component: "DeleteProject", attribute: "data-autofocus" }, line: 17 },
      ],
    },
    {
      code: shared(`<DeleteProject mode="delete" />`, {
        param: "props",
        attribute: `autoFocus={props.mode === "delete"}`,
      }),
      errors: [{ messageId: "autofocusHere" }],
    },
    {
      code: shared(`<DeleteProject />`, { param: `{ focusOn = "delete" }` }),
      errors: [{ messageId: "autofocusHere" }],
    },
    {
      code: shared(`<DeleteProject focusDelete />`, {
        attribute: `data-autofocus={focusDelete && ""}`,
        param: "{ focusDelete }",
      }),
      errors: [{ messageId: "autofocusHere" }],
    },
    {
      // A use whose props the code does not show: reported on the attribute.
      code: shared(`<DeleteProject focusOn={mode} />`),
      errors: [{ messageId: "autofocus" }],
    },
    {
      // Used as a value, so not every use is known.
      code: shared(`{ Demo: DeleteProject }`),
      errors: [{ messageId: "autofocus" }],
    },
    {
      code: `export function Confirm({ remove }) {
        const del = useRef(null);
        return (
          <AlertDialogContent onOpenAutoFocus={(e) => { e.preventDefault(); del.current?.focus(); }}>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction ref={del} variant="destructive" onClick={remove}>Delete project</AlertDialogAction>
          </AlertDialogContent>
        );
      }`,
      errors: [{ messageId: "openAutoFocus" }],
    },
    {
      code: alert(
        `<AlertDialogCancel>Cancel</AlertDialogCancel>`,
        `<form onSubmit={onDelete}>
          <Input aria-label="Type the project name" />
          <Button type="submit" variant="destructive">Delete project</Button>
        </form>`,
      ),
      errors: [{ messageId: "formSubmit" }],
    },
  ],
});
