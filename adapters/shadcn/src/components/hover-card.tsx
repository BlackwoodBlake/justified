import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import type { ComponentProps } from "react";

import { cn } from "../lib/utils";

/*
 * A hover card built on Radix, with shadcn's API. Radix opens it on hover and
 * on keyboard focus of the trigger, closes it with Escape, and keeps it open
 * while the pointer is on the trigger or the card; the close delay covers the
 * small gap between them (TXT-002a). Do not shorten closeDelay to zero.
 *
 *   - The card is extra information for sighted people. Screen readers do not
 *     get its content, so anything people need must also be on the page or
 *     behind the trigger's link (TXT-002b).
 *   - The trigger is a link or another element that can take focus.
 *   - Links or buttons inside the card are not covered by our rules yet.
 *
 * There is no animation.
 */
export function HoverCard({
  openDelay = 500,
  closeDelay = 300,
  ...props
}: ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" openDelay={openDelay} closeDelay={closeDelay} {...props} />;
}

export function HoverCardTrigger(props: ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />;
}

export function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-64 rounded-md border border-border bg-popover p-4 text-sm text-popover-foreground shadow-md outline-hidden",
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}
