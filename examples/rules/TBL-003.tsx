import { Button } from "@blackwoodblake/justified-shadcn/button";
import { cn } from "@blackwoodblake/justified-shadcn/utils";
import { useEffect, useId, useRef, useState, type MouseEvent } from "react";

import { Outcome, useSay } from "./dialog";
import type { RuleExamples } from "./frame";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  titleCaption,
} from "./table-demo";
import { Toast, ToastRegion } from "./toast";

/*
 * TBL-003: every row action has its own control the keyboard reaches, and
 * hidden actions show on focus.
 *
 * A helpdesk's table "Open tickets". The title in the first cell opens the
 * ticket; Assign and Close ticket are buttons in the last cell, which comes
 * last in the code (LAY-002). Close ticket removes the row at once and offers
 * Undo in a polite region under the table (DST-001a, FBK-004). Focus goes to
 * the next row's first control after a close (the table's scroll area when none is left) and to the restored row after
 * Undo.
 *
 *   Do (always shown): link plus buttons. A click on the row is a shortcut
 *     that ignores clicks on controls and text selections.
 *   Do (hover-reveal): the actions show on hover, on focus anywhere in the
 *     row, and always where there is no hover.
 *   Don't (row click only): no link; only a pointer opens a ticket.
 *   Don't (hidden on hover only): the buttons are in the page but stay
 *     invisible until the pointer is over the row, also while focused.
 */

type Ticket = { id: string; title: string; by: string; priority: string };

const TICKETS: Ticket[] = [
  { id: "t1", title: "Printer on floor 3 jams", by: "Dana Ruiz", priority: "High" },
  { id: "t2", title: "Badge reader at the loading dock", by: "Kofi Mensah", priority: "Medium" },
  { id: "t3", title: "Cannot join the weekly video call", by: "Ines Arvidsson", priority: "Low" },
  { id: "t4", title: "Monitor flickers at desk 14", by: "Ravi Patel", priority: "Medium" },
];

type Reveal = "always" | "focus" | "hover";

