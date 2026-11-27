import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field, FieldError, FieldHint } from "@blackwoodblake/justified-shadcn/field";
import { AlertIcon } from "@blackwoodblake/justified-shadcn/icons";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { Label } from "@blackwoodblake/justified-shadcn/label";
import { Textarea } from "@blackwoodblake/justified-shadcn/textarea";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";

import { pasteLastText, type PasteLast } from "./paste-log";

/*
 * For FRM-017, FRM-017a, FRM-017b and FRM-017c.
 *
 * Paste cannot be tried from a button that fills the clipboard, because a
 * page may not write to it in every setting. So each sample is written out on
 * the page for anyone to copy and paste, and a "Paste sample" button sends a
 * paste event to the field through the same handler a real paste meets, then
 * lets the browser insert the text as it would. Nothing here reads or writes
 * the clipboard.
 *
 * The readouts say what the field shows and what the form would get, and what
 * a screen reader is told. They read the field itself, are hidden from
 * assistive technology, and are not components of the system.
 */

type Control = HTMLInputElement | HTMLTextAreaElement;

/** The quotes make leading and trailing spaces visible. */
export const q = (s: string) => (s === "" ? "(empty)" : `“${s}”`);

/** Dispatch a paste to the field, then insert the text unless a handler cancelled the event. */
export function pasteInto(el: Control, text: string) {
  // The sample replaces what is there, so pressing the button twice gives the same result.
  el.focus();
  el.select();
  let allowed = true;
  try {
    const data = new DataTransfer();
    data.setData("text/plain", text);
    allowed = el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
  } catch {
    allowed = true;
  }
  if (!allowed) return;
  if (document.execCommand?.("insertText", false, text)) return;
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const set = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  const start = el.selectionStart ?? el.value.length;
  const stop = el.selectionEnd ?? start;
  set?.call(el, el.value.slice(0, start) + text + el.value.slice(stop));
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

/** A dashed box of facts. Hidden from assistive technology, which already meets the real field. */
export function Readout({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl
      aria-hidden="true"
      className="m-0 grid gap-0.5 rounded-md border border-dashed border-border px-2 py-1.5 text-xs text-muted-foreground"
    >
      {rows.map(([k, v]) => (
        <div key={k} className="flex flex-wrap gap-x-1.5">
          <dt className="m-0">{k}:</dt>
          <dd className="m-0 min-w-0 whitespace-pre-wrap break-words font-mono font-semibold text-foreground">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Samples written out on the page, each with a button that pastes it into the field. */
export function Samples({
  items,
  target,
  name,
  scroll,
}: {
  items: string[];
  target: RefObject<Control | null>;
  name: string;
  scroll?: boolean;
}) {
  const id = useId();
  return (
    <div className="grid gap-1.5">
      <p id={id} className="m-0 text-xs font-medium text-muted-foreground">
        Sample to copy and paste. The button replaces what is in the field.
      </p>
      <ul aria-labelledby={id} className="m-0 grid list-none gap-1.5 p-0">
        {items.map((text) => (
          <li key={text} className="flex flex-wrap items-center gap-2">
            {scroll ? (
              <div
                role="group"
                aria-label={`Sample text for ${name}`}
                tabIndex={0}
                className="max-h-20 min-w-0 flex-1 basis-48 select-all overflow-auto rounded-md bg-muted px-2 py-1 text-xs leading-snug focus-visible:outline-2 focus-visible:outline-ring"
              >
                {text}
              </div>
            ) : (
              <code className="whitespace-pre rounded-md bg-muted px-2 py-1 text-xs">
                <span aria-hidden="true" className="select-none">“</span>
                <span className="select-all">{text}</span>
                <span aria-hidden="true" className="select-none">”</span>
              </code>
            )}
            <Button
              size="sm"
              variant="outline"
              aria-label={`Paste sample into ${name}${scroll ? "" : `: ${text.trim()}${text !== text.trim() ? " (with spaces around it)" : ""}`}`}
              // Keep focus in the field on a press, so leaving it does not show an error that moves the button.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => target.current && pasteInto(target.current, text)}
            >
              Paste sample
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const box = "grid w-full max-w-sm gap-3 rounded-lg border border-border bg-background p-4";

/* ------------------------------------------------------------------ */
/* One-line and multi-line fields for FRM-017 and FRM-017a            */
/* ------------------------------------------------------------------ */

export type PasteFieldProps = {
  label: string;
  hint?: string;
  multiline?: boolean;
  initial?: string;
  maxLength?: number;
  samples?: string[];
  /** Typed, not pasted, so a reader can try a key the field refuses. */
  typeSample?: string;
  /** Return false to cancel a paste, as a field that blocks paste or a mask would. */
  allowPaste?: (text: string) => boolean;
  /** Return true to refuse a typed character. */
  refuseKey?: (key: string) => boolean;
  /** What the form gets. Default: the value as it is. */
  clean?: (value: string) => string;
  /** Rewrites the value as people type; the caret stays with the character it was beside. */
  format?: (value: string) => string;
  /** A message when the cleaned value is wrong. Shown when the field is left or the form is sent. */
  check?: (cleaned: string, raw: string) => string | undefined;
  action?: string;
  inputMode?: "numeric" | "text";
  type?: "text" | "tel";
  autoComplete?: string;
  /** Drop the readout rows that repeat the field. */
  compact?: boolean;
};

/** The characters that do not count when the caret is placed after a format. */
const separator = /[\s\-().]/;

export function PasteField(p: PasteFieldProps) {
  const [value, setValue] = useState(p.initial ?? "");
  const [last, setLast] = useState<PasteLast | null>(null);
  const [refused, setRefused] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const [changed, setChanged] = useState(false);
  const [round, setRound] = useState(false);
  const ref = useRef<Control>(null);
  const pending = useRef<{ before: number; len: number } | null>(null);
  const caret = useRef<number | null>(null);

  const cleaned = p.clean ? p.clean(value) : value;
  const problem = p.check?.(cleaned, value);

  // After a format, put the caret back beside the character it was beside.
  useLayoutEffect(() => {
    if (caret.current !== null && ref.current && document.activeElement === ref.current) {
      ref.current.setSelectionRange(caret.current, caret.current);
    }
    caret.current = null;
  });

  /** Set a new value, format it, and put the caret after the same number of real characters. */
  const commit = (el: Control, raw: string, at: number) => {
    let next = raw;
    if (p.format) {
      const before = [...raw.slice(0, at)].filter((c) => !separator.test(c)).length;
      next = p.format(raw);
      let seen = 0;
      let pos = next.length;
      if (before === 0) pos = 0;
      else
        for (let i = 0; i < next.length; i++) {
          if (!separator.test(next[i])) seen++;
          if (seen === before) {
            pos = i + 1;
            break;
          }
        }
      caret.current = pos;
      // When the formatted value is the one already shown, React does not render again, so put the caret back after it restores the field.
      if (next === value) {
        queueMicrotask(() => {
          if (document.activeElement === el) el.setSelectionRange(pos, pos);
        });
      }
    }
    if (pending.current) {
      setLast({ len: pending.current.len, kept: next.length - pending.current.before });
      pending.current = null;
    }
    setValue(next);
    setChanged(true);
    setRound(false);
  };

  const onChange = (e: { target: Control }) => commit(e.target, e.target.value, e.target.selectionStart ?? e.target.value.length);

  const onPaste = (e: ClipboardEvent<Control>) => {
    const text = e.clipboardData.getData("text");
    if (p.allowPaste && !p.allowPaste(text)) {
      e.preventDefault();
      setLast({ len: text.length, blocked: true });
      return;
    }
    const el = e.currentTarget;
    const replaced = (el.selectionEnd ?? 0) - (el.selectionStart ?? 0);
    pending.current = { before: el.value.length - replaced, len: text.length };
    setLast({ len: text.length, kept: undefined });
    // A paste that adds nothing fires no input event, so settle the readout after the event.
    window.setTimeout(() => {
      if (pending.current) {
        // Read what is in the field now, whether or not the input event has come yet.
        setLast({ len: pending.current.len, kept: Math.max(0, el.value.length - pending.current.before) });
        pending.current = null;
      }
    }, 0);
  };

  const onKeyDown = (e: React.KeyboardEvent<Control>) => {
    // In a grouped field, Delete before a space or Backspace after one removes the neighbouring character instead of doing nothing.
    if (p.format && (e.key === "Delete" || e.key === "Backspace")) {
      const el = e.currentTarget;
      const a = el.selectionStart ?? 0;
      if (a === el.selectionEnd) {
        const v = el.value;
        const del = e.key === "Delete";
        if (separator.test(v[del ? a : a - 1] ?? "")) {
          let j = del ? a : a - 1;
          while (j >= 0 && j < v.length && separator.test(v[j])) j += del ? 1 : -1;
          if (j >= 0 && j < v.length) {
            e.preventDefault();
            commit(el, v.slice(0, j) + v.slice(j + 1), j);
          }
        }
      }
    }
    if (!p.refuseKey || e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    if (p.refuseKey(e.key)) {
      e.preventDefault();
      setRefused(e.key === " " ? "space" : e.key);
    }
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    setShown(true);
    // With a problem, focus goes to the field, and the move reads the message, so the region stays quiet this round.
    if (p.check?.(cleaned, value)) {
      setRound(true);
      ref.current?.focus();
    }
  };

  const common = {
    value,
    onChange,
    onPaste,
    onKeyDown,
    onBlur: () => {
      if (changed) setShown(true);
    },
    maxLength: p.maxLength,
    autoComplete: p.autoComplete ?? "off",
  };

  const rows: [string, ReactNode][] = [
    ["The field shows", q(value)],
    ["The form gets", q(cleaned)],
  ];
  if (p.check) rows.push(["Check", !cleaned ? "(nothing yet)" : problem ? "refused" : "accepted"]);
  rows.push(["Last paste", pasteLastText(last)]);
  if (p.refuseKey) rows.push(["Last key refused", refused ? q(refused) : "(none yet)"]);

  const control = p.multiline ? (
    <Textarea ref={ref as RefObject<HTMLTextAreaElement>} rows={3} {...common} />
  ) : (
    <Input ref={ref as RefObject<HTMLInputElement>} type={p.type} inputMode={p.inputMode} {...common} />
  );

  return (
    <form noValidate onSubmit={send} className="grid gap-2">
      <Field label={p.label} hint={p.hint} error={shown ? problem : undefined} announce={!round}>
        {control}
      </Field>
      {p.check && p.action ? (
        <div>
          <Button type="submit" size="sm" variant="secondary">
            {p.action}
          </Button>
        </div>
      ) : null}
      {p.samples ? <Samples items={p.samples} target={ref} name={p.label} scroll={p.multiline} /> : null}
      {p.typeSample ? (
        <p className="m-0 text-xs text-muted-foreground">
          Try typing{" "}
          <code className="whitespace-pre rounded-md bg-muted px-2 py-1">
            <span aria-hidden="true" className="select-none">“</span>
            <span className="select-all">{p.typeSample}</span>
            <span aria-hidden="true" className="select-none">”</span>
          </code>
        </p>
      ) : null}
      <Readout rows={rows} />
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Text with a limit, for FRM-017b and FRM-017c                       */
/* ------------------------------------------------------------------ */

const sentences = [
  "I have helped at the food bank on Saturdays for two years and I know the stock room well.",
  "I can lift boxes and drive a small van, and I am happy to start early.",
  "Last winter I helped to run the coat drive with four other people.",
  "I would like to do something on weekday evenings now that my shifts have changed.",
  "I speak English and some Polish, which has helped with new families.",
  "I am good at keeping records and have set up a simple sign-in sheet before.",
];

/** Text of exactly n characters. */
export function textOf(n: number, from = 0) {
  let out = "";
  for (let i = from; out.length < n; i++) out += sentences[i % sentences.length] + " ";
  return out.slice(0, n).trimEnd().padEnd(n, ".");
}

/** Text of exactly n words. */
export function wordsOf(n: number) {
  const base = sentences.join(" ").split(" ");
  return Array.from({ length: n }, (_, i) => base[i % base.length]).join(" ");
}

const measure = (v: string, unit: "characters" | "words") =>
  unit === "words" ? (v.trim() ? v.trim().split(/\s+/).length : 0) : v.length;

const num = (k: number, unit: "characters" | "words") => `${k} ${k === 1 ? unit.slice(0, -1) : unit}`;

export type CountedProps = {
  label: string;
  limit: number;
  unit: "characters" | "words";
  initial?: string;
  sample?: string;
  /** The hint that states the limit before anyone starts. */
  hint?: string;
  /** "tied": the count is part of the field's description. "untied": a span nothing points to. "none": no count. */
  count: "tied" | "untied" | "none";
  /** "stop": input stops at the limit. "over": it runs past. "maxlength": the attribute cuts it. */
  at: "stop" | "over" | "maxlength";
  /** How a change in the count reaches a screen reader. */
  say: "polite" | "assertive" | "none";
  /** "phrase": "20 characters left". "fraction": "500/500". */
  words?: "phrase" | "fraction";
  /** Colour the count red at the limit and say nothing else. */
  redOnly?: boolean;
  /** Show a send button and the error for text that is too long. */
  send?: boolean;
};

export function Counted(p: CountedProps) {
  const [value, setValue] = useState(p.initial ?? "");
  const [cut, setCut] = useState(0);
  // Whether the last cut was a paste, so the count can say the end of the paste was left out.
  const [cutPaste, setCutPaste] = useState(false);
  const [announced, setAnnounced] = useState("");
  const [description, setDescription] = useState("");
  const [shown, setShown] = useState(false);
  const [sentOk, setSentOk] = useState(false);
  const [changed, setChanged] = useState(false);
  const [round, setRound] = useState(false);
  const [last, setLast] = useState<PasteLast | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const pending = useRef<{ before: number; len: number; cut: number } | null>(null);
  const first = useRef(true);
  const wasReached = useRef(false);
  const id = useId();
  const hintId = `${id}-hint`;
  const countId = `${id}-count`;
  const errorId = `${id}-error`;

  const used = measure(value, p.unit);
  const over = used > p.limit;
  const stopped = p.at !== "maxlength" && used === p.limit;

  const phrase = over
    ? `${num(used - p.limit, p.unit)} over the limit`
    : cut > 0
      ? cutPaste
        ? `Limit reached. The last ${num(cut, p.unit)} you pasted ${cut === 1 ? "was" : "were"} not added.`
        : "Limit reached. Nothing more can be added."
      : stopped
        ? "Limit reached"
        : `${num(p.limit - used, p.unit)} left`;
  const text = p.words === "fraction" ? `${used}/${p.limit}` : phrase;
  const reached = over || stopped || cut > 0;

  // The polite region speaks when the person pauses, and at once when the limit is reached or passed.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (p.say === "none" || p.count === "none") return;
    if (p.say === "assertive") {
      setAnnounced(text);
      return;
    }
    // At once only when the limit is crossed. Every other change waits for a pause.
    const crossed = reached && !wasReached.current;
    wasReached.current = reached;
    if (crossed) {
      setAnnounced(text);
      return;
    }
    const t = window.setTimeout(() => setAnnounced(text), 900);
    return () => window.clearTimeout(t);
  }, [text, reached, p.say, p.count]);

  // What the field is described by, read from the page, so a count that is not tied shows as missing.
  useLayoutEffect(() => {
    const ids = (ref.current?.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
    const next = ids
      .map((i) => document.getElementById(i)?.textContent?.replace(/^Error:\s*/, "").trim() ?? "")
      .filter(Boolean)
      .join(" / ");
    if (next !== description) setDescription(next);
  });

  const onChange = (e: { target: HTMLTextAreaElement }) => {
    const next = e.target.value;
    // In stop mode the browser trims only what was added (maxLength), so the person's own text and the caret stay.
    setCut(pending.current?.cut ?? 0);
    setCutPaste((pending.current?.cut ?? 0) > 0);
    if (pending.current) {
      setLast({ len: pending.current.len, kept: next.length - pending.current.before });
      pending.current = null;
    }
    setValue(next);
    setChanged(true);
    setRound(false);
    setSentOk(false);
  };

  const onPaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const text = e.clipboardData.getData("text");
    const replaced = (el.selectionEnd ?? 0) - (el.selectionStart ?? 0);
    const room = p.limit - (el.value.length - replaced);
    const cut = p.at === "stop" ? Math.max(0, text.length - room) : 0;
    pending.current = { before: el.value.length - replaced, len: text.length, cut };
    setCut(cut);
    setCutPaste(cut > 0);
    // A paste that adds nothing fires no input event, so settle the readout after the event.
    window.setTimeout(() => {
      if (pending.current) {
        // Read what is in the field now, whether or not the input event has come yet.
        setLast({ len: pending.current.len, kept: Math.max(0, el.value.length - pending.current.before) });
        pending.current = null;
      }
    }, 0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (p.at !== "stop" || e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    const el = e.currentTarget;
    const replaced = (el.selectionEnd ?? 0) - (el.selectionStart ?? 0);
    if (el.value.length - replaced >= p.limit) {
      setCut(1);
      setCutPaste(false);
    }
  };

  // Named by the label the person sees (TXT-001a).
  const tooLong =
    p.unit === "characters"
      ? `Your answer to ${p.label} is ${used} characters. Shorten it to ${p.limit} or fewer.`
      : undefined;
  const error = shown && over ? tooLong : undefined;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setShown(true);
    setSentOk(!over);
    // With a problem, focus goes to the field, and the move reads the message, so the region stays quiet this round.
    if (over) {
      setRound(true);
      ref.current?.focus();
    }
  };

  const describedBy =
    [error ? errorId : "", p.hint ? hintId : "", p.count === "tied" ? countId : ""].filter(Boolean).join(" ") ||
    undefined;

  const countClass = `m-0 flex items-start gap-1.5 text-sm ${
    // Over the limit is not an error while the person types: the count says so in words and an icon, and turns to the
    // error colour only once the error shows, on leaving the field or sending (FRM-002b).
    p.redOnly
      ? reached
        ? "text-destructive"
        : "text-muted-foreground"
      : over
        ? error
          ? "font-medium text-destructive"
          : "font-medium text-foreground"
        : "text-muted-foreground"
  }`;

  const rows: [string, ReactNode][] = [
    ["The field holds", num(used, p.unit)],
    ["Read with the field", description ? q(description) : "(nothing about the limit)"],
    [
      "A screen reader is told",
      p.count === "none" || p.say === "none"
        ? "(nothing)"
        : announced
          ? `${q(announced)}, ${p.say === "assertive" ? "assertive: it interrupts" : "polite: it waits its turn"}`
          : "(nothing yet: type, then pause)",
    ],
    ["Last paste", pasteLastText(last)],
  ];

  return (
    <form noValidate onSubmit={submit} className="grid gap-2">
      <div>
        <Label htmlFor={id}>{p.label}</Label>
        {p.hint ? (
          <div className="mt-1">
            <FieldHint id={hintId}>{p.hint}</FieldHint>
          </div>
        ) : null}
        <div className="mt-2">
          <Textarea
            id={id}
            ref={ref}
            rows={4}
            value={value}
            onChange={onChange}
            onPaste={onPaste}
            onKeyDown={onKeyDown}
            onBlur={() => {
              if (changed) setShown(true);
            }}
            maxLength={p.at === "maxlength" || p.at === "stop" ? p.limit : undefined}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
          />
        </div>
        {p.count !== "none" ? (
          <div className="mt-1">
            <p
              id={countId}
              className={countClass}
              aria-live={p.say === "assertive" ? "assertive" : undefined}
              aria-atomic={p.say === "assertive" ? "true" : undefined}
            >
              {over && !p.redOnly ? <AlertIcon className="mt-0.5 size-4 shrink-0" /> : null}
              <span>{text}</span>
            </p>
            {p.say === "polite" ? (
              <span aria-live="polite" aria-atomic="true" className="sr-only">
                {announced}
              </span>
            ) : null}
          </div>
        ) : null}
        <FieldError id={errorId} announce={!round}>
          {error}
        </FieldError>
      </div>
      {p.send ? (
        <div>
          <Button type="submit" size="sm">
            Send application
          </Button>
          <p role="status" className="m-0 mt-2 min-h-5 text-sm text-muted-foreground">
            {sentOk ? "Thank you. Your application is in." : ""}
          </p>
        </div>
      ) : null}
      {p.sample ? <Samples items={[p.sample]} target={ref} name={p.label} scroll /> : null}
      <Readout rows={rows} />
    </form>
  );
}
