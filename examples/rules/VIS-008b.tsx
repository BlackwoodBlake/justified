import { useState } from "react";

import type { RuleExamples } from "./frame";
import {
  ACTIVE_SHADOW,
  CardStill,
  ChoiceCards,
  COLOUR_TRANSITION,
  FOCUS,
  HOVER_STILL,
  PRESSED_SHADOW,
  PRESSED_STILL,
  Strip,
  TrackLook,
  type Choice,
  type Look,
} from "./states";

/*
 * VIS-008b: a state that lasts (selected, on, checked, current) stays visible
 * while the same item is hovered, focused or pressed, and the look of hover,
 * focus or press is never the same as the look of the lasting state.
 *
 * Two scenes from the rule's own text. A toolbar's Bold, Italic and
 * Underline toggles, and two pricing plans as cards.
 *
 * Each example first shows the looks as labelled stills drawn with the same
 * classes as the live control: At rest, Hover, Pressed, and Selected + hover
 * (or Focused, where focus is the point). In the Do, Selected + hover still
 * differs from Hover. In the Don't it is the same picture. Both are built
 * with the state in code (VIS-008a), so each Don't breaks only this rule.
 */

const TOGGLE_BASE = `inline-flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-md border border-input px-3 text-sm ${COLOUR_TRANSITION} ${FOCUS}`;

const ON_STILL = "bg-primary text-primary-foreground";
const ON_HOVER_STILL = "bg-primary/90 text-primary-foreground";
const ON_PRESSED_STILL = `bg-primary/80 text-primary-foreground ${PRESSED_SHADOW}`;

type ToggleProps = { label: "Bold" | "Italic" | "Underline"; on: boolean; mode: "do" | "dont" };

function glyph(label: ToggleProps["label"]) {
  return label === "Bold" ? <strong>B</strong> : label === "Italic" ? <em>I</em> : <u>U</u>;
}

function stillLook({ on, mode }: Pick<ToggleProps, "on" | "mode">, look: Look) {
  if (!on) return look === "hover" ? HOVER_STILL : look === "pressed" ? PRESSED_STILL : "bg-background";
  if (mode === "dont") return look === "hover" ? HOVER_STILL : look === "pressed" ? PRESSED_STILL : ON_STILL;
  return look === "hover" ? ON_HOVER_STILL : look === "pressed" ? ON_PRESSED_STILL : ON_STILL;
}

/** One item of the group, held in one look for a strip. */
function ToggleStill({ label, on, mode, look }: ToggleProps & { look: Look }) {
  return (
    <span className={`${TOGGLE_BASE} ${stillLook({ on, mode }, look)}`}>
      <span aria-hidden="true">{glyph(label)}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

function ToggleItem({ label, on, mode, onToggle }: ToggleProps & { onToggle: () => void }) {
  const look =
    mode === "do"
      ? `bg-background not-aria-pressed:hover:bg-accent not-aria-pressed:hover:text-accent-foreground not-aria-pressed:active:bg-accent aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary/90 aria-pressed:active:bg-primary/80 ${ACTIVE_SHADOW}`
      : `${on ? "bg-primary text-primary-foreground" : "bg-background"} hover:bg-accent hover:text-accent-foreground active:bg-accent ${ACTIVE_SHADOW}`;
  return (
    <button type="button" aria-pressed={on} aria-label={label} data-look-name={label} onClick={onToggle} className={`${TOGGLE_BASE} ${look}`}>
      <span aria-hidden="true">{glyph(label)}</span>
    </button>
  );
}

function ToolbarScene({ mode }: { mode: "do" | "dont" }) {
  const [on, setOn] = useState({ Bold: true, Italic: false, Underline: false });
  const names = ["Bold", "Italic", "Underline"] as const;
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Strip
        cells={[
          { label: "At rest", node: <ToggleStill label="Italic" on={false} mode={mode} look="rest" /> },
          { label: "Hover", node: <ToggleStill label="Italic" on={false} mode={mode} look="hover" /> },
          { label: "Pressed", node: <ToggleStill label="Italic" on={false} mode={mode} look="pressed" /> },
          { label: "Selected + hover", node: <ToggleStill label="Bold" on mode={mode} look="hover" /> },
        ]}
      />
      <TrackLook>
        <div role="group" aria-label="Text style" className="flex gap-2">
          {names.map((n) => (
            <ToggleItem key={n} label={n} mode={mode} on={on[n]} onToggle={() => setOn({ ...on, [n]: !on[n] })} />
          ))}
        </div>
      </TrackLook>
    </div>
  );
}

const PLANS: Choice[] = [
  { id: "starter", title: "Starter", detail: "3 projects", price: "£0" },
  { id: "team", title: "Team", detail: "Unlimited projects", price: "£12" },
];

function PlansScene({ mode }: { mode: "do" | "dont" }) {
  const good = mode === "do";
  const mark = good ? "radio-and-text" : "ring";
  const [starter, team] = PLANS;
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Strip
        cols={2}
        cells={[
          { label: "Selected", node: <CardStill item={team} selected look="rest" mark={mark} radio={good} /> },
          { label: "Focused, not selected", node: <CardStill item={starter} selected={false} look="rest" focused mark={mark} radio={good} /> },
          { label: "Hover, not selected", node: <CardStill item={starter} selected={false} look="hover" mark={mark} radio={good} /> },
          { label: "Selected + hover", node: <CardStill item={team} selected look="hover" mark={mark} radio={good} /> },
        ]}
      />
      <ChoiceCards legend="Plan" items={PLANS} control="radio" mark={mark} defaultValue="team" />
    </div>
  );
}

export const VIS008b: RuleExamples = {
  id: "VIS-008b",
  examples: [
    {
      kind: "do",
      title: "A toggle that stays on under the pointer",
      caption: (
        <>
          An item that is on keeps its fill while hovered, and takes a darker one of its own, with{" "}
          <code>aria-pressed:hover:bg-primary/90</code>; the hover fill is kept for items that are off. In the stills
          "Selected + hover" is not "Hover". Hover <em>Bold</em> and <em>Italic</em> in turn.
        </>
      ),
      Demo: () => <ToolbarScene mode="do" />,
    },
    {
      kind: "dont",
      title: "A hover that wipes out the selection",
      caption: (
        <>
          Every item has <code>hover:bg-accent</code>, so the item that is on turns into any other hovered item. In the
          stills "Selected + hover" and "Hover" are the same picture. Point at <em>Bold</em>: the one place you check
          what you chose is where it looks unchosen.
        </>
      ),
      Demo: () => <ToolbarScene mode="dont" />,
    },
    {
      kind: "do",
      title: "A chosen plan that keeps its marks under the pointer",
      caption: (
        <>
          The chosen plan has a primary border, a filled radio and the word "Selected" with a check. Hover changes only
          its fill, so the marks are still there. Focus is a ring around the card, which no selection uses. Tab and
          arrow through the plans.
        </>
      ),
      Demo: () => <PlansScene mode="do" />,
    },
    {
      kind: "dont",
      title: "A chosen plan drawn with the focus ring",
      caption: (
        <>
          The chosen plan is marked with a <code>ring</code>, the look of focus, and nothing else. In the stills,
          "Selected" and "Focused, not selected" look alike. Live, Tab away from the plans: the chosen plan still wears
          what looks like the focus ring, so you cannot tell where focus is.
        </>
      ),
      Demo: () => <PlansScene mode="dont" />,
    },
  ],
};

