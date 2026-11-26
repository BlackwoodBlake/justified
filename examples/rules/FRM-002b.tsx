import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { useState } from "react";

import type { RuleExamples } from "./frame";

/* FRM-002b: a new error appears when the person leaves the field, never while they type. */

const valid = (v: string) => /^\d{5}$/.test(v.replace(/\s/g, ""));

function Address() {
  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("");
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState<string | undefined>();
  // The same words in Do and Don't, so the only difference is when they appear.
  const message = "Enter a five-digit postcode, for example 11359.";

  return (
    <div className="grid w-full max-w-sm gap-4 rounded-lg border border-border bg-background p-4">
      <Field label="Postcode" error={error}>
        <Input
          inputMode="numeric"
          autoComplete="postal-code"
          value={postcode}
          onChange={(e) => {
            const v = e.target.value;
            setPostcode(v);
            setChanged(true);
            // A shown error is rechecked on every change and goes as soon as the value is right. A new one never appears here.
            if (error && valid(v)) setError(undefined);
          }}
          onBlur={() => {
            if (changed) setError(valid(postcode) ? undefined : message);
          }}
        />
      </Field>
      <Field label="City">
        <Input autoComplete="address-level2" value={city} onChange={(e) => setCity(e.target.value)} />
      </Field>
    </div>
  );
}

function EagerAddress() {
  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | undefined>();
  const message = "Enter a five-digit postcode, for example 11359.";

  return (
    <div className="grid w-full max-w-sm gap-4 rounded-lg border border-border bg-background p-4">
      <Field label="Postcode" error={error}>
        <Input
          inputMode="numeric"
          autoComplete="postal-code"
          value={postcode}
          onChange={(e) => {
            const v = e.target.value;
            setPostcode(v);
            setError(valid(v) ? undefined : message);
          }}
        />
      </Field>
      <Field label="City">
        <Input autoComplete="address-level2" value={city} onChange={(e) => setCity(e.target.value)} />
      </Field>
    </div>
  );
}

export const FRM002b: RuleExamples = {
  id: "FRM-002b",
  examples: [
    {
      kind: "do",
      title: "Checked when the person moves on",
      caption: (
        <>
          Type 1135 in <em>Postcode</em>. Nothing happens until you move to <em>City</em>. Go back and add the 9: the error
          goes on that key press, and a screen reader hears that it is fixed.
        </>
      ),
      Demo: Address,
    },
    {
      kind: "dont",
      title: "Checked on every key press",
      caption: (
        <>
          The error appears on the first digit, before the person could possibly be done, and stays until the fifth.
        </>
      ),
      notLinted: "Lint gap: only react-hook-form modes are checked; a check run from an onChange handler is left to review.",
      Demo: EagerAddress,
    },
  ],
};
