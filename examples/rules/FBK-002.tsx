import { Alert } from "@blackwoodblake/justified-shadcn/alert";
import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { AlertIcon, SuccessIcon } from "@blackwoodblake/justified-shadcn/icons";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";
import { Toast, ToastRegion } from "./toast";

/*
 * FBK-002: show a failed action where it started, and keep it there.
 *
 * The panel opens just after a save that failed. In the Do the failure is a
 * notice inside the panel, above its buttons, and it stays until a new try
 * works or the panel is closed. In the Don't the same words come only in a
 * toast below the panel that goes after five seconds.
 *
 * Both examples write their messages into regions that are in the page from
 * the start (FBK-004), and the toast covers nothing (KBD-002), so the only
 * fault in the Don't is where the failure shows and for how long.
 *
 * The opening notice (Do) and the opening toast (Don't) are part of the
 * starting scene, like content that is there when a page loads, and are not
 * meant to be announced. Every later message is written into the region that
 * is already in the page.
 */

type Address = { street: string; postcode: string; city: string };

const saved: Address = { street: "21 Birch Street", postcode: "11122", city: "Stockholm" };
const typed: Address = { street: "4 Mill Lane", postcode: "11359", city: "Stockholm" };

const failTitle = "The address could not be saved.";
const failText = "The server did not respond. Your changes are still here. Try again in a moment.";

type Notice = "none" | "failed" | "saved";

