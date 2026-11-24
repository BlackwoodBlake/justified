import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field, FieldSet } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { useRef, useState, type FormEvent } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * FRM-008: a sign-in code field takes a pasted or filled-in code in one go.
 * The text message is drawn above the form so the code can be copied.
 */

const code = "482913";
const format = "Enter the 6 digits from the text message.";
const wrongCode = "That code is not right. Check the text message and try again.";

function TextMessage() {
  return (
    <div className="w-full rounded-lg border border-border bg-muted p-3 text-sm">
      <p className="m-0 text-xs text-muted-foreground">Text message</p>
      <p className="m-0 mt-1">
        Your sign-in code is <span className="font-mono font-medium select-all">482 913</span>
      </p>
    </div>
  );
}

const box = "grid w-full max-w-sm gap-4 rounded-lg border border-border bg-background p-4";

function OneField() {
  const [value, setValue] = useState("");
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [said, setSaid] = useState("");
  // After a send that moves focus to the field, its error is read with the field, so the region stays quiet.
  const [sent, setSent] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const ok = (v: string) => /^\d{6}$/.test(v);

  const send = (e: FormEvent) => {
    e.preventDefault();
    setSaid("");
    const next = !ok(value) ? format : value !== code ? wrongCode : undefined;
    setError(next);
    setSent(Boolean(next) && document.activeElement !== ref.current);
    if (next) ref.current?.focus();
    else setSaid("Signed in.");
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <TextMessage />
      <form noValidate onSubmit={send} className={box}>
        <Field
          label="One-time code"
          hint="6 digits, sent to the phone number ending in 0123."
          error={error}
          announce={!sent}
        >
          <Input
            ref={ref}
            inputMode="numeric"
            autoComplete="one-time-code"
            value={value}
            onChange={(e) => {
              // Spaces and dashes from a pasted code are dropped, so "482 913" fits.
              const v = e.target.value.replace(/[\s-]/g, "");
              setValue(v);
              setChanged(true);
              setSent(false);
              if (error && ok(v)) setError(undefined);
            }}
            onBlur={() => {
              if (changed && value && !ok(value)) setError(format);
            }}
          />
        </Field>
        <div>
          <Button type="submit">Sign in</Button>
        </div>
        <Outcome>{said}</Outcome>
      </form>
    </div>
  );
}

function SixBoxes() {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | undefined>();
  const [said, setSaid] = useState("");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const send = (e: FormEvent) => {
    e.preventDefault();
    setSaid("");
    const typed = digits.join("");
    if (typed === code) {
      setError(undefined);
      setSaid("Signed in.");
    } else {
      setError(/^\d{6}$/.test(typed) ? wrongCode : format);
      refs.current[0]?.focus();
    }
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <TextMessage />
      <form noValidate onSubmit={send} className={box}>
        <FieldSet legend="One-time code" error={error} announce={false}>
          <div className="flex gap-2">
            {digits.map((d, i) => (
              <Input
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                aria-label={`Digit ${i + 1}`}
                inputMode="numeric"
                maxLength={1}
                className="w-10 px-0 text-center"
                value={d}
                onChange={(e) => {
                  const v = e.target.value.slice(-1);
                  setDigits((s) => s.map((x, j) => (j === i ? v : x)));
                  if (v) refs.current[i + 1]?.focus();
                }}
              />
            ))}
          </div>
        </FieldSet>
        <div>
          <Button type="submit">Sign in</Button>
        </div>
        <Outcome>{said}</Outcome>
      </form>
    </div>
  );
}

export const FRM008: RuleExamples = {
  id: "FRM-008",
  examples: [
    {
      kind: "do",
      title: "One field that takes the whole code",
      caption: (
        <>
          Copy “482 913” from the text message and paste it into <em>One-time code</em>. All six digits go in, and the
          space is dropped. On a phone, the keyboard can offer the code from the message, since the field asks for a
          one-time code.
        </>
      ),
      Demo: OneField,
    },
    {
      kind: "dont",
      title: "Six boxes that take one digit each",
      caption: (
        <>
          Paste the same code into the first box. Only the 4 goes in, and the person has to type the other five digits
          by hand, reading them off another screen.
        </>
      ),
      Demo: SixBoxes,
    },
  ],
};
