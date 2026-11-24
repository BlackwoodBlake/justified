import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { DialogPicture, Outcome } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * FRM-003: a modal form always has a Cancel that works, whatever the fields say.
 *
 * The dialog is drawn in place and opens with a postcode error showing, the
 * moment the rule is about. Cancel and Save close it, and Change address
 * opens it again.
 *
 * The Do also shows our own choice in FRM-003: a field's check waits while
 * focus or a press heads for Cancel. It runs at once if focus moves on to
 * anything else.
 */

type Address = { street: string; postcode: string };

const start: Address = { street: "12 Elm Road", postcode: "11359" };
const message = "Enter a five-digit postcode, for example 11359.";
const valid = (v: string) => /^\d{5}$/.test(v.replace(/\s/g, ""));

function ChangeAddress({ lockCancel }: { lockCancel: boolean }) {
  const [saved, setSaved] = useState<Address>(start);
  const [open, setOpen] = useState(true);
  const [street, setStreet] = useState(start.street);
  const [postcode, setPostcode] = useState("1234");
  const [changed, setChanged] = useState(true);
  const [error, setError] = useState<string | undefined>(message);
  const [said, setSaid] = useState("");
  // After Save moves focus to the field, its error is read with the field, so the region stays quiet.
  const [sent, setSent] = useState(false);
  const formId = useId();

  const cancelRef = useRef<HTMLButtonElement>(null);
  const changeRef = useRef<HTMLButtonElement>(null);
  const streetRef = useRef<HTMLInputElement>(null);
  const postcodeRef = useRef<HTMLInputElement>(null);
  // A press on Cancel has started (Safari does not focus a clicked button).
  const pressingCancel = useRef(false);
  // The postcode check is waiting to see whether the person really cancels.
  const held = useRef(false);
  const moved = useRef(false);

  useEffect(() => {
    if (!moved.current) return;
    (open ? streetRef : changeRef).current?.focus();
  }, [open]);

  const check = (v = postcode) => setError(valid(v) ? undefined : message);

  const runHeld = () => {
    if (held.current) {
      held.current = false;
      check();
    }
  };

  const close = (outcome: string) => {
    held.current = false;
    pressingCancel.current = false;
    moved.current = true;
    setSaid(outcome);
    setOpen(false);
  };

  const cancel = () => close(`Cancelled. The order still goes to ${saved.street}, ${saved.postcode}.`);

  const save = (e: FormEvent) => {
    e.preventDefault();
    held.current = false;
    if (!valid(postcode)) {
      setError(message);
      setSent(document.activeElement !== postcodeRef.current);
      postcodeRef.current?.focus();
      return;
    }
    const next = {
      street: street.trim(),
      postcode: postcode.replace(/\s/g, ""),
    };
    setSaved(next);
    close(`Saved. The order now goes to ${next.street}, ${next.postcode}.`);
  };

  const reopen = () => {
    moved.current = true;
    setStreet(saved.street);
    setPostcode(saved.postcode);
    setChanged(false);
    setError(undefined);
    setSent(false);
    setSaid("");
    setOpen(true);
  };

  // The Outcome line is rendered once, outside both views, so switching views never remounts it.
  return (
    <div className="flex w-full flex-col items-center gap-3">
      {open ? (
        dialog()
      ) : (
        <div className="flex w-full max-w-sm flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background p-4 text-sm">
          <p className="m-0">
            <span className="font-medium">Delivery address:</span> {saved.street}, {saved.postcode}
          </p>
          <Button ref={changeRef} variant="outline" size="sm" onClick={reopen}>
            Change address
          </Button>
        </div>
      )}
      <Outcome>{said}</Outcome>
    </div>
  );

  function dialog() {
    return (
      <DialogPicture
        title="Change delivery address"
        footer={
          <>
            <Button
              ref={cancelRef}
              variant="outline"
              disabled={lockCancel && Boolean(error)}
              onPointerDown={() => {
                pressingCancel.current = true;
                // If the press ends anywhere but on Cancel, the held check runs.
                window.addEventListener(
                  "pointerup",
                  () =>
                    setTimeout(() => {
                      pressingCancel.current = false;
                      runHeld();
                    }, 0),
                  { once: true },
                );
              }}
              onBlur={runHeld}
              onClick={cancel}
            >
              Cancel
            </Button>
            <Button type="submit" form={formId}>
              Save address
            </Button>
          </>
        }
      >
        <form id={formId} noValidate onSubmit={save} className="grid gap-4 text-foreground">
          <Field label="Street address">
            <Input
              ref={streetRef}
              autoComplete="shipping address-line1"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
          </Field>
          <Field label="Postcode" error={error} announce={!sent}>
            <Input
              ref={postcodeRef}
              inputMode="numeric"
              autoComplete="shipping postal-code"
              value={postcode}
              onChange={(e) => {
                setPostcode(e.target.value);
                setChanged(true);
                setSent(false);
                if (error && valid(e.target.value)) setError(undefined);
              }}
              onBlur={(e) => {
                if (!changed) return;
                if (e.relatedTarget === cancelRef.current || pressingCancel.current) held.current = true;
                else check();
              }}
            />
          </Field>
        </form>
      </DialogPicture>
    );
  }
}

function Do() {
  return <ChangeAddress lockCancel={false} />;
}

function Dont() {
  return <ChangeAddress lockCancel />;
}

export const FRM003: RuleExamples = {
  id: "FRM-003",
  examples: [
    {
      kind: "do",
      title: "Cancel works while a field shows an error",
      caption: (
        <>
          <em>Postcode</em> shows an error, and <em>Cancel</em> still works. It closes the dialog and the order keeps
          its old address. Open it again with <em>Change address</em>, replace the postcode with 12 and tab to{" "}
          <em>Cancel</em>: no error appears on the way out. Tab on to <em>Save address</em> and it does.
        </>
      ),
      Demo: Do,
    },
    {
      kind: "dont",
      title: "Cancel greyed out until the form is valid",
      caption: (
        <>
          <em>Cancel</em> stays unavailable while <em>Postcode</em> shows an error. To leave without saving, the person
          first has to fix a value they wanted to throw away.
        </>
      ),
      Demo: Dont,
    },
  ],
};
