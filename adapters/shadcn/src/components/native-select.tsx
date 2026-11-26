import type { ComponentProps } from "react";

import { ChevronDownIcon } from "../lib/icons";
import { fieldControl } from "../lib/styles";
import { cn } from "../lib/utils";

/**
 * A select built on the browser's own <select>. It works with every
 * keyboard, screen reader and phone without extra code, which is why it is
 * the default choice. Put it inside a Field.
 */
export function NativeSelect({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div data-slot="native-select" className="relative w-full">
      <select
        className={cn(
          fieldControl,
          "h-10 cursor-pointer appearance-none py-2 pr-10",
          // Drawn by us, not the browser, so it shows hover and press itself (VIS-008).
          // The edge stays border-input in both (VIS-004).
          "not-disabled:not-aria-disabled:hover:bg-accent",
          "not-disabled:not-aria-disabled:active:bg-[color-mix(in_oklab,var(--accent),var(--foreground)_10%)]",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
