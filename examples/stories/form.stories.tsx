import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Checkbox } from "@blackwoodblake/justified-shadcn/checkbox";
import { Field, FieldSet } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { NativeSelect } from "@blackwoodblake/justified-shadcn/native-select";
import { RadioGroup, RadioGroupItem } from "@blackwoodblake/justified-shadcn/radio-group";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState, type FormEvent } from "react";

/*
 * A whole form built from the components.
 *
 *   - A field the reader has changed is checked when they leave it.
 *   - Sending the form checks every field, shows each error at its field
 *     and moves focus to the first one, so the button never needs to be
 *     disabled.
 *   - While the reader types, a shown error goes away as soon as the field
 *     is right, but a new error never appears mid-word.
 *
 * This is the behaviour the form rules are being tried on; the rule pages
 * hold the verdicts.
 */
const meta = {
  title: "Components/Form",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Values = { name: string; email: string; plan: string; country: string; terms: boolean };
type Errors = Partial<Record<keyof Values, string>>;

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Enter your full name.";
  if (!v.email.trim()) e.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = "Enter an email address with an @, like name@example.com.";
  if (!v.plan) e.plan = "Choose a plan.";
  if (!v.country) e.country = "Choose your country.";
  if (!v.terms) e.terms = "Accept the terms to create an account.";
  return e;
}

const ORDER: (keyof Values)[] = ["name", "email", "plan", "country", "terms"];

function SignUp() {
  const [values, setValues] = useState<Values>({ name: "", email: "", plan: "", country: "", terms: false });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const result = useRef<HTMLHeadingElement>(null);

  const [changed, setChanged] = useState<Set<keyof Values>>(new Set());
  // After sending, focus moves to the first error, which reads it out; stay quiet until the next change.
  const [quiet, setQuiet] = useState(false);

  /** Typing: remember the field was changed, and clear its error once it is right. Never add one. */
  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    const next = { ...values, [key]: value };
    setValues(next);
    setChanged((c) => new Set(c).add(key));
    setQuiet(false);
    if (errors[key] && !validate(next)[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  /** Leaving a field: check it if the reader changed it, or once the form has been sent. */
  const recheck = (key: keyof Values) => {
    if (!sent && !changed.has(key)) return;
    setQuiet(false);
    setErrors((e) => ({ ...e, [key]: validate(values)[key] }));
  };

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSent(true);
    setQuiet(true);
    const found = validate(values);
    setErrors(found);
    const first = ORDER.find((k) => found[k]);
    if (first) {
      form.current?.querySelector<HTMLElement>(`[data-field="${first}"] :is(input, select, button[role])`)?.focus();
      return;
    }
    setDone(true);
  }

  // The form and the button that had focus are gone, so focus moves to the result,
  // which reads it out. A live region added together with its text may stay silent.
  useEffect(() => {
    if (done) result.current?.focus();
  }, [done]);

  if (done) {
    return (
      <div className="flex max-w-md flex-col gap-2">
        <h2 ref={result} tabIndex={-1} className="text-xl font-semibold outline-none">
          Account created
        </h2>
        <p className="text-muted-foreground">We have sent a confirmation to {values.email}.</p>
      </div>
    );
  }

  return (
    <form ref={form} noValidate onSubmit={onSubmit} className="flex max-w-md flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Create an account</h2>
        <p className="text-sm text-muted-foreground">All fields are required.</p>
      </div>

      <div data-field="name">
        <Field label="Full name" required announce={!quiet} error={errors.name}>
          <Input autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} onBlur={() => recheck("name")} />
        </Field>
      </div>

      <div data-field="email">
        <Field label="Email address" required announce={!quiet} hint="We send the receipt here." error={errors.email}>
          <Input
            type="email"
            autoComplete="email"
            spellCheck={false}
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => recheck("email")}
          />
        </Field>
      </div>

      <div data-field="plan">
        <FieldSet legend="Plan" required announce={!quiet} error={errors.plan}>
          <RadioGroup value={values.plan} onValueChange={(v) => set("plan", v)}>
            <Field layout="inline" label="Personal" hint="One person, free">
              <RadioGroupItem value="personal" />
            </Field>
            <Field layout="inline" label="Team" hint="Up to ten people, €12 a month">
              <RadioGroupItem value="team" />
            </Field>
          </RadioGroup>
        </FieldSet>
      </div>

      <div data-field="country">
        <Field label="Country" required announce={!quiet} error={errors.country}>
          <NativeSelect
            autoComplete="country-name"
            value={values.country}
            onChange={(e) => set("country", e.target.value)}
            onBlur={() => recheck("country")}
          >
            <option value="" disabled>
              Choose a country
            </option>
            <option>Denmark</option>
            <option>Finland</option>
            <option>Norway</option>
            <option>Sweden</option>
          </NativeSelect>
        </Field>
      </div>

      <div data-field="terms">
        <Field layout="inline" label="I accept the terms" required announce={!quiet} error={errors.terms}>
          <Checkbox checked={values.terms} onCheckedChange={(v) => set("terms", v === true)} />
        </Field>
      </div>

      <div className="flex gap-3">
        <Button type="submit">Create account</Button>
        <Button variant="ghost" type="reset" onClick={() => {
          setValues({ name: "", email: "", plan: "", country: "", terms: false });
          setErrors({});
          setChanged(new Set());
          setSent(false);
        }}>
          Clear
        </Button>
      </div>
    </form>
  );
}

export const SignUpForm: Story = {
  name: "Sign-up form",
  render: () => <SignUp />,
};
