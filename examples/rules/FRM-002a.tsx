import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { useRef, useState, type FormEvent } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * FRM-002a: an error is shown as text at the field it belongs to.
 * Both examples open as the server sent the form back: the address is
 * already registered. Change it and press Create account to try again.
 */

const taken = "anna.berg@example.com";
const message = "This email address already has an account. Sign in or use a different address.";

function useSignUp() {
  const [name, setName] = useState("Anna Berg");
  const [email, setEmail] = useState(taken);
  const [error, setError] = useState<string | undefined>(message);
  const [said, setSaid] = useState("");
  // After a send that moves focus to the field, its error is read with the field, so the region stays quiet.
  const [sent, setSent] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  const send = (e: FormEvent) => {
    e.preventDefault();
    setSaid("");
    // The server says no: focus moves to the field, so the person hears the error with it.
    if (email.trim().toLowerCase() === taken) {
      setError(message);
      setSent(document.activeElement !== emailRef.current);
      emailRef.current?.focus();
    } else {
      setError(undefined);
      setSaid(`Account created for ${email.trim()}.`);
    }
  };
  return {
    name,
    setName,
    email,
    setEmail,
    error,
    setError,
    said,
    send,
    sent,
    setSent,
    emailRef,
  };
}

const box = "grid w-full max-w-sm gap-4 rounded-lg border border-border bg-background p-4";

function AtTheField() {
  const s = useSignUp();
  return (
    <form noValidate onSubmit={s.send} className={box}>
      <Field label="Full name">
        <Input autoComplete="name" value={s.name} onChange={(e) => s.setName(e.target.value)} />
      </Field>
      <Field label="Email address" error={s.error} announce={!s.sent}>
        <Input
          ref={s.emailRef}
          type="email"
          autoComplete="email"
          value={s.email}
          onChange={(e) => {
            s.setEmail(e.target.value);
            s.setSent(false);
            // The message goes once the address is no longer the one the server turned down.
            if (s.error && e.target.value.trim().toLowerCase() !== taken) s.setError(undefined);
          }}
        />
      </Field>
      <div>
        <Button type="submit">Create account</Button>
      </div>
      <Outcome>{s.said}</Outcome>
    </form>
  );
}

function BannerOnly() {
  const s = useSignUp();
  return (
    <form noValidate onSubmit={s.send} className={box}>
      {s.error && (
        <p className="m-0 flex items-start gap-2 rounded-md border border-destructive p-3 text-sm font-medium text-destructive">
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 4.5v4M8 11.2v.1" />
          </svg>
          The form contains errors.
        </p>
      )}
      <Field label="Full name">
        <Input autoComplete="name" value={s.name} onChange={(e) => s.setName(e.target.value)} />
      </Field>
      <Field label="Email address">
        <Input
          type="email"
          autoComplete="email"
          aria-invalid={s.error ? true : undefined}
          value={s.email}
          onChange={(e) => {
            s.setEmail(e.target.value);
            if (s.error && e.target.value.trim().toLowerCase() !== taken) s.setError(undefined);
          }}
        />
      </Field>
      <div>
        <Button type="submit">Create account</Button>
      </div>
      <Outcome>{s.said}</Outcome>
    </form>
  );
}

export const FRM002a: RuleExamples = {
  id: "FRM-002a",
  examples: [
    {
      kind: "do",
      title: "The error at the field",
      caption: (
        <>
          The server sent the form back. The message sits at <em>Email address</em>, says what is wrong and what to do,
          and is read out with the field. Change the address and press <em>Create account</em>.
        </>
      ),
      Demo: AtTheField,
    },
    {
      kind: "dont",
      title: "A banner and a red outline",
      caption: (
        <>
          The banner says something is wrong but not what, and the red outline does not say it either. A screen reader
          moving to the field hears only that it is invalid, not why.
        </>
      ),
      Demo: BannerOnly,
    },
  ],
};
