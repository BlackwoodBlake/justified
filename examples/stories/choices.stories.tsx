import { Checkbox } from "@blackwoodblake/justified-shadcn/checkbox";
import { Field, FieldSet } from "@blackwoodblake/justified-shadcn/field";
import { RadioGroup, RadioGroupItem } from "@blackwoodblake/justified-shadcn/radio-group";
import { Switch } from "@blackwoodblake/justified-shadcn/switch";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

/*
 * Checkboxes, radio buttons and switches. Each option has its own label,
 * which is clickable; a group has a legend.
 */
const meta = {
  title: "Components/Choices",
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleCheckbox: Story = {
  name: "Checkbox",
  render: () => (
    <Field layout="inline" label="Send me the monthly newsletter" hint="You can unsubscribe from any email.">
      <Checkbox />
    </Field>
  ),
};

export const CheckboxError: Story = {
  name: "Checkbox with an error",
  render: () => (
    <Field layout="inline" label="I accept the terms" required error="Accept the terms to create an account.">
      <Checkbox />
    </Field>
  ),
};

function SelectAll() {
  const options = ["Email", "Text message", "Post"];
  const [checked, setChecked] = useState<string[]>(["Email"]);
  const all = checked.length === options.length;
  const some = checked.length > 0 && !all;
  return (
    <FieldSet legend="How should we contact you?" hint="Choose all that apply.">
      <Field layout="inline" label="All of them">
        <Checkbox
          checked={all ? true : some ? "indeterminate" : false}
          onCheckedChange={(v) => setChecked(v === true ? options : [])}
        />
      </Field>
      <div className="flex flex-col gap-3 pl-8">
        {options.map((o) => (
          <Field key={o} layout="inline" label={o}>
            <Checkbox
              checked={checked.includes(o)}
              onCheckedChange={(v) => setChecked((c) => (v === true ? [...c, o] : c.filter((x) => x !== o)))}
            />
          </Field>
        ))}
      </div>
    </FieldSet>
  );
}

export const CheckboxGroup: Story = {
  name: "Checkbox group",
  render: () => <SelectAll />,
};

export const Radio: Story = {
  name: "Radio group",
  render: () => (
    <FieldSet legend="Delivery" hint="Prices include VAT.">
      <RadioGroup defaultValue="standard">
        <Field layout="inline" label="Standard, 3 to 5 days" hint="Free">
          <RadioGroupItem value="standard" />
        </Field>
        <Field layout="inline" label="Express, next working day" hint="€9">
          <RadioGroupItem value="express" />
        </Field>
        <Field layout="inline" label="Collect from a shop">
          <RadioGroupItem value="collect" />
        </Field>
      </RadioGroup>
    </FieldSet>
  ),
};

export const RadioError: Story = {
  name: "Radio group with an error",
  render: () => (
    <FieldSet legend="Delivery" required error="Choose how you want the order delivered.">
      <RadioGroup>
        <Field layout="inline" label="Standard, 3 to 5 days">
          <RadioGroupItem value="standard" />
        </Field>
        <Field layout="inline" label="Express, next working day">
          <RadioGroupItem value="express" />
        </Field>
      </RadioGroup>
    </FieldSet>
  ),
};

export const SwitchStory: Story = {
  name: "Switch",
  render: () => (
    <div className="flex flex-col gap-4">
      <Field layout="inline" label="Dark mode" hint="Changes the colours at once.">
        <Switch />
      </Field>
      <Field layout="inline" label="Show notifications">
        <Switch defaultChecked />
      </Field>
      <Field layout="inline" label="Two-step sign-in" hint="Set by your organisation.">
        <Switch defaultChecked disabled />
      </Field>
    </div>
  ),
};
