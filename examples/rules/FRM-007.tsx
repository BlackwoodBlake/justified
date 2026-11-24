import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { NativeSelect } from "@blackwoodblake/justified-shadcn/native-select";
import { useState } from "react";

import type { RuleExamples } from "./frame";

/*
 * FRM-007: fields for the person's own details carry the exact
 * autocomplete value for their purpose. The value each field has is
 * written under it, since it cannot be seen otherwise.
 */

type Row = {
  label: string;
  key: string;
  value: string | undefined;
  type?: string;
};

const right: Row[] = [
  { label: "First name", key: "first", value: "given-name" },
  { label: "Last name", key: "last", value: "family-name" },
  { label: "Email", key: "email", value: "email", type: "email" },
  { label: "Postcode", key: "postcode", value: "postal-code" },
  { label: "City", key: "city", value: "address-level2" },
];

const wrong: Row[] = [
  { label: "First name", key: "first", value: "name" },
  { label: "Last name", key: "last", value: "off" },
  { label: "Email", key: "email", value: undefined, type: "email" },
  { label: "Postcode", key: "postcode", value: "zip" },
  { label: "City", key: "city", value: "off" },
];

function Attribute({ value }: { value: string | undefined }) {
  return (
    <p className="m-0 mt-1 font-mono text-xs text-muted-foreground">
      {value === undefined ? 'no autocomplete, only type="email"' : `autocomplete="${value}"`}
    </p>
  );
}

function Delivery({ rows, country }: { rows: Row[]; country: string | undefined }) {
  const [values, setValues] = useState<Record<string, string>>({});
  return (
    <form
      noValidate
      onSubmit={(e) => e.preventDefault()}
      className="grid w-full max-w-sm gap-3 rounded-lg border border-border bg-background p-4"
    >
      {rows.map((r) => (
        <div key={r.key}>
          <Field label={r.label}>
            <Input
              type={r.type}
              autoComplete={r.value}
              value={values[r.key] ?? ""}
              onChange={(e) => setValues((s) => ({ ...s, [r.key]: e.target.value }))}
            />
          </Field>
          <Attribute value={r.value} />
        </div>
      ))}
      <div>
        <Field label="Country">
          <NativeSelect autoComplete={country} defaultValue="Sweden">
            <option>Denmark</option>
            <option>Finland</option>
            <option>Norway</option>
            <option>Sweden</option>
          </NativeSelect>
        </Field>
        <Attribute value={country} />
      </div>
    </form>
  );
}

export const FRM007: RuleExamples = {
  id: "FRM-007",
  examples: [
    {
      kind: "do",
      title: "The exact value for each field",
      caption: (
        <>
          Each field tells the browser exactly what it holds. If your browser has your address saved, click in{" "}
          <em>First name</em>: it can offer to fill in all six fields at once, each with the right part.
        </>
      ),
      Demo: () => <Delivery rows={right} country="country-name" />,
    },
    {
      kind: "dont",
      title: "Off, missing or made up",
      caption: (
        <>
          <em>First name</em> claims the whole name, <code>zip</code> is not a value HTML knows, and the rest are turned
          off or missing. Browsers, password managers and tools that help people fill in forms get a wrong purpose or
          none.
        </>
      ),
      Demo: () => <Delivery rows={wrong} country="off" />,
    },
  ],
};
