import rule from "../../rules/option-text-toggles.js";
import { run } from "../helpers.js";

const imports = `
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
`;

run("option-text-toggles", rule, {
  valid: [
    // A row-selection checkbox has no text of its own (FRM-016a's first exception), so a row click is left alone.
    `export function Row({ row }) {
      const [selected, setSelected] = useState(false);
      return (
        <tr onClick={() => setSelected(!selected)}>
          <td><Checkbox checked={selected} onCheckedChange={(v) => setSelected(v === true)} aria-label="Select row" /></td>
          <td>{row.name}</td>
        </tr>
      );
    }`,
    `export function Row({ row }) {
      const [selected, setSelected] = useState(false);
      return (
        <TableRow onClick={() => setSelected(!selected)}>
          <TableCell><div onClick={() => setSelected(!selected)}><Checkbox checked={selected} onCheckedChange={(v) => setSelected(v === true)} aria-label="Select row" /></div></TableCell>
          <TableCell>{row.name}</TableCell>
        </TableRow>
      );
    }`,
    // shadcn's checkbox demo, as its docs write it.
    `${imports}
export default function CheckboxDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Checkbox id="terms" />
        <Label htmlFor="terms">Accept terms and conditions</Label>
      </div>
      <div className="flex items-start gap-3">
        <Checkbox id="terms-2" defaultChecked />
        <div className="grid gap-2">
          <Label htmlFor="terms-2">Accept terms and conditions</Label>
          <p className="text-sm text-muted-foreground">By clicking this checkbox, you agree to the terms and conditions.</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Checkbox id="toggle" disabled />
        <Label htmlFor="toggle">Enable notifications</Label>
      </div>
      <Label className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50">
        <Checkbox id="toggle-2" defaultChecked />
        <div className="grid gap-1.5 font-normal">
          <p className="text-sm leading-none font-medium">Enable notifications</p>
          <p className="text-sm text-muted-foreground">You can enable or disable notifications at any time.</p>
        </div>
      </Label>
    </div>
  );
}`,
    // shadcn's radio group demo.
    `${imports}
export function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="comfortable">
      <div className="flex items-center gap-3">
        <RadioGroupItem value="default" id="r1" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="comfortable" id="r2" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
    </RadioGroup>
  );
}`,
    // Form with react-hook-form: FormLabel in the same FormItem.
    `${imports}
export function Terms({ form }) {
  return (
    <FormField control={form.control} name="terms" render={({ field }) => (
      <FormItem className="flex flex-row items-start gap-3">
        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
        <div className="space-y-1 leading-none">
          <FormLabel>Use different settings for my mobile devices</FormLabel>
          <FormDescription>You can manage your mobile notifications in the settings page.</FormDescription>
        </div>
      </FormItem>
    )} />
  );
}`,
    // Field with FieldLabel, and our own Field with a label prop.
    `${imports}
export function Choice() {
  return (
    <>
      <Field orientation="horizontal">
        <Checkbox id="finder-pref" defaultChecked />
        <FieldLabel htmlFor="finder-pref" className="font-normal">Show hard disks</FieldLabel>
      </Field>
      <Field label="Add a cabin for the night crossing" layout="inline"><Checkbox /></Field>
    </>
  );
}`,
    // A mapped list with ids from the key.
    `${imports}
export function Extras({ items }) {
  return items.map((item) => (
    <div key={item.id} className="flex items-center gap-2">
      <Checkbox id={\`extra-\${item.id}\`} />
      <Label htmlFor={\`extra-\${item.id}\`}>{item.label}</Label>
    </div>
  ));
}`,
    // A table row checkbox: no text of its own.
    `${imports}
export const columns = [{ id: "select", cell: ({ row }) => (
  <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
) }];`,
    `${imports}
export function Row({ row }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox aria-label="Select row" />
      <span className="text-muted-foreground">3 of 10 selected</span>
    </div>
  );
}`,
    // A hint beside a control that is named elsewhere.
    `${imports}
export function Opt() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="cabin" />
      <div><Label htmlFor="cabin">Add a cabin</Label><p>From 40 euros</p></div>
    </div>
  );
}`,
    // No name at all: FRM-010 reports it, not this rule.
    `${imports}
export function Opt() {
  return <div className="flex gap-2"><Checkbox /><span>Add a cabin</span></div>;
}`,
    // pointer-events-none only for the disabled state.
    `${imports}
export function Opt() {
  return (
    <div className="flex gap-2">
      <Checkbox id="a" />
      <Label htmlFor="a" className="group-data-[disabled=true]:pointer-events-none">Add a cabin</Label>
    </div>
  );
}`,
    // pointer-events-none on a disabled option.
    `${imports}
export function Opt() {
  return (
    <div className="flex gap-2">
      <Checkbox id="a" disabled />
      <Label htmlFor="a" className="pointer-events-none opacity-50">Add a cabin</Label>
    </div>
  );
}`,
    // A Label that points at a control elsewhere in the file, or holds one.
    `${imports}
export function Opt() {
  return (
    <div className="flex gap-2">
      <Checkbox id="a" />
      <Label htmlFor="a">Add a cabin</Label>
      <Label>Seats <Input /></Label>
    </div>
  );
}`,
    // Computed ids written the same way.
    `${imports}
export function Opt() {
  const id = useId();
  return (
    <div className="flex gap-2">
      <Checkbox id={id} aria-label="Add a cabin" />
      <Label htmlFor={id}>Add a cabin</Label>
    </div>
  );
}`,
    // A row onClick with a control that stops its own click.
    `${imports}
export function Opt() {
  const [on, setOn] = useState(false);
  return (
    <div onClick={() => setOn(!on)} className="flex gap-2">
      <Checkbox id="a" checked={on} onCheckedChange={setOn} onClick={(e) => e.stopPropagation()} />
      <Label htmlFor="a">Add a cabin</Label>
    </div>
  );
}`,
    // A native label wrapping a native checkbox.
    `export const X = () => <label className="flex gap-2"><input type="checkbox" name="cabin" /> Add a cabin</label>;`,
    // A switch is FRM-016b.
    `export const X = () => <div className="flex gap-2"><Switch id="s" /><span>Email me</span></div>;`,
  ],
  invalid: [
    // The text in a span, with the box named by aria-label.
    {
      code: `${imports}
export function Opt() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-5 items-center"><Checkbox aria-label="Add a cabin for the night crossing" /></div>
      <span>Add a cabin for the night crossing</span>
    </div>
  );
}`,
      errors: [{ messageId: "textNotTied" }],
    },
    // The text in a span that aria-labelledby points at.
    {
      code: `${imports}
export function Opt() {
  return (
    <div className="flex items-start gap-3">
      <Checkbox aria-labelledby="cabin-text" />
      <span id="cabin-text">Add a cabin for the night crossing</span>
    </div>
  );
}`,
      errors: [{ messageId: "textNotTied" }],
    },
    // An id that nothing points at, and the text in a p.
    {
      code: `${imports}
export function Opt() {
  return (
    <div className="flex items-center gap-2">
      <RadioGroupItem value="bed" id="bed" />
      <p>Cabin bed</p>
    </div>
  );
}`,
      errors: [{ messageId: "textNotTied" }],
    },
    // A Label with no htmlFor beside the box.
    {
      code: `${imports}
export function Opt() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="cabin" />
      <Label>Add a cabin</Label>
    </div>
  );
}`,
      errors: [{ messageId: "labelNoFor" }],
    },
    // The id on a wrapping div, not on the control.
    {
      code: `${imports}
export function Opt() {
  return (
    <div id="cabin" className="flex items-center gap-2">
      <Checkbox />
      <Label htmlFor="cabin">Add a cabin</Label>
    </div>
  );
}`,
      errors: [{ messageId: "labelForMismatch" }],
    },
    // Every mapped box has the id "option".
    {
      code: `${imports}
const EXTRAS = ["Breakfast on board", "Priority boarding", "Bike space"];
export function Extras() {
  return EXTRAS.map((name) => (
    <div key={name} className="flex items-start gap-3">
      <div className="flex h-5 items-center"><Checkbox id="option" aria-label={name} /></div>
      <Label htmlFor="option">{name}</Label>
    </div>
  ));
}`,
      errors: [{ messageId: "mappedId" }],
    },
    // pointer-events-none on the label of an enabled option.
    {
      code: `${imports}
export function Opt() {
  return (
    <div className="flex gap-2">
      <Checkbox id="a" />
      <Label htmlFor="a" className="pointer-events-none">Add a cabin</Label>
    </div>
  );
}`,
      errors: [{ messageId: "pointerEvents" }],
    },
    // A row div whose onClick flips the state.
    {
      code: `${imports}
export function Opt() {
  const [on, setOn] = useState(false);
  return (
    <div className="flex gap-2 cursor-pointer" onClick={() => setOn(!on)}>
      <Checkbox checked={on} onCheckedChange={(v) => setOn(v === true)} aria-label="Add a cabin" />
      <span>Add a cabin</span>
    </div>
  );
}`,
      errors: [{ messageId: "rowClick" }, { messageId: "textNotTied" }],
    },
    // A native checkbox with its text in a span.
    {
      code: `export const X = () => (
  <div className="flex gap-2"><input type="checkbox" id="news" /><span>Send me the newsletter</span></div>
);`,
      errors: [{ messageId: "textNotTied" }],
    },
  ],
});
