import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field, FieldSet } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { RadioGroup, RadioGroupItem } from "@blackwoodblake/justified-shadcn/radio-group";
import { Textarea } from "@blackwoodblake/justified-shadcn/textarea";
import { useRef, useState, type FormEvent } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * FRM-009: within one process, a value the person already gave is offered
 * again, never asked for a second time. The person is reporting a second
 * fault in a rented flat, after giving a phone number for the first.
 */

const number = "07700 900123";
const phoneError = "Enter a phone number we can call about this fault.";

function FirstFault() {
  return (
    <div className="w-full rounded-lg border border-border bg-muted p-3 text-sm">
      <p className="m-0 font-medium">Fault 1: the kitchen tap drips</p>
      <p className="m-0 mt-1 text-muted-foreground">We will call {number} to book a visit.</p>
    </div>
  );
}

const box = "grid w-full gap-4 rounded-lg border border-border bg-background p-4";

function useFault() {
  const [what, setWhat] = useState("The bathroom fan does not start.");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [said, setSaid] = useState("");
  const phoneRef = useRef<HTMLInputElement>(null);
  return {
    what,
    setWhat,
    phone,
    setPhone,
    error,
    setError,
    said,
    setSaid,
    phoneRef,
  };
}

function Offered() {
  const f = useFault();
  const [which, setWhich] = useState("same");

  const send = (e: FormEvent) => {
    e.preventDefault();
    f.setSaid("");
    const to = which === "same" ? number : f.phone.trim();
    if (!to) {
      f.setError(phoneError);
      f.phoneRef.current?.focus();
      return;
    }
    f.setSaid(`Fault 2 sent. We will call ${to}.`);
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <FirstFault />
      <form noValidate onSubmit={send} className={box}>
        <h4 className="m-0 text-base font-semibold">Fault 2</h4>
        <Field label="What is wrong?">
          <Textarea rows={2} value={f.what} onChange={(e) => f.setWhat(e.target.value)} />
        </Field>
        <FieldSet legend="Which number should we call?">
          <RadioGroup
            value={which}
            onValueChange={(v) => {
              setWhich(v);
              // A field that comes back starts fresh, with no error from an earlier send.
              f.setError(undefined);
            }}
          >
            <Field layout="inline" label={`The same number, ${number}`}>
              <RadioGroupItem value="same" />
            </Field>
            <Field layout="inline" label="A different number">
              <RadioGroupItem value="other" />
            </Field>
          </RadioGroup>
        </FieldSet>
        {which === "other" && (
          <Field label="Phone number" error={f.error} announce={false}>
            <Input
              ref={f.phoneRef}
              type="tel"
              autoComplete="tel"
              value={f.phone}
              onChange={(e) => {
                f.setPhone(e.target.value);
                if (f.error && e.target.value.trim()) f.setError(undefined);
              }}
            />
          </Field>
        )}
        <div>
          <Button type="submit">Send fault report</Button>
        </div>
        <Outcome>{f.said}</Outcome>
      </form>
    </div>
  );
}

function AskedAgain() {
  const f = useFault();

  const send = (e: FormEvent) => {
    e.preventDefault();
    f.setSaid("");
    if (!f.phone.trim()) {
      f.setError(phoneError);
      f.phoneRef.current?.focus();
      return;
    }
    f.setSaid(`Fault 2 sent. We will call ${f.phone.trim()}.`);
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <FirstFault />
      <form noValidate onSubmit={send} className={box}>
        <h4 className="m-0 text-base font-semibold">Fault 2</h4>
        <Field label="What is wrong?">
          <Textarea rows={2} value={f.what} onChange={(e) => f.setWhat(e.target.value)} />
        </Field>
        <Field label="Phone number" hint="The number we can call about this fault." error={f.error} announce={false}>
          <Input
            ref={f.phoneRef}
            type="tel"
            autoComplete="tel"
            value={f.phone}
            onChange={(e) => {
              f.setPhone(e.target.value);
              if (f.error && e.target.value.trim()) f.setError(undefined);
            }}
          />
        </Field>
        <div>
          <Button type="submit">Send fault report</Button>
        </div>
        <Outcome>{f.said}</Outcome>
      </form>
    </div>
  );
}

export const FRM009: RuleExamples = {
  id: "FRM-009",
  examples: [
    {
      kind: "do",
      title: "The number given before, offered as a choice",
      caption: (
        <>
          The person gave a phone number for the first fault. For the second, that number is a choice they can see and
          keep with no typing, and <em>A different number</em> opens a field if they need one.
        </>
      ),
      Demo: Offered,
    },
    {
      kind: "dont",
      title: "An empty field for the same number",
      caption: (
        <>
          The service already has the number from a minute ago, and still asks for it in an empty field. The person
          types it again, and may get a digit wrong this time.
        </>
      ),
      Demo: AskedAgain,
    },
  ],
};
