import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { NativeSelect } from "@blackwoodblake/justified-shadcn/native-select";
import { Textarea } from "@blackwoodblake/justified-shadcn/textarea";
import type { Meta, StoryObj } from "@storybook/react-vite";

/*
 * Field gives every control a visible label, and reads the hint and the
 * error out with it. Do and Don't stories are added per rule once the rule
 * has a verdict.
 */
const meta = {
  title: "Components/Field",
  component: Field,
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextInput: Story = {
  name: "Text input",
  args: { label: "Full name", children: <Input autoComplete="name" /> },
};

export const WithHint: Story = {
  name: "With a hint",
  args: {
    label: "Email address",
    hint: "We only use it to send your receipt.",
    children: <Input type="email" autoComplete="email" spellCheck={false} />,
  },
};

export const WithError: Story = {
  name: "With an error",
  args: {
    label: "Email address",
    hint: "We only use it to send your receipt.",
    error: "Enter an email address with an @, like name@example.com.",
    children: <Input type="email" autoComplete="email" defaultValue="name.example.com" spellCheck={false} />,
  },
};

export const Marked: Story = {
  name: "Marked optional",
  args: {
    label: "Company",
    mark: true,
    children: <Input autoComplete="organization" />,
  },
};

export const Disabled: Story = {
  args: {
    label: "Account number",
    hint: "Contact support to change it.",
    children: <Input defaultValue="4021-118" disabled />,
  },
};

export const Multiline: Story = {
  name: "Textarea",
  args: {
    label: "Message",
    hint: "Up to 500 characters.",
    children: <Textarea maxLength={500} />,
  },
};

export const Select: Story = {
  name: "Native select",
  args: {
    label: "Country",
    children: (
      <NativeSelect autoComplete="country-name" defaultValue="">
        <option value="" disabled>
          Choose a country
        </option>
        <option>Denmark</option>
        <option>Finland</option>
        <option>Norway</option>
        <option>Sweden</option>
      </NativeSelect>
    ),
  },
};
