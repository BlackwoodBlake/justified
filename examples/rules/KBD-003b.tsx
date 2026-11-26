import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { Switch } from "@blackwoodblake/justified-shadcn/switch";
import { useRef, useState } from "react";

import { Outcome, useSay } from "./dialog";
import type { RuleExamples } from "./frame";
import { hasModifier, isTyping, Kbd, KeyRow, PageFrame } from "./shortcuts";

/*
 * KBD-003b: shortcuts include a modifier key by default.
 *
 * Each example is a small invoicing page drawn inside its frame. Its handler
 * hears keys only while focus is inside the frame, so nothing listens on the
 * real document or window. Inside the frame it stands for a page-wide listener.
 * Every shortcut is also a visible button (KBD-001).
 *
 *   Invoices (Dos):
 *     modifier: Ctrl or Cmd+K and Alt+Shift+N work from the start; plain n does not.
 *     optin:    single keys work only after a switch, which starts off.
 *     shift:    Shift+N page-wide, with a switch that turns it off (KBD-003's way out).
 *   Don'ts, each written out in full:
 *     SingleKeysOn: a switch exists, but single keys are on from the start.
 *     CmdOnly:      only Cmd+K is bound, so Ctrl+K does nothing.
 *     TakesFind:    the page takes Ctrl or Cmd+F, which belongs to the browser.
 */

type Mode = "modifier" | "optin" | "shift";

function Invoices({ mode }: { mode: Mode }) {
  const [on, setOn] = useState(mode === "shift");
  const [count, setCount] = useState(0);
  const [said, say] = useSay();
  const search = useRef<HTMLInputElement>(null);
  const hasSwitch = mode === "optin";

  const openSearch = (how: string) => {
    search.current?.focus();
    say(`${how} opened search.`);
  };
  const newInvoice = (how: string) => {
    setCount((n) => n + 1);
    say(`${how} started a new invoice.`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const mod = e.ctrlKey || e.metaKey;
    const plain = !hasModifier(e) && !isTyping(e.target);

    if (mode === "modifier") {
      if (mod && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch(e.metaKey ? "Cmd+K" : "Ctrl+K");
      } else if (e.altKey && !mod && e.shiftKey && e.code === "KeyN") {
        e.preventDefault();
        newInvoice("Alt+Shift+N");
      } else if (plain && e.key === "n") {
        say("n ignored: a single key does nothing until the person turns it on.");
      }
    } else if (mode === "optin") {
      if (plain && (e.key === "n" || e.key === "/")) {
        if (!on) {
          say(`"${e.key}" ignored: single-key shortcuts are off.`);
          return;
        }
        e.preventDefault();
        if (e.key === "n") newInvoice("n");
        else openSearch("/");
      }
    } else if (mode === "shift") {
      if (plain && e.key === "N") {
        if (!on) {
          say("Shift+N ignored: Shift shortcuts are off.");
          return;
        }
        e.preventDefault();
        newInvoice("Shift+N");
      }
    }
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
      <PageFrame label="Invoicing, example page" onKeyDown={onKeyDown}>
        <Field label="Search invoices">
          <Input ref={search} placeholder="Client or number" />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => openSearch("The button")}>
            Search
          </Button>
          <Button variant="outline" onClick={() => newInvoice("The button")}>
            New invoice
          </Button>
        </div>
        <p className="m-0 text-muted-foreground">Invoices started here: {count}</p>
        {hasSwitch && (
          <Field label="Use single-key shortcuts" layout="inline">
            <Switch
              checked={on}
              onCheckedChange={(v) => {
                setOn(v);
                say(v ? "Single-key shortcuts are on." : "Single-key shortcuts are off.");
              }}
            />
          </Field>
        )}
        {mode === "shift" && (
          <Field label="Use Shift shortcuts" layout="inline">
            <Switch
              checked={on}
              onCheckedChange={(v) => {
                setOn(v);
                say(v ? "Shift shortcuts are on." : "Shift shortcuts are off.");
              }}
            />
          </Field>
        )}
        <KeyRow>
          {mode === "modifier" && (
            <>
              <span><Kbd>Ctrl</Kbd>/<Kbd>Cmd</Kbd>+<Kbd>K</Kbd> search</span>
              <span><Kbd>Alt</Kbd>+<Kbd>Shift</Kbd>+<Kbd>N</Kbd> new invoice</span>
            </>
          )}
          {mode === "optin" && (
            <>
              <span><Kbd>/</Kbd> search</span>
              <span><Kbd>n</Kbd> new invoice</span>
            </>
          )}
          {mode === "shift" && (
            <span><Kbd>Shift</Kbd>+<Kbd>N</Kbd> new invoice</span>
          )}
        </KeyRow>
      </PageFrame>
      <Outcome>{said}</Outcome>
    </div>
  );
}

