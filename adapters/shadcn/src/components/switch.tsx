import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { ComponentProps } from "react";

import { colourTransition, focusRing, targetArea } from "../lib/styles";
import { cn } from "../lib/utils";

/**
 * A setting that takes effect at once, like a light switch. If the change
 * waits for a Save button, use a Checkbox instead. Use it inside a Field
 * with layout="inline". The track and thumb keep 3:1 contrast in both
 * states (WCAG 2.2, 1.4.11). targetArea makes a 48 by 28 px rectangle
 * pressable (the 44 by 24 track plus 2 px each side), not only the rounded track, so it meets the size
 * test of 2.5.8 Target Size (Minimum) without relying on spacing.
 */
export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-input",
        "data-[state=checked]:bg-primary disabled:cursor-not-allowed disabled:opacity-50",
        colourTransition,
        focusRing,
        targetArea,
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block size-5 rounded-full bg-background shadow-sm",
          "transition-transform duration-(--motion-duration-fast) ease-standard",
          "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}
