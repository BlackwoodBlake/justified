import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Checkbox } from "@blackwoodblake/justified-shadcn/checkbox";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * ACT-003b: a button that acts on one part of a page sits inside that part.
 *
 * An account page with two small forms. In the Do each form ends with its
 * own save button and its own lasting result line. In the Don't one
 * "Save changes" in the page header serves both.
 *
 * The newsletter setting is a Checkbox, not a Switch: it waits for a save
 * button, and the Switch is for settings that take effect at once.
 */

function useSaid() {
  const [said, setSaid] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  // Empty first, so saving twice is announced twice.
  const say = (s: string) => {
    setSaid("");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaid(s), 50);
  };
  const clear = () => {
    clearTimeout(timer.current);
    setSaid("");
  };
  return [said, say, clear] as const;
}

/* The result line sits under its form, aligned with the fields. */
function Line({ children }: { children: ReactNode }) {
  return <div className="[&>p]:text-left">{children}</div>;
}

/* Each form has a light frame, so the part a button acts on is plain to see. */
const part = "grid gap-4 rounded-md border border-border p-3";

function AccountPage({ perForm }: { perForm: boolean }) {
  const [street, setStreet] = useState("12 Elm Road");
  const [postcode, setPostcode] = useState("11359");
  const [newsletter, setNewsletter] = useState(false);
  const [addressSaid, sayAddress, clearAddress] = useSaid();
  const [prefsSaid, sayPrefs, clearPrefs] = useSaid();
  const [pageSaid, sayPage, clearPage] = useSaid();
  const addressId = useId();
  const prefsId = useId();

  const changed = () => {
    clearAddress();
    clearPage();
  };

  const saveAddress = (e: FormEvent) => {
    e.preventDefault();
    if (perForm) sayAddress("Address saved.");
  };
  const savePrefs = (e: FormEvent) => {
    e.preventDefault();
    if (perForm) sayPrefs("Preferences saved.");
  };

  return (
    <div className="grid w-full max-w-md gap-6 rounded-lg border border-border bg-background p-4 text-foreground">
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="m-0 text-lg font-semibold">Account</h4>
          {!perForm && (
            <Button variant="outline" onClick={() => sayPage("Changes saved.")}>
              Save changes
            </Button>
          )}
        </div>
        {!perForm && (
          <Line>
            <Outcome>{pageSaid}</Outcome>
          </Line>
        )}
      </div>

      <form noValidate aria-labelledby={addressId} onSubmit={saveAddress} className={part}>
        <h5 id={addressId} className="m-0 text-base font-semibold">
          Delivery address
        </h5>
        <Field label="Street address">
          <Input
            autoComplete="shipping address-line1"
            value={street}
            onChange={(e) => {
              setStreet(e.target.value);
              changed();
            }}
          />
        </Field>
        <Field label="Postcode">
          <Input
            inputMode="numeric"
            autoComplete="shipping postal-code"
            value={postcode}
            onChange={(e) => {
              setPostcode(e.target.value);
              changed();
            }}
          />
        </Field>
        {perForm && (
          <>
            <div>
              <Button type="submit" variant="outline">
                Save address
              </Button>
            </div>
            <Line>
              <Outcome>{addressSaid}</Outcome>
            </Line>
          </>
        )}
      </form>

      <form noValidate aria-labelledby={prefsId} onSubmit={savePrefs} className={part}>
        <h5 id={prefsId} className="m-0 text-base font-semibold">
          Newsletter
        </h5>
        <Field label="Send me the monthly newsletter" layout="inline">
          <Checkbox
            checked={newsletter}
            onCheckedChange={(v) => {
              setNewsletter(v === true);
              clearPrefs();
              clearPage();
            }}
          />
        </Field>
        {perForm && (
          <>
            <div>
              <Button type="submit" variant="outline">
                Save preferences
              </Button>
            </div>
            <Line>
              <Outcome>{prefsSaid}</Outcome>
            </Line>
          </>
        )}
      </form>
    </div>
  );
}

export const ACT003b: RuleExamples = {
  id: "ACT-003b",
  examples: [
    {
      kind: "do",
      title: "Each form has its own save button",
      caption: (
        <>
          Each save button sits at the end of the fields it saves. Tick <em>Send me the monthly newsletter</em> and
          press <em>Save preferences</em>: "Preferences saved." appears under that form and stays, and the address form
          does not change. <em>Save address</em> works the same way for its own form.
        </>
      ),
      Demo: () => <AccountPage perForm />,
    },
    {
      kind: "dont",
      title: "One save button at the top of the page",
      caption: (
        <>
          A single <em>Save changes</em> sits beside the title, far from both forms. Tick the newsletter box and press
          it: "Changes saved." does not say whether it saved the address, the newsletter or both.
        </>
      ),
      Demo: () => <AccountPage perForm={false} />,
    },
  ],
};
