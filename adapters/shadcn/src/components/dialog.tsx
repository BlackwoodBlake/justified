import * as DialogPrimitive from "@radix-ui/react-dialog";
import { createContext, useContext, type ComponentProps } from "react";

import { ignoreScrollbarPress, keepFocusOnBackdrop, useDialogFocus } from "../lib/dialog-focus";
import { CloseIcon } from "../lib/icons";
import { dialogFooter, dialogOverlay, dialogSurface } from "../lib/styles";
import { cn } from "../lib/utils";
import { Button } from "./button";

/*
 * A modal dialog built on Radix, with shadcn's API. What it does for the rules:
 *
 *   - Escape, the close icon, a click on the backdrop and every DialogClose all
 *     call onOpenChange(false), the same path (DLG-001). To check before typed
 *     input is lost, keep `open` true in onOpenChange and show the question by
 *     replacing the dialog's content, not in a second dialog (DLG-002).
 *   - A menu or picker inside the dialog closes on the first Escape; the dialog
 *     on the next one (DLG-001).
 *   - Focus starts on the element marked data-autofocus. Without one it starts
 *     on the first control after the close icon, so a form starts in its first
 *     field. When the dialog closes, focus goes back to the control that was
 *     focused when it opened, also when it was opened without a DialogTrigger.
 *     If that control is gone, set focus yourself in onCloseAutoFocus (DLG-006).
 *   - DialogFooter keeps the order of the code: write Cancel first and the
 *     confirming button last (ACT-003a). On a narrow screen the buttons stack in
 *     that same order. shadcn's own footer reverses them there; this one never
 *     does (LAY-002, DLG-004).
 *   - The close icon sits in DialogHeader after the title, where it is drawn,
 *     and is named by closeLabel (ACT-001b). It is 40 px square (ACT-006).
 *     Unlike shadcn's, it is drawn only inside DialogHeader, and DialogContent
 *     brings its own portal and backdrop.
 *   - A dialog opened over another makes the one beneath inert, so only the
 *     top layer can be reached (DLG-002, DLG-007). See lib/dialog-focus.
 *
 * To confirm a destructive action, use AlertDialog instead (DLG-003 to DLG-005).
 * Open one dialog at a time. Only over a full-screen dialog may one short
 * confirmation sit on top (DLG-002).
 *
 * fullScreen fills the window, for long tasks on a small screen. Its header
 * has the close icon first and then the title; DialogBody scrolls between the
 * header and the footer. There is no animation.
 */

type Layout = { fullScreen: boolean; closeLabel: string; showCloseButton: boolean };
const LayoutContext = createContext<Layout>({ fullScreen: false, closeLabel: "Close", showCloseButton: false });

export function Dialog(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

export function DialogTrigger(props: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

export function DialogClose(props: ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

export function DialogContent({
  className,
  children,
  fullScreen = false,
  showCloseButton = true,
  closeLabel = "Close",
  onOpenAutoFocus,
  onCloseAutoFocus,
  onPointerDownOutside,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & {
  /** Fill the window, for a long task on a small screen. */
  fullScreen?: boolean;
  /** Show a close icon in DialogHeader. */
  showCloseButton?: boolean;
  /**
   * The close icon's accessible name. In a dialog with a form, where the icon
   * throws the input away as Cancel does, pass "Cancel" (FRM-003, ACT-001a).
   */
  closeLabel?: string;
}) {
  const focus = useDialogFocus({ onOpenAutoFocus, onCloseAutoFocus, skipCloseIcon: true });
  const content = (
    <DialogPrimitive.Content
      data-slot="dialog-content"
      className={
        fullScreen
          ? cn("fixed inset-0 z-50 flex flex-col bg-background text-foreground outline-none", className)
          : cn(dialogSurface, className)
      }
      aria-modal="true"
      onPointerDownOutside={ignoreScrollbarPress(onPointerDownOutside)}
      {...focus}
      {...props}
    >
      <LayoutContext.Provider value={{ fullScreen, closeLabel, showCloseButton }}>
        {fullScreen ? <div className="mx-auto flex h-full w-full max-w-lg flex-col">{children}</div> : children}
      </LayoutContext.Provider>
    </DialogPrimitive.Content>
  );
  return (
    <DialogPrimitive.Portal>
      {fullScreen ? (
        <>
          <DialogPrimitive.Overlay data-slot="dialog-overlay" className="fixed inset-0 z-50 bg-background" />
          {content}
        </>
      ) : (
        // The content sits inside the backdrop, so a tall dialog scrolls with it.
        <DialogPrimitive.Overlay data-slot="dialog-overlay" className={dialogOverlay} onMouseDown={keepFocusOnBackdrop}>
          {content}
        </DialogPrimitive.Overlay>
      )}
    </DialogPrimitive.Portal>
  );
}

/** The title, an optional description and the close icon, in the order they are drawn. */
export function DialogHeader({ className, children, ...props }: ComponentProps<"div">) {
  const { fullScreen, closeLabel, showCloseButton } = useContext(LayoutContext);
  const icon = showCloseButton && (
    <DialogPrimitive.Close asChild>
      <Button
        data-slot="dialog-close-icon"
        variant="ghost"
        size="icon"
        aria-label={closeLabel}
        className={fullScreen ? undefined : "-mt-2 -mr-2"}
      >
        <CloseIcon />
      </Button>
    </DialogPrimitive.Close>
  );
  if (fullScreen)
    return (
      <div
        data-slot="dialog-header"
        className={cn("flex items-center gap-2 border-b border-border px-2 py-2", className)}
        {...props}
      >
        {icon}
        <div className={cn("grid min-w-0 flex-1 gap-1", !icon && "px-2")}>{children}</div>
      </div>
    );
  return (
    <div data-slot="dialog-header" className={cn("flex items-start gap-3", className)} {...props}>
      <div className="grid min-w-0 flex-1 gap-2">{children}</div>
      {icon}
    </div>
  );
}

/** The content between the header and the footer. In a full-screen dialog it scrolls. */
export function DialogBody({ className, ...props }: ComponentProps<"div">) {
  const { fullScreen } = useContext(LayoutContext);
  return (
    <div
      data-slot="dialog-body"
      className={cn(fullScreen ? "flex-1 overflow-auto p-4" : "mt-4", className)}
      {...props}
    />
  );
}

/** The action buttons. Write Cancel first and the confirming button last. */
export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  const { fullScreen } = useContext(LayoutContext);
  return (
    <div
      data-slot="dialog-footer"
      className={cn(dialogFooter, fullScreen && "mt-0 border-t border-border p-4", className)}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("m-0 text-base font-semibold leading-snug", className)}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("m-0 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
