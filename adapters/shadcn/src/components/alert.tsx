import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "../lib/utils";

/*
 * An inline notice: a box of text in the page, next to what it is about,
 * that stays until it is no longer true (FBK-002, FBK-003). It follows
 * shadcn's API, with three changes:
 *
 *   - It has no role by default. A notice that is there when the page loads
 *     should not interrupt anyone. When a notice appears because of what the
 *     person just did, either pass role="alert" for an error, or put the
 *     words in a live region that was already in the page (FBK-004).
 *   - The title is never cut off, so no part of the message is hidden.
 *   - The destructive variant colours the border and the icon, not the text,
 *     so every colour pair is one the tokens already check for contrast.
 *
 * Put a decorative icon from the icons file as the first child.
 */
export const alertVariants = cva(
  "grid w-full grid-cols-[0_1fr] items-start gap-y-1 rounded-lg border bg-background px-4 py-3 text-sm text-foreground " +
    "has-[>svg]:grid-cols-[1rem_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5",
  {
    variants: {
      variant: {
        default: "border-border [&>svg]:text-foreground",
        destructive: "border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type AlertProps = ComponentProps<"div"> & VariantProps<typeof alertVariants>;

export function Alert({ className, variant, ...props }: AlertProps) {
  return <div data-slot="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

export function AlertTitle({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="alert-title" className={cn("col-start-2 font-medium", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-2 text-muted-foreground [&_p]:m-0 [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}
