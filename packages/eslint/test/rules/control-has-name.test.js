import rule from "../../rules/control-has-name.js";
import { run } from "../helpers.js";

run("control-has-name", rule, {
  valid: [
    // A control passed as a render prop may be named by the component that takes it.
    `const a = <SearchField.Input render={<Input />} aria-label="Search orders" />;`,
    // shadcn as its docs write it.
    `export const A = () => <div className="grid gap-3"><Label htmlFor="email">Email</Label><Input type="email" id="email" placeholder="Email" /></div>;`,
    `export const A = () => <div className="flex items-center gap-3"><Checkbox id="terms" /><Label htmlFor="terms">Accept terms and conditions</Label></div>;`,
    `export const A = () => <div className="flex items-center space-x-2"><Switch id="airplane-mode" /><Label htmlFor="airplane-mode">Airplane Mode</Label></div>;`,
    `export const A = () => (
      <RadioGroup defaultValue="comfortable">
        <div className="flex items-center gap-3"><RadioGroupItem value="default" id="r1" /><Label htmlFor="r1">Default</Label></div>
        <div className="flex items-center gap-3"><RadioGroupItem value="compact" id="r2" /><Label htmlFor="r2">Compact</Label></div>
      </RadioGroup>
    );`,
    `export const A = () => <div className="grid gap-3"><Label htmlFor="message">Your message</Label><Textarea placeholder="Type your message here." id="message" /></div>;`,
    // The placeholder gives a name; leaning on it is our advice, not the rule.
    `export const A = () => <div className="flex gap-2"><Input type="email" placeholder="Email" /><Button type="submit">Subscribe</Button></div>;`,
    // A select with a tied label.
    `export const A = () => (
      <div><Label htmlFor="pool">Pool</Label>
        <Select><SelectTrigger id="pool"><SelectValue placeholder="Choose a pool" /></SelectTrigger><SelectContent /></Select>
      </div>
    );`,
    // react-hook-form: FormControl sets id and aria-* from context.
    `export const A = ({ form }) => (
      <FormField control={form.control} name="pool" render={({ field }) => (
        <FormItem>
          <FormLabel>Pool</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl><SelectTrigger><SelectValue placeholder="Choose a pool" /></SelectTrigger></FormControl>
          </Select>
        </FormItem>
      )} />
    );`,
    // Our Field ties the label.
    `export const A = () => <Field label="Swimmer's school" required><Input autoComplete="off" /></Field>;`,
    `export const A = () => <Field label="Before school" layout="inline"><RadioGroupItem value="before" /></Field>;`,
    // A project's own wrapper with a label prop.
    `export const A = () => <FormRow label="Email"><Input type="email" /></FormRow>;`,
    `export const A = () => <TextField><Input /></TextField>;`,
    // Wrapped in a label.
    `export const A = () => <label className="flex gap-2"><input type="checkbox" /> Tell me when a place becomes free</label>;`,
    `export const A = () => <Label><Checkbox /> Tell me when a place becomes free</Label>;`,
    // An id: the label may point at it from anywhere.
    `export const A = () => <div><Textarea id="notes" rows={2} /></div>;`,
    // Not controls that need a name here.
    `export const A = () => <form><input type="hidden" name="token" value="x" /><input type="submit" value="Book course" /></form>;`,
    `export const A = () => <div><input aria-hidden="true" tabIndex={-1} /></div>;`,
    `export const A = (props) => <div><Input {...props} /></div>;`,
    // A control a component returns alone; the caller may wrap it.
    `export const SearchInput = () => <Input type="search" />;`,
    // Named in code.
    `export const A = () => <div><Input type="search" aria-label="Search courses" /><Button>Search</Button></div>;`,
    `export const A = () => <div><h3 id="pool-label">Pool</h3><NativeSelect aria-labelledby="pool-label" /></div>;`,
    `export const A = () => <Button variant="outline" role="combobox" aria-label="Framework" aria-expanded={open}>Select framework...</Button>;`,
    // An aria-label that holds the visible label.
    `export const A = () => <Field label="Level"><NativeSelect aria-label="Level for Alma" /></Field>;`,
    // A group label is not each field's own label (FRM-010's exception).
    `export const A = () => (
      <Field label="Date of birth">
        <div className="flex gap-2"><Input aria-label="Day" /><Input aria-label="Month" /><Input aria-label="Year" /></div>
      </Field>
    );`,
    `export const A = () => (
      <FormItem>
        <FormLabel>Date of birth</FormLabel>
        <FormControl><div className="flex gap-2"><Input aria-label="Day" /><Input aria-label="Month" /><Input aria-label="Year" /></div></FormControl>
      </FormItem>
    );`,
    `export const A = () => (
      <fieldset><legend>Date of birth</legend><Input aria-label="Day" /><Input aria-label="Month" /><Input aria-label="Year" /></fieldset>
    );`,
    `export const A = () => (
      <div role="group" aria-labelledby="dob"><p id="dob">Date of birth</p><Input aria-label="Day" /><Input aria-label="Month" /></div>
    );`,
    `export const A = () => <div><Label htmlFor="lvl">Level</Label><NativeSelect id="lvl" aria-label="Level for Noor" /></div>;`,
    // The marker in parentheses is FRM-005, not this rule.
    `export const A = () => <div><Label htmlFor="n">Notes for the teacher (optional)</Label><Textarea id="n" aria-label="Notes for the teacher" /></div>;`,
    // Text that is not the control's own label.
    `export const A = () => <div><h3>Lesson length</h3><Field label="30 minutes" layout="inline"><Checkbox aria-label="30 minutes" /></Field></div>;`,
    // A label computed in an expression.
    `export const A = ({ t }) => <Field label={t("pool")}><NativeSelect aria-label="Venue" /></Field>;`,
    // The same name in both states.
    `export const A = ({ on }) => <Field label="Show full courses" layout="inline"><Switch checked={on} aria-label="Show full courses" /></Field>;`,
    // An aria-label that changes with something other than checked.
    `export const A = ({ on, row }) => <Checkbox checked={on} aria-label={row.first ? "Select all" : "Select row"} />;`,
    // react-hook-form's {...field} spread may set anything, so this stays quiet.
    `export const A = ({ form }) => (
      <FormField control={form.control} name="pool" render={({ field }) => (
        <FormItem><FormLabel>Pool</FormLabel><FormControl><Input aria-label="Venue" {...field} /></FormControl></FormItem>
      )} />
    );`,
    // A radio group under a plain question is left to review.
    `export const A = () => (
      <div><p>When can the swimmer come?</p>
        <RadioGroup>
          <Field label="Before school" layout="inline"><RadioGroupItem value="before" /></Field>
          <Field label="After school" layout="inline"><RadioGroupItem value="after" /></Field>
        </RadioGroup>
      </div>
    );`,
    // Since the shadcn apps/v4 corpus: react-aria selects and slotted controls.
    // react-aria's SelectTrigger takes its name from the Select's label.
    `import { Select, SelectTrigger, SelectValue } from "@/registry/bases/aria/ui/select";
    export function F() { return <div><Select aria-label="Fruits"><SelectTrigger><SelectValue /></SelectTrigger></Select></div>; }`,
    `import { Select, SelectTrigger, SelectValue, Label } from "@/registry/bases/aria/ui/select";
    export const A = () => (<div><Select><Label>Venue</Label><SelectTrigger><SelectValue /></SelectTrigger></Select></div>);`,
    `import { Select, SelectTrigger, SelectValue } from "@/registry/bases/aria/ui/select";
    export function Picker(props) { return <div><Select {...props}><SelectTrigger><SelectValue /></SelectTrigger></Select></div>; }`,
    // A control in a slot, such as react-aria's selection checkbox, is named by the slot.
    `export function F() { return <Table><TableHeader><TableHead><Checkbox slot="selection" /></TableHead></TableHeader></Table>; }`,
  ],
  invalid: [
    {
      // A react-aria Select with no label anywhere: the shown value is not a name the code gives.
      code: `import { Select, SelectTrigger, SelectValue, SelectPopover } from "@/registry/bases/aria/ui/select";
      export const A = () => (<div><Select placeholder="Pick a venue"><SelectTrigger><SelectValue /></SelectTrigger><SelectPopover /></Select></div>);`,
      errors: [{ messageId: "noName" }],
    },
    {
      code: `import { Select, SelectValue, Button as SelectTrigger, Popover } from "react-aria-components";
      export const A = () => (<div><Select><SelectTrigger><SelectValue /></SelectTrigger><Popover /></Select></div>);`,
      errors: [{ messageId: "noName" }],
    },
    {
      // A slot outside react-aria gives no name.
      code: `export const A = () => (<my-row><input type="checkbox" slot="start" /></my-row>);`,
      errors: [{ messageId: "noName" }],
    },
    {
      code: `import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
      import { announce } from "@/lib/aria/live";
      export const A = () => (<div><Select><SelectTrigger><SelectValue placeholder="Pick a venue" /></SelectTrigger></Select></div>);`,
      errors: [{ messageId: "noName" }],
    },
    {
      // A Radix SelectTrigger gets no name from its Select.
      code: `import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
      export function F() { return <div><Select><SelectTrigger><SelectValue placeholder="Choose a pool" /></SelectTrigger></Select></div>; }`,
      errors: [{ messageId: "noName" }],
    },
    {
      // The Don't: the notes paragraph is not tied to the text area.
      code: `export const A = () => (
        <div className="flex flex-col">
          <p className="m-0 text-sm font-medium">Notes for the teacher <span>(optional)</span></p>
          <div className="mt-2"><Textarea rows={2} /></div>
        </div>
      );`,
      errors: [{ messageId: "noName", data: { control: "Textarea" } }],
    },
    {
      // shadcn's Select demo has no name.
      code: `export const A = () => (
        <Select>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Theme" /></SelectTrigger>
          <SelectContent><SelectItem value="light">Light</SelectItem></SelectContent>
        </Select>
      );`,
      errors: [{ messageId: "noName", data: { control: "SelectTrigger" } }],
    },
    {
      // The Don't: a custom select from a div with role="combobox" and no name.
      code: `export const A = () => <div className="card"><div role="combobox" aria-expanded={open} tabIndex={0}>Choose a pool</div></div>;`,
      errors: [{ messageId: "noName", data: { control: "combo box" } }],
    },
    {
      code: `export const A = () => <div className="flex items-center gap-2"><Checkbox /><span>Tell me when a place becomes free</span></div>;`,
      errors: [{ messageId: "noName" }],
    },
    {
      code: `export const A = () => <div><Switch checked={on} onCheckedChange={setOn} /> Show full courses</div>;`,
      errors: [{ messageId: "noName" }],
    },
    {
      code: `export const A = () => <td><input type="checkbox" checked={selected} onChange={toggle} /></td>;`,
      errors: [{ messageId: "noName", data: { control: "input" } }],
    },
    {
      // The Don't: the select shows Pool and is named Venue.
      code: `export const A = () => <Field label="Pool"><NativeSelect defaultValue="north" aria-label="Venue"><option>Northside</option></NativeSelect></Field>;`,
      errors: [{ messageId: "labelMissesText", data: { label: "Venue", text: "Pool" } }],
    },
    {
      code: `export const A = () => <div><Label htmlFor="pool">Pool</Label><NativeSelect id="pool" aria-label="Venue" /></div>;`,
      errors: [{ messageId: "labelMissesText" }],
    },
    {
      // The label after the control in the file.
      code: `export const A = () => <div><Checkbox id="news" aria-label="Newsletter" /><Label htmlFor="news">Email me about new courses</Label></div>;`,
      errors: [{ messageId: "labelMissesText" }],
    },
    {
      code: `export const A = () => <label>Swimmer's school <input aria-label="School" /></label>;`,
      errors: [{ messageId: "labelMissesText", data: { label: "School", text: "Swimmer's school" } }],
    },
    {
      code: `export const A = ({ form }) => (
        <FormItem>
          <FormLabel>Pool</FormLabel>
          <FormControl><Input aria-label="Venue" onChange={form.set} /></FormControl>
        </FormItem>
      );`,
      errors: [{ messageId: "labelMissesText", data: { label: "Venue", text: "Pool" } }],
    },
    {
      // The Don't: the switch's name follows its state.
      code: `export const A = ({ showFull, setShowFull }) => (
        <Field label="Show full courses" layout="inline">
          <Switch checked={showFull} onCheckedChange={setShowFull} aria-label={showFull ? "Show full courses" : "Full courses hidden"} />
        </Field>
      );`,
      errors: [{ messageId: "nameFollowsState", data: { a: "Show full courses", b: "Full courses hidden" } }],
    },
    {
      code: `export const A = ({ on }) => <Checkbox checked={on} aria-label={!on ? "Select" : "Deselect"} />;`,
      errors: [{ messageId: "nameFollowsState" }],
    },
  ],
});
