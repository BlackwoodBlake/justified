import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { NativeSelect } from "@blackwoodblake/justified-shadcn/native-select";
import { useId, useRef, useState, type FormEvent } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * ACT-002a: at most one button in a group has the most emphasised style.
 *
 * Both examples are the same booking form with the same three buttons,
 * labels, order and outcomes. Only the style of Book and pay now differs.
 * Enter in a field books without paying, the same as Book appointment.
 */

const nameError = "Enter the name the booking should be in.";

function Booking({ payStyle }: { payStyle: "outline" | "default" }) {
  const [name, setName] = useState("Anna Brooks");
  const [time, setTime] = useState("Tuesday 9:30");
  const [error, setError] = useState<string | undefined>();
  // After a press that moves focus to the field, its error is read with the field, so the region stays quiet.
  // When focus is already in the field (Enter), nothing is read again, so the region must speak.
  const [sent, setSent] = useState(false);
  const [said, setSaid] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  // The person has changed Name, so leaving it may show an error (FRM-002b).
  const changed = useRef(false);
  const id = useId();

  const say = (s: string) => {
    setSaid("");
    setTimeout(() => setSaid(s), 50);
  };

  const book = (paid: boolean) => {
    if (!name.trim()) {
      setError(nameError);
      setSent(document.activeElement !== nameRef.current);
      setSaid("");
      nameRef.current?.focus();
      return;
    }
    setError(undefined);
    say(paid ? `Booked and paid for ${time}.` : `Booked for ${time}. Pay at the clinic.`);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    book(false);
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <form
        noValidate
        onSubmit={submit}
        aria-labelledby={id}
        className="grid w-full max-w-sm gap-4 rounded-lg border border-border bg-background p-4"
      >
        <h4 id={id} className="m-0 text-base font-semibold">
          Book an appointment
        </h4>
        <Field label="Name" error={error} announce={!sent}>
          <Input
            ref={nameRef}
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              changed.current = true;
              setSent(false);
              if (error && e.target.value.trim()) setError(undefined);
            }}
            onBlur={(e) => {
              setSent(false);
              if (changed.current && !e.target.value.trim()) setError(nameError);
            }}
          />
        </Field>
        <Field label="Time">
          <NativeSelect value={time} onChange={(e) => setTime(e.target.value)}>
            <option>Tuesday 9:30</option>
            <option>Tuesday 11:00</option>
            <option>Wednesday 14:15</option>
          </NativeSelect>
        </Field>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={() => say("Not booked. Nothing has changed.")}>
            Cancel
          </Button>
          <Button variant={payStyle} onClick={() => book(true)}>
            Book and pay now
          </Button>
          <Button type="submit">Book appointment</Button>
        </div>
      </form>
      <Outcome>{said}</Outcome>
    </div>
  );
}

function Do() {
  return <Booking payStyle="outline" />;
}

function Dont() {
  return <Booking payStyle="default" />;
}

export const ACT002a: RuleExamples = {
  id: "ACT-002a",
  examples: [
    {
      kind: "do",
      title: "One filled button in the row",
      caption: (
        <>
          Only <em>Book appointment</em> is filled, so the eye goes to it first. <em>Book and pay now</em> and{" "}
          <em>Cancel</em> are quieter but easy to find. Press any of them: the line below says what happened.
        </>
      ),
      Demo: Do,
    },
    {
      kind: "dont",
      title: "Two filled buttons side by side",
      caption: (
        <>
          <em>Book and pay now</em> and <em>Book appointment</em> are both filled. Neither stands out as the main
          action, so the person has to read and weigh both before choosing.
        </>
      ),
      Demo: Dont,
    },
  ],
};
