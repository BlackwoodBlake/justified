import { Alert, AlertDescription, AlertTitle } from "@blackwoodblake/justified-shadcn/alert";
import { Button } from "@blackwoodblake/justified-shadcn/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@blackwoodblake/justified-shadcn/hover-card";
import { AlertIcon, InfoIcon, LinkIcon } from "@blackwoodblake/justified-shadcn/icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@blackwoodblake/justified-shadcn/tooltip";
import type { Meta, StoryObj } from "@storybook/react-vite";

/*
 * Workshop stories for the notice, the tooltip and the hover card.
 * Try: Tab to a trigger to open it, press Escape to close it, and move
 * the pointer from the trigger onto the content.
 */
const meta = {
  title: "Components/Notices and overlays",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Notice: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-3">
      <Alert>
        <InfoIcon />
        <AlertTitle>Prices change on 1 January</AlertTitle>
        <AlertDescription>
          <p>Plans you already pay for keep their price until they renew.</p>
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertIcon />
        <AlertTitle>The invoice could not be sent</AlertTitle>
        <AlertDescription>
          <p>The connection dropped. Your changes are kept. Try again.</p>
          <Button size="sm" variant="outline">
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  ),
};

export const IconButtonTooltip: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Copy link">
            <LinkIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy link</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const PersonHoverCard: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <a href="#profile" className="font-medium text-primary underline underline-offset-4">
          Priya Shah
        </a>
      </HoverCardTrigger>
      <HoverCardContent>
        <p className="m-0 font-medium">Priya Shah</p>
        <p className="m-0 text-muted-foreground">Product designer, Payments team</p>
      </HoverCardContent>
    </HoverCard>
  ),
};
