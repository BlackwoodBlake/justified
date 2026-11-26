import { useState } from "react";

import { Outcome, useSay } from "./dialog";
import type { RuleExamples } from "./frame";
import { stopPlainClick } from "./links-buttons";
import { SceneButton, SceneLink, ZoomDemo } from "./zoom";

/*
 * LAY-003b: nothing is lost when people widen the text spacing.
 *
 * A drawn frame stands in for a person's own style sheet. "Apply text spacing"
 * writes line height 1.5, letter spacing 0.12 em, word spacing 0.16 em and 2 em
 * after paragraphs into a style that reaches only this frame, and nothing else
 * is changed. Everything inside is sized in em.
 */

const badge = "rounded-full border border-border bg-muted px-[0.5em] py-[0.125em] text-[0.85em]";

function useNote() {
  return useSay();
}

function ShiftCard() {
  const [said, setSaid] = useNote();
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <ZoomDemo mode="spacing">
        <div className="flex flex-col gap-[0.5em] rounded-lg border border-border bg-card p-[0.75em]">
          <h4 className="m-0 text-[1.1em] font-semibold">
            <SceneLink href="/shifts/saturday-morning" onFollow={(href) => setSaid(`Would go to ${href}`)}>
              Saturday morning, food bank
            </SceneLink>
          </h4>
          <ul className="m-0 flex list-none flex-wrap gap-[0.5em] p-0">
            <li className={badge}>Needs 2 more volunteers</li>
            <li className={badge}>Front desk</li>
            <li className={badge}>9:00 to 12:00</li>
          </ul>
          <p className="m-0 line-clamp-3 text-muted-foreground">
            Sort and pack the donated food, greet families at the door and help carry boxes to the cars. Closed-toe shoes
            are needed, and the kitchen team provides tea at ten.
          </p>
          <div>
            <SceneButton onClick={() => setSaid("Signed up for Saturday morning.")}>Sign up for shift</SceneButton>
          </div>
        </div>
      </ZoomDemo>
      <Outcome>{said}</Outcome>
    </div>
  );
}

function Clipped() {
  return (
    <ZoomDemo mode="spacing">
      <div className="flex flex-col gap-[0.5em]">
        <div>
          <span
            data-testid="chip"
            className="inline-block h-[1.75em] max-w-[15em] overflow-hidden rounded-full border border-border bg-muted px-[0.6em] text-[0.85em]"
          >
            Morning shift, front desk
          </span>
        </div>
        <div className="w-[16em] max-w-full rounded-lg border border-border bg-card p-[0.75em]">
          <h4 className="m-0 font-semibold">Sunday set-up</h4>
          <p data-testid="clamped" className="m-0 mt-[0.25em] max-h-[2.6em] overflow-hidden text-muted-foreground">
            Set out the chairs and tables. Closed-toe shoes are needed.
          </p>
        </div>
      </div>
    </ZoomDemo>
  );
}

const GROUPS = [
  { name: "Community kitchen volunteers", href: "/groups/community-kitchen" },
  { name: "Food bank rota", href: "/groups/food-bank" },
  { name: "Garden days", href: "/groups/garden-days" },
];

function Sidebar({ truncate, label }: { truncate: boolean; label: string }) {
  const [current, setCurrent] = useState(0);
  return (
    <ZoomDemo mode="spacing">
      <nav aria-label={label} className={"w-[18em]"}>
        <ul className="m-0 flex list-none flex-col gap-[0.25em] p-0">
          {GROUPS.map((g, i) => (
            <li key={g.href}>
              {/* A real address. A plain click is stopped and marks the item as the page shown, as if it had loaded. */}
              <a
                href={g.href}
                data-testid="side-item"
                aria-current={current === i ? "page" : undefined}
                onClick={(e) => {
                  if (stopPlainClick(e)) setCurrent(i);
                }}
                className={`block rounded-md px-[0.75em] outline-none hover:bg-accent focus-visible:ring-(length:--focus-ring-width) focus-visible:ring-ring aria-[current=page]:bg-accent aria-[current=page]:font-semibold ${
                  truncate ? "h-[2.5em] truncate py-[0.55em]" : "min-h-[2.5em] py-[0.55em]"
                }`}
              >
                {g.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </ZoomDemo>
  );
}

const TABS = [
  { name: "Open shifts", href: "/shifts/open" },
  { name: "My shifts", href: "/shifts/mine" },
  { name: "Swap requests", href: "/shifts/swaps" },
];

function Tabs() {
  const [current, setCurrent] = useState(0);
  return (
    <ZoomDemo mode="spacing">
      <nav aria-label="Shift views">
        <ul className="m-0 flex list-none flex-wrap gap-[0.25em] border-b border-border p-0">
          {TABS.map((t, i) => (
            <li key={t.href}>
              <a
                href={t.href}
                data-testid="tab"
                aria-current={current === i ? "page" : undefined}
                onClick={(e) => {
                  if (stopPlainClick(e)) setCurrent(i);
                }}
                className="block w-[8.5em] truncate rounded-t-md border-b-2 border-transparent px-[0.5em] py-[0.6em] text-center outline-none hover:bg-accent focus-visible:ring-(length:--focus-ring-width) focus-visible:ring-ring aria-[current=page]:border-primary aria-[current=page]:font-semibold"
              >
                {t.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </ZoomDemo>
  );
}

export const LAY003b: RuleExamples = {
  id: "LAY-003b",
  examples: [
    {
      kind: "do",
      title: "A shift card that gives way",
      caption: (
        <>
          Switch on <em>Apply text spacing</em>. The badges grow with their words, and one that no longer fits moves to
          the next line. The card gets taller and the button stays below the text. The description is clamped to three
          lines because its title is a link to the full shift.
        </>
      ),
      Demo: ShiftCard,
    },
    {
      kind: "dont",
      title: "Fixed heights that cut text off",
      caption: (
        <>
          The chip has a fixed height and <code>overflow-hidden</code>, and the description a fixed maximum height. At
          normal spacing all of it shows. Switch on <em>Apply text spacing</em> and the second line of the chip and the
          part about closed-toe shoes are hidden, with nothing to open.
        </>
      ),
      Demo: Clipped,
    },
    {
      kind: "do",
      title: "Sidebar items that wrap",
      caption: (
        <>
          Each item has a minimum height and no truncation. With <em>Apply text spacing</em> on, <em>Community kitchen
          volunteers</em> wraps onto a second line and the whole name is still there.
        </>
      ),
      Demo: () => <Sidebar truncate={false} label="Volunteer groups, wrapping" />,
    },
    {
      kind: "dont",
      title: "Sidebar items that truncate",
      caption: (
        <>
          Each item has a fixed height and truncates its label. At normal spacing the names fit. With{" "}
          <em>Apply text spacing</em> on, <em>Community kitchen volunteers</em> ends in an ellipsis and there is no
          other way to read the rest.
        </>
      ),
      Demo: () => <Sidebar truncate label="Volunteer groups, truncated" />,
    },
    {
      kind: "dont",
      title: "Tabs with a fixed width",
      caption: (
        <>
          Each tab is a fixed width and truncates its label. At normal spacing all three read in full. With{" "}
          <em>Apply text spacing</em> on, <em>Swap requests</em> is cut to part of a word.
        </>
      ),
      Demo: Tabs,
    },
  ],
};