function SingleKeysOn() {
  const [singleKeyShortcuts, setSingleKeyShortcuts] = useState(true);
  const [count, setCount] = useState(0);
  const [said, say] = useSay();
  const search = useRef<HTMLInputElement>(null);

  const openSearch = (how: string) => {
    search.current?.focus();
    say(`${how} opened search.`);
  };
  const newInvoice = (how: string) => {
    setCount((n) => n + 1);
    say(`${how} started a new invoice.`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (hasModifier(e) || isTyping(e.target)) return;
    if (e.key !== "n" && e.key !== "/") return;
    if (!singleKeyShortcuts) {
      say(`"${e.key}" ignored: single-key shortcuts are off.`);
      return;
    }
    e.preventDefault();
    if (e.key === "n") newInvoice("n");
    else openSearch("/");
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
      <PageFrame label="Invoicing, example page" onKeyDown={onKeyDown}>
        <Field label="Search invoices">
          <Input ref={search} placeholder="Client or number" />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => openSearch("The button")}>
            Search
          </Button>
          <Button variant="outline" onClick={() => newInvoice("The button")}>
            New invoice
          </Button>
        </div>
        <p className="m-0 text-muted-foreground">Invoices started here: {count}</p>
        <Field label="Use single-key shortcuts" layout="inline">
          <Switch
            checked={singleKeyShortcuts}
            onCheckedChange={(v) => {
              setSingleKeyShortcuts(v);
              say(v ? "Single-key shortcuts are on." : "Single-key shortcuts are off.");
            }}
          />
        </Field>
        <KeyRow>
          <span><Kbd>/</Kbd> search</span>
          <span><Kbd>n</Kbd> new invoice</span>
        </KeyRow>
      </PageFrame>
      <Outcome>{said}</Outcome>
    </div>
  );
}

function CmdOnly() {
  const [count, setCount] = useState(0);
  const [said, say] = useSay();
  const search = useRef<HTMLInputElement>(null);

  const openSearch = (how: string) => {
    search.current?.focus();
    say(`${how} opened search.`);
  };
  const newInvoice = (how: string) => {
    setCount((n) => n + 1);
    say(`${how} started a new invoice.`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.metaKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openSearch("Cmd+K");
    } else if (e.ctrlKey && !e.metaKey && e.key.toLowerCase() === "k") {
      say("Ctrl+K did nothing: this page listens only for Cmd+K.");
    }
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
      <PageFrame label="Invoicing, example page" onKeyDown={onKeyDown}>
        <Field label="Search invoices">
          <Input ref={search} placeholder="Client or number" />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => openSearch("The button")}>
            Search
          </Button>
          <Button variant="outline" onClick={() => newInvoice("The button")}>
            New invoice
          </Button>
        </div>
        <p className="m-0 text-muted-foreground">Invoices started here: {count}</p>
        <KeyRow>
          <span><Kbd>Cmd</Kbd>+<Kbd>K</Kbd> search</span>
        </KeyRow>
      </PageFrame>
      <Outcome>{said}</Outcome>
    </div>
  );
}

function TakesFind() {
  const [take, setTake] = useState(false);
  const [count, setCount] = useState(0);
  const [said, say] = useSay();
  const search = useRef<HTMLInputElement>(null);

  const openSearch = (how: string) => {
    search.current?.focus();
    say(`${how} opened search.`);
  };
  const newInvoice = (how: string) => {
    setCount((n) => n + 1);
    say(`${how} started a new invoice.`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "f") {
      if (take) {
        e.preventDefault();
        say("Find in page was blocked: the page took the browser's own keys.");
      } else {
        say("Find in page opened as usual. Turn on the broken version to see the page take the keys.");
      }
    }
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
      <PageFrame label="Invoicing, example page" onKeyDown={onKeyDown} onLeave={() => setTake(false)}>
        <Field label="Search invoices">
          <Input ref={search} placeholder="Client or number" />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => openSearch("The button")}>
            Search
          </Button>
          <Button variant="outline" onClick={() => newInvoice("The button")}>
            New invoice
          </Button>
        </div>
        <p className="m-0 text-muted-foreground">Invoices started here: {count}</p>
        <Button variant={take ? "secondary" : "outline"} aria-pressed={take} onClick={() => setTake((v) => !v)}>
          Let the page take Ctrl+F
        </Button>
        <KeyRow>
          <span><Kbd>Ctrl</Kbd>/<Kbd>Cmd</Kbd>+<Kbd>F</Kbd> filter invoices</span>
        </KeyRow>
      </PageFrame>
      <Outcome>{said}</Outcome>
    </div>
  );
}

