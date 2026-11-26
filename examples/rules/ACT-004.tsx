import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * ACT-004: on a form taller than one screen, the submit button stays
 * enabled. What the press then shows is FRM-002b, and where focus goes is
 * the guideline FRM-011; the Do follows both.
 *
 * A sign-up form of seven required fields, all filled in except Phone.
 * In the Do, Create account is enabled; a press shows the error at Phone and
 * moves focus there. In the Don't, the button is off until every field is
 * filled, with ACT-005's note before it, so only ACT-004 is broken.
 *
 * Both follow FRM-002b: an error shows when the person leaves a field they
 * changed, or on sending, and goes on the key press that fixes it.
 */

type Key = "first" | "last" | "email" | "phone" | "street" | "postcode" | "city";
const order: Key[] = ["first", "last", "email", "phone", "street", "postcode", "city"];

const fields: Record<
  Key,
  { label: string; autoComplete: string; type?: string; inputMode?: "numeric"; empty: string; needed: string }
> = {
  first: { label: "First name", autoComplete: "given-name", empty: "Enter your first name.", needed: "first name" },
  last: { label: "Last name", autoComplete: "family-name", empty: "Enter your last name.", needed: "last name" },
  email: {
    label: "Email",
    autoComplete: "email",
    type: "email",
    empty: "Enter your email address.",
    needed: "email address",
  },
  phone: {
    label: "Phone",
    autoComplete: "tel",
    type: "tel",
    empty: "Enter your phone number.",
    needed: "phone number",
  },
  street: {
    label: "Street address",
    autoComplete: "address-line1",
    empty: "Enter your street address.",
    needed: "street address",
  },
  postcode: {
    label: "Postcode",
    autoComplete: "postal-code",
    inputMode: "numeric",
    empty: "Enter your postcode.",
    needed: "postcode",
  },
  city: { label: "City", autoComplete: "address-level2", empty: "Enter your city.", needed: "city" },
};

const start: Record<Key, string> = {
  first: "Anna",
  last: "Brooks",
  email: "anna.brooks@example.com",
  phone: "",
  street: "4 Mill Lane",
  postcode: "11359",
  city: "Northbridge",
};

const badEmail = "Enter a full email address, like anna@example.com.";

