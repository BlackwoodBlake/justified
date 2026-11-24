import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { focusRing } from "@blackwoodblake/justified-shadcn/styles";
import { Textarea } from "@blackwoodblake/justified-shadcn/textarea";
import { flushSync } from "react-dom";
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";

import { AlertIcon } from "@blackwoodblake/justified-shadcn/icons";

import { drawnRing, Outcome, Still, useSay } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * FRM-011 (a guideline, our own choice): when a form is sent with problems,
 * move focus to the first field with a problem, or to a summary of them.
 *
 * A kennel booking with five fields, the first already filled in. The Do
 * uses the summary when there are several problems and goes straight to the
 * field when there is one (the rule allows both). Every field still shows its
 * own message, and the live announcements are held back for that round,
 * because focus already reads them.
 *
 * ACT-004's Do is a long form with one empty field and an enabled button; this
 * is a short form with several problems, and what matters here is where focus
 * goes and what is said. The Don't shows the messages and leaves focus on the
 * button, with no announcement for that send, so a screen reader user hears nothing.
 */

type Key = "pet" | "arrival" | "collection" | "vet";
const order: Key[] = ["pet", "arrival", "collection", "vet"];

const labels: Record<Key, string> = {
  pet: "Pet's name",
  arrival: "Arrival date",
  collection: "Collection date",
  vet: "Vet's phone number",
};

const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v.trim());

function problem(k: Key, v: Record<Key, string>): string | undefined {
  const value = v[k].trim();
  switch (k) {
    case "pet":
      return value ? undefined : "Enter your pet's name.";
    case "arrival":
      return isDate(value) ? undefined : "Enter the date your pet arrives, for example 2027-03-14.";
    case "collection":
      if (!isDate(value)) return "Enter the date you collect your pet, for example 2027-03-21.";
      return isDate(v.arrival) && value <= v.arrival.trim()
        ? "Enter a collection date after the arrival date."
        : undefined;
    case "vet":
      return value.replace(/\D/g, "").length >= 6 ? undefined : "Enter your vet's phone number, for example 555 0142.";
  }
}

const start: Record<Key, string> = { pet: "Biscuit", arrival: "", collection: "", vet: "" };

