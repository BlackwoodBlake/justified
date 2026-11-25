import { Button } from "@blackwoodblake/justified-shadcn/button";
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
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { NativeSelect } from "@blackwoodblake/justified-shadcn/native-select";
import { useRef, useState, type ReactNode } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";
import { FocusTrace, Screen, useFocusTrace } from "./oninput-demo";

/*
 * FRM-013: receiving focus never sends a form, opens a page, a window or a
 * dialog that takes focus, or moves focus on. No notice makes it acceptable.
 *
 * A clinic's booking pages, drawn inside the example. Changes of context are
 * simulated (a drawn page swaps, a real Dialog takes focus) and every scene
 * has a Reset button and a line that says where focus is.
 *
 * Do: focus on a field shows a hint in place, a button opens the filters, a
 * list of clinics is passed through with Tab, and a field nobody should visit
 * is plain text.
 * Don't: the same scenes with the change wired to focus, the first with the
 * notice the rule says does not help.
 */

function Scene({ children, said, onReset }: { children: ReactNode; said: string; onReset: () => void }) {
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

/* --------------------------------------------------------------- Search */

function Search({ opensOnFocus }: { opensOnFocus: boolean }) {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(false);
  const [said, setSaid] = useState("");
  const [opened, setOpened] = useState(0);
  // Focus comes back to the field when the dialog closes; that return is not a new arrival.
  const closedAt = useRef(0);

  const reset = () => {
    setOpen(false);
    setHint(false);
    setSaid("");
    setOpened(0);
  };

  return (
    <Scene said={said} onReset={reset}>
      <div>
        <Screen label="Find a clinic">
          {opensOnFocus && <p className="m-0 text-muted-foreground">Reaching this field opens the filters.</p>}
          <Field label="Search clinics">
            <Input
              autoComplete="off"
              aria-describedby={opensOnFocus ? undefined : "search-hint"}
              onFocus={() => {
                if (opensOnFocus) {
                  if (Date.now() - closedAt.current < 500) return;
                  setOpen(true);
                  setOpened((n) => n + 1);
                  setSaid("Focus alone opened the filters, and they took focus.");
                } else {
                  setHint(true);
                  setSaid("The field has focus. Nothing opened.");
                }
              }}
              onBlur={() => setHint(false)}
            />
          </Field>
          {!opensOnFocus && (
            <p id="search-hint" className="m-0 min-h-5 text-muted-foreground">
              {hint ? "Try a clinic name or a town." : ""}
            </p>
          )}
          {opensOnFocus ? (
            <p className="m-0 text-muted-foreground">
              Opened by focus alone: <strong className="text-foreground">{opened}</strong>
            </p>
          ) : (
            <div>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(true);
                  setSaid("Open filters pressed. The filters opened.");
                }}
              >
                Open filters
              </Button>
            </div>
          )}
        </Screen>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            if (!o) closedAt.current = Date.now();
            setOpen(o);
          }}
        >
          <DialogContent closeLabel="Cancel">
            <DialogHeader>
              <DialogTitle>Search filters</DialogTitle>
              <DialogDescription>Narrow the clinics by distance.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <Field label="Distance">
                <NativeSelect defaultValue="10">
                  <option value="5">Within 5 km</option>
                  <option value="10">Within 10 km</option>
                  <option value="25">Within 25 km</option>
                </NativeSelect>
              </Field>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button>Show clinics</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Scene>
  );
}

/* --------------------------------------------------------------- Clinics */

const CLINICS = ["Harbour clinic", "Northside clinic", "Old Town clinic"];

