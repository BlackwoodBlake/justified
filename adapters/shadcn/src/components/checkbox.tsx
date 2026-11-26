import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import type { ComponentProps } from "react";

import { CheckIcon, MinusIcon } from "../lib/icons";
import { colourTransition, focusRing, targetArea } from "../lib/styles";
import { cn } from "../lib/utils";

/**
 * A checkbox. Use it inside a Field with layout="inline", or in a FieldSet
 * with one Field per option. Supports checked, unchecked and
 * indeterminate. The clickable area is at least 24 px, and the label is
 * clickable too.
 */
export function Checkbox({ className, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer group size-5 shrink-0 cursor-pointer rounded-sm border border-input bg-background text-primary-foreground",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
        "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary",
        "aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
        // Hover and press (VIS-008). The box keeps its edge, and a checked box stays
        // filled with its mark, so the state still shows (VIS-004, VIS-008b).
        "data-[state=unchecked]:not-disabled:not-aria-disabled:hover:bg-accent",
        "data-[state=unchecked]:not-disabled:not-aria-disabled:active:bg-[color-mix(in_oklab,var(--accent),var(--foreground)_10%)]",
        "not-data-[state=unchecked]:not-disabled:not-aria-disabled:hover:border-primary/90",
        "not-data-[state=unchecked]:not-disabled:not-aria-disabled:hover:bg-primary/90",
        "not-data-[state=unchecked]:not-disabled:not-aria-disabled:active:border-[color-mix(in_oklab,var(--primary),var(--foreground)_20%)]",
        "not-data-[state=unchecked]:not-disabled:not-aria-disabled:active:bg-[color-mix(in_oklab,var(--primary),var(--foreground)_20%)]",
        colourTransition,
        focusRing,
        targetArea,
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center">
        <CheckIcon className="size-3.5 group-data-[state=indeterminate]:hidden" />
        <MinusIcon className="hidden size-3.5 group-data-[state=indeterminate]:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
