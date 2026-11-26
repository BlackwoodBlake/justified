import rule from "../../rules/toast-action-stays.js";
import { run } from "../helpers.js";

const sonner = `import { toast } from "sonner";\n`;

run("toast-action-stays", rule, {
  valid: [
    // The action stays until it is used.
    `${sonner}toast("Report archived", { duration: Infinity, action: { label: "Undo", onClick: restore } });`,
    `${sonner}toast.success("Contacts merged", { action: { label: "Undo", onClick: undo }, duration: Number.POSITIVE_INFINITY });`,
    // Toasts without an action are outside the rule.
    `${sonner}toast("Settings saved");`,
    `${sonner}toast.success("Settings saved", { duration: 4000 });`,
    `${sonner}toast.error("Could not save", { description: "Check the connection." });`,
    `${sonner}toast("Saved", { action: undefined });`,
    // A loading toast does not close on a timer.
    `${sonner}toast.loading("Uploading", { action: { label: "Stop", onClick: stop } });`,
    // toast.promise is left alone.
    `${sonner}toast.promise(save(), { loading: "Saving", success: "Saved", error: "Could not save" });`,
    // What the code does not state is left alone.
    `${sonner}toast("Report archived", { duration: keep, action: { label: "Undo", onClick: restore } });`,
    `${sonner}toast("Report archived", { ...defaults, action: { label: "Undo", onClick: restore } });`,
    `${sonner}toast("Report archived", options);`,
    // A toast function from somewhere else.
    `import { toast } from "@/lib/notify";\ntoast("Report archived", { action: { label: "Undo", onClick: restore } });`,
    `toast("Report archived", { action: { label: "Undo", onClick: restore } });`,
    // A Toaster that keeps every toast, in the same file or set by option.
    `${sonner}import { Toaster } from "@/components/ui/sonner";
    export function App() { return <Toaster duration={Infinity} />; }
    export const undo = () => toast("Contact deleted", { action: { label: "Undo", onClick: restore } });`,
    `${sonner}export function App() { return <Toaster toastOptions={{ duration: Infinity }} />; }
    export const undo = () => toast("Contact deleted", { action: { label: "Undo", onClick: restore } });`,
    {
      code: `${sonner}toast("Contact deleted", { action: { label: "Undo", onClick: restore } });`,
      options: [{ toasterDurationInfinity: true }],
    },
    // A cancel that only closes the toast is its close control.
    `${sonner}toast("Report archived", { duration: Infinity, action: { label: "Undo", onClick: restore }, cancel: { label: "Close", onClick: () => {} } });`,
    `${sonner}toast("Report archived", { duration: Infinity, action: { label: "Undo", onClick: restore }, cancel: { label: "Close", onClick: () => toast.dismiss() } });`,
    // A cancel handler in a variable is not followed.
    `${sonner}toast("Report archived", { duration: Infinity, action: { label: "Undo", onClick: restore }, cancel: { label: "Keep", onClick: keep } });`,
    // A custom toast with one action and a close control, that stays.
    `${sonner}toast.custom((t) => (
      <div>
        <p>Report archived. <a href="/help">How archiving works</a></p>
        <Button onClick={restore}>Undo</Button>
        <Button aria-label="Close message" variant="ghost" onClick={() => toast.dismiss(t)}>x</Button>
      </div>
    ), { duration: Infinity });`,
    // A custom toast with only text and a close control has no action.
    `${sonner}toast.custom((t) => <div>Saved <button onClick={() => toast.dismiss(t)}>Dismiss</button></div>);`,
    // Buttons in a loop are not counted.
    `${sonner}toast.custom(() => <div>{actions.map((a) => <Button key={a.id}>{a.label}</Button>)}</div>, { duration: Infinity });`,
    // A hand-built toast with one action and a close button.
    `export function Merged() {
      return (
        <Toast action={<Button variant="outline" size="sm" onClick={undo}>Undo</Button>} onClose={close}>
          Anna Brooks and A. Brooks were merged
        </Toast>
      );
    }`,
    `export function Merged() {
      return (
        <Toast>
          <ToastTitle>Merged</ToastTitle>
          <ToastAction altText="Undo the merge" onClick={undo}>Undo</ToastAction>
          <Button aria-label="Dismiss" onClick={close}>x</Button>
          <ToastClose />
        </Toast>
      );
    }`,
    // A hand-built toast is left to review: its name alone does not show for certain that it is a toast.
    `export function Crowded() {
        return (
          <Toast
            action={
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={undo}>Undo</Button>
                <Button variant="outline" size="sm" onClick={nothing}>View</Button>
                <Button variant="outline" size="sm" onClick={nothing}>Share</Button>
              </div>
            }
          >
            Anna Brooks and A. Brooks were merged
          </Toast>
        );
      }`,
    `export function Failed() {
        return (
          <Toast>
            <ToastTitle>Upload failed</ToastTitle>
            <ToastAction altText="Try again" onClick={retry}>Try again</ToastAction>
            <ToastAction altText="See details" onClick={details}>Details</ToastAction>
            <ToastClose />
          </Toast>
        );
      }`,
    // A link styled as a button is not counted.
    `${sonner}toast.custom((t) => <div>Saved <Button asChild><a href="/archive">Open archive</a></Button> <button onClick={() => toast.dismiss(t)}>Close</button></div>);`,
  ],
  invalid: [
    {
      // The shadcn docs' own example closes after the default few seconds.
      code: `${sonner}toast("Event has been created", {
        description: "Sunday, December 03, 2023 at 9:00 AM",
        action: { label: "Undo", onClick: () => console.log("Undo") },
      });`,
      errors: [{ messageId: "closesWithAction" }],
    },
    {
      code: `${sonner}toast.success("Contacts merged", { duration: 6000, action: { label: "Undo", onClick: undo } });`,
      errors: [{ messageId: "closesWithAction" }],
    },
    {
      code: `${sonner}toast.error("Upload failed", { duration: 10 * 1000, action: { label: "Try again", onClick: retry } });`,
      errors: [{ messageId: "closesWithAction" }],
    },
    {
      code: `import { toast as notify } from "sonner";\nnotify.warning("Sync stopped", { action: <Button onClick={retry}>Try again</Button> });`,
      errors: [{ messageId: "closesWithAction" }],
    },
    {
      code: `import * as Sonner from "sonner";\nSonner.toast.info("Moved to Thursday", { action: { label: "Undo", onClick: undo } });`,
      errors: [{ messageId: "closesWithAction" }],
    },
    {
      // An action that is there only sometimes still closes when it is.
      code: `${sonner}toast("Deleted", { action: canUndo ? { label: "Undo", onClick: undo } : undefined });`,
      errors: [{ messageId: "closesWithAction" }],
    },
    {
      // Undo, plus a cancel that is a second action.
      code: `${sonner}toast("Report archived", {
        duration: Infinity,
        action: { label: "Undo", onClick: restore },
        cancel: { label: "View", onClick: () => router.push("/archive") },
      });`,
      errors: [{ messageId: "cancelIsAction" }],
    },
    {
      code: `${sonner}toast("Report archived", {
        action: { label: "Undo", onClick: restore },
        cancel: { label: "Share", onClick: () => { share(report); } },
      });`,
      errors: [{ messageId: "closesWithAction" }, { messageId: "cancelIsAction" }],
    },
    {
      // Undo, View and Share in one custom toast.
      code: `${sonner}toast.custom((t) => (
        <div>
          <p>Contacts merged</p>
          <Button onClick={undo}>Undo</Button>
          <Button onClick={view}>View</Button>
          <Button onClick={share}>Share</Button>
          <Button aria-label="Close" onClick={() => toast.dismiss(t)}>x</Button>
        </div>
      ), { duration: Infinity });`,
      errors: [{ messageId: "tooManyButtons", data: { count: "3" } }],
    },
    {
      // A custom toast with one action and no duration.
      code: `${sonner}toast.custom((t) => <div>Contacts merged <button onClick={undo}>Undo</button></div>);`,
      errors: [{ messageId: "closesWithAction" }],
    },
  ],
});
