import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Checkbox } from "@blackwoodblake/justified-shadcn/checkbox";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@blackwoodblake/justified-shadcn/dialog";
import { Field, FieldSet } from "@blackwoodblake/justified-shadcn/field";
import { NativeSelect } from "@blackwoodblake/justified-shadcn/native-select";
import { RadioGroup, RadioGroupItem } from "@blackwoodblake/justified-shadcn/radio-group";
import { Switch } from "@blackwoodblake/justified-shadcn/switch";
import { useRef, useState, type ReactNode } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";
import { FocusTrace, Screen, useFocusTrace } from "./oninput-demo";
import { useSceneRouter } from "./scene-router";

/*
 * FRM-012b (a rule, decided by the judges): a control that holds a choice
 * only records it, and an action takes a button, a link or a menu, even with
 * a notice.
 *
 * Scenes from the rule's own text: a plan picker, the terms box, automatic
 * payments, and a settings form with Save settings. Every Don't carries the
 * notice FRM-012a would accept, so it breaks only this rule. A change of
 * context is simulated by swapping a drawn page, never by real navigation,
 * and each scene has a Reset button.
 */

function Frame({ children, said, onReset }: { children: ReactNode; said: string; onReset: () => void }) {
  const { text, ref } = useFocusTrace();
  return (
    <div className="grid w-full max-w-sm gap-3" ref={ref}>
      {children}
      <Outcome>{said}</Outcome>
      <FocusTrace text={text} />
      <div className="flex justify-center">
        <Button variant="outline" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Plan */

const PLANS: Record<string, string> = { starter: "Starter", team: "Team", business: "Business" };

function Plan() {
  const [plan, setPlan] = useState("starter");
  const [page, setPage] = useState<"pick" | "checkout">("pick");
  const [said, setSaid] = useState("");
  const reset = () => {
    setPlan("starter");
    setPage("pick");
    setSaid("");
  };
  return (
    <Frame said={said} onReset={reset}>
      {page === "checkout" ? (
        <Screen label="Checkout" arrive>
          <p className="m-0">Pay for the {PLANS[plan]} plan.</p>
        </Screen>
      ) : (
        <Screen label="Choose a plan">
          <FieldSet legend="Plan" hint="Pick the plan, then continue to payment.">
            <RadioGroup
              value={plan}
              onValueChange={(v) => {
                setPlan(v);
                setSaid(`${PLANS[v]} chosen. Nothing is sent yet.`);
              }}
            >
              {Object.entries(PLANS).map(([v, n]) => (
                <Field key={v} label={n} layout="inline">
                  <RadioGroupItem value={v} />
                </Field>
              ))}
            </RadioGroup>
          </FieldSet>
          <div>
            <Button
              onClick={() => {
                setPage("checkout");
                setSaid(`Checkout opened for the ${PLANS[plan]} plan.`);
              }}
            >
              Continue to payment
            </Button>
          </div>
        </Screen>
      )}
    </Frame>
  );
}

function PlanThatOpensCheckout() {
  const [plan, setPlan] = useState("starter");
  const [page, setPage] = useState<"pick" | "checkout">("pick");
  const router = useSceneRouter(() => setPage("checkout"));
  const said = page === "checkout" ? `Checkout opened as soon as ${PLANS[plan]} was reached.` : "";
  const reset = () => {
    setPlan("starter");
    setPage("pick");
  };
  return (
    <Frame said={said} onReset={reset}>
      {page === "checkout" ? (
        <Screen label="Checkout">
          <p className="m-0">Pay for the {PLANS[plan]} plan.</p>
        </Screen>
      ) : (
        <Screen label="Choose a plan">
          <FieldSet legend="Plan" hint="Choosing a plan opens checkout.">
            <RadioGroup
              value={plan}
              onValueChange={(v) => {
                setPlan(v);
                router.push("/checkout");
              }}
            >
              {Object.entries(PLANS).map(([v, n]) => (
                <Field key={v} label={n} layout="inline">
                  <RadioGroupItem value={v} />
                </Field>
              ))}
            </RadioGroup>
          </FieldSet>
        </Screen>
      )}
    </Frame>
  );
}

/* ----------------------------------------------------------------- Terms */

function Terms() {
  const [accepted, setAccepted] = useState(false);
  const [sent, setSent] = useState(false);
  const [said, setSaid] = useState("");
  const [error, setError] = useState("");
  const box = useRef<HTMLButtonElement>(null);
  const reset = () => {
    setAccepted(false);
    setSent(false);
    setSaid("");
    setError("");
  };
  const send = () => {
    setSent(true);
    setSaid("Form sent. The account was created.");
  };
  return (
    <Frame said={said} onReset={reset}>
      {sent ? (
        <Screen label="Welcome" arrive>
          <p className="m-0">Your account is ready.</p>
        </Screen>
      ) : (
        <Screen label="Create an account">
          <Field label="I accept the terms" layout="inline" error={error || undefined} announce={false}>
            <Checkbox
              ref={box}
              checked={accepted}
              onCheckedChange={(v) => {
                setAccepted(v === true);
                setError("");
                setSaid(v === true ? "Terms accepted. Nothing is sent yet." : "Terms not accepted.");
              }}
            />
          </Field>
          <div>
            <Button
              onClick={() => {
                if (!accepted) {
                  setError("Accept the terms to create an account.");
                  setSaid("");
                  box.current?.focus();
                  return;
                }
                send();
              }}
            >
              Create account
            </Button>
          </div>
        </Screen>
      )}
    </Frame>
  );
}

function TermsThatSend() {
  const [accepted, setAccepted] = useState(false);
  const [sent, setSent] = useState(false);
  const [said, setSaid] = useState("");
  const [error, setError] = useState("");
  const box = useRef<HTMLButtonElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const reset = () => {
    setAccepted(false);
    setSent(false);
    setSaid("");
    setError("");
  };
  const send = () => {
    setSent(true);
    setSaid("Form sent. The account was created.");
  };
  return (
    <Frame said={said} onReset={reset}>
      {sent ? (
        <Screen label="Welcome">
          <p className="m-0">Your account is ready.</p>
        </Screen>
      ) : (
        <Screen label="Create an account">
          <form
            ref={form}
            noValidate
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <Field label="I accept the terms" layout="inline" error={error || undefined} announce={false}>
              <Checkbox
                ref={box}
                checked={accepted}
                onCheckedChange={(v) => {
                  setAccepted(v === true);
                  setError("");
                  if (v === true) {
                    form.current?.requestSubmit();
                  } else {
                    setSaid("Terms not accepted.");
                  }
                }}
              />
            </Field>
            <div>
              <Button
                onClick={() => {
                  if (!accepted) {
                    setError("Accept the terms to create an account.");
                    setSaid("");
                    box.current?.focus();
                    return;
                  }
                  send();
                }}
              >
                Create account
              </Button>
            </div>
          </form>
        </Screen>
      )}
    </Frame>
  );
}

/* ----------------------------------------------------- Automatic payments */

function CardDialog({ onOpenChange, onConfirm }: { onOpenChange: (o: boolean) => void; onConfirm: () => void }) {
  const [card, setCard] = useState("Visa ending 4242");
  return (
    <DialogContent closeLabel="Cancel">
      <DialogHeader>
        <DialogTitle>Set up automatic payments</DialogTitle>
        <DialogDescription>Choose the card that pays each month.</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <Field label="Card">
          <NativeSelect value={card} onChange={(e) => setCard(e.target.value)}>
            <option>Visa ending 4242</option>
            <option>Mastercard ending 0099</option>
          </NativeSelect>
        </Field>
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
        >
          Turn on automatic payments
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function AutoPay() {
  const [open, setOpen] = useState(false);
  const [on, setOn] = useState(false);
  const [said, setSaid] = useState("");
  const reset = () => {
    setOpen(false);
    setOn(false);
    setSaid("");
  };
  return (
    <Frame said={said} onReset={reset}>
      <Screen label="Billing">
        <Button onClick={() => setOpen(true)}>Set up automatic payments</Button>
        <p className="m-0">
          Automatic payments: <strong>{on ? "On" : "Off"}</strong>
        </p>
      </Screen>
      <Dialog open={open} onOpenChange={setOpen}>
        <CardDialog
          onOpenChange={setOpen}
          onConfirm={() => {
            setOn(true);
            setSaid("Automatic payments are on.");
          }}
        />
      </Dialog>
    </Frame>
  );
}

function AutoPayWithSwitch() {
  const [open, setOpen] = useState(false);
  const [on, setOn] = useState(false);
  const [said, setSaid] = useState("");
  const reset = () => {
    setOpen(false);
    setOn(false);
    setSaid("");
  };
  return (
    <Frame said={said} onReset={reset}>
      <Screen label="Billing">
        <p id="autopay-notice" className="m-0 text-muted-foreground">
          Turning this on opens a dialog.
        </p>
        <Field label="Automatic payments" layout="inline">
          <Switch
            aria-describedby="autopay-notice"
            checked={on}
            onCheckedChange={(v) => {
              if (v) {
                setOpen(true);
                setSaid("The switch opened a dialog, which took focus.");
              } else {
                setOn(false);
                setSaid("Automatic payments are off.");
              }
            }}
          />
        </Field>
        <p className="m-0">
          Automatic payments: <strong>{on ? "On" : "Off"}</strong>
        </p>
      </Screen>
      <Dialog open={open} onOpenChange={setOpen}>
        <CardDialog
          onOpenChange={setOpen}
          onConfirm={() => {
            setOn(true);
            setSaid("Automatic payments are on.");
          }}
        />
      </Dialog>
    </Frame>
  );
}

/* --------------------------------------------------------- Save settings */

function Settings() {
  const [draft, setDraft] = useState(false);
  const [saved, setSaved] = useState(false);
  const [said, setSaid] = useState("");
  const reset = () => {
    setDraft(false);
    setSaved(false);
    setSaid("");
  };
  return (
    <Frame said={said} onReset={reset}>
      <Screen label="Settings">
        <Field label="Email me a weekly summary" layout="inline">
          <Checkbox checked={draft} onCheckedChange={(v) => setDraft(v === true)} />
        </Field>
        <div>
          <Button
            onClick={() => {
              setSaved(draft);
              setSaid("Settings saved.");
            }}
          >
            Save settings
          </Button>
        </div>
        <p className="m-0">
          Saved setting: <strong>{saved ? "On" : "Off"}</strong>
        </p>
      </Screen>
    </Frame>
  );
}

function SettingsWithSwitch() {
  const [draft, setDraft] = useState(false);
  const [saved, setSaved] = useState(false);
  const [said, setSaid] = useState("");
  const reset = () => {
    setDraft(false);
    setSaved(false);
    setSaid("");
  };
  return (
    <Frame said={said} onReset={reset}>
      <Screen label="Settings">
        <form
          className="contents"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(draft);
            setSaid("Settings saved.");
          }}
        >
          <Field label="Email me a weekly summary" layout="inline">
            <Switch checked={draft} onCheckedChange={setDraft} />
          </Field>
          <div>
            <Button type="submit">Save settings</Button>
          </div>
        </form>
        <p className="m-0">
          Saved setting: <strong>{saved ? "On" : "Off"}</strong>
        </p>
      </Screen>
    </Frame>
  );
}

export const FRM012b: RuleExamples = {
  id: "FRM-012b",
  examples: [
    {
      kind: "do",
      title: "A choice is recorded, a button acts",
      caption: (
        <>
          Press the arrow keys in the plan group. Each one only records the choice. <em>Continue to payment</em> opens
          checkout.
        </>
      ),
      Demo: Plan,
    },
    {
      kind: "dont",
      title: "A radio group opens checkout, even with a notice",
      caption: (
        <>
          Press an arrow key in the group. The line before it says what will happen, yet the first arrow press already
          opens checkout. Reset brings the picker back.
        </>
      ),
      Demo: PlanThatOpensCheckout,
    },
    {
      kind: "do",
      title: "The terms box records, Create account sends",
      caption: (
        <>
          Tick <em>I accept the terms</em>. Nothing is sent until <em>Create account</em> is pressed.
        </>
      ),
      Demo: Terms,
    },
    {
      kind: "dont",
      title: "A checkbox sends the form",
      caption: <>Tick the box. The form is sent and the page is replaced, though the button was never pressed.</>,
      Demo: TermsThatSend,
    },
    {
      kind: "do",
      title: "A button opens the card dialog",
      caption: (
        <>
          Press <em>Set up automatic payments</em>. The dialog opens because a button was pressed.
        </>
      ),
      Demo: AutoPay,
    },
    {
      kind: "dont",
      title: "A switch opens a dialog, even with a notice",
      caption: (
        <>
          Flip <em>Automatic payments</em>. The line before the switch warns of the dialog, but the switch is still the
          wrong control for starting a task.
        </>
      ),
      Demo: AutoPayWithSwitch,
    },
    {
      kind: "do",
      title: "A checkbox in a form that is saved",
      caption: (
        <>
          Tick the box. The saved setting stays <em>Off</em> until <em>Save settings</em> is pressed, and a checkbox
          does not promise otherwise.
        </>
      ),
      Demo: Settings,
    },
    {
      kind: "dont",
      title: "A switch that waits for Save settings",
      caption: (
        <>
          Flip the switch. It looks applied, but the saved setting stays <em>Off</em> until <em>Save settings</em> is
          pressed.
        </>
      ),
      notLinted:
        "Lint gap: the rule sentence does not say a switch must apply its setting at once; that is our own advice in Do.",
      Demo: SettingsWithSwitch,
    },
  ],
};