export const KBD003b: RuleExamples = {
  id: "KBD-003b",
  examples: [
    {
      kind: "do",
      title: "A modifier key from the start",
      caption: (
        <>
          Click inside the frame, then press <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd> (or <Kbd>Cmd</Kbd>+<Kbd>K</Kbd>): search opens.
          Press <Kbd>Alt</Kbd>+<Kbd>Shift</Kbd>+<Kbd>N</Kbd>: a new invoice starts. Both are matched for both
          platforms, and the second on the physical key, so Option works on a Mac. Press a plain <Kbd>n</Kbd>: nothing
          happens, because a single key is not a shortcut here. The buttons do the same things.
        </>
      ),
      Demo: () => <Invoices mode="modifier" />,
    },
    {
      kind: "do",
      title: "Single keys only after the person turns them on",
      caption: (
        <>
          Click inside the frame, then press <Kbd>n</Kbd>: it is ignored, because the switch <em>Use single-key
          shortcuts</em> starts off. Turn the switch on and press <Kbd>n</Kbd> or <Kbd>/</Kbd>: they work. The same
          switch turns them off again. Typing in the search field never fires anything.
        </>
      ),
      Demo: () => <Invoices mode="optin" />,
    },
    {
      kind: "dont",
      title: "Single keys on from the start, with a switch",
      caption: (
        <>
          The switch exists, but it starts on. Click inside the frame, then press <Kbd>n</Kbd>: a new invoice starts
          before anyone chose anything. Turning the switch off works, so this meets KBD-003, but the default is a single
          key, which KBD-003b does not accept.
        </>
      ),
      Demo: SingleKeysOn,
    },
    {
      kind: "do",
      title: "Shift+N with a switch to turn it off",
      caption: (
        <>
          Click inside the frame, then press <Kbd>Shift</Kbd>+<Kbd>N</Kbd>: a new invoice starts. Shift alone meets this
          rule&apos;s default, but Shift+N still types a capital N, so KBD-003 asks for a way out. Here it is the switch{" "}
          <em>Use Shift shortcuts</em>: turn it off and <Kbd>Shift</Kbd>+<Kbd>N</Kbd> is ignored. Without the switch the
          page would break KBD-003, though not this rule. Typing a capital N in the search field never fires anything.
        </>
      ),
      Demo: () => <Invoices mode="shift" />,
    },
    {
      kind: "dont",
      title: "Only Cmd is bound",
      caption: (
        <>
          Click inside the frame, then press <Kbd>Cmd</Kbd>+<Kbd>K</Kbd>: search opens. Press <Kbd>Ctrl</Kbd>+
          <Kbd>K</Kbd>: the page does nothing (your browser may use the keys itself), and the line under the frame says so. On Windows and Linux there is no Cmd
          key, so those people have no shortcut at all.
        </>
      ),
      Demo: CmdOnly,
      notLinted:
        "Lint gap: a Cmd-only binding is left to review; the rule reads single-key settings that start on and page-wide single keys.",
    },
    {
      kind: "dont",
      title: "The page takes Ctrl+F",
      caption: (
        <>
          Turn on <em>Let the page take Ctrl+F</em>, click inside the frame, then press <Kbd>Ctrl</Kbd>+<Kbd>F</Kbd> (or{" "}
          <Kbd>Cmd</Kbd>+<Kbd>F</Kbd>): the page stops the browser's find, so people lose find in page while focus is here. It starts off, so the keys work as usual until you turn it on, and it turns off again when focus leaves the frame. The keys the browser owns are
          left alone, and a page that needs its own filter gives it another key.
        </>
      ),
      Demo: TakesFind,
      notLinted:
        "Lint gap: taking a browser key such as Ctrl+F is left to review; the rule reads single-key settings that start on and page-wide single keys.",
    },
  ],
};
