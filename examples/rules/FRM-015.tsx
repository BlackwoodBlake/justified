import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { useState, type FormEvent } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";
import { card, Invite, SignIn, Tally } from "./enter-submits";

/*
 * FRM-015: Enter in a single-line field sends the form, as its main button does.
 *
 * Two scenes from the rule's own text: an invite box (a real form, or a div
 * with a click handler) and a sign-in form with a show-password helper (typed
 * as a plain button, or left without a type and first in the code). Each shows
 * what Enter did in a polite line and a tally. The Do scenes come from
 * enter-submits.tsx; the Don't scenes are written out here.
 */

/** The Don't: a field and a button in a div, so there is no form for Enter to send. */
function InviteWithoutForm() {
  const [email, setEmail] = useState("sam@example.com");
  const [sent, setSent] = useState(0);
  const [said, setSaid] = useState("");

  const send = () => {
    setSent((n) => n + 1);
    setSaid(`Invite sent to ${email}.`);
  };
  const reset = () => {
    setSent(0);
    setSaid("");
    setEmail("sam@example.com");
  };

  return (
    <div className={card}>
      <h4 className="m-0 text-base font-semibold">Invite a teammate</h4>
      <div className="grid gap-3">
        <Field label="Email address">
          <Input type="email" value={email} autoComplete="off" onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <div>
          <Button onClick={send}>Send invite</Button>
        </div>
      </div>
      <Outcome>{said}</Outcome>
      <Tally label="Invites sent" n={sent} onReset={reset} />
    </div>
  );
}

/** The Don't: the show-password helper has no type and comes before the main button. */
function SignInWithUntypedHelper() {
  const [shown, setShown] = useState(false);
  const [signedIn, setSignedIn] = useState(0);
  const [said, setSaid] = useState("");

  const reset = () => {
    setShown(false);
    setSignedIn(0);
    setSaid("");
  };

  const toggle = () => {
    setShown((s) => !s);
    setSaid(shown ? "Password hidden." : "Password shown.");
  };

  return (
    <div className={card}>
      <h4 className="m-0 text-base font-semibold">Sign in</h4>
      <form
        noValidate
        className="grid gap-3"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          setSignedIn((n) => n + 1);
          setSaid("Signed in as maja@example.com.");
        }}
      >
        <Field label="Email address">
          <Input type="email" defaultValue="maja@example.com" autoComplete="username" />
        </Field>
        <Field label="Password">
          <Input type={shown ? "text" : "password"} defaultValue="tulip-garden-7" autoComplete="current-password" />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <button
              onClick={(e) => {
                // A click on the eye would send the form, so the handler stops it, and that swallows Enter too.
                e.preventDefault();
                toggle();
              }}
            >
              {shown ? "Hide password" : "Show password"}
            </button>
          </Button>
          <Button type="submit">Sign in</Button>
        </div>
      </form>
      <Outcome>{said}</Outcome>
      <Tally label="Sign-ins" n={signedIn} onReset={reset} />
    </div>
  );
}

export const FRM015: RuleExamples = {
  id: "FRM-015",
  examples: [
    {
      kind: "do",
      title: "A real form with a submit button",
      caption: (
        <>
          Click in <em>Email address</em> and press Enter. The invite is sent, exactly as a click on <em>Send invite</em>{" "}
          does, and the tally goes up. The field and the button sit in one <code>&lt;form&gt;</code> and the button is{" "}
          <code>type="submit"</code>.
        </>
      ),
      Demo: Invite,
    },
    {
      kind: "dont",
      title: "A div and a click handler",
      caption: (
        <>
          Click in <em>Email address</em> and press Enter. Nothing happens and the tally stays at 0. Click{" "}
          <em>Send invite</em> and it goes. There is no <code>&lt;form&gt;</code>, so the browser has nothing to send.
        </>
      ),
      notLinted: "Lint gap: a field with no form and a button that sends through its own click handler is left alone, since a filter box or an inline edit looks the same.",
      Demo: InviteWithoutForm,
    },
    {
      kind: "do",
      title: "Helper buttons are plain buttons",
      caption: (
        <>
          Click in <em>Password</em> and press Enter. You are signed in. Press <em>Show password</em> with Enter or
          Space and the password shows, without signing in. The helper has <code>type="button"</code>, so Enter never
          presses it.
        </>
      ),
      Demo: () => <SignIn />,
    },
    {
      kind: "dont",
      title: "A helper without a type, before the main button",
      caption: (
        <>
          Click in <em>Password</em> and press Enter. The password is shown and nobody is signed in. The browser presses
          the first submit button in the code, and <em>Show password</em> has no type, so Enter lands on it. Its click
          handler calls <code>preventDefault()</code> so that a click on the eye does not send the form, and that also
          cancels the send Enter started. Without that call, Enter would show the password and send the form too. Click{" "}
          <em>Sign in</em> to see it work.
        </>
      ),
      Demo: SignInWithUntypedHelper,
    },
  ],
};
