import rule from "../../rules/submit-stays-enabled.js";
import { run } from "../helpers.js";

/** A form with `n` shadcn fields and the given submit button. */
const form = (n, button) => `
export function Long({ form }) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(save)}>
${Array.from(
  { length: n },
  (_v, i) => `        <FormField control={form.control} name="f${i}" render={({ field }) => (
          <FormItem><FormLabel>Field ${i}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />`,
).join("\n")}
        ${button}
      </form>
    </Form>
  );
}`;

const nativeForm = (button) => `
export function Address({ isValid }) {
  return (
    <form>
      <input name="first" /><input name="last" /><input type="email" name="email" />
      <input type="tel" name="phone" /><textarea name="street" /><select name="country" />
      <input type="hidden" name="token" />
      ${button}
    </form>
  );
}`;

run("submit-stays-enabled", rule, {
  valid: [
    // Disabled while sending is STA-005a and STA-005b, not this guideline.
    form(7, `<Button type="submit" disabled={form.formState.isSubmitting}>Create account</Button>`),
    form(7, `<Button type="submit" disabled={isPending}>Create account</Button>`),
    // A short form is outside the guideline.
    form(2, `<Button type="submit" disabled={!form.formState.isValid}>Sign in</Button>`),
    form(4, `<Button type="submit" disabled={!form.formState.isValid}>Send</Button>`),
    // Not a submit button.
    form(7, `<Button type="button" disabled={!isValid} onClick={preview}>Preview</Button>`),
    form(7, `<Button asChild disabled={!isValid}><a href="/next">Next</a></Button>`),
    // No form in this file, so its length is unknown.
    `export function Footer({ isValid }) { return <Button type="submit" disabled={!isValid}>Create account</Button>; }`,
    // Fields made in a map are not counted for certain.
    `export function Mapped({ fields, isValid }) {
      return (
        <form>
          {fields.map((f) => <Input key={f} name={f} />)}
          <Button type="submit" disabled={!isValid}>Create account</Button>
        </form>
      );
    }`,
    // Validity read through another name is left to review.
    nativeForm(`<button type="submit" disabled={!canSend}>Create account</button>`),
    // A property merely called isValid on an object key is not a read.
    nativeForm(`<button type="submit" disabled={check({ isValid: true })}>Create account</button>`),
    // The option raises the threshold.
    { code: form(7, `<Button type="submit" disabled={!form.formState.isValid}>Send</Button>`), options: [{ minFields: 8 }] },
  ],
  invalid: [
    {
      code: form(7, `<Button type="submit" disabled={!form.formState.isValid}>Create account</Button>`),
      errors: [{ messageId: "disabledUntilValid", data: { count: "7" } }],
    },
    {
      code: form(5, `<Button type="submit" disabled={!isValid || isSubmitting}>Create account</Button>`),
      errors: [{ messageId: "disabledUntilValid", data: { count: "5" } }],
    },
    {
      // A Button with no type inside a form submits it.
      code: form(6, `<Button disabled={!formState.isValid}>Continue</Button>`),
      errors: [{ messageId: "disabledUntilValid" }],
    },
    {
      code: form(6, `<Button type="submit" aria-disabled={!form.formState.isValid}>Continue</Button>`),
      errors: [{ messageId: "disabledUntilValid" }],
    },
    {
      // Native controls; the hidden input is not a field.
      code: nativeForm(`<button type="submit" disabled={isValid === false}>Create account</button>`),
      errors: [{ messageId: "disabledUntilValid", data: { count: "6" } }],
    },
    {
      code: nativeForm(`<input type="submit" value="Create account" disabled={!isValid} />`),
      errors: [{ messageId: "disabledUntilValid" }],
    },
    {
      code: form(3, `<Button type="submit" disabled={!form.formState.isValid}>Send</Button>`),
      options: [{ minFields: 3 }],
      errors: [{ messageId: "disabledUntilValid", data: { count: "3" } }],
    },
  ],
});