function Tickets({ link, rowClick, reveal }: { link: boolean; rowClick: boolean; reveal: Reveal }) {
  const id = useId();
  const [closed, setClosed] = useState<string[]>([]);
  const [messages, setMessages] = useState<Ticket[]>([]);
  const [said, say] = useSay();
  const root = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const [focusOn, setFocusOn] = useState<{ id: string | null } | null>(null);

  const open = TICKETS.filter((t) => !closed.includes(t.id));

  useEffect(() => {
    if (!focusOn) return;
    const row = focusOn.id ? rowRefs.current[focusOn.id] : null;
    // With no row left, focus goes to the table's scroll area, where "No open tickets." is read next.
    const target = row
      ? row.querySelector<HTMLElement>("a, button")
      : root.current?.querySelector<HTMLElement>("[role='region'][tabindex='0']");
    target?.focus();
    setFocusOn(null);
  }, [focusOn]);

  const openTicket = (t: Ticket) => say(`Opened ticket “${t.title}”.`);

  const close = (t: Ticket) => {
    const i = open.indexOf(t);
    const next = open[i + 1] ?? open[i - 1];
    setClosed((c) => [...c, t.id]);
    setMessages((m) => [...m.filter((x) => x.id !== t.id), t]);
    say("");
    setFocusOn({ id: next?.id ?? null });
  };

  const undo = (t: Ticket) => {
    setClosed((c) => c.filter((x) => x !== t.id));
    setMessages((m) => m.filter((x) => x.id !== t.id));
    setFocusOn({ id: t.id });
  };

  const onRow = (e: MouseEvent, t: Ticket) => {
    // A shortcut only: a click that starts on a control, or ends a text selection, does nothing here.
    if ((e.target as Element).closest("a, button, input, label")) return;
    if (window.getSelection()?.toString()) return;
    openTicket(t);
  };

  // The hiding classes sit on each button, not on the cell: a button inside a cell at opacity 0 stays invisible.
  const shown =
    reveal === "always"
      ? ""
      : reveal === "focus"
        ? "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100"
        : "opacity-0 group-hover:opacity-100";

  return (
    <div ref={root} className="flex w-full min-w-0 flex-col gap-3">
      <Table scrollLabelledBy={id} className="min-w-[30rem]">
        <TableCaption id={id} className={titleCaption}>
          Open tickets
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Ticket</TableHead>
            <TableHead scope="col">Requested by</TableHead>
            <TableHead scope="col">Priority</TableHead>
            <TableHead scope="col">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {open.map((t) => (
            <TableRow
              key={t.id}
              ref={(el) => {
                rowRefs.current[t.id] = el;
              }}
              onClick={rowClick ? (e) => onRow(e, t) : undefined}
              className={cn("group", rowClick && "cursor-pointer hover:bg-accent/50")}
            >
              <TableHead scope="row" className="h-auto py-2 font-normal whitespace-normal text-foreground">
                {link ? (
                  <a
                    href={`#${t.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      openTicket(t);
                    }}
                    className="inline-flex min-h-6 items-center rounded-sm text-primary underline underline-offset-4 outline-none hover:decoration-2 focus-visible:ring-(length:--focus-ring-width) focus-visible:ring-ring focus-visible:ring-offset-[length:var(--focus-ring-offset)] focus-visible:ring-offset-background"
                  >
                    {t.title}
                  </a>
                ) : (
                  t.title
                )}
              </TableHead>
              <TableCell>{t.by}</TableCell>
              <TableCell>{t.priority}</TableCell>
              <TableCell className="whitespace-nowrap">
                <span className="inline-flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className={shown}
                    onClick={() => say(`Assigned “${t.title}” to you.`)}
                  >
                    Assign<span className="sr-only"> {t.title}</span>
                  </Button>
                  <Button variant="outline" size="sm" className={shown} onClick={() => close(t)}>
                    Close ticket<span className="sr-only"> {t.title}</span>
                  </Button>
                </span>
              </TableCell>
            </TableRow>
          ))}
          {open.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                No open tickets.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <ToastRegion>
        {messages.map((t) => (
          <Toast
            key={t.id}
            closeLabel={`Close message about ${t.title}`}
            action={
              <Button data-undo variant="outline" size="sm" aria-label={`Undo closing ${t.title}`} onClick={() => undo(t)}>
                Undo
              </Button>
            }
            onClose={() => {
              setMessages((m) => m.filter((x) => x.id !== t.id));
              setFocusOn({ id: open[0]?.id ?? null });
            }}
          >
            Ticket &ldquo;{t.title}&rdquo; closed
          </Toast>
        ))}
      </ToastRegion>
      <Outcome>{said}</Outcome>
    </div>
  );
}

export const TBL003: RuleExamples = {
  id: "TBL-003",
  examples: [
    {
      kind: "do",
      title: "A link and buttons, with the row click as a shortcut",
      caption: (
        <>
          Each ticket&apos;s title is a link, and <em>Assign</em> and <em>Close ticket</em> are buttons. Tab through
          one row and press Enter. Clicking elsewhere in the row opens the ticket too, as a shortcut, but never the only
          way. <em>Close ticket</em> removes the row and offers <em>Undo</em>.
        </>
      ),
      Demo: () => <Tickets link rowClick reveal="always" />,
    },
    {
      kind: "do",
      title: "Hidden actions show on focus",
      caption: (
        <>
          The buttons stay out of sight until the pointer is over a row. Press Tab to the first ticket link: the whole
          row&apos;s actions appear, and the next Tab lands on one you can see. They are always shown where there is no
          hover, as on a phone.
        </>
      ),
      Demo: () => <Tickets link rowClick={false} reveal="focus" />,
    },
    {
      kind: "dont",
      title: "Only a click on the row opens the ticket",
      caption: (
        <>
          Click a row and its ticket opens. Press Tab: focus reaches the buttons but no ticket, and no key opens one. The row acts as a link but has no link in it.
        </>
      ),
      Demo: () => <Tickets link={false} rowClick reveal="always" />,
    },
    {
      kind: "dont",
      title: "Actions that show only on hover",
      caption: (
        <>
          Move the pointer over a row: <em>Assign</em> and <em>Close ticket</em> appear. Press Tab from the link
          instead: focus moves onto buttons that cannot be seen, and Enter on one closes a ticket the person never saw
          a control for.
        </>
      ),
      Demo: () => <Tickets link rowClick={false} reveal="hover" />,
    },
  ],
};
