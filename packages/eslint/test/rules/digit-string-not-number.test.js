import rule from "../../rules/digit-string-not-number.js";
import { run } from "../helpers.js";

run("digit-string-not-number", rule, {
  valid: [
    // The Do: digit strings in text inputs.
    `export const Pay = () => (
      <form noValidate>
        <Field label="Membership number"><Input inputMode="numeric" /></Field>
        <Field label="Card number"><Input autoComplete="cc-number" inputMode="numeric" /></Field>
        <Field label="Sign-in code"><Input autoComplete="one-time-code" inputMode="numeric" /></Field>
        <Field label="Mobile number"><Input type="tel" autoComplete="tel" /></Field>
      </form>
    );`,
    // Quantities are outside the guideline.
    `export const Booking = () => <Field label="Tables"><Input type="number" min={1} defaultValue={1} /></Field>;`,
    `export const Q = () => (<div><Label htmlFor="qty">Quantity</Label><Input id="qty" type="number" /></div>);`,
    `export const Y = () => <Field label="Year of birth"><Input type="number" autoComplete="bday-year" /></Field>;`,
    `export const C = () => <Field label="Number of codes"><Input type="number" /></Field>;`,
    `export const A = () => <Field label="Amount"><Input type="number" step="0.01" /></Field>;`,
    // Names and placeholders are not labels.
    `export const P = () => <Input type="number" name="pin" placeholder="Order number" />;`,
    // Computed values.
    `export const T = ({ type }) => <Field label="Card number"><Input type={type} /></Field>;`,
    `export const L = ({ label }) => <Field label={label}><Input type="number" /></Field>;`,
  ],
  invalid: [
    // The Don'ts, with the values written out.
    {
      code: `export const Codes = () => (
        <form noValidate>
          <Field label="Membership number"><Input type="number" /></Field>
          <Field label="Card number"><Input type="number" autoComplete="cc-number" /></Field>
          <Field label="Account number"><Input type="number" /></Field>
        </form>
      );`,
      errors: [{ messageId: "numberType" }, { messageId: "numberType" }, { messageId: "numberType" }],
    },
    {
      code: `export const Hidden = () => (
        <Field label="Sign-in code">
          <Input type="number" autoComplete="one-time-code" className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
        </Field>
      );`,
      errors: [{ messageId: "numberType" }],
    },
    { code: `export const P = () => <input type="number" autoComplete="shipping postal-code" />;`, errors: [{ messageId: "numberType" }] },
    { code: `export const P = () => <Input type="number" autoComplete="tel-national" />;`, errors: [{ messageId: "numberType" }] },
    { code: `export const P = () => <Input type="number" aria-label="PIN" />;`, errors: [{ messageId: "numberType" }] },
    {
      code: `export const P = () => (<div><Label htmlFor="pc">Postcode</Label><Input id="pc" type="number" /></div>);`,
      errors: [{ messageId: "numberType" }],
    },
    {
      code: `export function F({ form }) {
        return (
          <FormField control={form.control} name="customer" render={({ field }) => (
            <FormItem><FormLabel>Customer number</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
          )} />
        );
      }`,
      errors: [{ messageId: "numberType" }],
    },
  ],
});
