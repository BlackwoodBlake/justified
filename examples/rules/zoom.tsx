import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Switch } from "@blackwoodblake/justified-shadcn/switch";
import { useState, type ReactNode } from "react";

import { Outcome, useSay } from "./dialog";
import { stopPlainClick } from "./links-buttons";

/*
 * A drawn page for the text-size and text-spacing examples (LAY-003a, LAY-003b).
 *
 * The real page cannot be zoomed from inside an example, and the host page must
 * never set a viewport meta tag. So the scene is a frame whose own font size is
 * set in pixels (14 px, or 28 px for "200%"), and everything inside it is sized
 * in em, so boxes follow the text exactly as they follow the browser's zoom.
 * The width of the scene stays put, so grown text wraps onto more lines, as it
 * does in a zoomed window. The spacing toggle writes the four WCAG 1.4.12 values
 * into a style that reaches only this frame.
 *
 * For the examples only. It is not a component of the system.
 */

const SPACING_CSS = `
[data-spacing="on"], [data-spacing="on"] * {
  line-height: 1.5 !important;
  letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important;
}
[data-spacing="on"] p { margin-bottom: 2em !important; }
`;

/** The scene itself: a box with its own text size and, if asked, the wider spacing. */
export function ZoomScene({
  size = 1,
  spacing = false,
  narrow = false,
  children,
}: {
  size?: 1 | 2;
  spacing?: boolean;
  /** A narrower window, so grown text wraps as it does in a zoomed one. */
  narrow?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      data-testid="zoom-scene"
      data-zoom={size === 2 ? "200" : "100"}
      data-spacing={spacing ? "on" : "off"}
      className={`w-full ${narrow ? "max-w-[20rem]" : "max-w-md"} overflow-hidden rounded-lg border border-border bg-background p-[1em] text-foreground`}
      // Pixels on purpose: the frame is the stand-in for the browser's zoom.
      style={{ fontSize: size === 2 ? 28 : 14, lineHeight: 1.3 }}
    >
      {spacing && <style>{SPACING_CSS}</style>}
      {children}
    </div>
  );
}

/** A scene with a switch above it, and a line that says what the switch did. */
export function ZoomDemo({ mode, narrow, children }: { mode: "size" | "spacing"; narrow?: boolean; children: ReactNode }) {
  const [on, setOn] = useState(false);
  const [said, say] = useSay();
  const isSize = mode === "size";
  const label = isSize ? "Text size 200%" : "Apply text spacing";
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <Field label={label} layout="inline" hint={isSize ? "Shows the page as at 200 percent zoom." : "Line height 1.5, letters 0.12 em, words 0.16 em, paragraphs 2 em."}>
        <Switch
          checked={on}
          onCheckedChange={(v) => {
            setOn(v);
            say(isSize ? `Text size is ${v ? "200" : "100"} percent.` : `Text spacing is ${v ? "widened" : "back to normal"}.`);
          }}
        />
      </Field>
      <ZoomScene size={isSize && on ? 2 : 1} spacing={!isSize && on} narrow={narrow}>
        {children}
      </ZoomScene>
      <Outcome>{said}</Outcome>
    </div>
  );
}

const ring =
  "outline-none focus-visible:ring-(length:--focus-ring-width) focus-visible:ring-ring focus-visible:ring-offset-[length:var(--focus-ring-offset)] focus-visible:ring-offset-background";

/** A button that is sized in em, so it follows the scene's text size. */
export function SceneButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[2.75em] cursor-pointer items-center justify-center rounded-md bg-primary px-[1em] py-[0.4em] font-medium text-primary-foreground hover:bg-primary/90 ${ring}`}
    >
      {children}
    </button>
  );
}

/**
 * A link that is sized in em. It has a real address; a plain click is stopped
 * so the example stays put, and onFollow says where it would have gone.
 */
export function SceneLink({
  children,
  href,
  onFollow,
  current,
}: {
  children: ReactNode;
  href: string;
  onFollow?: (href: string) => void;
  current?: boolean;
}) {
  return (
    <a
      href={href}
      aria-current={current ? "page" : undefined}
      onClick={(e) => {
        if (stopPlainClick(e)) onFollow?.(href);
      }}
      className={`${ring} rounded-sm underline underline-offset-2 hover:decoration-2`}
    >
      {children}
    </a>
  );
}

/** A line of code, drawn as text. It is never a real tag or setting. */
export function CodeLine({ children }: { children: ReactNode }) {
  return (
    <code className="block w-full rounded-md border border-border bg-card px-3 py-2 font-mono text-xs [overflow-wrap:anywhere] text-foreground">
      {children}
    </code>
  );
}
