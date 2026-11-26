import rule from "../../rules/error-timing.js";
import { run } from "../helpers.js";

const rhf = `import { useForm } from "react-hook-form";\n`;

run("error-timing", rule, {
  valid: [
    // The default modes: errors on sending, and a shown error rechecked on every change.
    `${rhf}const f = () => useForm({ defaultValues: { postcode: "" } });`,
    `${rhf}const f = () => useForm({ mode: "onSubmit", reValidateMode: "onChange" });`,
    `${rhf}const f = () => useForm();`,
    // Options from a variable cannot be read for certain.
    `${rhf}const options = { mode: "onChange" } as const; const f = () => useForm(options);`,
    // A computed mode.
    `${rhf}const f = (m: "onChange" | "onSubmit") => useForm({ mode: m });`,
    // Not react-hook-form's useForm.
    `import { useForm } from "@tanstack/react-form";\nconst f = () => useForm({ mode: "onChange" });`,
    `const useForm = (o: object) => o;\nconst f = () => useForm({ mode: "onChange" });`,
    // A new password with its rules beside the field may show progress while typing (Exceptions).
    `${rhf}
export function NewPassword() {
  const form = useForm({ mode: "onChange" });
  return <input type="password" autoComplete="new-password" {...form.register("password")} />;
}`,
  ],
  invalid: [
    {
      code: `${rhf}const f = () => useForm({ mode: "onChange" });`,
      errors: [{ messageId: "typing", data: { mode: "onChange" } }],
    },
    {
      code: `${rhf}const f = () => useForm({ resolver, mode: "all" as const });`,
      errors: [{ messageId: "typing", data: { mode: "all" } }],
    },
    {
      code: `${rhf}const f = () => useForm<Values>({ mode: \`onBlur\` });`,
      errors: [{ messageId: "onBlur" }],
    },
    {
      code: `${rhf}const f = () => useForm({ mode: "onTouched" });`,
      errors: [{ messageId: "onTouched" }],
    },
    {
      code: `import { useForm as useRhf } from "react-hook-form";\nconst f = () => useRhf({ mode: "onChange" });`,
      errors: [{ messageId: "typing" }],
    },
    {
      code: `import * as RHF from "react-hook-form";\nconst f = () => RHF.useForm({ mode: "onChange" });`,
      errors: [{ messageId: "typing" }],
    },
    {
      code: `${rhf}const f = () => useForm({ reValidateMode: "onBlur", defaultValues: {} });`,
      errors: [
        {
          messageId: "revalidate",
          data: { mode: "onBlur" },
          suggestions: [
            { messageId: "suggestRemoveRevalidate", output: `${rhf}const f = () => useForm({  defaultValues: {} });` },
          ],
        },
      ],
    },
    {
      // The new-password exception covers the mode, never reValidateMode.
      code: `${rhf}
export function SignUp() {
  const form = useForm({ mode: "onChange", reValidateMode: "onSubmit" });
  return <input type="password" autoComplete="new-password" {...form.register("password")} />;
}`,
      errors: [
        {
          messageId: "revalidate",
          data: { mode: "onSubmit" },
          suggestions: [
            {
              messageId: "suggestRemoveRevalidate",
              output: `${rhf}
export function SignUp() {
  const form = useForm({ mode: "onChange",  });
  return <input type="password" autoComplete="new-password" {...form.register("password")} />;
}`,
            },
          ],
        },
      ],
    },
    {
      // The shadcn form example with an eager mode.
      code: `${rhf}
export function ProfileForm() {
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "" }, mode: "onChange" });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(save)}>
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>Email</FormLabel><FormControl><Input autoComplete="email" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit">Save profile</Button>
      </form>
    </Form>
  );
}`,
      errors: [{ messageId: "typing", line: 4 }],
    },
  ],
});
