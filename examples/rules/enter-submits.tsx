import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { useState, type FormEvent } from "react";

import { Outcome } from "./dialog";

/*
 * Helpers for FRM-015. Each scene shows what pressing Enter in a field really
 * did: a polite line says what was sent, and a tally counts the sends, so
 * "nothing happened" can be seen as well as "something happened".
 *
 * Invite: a field and a send button in a real form.
 * SignIn: a password field with a show-password helper beside it, typed as a
 * plain button. FRM-015.tsx writes out the Don't versions itself.
 *
 * For the examples only. They are not components of the system.
 */

export function Tally({ label, n, onReset }: { label: string; n: number; onReset: () => void }) {
  return (
    <p className="m-0 flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
      <span>
        {label}: <strong className="tabular-nums">{n}</strong>
      </span>
      <Button variant="ghost" size="sm" onClick={onReset}>
        Start again
      </Button>
    </p>
  );
}

export const card = "grid w-full max-w-sm gap-3 rounded-lg border border-border bg-background p-4";

/** An invite box: *Email address* and *Send invite*, in a real form. */
export function Invite() {
  const [email, setEmail] = useState("sam@example.com");
  const [sent, setSent] = useState(0);
  const [said, setSaid] = useState("");

  const send = () => {
    setSent((n) => n + 1);
    setSaid(`Invite sent to ${email}.`);
  };
  const reset = () => {
    setSent(0);
    setSaid("");
    setEmail("sam@example.com");
  };

  return (
    <div className={card}>
      <h4 className="m-0 text-base font-semibold">Invite a teammate</h4>
      <form
        noValidate
        className="grid gap-3"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          send();
        }}
      >
        <Field label="Email address">
          <Input type="email" value={email} autoComplete="off" onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <div>
          <Button type="submit">Send invite</Button>
        </div>
      </form>
      <Outcome>{said}</Outcome>
      <Tally label="Invites sent" n={sent} onReset={reset} />
    </div>
  );
}

/** A sign-in form with a show-password helper. */
export function SignIn() {
  const [shown, setShown] = useState(false);
  const [signedIn, setSignedIn] = useState(0);
  const [said, setSaid] = useState("");

  const reset = () => {
    setShown(false);
    setSignedIn(0);
    setSaid("");
  };

  const toggle = () => {
    setShown((s) => !s);
    setSaid(shown ? "Password hidden." : "Password shown.");
  };

  const helperLabel = shown ? "Hide password" : "Show password";

  return (
    <div className={card}>
      <h4 className="m-0 text-base font-semibold">Sign in</h4>
      <form
        noValidate
        className="grid gap-3"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          setSignedIn((n) => n + 1);
          setSaid("Signed in as maja@example.com.");
        }}
      >
        <Field label="Email address">
          <Input type="email" defaultValue="maja@example.com" autoComplete="username" />
        </Field>
        <Field label="Password">
          <Input type={shown ? "text" : "password"} defaultValue="tulip-garden-7" autoComplete="current-password" />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          {/* Before the main button in the code. Without a type it is a submit button. */}
          <Button variant="outline" size="sm" onClick={toggle}>
            {helperLabel}
          </Button>
          <Button type="submit">Sign in</Button>
        </div>
      </form>
      <Outcome>{said}</Outcome>
      <Tally label="Sign-ins" n={signedIn} onReset={reset} />
    </div>
  );
}
