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
    // Not reported: a switch in a form with a save button (that it applies at once is the Do advice, not the rule sentence), a Select that opens a dialog, and an AlertDialog that asks to confirm.
    // The rule's own Don't: a switch in a settings form that waits for Save settings.
    `export function Settings({ save }) {
      const [draft, setDraft] = useState(false);
      return (
        <form onSubmit={(e) => { e.preventDefault(); save(draft); }}>
          <Switch checked={draft} onCheckedChange={setDraft} />
          <Button type="submit">Save settings</Button>
        </form>
      );
    }`,
    // shadcn's own switch form: each switch waits for Submit.
    `export function SwitchForm({ form, onSubmit }) {
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
    // Uncontrolled: its value goes only with the form.
    `export function F() { return <form action={save}><Switch name="digest" defaultChecked /><button>Save settings</button></form>; }`,
    `export function F() {
      const [on, setOn] = useState(false);
      return <form onSubmit={() => send({ on })}><Switch checked={on} onCheckedChange={(v) => setOn(v)} /><input type="submit" value="Save" /></form>;
    }`,
    `export function F() {
      const [confirming, setConfirming] = useState(false);
      const pick = (v) => { setPlan(v); setConfirming(true); };
      return (<><Select onValueChange={pick}><SelectTrigger /></Select>
        <AlertDialog open={confirming} onOpenChange={setConfirming}><AlertDialogContent /></AlertDialog></>);
    }`,
    // A switch bound to a form saved with Save. Whether a switch waits for Save is not read.
    `
    import { Controller, useForm } from "react-hook-form"
    export function A() {
      const form = useForm({ defaultValues: { twoFactor: false } })
      return (<>
        <form id="f" onSubmit={form.handleSubmit(save)}>
          <Controller name="twoFactor" control={form.control} render={({ field }) => (
            <Switch id="tf" checked={field.value} onCheckedChange={field.onChange} />
          )} />
        </form>
        <Button type="submit" form="f">Save</Button>
      </>)
    }`,
    // rhf switch, submit inside
    `
    import { Controller, useForm } from "react-hook-form"
    export function A() {
      const form = useForm({ defaultValues: { twoFactor: false } })
      return (
        <form onSubmit={form.handleSubmit(save)}>
          <Controller name="twoFactor" control={form.control} render={({ field }) => (
            <Switch id="tf" checked={field.value} onCheckedChange={field.onChange} />
          )} />
          <Button type="submit">Save settings</Button>
        </form>)
    }`,
    // uncontrolled switch in server-action form
    `
    export default function Page() {
      return (
        <form action={updateSettings}>
          <Switch name="weekly" defaultChecked />
          <Button type="submit">Save settings</Button>
        </form>)
    }`,
    // switch reveals fields via render-prop field.value
    `
    import { useForm } from "react-hook-form"
    export function A() {
      const form = useForm({ defaultValues: { custom: false, domain: "" } })
      return (
        <Form {...form}><form onSubmit={form.handleSubmit(save)}>
          <FormField control={form.control} name="custom" render={({ field }) => (
            <FormItem>
              <FormLabel>Use a custom domain</FormLabel>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              {field.value && <Input placeholder="example.com" />}
            </FormItem>
          )} />
          <Button type="submit">Create site</Button>
        </form></Form>)
    }`,
    // switch reveals fields via useState
    `
    export function A() {
      const [adv, setAdv] = useState(false)
      return (
        <form onSubmit={submit}>
          <Switch checked={adv} onCheckedChange={setAdv} />
          {adv && <Input name="proxy" />}
          <Button type="submit">Create</Button>
        </form>)
    }`,
    // state only read in onSubmit
    `
    export function A() {
      const [on, setOn] = useState(false)
      return (
        <form onSubmit={(e) => { e.preventDefault(); save({ on }) }}>
          <Switch checked={on} onCheckedChange={setOn} />
          <Button type="submit">Save settings</Button>
        </form>)
    }`,
    // switch saves itself through a mutation
    `
    export function A({ pref }) {
      const m = useMutation({ mutationFn: savePref })
      return (
        <form onSubmit={submitProfile}>
          <Input name="name" />
          <Switch checked={pref.on} onCheckedChange={(v) => m.mutate({ on: v })} />
          <Button type="submit">Save profile</Button>
        </form>)
    }`,
    // switch reveals fields via form.watch in another place
    `
    import { useForm } from "react-hook-form"
    export function A() {
      const form = useForm()
      const shipping = form.watch("separateShipping")
      return (
        <form onSubmit={form.handleSubmit(save)}>
          <FormField control={form.control} name="separateShipping" render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />)} />
          {shipping && <AddressFields />}
          <Button type="submit">Place order</Button>
        </form>)
    }`,
    // useState switch state read in className (changes the view)
    `
    export function A() {
      const [compact, setCompact] = useState(false)
      return (
        <form onSubmit={submit} className={compact ? "gap-2" : "gap-6"}>
          <Switch checked={compact} onCheckedChange={setCompact} />
          <Button type="submit">Send</Button>
        </form>)
    }`,
    // switch state read by an effect that saves
    `
    export function A() {
      const [on, setOn] = useState(false)
      useEffect(() => { savePref(on) }, [on])
      return (
        <form onSubmit={submit}>
          <Switch checked={on} onCheckedChange={setOn} />
          <button>Send message</button>
        </form>)
    }`,
    // switch with checked={x} and onCheckedChange={(v)=>setX(v===true)} where x drives disabled of input
    `
    export function A() {
      const [same, setSame] = useState(true)
      return (
        <form onSubmit={submit}>
          <Switch checked={same} onCheckedChange={(v) => setSame(v === true)} />
          <Input name="billing" disabled={same} />
          <Button type="submit">Continue</Button>
        </form>)
    }`,
    // rhf switch with reveal via fieldState-free render: field.value used for description
    `
    import { useForm } from "react-hook-form"
    export function A() {
      const form = useForm()
      return (
        <form onSubmit={form.handleSubmit(save)}>
          <FormField control={form.control} name="public" render={({ field }) => (
            <FormItem>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
              <FormDescription>{field.value ? "Anyone with the link can see it." : "Only you can see it."}</FormDescription>
            </FormItem>)} />
          <Button type="submit">Create</Button>
        </form>)
    }`,
    // switch inside dialog form, setting applies via onCheckedChange to context
    `
    export function A() {
      const { setTheme } = useTheme()
      const [dark, setDark] = useState(false)
      return (
        <form onSubmit={submit}>
          <Switch checked={dark} onCheckedChange={(v) => { setDark(v); setTheme(v ? "dark" : "light") }} />
          <Button type="submit">Save</Button>
        </form>)
    }`,
    // Comment containing watch disables the check
    `
    import { Controller, useForm } from "react-hook-form"
    // We do not watch any field here.
    export function A() {
      const form = useForm()
      return (
        <form onSubmit={form.handleSubmit(save)}>
          <Controller name="x" control={form.control} render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />)} />
          <Button type="submit">Save settings</Button>
        </form>)
    }`,
    // A filter form sent with Search
    `
    export function A() {
      return (
        <form method="get" action="/search">
          <Switch name="inStock" />
          <Button type="submit">Search</Button>
        </form>)
    }`,
    // An uncontrolled switch that reveals fields through peer CSS
    `
    export function A() {
      return (
        <form action={create}>
          <Switch id="adv" name="advanced" className="peer" />
          <div className="hidden peer-data-[state=checked]:block"><Input name="proxy" /></div>
          <Button type="submit">Create</Button>
        </form>)
    }`,
    // A form that saves itself on every change
    `
    export function A() {
      return (
        <form onChange={(e) => e.currentTarget.requestSubmit()} action={save}>
          <Switch name="weekly" />
          <button className="sr-only">Save</button>
        </form>)
    }`,
    // A switch that reveals fields in another component
    `
    import { useForm } from "react-hook-form"
    import { ShippingAddress } from "./shipping-address"
    export function A() {
      const form = useForm()
      return (
        <Form {...form}><form onSubmit={form.handleSubmit(save)}>
          <FormField control={form.control} name="separateShipping" render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />)} />
          <ShippingAddress />
          <Button type="submit">Place order</Button>
        </form></Form>)
    }`,
    // A switch whose turning off asks to confirm in an AlertDialog
    `
    export function A() {
      const [confirm, setConfirm] = useState(false)
      return (<>
        <Switch checked={mfa} onCheckedChange={(v) => (v ? enableMfa() : setConfirm(true))} />
        <AlertDialog open={confirm} onOpenChange={setConfirm}>
          <AlertDialogContent><AlertDialogTitle>Turn off two-factor authentication?</AlertDialogTitle>
          <AlertDialogFooter><AlertDialogCancel>Keep it on</AlertDialogCancel><AlertDialogAction onClick={disableMfa}>Turn off</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
        </AlertDialog>
      </>)
    }`,
    // A Select item Custom range... that opens a dialog for the dates takes judgement
    `
    export function A() {
      const [open, setOpen] = useState(false)
      return (<>
        <Select value={range} onValueChange={(v) => (v === "custom" ? setOpen(true) : setRange(v))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="7d">Last 7 days</SelectItem><SelectItem value="custom">Custom range…</SelectItem></SelectContent>
        </Select>
        <Dialog open={open} onOpenChange={setOpen}><DialogContent>Pick dates</DialogContent></Dialog>
      </>)
    }`,
    // A select in a sheet that closes it
    `
    export function A() {
      const [open, setOpen] = useState(false)
      return (
        <Sheet open={open} onOpenChange={setOpen}><SheetContent>
          <Select onValueChange={(v) => { setSort(v); setOpen(false) }}><SelectTrigger /></Select>
        </SheetContent></Sheet>)
    }`,
    // A checkbox that sets the open state of its dialog to itself
    `
    export function A() {
      const [open, setOpen] = useState(false)
      return (
        <Dialog open={open} onOpenChange={setOpen}><DialogContent>
          <Checkbox onCheckedChange={(v) => { setAgree(v); if (!v) setOpen(open) }} />
        </DialogContent></Dialog>)
    }`,
    // A radio group that switches a layout
    `
    export function A() {
      const [view, setView] = useState("list")
      return (<>
        <RadioGroup value={view} onValueChange={setView} />
        <Sheet open={view === "board"} />
      </>)
    }`,
    // A radio group whose value is read by a dialog's open, not set through it
    `
    export function A() {
      const [selected, setSelected] = useState<string | null>(null)
      return (<>
        <RadioGroup value={selected ?? ""} onValueChange={setSelected}><RadioGroupItem value="a" /></RadioGroup>
        <Dialog open={selected !== null} onOpenChange={() => setSelected(null)} />
      </>)
    }`,
  ],
  invalid: [
    {
      // The rule's own Don't: a switch that opens the setup dialog
      code: `
      export function A() {
        const [open, setOpen] = useState(false)
        return (<>
          <Switch checked={auto} onCheckedChange={(v) => { if (v) setOpen(true) }} />
          <Dialog open={open} onOpenChange={setOpen}><DialogContent>Choose a card</DialogContent></Dialog>
        </>)
      }`,
      errors: [{ messageId: "opensDialog" }],
    },
    {
      // A radio group whose handler opens a dialog through a local function
      code: `
      export function A() {
        const [open, setOpen] = useState(false)
        const pick = (v: string) => { setPlan(v); if (v === "enterprise") setOpen(true) }
        return (<>
          <RadioGroup onValueChange={pick} />
          <Dialog open={open} onOpenChange={setOpen} />
        </>)
      }`,
      errors: [{ messageId: "opensDialog" }],
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
