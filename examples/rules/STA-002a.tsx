import { Button } from "@blackwoodblake/justified-shadcn/button";
import { useEffect, useId, useRef, useState } from "react";

import { Announced, cell, DemoTable, EmptyState, focusRing, rowLine } from "./empty-demo";
import type { RuleExamples } from "./frame";

/*
 * STA-002a: when loading is over and a space holds nothing, say what will
 * appear there and offer the first step.
 *
 * Scenes from the rule's own text, a bike repair workshop's app. The first
 * Do is a table that really empties: marking the last job done replaces the
 * whole table, header row included, with the message, and focus moves to its
 * heading. The line "No repair jobs left" is written into a status region
 * that was in the page from the start, for the case where focus stays put
 * (Mark all done). The Don'ts break one thing each.
 */

type Job = { id: number; title: string; customer: string; due: string };

const JOBS: Omit<Job, "id">[] = [
  { title: "Brake service", customer: "Ines Moreau", due: "Tue 2 Dec" },
  { title: "Tyre change", customer: "Tomas Reiter", due: "Wed 3 Dec" },
  { title: "Gear tune", customer: "Aisha Okafor", due: "Fri 5 Dec" },
  { title: "Wheel truing", customer: "Jonas Lindqvist", due: "Mon 8 Dec" },
];

function RepairJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [made, setMade] = useState(0);
  const [said, setSaid] = useState("");
  const [moveFocus, setMoveFocus] = useState(0);
  const removedAt = useRef(0);
  // Mark all done stays while it holds focus, after it emptied the list.
  const [keepAll, setKeepAll] = useState(false);
  const titleId = useId();
  const emptyHeading = useRef<HTMLHeadingElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const status = useRef<HTMLParagraphElement>(null);

  // After a job is marked done, put focus where the person can carry on.
  useEffect(() => {
    if (!moveFocus) return;
    const buttons = root.current?.querySelectorAll<HTMLElement>("[data-mark]");
    // The button now at the removed row's place, or the one before it when the last row went.
    const next = buttons && buttons.length > 0 ? buttons[Math.min(removedAt.current, buttons.length - 1)] : null;
    (next ?? emptyHeading.current)?.focus();
  }, [moveFocus]);

  const add = (fromEmpty = false) => {
    const base = JOBS[made % JOBS.length];
    const round = Math.floor(made / JOBS.length);
    setJobs((j) => [...j, { ...base, title: round ? `${base.title} (${round + 1})` : base.title, id: made }]);
    setKeepAll(false);
    setMade(made + 1);
    setSaid("");
    // The button that was pressed is gone once the first job is there, so focus moves to that job.
    if (fromEmpty) setMoveFocus((n) => n + 1);
  };
  const markDone = (id: number) => {
    removedAt.current = jobs.findIndex((x) => x.id === id);
    setJobs((j) => j.filter((x) => x.id !== id));
    setMoveFocus((n) => n + 1);
  };
  const markAll = () => {
    if (jobs.length === 0) return;
    setJobs([]);
    setKeepAll(true);
    setSaid("No repair jobs left");
  };

  return (
    <div ref={root} className="grid w-full max-w-md gap-3 rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 id={titleId} className="m-0 text-base font-semibold">
          Repair jobs
        </h4>
        <div className="flex flex-wrap gap-2">
          {jobs.length > 0 && <Button size="sm" onClick={() => add()}>Add repair job</Button>}
          {(jobs.length > 0 || keepAll) && (
            <Button size="sm" variant="outline" aria-disabled={jobs.length === 0 || undefined} onClick={markAll}>
              Mark all done
            </Button>
          )}
        </div>
      </div>

      {/* In the page from the start, so a line written here is read while focus stays on the toolbar. */}
      <p ref={status} role="status" className="sr-only">
        {said}
      </p>

      {jobs.length === 0 ? (
        <EmptyState
          heading="No repair jobs yet"
          headingRef={emptyHeading}
          actions={<Button onClick={() => add(true)}>Add repair job</Button>}
        >
          Jobs you add will show here, with the bike, the customer and the due date.
        </EmptyState>
      ) : (
        <DemoTable labelledBy={titleId} head={["Job", "Due", { hidden: "Action" }]}>
          {jobs.map((j) => (
            <tr key={j.id} className={rowLine}>
              <td className={cell}>
                {j.title}
                <span className="block text-muted-foreground">{j.customer}</span>
              </td>
              <td className={`${cell} whitespace-nowrap`}>{j.due}</td>
              <td className={`${cell} text-right`}>
                <Button size="sm" variant="outline" data-mark onClick={() => markDone(j.id)} aria-label={`Mark done: ${j.title}`}>
                  Mark done
                </Button>
              </td>
            </tr>
          ))}
        </DemoTable>
      )}

      <Announced target={status} />
    </div>
  );
}

