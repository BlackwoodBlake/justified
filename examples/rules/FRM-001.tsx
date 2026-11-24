import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { useState } from "react";

import type { RuleExamples } from "./frame";

/* FRM-001: every control has a label people can see, and a placeholder never stands in for it. */

const box = "grid w-full max-w-sm gap-4 rounded-lg border border-border bg-background p-4";

function useBooking() {
  // One field starts filled in, so the difference shows before anyone types.
  const [name, setName] = useState("");
  const [guests, setGuests] = useState("4");
  const [time, setTime] = useState("");
  return { name, setName, guests, setGuests, time, setTime };
}

function Labelled() {
  const b = useBooking();
  return (
    <div className={box}>
      <Field label="Name for the booking">
        <Input autoComplete="name" value={b.name} onChange={(e) => b.setName(e.target.value)} />
      </Field>
      <Field label="Number of guests">
        <Input inputMode="numeric" value={b.guests} onChange={(e) => b.setGuests(e.target.value)} />
      </Field>
      <Field label="Preferred time" hint="For example 19:30. The last table is at 21:30.">
        <Input inputMode="numeric" value={b.time} onChange={(e) => b.setTime(e.target.value)} />
      </Field>
    </div>
  );
}

function PlaceholdersOnly() {
  const b = useBooking();
  return (
    <div className={box}>
      <Input
        placeholder="Name for the booking"
        autoComplete="name"
        value={b.name}
        onChange={(e) => b.setName(e.target.value)}
      />
      <Input
        placeholder="Number of guests"
        inputMode="numeric"
        value={b.guests}
        onChange={(e) => b.setGuests(e.target.value)}
      />
      <Input
        placeholder="Preferred time, e.g. 19:30"
        inputMode="numeric"
        value={b.time}
        onChange={(e) => b.setTime(e.target.value)}
      />
    </div>
  );
}

export const FRM001: RuleExamples = {
  id: "FRM-001",
  examples: [
    {
      kind: "do",
      title: "A label above every field",
      caption: (
        <>
          Each label sits above its field and stays there. <em>Number of guests</em> is already filled in, and you can
          still see what the 4 means. The time format is hint text under the label, not inside the field.
        </>
      ),
      Demo: Labelled,
    },
    {
      kind: "dont",
      title: "Placeholders instead of labels",
      caption: (
        <>
          The second field already holds 4, and nothing says what it is. Type a time in the third field and its format
          disappears just when you need it.
        </>
      ),
      Demo: PlaceholdersOnly,
    },
  ],
};
