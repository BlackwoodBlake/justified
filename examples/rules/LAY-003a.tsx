import { Button } from "@blackwoodblake/justified-shadcn/button";
import { useState } from "react";

import { Outcome, useSay } from "./dialog";
import type { RuleExamples } from "./frame";
import { CodeLine, SceneButton, ZoomDemo, ZoomScene } from "./zoom";

/*
 * LAY-003a: text can grow to 200 percent without losing content or function.
 *
 * The page cannot be zoomed from inside an example, so a drawn frame stands in
 * for the browser: "Text size 200%" doubles the frame's own text size, and
 * everything in it is sized in em, as browser zoom would size it. The frame's
 * width stays the same, so bigger text wraps onto more lines.
 *
 * The viewport setting is drawn as a line of code. The page itself never sets
 * one.
 */

const DESCRIPTION = "South-facing, raised bed, water tap within ten metres. Tools are kept in the shed by the gate.";

function Plots({ fixed }: { fixed: boolean }) {
  const cards = [
    { name: "Plot 14", text: DESCRIPTION },
    { name: "Herb bed", text: "Shady corner, rich soil, close to the compost bins. Good for mint and chives." },
  ];
  return (
    <ul className="m-0 grid list-none gap-[0.75em] p-0">
      {cards.map((c) => (
        <li
          key={c.name}
          data-testid="plot-card"
          className={`flex flex-col gap-[0.25em] rounded-lg border border-border bg-card p-[0.75em] ${
            fixed ? "h-[7.5em] overflow-hidden" : "min-h-[6em]"
          }`}
        >
          <h4 className="m-0 text-[1.1em] font-semibold">{c.name}</h4>
          <p className="m-0 text-muted-foreground">{c.text}</p>
        </li>
      ))}
    </ul>
  );
}

function Hero({ fixed }: { fixed: boolean }) {
  const [said, say] = useSay();
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <ZoomDemo mode="size" narrow>
        <section
          data-testid="hero"
          className={`flex flex-col items-start gap-[0.5em] rounded-lg bg-muted p-[1em] ${fixed ? "h-[9.5em]" : "min-h-[9.5em]"}`}
        >
          <h4 className="m-0 text-[1.4em] leading-tight font-semibold">Book a plot for the spring season</h4>
          <SceneButton onClick={() => say("Booking started.")}>Book a plot</SceneButton>
        </section>
        <p className="m-0 mt-[0.75em] rounded-md border border-border p-[0.5em]" data-testid="below-hero">
          Below the banner: opening hours and the garden map.
        </p>
      </ZoomDemo>
      <Outcome>{said}</Outcome>
    </div>
  );
}

function Pinch({ blocked }: { blocked: boolean }) {
  const [out, setOut] = useState(false);
  const [said, say] = useSay();
  const pinch = () => {
    if (blocked) {
      say("Nothing happens. The page has switched zoom off.");
      return;
    }
    setOut(!out);
    say(out ? "Back to 100 percent." : "Zoomed to 200 percent.");
  };
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <CodeLine>
        {blocked
          ? 'export const viewport = { maximumScale: 1, userScalable: false };'
          : 'export const viewport = { width: "device-width", initialScale: 1 };'}
      </CodeLine>
      <Button variant="outline" onClick={pinch}>
        {out ? "Pinch in" : "Pinch out"}
      </Button>
      <ZoomScene size={out ? 2 : 1}>
        <p className="m-0">Your plot is booked for the first Saturday in April.</p>
      </ZoomScene>
      <Outcome>{said}</Outcome>
    </div>
  );
}

export const LAY003a: RuleExamples = {
  id: "LAY-003a",
  examples: [
    {
      kind: "do",
      title: "Cards that grow with their text",
      caption: (
        <>
          The frame stands in for the browser. Switch on <em>Text size 200%</em>: the text doubles and wraps onto more
          lines, and each card gets taller to hold it. Every line stays in sight. The cards use a minimum height and
          padding, never a fixed height.
        </>
      ),
      Demo: () => (
        <ZoomDemo mode="size">
          <Plots fixed={false} />
        </ZoomDemo>
      ),
    },
    {
      kind: "dont",
      title: "A fixed height that clips the text",
      caption: (
        <>
          The same cards with a fixed height and <code>overflow-hidden</code>. At 100 percent all of it fits. Switch on{" "}
          <em>Text size 200%</em> and the last lines of the description are cut off, with no way to read them.
        </>
      ),
      Demo: () => (
        <ZoomDemo mode="size">
          <Plots fixed />
        </ZoomDemo>
      ),
    },
    {
      kind: "do",
      title: "A banner that grows with its text",
      caption: (
        <>
          The banner has a minimum height. At 200 percent the heading wraps, the banner grows, and <em>Book a plot</em>{" "}
          stays inside it, above the text that follows.
        </>
      ),
      Demo: () => <Hero fixed={false} />,
    },
    {
      kind: "dont",
      title: "A banner with a fixed height",
      caption: (
        <>
          The banner has a fixed height. At 200 percent the heading takes more lines and <em>Book a plot</em> spills out
          over the text below it.
        </>
      ),
      Demo: () => <Hero fixed />,
    },
    {
      kind: "do",
      title: "The viewport setting leaves zoom alone",
      caption: (
        <>
          The line of code is drawn text, not a real setting. It sets the width and the start scale and nothing else.
          Press <em>Pinch out</em> and the text in the frame doubles, as a pinch would show it larger.
        </>
      ),
      Demo: () => <Pinch blocked={false} />,
    },
    {
      kind: "dont",
      title: "A viewport setting that blocks zoom",
      caption: (
        <>
          The drawn line caps the scale at 1 and turns user scaling off, to stop the zoom when a field gets focus. Press{" "}
          <em>Pinch out</em> and nothing happens: a person who needs larger text cannot get it. Fields with text of at
          least 16 px avoid the focus zoom without this.
        </>
      ),
      Demo: () => <Pinch blocked />,
    },
  ],
};
