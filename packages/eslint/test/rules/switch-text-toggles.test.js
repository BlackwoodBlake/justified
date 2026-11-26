import rule from "../../rules/switch-text-toggles.js";
import { run } from "../helpers.js";

const imports = `
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
`;

run("switch-text-toggles", rule, {
  valid: [
    // shadcn's switch demo.
    `${imports}
export function SwitchDemo() {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  );
}`,
    // shadcn's switch form with react-hook-form.
    `${imports}
export function Settings({ form }) {
  return (
    <FormField control={form.control} name="marketing_emails" render={({ field }) => (
      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
        <div className="space-y-0.5">
          <FormLabel>Marketing emails</FormLabel>
          <FormDescription>Receive emails about new products, features, and more.</FormDescription>
        </div>
        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
      </FormItem>
    )} />
  );
}`,
    // A justify-between row tied by htmlFor and id.
    `${imports}
export function Row() {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor={id}>Email me before departure</Label>
      <Switch id={id} />
    </div>
  );
}`,
    // Field with FieldLabel.
    `${imports}
export function Row() {
  return (
    <Field orientation="horizontal">
      <FieldContent>
        <FieldLabel htmlFor="2fa">Multi-factor authentication</FieldLabel>
        <FieldDescription>Enable multi-factor authentication.</FieldDescription>
      </FieldContent>
      <Switch id="2fa" />
    </Field>
  );
}`,
    // A whole row as the label.
    `${imports}
export function Row() {
  return (
    <Label className="flex items-center justify-between">
      <span>Email me before departure</span>
      <Switch />
    </Label>
  );
}`,
    // A switch with no text of its own.
    `${imports}
export const Cell = () => <Switch aria-label="Publish" checked />;`,
    // No name at all: FRM-010.
    `${imports}
export const Row = () => <div className="flex"><p>Push notifications</p><Switch /></div>;`,
  ],
  invalid: [
    {
      code: `${imports}
export function Row() {
  return (
    <div className="flex items-center justify-between">
      <span id="dep">Email me before departure</span>
      <Switch aria-labelledby="dep" />
    </div>
  );
}`,
      errors: [{ messageId: "textNotTied" }],
    },
    {
      code: `${imports}
export function Row() {
  return (
    <div className="flex items-center justify-between">
      <Label>Email me before departure</Label>
      <Switch id="departure-email" />
    </div>
  );
}`,
      errors: [{ messageId: "labelNoFor" }],
    },
    {
      code: `${imports}
export function Settings({ settings }) {
  return settings.map((s) => (
    <div key={s.key} className="flex justify-between">
      <Label htmlFor="setting">{s.label}</Label>
      <Switch id="setting" />
    </div>
  ));
}`,
      errors: [{ messageId: "mappedId" }],
    },
    {
      code: `${imports}
export function Row() {
  const [on, setOn] = useState(false);
  return (
    <div className="flex justify-between" onClick={() => setOn((v) => !v)}>
      <Label htmlFor="d">Email me</Label>
      <Switch id="d" checked={on} onCheckedChange={setOn} />
    </div>
  );
}`,
      errors: [{ messageId: "rowClick" }],
    },
    {
      code: `${imports}
export function Row() {
  return (
    <div className="flex justify-between">
      <Label htmlFor="d" className="pointer-events-none text-sm">Email me</Label>
      <Switch id="d" />
    </div>
  );
}`,
      errors: [{ messageId: "pointerEvents" }],
    },
  ],
});
