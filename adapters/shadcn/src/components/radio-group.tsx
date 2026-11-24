import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import type { ComponentProps } from "react";

import { colourTransition, focusRing, targetArea } from "../lib/styles";
import { cn } from "../lib/utils";
import { useFieldSet } from "./field";

/**
 * One choice from a short list. Put it in a FieldSet, which gives the group
 * its name, hint and error; give each RadioGroupItem a Field with
 * layout="inline". Arrow keys move between the options.
 */
export function RadioGroup({ className, ...props }: ComponentProps<typeof RadioGroupPrimitive.Root>) {
  const group = useFieldSet();
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      aria-labelledby={group.labelledBy}
      aria-describedby={group.describedBy}
      aria-invalid={group.invalid || undefined}
      aria-required={group.required || undefined}
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

export function RadioGroupItem({ className, ...props }: ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "peer size-5 shrink-0 cursor-pointer rounded-full border border-input bg-background",
        "data-[state=checked]:border-primary aria-invalid:border-destructive",
        "disabled:cursor-not-allowed disabled:opacity-50",
        colourTransition,
        focusRing,
        targetArea,
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <span className="size-2.5 rounded-full bg-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}
