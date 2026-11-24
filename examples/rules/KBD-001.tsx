import { Button, buttonVariants } from "@blackwoodblake/justified-shadcn/button";
import { useEffect, useId, useRef, useState } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * KBD-001: the keyboard can do everything the pointer can, and focus is always visible.
 *
 * Both examples show the same list and the same Show more trips. In the Do it
 * is a real button. In the Don't it is a div that only listens for clicks, so
 * a mouse still works but Tab passes it by. The result line is the same.
 */

const TRIPS = [
  "Leeds, 4 December",
  "York, 12 December",
  "Bath, 2 January",
  "Chester, 17 January",
  "Durham, 29 January",
  "Norwich, 8 February",
  "Exeter, 20 February",
  "Lincoln, 5 March",
  "Whitby, 18 March",
];

const STEP = 3;

// Our focus ring for a text link, the same as the adapter's focusRing (KBD-001).
const linkClass =
  "inline-flex min-h-6 items-center rounded-sm text-primary underline underline-offset-4 hover:decoration-2 " +
  "outline-none focus-visible:outline-hidden focus-visible:ring-(length:--focus-ring-width) focus-visible:ring-ring " +
  "focus-visible:ring-offset-[length:var(--focus-ring-offset)] focus-visible:ring-offset-background";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

function TripList({ realButton }: { realButton: boolean }) {
  const [count, setCount] = useState(STEP);
  const firstNew = useRef<HTMLAnchorElement>(null);
  const firstTrip = useRef<HTMLAnchorElement>(null);
  const moveFocus = useRef(false);
  const returnFocus = useRef(false);
  const moreRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  const all = count >= TRIPS.length;

  useEffect(() => {
    // The button is gone, so focus goes to the first trip it brought in.
    if (moveFocus.current) {
      moveFocus.current = false;
      firstNew.current?.focus();
    }
    // Show fewer trips is gone, so focus goes back to Show more trips (or the list in the Don't).
    if (returnFocus.current) {
      returnFocus.current = false;
      (moreRef.current ?? firstTrip.current)?.focus();
    }
  }, [count]);

  const more = () => {
    const next = Math.min(count + STEP, TRIPS.length);
    if (next >= TRIPS.length) moveFocus.current = true;
    setCount(next);
  };

  const fewer = () => {
    moveFocus.current = false;
    returnFocus.current = true;
    setCount(STEP);
  };

  const said = all ? `All ${TRIPS.length} trips shown.` : `Showing ${count} of ${TRIPS.length} trips.`;

  return (
    <div className="flex w-full max-w-sm flex-col gap-3 rounded-lg border border-border bg-background p-4">
      <h4 id={headingId} className="m-0 text-base font-semibold">
        Your trips
      </h4>
      <ul aria-labelledby={headingId} className="m-0 grid list-none gap-1 p-0 text-sm">
        {TRIPS.slice(0, count).map((t, i) => (
          <li key={t}>
            <a
              ref={i === count - STEP && all ? firstNew : i === 0 ? firstTrip : undefined}
              href={`#trip-${slug(t)}`}
              onClick={(e) => e.preventDefault()}
              className={linkClass}
            >
              {t}
            </a>
          </li>
        ))}
      </ul>
      {!all &&
        (realButton ? (
          <Button ref={moreRef} variant="outline" className="self-start" onClick={more}>
            Show more trips
          </Button>
        ) : (
          // The fault: a div with a click handler only. No role, no tabIndex, no keys.
          <div className={`${buttonVariants({ variant: "outline" })} select-none self-start`} onClick={more}>
            Show more trips
          </div>
        ))}
      {all && (
        // Lets the example be tried again without reloading the page.
        <Button variant="link" size="sm" className="self-start px-0" onClick={fewer}>
          Show fewer trips
        </Button>
      )}
      <Outcome>{said}</Outcome>
    </div>
  );
}

export const KBD001: RuleExamples = {
  id: "KBD-001",
  examples: [
    {
      kind: "do",
      title: "Show more trips is a real button",
      caption: (
        <>
          Tab past the three trips to <em>Show more trips</em>: a ring shows where focus is. Press Enter or Space. Three
          more trips appear at the end of the list, focus stays on the button and the line below says how many are
          shown. Press it once more: the button goes, the line says all 9 are shown, and focus moves to the first new
          trip. <em>Show fewer trips</em> starts again.
        </>
      ),
      Demo: () => <TripList realButton />,
    },
    {
      kind: "dont",
      title: "Show more trips is a div that only takes clicks",
      caption: (
        <>
          It looks the same and a click works the same. But Tab from <em>Bath, 2 January</em> goes straight past it, so
          no key can press it. Someone using only the keyboard cannot see more than three trips.
        </>
      ),
      Demo: () => <TripList realButton={false} />,
    },
  ],
};
