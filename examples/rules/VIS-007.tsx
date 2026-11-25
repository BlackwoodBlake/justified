import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { useRef, useState, type FormEvent } from "react";

import type { RuleExamples } from "./frame";
import { MotionScene, ReducedSwitch, replay, useExampleMotion } from "./motion-demo";

/*
 * VIS-007: never let motion be the only sign of what happened.
 *
 * Two scenes from the rule's own text. A sign-in form shakes when the
 * password is wrong; a shop's cart icon bounces when an item is added. The
 * Do keeps a sign that stays after the motion ends, and so also when the
 * example's "Reduced motion" switch (or the browser's setting) turns the
 * motion off: the error text at the field, and a count with a status
 * message. The Don't has the motion and nothing else, so with reduced motion
 * on, nothing at all marks what happened.
 *
 * Motion is one short move on a press and never loops or flashes.
 */

const ERROR = "The email or password is not right. Check both and try again.";

function SignIn({ withText }: { withText: boolean }) {
  const { system, simulated, setSimulated, reduced } = useExampleMotion();
  const card = useRef<HTMLDivElement>(null);
  const password = useRef<HTMLInputElement>(null);
  // The Do starts after a first wrong attempt, so the lasting sign is visible without a press.
  const [error, setError] = useState(withText);
  const [tries, setTries] = useState(withText ? 1 : 0);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTries((n) => n + 1);
    if (withText) {
      setError(true);
      // Focus goes to the field (FRM-011); its message is read from there, so the Field stays quiet.
      password.current?.focus();
    }
    replay(card.current, "mdemo-shake");
  };

  return (
    <MotionScene reduced={reduced} className="grid w-full max-w-sm gap-3">
      <ReducedSwitch system={system} simulated={simulated} onChange={setSimulated} />
      <div ref={card} className="rounded-lg border border-border bg-background p-4">
        <form onSubmit={submit} noValidate className="grid gap-3">
          <h4 className="m-0 text-base font-semibold">Sign in</h4>
          <Field label="Email">
            <Input type="email" defaultValue="sam@example.com" autoComplete="off" />
          </Field>
          <Field label="Password" error={error ? ERROR : undefined} announce={false}>
            <Input ref={password} type="password" defaultValue="not-my-password" autoComplete="off" />
          </Field>
          <div>
            <Button type="submit">Sign in</Button>
          </div>
        </form>
      </div>
      <p className="m-0 text-sm text-muted-foreground" aria-hidden="true">
        Wrong attempts: <strong>{tries}</strong> · Left on screen when the motion ends or is off:{" "}
        <strong>{withText ? "the error text" : "nothing"}</strong>
      </p>
    </MotionScene>
  );
}

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 4h2.5l2.2 11h10.6L20 7.5H6.2" />
    </svg>
  );
}

function Shop({ withText }: { withText: boolean }) {
  const { system, simulated, setSimulated, reduced } = useExampleMotion();
  const icon = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(2);
  const [said, setSaid] = useState("");

  const add = () => {
    setCount((n) => n + 1);
    // The status line is in the page from the start, so a change in it is read out (FBK-004).
    if (withText) setSaid(`Added to cart. ${count + 1} items in your cart.`);
    replay(icon.current, "mdemo-bounce");
  };

  return (
    <MotionScene reduced={reduced} className="grid w-full max-w-sm gap-3">
      <ReducedSwitch system={system} simulated={simulated} onChange={setSimulated} />
      <div className="grid gap-3 rounded-lg border border-border bg-background p-4">
        <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
          <span className="text-sm font-semibold">Hillside Goods</span>
          <span
            ref={icon}
            role="img"
            aria-label={withText ? `Cart, ${count} items` : "Cart"}
            className="relative inline-flex size-10 items-center justify-center"
          >
            <CartIcon />
            {withText && (
              <span
                aria-hidden="true"
                className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground"
              >
                {count}
              </span>
            )}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="m-0 text-sm">Linen shirt, £45.00</p>
          <Button onClick={add}>Add to cart</Button>
        </div>
        {withText && (
          <p role="status" className="m-0 min-h-5 text-sm text-foreground">
            {said}
          </p>
        )}
      </div>
      <p className="m-0 text-sm text-muted-foreground" aria-hidden="true">
        Left on screen when the motion ends or is off:{" "}
        <strong>{withText ? "the count and the message" : "nothing"}</strong>
      </p>
    </MotionScene>
  );
}

export const VIS007: RuleExamples = {
  id: "VIS-007",
  examples: [
    {
      kind: "do",
      title: "A wrong password shakes and the error text stays",
      caption: (
        <>
          Press <em>Sign in</em>: the card shakes once, and the message at the password field stays. Turn on{" "}
          <em>Reduced motion</em> and press again: no shake, and the message is still there.
        </>
      ),
      Demo: () => <SignIn withText />,
    },
    {
      kind: "dont",
      title: "A shake with no message",
      caption: (
        <>
          Press <em>Sign in</em>: the card shakes and nothing else changes. Turn on <em>Reduced motion</em> and press
          again: nothing at all tells the person the password was wrong.
        </>
      ),
      Demo: () => <SignIn withText={false} />,
    },
    {
      kind: "do",
      title: "The cart bounces, the count and a message say why",
      caption: (
        <>
          Press <em>Add to cart</em>: the icon bounces, the count goes up and stays, and a status message is read out.
          With <em>Reduced motion</em> on there is no bounce, and the count and message remain.
        </>
      ),
      Demo: () => <Shop withText />,
    },
    {
      kind: "dont",
      title: "A bounce is the only sign that an item was added",
      caption: (
        <>
          Press <em>Add to cart</em>: the icon bounces and that is all. With <em>Reduced motion</em> on, a press changes
          nothing anyone can see or hear.
        </>
      ),
      Demo: () => <Shop withText={false} />,
    },
  ],
};
