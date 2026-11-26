import { Button } from "@blackwoodblake/justified-shadcn/button";

import type { RuleExamples } from "./frame";
import { Invite, SignIn, type HelperProps } from "./enter-submits";

/*
 * FRM-015: Enter in a single-line field sends the form, as its main button does.
 *
 * Two scenes from the rule's own text: an invite box (a real form, or a div
 * with a click handler) and a sign-in form with a show-password helper (typed
 * as a plain button, or left without a type and first in the code). Each shows
 * what Enter did in a polite line and a tally.
 */

/** The Don't's helper: no type, so in the form it is a submit button. */
function UntypedHelper({ label, onToggle }: HelperProps) {
  return (
    <Button asChild variant="outline" size="sm">
      <button
        onClick={(e) => {
          // A click on the eye would send the form, so the handler stops it, and that swallows Enter too.
          e.preventDefault();
          onToggle();
        }}
      >
        {label}
      </button>
    </Button>
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
      Demo: () => <Invite real />,
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
      Demo: () => <Invite real={false} />,
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
      Demo: () => <SignIn Helper={UntypedHelper} />,
    },
  ],
};