function Clinics({ opensOnFocus }: { opensOnFocus: boolean }) {
  const [clinic, setClinic] = useState("");
  const [said, setSaid] = useState("");
  return (
    <Scene
      said={said}
      onReset={() => {
        setClinic("");
        setSaid("");
      }}
    >
      <div>
        {clinic ? (
          <Screen label={clinic} arrive={!opensOnFocus}>
            <p className="m-0">You are on the page of the {clinic}.</p>
          </Screen>
        ) : (
          <Screen label="Clinics near you">
            <ul className="m-0 grid list-none gap-2 p-0">
              {CLINICS.map((c) => (
                <li key={c}>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onFocus={() => {
                      if (opensOnFocus) {
                        setClinic(c);
                        setSaid(`Tabbing to ${c} opened its page.`);
                      } else {
                        setSaid(`${c} has focus. Nothing opened.`);
                      }
                    }}
                    onClick={() => {
                      setClinic(c);
                      setSaid(`${c} pressed. Its page opened.`);
                    }}
                  >
                    {c}
                  </Button>
                </li>
              ))}
            </ul>
          </Screen>
        )}
      </div>
    </Scene>
  );
}

/* --------------------------------------------------------------- Patient */

function Patient({ forwards }: { forwards: boolean }) {
  const [said, setSaid] = useState("");
  const [passed, setPassed] = useState(0);
  const reason = useRef<HTMLInputElement>(null);
  // The Don't forwards once, then stops, so Shift+Tab is never stuck on this page. Reset arms it again.
  const armed = useRef(true);
  return (
    <Scene
      said={said}
      onReset={() => {
        setSaid("");
        setPassed(0);
        armed.current = true;
      }}
    >
      <div>
        <Screen label="Book an appointment">
          {forwards ? (
            <Field label="Patient number">
              <Input
                readOnly
                value="P-20931"
                onFocus={() => {
                  if (!armed.current) return;
                  armed.current = false;
                  setPassed((n) => n + 1);
                  setSaid("Patient number received focus and passed it on.");
                  reason.current?.focus();
                }}
              />
            </Field>
          ) : (
            <p className="m-0">
              Patient number: <strong>P-20931</strong>
            </p>
          )}
          <Field label="Reason for visit">
            <Input ref={reason} autoComplete="off" />
          </Field>
          {forwards && (
            <p className="m-0 text-muted-foreground">
              Focus passed on (once, then Reset arms it again): <strong className="text-foreground">{passed}</strong>
            </p>
          )}
        </Screen>
      </div>
    </Scene>
  );
}

export const FRM013: RuleExamples = {
  id: "FRM-013",
  examples: [
    {
      kind: "do",
      title: "Focus shows a hint, a button opens the filters",
      caption: (
        <>
          Tab into <em>Search clinics</em>. A hint appears and focus stays in the field. <em>Open filters</em> is what
          opens the dialog.
        </>
      ),
      Demo: () => <Search opensOnFocus={false} />,
    },
    {
      kind: "dont",
      title: "Reaching the field opens the filters",
      caption: (
        <>
          Tab into <em>Search clinics</em>. The filters open and take focus at once. The line above the field says so,
          and that does not help: a keyboard user cannot reach the field without setting it off.
        </>
      ),
      Demo: () => <Search opensOnFocus />,
    },
    {
      kind: "do",
      title: "Tab passes through the clinics",
      caption: <>Tab through the list. Each clinic gets focus and nothing opens. Enter or a click opens its page.</>,
      Demo: () => <Clinics opensOnFocus={false} />,
    },
    {
      kind: "dont",
      title: "Tabbing to a clinic opens it",
      caption: (
        <>Tab or click into the list. The first clinic opens before anything was pressed. Reset brings the list back.</>
      ),
      Demo: () => <Clinics opensOnFocus />,
    },
    {
      kind: "do",
      title: "A field nobody should visit is text",
      caption: (
        <>
          The patient number is shown as text, so Tab goes straight to <em>Reason for visit</em>.
        </>
      ),
      Demo: () => <Patient forwards={false} />,
    },
    {
      kind: "dont",
      title: "A field forwards focus to the next one",
      caption: (
        <>
          Click <em>Patient number</em>, or Shift+Tab back to it from the next field. Focus is thrown forward as soon as
          it arrives, so the field cannot be reached.
        </>
      ),
      Demo: () => <Patient forwards />,
    },
  ],
};
