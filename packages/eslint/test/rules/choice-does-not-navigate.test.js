import rule from "../../rules/choice-does-not-navigate.js";
import { run } from "../helpers.js";

/** A Next.js component with a router, a pathname and search params, around the given JSX. */
const next = (jsx, before = "") => `
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function Picker({ value, setValue }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  ${before}
  return (
    <>
      ${jsx}
    </>
  );
}`;

/** A react-hook-form form around the given control. */
const rhf = (control, attrs = "") => `
export function Signup({ form, onSubmit }) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}${attrs}>
        ${control}
        <Button type="submit">Create account</Button>
      </form>
    </Form>
  );
}`;

run("choice-does-not-navigate", rule, {
  valid: [
    // shadcn's own examples: the choice only records.
    `export function Fruit() {
      return (
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select a fruit" /></SelectTrigger>
          <SelectContent><SelectItem value="apple">Apple</SelectItem></SelectContent>
        </Select>
      );
    }`,
    `export function Notify({ field }) {
      return <RadioGroup onValueChange={field.onChange} defaultValue={field.value}><RadioGroupItem value="all" /></RadioGroup>;
    }`,
    `export function Items({ field, item }) {
      return (
        <Checkbox
          checked={field.value?.includes(item.id)}
          onCheckedChange={(checked) => checked ? field.onChange([...field.value, item.id]) : field.onChange(field.value?.filter((v) => v !== item.id))}
        />
      );
    }`,
    `export function Mode({ setPosition, position }) {
      return <DropdownMenuRadioGroup value={position} onValueChange={setPosition}><DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem></DropdownMenuRadioGroup>;
    }`,
    `import { useTheme } from "next-themes";
    export function Theme() { const { setTheme } = useTheme(); return <Select onValueChange={setTheme}><SelectTrigger /></Select>; }`,
    // Our own Do: a plan picker that records, and a button that moves on.
    next(`<RadioGroup value={value} onValueChange={setValue}><RadioGroupItem value="team" /></RadioGroup>
      <Button onClick={() => router.push("/checkout?plan=" + value)}>Continue to payment</Button>`),
    // Search params that filter or sort the same view.
    next(
      `<Select onValueChange={(v) => router.push(pathname + "?" + createQueryString("sort", v))}><SelectTrigger /></Select>`,
      `const createQueryString = (k, v) => k + v;`,
    ),
    next(`<Select onValueChange={(v) => router.replace(\`\${pathname}?sort=\${v}\`)}><SelectTrigger /></Select>`),
    next(`<Select onValueChange={(v) => router.push(\`?page=1&size=\${v}\`)}><SelectTrigger /></Select>`),
    next(
      `<ToggleGroup type="single" onValueChange={(v) => router.replace("#" + v)}><ToggleGroupItem value="list">List</ToggleGroupItem></ToggleGroup>`,
    ),
    next(
      `<Checkbox onCheckedChange={(on) => { const params = new URLSearchParams(searchParams); params.set("done", String(on)); router.replace(url); }} />`,
      "const url = `${pathname}?${searchParams}`;",
    ),
    `import { useNavigate } from "@tanstack/react-router";
    export function Sort() {
      const navigate = useNavigate();
      return <Select onValueChange={(sort) => navigate({ search: (prev) => ({ ...prev, sort }) })}><SelectTrigger /></Select>;
    }`,
    `import { useNavigate } from "@tanstack/react-router";
    export function Sort() {
      const navigate = useNavigate();
      return <Select onValueChange={(sort) => navigate({ to: ".", search: { sort } })}><SelectTrigger /></Select>;
    }`,
    // A switch that applies and saves its own setting in place.
    rhf(`<Switch checked={on} onCheckedChange={(v) => { setOn(v); form.handleSubmit(onSubmit)(); }} />`),
    `export function Digest({ save }) { return <Switch onCheckedChange={(v) => save({ digest: v })} />; }`,
    // A filter form that updates the same view.
    rhf(`<Checkbox onCheckedChange={() => formRef.current?.requestSubmit()} />`, ` method="get"`),
    // A toast action is a button the person presses later.
    next(
      `<Switch onCheckedChange={(v) => { setValue(v); toast("Saved", { action: { label: "Open settings", onClick: () => router.push("/settings") } }); }} />`,
    ),
    // Handlers from props or other files cannot be read.
    `export function Workspace({ onChange }) { return <Select onValueChange={onChange}><SelectTrigger /></Select>; }`,
    `import { go } from "./go"; export function W() { return <Select onValueChange={(v) => go(v)}><SelectTrigger /></Select>; }`,
    // A navigate the rule cannot trace.
    `export function W({ navigate }) { return <Select onValueChange={(v) => navigate(v)}><SelectTrigger /></Select>; }`,
    // A menu of places, and a command palette, act on purpose.
    next(`<DropdownMenuItem onSelect={() => router.push("/w/harbour")}>Harbour team</DropdownMenuItem>`),
    next(`<CommandItem onSelect={() => router.push("/tasks/42")}>Open task 42</CommandItem>`),
    // Text fields are FRM-012a.
    next(`<InputOTP maxLength={6} onComplete={() => router.push("/done")} />`),
    next(`<Input onChange={(e) => router.push(e.target.value)} />`),
    // Tabs switch a panel in place.
    next(`<Tabs onValueChange={(v) => router.push(v)}><TabsList /></Tabs>`),
    // Other submit-like calls are not a form being sent.
    next(`<Checkbox onCheckedChange={() => mutation.submit()} />`),
    // Native controls that only record.
    `export function Size({ setSize }) { return <select onChange={(e) => setSize(e.target.value)}><option>S</option></select>; }`,
    `export function Field() { return <input type="text" onChange={(e) => location.assign(e.target.value)} />; }`,
    // A local variable named location is not the page's location.
    `export function F() { const location = useLocation(); return <Select onValueChange={(v) => location.replace(v)}><SelectTrigger /></Select>; }`,
    // A switch in a form that applies something in place: it reveals fields.
    `export function Billing() {
      const [other, setOther] = useState(false);
      return (
        <form onSubmit={save}>
          <Switch checked={other} onCheckedChange={setOther} />
          {other && <Input name="billing" />}
          <Button type="submit">Save address</Button>
        </form>
      );
    }`,
    `export function Billing({ form, onSubmit }) {
      const other = form.watch("other");
      return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField control={form.control} name="other" render={({ field }) => (
            <FormItem><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
          )} />
          {other && <Input name="billing" />}
          <Button type="submit">Save address</Button>
        </form>
      );
    }`,
    // A switch outside a form, or in a form with no submit button the rule can see.
    `export function Digest() { const [on, setOn] = useState(false); return <Switch checked={on} onCheckedChange={setOn} />; }`,
    `export function F() { return <form><Switch name="digest" /><SaveButton /></form>; }`,
    `export function F() { return <form><Switch name="digest" /><Button type="button" onClick={save}>Save</Button></form>; }`,
    `export function F() { return <form><Switch name="digest" /><Button onClick={save}>Save</Button></form>; }`,
    // A checkbox in a settings form with Save is the rule's own Do.
    `export function F() { return <form onSubmit={save}><Checkbox name="digest" /><Button type="submit">Save settings</Button></form>; }`,
    // A setter from a prop, or a switch whose handler does more, is not traced.
    `export function F({ setOn }) { return <form><Switch onCheckedChange={setOn} /><Button type="submit">Save</Button></form>; }`,
    `export function F() {
      const [on, setOn] = useState(false);
      return <form><Switch checked={on} onCheckedChange={(v) => { setOn(v); applyTheme(v); }} /><Button type="submit">Save</Button></form>;
    }`,
    `export function F() {
      const [on, setOn] = useState(false);
      return <form><Switch checked={on} onCheckedChange={setOn} /><p>{on ? "On" : "Off"}</p><Button type="submit">Save</Button></form>;
    }`,
    `export function F() { return <form><Switch name="digest" {...rest} /><Button type="submit">Save</Button></form>; }`,
    // A choice that sets state not bound to a dialog, or closes one.
    `export function F() {
      const [open, setOpen] = useState(false);
      const [plan, setPlan] = useState("a");
      return (<><RadioGroup value={plan} onValueChange={setPlan}><RadioGroupItem value="a" /></RadioGroup>
        <Dialog open={open} onOpenChange={setOpen}><DialogContent /></Dialog></>);
    }`,
    `export function F() {
      const [open, setOpen] = useState(true);
      return (<Dialog open={open} onOpenChange={setOpen}><DialogContent><Checkbox onCheckedChange={() => setOpen(false)} /></DialogContent></Dialog>);
    }`,
    // A button that opens a dialog is the rule's own Do.
    `export function F() {
      const [open, setOpen] = useState(false);
      return (<><Button onClick={() => setOpen(true)}>Set up automatic payments</Button>
        <Dialog open={open} onOpenChange={setOpen}><DialogContent /></Dialog></>);
    }`,
  ],
  invalid: [
    {
      // The rule's own Don't: a switch in a settings form that waits for Save settings.
      code: `export function Settings({ save }) {
        const [draft, setDraft] = useState(false);
        return (
          <form onSubmit={(e) => { e.preventDefault(); save(draft); }}>
            <Switch checked={draft} onCheckedChange={setDraft} />
            <Button type="submit">Save settings</Button>
          </form>
        );
      }`,
      errors: [{ messageId: "waitsForSave" }],
    },
    {
      // shadcn's own switch form: each switch waits for Submit.
      code: `export function SwitchForm({ form, onSubmit }) {
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
              <FormField
                control={form.control}
                name="marketing_emails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <FormLabel>Marketing emails</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        );
      }`,
      errors: [{ messageId: "waitsForSave" }],
    },
    {
      // Uncontrolled: its value goes only with the form.
      code: `export function F() { return <form action={save}><Switch name="digest" defaultChecked /><button>Save settings</button></form>; }`,
      errors: [{ messageId: "waitsForSave" }],
    },
    {
      code: `export function F() {
        const [on, setOn] = useState(false);
        return <form onSubmit={() => send({ on })}><Switch checked={on} onCheckedChange={(v) => setOn(v)} /><input type="submit" value="Save" /></form>;
      }`,
      errors: [{ messageId: "waitsForSave" }],
    },
    {
      // The rule's own Don't: a switch that opens the card dialog, even with a notice.
      code: `export function AutoPay() {
        const [open, setOpen] = useState(false);
        const [on, setOn] = useState(false);
        return (
          <>
            <Switch checked={on} onCheckedChange={(v) => { if (v) setOpen(true); else setOn(false); }} />
            <Dialog open={open} onOpenChange={setOpen}><DialogContent /></Dialog>
          </>
        );
      }`,
      errors: [{ messageId: "opensDialog", data: { control: "Switch" } }],
    },
    {
      code: `export function F() {
        const [open, setOpen] = useState(false);
        return (<><Checkbox onCheckedChange={setOpen} /><Sheet open={open}><SheetContent /></Sheet></>);
      }`,
      errors: [{ messageId: "opensDialog", data: { control: "Checkbox" } }],
    },
    {
      code: `export function F() {
        const [confirming, setConfirming] = useState(false);
        const pick = (v) => { setPlan(v); setConfirming(true); };
        return (<><Select onValueChange={pick}><SelectTrigger /></Select>
          <AlertDialog open={confirming} onOpenChange={setConfirming}><AlertDialogContent /></AlertDialog></>);
      }`,
      errors: [{ messageId: "opensDialog", data: { control: "Select" } }],
    },
    {
      // The rule's own Don't: Switch workspace as a Select.
      code: next(
        `<Select onValueChange={(v) => router.push(v)}><SelectTrigger><SelectValue placeholder="Switch workspace" /></SelectTrigger></Select>`,
      ),
      errors: [{ messageId: "navigates", data: { control: "Select" } }],
    },
    {
      code: next(`<Select onValueChange={router.push}><SelectTrigger /></Select>`),
      errors: [{ messageId: "navigates" }],
    },
    {
      code: next(`<Select onValueChange={(lang) => router.push(\`/\${lang}\${pathname}\`)}><SelectTrigger /></Select>`),
      errors: [{ messageId: "navigates" }],
    },
    {
      // The Don't example with its values written out: a radio group that opens checkout.
      code: next(
        `<RadioGroup value={value} onValueChange={choose}><RadioGroupItem value="team" /></RadioGroup>`,
        `const choose = (v) => { setValue(v); router.push("/checkout"); };`,
      ),
      errors: [{ messageId: "navigates", data: { control: "RadioGroup" } }],
    },
    {
      // Through a local helper, and through useCallback.
      code: next(
        `<RadioGroup onValueChange={onPick}><RadioGroupItem value="2-10" /></RadioGroup>`,
        `function goNext() { router.push("/onboarding/step-3"); }
        const onPick = useCallback((v) => { setValue(v); goNext(); }, []);`,
      ),
      errors: [{ messageId: "navigates" }],
    },
    {
      code: next(
        `<ToggleGroup type="single" onValueChange={(v) => startTransition(() => router.push("/board"))}><ToggleGroupItem value="b">Board</ToggleGroupItem></ToggleGroup>`,
      ),
      errors: [{ messageId: "navigates", data: { control: "ToggleGroup" } }],
    },
    {
      code: `import { useNavigate } from "react-router-dom";
      export function Team() {
        const navigate = useNavigate();
        return <RadioGroup onValueChange={(size) => navigate(\`/onboarding/\${size}\`)}><RadioGroupItem value="s" /></RadioGroup>;
      }`,
      errors: [{ messageId: "navigates" }],
    },
    {
      code: `export function W() { return <Select onValueChange={(v) => window.open(v, "_blank")}><SelectTrigger /></Select>; }`,
      errors: [{ messageId: "navigates" }],
    },
    {
      code: `export function W() { return <Select onValueChange={(v) => { window.location.href = "/w/" + v; }}><SelectTrigger /></Select>; }`,
      errors: [{ messageId: "navigates" }],
    },
    {
      code: `export function W() { return <Select onValueChange={(v) => location.assign(v)}><SelectTrigger /></Select>; }`,
      errors: [{ messageId: "navigates" }],
    },
    {
      code: next(
        `<DropdownMenuRadioGroup value={value} onValueChange={(id) => router.push(\`/workspaces/\${id}\`)}><DropdownMenuRadioItem value="h">Harbour</DropdownMenuRadioItem></DropdownMenuRadioGroup>`,
      ),
      errors: [{ messageId: "navigates", data: { control: "DropdownMenuRadioGroup" } }],
    },
    {
      // A switch that opens another page is not applying its own setting.
      code: next(`<Switch onCheckedChange={(on) => on && router.push("/billing/autopay")} />`),
      errors: [{ messageId: "navigates", data: { control: "Switch" } }],
    },
    {
      code: `export function W() { return <select onChange={(e) => { window.location.href = e.target.value; }}><option value="/a">A</option></select>; }`,
      errors: [{ messageId: "navigates", data: { control: "select" } }],
    },
    {
      // The rule's own Don't: a Checkbox that calls form.handleSubmit().
      code: rhf(
        `<Checkbox checked={accepted} onCheckedChange={(v) => { setAccepted(v === true); form.handleSubmit(onSubmit)(); }} />`,
      ),
      errors: [{ messageId: "submits", data: { control: "Checkbox" } }],
    },
    {
      code: rhf(`<Checkbox onCheckedChange={form.handleSubmit(onSubmit)} />`),
      errors: [{ messageId: "submits" }],
    },
    {
      code: rhf(
        `<RadioGroup onValueChange={(v) => { field.onChange(v); formRef.current?.requestSubmit(); }}><RadioGroupItem value="a" /></RadioGroup>`,
      ),
      errors: [{ messageId: "submits", data: { control: "RadioGroup" } }],
    },
    {
      code: `export function F() { return <form><input type="checkbox" onChange={(e) => e.currentTarget.form.submit()} /></form>; }`,
      errors: [{ messageId: "submits", data: { control: "checkbox input" } }],
    },
  ],
});
