/**
 * shadcn.js: ordinary shadcn code that follows Justified, written for these
 * tests. Every rule's tests treat each snippet as valid, so a rule that
 * reports one of them is too strict.
 *
 * If a new rule reports a snippet, first check whether the snippet really
 * breaks that rule. If it does, fix the snippet so it follows the rule, in
 * a commit of its own; never loosen the snippet to suit a rule.
 */

const button = `
import { Button } from "@/components/ui/button";

export function Toolbar({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  return (
    <div className="flex gap-2">
      <Button variant="outline">Preview</Button>
      <Button onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save draft"}</Button>
      <Button variant="ghost" size="sm">Show history</Button>
      <Button variant="link" asChild>
        <a href="/help/drafts">Read about drafts</a>
      </Button>
    </div>
  );
}
`;

const dialog = `
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RenameProject({ name }: { name: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Rename project</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>The new name shows for everyone on the team.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <Label htmlFor="project-name">Project name</Label>
            <Input id="project-name" name="name" defaultValue={name} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Rename project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
`;

const alertDialog = `
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";

export function DeleteInvoice({ onDelete }: { onDelete: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete invoice</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete invoice 1042?</AlertDialogTitle>
          <AlertDialogDescription>The invoice and its payment history are removed for good.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep invoice</AlertDialogCancel>
          <AlertDialogAction className={buttonVariants({ variant: "destructive" })} onClick={onDelete}>
            Delete invoice
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
`;

const form = `
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const schema = z.object({
  displayName: z.string().min(2, { message: "Enter at least 2 characters." }),
  email: z.string().email({ message: "Enter an email address like name@example.com." }),
});

export function ProfileForm({ save }: { save: (values: z.infer<typeof schema>) => Promise<void> }) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: "", email: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(save)} className="space-y-6">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input autoComplete="nickname" {...field} />
              </FormControl>
              <FormDescription>Shown next to your comments.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving profile..." : "Save profile"}
        </Button>
      </form>
    </Form>
  );
}
`;

const toast = `
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ArchiveButton({ archive, restore }: { archive: () => void; restore: () => void }) {
  return (
    <Button
      variant="outline"
      onClick={() => {
        archive();
        toast("Report archived", {
          description: "You can find it under Archive.",
          duration: Infinity,
          action: { label: "Undo", onClick: restore },
        });
      }}
    >
      Archive report
    </Button>
  );
}

export function notifySaved() {
  toast.success("Settings saved");
}
`;

const checkbox = `
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function TermsChoice({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox id="terms" checked={checked} onCheckedChange={(v) => onChange(v === true)} />
      <Label htmlFor="terms">I accept the terms of service</Label>
    </div>
  );
}
`;

const input = `
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SearchField() {
  return (
    <div className="grid w-full max-w-sm items-center gap-2">
      <Label htmlFor="search">Search orders</Label>
      <Input id="search" type="search" placeholder="Order number or customer" />
    </div>
  );
}

export function EmailField() {
  return (
    <div className="grid w-full max-w-sm items-center gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" autoComplete="email" />
    </div>
  );
}
`;

/** By what each shows. */
export const shadcnValid = { button, dialog, "alert dialog": alertDialog, "form with react-hook-form": form, "toast with sonner": toast, checkbox, input };
