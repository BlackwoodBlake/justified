import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@blackwoodblake/justified-shadcn/alert-dialog";
import { Button } from "@blackwoodblake/justified-shadcn/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@blackwoodblake/justified-shadcn/dialog";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { Textarea } from "@blackwoodblake/justified-shadcn/textarea";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

/*
 * Workshop stories for Dialog and AlertDialog.
 * Try: open with the keyboard and see where focus starts; press Escape;
 * make the window narrow and check that Cancel stays first.
 */
const meta = {
  title: "Components/Dialogs",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function EditName() {
  const [name, setName] = useState("Robin");
  const [draft, setDraft] = useState(name);
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="m-0 text-sm">Display name: {name}</p>
      {/* Escape, Cancel and the backdrop all arrive in onOpenChange and keep the old name. */}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (next) setDraft(name);
          setOpen(next);
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline">Edit display name</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit display name</DialogTitle>
            <DialogDescription>Other members see this name next to your comments.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) setName(draft.trim());
              setOpen(false);
            }}
          >
            <DialogBody>
              <Field label="Display name">
                <Input autoComplete="nickname" value={draft} onChange={(e) => setDraft(e.target.value)} />
              </Field>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save name</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const FormDialog: Story = { render: () => <EditName /> };

/* A full-screen dialog asks once before typed text is lost (FRM-004a). The question is the one dialog allowed on top (DLG-002). */
function WriteComment() {
  const [open, setOpen] = useState(false);
  const [asking, setAsking] = useState(false);
  const [text, setText] = useState("");
  const requestClose = () => (text.trim() ? setAsking(true) : setOpen(false));
  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (next) {
            setText("");
            setOpen(true);
          } else requestClose();
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline">Write a comment</Button>
        </DialogTrigger>
        <DialogContent fullScreen>
          <DialogHeader>
            <DialogTitle>Write a comment</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Field label="Comment">
              <Textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} />
            </Field>
          </DialogBody>
          <DialogFooter className="grid grid-cols-2">
            <Button variant="outline" onClick={requestClose}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Post comment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={asking} onOpenChange={setAsking}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard this comment?</AlertDialogTitle>
            <AlertDialogDescription>The text you wrote will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel />
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setAsking(false);
                setOpen(false);
              }}
            >
              Discard comment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const FullScreen: Story = { render: () => <WriteComment /> };

export const DestructiveConfirmation: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Delete board</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete the board Q3 roadmap?</AlertDialogTitle>
          <AlertDialogDescription>Its 26 cards are erased for everyone. This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel />
          <AlertDialogAction variant="destructive">Delete board</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};