function DeliveryPanel({ toastOnly }: { toastOnly: boolean }) {
  const [open, setOpen] = useState(true);
  const [address, setAddress] = useState<Address>(typed);
  const [current, setCurrent] = useState<Address>(saved);
  // Do: the notice in the panel. It opens in the moment after the failed save.
  const [notice, setNotice] = useState<Notice>(toastOnly ? "none" : "failed");
  // A new key for each attempt, so the same words are written again and heard again.
  const [attempt, setAttempt] = useState(0);
  // Don't: the toast below the panel, also shown at the start.
  const [toast, setToast] = useState(toastOnly ? 1 : 0);
  const [said, setSaid] = useState("");
  const formId = useId();

  const streetRef = useRef<HTMLInputElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);
  const changeRef = useRef<HTMLButtonElement>(null);
  const focusNext = useRef<HTMLElement | null>(null);
  // Set on reopen: the street field is not in the page until the panel renders.
  const focusStreet = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The toast goes by itself after five seconds. That is the fault.
  useEffect(() => {
    if (!toast) return;
    timer.current = setTimeout(() => setToast(0), 5000);
    return () => clearTimeout(timer.current);
  }, [toast]);

  useEffect(() => {
    focusNext.current?.focus();
    focusNext.current = null;
    if (focusStreet.current && streetRef.current) {
      focusStreet.current = false;
      streetRef.current.focus();
    }
  });

  const save = (e?: FormEvent) => {
    e?.preventDefault();
    setSaid("");
    if (toastOnly) {
      // Every try fails here, so the toast can be watched as it goes.
      setToast((n) => n + 1);
      return;
    }
    // The second try works, and the notice says so in the same place (FBK-003).
    setCurrent({ ...address });
    setNotice("saved");
    setAttempt((n) => n + 1);
  };

  const retry = () => {
    // Try again is about to leave, so focus moves on to Save address.
    focusNext.current = saveRef.current;
    save();
  };

  const cancel = () => {
    setToast(0);
    setNotice("none");
    const unsaved =
      address.street !== current.street || address.postcode !== current.postcode || address.city !== current.city;
    // Say what really happened: changes thrown away, a saved address kept, or nothing changed.
    setSaid(
      unsaved
        ? "Cancelled. Your unsaved changes were not kept."
        : notice === "saved"
          ? "Closed. The saved address is kept."
          : "Cancelled. The delivery address was not changed.",
    );
    focusNext.current = null;
    setOpen(false);
  };

  useEffect(() => {
    if (!open) changeRef.current?.focus();
  }, [open]);

  const reopen = () => {
    setAddress({ ...current });
    setSaid("");
    focusStreet.current = true;
    setOpen(true);
  };

  const reset = () => {
    setAddress(typed);
    setCurrent(saved);
    setSaid("");
    setOpen(true);
    if (toastOnly) {
      setNotice("none");
      setToast((n) => n + 1);
    } else {
      setNotice("failed");
      setAttempt((n) => n + 1);
    }
  };

  const set = (k: keyof Address) => (e: { target: { value: string } }) => {
    setAddress({ ...address, [k]: e.target.value });
    // "Address saved." no longer describes what is in the fields once they change again.
    if (notice === "saved") setNotice("none");
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-stretch gap-3">
      {open ? (
        <div
          role="group"
          aria-labelledby={`${formId}-title`}
          className="rounded-lg border border-border bg-popover p-5 text-popover-foreground shadow-lg"
        >
          <h4 id={`${formId}-title`} className="m-0 text-base font-semibold leading-snug">
            Delivery address
          </h4>
          <form id={formId} noValidate onSubmit={save} className="mt-4 grid gap-4">
            <Field label="Street address">
              <Input
                ref={streetRef}
                autoComplete="shipping address-line1"
                value={address.street}
                onChange={set("street")}
              />
            </Field>
            <Field label="Postcode">
              <Input
                inputMode="numeric"
                autoComplete="shipping postal-code"
                value={address.postcode}
                onChange={set("postcode")}
              />
            </Field>
            <Field label="City">
              <Input autoComplete="shipping address-level2" value={address.city} onChange={set("city")} />
            </Field>
          </form>

          {!toastOnly && (
            // The box is always here. Only its words change, inside a status region that never leaves.
            <Alert
              variant={notice === "failed" ? "destructive" : "default"}
              className={notice === "none" ? "contents" : "mt-4"}
            >
              {notice === "failed" && <AlertIcon />}
              {notice === "saved" && <SuccessIcon className="text-success" />}
              <div role="status" className="col-start-2">
                {notice === "failed" && (
                  <div key={attempt}>
                    <p className="m-0 font-medium">{failTitle}</p>
                    <p className="m-0 mt-1 text-muted-foreground">{failText}</p>
                  </div>
                )}
                {notice === "saved" && (
                  <p key={attempt} className="m-0 font-medium">
                    Address saved.
                  </p>
                )}
              </div>
              {notice === "failed" && (
                <div className="col-start-2 mt-2">
                  <Button variant="outline" size="sm" onClick={retry}>
                    Try again
                  </Button>
                </div>
              )}
            </Alert>
          )}

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={cancel}>
              Cancel
            </Button>
            <Button ref={saveRef} type="submit" form={formId}>
              Save address
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background p-4 text-sm">
          <p className="m-0">
            <span className="font-medium">Delivery address:</span> {current.street}, {current.postcode} {current.city}
          </p>
          <Button ref={changeRef} variant="outline" size="sm" onClick={reopen}>
            Change address
          </Button>
        </div>
      )}

      {toastOnly && (
        <ToastRegion>
          {toast > 0 && (
            <Toast key={toast}>
              {failTitle} {failText}
            </Toast>
          )}
        </ToastRegion>
      )}

      <Outcome>{said}</Outcome>
      <div className="flex justify-center">
        <Button variant="link" size="sm" onClick={reset}>
          Reset example
        </Button>
      </div>
    </div>
  );
}

export const FBK002: RuleExamples = {
  id: "FBK-002",
  examples: [
    {
      kind: "do",
      title: "A notice in the panel that stays",
      caption: (
        <>
          The save has just failed. The notice sits in the panel, above its buttons, and your typed address is still in
          the fields. Wait as long as you like: it stays. Press <em>Try again</em> or <em>Save address</em> and the save
          works: "Address saved." takes the notice's place. <em>Reset example</em> brings the failure back.
        </>
      ),
      Demo: () => <DeliveryPanel toastOnly={false} />,
    },
    {
      kind: "dont",
      title: "Only a toast that fades",
      caption: (
        <>
          The same failure shows only in a toast below the panel, and it goes after five seconds. Then the panel looks
          as if nothing went wrong. Press <em>Save address</em> again and watch the toast go.
        </>
      ),
      Demo: () => <DeliveryPanel toastOnly />,
    },
  ],
};
