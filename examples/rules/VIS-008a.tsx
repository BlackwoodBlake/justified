import { CheckIcon } from "@blackwoodblake/justified-shadcn/icons";
import { useId, useRef, useState, type ReactNode } from "react";

import type { RuleExamples } from "./frame";
import { ACTIVE_SHADOW, ChoiceCards, CodeReadout, COLOUR_TRANSITION, FOCUS, MicGlyph, StarGlyph } from "./states";

/*
 * VIS-008a: when a control shows a state, the state is also set in code on
 * the control itself, and it changes whenever the look changes.
 *
 * Two scenes from the rule's own text. A video call's toolbar with Mute and
 * Favourite against a text toolbar with Bold and Italic, drawn with a class
 * only. And two delivery options as cards, built as a RadioGroup against
 * cards that are plain buttons with a border on the chosen one.
 *
 * "State in code" lists what each control carries (aria-pressed, aria-checked,
 * data-state), read from the element and kept up to date, so the difference
 * a screen reader would meet can be seen. The toolbars look the same in the Do
 * and the Don't. The delivery cards differ in the marks of a radio as well.
 */

const TOGGLE_BASE = `inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-input px-3 text-sm font-medium ${COLOUR_TRANSITION} ${FOCUS}`;

/** A toggle button that sets aria-pressed, and styles its on look from it. */
function StateToggle({ name, icon }: { name: string; icon: (on: boolean) => ReactNode }) {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setOn(!on)}
      className={`${TOGGLE_BASE} bg-background aria-pressed:bg-primary aria-pressed:text-primary-foreground not-aria-pressed:hover:bg-accent not-aria-pressed:hover:text-accent-foreground aria-pressed:hover:bg-primary/90`}
    >
      {icon(on)}
      {name}
    </button>
  );
}

/** The same look, set only by a class. The code says nothing. */
function ClassToggle({ name }: { name: string }) {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOn(!on)}
      className={`${TOGGLE_BASE} ${on ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-background hover:bg-accent hover:text-accent-foreground"}`}
    >
      {name === "Bold" ? <strong aria-hidden="true">B</strong> : <em aria-hidden="true">I</em>}
      {name}
    </button>
  );
}

/** A toolbar with its "State in code" readout. Each example passes in its own toggles. */
function ToolbarScene({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div ref={ref} role="group" aria-label={label} className="flex flex-wrap gap-2">
        {children}
      </div>
      <CodeReadout scope={ref} />
    </div>
  );
}

function CallToolbar() {
  return (
    <ToolbarScene label="Call controls">
      <StateToggle name="Mute" icon={(on) => <MicGlyph off={on} />} />
      <StateToggle name="Favourite" icon={(on) => <StarGlyph filled={on} />} />
    </ToolbarScene>
  );
}

function TextToolbar() {
  return (
    <ToolbarScene label="Text style">
      <ClassToggle name="Bold" />
      <ClassToggle name="Italic" />
    </ToolbarScene>
  );
}

const DELIVERY = [
  { id: "standard", title: "Standard", detail: "3 to 5 days", price: "£3.50" },
  { id: "next-day", title: "Next day", detail: "Order by 4 pm", price: "£7.90" },
];

function DeliveryScene() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div ref={ref}>
        <ChoiceCards legend="Delivery" items={DELIVERY} control="radio" mark="radio-and-text" defaultValue="standard" />
      </div>
      <CodeReadout scope={ref} />
    </div>
  );
}

function DeliveryButtons() {
  const ref = useRef<HTMLDivElement>(null);
  const [chosen, setChosen] = useState("standard");
  const legendId = useId();
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div ref={ref}>
        <div role="group" aria-labelledby={legendId} className="grid w-full gap-2">
          <p id={legendId} className="m-0 text-sm font-medium">
            Delivery
          </p>
          {DELIVERY.map((item) => (
            <button
              key={item.id}
              type="button"
              data-look-name={item.title}
              onClick={() => setChosen(item.id)}
              className={`relative flex w-full cursor-pointer items-start gap-3 rounded-lg border bg-card p-3 text-card-foreground ${COLOUR_TRANSITION} ${chosen === item.id ? "border-primary" : "border-border"} hover:bg-accent hover:text-accent-foreground active:bg-accent ${ACTIVE_SHADOW} ${FOCUS}`}
            >
              <span className="flex min-w-0 flex-1 flex-col text-left">
                <span className="text-sm font-medium">{item.title}</span>
                <span className="text-sm text-muted-foreground">{item.detail}</span>
              </span>
              <span className="flex flex-col items-end gap-1 text-sm font-medium">
                {item.price}
                {chosen === item.id && <CheckIcon aria-hidden="true" className="size-4 text-primary" />}
              </span>
            </button>
          ))}
        </div>
      </div>
      <CodeReadout scope={ref} />
    </div>
  );
}

export const VIS008a: RuleExamples = {
  id: "VIS-008a",
  examples: [
    {
      kind: "do",
      title: "Toggles that carry their state",
      caption: (
        <>
          <em>Mute</em> and <em>Favourite</em> keep their names and set <code>aria-pressed</code>, which flips with every
          press; the look (a fill, a slashed microphone, a filled star) is styled from it with{" "}
          <code>aria-pressed:</code>. Press them and read "State in code" change with the look.
        </>
      ),
      Demo: () => <CallToolbar />,
    },
    {
      kind: "dont",
      title: "Drawn as on, silent in code",
      caption: (
        <>
          <em>Bold</em> and <em>Italic</em> change their fill with a class and set no <code>aria-pressed</code>. Press
          one: it looks on, but a screen reader announces an ordinary button, and "State in code" stays empty.
        </>
      ),
      Demo: () => <TextToolbar />,
    },
    {
      kind: "do",
      title: "Delivery cards that are checked in code",
      caption: (
        <>
          Each card is a <code>RadioGroupItem</code> with its text as the label, so the chosen card is{" "}
          <code>aria-checked="true"</code> and the others are not. Choose with a click or the arrow keys and watch the
          code follow.
        </>
      ),
      Demo: DeliveryScene,
    },
    {
      kind: "dont",
      title: "Delivery cards that only look chosen",
      caption: (
        <>
          The cards as plain buttons, with <code>border-primary</code> and a check on the chosen one. They work
          with a click and Tab, but the code carries no checked state, so a screen reader cannot tell which delivery is
          chosen.
        </>
      ),
      Demo: DeliveryButtons,
    },
  ],
};
