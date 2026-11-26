import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";

import type { RuleExamples } from "./frame";
import { Probe, probeBox } from "./input-type";

/*
 * FRM-014b: a string of digits that is not a quantity belongs in a text
 * input. The harm of a number input is made tryable on a desktop: the arrow
 * keys and the scroll wheel change the value, and the readout shows what the
 * form would receive.
 */

const form = (children: React.ReactNode) => (
  <form noValidate onSubmit={(e) => e.preventDefault()} className={probeBox}>
    {children}
  </form>
);

export const FRM014b: RuleExamples = {
  id: "FRM-014b",
  examples: [
    {
      kind: "dont",
      title: "Codes and numbers in a number input",
      caption: (
        <>
          The lines under each field show what the form gets and what it reads as a number. The membership number has lost its leading zero, the long
          card number its last digits, and the account number is in exponent form. Click <em>Membership number</em> and
          press the up arrow, or scroll over it: the value itself changes. Type a space or a dash there: the field
          shows something, but the form gets nothing.
        </>
      ),
      Demo: () =>
        form(
          <>
            <Probe label="Membership number" type="number" defaultValue="0471826390" also="number" />
            <Probe label="Card number" type="number" autoComplete="cc-number" defaultValue="4111111111111111111" also="number" />
            <Probe label="Account number" type="number" defaultValue="4111111111111111111111" also="number" />
          </>,
        ),
    },
    {
      kind: "dont",
      title: "The spinner hidden, the field still a number input",
      caption: (
        <>
          No spinner is drawn, so it looks like a text field. Press the up arrow in the field: the code still changes,
          and the leading zero still goes.
        </>
      ),
      Demo: () =>
        form(
          <Probe
            label="Sign-in code"
            type="number"
            autoComplete="one-time-code"
            defaultValue="048213"
            also="number"
            className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />,
        ),
    },
    {
      kind: "do",
      title: "Digit strings in text inputs",
      caption: (
        <>
          The same kinds of values in text inputs with <code>inputMode=&quot;numeric&quot;</code>. The arrow keys and the scroll
          wheel change nothing, spaces are allowed, and the value is checked as text, so the leading zero stays.
        </>
      ),
      Demo: () =>
        form(
          <>
            <Probe label="Membership number" inputMode="numeric" defaultValue="0471826390" also="text" digits={10} />
            <Probe label="Card number" autoComplete="cc-number" inputMode="numeric" defaultValue="4111 1111 1111 1111" also="text" digits={16} />
            <Probe label="Sign-in code" autoComplete="one-time-code" inputMode="numeric" defaultValue="048 213" also="text" digits={6} />
          </>,
        ),
    },
    {
      kind: "do",
      title: "A true small count may be a number input",
      caption: (
        <>
          <em>Tables</em> is a quantity that starts at 1, so a number input with step controls is allowed. The up arrow
          is what the person wants here. The guideline does not require it.
        </>
      ),
      Demo: () =>
        form(
          <Field label="Tables">
            <Input type="number" min={1} defaultValue={1} />
          </Field>,
        ),
    },
  ],
};
