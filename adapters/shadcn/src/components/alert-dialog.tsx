import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import type { ComponentProps } from "react";

import { keepFocusOnBackdrop, useDialogFocus } from "../lib/dialog-focus";
import { dialogFooter, dialogOverlay, dialogSurface } from "../lib/styles";
import { cn } from "../lib/utils";
import { Button, type ButtonProps } from "./button";

/*
 * A dialog that asks the person to confirm a step before it runs, built on
 * Radix with shadcn's API. Use it only when DST-001b says to ask; for a step
 * that Undo fully reverses, run it and offer Undo instead (DST-001a).
 *
 *   - It has role="alertdialog", is named by its title and described by its
 *     description, and a click on the backdrop does not close it.
 *   - Focus starts on AlertDialogCancel, never on the action (DLG-004). Enter
 *     only presses the button that has focus; do not wrap the dialog in a form
 *     whose submit button is the action.
 *   - AlertDialogCancel says "Cancel" unless you give it other words, stays
 *     enabled and closes with nothing changed. Escape does the same (DLG-001,
 *     DLG-003). Always include it.
 *   - Name the action with a verb that says what it does, such as
 *     "Delete project", never "OK" or "Yes" (DLG-003). For a destructive
 *     action, give it variant="destructive" (DLG-005).
 *   - The footer keeps the order of the code: Cancel first, the action last
 *     (ACT-003a). Stacked on a narrow screen, the order stays (LAY-002).
 *   - data-autofocus on another element moves the first focus there. Only for
 *     a dialog with no Cancel, such as a time-out warning (STA-004).
 *
 * When it closes, focus goes back to the control that opened it (DLG-006). If that
 * control is gone, for example because its row was deleted, set focus in
 * onCloseAutoFocus. There is no animation.
 */

export function AlertDialog(props: ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

export function AlertDialogTrigger(props: ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

export function AlertDialogContent({
  className,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Content>) {
  // Without data-autofocus, Radix puts first focus on Cancel.
  const focus = useDialogFocus({ onOpenAutoFocus, onCloseAutoFocus, skipCloseIcon: false });
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay
        data-slot="alert-dialog-overlay"
        className={dialogOverlay}
        onMouseDown={keepFocusOnBackdrop}
      >
        <AlertDialogPrimitive.Content
          data-slot="alert-dialog-content"
          className={cn(dialogSurface, className)}
          aria-modal="true"
          {...focus}
          {...props}
        />
      </AlertDialogPrimitive.Overlay>
    </AlertDialogPrimitive.Portal>
  );
}

export function AlertDialogHeader({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="alert-dialog-header" className={cn("grid gap-2", className)} {...props} />;
}

/** Write AlertDialogCancel first and the action last. */
export function AlertDialogFooter({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="alert-dialog-footer" className={cn(dialogFooter, className)} {...props} />;
}

export function AlertDialogTitle({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("m-0 text-base font-semibold leading-snug", className)}
      {...props}
    />
  );
}

export function AlertDialogDescription({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("m-0 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

type ActionProps = ComponentProps<typeof AlertDialogPrimitive.Action> & Pick<ButtonProps, "variant" | "size">;

/** The step itself. Its words name it; for a destructive step use variant="destructive". */
export function AlertDialogAction({ variant = "default", size, ...props }: ActionProps) {
  return (
    <AlertDialogPrimitive.Action asChild>
      <Button data-slot="alert-dialog-action" variant={variant} size={size} {...props} />
    </AlertDialogPrimitive.Action>
  );
}

type CancelProps = ComponentProps<typeof AlertDialogPrimitive.Cancel> & Pick<ButtonProps, "size">;

/**
 * The safe way back. It says "Cancel" and stays enabled. Only after the action
 * has started, while the dialog shows that it is working, may it be disabled (DLG-003).
 */
export function AlertDialogCancel({ children = "Cancel", size, ...props }: CancelProps) {
  return (
    <AlertDialogPrimitive.Cancel asChild>
      <Button data-slot="alert-dialog-cancel" variant="outline" size={size} {...props}>
        {children}
      </Button>
    </AlertDialogPrimitive.Cancel>
  );
}
