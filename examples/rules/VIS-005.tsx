import { Button } from "@blackwoodblake/justified-shadcn/button";
import { useEffect, useState } from "react";

import type { RuleExamples } from "./frame";
import { MotionScene, useSystemReducedMotion } from "./motion-demo";

/*
 * VIS-005: let people pause, stop or hide content that moves or updates by itself.
 *
 * Two scenes from the rule's own text. A pricing page rotates customer
 * quotes every four seconds; a logo wall under a hero scrolls as a strip.
 * Each has a Do with a visible button that keeps its state and a Don't with
 * no control at all, so each Don't breaks only this rule.
 *
 * Nothing moves on load. Every example starts still; a press on "Start the
 * demo" runs it. A Don't runs for 14 seconds and stops by itself, with no
 * pause control while it runs, which is the fault. A Do keeps running until
 * paused, and starts paused when the browser asks for reduced motion
 * (VIS-006). Under that setting the Don'ts do not move at all. A quote
 * changes with a short fade and the strip moves slowly, so nothing flashes.
 */

const quotes = [
  { text: "We moved our whole studio to it in an afternoon.", who: "Ines, ceramics studio" },
  { text: "Support answered before I had finished my tea.", who: "Tomas, print shop" },
  { text: "The invoices finally match what we agreed.", who: "Aiko, translation agency" },
];

const EVERY = 4000;
const RUN = 14000;

/** A run the person starts and that ends by itself, so nothing here moves on load. */
function useRun(ms: number) {
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setRunning(false), ms);
    return () => clearTimeout(t);
  }, [running, ms]);
  return [running, () => setRunning(true)] as const;
}

/** Quotes that change on a timer while `running` is true. */
function Rotator({ running, label }: { running: boolean; label: string }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % quotes.length), EVERY);
    return () => clearTimeout(t);
  }, [index, running]);
  const q = quotes[index];
  return (
    // Never live: a change on a timer must not interrupt a screen reader.
    <figure aria-label={label} className="m-0 grid gap-1 rounded-lg border border-border bg-background p-4">
      <blockquote
        key={index}
        className={`m-0 text-base font-medium ${index ? "motion-safe:animate-[mdemo-fade-in-quote_400ms_ease-out]" : ""}`}
      >
        “{q.text}”
      </blockquote>
      <figcaption className="text-sm text-muted-foreground">
        {q.who} · Quote {index + 1} of {quotes.length}
      </figcaption>
    </figure>
  );
}

/** The Do's controls: it starts still; a press starts it, then the pause button is shown and works. */
function useDoctrl(system: boolean) {
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  return {
    state,
    start: () => setState(system ? "paused" : "playing"),
    toggle: () => setState((s) => (s === "playing" ? "paused" : "playing")),
  };
}

function StartButton({ running, onStart }: { running: boolean; onStart: () => void }) {
  return (
    <Button variant="outline" size="sm" aria-disabled={running || undefined} onClick={() => !running && onStart()}>
      {running ? "Demo running" : "Start the demo"}
    </Button>
  );
}

function QuotesDo() {
  const system = useSystemReducedMotion();
  const c = useDoctrl(system);
  return (
    <MotionScene reduced={system} className="grid w-full max-w-md gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="m-0 text-sm font-semibold">What customers say</h4>
        {c.state === "idle" ? (
          <Button variant="outline" size="sm" onClick={c.start}>
            Start the demo
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={c.toggle}>
            {c.state === "paused" ? "Play quotes" : "Pause quotes"}
          </Button>
        )}
      </div>
      <Rotator running={c.state === "playing"} label="Customer quotes" />
      <p className="m-0 text-sm text-muted-foreground" aria-hidden="true">
        Rotation:{" "}
        <strong>
          {c.state === "idle" ? "not started" : c.state === "paused" ? "paused" : `every ${EVERY / 1000} seconds`}
        </strong>
      </p>
    </MotionScene>
  );
}