function StartPage() {
  const [said, setSaid] = useState("");
  const card = "grid content-start gap-2 rounded-md border border-border bg-background p-3";
  return (
    <div className="grid w-full max-w-md gap-3">
      <section className={card}>
        <h4 className="m-0 text-base font-semibold">Parts on order</h4>
        <p className="m-0 text-sm text-muted-foreground">Parts you order for a repair will show here.</p>
        <div>
          <Button size="sm" variant="outline" onClick={() => setSaid("The Order parts form would open here.")}>
            Order parts
          </Button>
        </div>
      </section>
      <section className={card}>
        <h4 className="m-0 text-base font-semibold">Open quotes</h4>
        <p className="m-0 text-sm text-muted-foreground">Quotes you write will show here, until the customer answers.</p>
        <div>
          <Button size="sm" variant="outline" onClick={() => setSaid("The Write a quote form would open here.")}>
            Write a quote
          </Button>
        </div>
      </section>
      <section className={card}>
        <h4 className="m-0 text-base font-semibold">Bikes ready for collection</h4>
        <p className="m-0 text-sm text-muted-foreground">Bikes show here when a mechanic marks the repair as done.</p>
      </section>
      <p role="status" className="m-0 min-h-5 text-sm text-muted-foreground">
        {said}
      </p>
    </div>
  );
}

function NoResultsRow() {
  const titleId = useId();
  return (
    <div className="grid w-full max-w-md gap-3 rounded-lg border border-border bg-background p-4">
      <h4 id={titleId} className="m-0 text-base font-semibold">
        Repair jobs
      </h4>
      <DemoTable labelledBy={titleId} head={["Job", "Due"]}>
        <tr>
          <td colSpan={2} className="h-24 text-center text-muted-foreground">
            No results.
          </td>
        </tr>
      </DemoTable>
    </div>
  );
}

function BlankSpace() {
  return (
    <div className="grid w-full max-w-md gap-3 rounded-lg border border-border bg-background p-4">
      <h4 className="m-0 text-base font-semibold">Repair jobs</h4>
      <div className="min-h-28" />
    </div>
  );
}

function FourButtons() {
  return (
    <div className="grid w-full max-w-md gap-3 rounded-lg border border-border bg-background p-4">
      <h4 className="m-0 text-base font-semibold">Repair jobs</h4>
      <EmptyState
        heading="No repair jobs yet"
        actions={
          <>
            <Button>Add repair job</Button>
            <Button>Import jobs</Button>
            <Button>Invite a mechanic</Button>
            <Button>Watch the tour</Button>
          </>
        }
      >
        Jobs you add will show here.
      </EmptyState>
    </div>
  );
}

export const STA002a: RuleExamples = {
  id: "STA-002a",
  examples: [
    {
      kind: "do",
      title: "The empty table says what will appear",
      caption: (
        <>
          The page has finished loading and holds no jobs. The whole table, header row included, is replaced by a
          message and one button. Press <em>Add repair job</em>, then <em>Mark done</em> on the last job: focus goes
          to the message heading. With jobs listed, <em>Mark all done</em> keeps focus on itself and writes "No repair
          jobs left" to a status region that was in the page from the start.
        </>
      ),
      Demo: RepairJobs,
    },
    {
      kind: "do",
      title: "Three empty cards, one way forward each",
      caption: (
        <>
          Two cards give one quiet button, so the page does not end up with three primary buttons. The third fills on
          its own, so it has no button and says how it fills.
        </>
      ),
      Demo: StartPage,
    },
    {
      kind: "dont",
      title: "“No results.” on a list nobody searched",
      caption: (
        <>
          Nothing has been added and nobody searched, so "No results." is the wrong answer. The header row is read
          before it, and nothing says what to do.
        </>
      ),
      Demo: NoResultsRow,
    },
    {
      kind: "dont",
      title: "A heading over white space",
      caption: (
        <>
          The list maps over an empty array and renders nothing. It looks the same as a page that is still loading or
          has broken.
        </>
      ),
      Demo: BlankSpace,
    },
    {
      kind: "dont",
      title: "Four buttons of equal weight",
      caption: (
        <>
          The message is there, but four primary buttons leave the person to guess which step comes first. Give one
          button, and a quiet link for a second route.
        </>
      ),
      Demo: FourButtons,
    },
  ],
};
