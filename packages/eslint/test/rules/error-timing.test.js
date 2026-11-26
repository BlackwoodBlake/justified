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
    // The Do example: a shown error is rechecked on change, a new one waits for blur.
    `const valid = (v) => /^\\d{5}$/.test(v);
export function Address() {
  const [postcode, setPostcode] = useState("");
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState();
  const message = "Enter a five-digit postcode, for example 11359.";
  return (
    <Input
      value={postcode}
      onChange={(e) => {
        const v = e.target.value;
        setPostcode(v);
        setChanged(true);
        if (error && valid(v)) setError(undefined);
      }}
      onBlur={() => { if (changed) setError(valid(postcode) ? undefined : message); }}
    />
  );
}`,
    // Rechecking a shown error on change, written other ways.
    `export function F({ form }) {
  const [error, setError] = useState("");
  return <Input onChange={(e) => { if (!error) return; setError(ok(e.target.value) ? "" : "Enter a postcode."); }} />;
}`,
    `export function F({ form }) {
  return <Input onChange={(e) => { if (form.formState.errors.postcode && !ok(e.target.value)) form.setError("postcode", { message: "Enter a postcode." }); }} />;
}`,
    `export function F() {
  const [error, setError] = useState("");
  const shown = Boolean(error);
  return <Input onChange={(e) => setError(shown && !ok(e.target.value) ? "Enter a postcode." : "")} />;
}`,
    // After the field was left once: needs judgement, left to review.
    `export function F() {
  const [left, setLeft] = useState(false);
  const [error, setError] = useState("");
  return <Input onBlur={() => setLeft(true)} onChange={(e) => { if (left) setError(ok(e.target.value) ? "" : "Enter a postcode."); }} />;
}`,
    // Only clearing, state not named for an error, and results of helpers.
    `export function F() { const [error, setError] = useState(""); return <Input onChange={() => setError("")} />; }`,
    `export function F() { const [hint, setHint] = useState(""); return <Input onChange={(e) => setHint(ok(e.target.value) ? "" : "Five digits")} />; }`,
    `export function F() { const [error, setError] = useState(); return <Input onChange={(e) => setError(schema.safeParse(e.target.value).error?.issues[0].message)} />; }`,
    `export function F({ trigger }) { return <Input onChange={() => trigger("postcode")} />; }`,
    // A setError from props, and not a text field.
    `export function F({ setError }) { return <Input onChange={(e) => setError(ok(e.target.value) ? "" : "Enter a postcode.")} />; }`,
    `export function F() { const [error, setError] = useState(""); return <input type="checkbox" onChange={() => setError("Accept the terms.")} />; }`,
    `export function F() { const [error, setError] = useState(""); return <Select onValueChange={() => setError("Pick one.")} />; }`,
    // A new password shows progress against its rules (Exceptions).
    `export function F() { const [error, setError] = useState(""); return <Input type="password" autoComplete="new-password" onChange={(e) => setError(e.target.value.length < 12 ? "At least 12 characters" : "")} />; }`,
    // Work set up for later is not this change.
    `export function F() { const [error, setError] = useState(""); return <Input onChange={() => fetchLater(() => setError("Address not found."))} />; }`,
    // Since the review of 0.1.1: errors from a request, limit messages, and an empty setError message.
    // Clears the error only when one is shown
    `
    export function A() {
      const [error, setError] = useState("")
      return <Input onChange={(e) => { if (error && valid(e.target.value)) setError("") }} />
    }`,
    // Checks again only when an error is shown
    `
    export function A() {
      const [error, setError] = useState<string | null>(null)
      return <Input onChange={(e) => { setValue(e.target.value); if (error) setError(validate(e.target.value)) }} />
    }`,
    // Guarded by a touched flag
    `
    export function A() {
      const [touched, setTouched] = useState(false)
      const [error, setError] = useState("")
      return <Input onBlur={() => setTouched(true)} onChange={(e) => { if (touched && !ok(e.target.value)) setError("Enter an email address") }} />
    }`,
    // Cleared while typing, set only on blur
    `
    export function A() {
      const [emailError, setEmailError] = useState("")
      return <Input onChange={(e) => { setEmail(e.target.value); setEmailError("") }} onBlur={() => { if (!ok(email)) setEmailError("Enter an email address") }} />
    }`,
    // A new password with its rules beside the field
    `
    export function A() {
      const [error, setError] = useState("")
      return <Input type="password" autoComplete="new-password" onChange={(e) => { if (e.target.value.length < 8) setError("At least 8 characters") }} />
    }`,
    // A hint state, not an error
    `
    export function A() {
      const [hint, setHint] = useState("")
      return <Input onChange={(e) => setHint(e.target.value.length > 3 ? "Looks good" : "")} />
    }`,
    // A limit message in a state named for the limit is FRM-017c, not an error
    `
    export function A() {
      const [limitError, setLimitError] = useState("")
      return <Textarea maxLength={200} onChange={(e) => setLimitError(e.target.value.length >= 200 ? "You have reached 200 characters" : "")} />
    }`,
    // react-hook-form setError only when the field already has an error
    `
    export function A() {
      const { setError, formState: { errors } } = useForm()
      return <Input onChange={(e) => { if (errors.code && bad(e.target.value)) setError("code", { message: "Check the code" }) }} />
    }`,
    // setError with an empty message clears it
    `
    export function A() {
      const { setError } = useForm()
      return <Input onChange={() => setError("root.server", { type: "manual", message: "" })} />
    }`,
    // An error from a failed search request, set in a catch
    `
    export function A() {
      const [searchError, setSearchError] = useState("")
      return <Input type="search" onChange={async (e) => { try { setResults(await find(e.target.value)) } catch { setSearchError("Search is not working right now") } }} />
    }`,
    // A boolean flag, not a message
    `
    export function A() {
      const [hasError, setHasError] = useState(false)
      return <Input onChange={(e) => setHasError(!ok(e.target.value))} />
    }`,
    // Guarded by a local read from shown state
    `
    export function A() {
      const [error, setError] = useState("")
      return <Input onChange={(e) => { const shown = Boolean(error); if (shown) setError(ok(e.target.value) ? "" : "Enter a postcode") }} />
    }`,
    // A file input
    `
    export function A() {
      const [error, setError] = useState("")
      return <Input type="file" onChange={(e) => { if (e.target.files![0].size > 1e6) setError("The file is larger than 1 MB") }} />
    }`,
    // A field whose type is not written out
    `
    export function A({ kind }) {
      const [error, setError] = useState("")
      return <Input type={kind} onChange={(e) => { if (!e.target.value) setError("Pick a date") }} />
    }`,
    // Guarded by a once-submitted prop
    `
    export function A({ submitted }) {
      const [error, setError] = useState("")
      return <Input onChange={(e) => { if (submitted && !ok(e.target.value)) setError("Enter a postcode") }} />
    }`,
    // Guarded by a ref
    `
    export function A() {
      const left = useRef(false)
      const [error, setError] = useState("")
      return <Input onBlur={() => (left.current = true)} onChange={(e) => { if (left.current && !ok(e.target.value)) setError("Enter a postcode") }} />
    }`,
    // An error set after an await comes from a request, not from a check of the value.
    `export function A() {
      const [nameError, setNameError] = useState("");
      return <Input onChange={async (e) => { const taken = await isTaken(e.target.value); if (taken) setNameError("That name is taken"); }} />;
    }`,
    // A state named for a count or what remains holds a limit message.
    `export function A() {
      const [remainingError, setRemainingError] = useState("");
      return <Textarea onChange={(e) => setRemainingError(e.target.value.length > 180 ? "20 characters left" : "")} />;
    }`,
  ],
  invalid: [
    {
      // The Don't: an error set on each key
      code: `
      export function A() {
        const [error, setError] = useState("")
        return <Input onChange={(e) => { if (!/^\\d{5}$/.test(e.target.value)) setError("Enter a five-digit postcode") }} />
      }`,
      errors: [{ messageId: "whileTyping" }],
    },
    {
      // The same through a local helper
      code: `
      export function A() {
        const [error, setError] = useState("")
        const check = (v: string) => { if (!ok(v)) setError(\`"\${v}" is not a postcode\`) }
        return <Input onChange={(e) => check(e.target.value)} />
      }`,
      errors: [{ messageId: "whileTyping" }],
    },
    {
      // An await after the error is set does not make it a request's error.
      code: `export function A() {
        const [error, setError] = useState("");
        return <Input onChange={async (e) => { if (!/^\\d{5}$/.test(e.target.value)) setError("Enter a 5-digit ZIP code"); await save(e.target.value); }} />;
      }`,
      errors: [{ messageId: "whileTyping" }],
    },
    {
      // The Don't example: checked on every key press.
      code: `const valid = (v) => /^\\d{5}$/.test(v);
export function EagerAddress() {
  const [postcode, setPostcode] = useState("");
  const [error, setError] = useState();
  const message = "Enter a five-digit postcode, for example 11359.";
  return (
    <Input
      value={postcode}
      onChange={(e) => {
        const v = e.target.value;
        setPostcode(v);
        setError(valid(v) ? undefined : message);
      }}
    />
  );
}`,
      errors: [{ messageId: "whileTyping", line: 12 }],
    },
    {
      code: `export function F() {
  const [emailError, setEmailError] = useState("");
  return <input type="email" onChange={(e) => { if (!e.target.value.includes("@")) setEmailError(\`Enter an email address like name@example.com.\`); }} />;
}`,
      errors: [{ messageId: "whileTyping" }],
    },
    {
      // react-hook-form's setError from a change handler, through a local function.
      code: `export function F({ form, field }) {
  function check(v) { if (v.length !== 5) form.setError("postcode", { type: "pattern", message: "Enter five digits." }); }
  return <Input {...field} onChange={(e) => { field.onChange(e); check(e.target.value); }} />;
}`,
      errors: [{ messageId: "whileTyping" }],
    },
    {
      code: `export function F() {
  const [error, setError] = useState(null);
  const onChange = (e) => setError(!ok(e.target.value) && "Enter a postcode.");
  return <Textarea onChange={onChange} />;
}`,
      errors: [{ messageId: "whileTyping" }],
    },
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
