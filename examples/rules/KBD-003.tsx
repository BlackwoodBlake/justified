import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { CheckIcon } from "@blackwoodblake/justified-shadcn/icons";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { Switch } from "@blackwoodblake/justified-shadcn/switch";
import { useRef, useState } from "react";

import { Outcome, useSay } from "./dialog";
import type { RuleExamples } from "./frame";
import { hasModifier, isTyping, Kbd, KeyRow, PageFrame } from "./shortcuts";

/*
 * KBD-003: let people turn off or change a shortcut made only of character keys.
 *
 * Each example is a small page drawn inside its frame. Its handler hears keys
 * only while focus is inside the frame, so nothing listens on the real document
 * or window. Inside the frame the handler stands for a page-wide listener.
 *
 *   Do 1: a switch turns the single-key shortcuts off (the first way out).
 *   Do 2: j and k act only while the list has focus (the third way out).
 *   Don't 1: page-wide e with only a text-field guard, and no setting.
 *   Don't 2: Shift+D page-wide with no way out, as if Shift made it safe.
 */

type Ticket = { id: string; title: string };

function Desk({ withSwitch }: { withSwitch: boolean }) {
  const [on, setOn] = useState(false);
  const [closed, setClosed] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [said, say] = useSay();
  const search = useRef<HTMLInputElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const heard = !withSwitch || on;

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (hasModifier(e) || isTyping(e.target)) return;
    if (!["/", "e", "?"].includes(e.key)) return;
    if (!heard) {
      say(`"${e.key}" ignored: single-key shortcuts are off.`);
      return;
    }
    e.preventDefault();
    if (e.key === "/") {
      search.current?.focus();
      say("/ moved focus to Search tickets.");
    } else if (e.key === "e") {
      setClosed(true);
      say("e closed ticket #482.");
    } else {
      setListOpen((v) => !v);
      say("? toggled the list of shortcuts.");
    }
  };

  // Stands in for a speech program: it turns a spoken word into key presses on the page.
  const speak = (word: string) => {
    for (const key of word) frame.current?.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
      <PageFrame label="Ticket desk, example page" frameRef={frame} onKeyDown={onKeyDown}>
        <Field label="Search tickets">
          <Input ref={search} placeholder="Customer or subject" />
        </Field>
        <div className="grid gap-2 rounded-md border border-border p-3">
          <p className="m-0">
            <span className="font-medium">#482 Printer offline</span> <span className="text-muted-foreground">({closed ? "Closed" : "Open"})</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setClosed((v) => !v);
                say(closed ? "Ticket #482 reopened." : "Ticket #482 closed.");
              }}
            >
              {closed ? "Reopen ticket" : "Close ticket"}
            </Button>
            <Button variant="outline" onClick={() => setListOpen((v) => !v)} aria-expanded={listOpen}>
              Shortcuts
            </Button>
          </div>
        </div>
        {listOpen && (
          <ul className="m-0 grid list-none gap-1 p-0 text-sm">
            <li><Kbd>/</Kbd> Search tickets</li>
            <li><Kbd>e</Kbd> Close ticket</li>
            <li><Kbd>?</Kbd> This list</li>
          </ul>
        )}
        {withSwitch ? (
          <Field label="Single-key shortcuts" layout="inline">
            <Switch checked={on} onCheckedChange={(v) => { setOn(v); say(v ? "Single-key shortcuts are on." : "Single-key shortcuts are off."); }} />
          </Field>
        ) : (
          <KeyRow>
            <span><Kbd>/</Kbd> search</span>
            <span><Kbd>e</Kbd> close</span>
            <span><Kbd>?</Kbd> list</span>
          </KeyRow>
        )}
      </PageFrame>
      {!withSwitch && (
        <Button variant="outline" onClick={() => speak("edit")}>
          Simulate speaking “edit”
        </Button>
      )}
      <Outcome>{said}</Outcome>
    </div>
  );
}

const TICKETS: Ticket[] = [
  { id: "482", title: "Printer offline" },
  { id: "483", title: "Invoice question" },
  { id: "484", title: "Password reset" },
  { id: "485", title: "Slow dashboard" },
];