function Booking({ moves, picture }: { moves: boolean; picture: ReactNode }) {
  const [values, setValues] = useState({ ...start });
  const [notes, setNotes] = useState("");
  const [changed, setChanged] = useState<Partial<Record<Key, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({});
  // After a send that moves focus, the move already reads the messages, so the regions stay quiet.
  const [sent, setSent] = useState(false);
  const [summaryOn, setSummaryOn] = useState(false);
  const [everSent, setEverSent] = useState(false);
  const [said, say] = useSay();
  const base = useId();
  const summaryRef = useRef<HTMLDivElement>(null);
  const headingId = `${base}-summary`;
  const inputs = useRef<Partial<Record<Key, HTMLInputElement | null>>>({});

  const idOf = (k: Key) => `${base}-${k}`;
  const items = order.filter((k) => errors[k]);

  const change = (k: Key, v: string) => {
    const next = { ...values, [k]: v };
    setValues(next);
    setChanged((c) => ({ ...c, [k]: true }));
    setSent(false);
    say("");
    // The message goes on the key press that makes the answer right, and changes if another problem is left (FRM-002b).
    if (errors[k]) setErrors((e) => ({ ...e, [k]: problem(k, next) }));
  };

  // An error shows when a changed field is left, not before (FRM-002b).
  const leave = (k: Key) => {
    if (changed[k]) setErrors((e) => ({ ...e, [k]: problem(k, values) }));
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    say("");
    setEverSent(true);
    const next: Partial<Record<Key, string>> = {};
    for (const k of order) next[k] = problem(k, values);
    setErrors(next);
    const found = order.filter((k) => next[k]);
    if (found.length === 0) {
      setSummaryOn(false);
      setSent(false);
      say(`Stay booked for ${values.pet.trim()}.`);
      return;
    }
    if (!moves) {
      // The Don't: the messages appear, focus stays on the button and nothing is read out.
      setSent(true);
      return;
    }
    if (found.length === 1) {
      // One problem: straight to the field. After Enter in that field, focus does not move, so its message is read.
      const el = inputs.current[found[0]];
      setSummaryOn(false);
      setSent(document.activeElement !== el);
      el?.focus();
    } else {
      // Several problems: the summary takes focus, and its heading is read.
      // The summary is shown first, because a hidden element cannot take focus.
      flushSync(() => {
        setSummaryOn(true);
        setSent(true);
      });
      summaryRef.current?.focus();
    }
  };

  const goTo = (k: Key) => (e: { preventDefault: () => void }) => {
    e.preventDefault();
    inputs.current[k]?.focus();
  };

  const field = (k: Key, extra?: { hint?: string }) => (
    <Field key={k} id={idOf(k)} label={labels[k]} error={errors[k]} announce={!sent} {...extra}>
      <Input
        ref={(el) => {
          inputs.current[k] = el;
        }}
        autoComplete="off"
        type={k === "vet" ? "tel" : "text"}
        value={values[k]}
        onChange={(e) => change(k, e.target.value)}
        onBlur={() => leave(k)}
      />
    </Field>
  );

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* The still picture shows the state before the first send. Once the real messages are in the page, it steps aside. */}
      {!everSent && picture}
      <form
        noValidate
        onSubmit={send}
        className="grid w-full max-w-sm gap-4 rounded-lg border border-border bg-background p-4"
      >
        <h4 className="m-0 text-base font-semibold">Book a kennel stay</h4>

        {/* Always in the page, so it can take focus. It shows only after a send with several problems. */}
        <div
          ref={summaryRef}
          role="group"
          aria-labelledby={headingId}
          tabIndex={-1}
          hidden={!(summaryOn && items.length > 0)}
          className="rounded-md border-2 border-destructive p-3 outline-none focus:ring-(length:--focus-ring-width) focus:ring-ring focus:ring-offset-[length:var(--focus-ring-offset)] focus:ring-offset-background"
        >
          <h4 id={headingId} className="m-0 text-base font-semibold text-destructive">
            Check {items.length} {items.length === 1 ? "answer" : "answers"} before you book
          </h4>
          <ul className="m-0 mt-2 list-none p-0">
            {items.map((k) => (
              <li key={k}>
                <a
                  href={`#${idOf(k)}`}
                  onClick={goTo(k)}
                  className={`inline-flex min-h-6 items-center py-0.5 text-sm font-medium text-destructive underline underline-offset-2 ${focusRing}`}
                >
                  {errors[k]}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {field("pet")}
        {field("arrival")}
        {field("collection")}
        <Field label="Feeding notes" mark optionalText="(optional)">
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        {field("vet")}
        <div>
          <Button type="submit">Book stay</Button>
        </div>
        <Outcome>{said}</Outcome>
      </form>
    </div>
  );
}

function Link({ children }: { children: string }) {
  return (
    <li className="flex items-start gap-1.5 text-destructive underline underline-offset-2">
      <span>{children}</span>
    </li>
  );
}

function PictureSummary() {
  return (
    <Still note="Three problems: the summary takes focus. Each line is a link to its field.">
      <div className={`rounded-md border-2 border-destructive bg-background p-3 text-sm ${drawnRing}`}>
        <p className="m-0 text-base font-semibold text-destructive">Check 3 answers before you book</p>
        <ul className="m-0 mt-2 list-none p-0">
          <Link>Enter the date your pet arrives, for example 2027-03-14.</Link>
          <Link>Enter the date you collect your pet, for example 2027-03-21.</Link>
          <Link>Enter your vet's phone number, for example 555 0142.</Link>
        </ul>
      </div>
    </Still>
  );
}

function PictureSilent() {
  return (
    <Still note="Three messages are on the page, and focus is still on Book stay. Nothing is read out.">
      <div className="grid gap-2 rounded-md border border-border bg-background p-3 text-sm">
        {[
          "Enter the date your pet arrives, for example 2027-03-14.",
          "Enter the date you collect your pet, for example 2027-03-21.",
          "Enter your vet's phone number, for example 555 0142.",
        ].map((m) => (
          <p key={m} className="m-0 flex items-start gap-1.5 font-medium text-destructive">
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            <span>{m}</span>
          </p>
        ))}
        <span
          className={`inline-flex h-9 w-fit items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground ${drawnRing}`}
        >
          Book stay
        </span>
      </div>
    </Still>
  );
}

export const FRM011: RuleExamples = {
  id: "FRM-011",
  examples: [
    {
      kind: "do",
      title: "Focus goes to the problems, or to the one problem",
      caption: (
        <>
          Press <em>Book stay</em> with the three empty fields. Focus moves to a box that counts the problems, and each
          line links to its field, in the order of the form. Follow one link, fill in two fields and press again: with
          one problem left, focus goes straight into that field. Every field also shows its own message, and nothing is
          read twice.
        </>
      ),
      Demo: () => <Booking moves picture={<PictureSummary />} />,
    },
    {
      kind: "dont",
      title: "The messages appear and focus stays on the button",
      caption: (
        <>
          Press <em>Book stay</em>. Messages show at the three fields, which may be far above, but focus stays on the
          button and nothing is announced for that send, so a screen reader user hears nothing and has to search the
          form. Keeping focus on the button would only be fine if each message were announced instead.
        </>
      ),
      Demo: () => <Booking moves={false} picture={<PictureSilent />} />,
    },
  ],
};
