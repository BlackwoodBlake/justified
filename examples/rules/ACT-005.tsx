import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Checkbox } from "@blackwoodblake/justified-shadcn/checkbox";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * ACT-005: when a submit button is off because input is missing, a line
 * directly before it says what is still needed.
 *
 * A short newsletter form that fits on one screen, so ACT-004 does not apply
 * and the team may switch Subscribe off. In the Do a neutral line in a polite
 * region sits right before the button and updates when the person leaves the
 * field or ticks the box, never on each key press. The Don't has no line.
 * The field's own error has the same timing in both (FRM-002b).
 */

const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const fieldError = (v: string) =>
  !v.trim() ? "Enter your email address." : "Enter a full email address, like anna@example.com.";

function noteFor(email: string, accepted: boolean) {
  const empty = !email.trim();
  const bad = !empty && !validEmail(email);
  if (empty && !accepted) return "Enter your email and accept the terms to continue.";
  if (bad && !accepted) return "Check the email address and accept the terms to continue.";
  if (empty) return "Still needed: your email address.";
  if (bad) return "Check the email address to continue.";
  if (!accepted) return "Still needed: accept the terms.";
  return "";
}

function Newsletter({ explain }: { explain: boolean }) {
  const [email, setEmail] = useState("");
  // The email as it was when the person last left the field. The note and the button go by it.
  const [left, setLeft] = useState("");
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [accepted, setAccepted] = useState(false);
  const [said, setSaid] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const note = noteFor(left, accepted);
  const ready = note === "";

  const send = (e: FormEvent) => {
    e.preventDefault();
    setSaid("");
    // Enter in the field sends too, so go by what is in the form now, not by the note.
    if (noteFor(email, accepted)) {
      // The note and the button catch up, and the line announces what is still needed.
      setLeft(email);
      if (changed) setError(validEmail(email) ? undefined : fieldError(email));
      return;
    }
    setLeft(email);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaid("Subscribed. The first newsletter comes on 1 December."), 50);
  };

  return (
    <form
      noValidate
      onSubmit={send}
      className="grid w-full max-w-sm gap-4 rounded-lg border border-border bg-background p-4"
    >
      <h4 className="m-0 text-base font-semibold">Join our newsletter</h4>
      <Field label="Email" error={error}>
        <Input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setChanged(true);
            setSaid("");
            if (error && validEmail(e.target.value)) setError(undefined);
          }}
          // Enter sends even while the button waits for the field to be left; send checks the values.
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }}
          onBlur={() => {
            setLeft(email);
            if (changed) setError(validEmail(email) ? undefined : fieldError(email));
          }}
        />
      </Field>
      <Field label="I accept the newsletter terms" layout="inline">
        <Checkbox
          checked={accepted}
          onCheckedChange={(v) => {
            setAccepted(v === true);
            setSaid("");
          }}
        />
      </Field>
      {explain && (
        <p role="status" className="m-0 min-h-5 text-sm text-foreground">
          {note}
        </p>
      )}
      <div>
        <Button type="submit" disabled={!ready}>
          Subscribe
        </Button>
      </div>
      <Outcome>{said}</Outcome>
    </form>
  );
}

export const ACT005: RuleExamples = {
  id: "ACT-005",
  examples: [
    {
      kind: "do",
      title: "A neutral line right before the button",
      caption: (
        <>
          <em>Subscribe</em> is off, and the line just before it says why. Type an address and leave the field: the line
          becomes "Still needed: accept the terms." Try "anna@" instead, and the line asks you to check the address
          while the field shows its own error. With a good address and the box ticked, the line goes and{" "}
          <em>Subscribe</em> works. The form fits on one screen, so ACT-004 does not apply.
        </>
      ),
      Demo: () => <Newsletter explain />,
    },
    {
      kind: "dont",
      title: "Greyed out with nothing near it",
      caption: (
        <>
          <em>Subscribe</em> is faded and nothing says why. Guess what is missing, then try "anna@": the field shows its
          error when you leave it, but nothing at the button tells you what is still needed.
        </>
      ),
      Demo: () => <Newsletter explain={false} />,
    },
  ],
};
