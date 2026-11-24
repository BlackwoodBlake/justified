import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import type { RuleExamples } from "./frame";
import { Toast, ToastRegion } from "./toast";

/*
 * FBK-003: show a successful result in the view, not only in a toast that
 * disappears.
 *
 * In the Do a sent invitation lands at the top of the list "Invited", and a
 * line next to the button says when it went. In the Don't the only sign is a
 * toast that goes after four seconds. Both check the address the same way,
 * and both write into regions that are in the page from the start (FBK-004),
 * so the Don't breaks only FBK-003.
 */

const formatError = "Enter an email address like name@example.com.";
const takenError = "This address has already been invited. Enter another address.";
const valid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const now = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

type Invite = { email: string; when: string };

function InviteCard({ toastOnly }: { toastOnly: boolean }) {
  const [email, setEmail] = useState("anna.brooks@example.com");
  const [error, setError] = useState<string>();
  // After a send that moves focus to the field, its error is read with the field, so the region stays quiet.
  const [sent, setSent] = useState(false);
  const [invited, setInvited] = useState<Invite[]>([{ email: "omar.haddad@example.com", when: "22 November" }]);
  const [line, setLine] = useState("");
  const [toast, setToast] = useState<{ key: number; text: string }>();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // The short pause between clearing the result line and writing it again.
  const sayTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fieldRef = useRef<HTMLInputElement>(null);
  const headingId = useId();
  const listId = useId();

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      clearTimeout(sayTimer.current);
    },
    [],
  );

  const send = (e: FormEvent) => {
    e.preventDefault();
    const address = email.trim();
    const problem = !valid(address)
      ? formatError
      : invited.some((i) => i.email.toLowerCase() === address.toLowerCase())
        ? takenError
        : undefined;
    if (problem) {
      setError(problem);
      setSent(document.activeElement !== fieldRef.current);
      fieldRef.current?.focus();
      return;
    }
    setError(undefined);
    setSent(false);
    setEmail("");
    const time = now();
    // The address is remembered in both examples, so the same one cannot be sent twice.
    setInvited((list) => [{ email: address, when: `today at ${time}` }, ...list]);
    if (toastOnly) {
      clearTimeout(timer.current);
      setToast((t) => ({ key: (t?.key ?? 0) + 1, text: `Invitation sent to ${address}` }));
      // The toast goes after four seconds, and nothing else on the page shows the invitation.
      timer.current = setTimeout(() => setToast(undefined), 4000);
    } else {
      setLine("");
      clearTimeout(sayTimer.current);
      sayTimer.current = setTimeout(() => setLine(`Invitation sent to ${address} at ${time}.`), 50);
    }
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div
        role="group"
        aria-labelledby={headingId}
        className="rounded-lg border border-border bg-background p-5 text-foreground"
      >
        <h4 id={headingId} className="m-0 text-base font-semibold leading-snug">
          Invite people to Spring Fair
        </h4>
        <form noValidate onSubmit={send} className="mt-4 grid gap-3">
          <Field label="Email address" error={error} announce={!sent}>
            <Input
              ref={fieldRef}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSent(false);
                if (error && valid(e.target.value.trim()) && error === formatError) setError(undefined);
                // Clear "already invited" only when the new value is no longer an invited address.
                const next = e.target.value.trim().toLowerCase();
                if (error === takenError && !invited.some((i) => i.email.toLowerCase() === next)) setError(undefined);
              }}
            />
          </Field>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Button type="submit">Send invitation</Button>
            {!toastOnly && (
              <p role="status" className="m-0 min-w-0 flex-1 basis-40 text-sm text-muted-foreground">
                {line}
              </p>
            )}
          </div>
        </form>

        {!toastOnly && (
          <>
            <h4 id={listId} className="m-0 mt-5 text-sm font-semibold">
              Invited
            </h4>
            <ul aria-labelledby={listId} className="m-0 mt-2 grid list-none gap-1 p-0 text-sm">
              {invited.map((i) => (
                <li key={i.email} className="break-words border-b border-border py-1.5 last:border-0">
                  {i.email}, <span className="text-muted-foreground">invited {i.when}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {toastOnly && <ToastRegion>{toast && <Toast key={toast.key}>{toast.text}</Toast>}</ToastRegion>}
    </div>
  );
}

export const FBK003: RuleExamples = {
  id: "FBK-003",
  examples: [
    {
      kind: "do",
      title: "The invitation shows up in the list and stays",
      caption: (
        <>
          Press <em>Send invitation</em>. The address appears at the top of <em>Invited</em> with the time, and a line
          next to the button says who it went to and when. Both stay. The field empties for the next address; try one
          without an @ to see the field's error.
        </>
      ),
      Demo: () => <InviteCard toastOnly={false} />,
    },
    {
      kind: "dont",
      title: "Only a toast that goes after four seconds",
      caption: (
        <>
          Press <em>Send invitation</em>, then look away for five seconds. The toast has gone, and nothing on the page
          shows that the invitation was sent or to whom.
        </>
      ),
      Demo: () => <InviteCard toastOnly />,
    },
  ],
};
