import { CheckIcon } from "@blackwoodblake/justified-shadcn/icons";
import { Label } from "@blackwoodblake/justified-shadcn/label";
import { RadioGroup, RadioGroupItem } from "@blackwoodblake/justified-shadcn/radio-group";
import { useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from "react";

import { drawnRing } from "./dialog";

/*
 * Helpers for the examples on hover, press, selected and the state in code
 * (VIS-004, VIS-008, VIS-008a and VIS-008b).
 *
 *   - Strip draws one control in several looks side by side, each under its
 *     label ("At rest", "Hover", "Pressed", "Selected + hover"). A hover and a
 *     press cannot be seen in a still, so the looks are drawn with the same
 *     classes the live control uses, written without their hover: and
 *     active: prefix. A strip is a picture: hidden from assistive technology
 *     and inert.
 *   - TrackLook wraps a live scene and writes what the pointer or keyboard is
 *     doing to the control under it ("Download: pressed"), from the real
 *     pointer events and the Space key on a button. It is the way to see that a tap on a touch screen shows the
 *     pressed look and no hover.
 *   - CodeReadout lists the state a control carries in code (aria-pressed,
 *     aria-checked, aria-selected, aria-expanded, aria-disabled, data-state),
 *     read from the element and kept up to date, so a look that says "on"
 *     while the code says nothing can be seen.
 *   - IconButton, ChoiceCards and the small icons are local pressables for
 *     the scenes, since the adapter has no card, row or tile.
 *
 * For the examples only. They are not components of the system.
 */

/* The shared looks. Each is written out in full so Tailwind finds it. */

/** Keyboard focus ring for a custom control (KBD-001), the same classes the adapter uses. */
export const FOCUS =
  "outline-none focus-visible:outline-hidden focus-visible:ring-(length:--focus-ring-width) focus-visible:ring-ring " +
  "focus-visible:ring-offset-[length:var(--focus-ring-offset)] focus-visible:ring-offset-background";

export const COLOUR_TRANSITION = "transition-colors duration-(--motion-duration-fast) ease-standard";

/** The pressed look: the hover fill plus a shadow pressed in from the top edge, so it also differs from hover. */
export const PRESSED_SHADOW = "shadow-[inset_0_2px_4px_color-mix(in_oklab,var(--foreground)_25%,transparent)]";
export const ACTIVE_SHADOW = "active:shadow-[inset_0_2px_4px_color-mix(in_oklab,var(--foreground)_25%,transparent)]";

/** Hover and press for a control that works: written for the pointer and for the finger. */
export const LIVE_PRESS = `hover:bg-accent hover:text-accent-foreground active:bg-accent active:text-accent-foreground ${ACTIVE_SHADOW}`;
/** The same looks held still, for a strip. */
export const HOVER_STILL = "bg-accent text-accent-foreground";
export const PRESSED_STILL = `bg-accent text-accent-foreground ${PRESSED_SHADOW}`;

export type Look = "rest" | "hover" | "pressed";

/* Stills. */

export type StripCell = { label: string; node: ReactNode };

/** One control in several looks, side by side, each with its label under it. */
export function Strip({ cells, cols = 4, compact, note }: { cells: StripCell[]; cols?: 2 | 3 | 4; compact?: boolean; note?: ReactNode }) {
  const grid = cols === 2 ? "grid-cols-1 @sm:grid-cols-2" : cols === 3 && compact ? "grid-cols-3" : cols === 3 ? "grid-cols-1 @md:grid-cols-3" : "grid-cols-2 @sm:grid-cols-4";
  return (
    <div aria-hidden="true" inert className="@container w-full">
      <div className={`grid gap-x-3 gap-y-4 ${grid}`}>
        {cells.map((c) => (
          <div key={c.label} className="flex min-w-0 flex-col items-center justify-end gap-1.5">
            <div className="flex w-full justify-center">{c.node}</div>
            <span className="text-center text-xs font-medium text-muted-foreground">{c.label}</span>
          </div>
        ))}
      </div>
      {note && <p className="m-0 mt-3 text-center text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

/* Live pointer and keyboard state. */

type Tracked = { name: string; look: Look; off?: boolean } | null;

/**
 * Writes what the pointer or the keyboard is doing to the control under it.
 * Mark each control with data-look-name. A touch never shows a hover, only a press.
 */
export function TrackLook({ children }: { children: ReactNode }) {
  const [t, setT] = useState<Tracked>(null);
  const pointerType = useRef("mouse");
  const nameAt = (target: EventTarget) =>
    target instanceof Element ? (target.closest("[data-look-name]")?.getAttribute("data-look-name") ?? null) : null;
  const set = (target: EventTarget, look: Look) => {
    const name = nameAt(target);
    const off = target instanceof Element && target.closest("[data-look-name]")?.getAttribute("aria-disabled") === "true";
    setT(name ? { name, look, off } : null);
  };
  const text = !t
    ? "nothing is hovered or pressed"
    : `${t.name}: ${t.look === "rest" ? "at rest" : t.look === "hover" ? "hovered" : "pressed"}${t.off ? " (off, no change)" : ""}`;
  return (
    <div className="flex w-full flex-col gap-3">
      <div
        onPointerOverCapture={(e) => {
          pointerType.current = e.pointerType;
          if (e.pointerType !== "touch") setT((cur) => (cur?.look === "pressed" && cur.name === nameAt(e.target) ? cur : toLook(nameAt(e.target), "hover", e.target instanceof Element && e.target.closest("[data-look-name]")?.getAttribute("aria-disabled") === "true")));
        }}
        onPointerDownCapture={(e) => {
          pointerType.current = e.pointerType;
          set(e.target, "pressed");
        }}
        onPointerUpCapture={(e) => (e.pointerType === "touch" ? setT(null) : set(e.target, "hover"))}
        onPointerCancelCapture={() => setT(null)}
        onPointerLeave={() => setT(null)}
        onKeyDownCapture={(e) => e.key === " " && e.target instanceof HTMLButtonElement && set(e.target, "pressed")}
        onKeyUpCapture={() => setT(null)}
      >
        {children}
      </div>
      <p
        aria-hidden="true"
        className="m-0 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground"
      >
        Right now: <span className="font-medium text-foreground">{text}</span>
      </p>
    </div>
  );
}

function toLook(name: string | null, look: Look, off?: boolean): Tracked {
  return name ? { name, look, off } : null;
}

/* The state a control carries in code. */

const STATE_ATTRS = ["aria-pressed", "aria-checked", "aria-selected", "aria-expanded", "aria-disabled", "aria-current", "data-state"];

function visibleText(el: Element): string {
  const copy = el.cloneNode(true) as Element;
  copy.querySelectorAll("[aria-hidden='true']").forEach((n) => n.remove());
  const parts: string[] = [];
  const walk = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) parts.push(n.textContent ?? "");
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function nameFor(el: Element): string {
  const label = el.getAttribute("aria-label");
  if (label) return label.trim();
  const labels = (el as HTMLButtonElement).labels;
  if (labels && labels.length) return [...labels].map((l) => visibleText(l)).join(" ").trim();
  return visibleText(el);
}

/** Lists the state in code of every matching control in the scene, kept up to date. */
export function CodeReadout({ scope, selector = "button, [role='radio'], [role='option']" }: { scope: { current: HTMLElement | null }; selector?: string }) {
  const [rows, setRows] = useState<{ name: string; attrs: string[] }[]>([]);
  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    const read = () =>
      setRows(
        [...root.querySelectorAll(selector)].map((el) => ({
          name: nameFor(el),
          attrs: STATE_ATTRS.filter((a) => el.hasAttribute(a)).map((a) => `${a}="${el.getAttribute(a)}"`),
        })),
      );
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, subtree: true, childList: true, attributeFilter: STATE_ATTRS });
    return () => observer.disconnect();
  }, [scope, selector]);

  return (
    <div aria-hidden="true" className="w-full rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
      <p className="m-0">State in code:</p>
      <ul className="m-0 mt-1 list-none space-y-0.5 p-0">
        {rows.map((r, i) => (
          <li key={i} data-code-row="">
            <span className="font-medium text-foreground">{r.name}</span>
            {": "}
            {r.attrs.length ? <code className="text-foreground">{r.attrs.join(" ")}</code> : <em>nothing set</em>}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Small icons for the scenes (the adapter's set has none of these). */

type SvgProps = ComponentProps<"svg">;
const svg = (p: SvgProps) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
  className: "size-5 shrink-0",
  ...p,
});
export const DownloadGlyph = (p: SvgProps) => (
  <svg {...svg(p)}>
    <path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />
  </svg>
);
export const ShareGlyph = (p: SvgProps) => (
  <svg {...svg(p)}>
    <path d="M12 15V4m0 0L8 8m4-4 4 4M6 12v7h12v-7" />
  </svg>
);
export const RenameGlyph = (p: SvgProps) => (
  <svg {...svg(p)}>
    <path d="M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4" />
  </svg>
);
export const FileGlyph = (p: SvgProps) => (
  <svg {...svg({ className: "size-8 shrink-0 text-muted-foreground", ...p })}>
    <path d="M7 3h7l4 4v14H7zM14 3v4h4" />
  </svg>
);
export const StarGlyph = ({ filled, ...p }: SvgProps & { filled?: boolean }) => (
  <svg {...svg(p)} fill={filled ? "currentColor" : "none"}>
    <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8z" />
  </svg>
);
export const MicGlyph = ({ off, ...p }: SvgProps & { off?: boolean }) => (
  <svg {...svg(p)}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    {off && <path d="M4 4l16 16" />}
  </svg>
);

/* Icon buttons with a stated look. */

/**
 * A 40 px icon button (ACT-006). "do" gives it a hover fill and a pressed look;
 * "dont" strips both, as hover:bg-transparent does. An aria-disabled one that
 * is scoped with not-aria-disabled: stays still; an unscoped one lights up.
 */
export function IconButton({
  name,
  icon,
  mode,
  off,
  scoped = true,
  force,
  onPress,
  describedBy,
}: {
  name: string;
  icon: ReactNode;
  mode: "do" | "dont";
  off?: boolean;
  /** For a button that is off: scope hover and press to buttons that work. */
  scoped?: boolean;
  force?: Look;
  onPress?: () => void;
  describedBy?: string;
}) {
  const base = `inline-flex size-10 shrink-0 items-center justify-center rounded-md text-foreground ${COLOUR_TRANSITION} ${FOCUS}`;
  const lights = off ? !scoped : mode === "do";
  const still = force === "hover" ? HOVER_STILL : force === "pressed" ? PRESSED_STILL : "";
  const look = force
    ? lights
      ? still
      : ""
    : off
      ? scoped
        ? "not-aria-disabled:hover:bg-accent not-aria-disabled:hover:text-accent-foreground not-aria-disabled:active:bg-accent not-aria-disabled:active:shadow-[inset_0_2px_4px_color-mix(in_oklab,var(--foreground)_25%,transparent)]"
        : LIVE_PRESS
      : lights
        ? LIVE_PRESS
        : "";
  return (
    <button
      type="button"
      data-look-name={name}
      aria-label={name}
      aria-disabled={off ? "true" : undefined}
      aria-describedby={describedBy}
      onClick={() => {
        if (off) return;
        onPress?.();
      }}
      className={`${base} ${look} ${off ? "cursor-not-allowed text-muted-foreground" : "cursor-pointer"}`}
    >
      {icon}
    </button>
  );
}

/* Cards you choose between. */

export type Choice = { id: string; title: string; detail: string; price: string };

export type ChoiceMark = "radio-and-text" | "border-and-check" | "ring";

/**
 * Cards you choose one of. control="radio" builds them as a RadioGroup, so the
 * chosen card is checked in code. control="button" builds each as a plain
 * button that only looks chosen. mark says how the chosen card is drawn.
 */
export function ChoiceCards({
  legend,
  items,
  control,
  mark,
  defaultValue,
}: {
  legend: string;
  items: Choice[];
  control: "radio" | "button";
  mark: ChoiceMark;
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const legendId = useId();
  const cards = items.map((item) =>
    control === "radio" ? (
      <Label key={item.id} className={cardClass(value === item.id, mark, "live-radio")}>
        <RadioGroupItem value={item.id} className={mark === "ring" ? "absolute size-px opacity-0 after:hidden" : "mt-0.5 focus-visible:ring-0 focus-visible:ring-offset-0"} />
        <CardText item={item} selected={value === item.id} mark={mark} />
      </Label>
    ) : (
      <button
        key={item.id}
        type="button"
        data-look-name={item.title}
        onClick={() => setValue(item.id)}
        className={cardClass(value === item.id, mark, "live-button")}
      >
        <CardText item={item} selected={value === item.id} mark={mark} />
      </button>
    ),
  );
  return (
    <div role={control === "radio" ? undefined : "group"} aria-labelledby={control === "radio" ? undefined : legendId} className="grid w-full gap-2">
      <p id={legendId} className="m-0 text-sm font-medium">
        {legend}
      </p>
      {control === "radio" ? (
        <RadioGroup value={value} onValueChange={setValue} aria-labelledby={legendId} className="grid gap-2">
          {cards}
        </RadioGroup>
      ) : (
        cards
      )}
    </div>
  );
}

function CardText({ item, selected, mark }: { item: Choice; selected: boolean; mark: ChoiceMark }) {
  return (
    <>
      <span className="flex min-w-0 flex-1 flex-col text-left">
        <span className="text-sm font-medium">{item.title}</span>
        <span className="text-sm text-muted-foreground">{item.detail}</span>
      </span>
      <span className="flex flex-col items-end gap-1 text-sm font-medium">
        {item.price}
        {selected && mark === "radio-and-text" && (
          <span aria-hidden="true" className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
            <CheckIcon className="size-3.5" />
            Selected
          </span>
        )}
        {selected && mark === "border-and-check" && <CheckIcon aria-hidden="true" className="size-4 text-primary" />}
      </span>
    </>
  );
}

const CARD_BASE = `relative flex w-full cursor-pointer items-start gap-3 rounded-lg border p-3 text-card-foreground ${COLOUR_TRANSITION}`;
const CARD_HOVER = `hover:bg-accent hover:text-accent-foreground active:bg-accent ${ACTIVE_SHADOW}`;
const CARD_FOCUS_BUTTON = FOCUS;
const CARD_FOCUS_WITHIN =
  "has-focus-visible:ring-(length:--focus-ring-width) has-focus-visible:ring-ring has-focus-visible:ring-offset-[length:var(--focus-ring-offset)] has-focus-visible:ring-offset-background";

function cardClass(selected: boolean, mark: ChoiceMark, as: "live-radio" | "live-button") {
  const edge = selected ? (mark === "ring" ? `border-border ${drawnRing}` : "border-primary") : "border-border";
  const focus = as === "live-radio" ? CARD_FOCUS_WITHIN : CARD_FOCUS_BUTTON;
  return `${CARD_BASE} bg-card ${edge} ${CARD_HOVER} ${focus}`;
}

/** A card in a strip: the same face as a live card, held in one look. */
export function CardStill({
  item,
  selected,
  look,
  focused,
  mark,
  radio,
}: {
  item: Choice;
  selected: boolean;
  look: Look;
  focused?: boolean;
  mark: ChoiceMark;
  /** Draw the radio circle, as the live card does. */
  radio?: boolean;
}) {
  const edge = selected ? (mark === "ring" ? `border-border ${drawnRing}` : "border-primary") : "border-border";
  const fill = look === "hover" ? HOVER_STILL : look === "pressed" ? PRESSED_STILL : "";
  return (
    <div className={`${CARD_BASE} ${edge} ${fill || "bg-card"} ${focused ? drawnRing : ""} w-full`}>
      {radio && (
        <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border bg-background ${selected ? "border-primary" : "border-input"}`}>
          {selected && <span className="size-2.5 rounded-full bg-primary" />}
        </span>
      )}
      <CardText item={item} selected={selected} mark={mark} />
    </div>
  );
}
