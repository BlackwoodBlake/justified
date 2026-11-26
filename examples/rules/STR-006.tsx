import { Button } from "@blackwoodblake/justified-shadcn/button";
import { CheckIcon } from "@blackwoodblake/justified-shadcn/icons";
import { useState } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";
import { LarkspurView, PageFrame, TEXT, type Locale } from "./language";

/*
 * STR-006 (a requirement, WCAG 3.1.1): the html element names the page's
 * main language, and follows when the interface changes language.
 *
 * The host page's own html lang is never touched. Each example draws a page
 * with a line of code for its html tag; the line is what the example's
 * switch changes (Do) or fails to change (Don't). The scene is the booking
 * app Larkspur in English, Polish, Portuguese and Korean, the same set as
 * STR-006a.
 */

function FollowsDemo() {
  const [locale, setLocale] = useState<Locale>("en");
  return (
    <PageFrame htmlLang={locale}>
      <LarkspurView locale={locale} onSwitch={setLocale} />
    </PageFrame>
  );
}

function StaysEnglishDemo() {
  const [locale, setLocale] = useState<Locale>("en");
  return (
    <PageFrame htmlLang="en">
      <LarkspurView locale={locale} onSwitch={setLocale} viewLang={false} />
    </PageFrame>
  );
}

function WrapperDemo() {
  const [locale, setLocale] = useState<Locale>("pl");
  return (
    <PageFrame
      htmlLang="en"
      below={
        <div aria-hidden="true" className="rounded-md border border-dashed border-border px-3 py-2 text-sm">
          <p className="m-0 text-muted-foreground">A toast, drawn outside the view, in a portal at the end of body:</p>
          <p className="m-0 mt-1 font-medium">{TEXT[locale].done}</p>
          <p className="m-0 mt-1 font-mono text-xs text-muted-foreground">
            lang on the view&apos;s div: {locale} · lang the toast falls back to: en
          </p>
        </div>
      }
    >
      <LarkspurView locale={locale} onSwitch={setLocale} />
    </PageFrame>
  );
}

const BAD = [
  { id: "template", attr: "en", html: "en", hint: "The page is in Polish and html names English. Every word is read with English rules." },
  { id: "us", attr: "en_US", html: "en_US", hint: "Not a valid tag: language tags use a hyphen, as in en-US." },
  { id: "word", attr: "english", html: "english", hint: "Not a valid tag: use the code, en." },
  { id: "cn", attr: "cn", html: "cn", hint: "Not a valid tag: cn is a country. Chinese is zh." },
  { id: "empty", attr: "", html: "", hint: "An empty lang names no language." },
  { id: "none", attr: null, html: null, hint: "No lang: each tool falls back to its own default." },
] as const;

function BadTagsDemo() {
  const [i, setI] = useState(0);
  const pick = BAD[i];
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {BAD.map((b, n) => (
          <Button
            key={b.id}
            type="button"
            size="sm"
            variant="outline"
            aria-pressed={i === n}
            className={i === n ? "bg-accent text-accent-foreground" : ""}
            onClick={() => setI(n)}
          >
            {i === n && <CheckIcon aria-hidden="true" />}
            {b.attr === null ? "No attribute" : b.attr === "" ? 'lang=""' : b.attr === "en" ? "Template's en" : b.attr}
          </Button>
        ))}
      </div>
      <PageFrame htmlLang={pick.html}>
        <div lang="pl" className="grid gap-1 text-sm">
          <h4 className="m-0 text-base font-semibold">Rezerwacja stolika</h4>
          <p className="m-0 text-muted-foreground">Dwie osoby, piątek, 19:00</p>
        </div>
      </PageFrame>
      <Outcome>{pick.hint}</Outcome>
    </div>
  );
}

export const STR006: RuleExamples = {
  id: "STR-006",
  examples: [
    {
      kind: "do",
      title: "The attribute follows the language",
      caption: (
        <>
          Pick <em>Polski</em>, <em>Português</em> or <em lang="ko">한국어</em> and watch the code line: <code>lang</code> on the page&apos;s <code>html</code> changes with the
          interface. The frame only draws the page; this page&apos;s own <code>html</code> is left alone.
        </>
      ),
      Demo: FollowsDemo,
    },
    {
      kind: "dont",
      title: "Every string changes, lang stays en",
      caption: <>Switch the language: the text turns Polish, Portuguese or Korean, but the code line still says English, so a screen reader keeps reading with English sounds.</>,
      Demo: StaysEnglishDemo,
    },
    {
      kind: "dont",
      title: "The language sits on a div around the app",
      caption: <>The view&apos;s div says <code>pl</code>, but <code>html</code> still says <code>en</code>. The head and a toast in a portal fall back to English; so would a dialog or a menu.</>,
      Demo: WrapperDemo,
    },
    {
      kind: "dont",
      title: "A wrong or missing value",
      caption: <>Try each value on a Polish page. A template&apos;s <code>en</code>, <code>en_US</code>, <code>english</code>, <code>cn</code>, an empty value and no attribute all fail.</>,
      Demo: BadTagsDemo,
    },
  ],
};
