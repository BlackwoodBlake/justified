import rule from "../../rules/separators-accepted.js";
import { run } from "../helpers.js";

run("separators-accepted", rule, {
  valid: [
    // The Do: the schema cleans first.
    `import { z } from "zod";
    const schema = z.object({
      cardNumber: z.string().transform((v) => v.replace(/[\\s\\-().]/g, "")).pipe(z.string().regex(/^\\d{14}$/)),
      phone: z.preprocess((v) => String(v).replace(/[\\s().-]/g, ""), z.string().regex(/^\\+?\\d{10,13}$/)),
      bookingReference: z.string().regex(/^[A-Za-z0-9 -]{6,9}$/),
    });`,
    // A pattern that already allows separators, and checks other than regex or length.
    `import { z } from "zod";\nconst s = z.object({ phone: z.string().regex(/^[0-9+()\\s-]+$/), mobile: z.string().min(10) });`,
    // Other values: one-time codes, amounts, names, postcodes.
    `import { z } from "zod";\nconst s = z.object({ code: z.string().regex(/^\\d{6}$/), amount: z.string().regex(/^\\d+$/), postcode: z.string().length(5), name: z.string().max(80) });`,
    // Fields that take what people type.
    `export const Find = () => (
      <form noValidate>
        <Field label="Mobile number"><Input type="tel" autoComplete="tel" /></Field>
        <Field label="Card number"><Input autoComplete="cc-number" inputMode="numeric" /></Field>
      </form>
    );`,
    // A code at sign-in is FRM-008; a length on free text is FRM-017b.
    `export const Otp = () => <Input autoComplete="one-time-code" maxLength={6} />;`,
    `export const Bio = () => <Field label="Bio"><Textarea maxLength={200} /></Field>;`,
    `export const Amount = () => <Field label="Amount"><Input maxLength={10} /></Field>;`,
    // A key filter that lets the separators through.
    `export const K = () => <Input type="tel" onKeyDown={(e) => { if (!/\\d/.test(e.key) && e.key !== " " && e.key !== "+") e.preventDefault(); }} />;`,
    `export const K2 = () => <Input type="tel" onKeyDown={(e) => { if (!/[\\d +-]/.test(e.key)) e.preventDefault(); }} />;`,
    // A digit filter on a field that is not such a value.
    `export const K3 = () => <Field label="Quantity"><Input onKeyDown={(e) => { if (!/\\d/.test(e.key)) e.preventDefault(); }} /></Field>;`,
    // The pattern with the browser's check off.
    `export const N = () => <form noValidate><Input type="tel" pattern="[0-9]*" /></form>;`,
    // A rewrite that puts the caret back.
    `export function Card() {
      const ref = useRef(null);
      return <Input ref={ref} autoComplete="cc-number" value={value} onChange={(e) => { const pos = e.target.selectionStart; setValue(e.target.value.replace(/\\D/g, "")); requestAnimationFrame(() => ref.current.setSelectionRange(pos, pos)); }} />;
    }`,
    // Uncontrolled, or the rewrite only when checking.
    `export const U = () => <Input autoComplete="cc-number" onChange={(e) => setClean(e.target.value.replace(/\\D/g, ""))} />;`,
    `export const V = () => <Input type="tel" value={value} onChange={(e) => setValue(e.target.value)} />;`,
    // A placeholder that shows an example, not blanks.
    `export const P = () => <Input type="tel" placeholder="07700 900123" />;`,
    `export const Pin = () => <Field label="PIN"><Input placeholder="____" /></Field>;`,
  ],
  invalid: [
    {
      code: `import { z } from "zod";\nconst schema = z.object({ cardNumber: z.string().regex(/^\\d{16}$/, "Invalid card number") });`,
      errors: [{ messageId: "rawCheck" }],
    },
    {
      code: `import { z } from "zod";\nconst schema = z.object({ phone: z.string().trim().regex(/^\\+?[0-9]{10,13}$/), iban: z.string().length(22), bookingReference: z.string().regex(/^[A-Z0-9]{6}$/) });`,
      errors: [{ messageId: "rawCheck" }, { messageId: "rawCheck" }, { messageId: "rawCheck" }],
    },
    {
      code: `export const Mobile = () => <Field label="Mobile number"><Input type="tel" autoComplete="tel" onKeyDown={(e) => { if (!/\\d/.test(e.key)) e.preventDefault(); }} /></Field>;`,
      errors: [{ messageId: "keysRefused" }],
    },
    {
      code: `function onlyDigits(e) {\n  if (/\\D/.test(e.key) && e.key.length === 1) {\n    e.preventDefault();\n  }\n}\nexport const M = () => <Input name="phoneNumber" onKeyDown={onlyDigits} />;`,
      errors: [{ messageId: "keysRefused" }],
    },
    {
      code: `export const Card = () => <Field label="Card number"><Input autoComplete="cc-number" inputMode="numeric" maxLength={16} /></Field>;`,
      errors: [{ messageId: "maxLength" }],
    },
    {
      code: `export const Ref = () => <Field label="Booking reference"><Input maxLength={6} /></Field>;`,
      errors: [{ messageId: "maxLength" }],
    },
    {
      code: `export const N = () => <form onSubmit={send}><Input type="tel" pattern="[0-9]*" /></form>;`,
      errors: [{ messageId: "digitPattern" }],
    },
    {
      code: `export const C = () => <Input autoComplete="cc-number" value={value} onChange={(e) => setValue(e.target.value.replace(/\\D/g, ""))} />;`,
      errors: [{ messageId: "caretJumps" }],
    },
    {
      code: `export function F({ form }) {
        return (
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem><FormLabel>Phone</FormLabel><FormControl>
              <Input {...field} value={field.value} onChange={(e) => field.onChange(e.target.value.replace(/[^0-9]/g, ""))} />
            </FormControl></FormItem>
          )} />
        );
      }`,
      errors: [{ messageId: "caretJumps" }],
    },
    { code: `export const P = () => <Input type="tel" placeholder="(___) ___-____" />;`, errors: [{ messageId: "blankPlaceholder" }] },
  ],
});