function QuotesDont() {
  const system = useSystemReducedMotion();
  const [running, start] = useRun(RUN);
  return (
    <MotionScene reduced={system} className="grid w-full max-w-md gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="m-0 text-sm font-semibold">What customers say</h4>
        <StartButton running={running} onStart={start} />
      </div>
      <Rotator running={running && !system} label="Customer quotes" />
      <p className="m-0 text-sm text-muted-foreground" aria-hidden="true">
        Rotation:{" "}
        <strong>
          {system
            ? "held still for your browser setting"
            : running
              ? "every 4 seconds, no way to stop it"
              : "not running"}
        </strong>
      </p>
    </MotionScene>
  );
}

const logos = ["Harbour & Co", "Fennel", "Northlight", "Quillwork", "Tamarind", "Bramble Press", "Oakhurst"];

function LogoStrip({ paused }: { paused: boolean }) {
  // The list is written twice so the strip can scroll by half its width and start over without a gap.
  const row = (hidden: boolean) =>
    logos.map((l) => (
      <li
        key={`${l}${hidden}`}
        aria-hidden={hidden || undefined}
        className="shrink-0 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold"
      >
        {l}
      </li>
    ));
  return (
    <div className="w-full overflow-hidden" role="group" aria-label="Customers">
      <ul data-paused={paused} className="mdemo-marquee m-0 flex w-max list-none gap-3 p-0">
        {row(false)}
        {row(true)}
      </ul>
    </div>
  );
}

function LogosDo() {
  const system = useSystemReducedMotion();
  const c = useDoctrl(system);
  return (
    <MotionScene reduced={system} className="grid w-full max-w-lg gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="m-0 text-sm font-semibold">Trusted by small teams</h4>
        {c.state === "idle" ? (
          <Button variant="outline" size="sm" onClick={c.start}>
            Start the demo
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={c.toggle}>
            {c.state === "paused" ? "Play logos" : "Pause logos"}
          </Button>
        )}
      </div>
      <LogoStrip paused={c.state !== "playing"} />
      <p className="m-0 text-sm text-muted-foreground" aria-hidden="true">
        Strip:{" "}
        <strong>
          {c.state === "idle"
            ? "not started"
            : system
              ? "still, as your browser asks"
              : c.state === "paused"
                ? "paused where it was"
                : "scrolling"}
        </strong>
      </p>
    </MotionScene>
  );
}

function LogosDont() {
  const system = useSystemReducedMotion();
  const [running, start] = useRun(RUN);
  return (
    <MotionScene reduced={system} className="grid w-full max-w-lg gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="m-0 text-sm font-semibold">Trusted by small teams</h4>
        <StartButton running={running} onStart={start} />
      </div>
      <LogoStrip paused={!running} />
      <p className="m-0 text-sm text-muted-foreground" aria-hidden="true">
        Strip:{" "}
        <strong>
          {system ? "held still for your browser setting" : running ? "scrolling, no control" : "not running"}
        </strong>
      </p>
    </MotionScene>
  );
}

export const VIS005: RuleExamples = {
  id: "VIS-005",
  examples: [
    {
      kind: "do",
      title: "A visible button pauses the quotes",
      caption: (
        <>
          The quotes change every four seconds. Press <em>Pause quotes</em> with the pointer or Tab and Enter. The label
          becomes <em>Play quotes</em> and the quote stays until you press it again.
        </>
      ),
      Demo: QuotesDo,
    },
    {
      kind: "dont",
      title: "Quotes rotate on a timer with nothing to press",
      caption: (
        <>
          Press <em>Start the demo</em>: for 14 seconds the quotes change by themselves and nothing on screen can hold
          one, so someone reading slowly, or through a magnifier, cannot keep up. With less motion asked for in your
          browser, nothing changes.
        </>
      ),
      Demo: QuotesDont,
    },
    {
      kind: "do",
      title: "A button holds the logo strip still",
      caption: (
        <>
          Press <em>Start the demo</em>: the strip scrolls slowly. <em>Pause logos</em> stops it where it is, and{" "}
          <em>Play logos</em> starts it from the same place. If your browser asks for less motion, the strip stays
          still.
        </>
      ),
      Demo: LogosDo,
    },
    {
      kind: "dont",
      title: "A logo strip that never stops",
      caption: (
        <>
          Press <em>Start the demo</em>: for 14 seconds the strip scrolls beside the page&apos;s content and nothing on
          screen can stop it. With less motion asked for in your browser, it stays still.
        </>
      ),
      Demo: LogosDont,
    },
  ],
};
