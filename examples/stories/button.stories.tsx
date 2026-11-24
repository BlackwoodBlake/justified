import { Button } from "@blackwoodblake/justified-shadcn/button";
import { TrashIcon } from "@blackwoodblake/justified-shadcn/icons";
import type { Meta, StoryObj } from "@storybook/react-vite";

/*
 * Workshop stories for the button. Do and Don't stories are added per rule
 * once the rule has a verdict; until then this shows the variants only.
 */
const meta = {
  title: "Components/Button",
  component: Button,
  args: { children: "Save changes" },
  argTypes: {
    variant: { control: "select", options: ["default", "secondary", "outline", "ghost", "destructive", "link"] },
    size: { control: "select", options: ["sm", "default", "lg", "icon"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Save changes</Button>
      <Button variant="secondary">Preview</Button>
      <Button variant="outline">Export</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="destructive">Delete project</Button>
      <Button variant="link">View history</Button>
    </div>
  ),
};

export const AsLink: Story = {
  render: () => (
    <Button asChild variant="outline">
      <a href="#method">Read the method</a>
    </Button>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <Button variant="outline" size="icon" aria-label="Remove attachment contract.pdf">
      <TrashIcon />
    </Button>
  ),
};
