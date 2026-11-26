import { Button } from "@blackwoodblake/justified-shadcn/button";
import { CheckIcon } from "@blackwoodblake/justified-shadcn/icons";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/*
 * Helpers for the language rules (STR-006, STR-006a). For the examples only.
 *
 * PageFrame draws a page with a line of code for its html element. The real
 * html element of the host page is never touched: the frame only simulates
 * what a page would say. LangReadout lists every part of a scene that carries
 * a lang attribute of its own, read from the scene's markup.
 */

export type Locale = "en" | "pl" | "pt" | "ko";

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "pl", label: "Polski" },
  { code: "pt", label: "Português" },
  { code: "ko", label: "한국어" },
];

export const TEXT: Record<Locale, { heading: string; detail: string; reserve: string; done: string }> = {
  en: { heading: "Book a table", detail: "Two guests, Friday at 19:00", reserve: "Reserve", done: "Table reserved" },
  pl: { heading: "Rezerwacja stolika", detail: "Dwie osoby, piątek, 19:00", reserve: "Rezerwuj", done: "Stolik zarezerwowany" },
  pt: { heading: "Reservar mesa", detail: "Duas pessoas, sexta, 19:00", reserve: "Reservar", done: "Mesa reservada" },
  ko: { heading: "테이블 예약", detail: "2명, 금요일 19:00", reserve: "예약하기", done: "예약 완료" },
};

/** A drawn page: its html tag as code on top, the page's own text below. */
export function PageFrame({ htmlLang, children, below }: { htmlLang: string | null; children: ReactNode; below?: ReactNode }) {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <p
        aria-hidden="true"
        className="m-0 rounded-md border border-dashed border-border bg-background px-3 py-2 font-mono text-sm text-foreground"
      >
        {htmlLang === null ? "<html>" : `<html lang="${htmlLang}">`}
      </p>
      <div className="rounded-lg border border-border bg-background p-4">{children}</div>
      {below}
    </div>
  );
}

/** The Larkspur booking view in one language, with its three-way switch. */
export function LarkspurView({
  locale,
  onSwitch,
  viewLang = true,
}: {
  locale: Locale;
  onSwitch: (l: Locale) => void;
  /** Mark the view with its language. Off only in the Don't that has no marking at all. */
  viewLang?: boolean;
}) {
  const t = TEXT[locale];
  const [done, setDone] = useState(false);
  return (
    <div lang={viewLang ? locale : undefined} className="grid gap-3 text-sm">
      <div className="flex flex-wrap gap-2">
        {LOCALES.map((l) => (
          <Button
            key={l.code}
            type="button"
            size="sm"
            variant="outline"
            lang={viewLang && l.code === locale ? undefined : l.code}
            aria-pressed={locale === l.code}
            className={locale === l.code ? "bg-accent text-accent-foreground" : ""}
            onClick={() => {
              setDone(false);
              onSwitch(l.code);
            }}
          >
            {locale === l.code && <CheckIcon aria-hidden="true" />}
            {l.label}
          </Button>
        ))}
      </div>
      <h4 className="m-0 text-base font-semibold">{t.heading}</h4>
      <p className="m-0 text-muted-foreground">{t.detail}</p>
      <div>
        <Button type="button" onClick={() => setDone(true)}>
          {t.reserve}
        </Button>
      </div>
      <p role="status" className="m-0 min-h-5 text-muted-foreground">
        {done ? t.done : ""}
      </p>
    </div>
  );
}

export type Entry = { code: string; label: string };

export const ENTRIES: Entry[] = [
  { code: "pl", label: "Polski" },
  { code: "pt", label: "Português" },
  { code: "ko", label: "한국어" },
];

/** Lists each part of the scene that carries its own lang, as the code has it. */
export function LangReadout({ children, showHreflang }: { children: ReactNode; showHreflang?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<{ tag: string; lang: string | null; text: string; hreflang: string | null }[]>([]);
  const [none, setNone] = useState("");

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const read = () => {
      const marked = [...root.querySelectorAll(showHreflang ? "[lang],[hreflang]" : "[lang]")].map((el) => ({
        tag: el.tagName.toLowerCase(),
        lang: el.getAttribute("lang"),
        text: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 28),
        hreflang: el.getAttribute("hreflang"),
      }));
      setRows(marked);
      setNone(marked.some((m) => m.lang !== null) ? "" : "No part carries its own lang");
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ["lang", "hreflang"] });
    return () => mo.disconnect();
  }, [showHreflang]);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div ref={ref}>{children}</div>
      <div aria-hidden="true" className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
        <p className="m-0">
          Parts with their own <code>lang</code>:
        </p>
        {none && <p className="m-0 mt-1 font-medium text-foreground">{none}</p>}
        {rows.length > 0 && (
          <ul className="m-0 mt-1 list-none p-0 text-foreground">
            {rows.map((r, i) => (
              <li key={i} className="font-mono text-xs">
                {r.tag} {r.lang === null ? "no lang" : `lang="${r.lang}"`}
                {r.hreflang ? ` hreflang="${r.hreflang}"` : ""} <span className="font-sans text-muted-foreground">“{r.text}”</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
