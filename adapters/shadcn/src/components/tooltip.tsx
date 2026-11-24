import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ComponentProps } from "react";

import { cn } from "../lib/utils";

/*
 * A tooltip built on Radix, with shadcn's API. Radix already opens it when the
 * trigger gets keyboard focus, closes it with Escape while focus stays on the
 * trigger, and keeps it open while the pointer moves onto it (TXT-002a, TXT-002b).
 * Do not wrap it in anything that changes those three things.
 *
 *   - The trigger must be able to take focus: use asChild with a Button or a
 *     link, never a plain span (TXT-002b).
 *   - A tooltip holds extra help only. What people need to finish the task
 *     goes on the page (TXT-002b).
 *   - On an icon-only button the tooltip uses the same words as the button's
 *     aria-label (ACT-001b).
 *
 * Text is 14 px, not shadcn's 12 px, and the colours are the foreground and
 * background pair, which the tokens check for contrast. There is no animation.
 */
export function TooltipProvider({ delayDuration = 300, ...props }: ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />;
}

export function Tooltip(props: ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

export function TooltipTrigger(props: ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

export function TooltipContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-fit max-w-xs rounded-md bg-foreground px-3 py-1.5 text-sm text-balance text-background",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-foreground" width={10} height={5} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
