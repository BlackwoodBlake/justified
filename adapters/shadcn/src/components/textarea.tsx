import type { ComponentProps } from "react";

import { fieldControl } from "../lib/styles";
import { cn } from "../lib/utils";

/** Several lines of text. Put it inside a Field. The reader can make it taller. */
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn(fieldControl, "min-h-24 resize-y py-2", className)} {...props} />;
}
