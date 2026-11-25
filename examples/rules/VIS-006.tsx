import { Button } from "@blackwoodblake/justified-shadcn/button";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import type { RuleExamples } from "./frame";
import { MotionScene, ReducedSwitch, useExampleMotion } from "./motion-demo";

/*
 * VIS-006: swap movement for a fade or no motion when the person asks for
 * reduced motion.
 *
 * Every example has its own "Reduced motion" switch that simulates the
 * setting inside the example, and every example also follows the browser's
 * real prefers-reduced-motion (the switch is then on and locked). Two scenes
 * from the rule's text: a filter panel that slides in, and a total that
 * rolls up to its number. Each Don't breaks only this rule: the panel
 * ignores the setting, and the card waits at zero opacity for an animation
 * that the setting turned off, so it never appears.
 *
 * All motion is one short move on a press, never a loop, and nothing flashes.
 * The Don'ts show the broken result on purpose; a line under the scene says
 * what the scene is doing, as text.
 */

function Page({ children }: { children?: ReactNode }) {
  return (
    <div className="relative h-44 w-full overflow-hidden rounded-lg border border-border bg-background">
      <div className="grid gap-2 p-4 text-sm">
        <p className="m-0 font-semibold">Orders</p>
        <p className="m-0 text-muted-foreground">48 orders, last 30 days.</p>
      </div>
      {children}
    </div>
  );
}

function Panel({ id, motion }: { id: string; motion: string }) {
  return (
    <div
      id={id}
      role="group"
      aria-label="Filters"
      className={`${motion} absolute inset-y-0 right-0 grid w-48 content-start gap-1 border-l border-border bg-card p-4 text-sm shadow-md`}
    >
      <h4 className="m-0 font-semibold">Filters</h4>
      <p className="m-0 text-muted-foreground">Status: shipped</p>
      <p className="m-0 text-muted-foreground">Region: north</p>
    </div>
  );
}

function PanelScene({ honours }: { honours: boolean }) {
  const { system, simulated, setSimulated, reduced } = useExampleMotion();
  const [open, setOpen] = useState(true);
  // Nothing moves on load: the panel carries its motion class only after a press.
  const [pressed, setPressed] = useState(false);
  const panelId = useId();
  // The Don't never looks at the setting, so only the Do carries the reduced class.
  const held = honours && reduced;
  return (
    <MotionScene reduced={honours && reduced} className="grid w-full max-w-md gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ReducedSwitch system={system} simulated={simulated} onChange={setSimulated} />
        <Button
          variant="outline"
          size="sm"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => {
            setPressed(true);
            setOpen((o) => !o);
          }}
        >
          Filters
        </Button>
      </div>
      <Page>
        {open && <Panel id={panelId} motion={!pressed ? "" : honours ? "mdemo-slide" : "mdemo-slide-zoom"} />}
      </Page>
      <p className="m-0 text-sm text-muted-foreground" aria-hidden="true">
        The panel comes in with:{" "}
        <strong>
          {honours ? (held ? "a fade in place" : "a slide from the edge") : "a slide and a zoom, whatever the setting"}
        </strong>
      </p>
    </MotionScene>
  );
}

const TOTAL = 1248;
const STEPS = 10;

function CountScene() {
  const { system, simulated, setSimulated, reduced } = useExampleMotion();
  const [shown, setShown] = useState(TOTAL);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  useEffect(() => () => clearInterval(timer.current), []);

  const roll = () => {
    clearInterval(timer.current);
    // Reduced: the end state at once, with nothing rolling.
    if (reduced) {
      setShown(TOTAL);
      return;
    }
    let step = 0;
    setShown(0);
    timer.current = setInterval(() => {
      step += 1;
      setShown(Math.round((TOTAL * step) / STEPS));
      if (step >= STEPS) clearInterval(timer.current);
    }, 100);
  };

  return (
    <MotionScene reduced={reduced} className="grid w-full max-w-md gap-3">
      <ReducedSwitch system={system} simulated={simulated} onChange={setSimulated} />
      <div className="grid gap-1 rounded-lg border border-border bg-background p-4">
        <h4 className="m-0 text-sm font-semibold">Raised this month</h4>
        <p className="m-0 text-3xl font-semibold tabular-nums">
          <span aria-hidden="true">£{shown.toLocaleString("en-GB")}</span>
          <span className="sr-only">£{TOTAL.toLocaleString("en-GB")}</span>
        </p>
      </div>
      <div>
        <Button variant="outline" size="sm" onClick={roll}>
          Show total again
        </Button>
      </div>
      <p className="m-0 text-sm text-muted-foreground" aria-hidden="true">
        The total appears as: <strong>{reduced ? "the final number at once" : "a number that rolls up"}</strong>
      </p>
    </MotionScene>
  );
}

function HiddenScene() {
  const { system, simulated, setSimulated, reduced } = useExampleMotion();
  const [open, setOpen] = useState(true);
  const [pressed, setPressed] = useState(false);
  const cardId = useId();
  return (
    <MotionScene reduced={reduced} className="grid w-full max-w-md gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ReducedSwitch system={system} simulated={simulated} onChange={setSimulated} />
        <Button
          variant="outline"
          size="sm"
          aria-expanded={open}
          aria-controls={cardId}
          onClick={() => {
            setPressed(true);
            setOpen((o) => !o);
          }}
        >
          Summary
        </Button>
      </div>
      <div className="grid h-28 content-start gap-2 rounded-lg border border-dashed border-border bg-background p-3">
        {open && (
          <div
            id={cardId}
            className={`${pressed ? "mdemo-late" : ""} grid gap-1 rounded-md border border-border bg-card p-3 text-sm`}
          >
            <h4 className="m-0 font-semibold">Order summary</h4>
            <p className="m-0">3 items, delivery on 14 March.</p>
          </div>
        )}
      </div>
      <p className="m-0 text-sm text-muted-foreground" aria-hidden="true">
        The summary is:{" "}
        <strong>
          {!pressed
            ? "shown, nothing has been pressed yet"
            : reduced
              ? "on the page but never shown, its fade-in is off"
              : "fading in, then shown"}
        </strong>
      </p>
    </MotionScene>
  );
}

export const VIS006: RuleExamples = {
  id: "VIS-006",
  examples: [
    {
      kind: "do",
      title: "The panel fades in place when motion is reduced",
      caption: (
        <>
          Press <em>Filters</em> twice to close and open the panel: it slides in from the edge. Turn on{" "}
          <em>Reduced motion</em> and it fades where it stands. If your browser already asks for less motion, the switch
          is on.
        </>
      ),
      Demo: () => <PanelScene honours />,
    },
    {
      kind: "dont",
      title: "A panel that slides and zooms whatever the setting",
      caption: (
        <>
          The panel slides and zooms on each press, and turning on <em>Reduced motion</em> changes nothing. It moves
          once per press and never loops.
        </>
      ),
      Demo: () => <PanelScene honours={false} />,
    },
    {
      kind: "do",
      title: "A rolling number shows its end state at once",
      caption: (
        <>
          Press <em>Show total again</em>: the number rolls up for a second. With <em>Reduced motion</em> on, the final
          number is there at once.
        </>
      ),
      Demo: CountScene,
    },
    {
      kind: "dont",
      title: "A card that waits for an animation that is off",
      caption: (
        <>
          Press <em>Summary</em> twice: the card starts invisible and a fade reveals it. Turn on <em>Reduced motion</em>
          and press twice again: the fade is off, so the card never appears. If your browser already asks for less
          motion, it never appears after a press.
        </>
      ),
      Demo: HiddenScene,
    },
  ],
};
