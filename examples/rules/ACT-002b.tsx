import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { useId, useRef, useState, type FormEvent } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * ACT-002b: at most one primary button on a page.
 *
 * Both examples are the same small profile page with three sections, each
 * with one button inside the part it acts on. In the Do only Save profile is
 * filled. In the Don't all three are, so the page no longer says what its
 * main task is. Labels and outcomes are the same in both.
 *
 * The page title is the example's h4; its three parts are h5 under it, and
 * the form is named by its own part, not by the page.
 */

type FieldKey = "name" | "email";
type Style = "default" | "outline" | "ghost";

const nameError = "Enter your full name.";
const emailError = "Enter an email address with an @, for example jonah.reyes@example.com.";

const validEmail = (v: string) => /^[^\s@]+@[^\s@]+$/.test(v.trim());

function clock() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function Profile({ password, exportStyle }: { password: Style; exportStyle: Style }) {
  const [name, setName] = useState("Jonah Reyes");
  const [email, setEmail] = useState("jonah.reyes@example.com");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  // The field a send moved focus to: its error is read with the field, so its region stays quiet.
  // When focus is already in that field (Enter), nothing is read again, so its region must speak.
  const [sent, setSent] = useState<FieldKey | null>(null);
  // Fields the person has changed, so leaving them may show an error (FRM-002b).
  const changed = useRef<Record<FieldKey, boolean>>({ name: false, email: false });
  const [saved, setSaved] = useState("");
  const [said, setSaid] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const detailsId = useId();
  const passwordId = useId();
  const exportId = useId();

  const say = (s: string) => {
    setSaid("");
    setTimeout(() => setSaid(s), 50);
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    const next = {
      name: name.trim() ? undefined : nameError,
      email: validEmail(email) ? undefined : emailError,
    };
    setErrors(next);
    setSaved("");
    if (next.name || next.email) {
      const target = next.name ? nameRef : emailRef;
      setSent(document.activeElement !== target.current ? (next.name ? "name" : "email") : null);
      target.current?.focus();
      return;
    }
    setTimeout(() => setSaved(`Profile saved at ${clock()}.`), 50);
  };

  const section = "flex flex-col gap-3 border-t border-border pt-4";
  const sectionTitle = "m-0 text-sm font-semibold";

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="grid w-full max-w-sm gap-4 rounded-lg border border-border bg-background p-4">
        <h4 id={titleId} className="m-0 text-base font-semibold">
          My profile
        </h4>

        <form noValidate onSubmit={save} aria-labelledby={detailsId} className="grid gap-4">
          <h5 id={detailsId} className={sectionTitle}>
            Profile details
          </h5>
          <Field label="Full name" error={errors.name} announce={sent !== "name"}>
            <Input
              ref={nameRef}
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                changed.current.name = true;
                setSent(null);
                if (errors.name && e.target.value.trim()) setErrors((x) => ({ ...x, name: undefined }));
              }}
              onBlur={(e) => {
                setSent(null);
                if (changed.current.name && !e.target.value.trim()) setErrors((x) => ({ ...x, name: nameError }));
              }}
            />
          </Field>
          <Field label="Email" error={errors.email} announce={sent !== "email"}>
            <Input
              ref={emailRef}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                changed.current.email = true;
                setSent(null);
                if (errors.email && validEmail(e.target.value)) setErrors((x) => ({ ...x, email: undefined }));
              }}
              onBlur={(e) => {
                setSent(null);
                if (changed.current.email && !validEmail(e.target.value))
                  setErrors((x) => ({ ...x, email: emailError }));
              }}
            />
          </Field>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Button type="submit">Save profile</Button>
            <p role="status" className="m-0 text-sm text-muted-foreground">
              {saved}
            </p>
          </div>
        </form>

        <section aria-labelledby={passwordId} className={section}>
          <h5 id={passwordId} className={sectionTitle}>
            Change password
          </h5>
          <p className="m-0 text-sm text-muted-foreground">Last changed 3 months ago.</p>
          <div>
            <Button variant={password} onClick={() => say("The password form would open here.")}>
              Change password
            </Button>
          </div>
        </section>

        <section aria-labelledby={exportId} className="flex flex-col gap-3 rounded-md border border-border p-3">
          <h5 id={exportId} className={sectionTitle}>
            Export your data
          </h5>
          <p className="m-0 text-sm text-muted-foreground">A file with your profile and settings.</p>
          <div>
            <Button variant={exportStyle} onClick={() => say("Your export has started.")}>
              Export
            </Button>
          </div>
        </section>
      </div>
      <Outcome>{said}</Outcome>
    </div>
  );
}

function Do() {
  return <Profile password="outline" exportStyle="ghost" />;
}

function Dont() {
  return <Profile password="default" exportStyle="default" />;
}

export const ACT002b: RuleExamples = {
  id: "ACT-002b",
  examples: [
    {
      kind: "do",
      title: "One filled button for the page's main task",
      caption: (
        <>
          Only <em>Save profile</em> is filled, so the page says at a glance what it is for. The other sections keep
          quieter buttons. Press <em>Save profile</em>: a line next to it says when the profile was saved, and stays.
        </>
      ),
      Demo: Do,
    },
    {
      kind: "dont",
      title: "A filled button in every section",
      caption: (
        <>
          <em>Save profile</em>, <em>Change password</em> and <em>Export</em> are all filled. Each section has only one
          button, but the page as a whole no longer says which task comes first.
        </>
      ),
      Demo: Dont,
    },
  ],
};
