import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { useRef, useState, type FormEvent } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * FRM-005: one marker per status, in the label, explained before the first
 * marked field. Name, Phone and Email must be filled in; Best time to call
 * may be left empty. No field shows an error before the form is sent.
 */

type Key = "name" | "phone" | "email";
const errorsFor: Record<Key, string> = {
  name: "Enter your name.",
  phone: "Enter a phone number we can call.",
  email: "Enter your email address.",
};

function useCallRequest() {
  const [values, setValues] = useState({
    name: "",
    phone: "",
    email: "",
    time: "",
  });
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({});
  const [said, setSaid] = useState("");
  const refs = {
    name: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
  };

  const set = (k: keyof typeof values) => (v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k as Key] && v.trim()) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    setSaid("");
    const next: Partial<Record<Key, string>> = {};
    for (const k of ["name", "phone", "email"] as Key[]) if (!values[k].trim()) next[k] = errorsFor[k];
    setErrors(next);
    const first = (["name", "phone", "email"] as Key[]).find((k) => next[k]);
    if (first) refs[first].current?.focus();
    else setSaid(`Thank you. We will call ${values.phone.trim()}.`);
  };
  return { values, set, errors, said, refs, send };
}

const box = "grid w-full max-w-sm gap-4 rounded-lg border border-border bg-background p-4";

function OneMarker() {
  const f = useCallRequest();
  // The star is part of each label, so it is read with the field's name.
  const star = { required: true, mark: true, requiredText: "*" };
  return (
    <form noValidate onSubmit={f.send} className={box}>
      <h4 className="m-0 text-base font-semibold">Request a call back</h4>
      <p className="m-0 -mt-2 text-sm text-muted-foreground">Fields with * must be filled in.</p>
      <Field label="Name" {...star} error={f.errors.name} announce={false}>
        <Input
          ref={f.refs.name}
          autoComplete="name"
          value={f.values.name}
          onChange={(e) => f.set("name")(e.target.value)}
        />
      </Field>
      <Field label="Phone" {...star} error={f.errors.phone} announce={false}>
        <Input
          ref={f.refs.phone}
          type="tel"
          autoComplete="tel"
          value={f.values.phone}
          onChange={(e) => f.set("phone")(e.target.value)}
        />
      </Field>
      <Field label="Email" {...star} error={f.errors.email} announce={false}>
        <Input
          ref={f.refs.email}
          type="email"
          autoComplete="email"
          value={f.values.email}
          onChange={(e) => f.set("email")(e.target.value)}
        />
      </Field>
      <Field label="Best time to call">
        <Input value={f.values.time} onChange={(e) => f.set("time")(e.target.value)} />
      </Field>
      <div>
        <Button type="submit">Request call</Button>
      </div>
      <Outcome>{f.said}</Outcome>
    </form>
  );
}

function MixedMarkers() {
  const f = useCallRequest();
  return (
    <form noValidate onSubmit={f.send} className={box}>
      <h4 className="m-0 text-base font-semibold">Request a call back</h4>
      <Field label="Name" required mark requiredText="*" error={f.errors.name} announce={false}>
        <Input
          ref={f.refs.name}
          autoComplete="name"
          value={f.values.name}
          onChange={(e) => f.set("name")(e.target.value)}
        />
      </Field>
      <Field label="Phone" required mark error={f.errors.phone} announce={false}>
        <Input
          ref={f.refs.phone}
          type="tel"
          autoComplete="tel"
          value={f.values.phone}
          onChange={(e) => f.set("phone")(e.target.value)}
        />
      </Field>
      {/* Required, but nothing says so. */}
      <Field label="Email" error={f.errors.email} announce={false}>
        <Input
          ref={f.refs.email}
          type="email"
          autoComplete="email"
          value={f.values.email}
          onChange={(e) => f.set("email")(e.target.value)}
        />
      </Field>
      <Field label="Best time to call">
        <Input value={f.values.time} onChange={(e) => f.set("time")(e.target.value)} />
      </Field>
      <div>
        <Button type="submit">Request call</Button>
      </div>
      <p className="m-0 text-xs text-muted-foreground">* required</p>
      <Outcome>{f.said}</Outcome>
    </form>
  );
}

export const FRM005: RuleExamples = {
  id: "FRM-005",
  examples: [
    {
      kind: "do",
      title: "One marker, explained at the top",
      caption: (
        <>
          Every field that must be filled in has a star in its label, and the line above the first field says what the
          star means. <em>Best time to call</em> has none, so it can be left empty. No field shows an error until you
          press <em>Request call</em>.
        </>
      ),
      Demo: OneMarker,
    },
    {
      kind: "dont",
      title: "Mixed markers, explained at the end",
      caption: (
        <>
          <em>Name</em> has a star, <em>Phone</em> says “(required)” and <em>Email</em> has nothing, though it must be
          filled in too. The star is explained only under the button. Fill in name and phone and send: the error on{" "}
          <em>Email</em> is the first sign that it was needed.
        </>
      ),
      Demo: MixedMarkers,
    },
  ],
};
