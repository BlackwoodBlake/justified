import rule from "../../rules/enter-sends-form.js";
import { run } from "../helpers.js";

const STOCK = `
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye } from "lucide-react";
`;
const JUSTIFIED = `
import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
`;
const RHF = `
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
`;

run("enter-sends-form", rule, {
  valid: [
    // Implicit submission: with one single-line field and no submit button, Enter still sends the form to onSubmit.
    `${STOCK}
    export const Invite = () => (
      <form onSubmit={form.handleSubmit(onSubmit)}><Input type="email" aria-label="Email address" /><Button type="button" onClick={form.handleSubmit(onSubmit)}>Send invite</Button></form>
    );`,
    `${JUSTIFIED}
    export const Invite = () => (
      <form onSubmit={send}><Field label="Email address"><Input type="email" /></Field><Button>Send invite</Button></form>
    );`,
    `${JUSTIFIED}
    export const Invite = () => (
      <form action={invite}><Field label="Email address"><Input type="email" name="email" /></Field><Button>Send invite</Button></form>
    );`,
    // The Do: a real form with the submit button at the end (Justified).
    `${JUSTIFIED}
    export function Apply() {
      return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Field label="Full name"><Input autoComplete="name" /></Field>
          <Field label="Email address"><Input type="email" autoComplete="email" /></Field>
          <Button variant="outline">Add another address</Button>
          <Button type="submit">Send application</Button>
        </form>
      );
    }`,
    // Stock shadcn: the only button has no type, so it is the submit button.
    `${STOCK}
    export const Invite = () => (
      <form onSubmit={send}><Label htmlFor="e">Email address</Label><Input id="e" type="email" /><Button>Send invite</Button></form>
    );`,
    // Helpers typed as plain buttons before the main one.
    `${STOCK}
    export const SignIn = () => (
      <form onSubmit={signIn}>
        <Input type="password" autoComplete="current-password" />
        <Button type="button" variant="ghost" size="icon" aria-label="Show password" onClick={toggle}><Eye /></Button>
        <Button type="submit">Sign in</Button>
      </form>
    );`,
    // Justified helpers need no type: they render type="button".
    `${JUSTIFIED}
    export const SignIn = () => (
      <form onSubmit={signIn}>
        <Input type="password" autoComplete="current-password" />
        <Button variant="outline" size="sm" onClick={toggle}>Show password</Button>
        <Button type="submit">Sign in</Button>
      </form>
    );`,
    // DialogClose asChild gives the stock Cancel type="button".
    `${STOCK}
    import { DialogClose, DialogFooter } from "@/components/ui/dialog";
    export const Rename = () => (
      <form onSubmit={save}>
        <Input defaultValue={name} />
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button type="submit">Save name</Button>
        </DialogFooter>
      </form>
    );`,
    // Two submit buttons: the rule does not decide which Enter presses.
    `${STOCK}
    export const Draft = () => (
      <form onSubmit={publish}><Input /><Button type="submit">Publish</Button><Button type="submit" formAction={saveDraft} variant="outline">Save draft</Button></form>
    );`,
    // A filter box outside a form, with its own click handler.
    `${STOCK}
    export const Filter = () => (<div><Input type="search" value={q} onChange={(e) => setQ(e.target.value)} /><Button onClick={clear}>Clear</Button></div>);`,
    // A form that holds a component this file does not show: it may hold the submit button.
    `${JUSTIFIED}
    import { SubmitRow } from "./submit-row";
    export const Settings = () => (<form onSubmit={save}><Input /><SubmitRow /></form>);`,
    // A form with an id: a button elsewhere may send it with form="…".
    `${JUSTIFIED}
    export const Rename = () => (<form id="rename" onSubmit={save}><Input /><Button onClick={reset}>Reset</Button></form>);`,
    // A form with only a text area: Enter adds a line there.
    `${JUSTIFIED}
    import { Textarea } from "@blackwoodblake/justified-shadcn/textarea";
    export const Note = () => (<form onSubmit={save}><Textarea /><Button onClick={save}>Save note</Button></form>);`,
    // A destructive confirmation on a page: left out.
    `${JUSTIFIED}
    export const DeleteAccount = () => (
      <form><Input aria-label="Account name" /><Button variant="destructive" onClick={form.handleSubmit(remove)}>Delete account</Button></form>
    );`,
    // An AlertDialog is left out.
    `${STOCK}
    import { AlertDialog, AlertDialogContent, AlertDialogFooter } from "@/components/ui/alert-dialog";
    export const Confirm = () => (
      <AlertDialog><AlertDialogContent><form><Input /><Button>Not now</Button><Button type="submit">Delete</Button></form></AlertDialogContent></AlertDialog>
    );`,
    // A key handler that sends with requestSubmit, or waits for an input method.
    `${STOCK}
    export const Send = () => (
      <form onSubmit={send}>
        <Input onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} />
        <Input onKeyDown={(e) => { if (e.key === "Enter" && e.nativeEvent.isComposing) e.preventDefault(); }} />
        <Button type="submit">Send</Button>
      </form>
    );`,
    // A handler that does something of its own on Enter, such as adding a tag.
    `${STOCK}
    export const Tags = () => (
      <form onSubmit={save}>
        <Input onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
        <Button type="submit">Save</Button>
      </form>
    );`,
    // Cmd+Enter, Escape and fields outside a form.
    `${STOCK}
    export const Keys = () => (
      <>
        <form onSubmit={send}>
          <Input onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) e.preventDefault(); }} />
          <Input onKeyDown={(e) => { if (e.key === "Escape") e.preventDefault(); }} />
          <Button type="submit">Send</Button>
        </form>
        <Input onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} />
      </>
    );`,
    // A combobox input and a text area keep their own Enter.
    `${STOCK}
    export const Pick = () => (
      <form onSubmit={save}>
        <Input role="combobox" aria-expanded={open} onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} />
        <Textarea onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} />
        <Button type="submit">Save</Button>
      </form>
    );`,
    // handleSubmit on a button outside a form, in a component with no field (a wizard footer).
    `${STOCK}
    export const Footer = () => (<div className="flex justify-end"><Button onClick={form.handleSubmit(next)}>Continue</Button></div>);`,
    // A dialog whose form wraps the footer, and one whose footer button points at the form.
    `${STOCK}
    import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
    export const Rename = () => (
      <Dialog><DialogContent>
        <form id="rename" onSubmit={save}><Input /></form>
        <DialogFooter><Button type="submit" form="rename">Save name</Button></DialogFooter>
      </DialogContent></Dialog>
    );`,
    // A Button from another module is not judged.
    `import { Button } from "./my-button";
    import { Input } from "@/components/ui/input";
    export const F = () => (<form onSubmit={s}><Input /><Button onClick={toggle}>Show</Button><Button type="submit">Go</Button></form>);`,
    // react-hook-form, written as shadcn's docs write it.
    `${RHF}
    export function Profile() {
      return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="shadcn" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      );
    }`,
    // Since the shadcn apps/v4 corpus.
    // shadcn's react-aria and Base UI bases: their Button is not a submit button by default.
    `import { Button } from "@/registry/bases/aria/ui/button";
    import { Input } from "@/registry/bases/aria/ui/input";
    export const SignIn = () => (<form onSubmit={signIn}><Input type="password" /><Button variant="ghost" onPress={toggle}>Show password</Button><Button type="submit">Sign in</Button></form>);`,
    `import { Button } from "@/styles/base-nova/ui/button";
    import { Input } from "@/styles/base-nova/ui/input";
    export const SignIn = () => (<form onSubmit={signIn}><Input type="password" /><Button variant="ghost" onClick={toggle}>Show password</Button><Button type="submit">Sign in</Button></form>);`,
    // A trigger's render draws the button with type="button".
    `${STOCK}
    export const Edit = () => (<form onSubmit={save}><Input name="n" /><DialogTrigger render={<Button variant="outline" />}>Open</DialogTrigger><Button type="submit">Save</Button></form>);`,
  ],
  invalid: [
    // How_to_check 1: react-hook-form with no <form>.
    {
      code: `${RHF}
      export function Invite() {
        return (
          <Form {...form}>
            <div className="space-y-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button onClick={form.handleSubmit(sendInvite)}>Send invite</Button>
            </div>
          </Form>
        );
      }`,
      errors: [{ messageId: "noForm" }],
    },
    {
      code: `${STOCK}
      export const Invite = () => (<div><Input type="email" {...register("email")} /><Button type="button" onClick={() => handleSubmit(send)()}>Send invite</Button></div>);`,
      errors: [{ messageId: "noForm" }],
    },
    // How_to_check 2: the main button is type="button" with handleSubmit.
    {
      code: `${STOCK}
      export const Invite = () => (
        <form><Label htmlFor="e">Email address</Label><Input id="e" type="email" /><Input type="text" /><Button type="button" onClick={form.handleSubmit(onSubmit)}>Send invite</Button></form>
      );`,
      errors: [{ messageId: "mainNotSubmit" }],
    },
    // How_to_check 2: a main Justified Button with no type renders type="button".
    {
      code: `${JUSTIFIED}
      export const Invite = () => (
        <form onSubmit={send}><Field label="Name"><Input /></Field><Field label="Email address"><Input type="email" /></Field><Button>Send invite</Button></form>
      );`,
      errors: [{ messageId: "mainNotSubmit" }],
    },
    // One single-line field and no submit button: Enter sends the form, but nothing catches it.
    {
      code: `${STOCK}
      export const Invite = () => (
        <form><Input type="email" aria-label="Email address" /><Button type="button" onClick={form.handleSubmit(onSubmit)}>Send invite</Button></form>
      );`,
      errors: [{ messageId: "mainNotSubmitOneField" }],
    },
    // How_to_check 3: a key handler that only cancels Enter, on a field and on the form.
    {
      code: `${STOCK}
      export const Search = () => (
        <form onSubmit={search}>
          <Input type="search" onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} />
          <Button type="submit">Search</Button>
        </form>
      );`,
      errors: [{ messageId: "enterBlocked" }],
    },
    {
      code: `${STOCK}
      function stopEnter(e) {
        if (e.key === "Enter") {
          e.preventDefault();
          return;
        }
      }
      export const Claim = () => (<form onSubmit={send} onKeyDown={stopEnter}><Input /><Button type="submit">Send claim</Button></form>);`,
      errors: [{ messageId: "enterBlocked" }],
    },
    {
      code: `${STOCK}
      export const F = () => (<form onSubmit={send}><input type="text" onKeyDown={(e) => e.keyCode === 13 && e.preventDefault()} /><Button type="submit">Send</Button></form>);`,
      errors: [{ messageId: "enterBlocked" }],
    },
    // How_to_check 4: a stock helper with no type before the main button.
    {
      code: `${STOCK}
      export const SignIn = () => (
        <form onSubmit={signIn}>
          <Input type="email" autoComplete="username" />
          <Input type={shown ? "text" : "password"} autoComplete="current-password" />
          <Button variant="ghost" size="icon" aria-label="Show password" onClick={toggle}><Eye /></Button>
          <Button type="submit">Sign in</Button>
        </form>
      );`,
      errors: [{ messageId: "strayButton" }],
    },
    // The Don't as the example writes it: a plain <button> inside a Justified Button with asChild.
    {
      code: `${JUSTIFIED}
      export const SignIn = () => (
        <form onSubmit={signIn}>
          <Field label="Password"><Input type="password" autoComplete="current-password" /></Field>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm"><button onClick={(e) => { e.preventDefault(); toggle(); }}>Show password</button></Button>
            <Button type="submit">Sign in</Button>
          </div>
        </form>
      );`,
      errors: [{ messageId: "strayButton" }],
    },
    // Delete with no type before Save: the worst case.
    {
      code: `${STOCK}
      export const EditContact = () => (<form onSubmit={save}><Input /><Button variant="destructive" onClick={remove}>Delete contact</Button><Button type="submit">Save contact</Button></form>);`,
      errors: [{ messageId: "strayButton" }],
    },
    // How_to_check 5: the footer sits after the form.
    {
      code: `${STOCK}
      import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
      export const Rename = () => (
        <Dialog><DialogContent>
          <DialogHeader><DialogTitle>Rename board</DialogTitle></DialogHeader>
          <form onSubmit={save}><Input defaultValue={name} /></form>
          <DialogFooter><Button type="submit">Save name</Button></DialogFooter>
        </DialogContent></Dialog>
      );`,
      errors: [{ messageId: "footerOutside" }],
    },
  ],
});
