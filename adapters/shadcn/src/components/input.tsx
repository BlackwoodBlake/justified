import type { ComponentProps } from "react";

import { fieldControl } from "../lib/styles";
import { cn } from "../lib/utils";

/**
 * A text input. Put it inside a Field so it gets a label, a hint and an
 * error. The text is 16 px, so phones do not zoom in when it gets focus.
 */
export function Input({ className, type = "text", ...props }: ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        fieldControl,
        "h-10 py-2",
        "file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
