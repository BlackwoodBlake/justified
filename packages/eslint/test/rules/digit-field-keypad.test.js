import rule from "../../rules/digit-field-keypad.js";
import { run } from "../helpers.js";

/** A react-hook-form field bound to a Zod entry. */
const bound = (entry, input, label = "Code") => `
import { z } from "zod";
const schema = z.object({ code: ${entry} });
export function F({ form }) {
  return (
    <FormField control={form.control} name="code" render={({ field }) => (
      <FormItem><FormLabel>${label}</FormLabel><FormControl>${input}</FormControl></FormItem>
    )} />
  );
}`;

run("digit-field-keypad", rule, {
  valid: [
    // The Do: card fields with the keypad, decimal amounts, a value that can be negative.
    `export const Pay = () => (
      <form noValidate>
        <Field label="Card number"><Input autoComplete="cc-number" inputMode="numeric" /></Field>
        <Field label="Security code"><Input autoComplete="cc-csc" inputMode="numeric" /></Field>
        <Field label="Top-up amount in euros"><Input inputMode="decimal" /></Field>
        <Field label="Temperature change"><Input /></Field>
      </form>
    );`,
    bound("z.string().regex(/^\\d{6}$/)", `<Input inputMode="numeric" {...field} />`),
    bound("z.string().regex(/^\\d+([.,]\\d+)?$/)", `<Input inputMode="decimal" {...field} />`),
    // A pattern that allows a minus sign.
    bound("z.string().regex(/^-?\\d+$/)", `<Input {...field} />`, "Temperature change"),
    // Phone numbers get type tel from FRM-014, no inputMode of their own.
    bound("z.string().regex(/^\\d{10}$/)", `<Input {...field} />`, "Phone number"),
    `export const P = () => <Input autoComplete="tel" pattern="[0-9]*" />;`,
    `export const P2 = () => <Input type="tel" autoComplete="cc-number" />;`,
    // Number inputs are FRM-014b's check.
    `export const N = () => <Input type="number" autoComplete="cc-number" />;`,
    // A different keypad was chosen on purpose.
    `export const T = () => <Input autoComplete="cc-number" inputMode="tel" />;`,
    // Letters with the standard keyboard.
    bound("z.string().regex(/^[A-Z]{2}-\\d+$/)", `<Input {...field} />`, "Order reference"),
    // A spread that may set inputMode, and an entry the field is not bound to.
    `export const S = (props) => <Input autoComplete="cc-number" {...props} />;`,
    `import { z } from "zod";\nconst schema = z.object({ code: z.string().regex(/^\\d{6}$/) });\nexport const U = () => <Input />;`,
    // Two regexes we do not try to combine.
    bound("z.string().regex(/^\\d+$/).regex(/^.{6}$/)", `<Input {...field} />`),
    // A digits-only pattern that contradicts the placeholder (from shadcn's button-group example).
    `export const Amount = () => <Input placeholder="10.00" pattern="[0-9]*" />;`,
    // shadcn's InputOTP sets its own inputMode.
    `export const O = () => <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} />;`,
  ],
  invalid: [
    {
      code: `export const Pay = () => (
        <>
          <Field label="Card number"><Input autoComplete="cc-number" /></Field>
          <Field label="Security code"><Input type="text" autoComplete="billing cc-csc" /></Field>
        </>
      );`,
      errors: [{ messageId: "noNumeric" }, { messageId: "noNumeric" }],
    },
    { code: bound("z.string().regex(/^\\d{6}$/)", `<Input {...field} />`), errors: [{ messageId: "noNumeric" }] },
    {
      code: bound("z.string().trim().regex(/^[0-9]{10}$/, { message: 'Enter 10 digits' })", `<Input autoComplete="off" {...field} />`, "Membership number"),
      errors: [{ messageId: "noNumeric" }],
    },
    // A pattern alone is not a keypad setting.
    { code: `export const M = () => <Field label="Membership number"><Input pattern="[0-9]*" /></Field>;`, errors: [{ messageId: "noNumeric" }] },
    { code: `export const M = () => <input name="code" pattern="\\d{6}" />;`, errors: [{ messageId: "noNumeric" }] },
    { code: bound("z.string().regex(/^\\d+([.,]\\d+)?$/)", `<Input {...field} />`, "Amount"), errors: [{ messageId: "noDecimal" }] },
    // A digit keypad on a value with letters.
    {
      code: bound("z.string().regex(/^[A-Z]{2}-\\d+$/)", `<Input inputMode="numeric" {...field} />`, "Order reference"),
      errors: [{ messageId: "keypadForLetters" }],
    },
    { code: `export const R = () => <Input inputMode="decimal" pattern="[A-Z0-9]+" />;`, errors: [{ messageId: "keypadForLetters" }] },
  ],
});
