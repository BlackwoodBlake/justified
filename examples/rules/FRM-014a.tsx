import { Probe, probeBox } from "./input-type";
import type { RuleExamples } from "./frame";

/*
 * FRM-014a: a text field that takes only digits shows the digit keypad
 * through inputmode. The keypad a phone would show is written under each field.
 */

const form = (children: React.ReactNode) => (
  <form noValidate onSubmit={(e) => e.preventDefault()} className={probeBox}>
    {children}
  </form>
);

export const FRM014a: RuleExamples = {
  id: "FRM-014a",
  examples: [
    {
      kind: "do",
      title: "Digit fields get the digit keypad",
      caption: (
        <>
          <em>Card number</em>, <em>Security code</em> and <em>Membership number</em> stay text fields with{" "}
          <code>inputMode=&quot;numeric&quot;</code>, so the leading zero in the membership number stays and a pasted
          or autofilled value goes in as before.
        </>
      ),
      Demo: () =>
        form(
          <>
            <Probe label="Card number" autoComplete="cc-number" inputMode="numeric" defaultValue="4111 1111 1111 1111" />
            <Probe label="Security code" autoComplete="cc-csc" inputMode="numeric" defaultValue="123" />
            <Probe label="Membership number" inputMode="numeric" defaultValue="0471826390" />
          </>,
        ),
    },
    {
      kind: "do",
      title: "Amounts with a decimal part, and values that can be negative",
      caption: (
        <>
          <em>Top-up amount</em> takes a decimal part, so it asks for the keypad with a decimal key. <em>Temperature
          change</em> can be negative, and some digit keypads have no minus sign, so it stays a plain text field.
        </>
      ),
      Demo: () =>
        form(
          <>
            <Probe label="Top-up amount in euros" inputMode="decimal" defaultValue="25,50" />
            <Probe label="Temperature change in degrees" defaultValue="-3" />
          </>,
        ),
    },
    {
      kind: "dont",
      title: "A phone type or a pattern for the keypad",
      caption: (
        <>
          <code>type=&quot;tel&quot;</code> gets digits, but tells the browser the card number is a phone number, which
          can bring the wrong autofill suggestions. A <code>pattern</code> alone is not a keypad setting you can rely on: most phones ignore it, as the
          readout says. On a form without <code>noValidate</code> it also starts the browser&apos;s own check when the
          form is sent.
        </>
      ),
      Demo: () =>
        form(
          <>
            <Probe label="Card number" type="tel" autoComplete="cc-number" defaultValue="4111 1111 1111 1111" />
            <Probe label="Membership number" pattern="[0-9]*" defaultValue="0471826390" />
          </>,
        ),
    },
    {
      kind: "dont",
      title: "A digit keypad for a value with letters",
      caption: (
        <>
          An order reference mixes letters and digits, and a digit keypad has no letter keys. The readout lists the
          keys the keypad lacks for this value. Edit the field to see it follow what you type.
        </>
      ),
      Demo: () => form(<Probe label="Order reference" inputMode="numeric" defaultValue="RX-20931" also="keys" />),
    },
  ],
};