function FocusBoundList() {
  const [cur, setCur] = useState(0);
  const [said, say] = useSay();
  const rows = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (to: number) => {
    setCur(to);
    rows.current[to]?.focus();
    say(`Moved to ticket #${TICKETS[to].id}.`);
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
      <PageFrame
        label="Ticket desk, example page"
        onKeyDown={(e) => {
          // Reached only by keys from the page itself: keys from the list stop at its own handler.
          if (e.target === e.currentTarget && (e.key === "j" || e.key === "k")) {
            say(`"${e.key}" does nothing here: focus is on the page, not in the list.`);
          }
        }}
      >
        <Field label="Search tickets">
          <Input placeholder="Customer or subject" />
        </Field>
        <ul
          aria-label="Tickets"
          className="m-0 grid list-none gap-1 p-0"
          onKeyDown={(e) => {
            if (hasModifier(e) || (e.key !== "j" && e.key !== "k")) return;
            e.preventDefault();
            e.stopPropagation();
            move(e.key === "j" ? Math.min(cur + 1, TICKETS.length - 1) : Math.max(cur - 1, 0));
          }}
        >
          {TICKETS.map((t, i) => (
            <li key={t.id}>
              <Button
                ref={(el) => {
                  rows.current[i] = el;
                }}
                variant={i === cur ? "secondary" : "ghost"}
                tabIndex={i === cur ? 0 : -1}
                aria-current={i === cur ? "true" : undefined}
                className="w-full justify-start"
                onClick={() => {
                  setCur(i);
                  say(`Selected ticket #${t.id}.`);
                }}
              >
                #{t.id} {t.title}
                {i === cur && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                    <CheckIcon aria-hidden="true" />
                    Selected
                  </span>
                )}
              </Button>
            </li>
          ))}
        </ul>
        <KeyRow>
          <span><Kbd>j</Kbd> next ticket</span>
          <span><Kbd>k</Kbd> previous ticket</span>
          <span>only in the list</span>
        </KeyRow>
      </PageFrame>
      <Outcome>{said}</Outcome>
    </div>
  );
}

function Drafts() {
  const [gone, setGone] = useState(false);
  const [said, say] = useSay();

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
      <PageFrame
        label="Drafts, example page"
        onKeyDown={(e) => {
          if (hasModifier(e) || isTyping(e.target) || e.key !== "D") return;
          e.preventDefault();
          setGone(true);
          say("Shift+D deleted the draft.");
        }}
      >
        <Field label="Search drafts">
          <Input placeholder="Title" />
        </Field>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3">
          {gone ? <p className="m-0 text-muted-foreground">No drafts left.</p> : <p className="m-0 font-medium">Quarterly update (draft)</p>}
          {gone ? (
            <Button variant="outline" onClick={() => { setGone(false); say("Draft restored."); }}>
              Restore draft
            </Button>
          ) : (
            <Button variant="outline" onClick={() => { setGone(true); say("Draft deleted."); }}>
              Delete draft
            </Button>
          )}
        </div>
        <KeyRow>
          <span><Kbd>Shift</Kbd>+<Kbd>D</Kbd> delete draft</span>
        </KeyRow>
      </PageFrame>
      <Outcome>{said}</Outcome>
    </div>
  );
}

export const KBD003: RuleExamples = {
  id: "KBD-003",
  examples: [
    {
      kind: "do",
      title: "A switch turns single-key shortcuts off",
      caption: (
        <>
          The frame is a small ticket desk. It listens only while focus is inside it, so click inside the frame, then
          press <Kbd>e</Kbd>. The switch <em>Single-key shortcuts</em> is off, so the page ignores <Kbd>/</Kbd>,{" "}
          <Kbd>e</Kbd> and <Kbd>?</Kbd> and says so. Turn the switch on and press them again: they work. Turn it off and
          they stop. Typing in <em>Search tickets</em> never fires anything, and <em>Close ticket</em> stays a button.
        </>
      ),
      Demo: () => <Desk withSwitch />,
    },
    {
      kind: "do",
      title: "j and k act only inside the list",
      caption: (
        <>
          Tab into the list, then press <Kbd>j</Kbd> and <Kbd>k</Kbd>: the selection moves. The keys are handled on the
          list itself, so they work only while focus is in it. Click the empty part of the frame and press <Kbd>j</Kbd>:
          nothing moves, and the line under the frame says why. In the search field, <Kbd>j</Kbd> is just typed. No setting is needed, because
          no listener is page-wide.
        </>
      ),
      Demo: FocusBoundList,
    },
    {
      kind: "dont",
      title: "Page-wide e, and the text-field guard is the only protection",
      caption: (
        <>
          The frame stands in for a whole page: its listener hears every key. Click inside the frame, then press{" "}
          <Kbd>e</Kbd>: the ticket closes. Typing <Kbd>e</Kbd> in the search field is safe, but that guard is not a way
          out. The button below stands in for speech input that turns the word “edit” into key presses: the first press
          closes the ticket, and nothing in the page lets anyone turn that off.
        </>
      ),
      Demo: () => <Desk withSwitch={false} />,
    },
    {
      kind: "dont",
      title: "Shift+D with no way out",
      caption: (
        <>
          Click inside the frame, then press <Kbd>Shift</Kbd>+<Kbd>D</Kbd>: the draft is deleted. Shift still types a
          capital D, so this is a character-key shortcut, and the page offers no switch and no remap. Shift alone meets
          KBD-003b&apos;s default, but this rule still asks for a way out. Typing a capital D in the search field is
          ignored, as it should be, but that is not a way out.
        </>
      ),
      Demo: Drafts,
    },
  ],
};
