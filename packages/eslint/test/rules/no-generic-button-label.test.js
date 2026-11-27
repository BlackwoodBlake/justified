import rule from "../../rules/no-generic-button-label.js";
import { run } from "../helpers.js";

/** An alert dialog footer with the given buttons. */
const alert = (buttons) => `
export function Ask({ title }) {
  return (
    <AlertDialog>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          ${buttons}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}`;

/** A dialog footer with the given buttons. */
const dialog = (buttons) => `
export function Edit() {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader><DialogTitle>New invoice</DialogTitle></DialogHeader>
        <DialogFooter>
          ${buttons}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}`;

run("no-generic-button-label", rule, {
  valid: [
    // The Do example, with its values written out.
    alert(`<AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Book appointment</AlertDialogAction>`),
    dialog(
      `<DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button type="submit">Create invoice</Button>`,
    ),
    // A message that only informs: OK as its lone button.
    alert(`<AlertDialogAction>OK</AlertDialogAction>`),
    dialog(`<DialogClose asChild><Button>OK</Button></DialogClose>`),
    `export function Saved() { return <div className="flex flex-col gap-2"><p>Your changes are saved.</p><Button onClick={close}>OK</Button></div>; }`,
    // OK confirming a date or time picker.
    `export function Due({ date, setDate }) {
      return (
        <Popover>
          <PopoverTrigger asChild><Button variant="outline">Pick a due date</Button></PopoverTrigger>
          <PopoverContent>
            <Calendar mode="single" selected={date} onSelect={setDate} />
            <div className="flex justify-end gap-2"><Button variant="ghost">Cancel</Button><Button>OK</Button></div>
          </PopoverContent>
        </Popover>
      );
    }`,
    `export function Time() {
      return (
        <Dialog><DialogContent>
          <TimePicker value={time} onChange={setTime} />
          <DialogFooter><Button variant="outline">Cancel</Button><Button>OK</Button></DialogFooter>
        </DialogContent></Dialog>
      );
    }`,
    `export function Native() { return <div><input type="date" /><button type="button">Cancel</button><button type="button">OK</button></div>; }`,
    // More than the bare word, which needs judgement, is left to review.
    alert(
      `<AlertDialogCancel>No, keep it</AlertDialogCancel><AlertDialogAction>Yes, delete project</AlertDialogAction>`,
    ),
    dialog(`<Button>OK, got it</Button><Button variant="outline">Show me how</Button>`),
    // Fixed single verbs and Cancel are allowed by the Exceptions.
    dialog(`<Button variant="outline">Back</Button><Button>Next</Button>`),
    dialog(`<Button variant="outline">Cancel</Button><Button>Done</Button>`),
    // Text that is not written out.
    dialog(`<Button variant="outline">{back}</Button><Button>{go}</Button>`),
    dialog(`<Button variant="outline">{t("cancel")}</Button><Button>{t("yes")}</Button>`),
    `export function Booking({ back, go }) { return <><Button variant="outline">{back}</Button><Button>{go}</Button></>; }`,
    // A child element makes the text unknown.
    dialog(`<Button variant="outline">Cancel</Button><Button><Check /> Yes</Button>`),
    // OK whose neighbour comes from a condition.
    dialog(`{canCancel && <Button variant="outline">Cancel</Button>}<Button>OK</Button>`),
    // Choices, not actions.
    `export function Helpful() { return <ToggleGroup type="single"><ToggleGroupItem value="y">Yes</ToggleGroupItem><ToggleGroupItem value="n">No</ToggleGroupItem></ToggleGroup>; }`,
    `export function Helpful({ v }) { return <div><Button aria-pressed={v === "y"}>Yes</Button><Button aria-pressed={v === "n"}>No</Button></div>; }`,
    // Confirm outside an alert dialog's footer needs judgement.
    `export function Step() { return <Button>Confirm</Button>; }`,
    // Submit inputs that name the action, or whose value may come from a spread.
    `export function F() { return <form><input type="submit" value="Create invoice" /></form>; }`,
    `export function F(props) { return <form><input type="submit" {...props} /></form>; }`,
    `export function F() { return <form><input type="text" name="q" /></form>; }`,
    // asChild buttons take the child's words.
    `export function L() { return <Button asChild><a href="/yes">Yes</a></Button>; }`,
  ],
  invalid: [
    // An icon beside the word adds no words.
    {
      code: `import { Send } from "lucide-react";\nexport const A = () => <Button type="submit"><Send /> Submit</Button>;`,
      errors: [{ messageId: "generic" }],
    },
    {
      code: `export const A = () => <Button type="submit"><svg aria-hidden="true" /> Submit</Button>;`,
      errors: [{ messageId: "generic" }],
    },
    // The Don't example, with its values written out.
    {
      code: dialog(`<Button variant="outline">No</Button><Button>Yes</Button>`),
      errors: [
        { messageId: "generic", data: { text: "No" } },
        { messageId: "generic", data: { text: "Yes" } },
      ],
    },
    {
      code: alert(`<AlertDialogCancel>No</AlertDialogCancel><AlertDialogAction>Yes</AlertDialogAction>`),
      errors: [
        { messageId: "generic", data: { text: "No" } },
        { messageId: "generic", data: { text: "Yes" } },
      ],
    },
    {
      code: `export function F() { return <form onSubmit={save}><Input name="amount" /><Button type="submit">Submit</Button></form>; }`,
      errors: [{ messageId: "generic", data: { text: "Submit" } }],
    },
    {
      code: `export function F() { return <form><button type="submit">submit!</button></form>; }`,
      errors: [{ messageId: "generic" }],
    },
    {
      code: `export function F() { return <Button>{"Yes"}</Button>; }`,
      errors: [{ messageId: "generic" }],
    },
    // OK next to another button.
    {
      code: alert(`<AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>OK</AlertDialogAction>`),
      errors: [{ messageId: "genericOk", data: { text: "OK" } }],
    },
    {
      code: dialog(
        `<DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button type="submit">Okay.</Button>`,
      ),
      errors: [{ messageId: "genericOk" }],
    },
    {
      code: `export function F() { return <div className="flex gap-2"><input type="button" value="Cancel" /><input type="submit" value="OK" /></div>; }`,
      errors: [{ messageId: "genericOk" }],
    },
    // Confirm on an alert dialog's action.
    {
      code: alert(`<AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Confirm</AlertDialogAction>`),
      errors: [{ messageId: "confirm" }],
    },
    {
      code: alert(
        `<AlertDialogCancel asChild><Button variant="outline">Cancel</Button></AlertDialogCancel><Button onClick={go}>Confirm</Button>`,
      ),
      errors: [{ messageId: "confirm" }],
    },
    // A submit input with no value.
    {
      code: `export function F() { return <form><input name="q" /><input type="submit" /></form>; }`,
      errors: [{ messageId: "inputNoValue" }],
    },
    {
      code: `export function F() { return <form><input type="submit" value="Submit" /></form>; }`,
      errors: [{ messageId: "generic" }],
    },
  ],
});
