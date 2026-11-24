import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { CheckIcon } from "@blackwoodblake/justified-shadcn/icons";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { Still } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * STA-005b (a guideline, our own choice): while an action is being sent, a
 * second press does not send it again.
 *
 * Two scenes from the guideline's own text. A box office takes a payment
 * from the button; a booking page takes a question from a field, where Enter
 * also sends. Each shows a tally of what was really sent, so a repeat can be
 * seen. Both keep the working sign STA-005a asks for, so each Don't breaks
 * only this guideline.
 *
 * guardClick: a press on the button is held back while a send is out.
 * guardSubmit: Enter in the field is held back as well.
 * The guard is a ref set at the first press, so a second press half a second
 * later, or in the same instant, finds it already up.
 */

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 motion-safe:animate-spin" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

type Scene = {
  button: string;
  working: string;
  /** What the polite line says while a send is out. */
  waiting: string;
  done: string;
  noun: string;
};

function TwoPaymentsStill() {
  return (
    <Still note="Two presses, two payments.">
      <div className="grid gap-2 rounded-lg border border-border bg-background p-4 text-sm">
        <p className="m-0 font-semibold">Two seats, row F</p>
        <p className="m-0">
          Payments sent: <strong>2</strong>
        </p>
      </div>
    </Still>
  );
}

const PAY: Scene = {
  button: "Pay £38.00",
  working: "Paying …",
  waiting: "Paying £38.00",
  done: "Payment received. Thank you.",
  noun: "Payments sent",
};

const ASK: Scene = {
  button: "Send question",
  working: "Sending …",
  waiting: "Sending your question",
  done: "Question sent. We will answer by email.",
  noun: "Questions sent",
};

function Sender({
  scene,
  guardClick,
  guardSubmit,
  withField,
}: {
  scene: Scene;
  guardClick: boolean;
  guardSubmit: boolean;
  withField?: boolean;
}) {
  const [tally, setTally] = useState(0);
  const [out, setOut] = useState(0);
  const [question, setQuestion] = useState("Is step-free access open on Saturdays?");
  const [said, setSaid] = useState("");
  const busy = useRef(false);
  const pending = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const send = (guarded: boolean) => {
    if (guarded && busy.current) return;
    busy.current = true;
    pending.current += 1;
    setOut(pending.current);
    setTally((n) => n + 1);
    setSaid("");
    timers.current.push(
      setTimeout(() => {
        pending.current -= 1;
        setOut(pending.current);
        if (pending.current === 0) {
          // The guard ends with the reply, so the button works again at once.
          busy.current = false;
          setSaid(scene.done);
        }
      }, 2500),
    );
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    busy.current = false;
    pending.current = 0;
    setOut(0);
    setTally(0);
    setSaid("");
    if (withField) setQuestion("Is step-free access open on Saturdays?");
  };

  const sending = out > 0;
  // The state is in code, not only in looks: the button stays focusable and says it is unavailable.
  const guarded = guardClick && sending;

  const button = (
    <Button type="button" aria-disabled={guarded || undefined} onClick={() => send(guardClick)} className="min-w-40">
      {sending ? (
        <>
          <Spinner />
          {scene.working}
        </>
      ) : (
        scene.button
      )}
    </Button>
  );

  const body = (
    <div className="grid gap-3">
      {withField && (
        <Field label="Your question">
          <Input value={question} autoComplete="off" onChange={(e) => setQuestion(e.target.value)} />
        </Field>
      )}
      <div>{button}</div>
    </div>
  );

  return (
    <div className="grid w-full max-w-sm gap-3 rounded-lg border border-border bg-background p-4">
      <h4 className="m-0 text-base font-semibold">{withField ? "Ask about a booking" : "Two seats, row F"}</h4>
      {withField ? (
        <form
          noValidate
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            send(guardSubmit);
          }}
        >
          {body}
        </form>
      ) : (
        body
      )}
      <p role="status" className="m-0 min-h-10 text-sm text-muted-foreground">
        {sending && scene.waiting}
        {!sending && said && (
          <span className="flex items-start gap-1.5">
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" />
            <span>{said}</span>
          </span>
        )}
      </p>
      <p className="m-0 flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
        <span>
          {scene.noun}: <strong className="tabular-nums">{tally}</strong>
        </span>
        <Button variant="ghost" size="sm" onClick={reset}>
          Start again
        </Button>
      </p>
    </div>
  );
}

function PayStill() {
  return (
    <Still note="While the payment is on its way the button says what it is doing and ignores a second press.">
      <div className="flex justify-center">
        <Button tabIndex={-1} aria-disabled="true" className="min-w-40">
          <Spinner />
          Paying …
        </Button>
      </div>
    </Still>
  );
}

export const STA005b: RuleExamples = {
  id: "STA-005b",
  examples: [
    {
      kind: "do",
      title: "A second press sends nothing",
      caption: (
        <>
          Double-click <em>Pay £38.00</em>, or press Enter or Space on it twice. The tally says one payment was sent.
          The button reads "Paying …" and ignores the second press. When the reply comes it works again, and a new press
          is a new payment. This is our own choice, not something the judges decided.
        </>
      ),
      Demo: () => (
        <div className="grid w-full justify-items-center gap-4">
          <PayStill />
          <Sender scene={PAY} guardClick guardSubmit />
        </div>
      ),
    },
    {
      kind: "dont",
      title: "Every press is sent",
      caption: (
        <>
          Double-click <em>Pay £38.00</em>. The button shows "Paying …", but each press goes through and the tally
          reaches two: the person has paid twice for the same seats.
        </>
      ),
      Demo: () => (
        <div className="grid w-full justify-items-center gap-4">
          <TwoPaymentsStill />
          <Sender scene={PAY} guardClick={false} guardSubmit={false} />
        </div>
      ),
    },
    {
      kind: "do",
      title: "Enter in the field counts as a press",
      caption: (
        <>
          Click in <em>Your question</em> and press Enter twice, quickly. One question is sent. The guard sits on the
          send, so Enter and the button share it.
        </>
      ),
      Demo: () => <Sender scene={ASK} guardClick guardSubmit withField />,
    },
    {
      kind: "dont",
      title: "Only the button is guarded",
      caption: (
        <>
          Press Enter twice in <em>Your question</em>. Both go through and the tally says two questions. Click{" "}
          <em>Send question</em> twice instead and only one is sent: the guard is on the click and not on the send.
        </>
      ),
      Demo: () => <Sender scene={ASK} guardClick guardSubmit={false} withField />,
    },
  ],
};
