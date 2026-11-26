import rule from "../../rules/input-type-matches-value.js";
import { run } from "../helpers.js";

const formField = (name, label, input) => `
export function F({ form }) {
  return (
    <FormField
      control={form.control}
      name="${name}"
      render={({ field }) => (
        <FormItem>
          <FormLabel>${label}</FormLabel>
          <FormControl>
            ${input}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}`;

run("input-type-matches-value", rule, {
  valid: [
    // The Do: each field with its type and autocomplete value.
    `export const Supplier = () => (
      <form noValidate>
        <Field label="Email"><Input type="email" autoComplete="email" /></Field>
        <Field label="Mobile number"><Input type="tel" autoComplete="tel" /></Field>
        <Field label="Shop website"><Input type="url" autoComplete="url" /></Field>
      </form>
    );`,
    // shadcn's login form.
    `export const Login = () => (
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="m@example.com" required />
      </div>
    );`,
    formField("email", "Email", `<Input type="email" autoComplete="email" {...field} />`),
    // A field that takes more than one kind of value stays text.
    `export const SignIn = () => <Field label="Email or username"><Input autoComplete="username" /></Field>;`,
    `export const SignIn2 = () => <Field label="Email or phone number"><Input /></Field>;`,
    `export const SignIn3 = () => <Input autoComplete="email" name="username" />;`,
    // An email-only sign-in uses the username token with the email type.
    `export const EmailSignIn = () => <Field label="Email"><Input type="email" autoComplete="username" /></Field>;`,
    // Phone in a number input is FRM-014b's check.
    `export const P = () => <Input type="number" autoComplete="tel" />;`,
    // Search fields are outside the guideline.
    `export const S = () => <Input type="search" aria-label="Search email" />;`,
    // A computed type, or a spread that may set it.
    `export const C = ({ type }) => <Input type={type} autoComplete="email" />;`,
    `export const D = (props) => <Input autoComplete="email" {...props} />;`,
    // Other autocomplete values and labels.
    `export const N = () => <Field label="Full name"><Input autoComplete="name" /></Field>;`,
    `export const O = () => <Field label="Email"><Input autoComplete="off" /></Field>;`,
    `export const Q = () => <Field label="Email preferences"><Input /></Field>;`,
    // A computed label.
    `export const L = ({ label }) => <Field label={label}><Input /></Field>;`,
    // The wrapper from the examples passes everything through.
    `export const W = () => <Probe label="Email" autoComplete="email" />;`,
  ],
  invalid: [
    // The Don't: every field left as text.
    {
      code: `export const AllText = () => (
        <form noValidate>
          <Field label="Email"><Input autoComplete="email" /></Field>
          <Field label="Mobile number"><Input autoComplete="tel" /></Field>
          <Field label="Shop website"><Input autoComplete="url" /></Field>
        </form>
      );`,
      errors: [{ messageId: "textType" }, { messageId: "textType" }, { messageId: "textType" }],
    },
    { code: `export const A = () => <Input type="text" autoComplete="shipping email" />;`, errors: [{ messageId: "textType" }] },
    { code: `export const A = () => <input autoComplete="tel-national" />;`, errors: [{ messageId: "textType" }] },
    // Labelled only, no autocomplete.
    { code: formField("email", "Email address", `<Input {...field} />`), errors: [{ messageId: "textType" }] },
    {
      code: `export const B = () => (<div><Label htmlFor="phone">Phone number</Label><Input id="phone" /></div>);`,
      errors: [{ messageId: "textType" }],
    },
    { code: `export const B = () => <Input aria-label="Website" />;`, errors: [{ messageId: "textType" }] },
    { code: `export const B = () => <label>Work email <Input /></label>;`, errors: [{ messageId: "textType" }] },
    // An email type on a field that takes a user name too.
    {
      code: `export const SignIn = () => <Field label="Email or username"><Input type="email" autoComplete="username" /></Field>;`,
      errors: [{ messageId: "emailTakesUserName" }],
    },
  ],
});
