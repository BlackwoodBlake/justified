import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

import type { RuleExamples } from "./frame";

/*
 * KBD-002: keep the focused element at least partly in view.
 *
 * A small page in its own scroll box, with a sticky header. The header and
 * the scrolling stay inside the box, never the real page. In the Do the box
 * reserves room for the header with scroll-padding-top, read from the
 * header's real height, so the browser stops a newly focused link below it.
 * In the Don't there is no reserved room, and Shift+Tab back up puts each
 * link right under the header.
 *
 * The line under the box is for sighted readers. It measures how much of the
 * focused element the header covers, and it is hidden from assistive
 * technology.
 */

const PROJECTS = [
  "Autumn fair",
  "Harbour clean-up",
  "Library garden",
  "Night market",
  "Choir summer tour",
  "Allotment open day",
  "Bike repair cafe",
  "Riverside mural",
  "Winter coat drive",
  "School fun run",
];

const linkClass =
  "flex min-h-10 items-center rounded-sm px-2 text-sm text-primary underline underline-offset-4 hover:decoration-2 " +
  "outline-none focus-visible:outline-hidden focus-visible:ring-(length:--focus-ring-width) focus-visible:ring-ring " +
  "focus-visible:ring-offset-[length:var(--focus-ring-offset)] focus-visible:ring-offset-background";

const boxRing =
  "outline-none focus-visible:outline-hidden focus-visible:ring-(length:--focus-ring-width) focus-visible:ring-ring " +
  "focus-visible:ring-offset-[length:var(--focus-ring-offset)] focus-visible:ring-offset-background";

type Seen = { name: string; view: "whole" | "part" | "hidden"; start?: boolean } | undefined;

// The box opens at the stop its own CSS sets for this link when Shift+Tab scrolls up to it.
const START = "Choir summer tour";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

function ProjectsPage({ reserveRoom }: { reserveRoom: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [barHeight, setBarHeight] = useState(0);
  const [seen, setSeen] = useState<Seen>();
  const placed = useRef(false);
  const frame = useRef(0);

  // The reserved room follows the header's real height, so it still fits if the header grows.
  useLayoutEffect(() => {
    const el = bar.current;
    if (!el) return;
    const measure = () => setBarHeight(el.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const check = (el: Element, start = false) => {
    const header = bar.current;
    if (!header || el === box.current || header.contains(el)) {
      setSeen(undefined);
      return;
    }
    const r = el.getBoundingClientRect();
    const h = header.getBoundingClientRect();
    const covered = Math.max(0, Math.min(r.bottom, h.bottom) - Math.max(r.top, h.top));
    const view = covered <= 0 ? "whole" : covered >= r.height ? "hidden" : "part";
    setSeen({ name: el.textContent ?? "", view, start });
  };

  /*
   * Once the header is measured, scroll the box to where the browser stops when
   * Shift+Tab focuses the start link from below: the link's top at the box's own
   * scroll-padding-top. Only the box scrolls (never scrollIntoView, which would
   * move the page too), and focus is not touched. The readout says what that
   * position would mean, measured the same way.
   */
  useLayoutEffect(() => {
    const b = box.current;
    if (placed.current || !b || barHeight === 0) return;
    const link = [...b.querySelectorAll("a")].find((a) => a.textContent === START);
    if (!link) return;
    placed.current = true;
    b.scrollTop = link.offsetTop - (parseFloat(getComputedStyle(b).scrollPaddingTop) || 0);
    check(link, true);
  }, [barHeight]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const style = { "--bar-h": `${barHeight}px` } as CSSProperties;

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <div
        ref={box}
        role="region"
        aria-label={reserveRoom ? "Projects, with room kept for the header" : "Projects, no room kept for the header"}
        tabIndex={0}
        style={style}
        className={`relative h-64 overflow-y-auto rounded-lg border border-border bg-background ${boxRing} ${
          reserveRoom ? "scroll-pt-[calc(var(--bar-h)+0.5rem)]" : ""
        }`}
        onFocus={(e) => {
          const el = e.target;
          // Wait one frame, so the browser has finished scrolling the element into view.
          cancelAnimationFrame(frame.current);
          frame.current = requestAnimationFrame(() => check(el));
        }}
        onBlur={(e) => {
          // Focus has left the box, so the readout no longer describes anything.
          if (!box.current?.contains(e.relatedTarget as Node)) {
            cancelAnimationFrame(frame.current);
            setSeen(undefined);
          }
        }}
      >
        <div
          ref={bar}
          className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background px-3 py-4"
        >
          <h4 className="m-0 text-base font-semibold">Projects</h4>
          <p className="m-0 text-sm text-muted-foreground">{PROJECTS.length} projects</p>
        </div>
        <ul className="m-0 grid list-none gap-1 p-2">
          {PROJECTS.map((p) => (
            <li key={p}>
              <a href={`#project-${slug(p)}`} onClick={(e) => e.preventDefault()} className={linkClass}>
                {p}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p
        aria-hidden="true"
        data-testid="focus-seen"
        className="m-0 min-h-10 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground"
      >
        {seen?.start ? (
          <>
            If Shift+Tab stopped here: <span className="font-medium text-foreground">“{seen.name}”</span> would be{" "}
            {seen.view === "whole"
              ? "fully in view"
              : seen.view === "part"
                ? "partly under the header"
                : "completely hidden under the header"}
          </>
        ) : seen ? (
          <>
            Focus: <span className="font-medium text-foreground">“{seen.name}”</span>,{" "}
            {seen.view === "whole"
              ? "fully in view"
              : seen.view === "part"
                ? "partly under the header"
                : "completely hidden under the header"}
          </>
        ) : (
          "Focus: not on a project link"
        )}
      </p>
    </div>
  );
}

export const KBD002: RuleExamples = {
  id: "KBD-002",
  examples: [
    {
      kind: "do",
      title: "Scroll room reserved for the sticky header",
      caption: (
        <>
          The box is a small page with a header that stays at the top. It starts at the highest point Shift+Tab can
          leave <em>Choir summer tour</em>: just below the header, because the box keeps that room free. Tab into it and
          on through the projects to <em>School fun run</em>, then press Shift+Tab to go back up. Whenever the box
          scrolls, it stops the link clear of the header, and the line under the box says it is fully in view. The room
          the box keeps free follows the header's real height.
        </>
      ),
      Demo: () => <ProjectsPage reserveRoom />,
    },
    {
      kind: "dont",
      title: "Sticky header with no reserved room",
      caption: (
        <>
          The same page without the reserved room. It starts where Shift+Tab leaves it when focus comes back up to{" "}
          <em>Choir summer tour</em>: behind the header. Tab down to <em>School fun run</em>, then press Shift+Tab to go
          back up. On the way, links such as <em>Choir summer tour</em> stop at the very top of the box, behind the
          header, and the line under the box says they are partly or completely hidden. You cannot see which link Enter
          would open.
        </>
      ),
      Demo: () => <ProjectsPage reserveRoom={false} />,
    },
  ],
};
