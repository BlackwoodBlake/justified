import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { colourTransition, focusRing } from "../lib/styles";
import { cn } from "../lib/utils";

/*
 * A button that follows shadcn's API, styled with Justified's tokens.
 * The focus ring is always visible on keyboard focus (WCAG 2.2, 2.4.7
 * Focus Visible). Behaviour rules are added here as they are decided.
 *
 * Every variant changes while the pointer is over it and while it is pressed
 * (VIS-008). Tailwind applies hover: only where the pointer can hover, so a tap
 * on a phone shows the active: look alone. Hover moves a strong fill towards
 * the page, and a press moves it towards the text colour; the pale secondary
 * fill moves towards the text colour for both, since fading it would barely
 * show. The label and the
 * edge keep their contrast in both themes (VIS-001, VIS-004). Both looks are
 * scoped with not-disabled:not-aria-disabled:, so a button that is off,
 * including one marked aria-disabled="true" while it sends (STA-005b), stays
 * still. To give a button another hover or press look, write it with the same
 * scope, for example className="not-disabled:not-aria-disabled:hover:bg-muted"; a plain hover:
 * class does not override the scoped one.
 */
export const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium " +
    `${colourTransition} ${focusRing} ` +
    "disabled:cursor-not-allowed disabled:opacity-50 " +
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground not-disabled:not-aria-disabled:hover:bg-primary/90 " +
          "not-disabled:not-aria-disabled:active:bg-[color-mix(in_oklab,var(--primary),var(--foreground)_20%)]",
        secondary:
          "bg-secondary text-secondary-foreground " +
          // A pale fill: fading it towards the page would barely show, so hover and press both move it towards the text colour.
          "not-disabled:not-aria-disabled:hover:bg-[color-mix(in_oklab,var(--secondary),var(--foreground)_10%)] " +
          "not-disabled:not-aria-disabled:active:bg-[color-mix(in_oklab,var(--secondary),var(--foreground)_20%)]",
        outline:
          "border border-input bg-background text-foreground " +
          "not-disabled:not-aria-disabled:hover:bg-accent not-disabled:not-aria-disabled:hover:text-accent-foreground " +
          "not-disabled:not-aria-disabled:active:bg-[color-mix(in_oklab,var(--accent),var(--foreground)_10%)] " +
          "not-disabled:not-aria-disabled:active:text-accent-foreground",
        ghost:
          "text-foreground " +
          "not-disabled:not-aria-disabled:hover:bg-accent not-disabled:not-aria-disabled:hover:text-accent-foreground " +
          "not-disabled:not-aria-disabled:active:bg-[color-mix(in_oklab,var(--accent),var(--foreground)_10%)] " +
          "not-disabled:not-aria-disabled:active:text-accent-foreground",
        destructive:
          "bg-destructive text-destructive-foreground not-disabled:not-aria-disabled:hover:bg-destructive/90 " +
          "not-disabled:not-aria-disabled:active:bg-[color-mix(in_oklab,var(--destructive),var(--foreground)_20%)]",
        link:
          "text-primary underline underline-offset-4 not-disabled:not-aria-disabled:hover:decoration-2 " +
          "not-disabled:not-aria-disabled:active:text-foreground not-disabled:not-aria-disabled:active:decoration-2",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3",
        lg: "h-11 px-6 text-base",
        // A square button for one icon. Give it a name with aria-label (ACT-001b).
        icon: "size-10 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Render the child element (for example a link) with button styles. */
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      // A plain <button> defaults to "submit" inside a form; make that a choice.
      type={asChild ? undefined : (type ?? "button")}
      {...props}
    />
  );
}
