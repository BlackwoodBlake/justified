import { Button } from "@blackwoodblake/justified-shadcn/button";
import { CheckIcon } from "@blackwoodblake/justified-shadcn/icons";
import { useId, useState } from "react";

import type { RuleExamples } from "./frame";
import { ENTRIES, LangReadout, type Entry } from "./language";

/*
 * STR-006a (a requirement, WCAG 3.1.2): text in another language than the
 * text around it carries its own lang.
 *
 * The scene is Larkspur's language picker in an English page, with entries
 * in Polish, Portuguese and Korean, and a guest review in Spanish. The lang
 * attributes in the examples are real markup. Under each scene a readout
 * lists the parts that carry one.
 *
 * Picker: a disclosure button over a list of buttons, shown open at first.
 * Choosing an entry marks it with aria-current and shows it on the trigger.
 */

function Picker() {
  const listId = useId();
  const [open, setOpen] = useState(true);
  const [current, setCurrent] = useState("en");
  const all: Entry[] = [{ code: "en", label: "English" }, ...ENTRIES];
  const now = all.find((e) => e.code === current)!;
  const marked = (e: Entry) => (e.code !== "en" ? e.code : undefined);

  return (
    <div className="relative flex flex-col gap-2 rounded-lg border border-border bg-background p-3 text-sm">
      <Button type="button" variant="outline" aria-expanded={open} aria-controls={listId} onClick={() => setOpen((o) => !o)}>
        Language:{" "}
        <span lang={marked(now)} className="font-semibold">
          {now.label}
        </span>
      </Button>
      <ul id={listId} hidden={!open} className="m-0 grid list-none gap-1 p-0">
        {all.map((e) => (
          <li key={e.code}>
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start"
              aria-current={current === e.code ? "true" : undefined}
              lang={marked(e)}
              onClick={() => setCurrent(e.code)}
            >
              {current === e.code && <CheckIcon aria-hidden="true" />}
              {e.label}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PickerMarkedDemo() {
  return (
    <LangReadout>
      <Picker />
    </LangReadout>
  );
}

const languages = [
  { code: "en", label: "English" },
  { code: "pl", label: "Polski" },
  { code: "pt", label: "Português" },
  { code: "ko", label: "한국어" },
];

function PickerUnmarkedDemo() {
  const listId = useId();
  const [open, setOpen] = useState(true);
  const [current, setCurrent] = useState("en");
  const now = languages.find((l) => l.code === current)!;

  return (
    <LangReadout>
      <div className="relative flex flex-col gap-2 rounded-lg border border-border bg-background p-3 text-sm">
        <Button type="button" variant="outline" aria-expanded={open} aria-controls={listId} onClick={() => setOpen((o) => !o)}>
          Language: <span className="font-semibold">{now.label}</span>
        </Button>
        <ul id={listId} hidden={!open} className="m-0 grid list-none gap-1 p-0">
          {languages.map((l) => (
            <li key={l.code}>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start"
                aria-current={current === l.code ? "true" : undefined}
                onClick={() => setCurrent(l.code)}
              >
                {current === l.code && <CheckIcon aria-hidden="true" />}
                {l.label}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </LangReadout>
  );
}

function PickerHreflangDemo() {
  const listId = useId();
  const [open, setOpen] = useState(true);
  const [said, setSaid] = useState("");
  const current = "en";
  const now = languages.find((l) => l.code === current)!;

  return (
    <LangReadout showHreflang>
      <div className="relative flex flex-col gap-2 rounded-lg border border-border bg-background p-3 text-sm">
        <Button type="button" variant="outline" aria-expanded={open} aria-controls={listId} onClick={() => setOpen((o) => !o)}>
          Language: <span className="font-semibold">{now.label}</span>
        </Button>
        <ul id={listId} hidden={!open} className="m-0 grid list-none gap-1 p-0">
          {languages.map((l) => (
            <li key={l.code}>
              <Button asChild variant="ghost" className="w-full justify-start">
                <a
                  href={`/${l.code}/`}
                  hrefLang={l.code}
                  aria-current={current === l.code ? "true" : undefined}
                  onClick={(ev) => {
                    // A plain click only reports where it would go; a new tab opens the real address.
                    if (ev.button === 0 && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey && !ev.altKey) {
                      ev.preventDefault();
                      setSaid(`Would go to /${l.code}/`);
                    }
                  }}
                >
                  {current === l.code && <CheckIcon aria-hidden="true" />}
                  {l.label}
                </a>
              </Button>
            </li>
          ))}
        </ul>
        <p role="status" className="m-0 min-h-5 text-center text-muted-foreground">
          {said}
        </p>
      </div>
    </LangReadout>
  );
}

function ReviewDemo() {
  return (
    <LangReadout>
      <div className="grid gap-2 rounded-lg border border-border bg-background p-4 text-sm">
        <h4 className="m-0 text-base font-semibold">Reviews</h4>
        <blockquote lang="es" className="m-0 border-l-2 border-border pl-3">
          La cena fue excelente, un auténtico <span lang="en">Sunday roast</span> con vino de la casa.
        </blockquote>
        <p className="m-0 text-muted-foreground">Mariana, table for four</p>
      </div>
    </LangReadout>
  );
}

function FrenchDemo() {
  return (
    <LangReadout>
      <div className="grid gap-2 rounded-lg border border-border bg-background p-4 text-sm">
        <h4 className="m-0 text-base font-semibold">About this dish</h4>
        <p className="m-0">
          Un ragoût lent d&apos;agneau, servi avec des haricots blancs et du romarin.
        </p>
        <p className="m-0 text-muted-foreground">Description not yet translated into English.</p>
      </div>
    </LangReadout>
  );
}

export const STR006a: RuleExamples = {
  id: "STR-006a",
  examples: [
    {
      kind: "do",
      title: "Each entry carries its own language",
      caption: (
        <>
          Choose <em>Polski</em> with the keyboard or a pointer: its entry gets <code>aria-current</code>, and the trigger now reads <em>Language: Polski</em> with <code>lang=&quot;pl&quot;</code> on the name. <em>English</em> needs no <code>lang</code> in an English page.
        </>
      ),
      Demo: PickerMarkedDemo,
    },
    {
      kind: "dont",
      title: "Entries in their own languages, no lang",
      caption: <>The readout finds nothing marked, so <em>Português</em> and <em>한국어</em> are read with English sounds.</>,
      Demo: PickerUnmarkedDemo,
    },
    {
      kind: "dont",
      title: "Only hreflang on the links",
      caption: <>Each entry is a real link to that language&apos;s version (a plain click only reports the address). <code>hreflang</code> names the page it leads to, not the language of the link&apos;s own text, so the readout shows no <code>lang</code>.</>,
      Demo: PickerHreflangDemo,
    },
    {
      kind: "do",
      title: "A review in Spanish, with an English phrase",
      caption: <>The quotation has <code>lang=&quot;es&quot;</code>, and the English phrase inside it switches back with <code>lang=&quot;en&quot;</code>.</>,
      Demo: ReviewDemo,
    },
    {
      kind: "dont",
      title: "A French description shown unmarked",
      caption: <>The description is French because no English one exists yet, but nothing says so. The readout finds no marked part.</>,
      Demo: FrenchDemo,
      notLinted: "Lint gap: the rule cannot tell that a paragraph is written in another language than the page.",
    },
  ],
};