function problem(k: Key, v: string) {
  if (!v.trim()) return fields[k].empty;
  if (k === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return badEmail;
  return undefined;
}

function useSignUp() {
  const [values, setValues] = useState(start);
  // What the note and the button go by: updated when a field is left, not on every key press (ACT-005).
  const [left, setLeft] = useState(start);
  const [changed, setChanged] = useState<Partial<Record<Key, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({});
  // After a send that moves focus to a field, its error is read with the field, so the region stays quiet.
  const [sent, setSent] = useState(false);
  const [said, setSaid] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const inputs = useRef<Partial<Record<Key, HTMLInputElement | null>>>({});

  const missing = order.filter((k) => problem(k, left[k]));

  const change = (k: Key, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    setChanged((c) => ({ ...c, [k]: true }));
    setSent(false);
    setSaid("");
    if (errors[k] && !problem(k, v)) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const leave = (k: Key) => {
    setLeft((s) => ({ ...s, [k]: values[k] }));
    if (changed[k]) setErrors((e) => ({ ...e, [k]: problem(k, values[k]) }));
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    setSaid("");
    const next: Partial<Record<Key, string>> = {};
    for (const k of order) next[k] = problem(k, values[k]);
    setErrors(next);
    const first = order.find((k) => next[k]);
    if (first) {
      setSent(document.activeElement !== inputs.current[first]);
      inputs.current[first]?.focus();
      return;
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaid(`Account created for ${values.first.trim()} ${values.last.trim()}.`), 50);
  };

  const note =
    missing.length === 0
      ? ""
      : `Still needed: ${missing.map((k) => (problem(k, left[k]) === badEmail ? "a valid email address" : fields[k].needed)).join(", ")}.`;

  // What an Input needs to be one of the form's fields.
  const bind = (k: Key) => ({
    ref: (el: HTMLInputElement | null) => {
      inputs.current[k] = el;
    },
    type: fields[k].type,
    inputMode: fields[k].inputMode,
    autoComplete: fields[k].autoComplete,
    value: values[k],
    onChange: (e: ChangeEvent<HTMLInputElement>) => change(k, e.target.value),
    onBlur: () => leave(k),
  });

  return { errors, sent, said, missing, note, send, bind };
}

function Do() {
  const { errors, sent, said, send, bind } = useSignUp();
  return (
    <form
      noValidate
      onSubmit={send}
      className="grid w-full max-w-sm gap-4 rounded-lg border border-border bg-background p-4"
    >
      <h4 className="m-0 text-base font-semibold">Create your account</h4>
      <p className="m-0 -mt-2 text-sm text-muted-foreground">Fields with * must be filled in.</p>
      {order.map((k) => (
        <Field key={k} label={fields[k].label} required mark requiredText="*" error={errors[k]} announce={!sent}>
          <Input {...bind(k)} />
        </Field>
      ))}
      <div>
        <Button type="submit">Create account</Button>
      </div>
      <Outcome>{said}</Outcome>
    </form>
  );
}

function Dont() {
  const { errors, sent, said, missing, note, send, bind } = useSignUp();
  const isValid = missing.length === 0;
  return (
    <form
      noValidate
      onSubmit={send}
      className="grid w-full max-w-sm gap-4 rounded-lg border border-border bg-background p-4"
    >
      <h4 className="m-0 text-base font-semibold">Create your account</h4>
      <p className="m-0 -mt-2 text-sm text-muted-foreground">Fields with * must be filled in.</p>
      <Field label="First name" required mark requiredText="*" error={errors.first} announce={!sent}>
        <Input {...bind("first")} />
      </Field>
      <Field label="Last name" required mark requiredText="*" error={errors.last} announce={!sent}>
        <Input {...bind("last")} />
      </Field>
      <Field label="Email" required mark requiredText="*" error={errors.email} announce={!sent}>
        <Input {...bind("email")} />
      </Field>
      <Field label="Phone" required mark requiredText="*" error={errors.phone} announce={!sent}>
        <Input {...bind("phone")} />
      </Field>
      <Field label="Street address" required mark requiredText="*" error={errors.street} announce={!sent}>
        <Input {...bind("street")} />
      </Field>
      <Field label="Postcode" required mark requiredText="*" error={errors.postcode} announce={!sent}>
        <Input {...bind("postcode")} />
      </Field>
      <Field label="City" required mark requiredText="*" error={errors.city} announce={!sent}>
        <Input {...bind("city")} />
      </Field>
      <p role="status" className="m-0 min-h-5 text-sm text-foreground">
        {note}
      </p>
      <div>
        <Button type="submit" disabled={!isValid}>
          Create account
        </Button>
      </div>
      <Outcome>{said}</Outcome>
    </form>
  );
}

export const ACT004: RuleExamples = {
  id: "ACT-004",
  examples: [
    {
      kind: "do",
      title: "The button stays on, so a press can find the problem",
      caption: (
        <>
          This form is taller than a phone screen. <em>Phone</em> is empty, and <em>Create account</em> is still
          enabled. Press it: <em>Phone</em> shows "Enter your phone number." and focus moves to it, scrolling it into
          view, as FRM-011 describes. Type a number and the error goes. Press again to create the account.
        </>
      ),
      Demo: Do,
    },
    {
      kind: "dont",
      title: "The button is off until every field is filled",
      caption: (
        <>
          <em>Create account</em> stays greyed out while <em>Phone</em>, far above it, is empty. The note says what is
          missing, but on a phone the person has to scroll back up to find the field. Nothing takes them there, and no
          message sits at <em>Phone</em>.
        </>
      ),
      Demo: Dont,
    },
  ],
};
