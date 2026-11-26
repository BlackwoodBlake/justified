import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Checkbox } from "@blackwoodblake/justified-shadcn/checkbox";
import { Field, FieldSet } from "@blackwoodblake/justified-shadcn/field";
import { AlertIcon, SuccessIcon } from "@blackwoodblake/justified-shadcn/icons";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { NativeSelect } from "@blackwoodblake/justified-shadcn/native-select";
import { Switch } from "@blackwoodblake/justified-shadcn/switch";
import { Textarea } from "@blackwoodblake/justified-shadcn/textarea";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { Outcome, useSay } from "./dialog";
import type { RuleExamples } from "./frame";
import { BrowserWindow, focusHeading, LeaveQuestion, useBrowser, useLeaveGuard } from "./leave-page";

/*
 * FRM-004d (a guideline, our own choice): on a longer page form, keep what
 * the person enters when they leave, and show near the form that it is kept.
 *
 * Both pages sit in the drawn browser window of leave-page.tsx. Nothing real
 * is left, and no beforeunload handler is registered. "Close tab" and "Crash
 * the tab" end the tab; "Reopen tab" loads the page again, so what survives
 * is what the page kept.
 *
 * Hike leader profile, in three behaviours told apart by `mode`:
 *   - "kept" (the Do): each value is saved when the person moves on from its
 *     control, one polite line says what is true, and a failed save is said
 *     in the same line. Leaving asks only while something is not kept.
 *   - "state-only" (a Don't): the values live in the form and nowhere else,
 *     and no line says so. Closing the tab or a crash loses them.
 *   - "false-saved" (a Don't): the line says "All changes saved" at once,
 *     before any answer and after a failed save.
 *
 * Join the club (the second Do): a three-step form that keeps a draft in the
 * browser's storage (here a variable in the example) and says so.
 */

type Profile = { phone: string; firstAid: string; areas: string[]; longest: string; about: string };
type Mode = "kept" | "state-only" | "false-saved";
type Page = "events" | "profile";

const starting: Profile = {
  phone: "07700 900123",
  firstAid: "2026-03-14",
  areas: ["Peak District"],
  longest: "10 to 20 km",
  about: "Leader since 2019. I like early starts.",
};

const areaNames = ["Lake District", "Peak District", "Snowdonia"];
const distances = ["Up to 10 km", "10 to 20 km", "More than 20 km"];

const sameProfile = (a: Profile, b: Profile) =>
  a.phone.trim() === b.phone.trim() &&
  a.firstAid === b.firstAid &&
  a.longest === b.longest &&
  a.about.trim() === b.about.trim() &&
  [...a.areas].sort().join("|") === [...b.areas].sort().join("|");

function Status({ kind, children }: { kind: "saved" | "waiting" | "failed"; children: string }) {
  return (
    <p
      role="status"
      className={`m-0 flex items-center gap-1.5 text-sm ${kind === "failed" ? "font-medium text-destructive" : "text-muted-foreground"}`}
    >
      {kind === "saved" && <SuccessIcon aria-hidden="true" className="size-4 shrink-0" />}
      {kind === "failed" && <AlertIcon aria-hidden="true" className="size-4 shrink-0" />}
      <span>{children}</span>
    </p>
  );
}

function HikeProfile({ mode }: { mode: Mode }) {
  const browser = useBrowser<Page>(["events", "profile"]);
  const guard = useLeaveGuard();
  const [server, setServer] = useState<Profile>(starting);
  const [values, setValues] = useState<Profile>(starting);
  // What the page believes is saved. Only the "false-saved" Don't differs from the server.
  const [believed, setBelieved] = useState<Profile>(starting);
  const [phase, setPhase] = useState<"idle" | "saving" | "failed">("idle");
  const [offline, setOffline] = useState(mode === "false-saved");
  const [tabPrompt, setTabPrompt] = useState(false);
  const [said, say] = useSay();
  const windowRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const valuesRef = useRef(values);
  const offlineRef = useRef(offline);
  const shown = useRef(`${browser.page}-${browser.closed}`);
  valuesRef.current = values;
  offlineRef.current = offline;

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const now = `${browser.page}-${browser.closed}`;
    if (shown.current !== now) focusHeading(windowRef.current);
    shown.current = now;
  }, [browser.page, browser.closed]);

  // What a freshly loaded page shows: what was kept, or the starting values if nothing is kept.
  const load = () => (mode === "state-only" ? starting : server);
  const kept = mode === "state-only" ? starting : mode === "false-saved" ? believed : server;
  const dirty = browser.page === "profile" && !sameProfile(values, kept);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  // A save that finishes while the question is open: everything is kept now, so close it and carry on.
  useEffect(() => {
    if (guard.pending && !dirty) guard.leave();
  });

  const fresh = () => {
    clearTimeout(timer.current);
    setPhase("idle");
    const v = load();
    setValues(v);
    setBelieved(v);
  };

  const commit = () => {
    if (mode === "state-only") return;
    const v = valuesRef.current;
    if (mode === "kept" && sameProfile(v, server) && phase !== "failed") return;
    if (mode === "false-saved") {
      if (sameProfile(v, believed)) return;
      setBelieved(v);
    } else setPhase("saving");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (offlineRef.current) {
        if (mode === "kept") setPhase("failed");
        return;
      }
      setServer(v);
      setPhase("idle");
    }, 700);
  };

  const attempt = (opener: HTMLElement | null, go: () => void) => guard.attempt(opener, go, dirty);

  const enter = (page: Page) => {
    if (page === "profile") fresh();
    browser.push(page);
  };

  const lostWhat = () => (dirtyRef.current ? "What was not kept is gone." : "Everything was kept.");

  const status = (): { kind: "saved" | "waiting" | "failed"; text: string } | null => {
    if (mode === "state-only") return null;
    if (mode === "false-saved") return { kind: "saved", text: "All changes saved" };
    if (phase === "saving") return { kind: "waiting", text: "Saving …" };
    if (phase === "failed") return { kind: "failed", text: "Not saved. Check your connection." };
    if (!sameProfile(values, server))
      return { kind: "waiting", text: "Not saved yet. Moving to the next field saves it." };
    return { kind: "saved", text: "All changes saved" };
  };
  const line = status();

  const toggleArea = (name: string, on: boolean) =>
    setValues((v) => ({ ...v, areas: on ? [...v.areas, name] : v.areas.filter((a) => a !== name) }));

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <BrowserWindow
        label="A drawn browser window"
        address={browser.page === "profile" ? "hikeclub.example/leaders/profile" : "hikeclub.example/events"}
        canBack={Boolean(browser.previous)}
        onBack={(opener) =>
          attempt(opener, () => {
            say(`Moved back. ${lostWhat()}`);
            if (browser.previous === "profile") fresh();
            browser.back();
          })
        }
        onClose={() => {
          if (dirty) {
            say("The browser asks before the tab closes. Cancel keeps the page, Leave closes the tab.");
            setTabPrompt(true);
          } else {
            say("The tab closed. Nothing was asked, because everything was kept.");
            browser.close();
          }
        }}
        closedHow={browser.closed}
        onReopen={() => {
          fresh();
          browser.reopen("profile");
          say(
            mode === "state-only"
              ? "Reopened. Everything you changed is gone."
              : "Reopened. The page shows what had been saved.",
          );
        }}
        menu={[
          { id: "events", label: "Events" },
          { id: "profile", label: "Hike leader profile" },
        ]}
        current={browser.page}
        onMenu={(id, opener) =>
          attempt(opener, () => {
            say(`Moved to ${id === "events" ? "Events" : "Hike leader profile"}. ${lostWhat()}`);
            enter(id as Page);
          })
        }
        prompt={tabPrompt}
        onStay={() => {
          setTabPrompt(false);
          say("Stayed on the page. Every value is still there.");
        }}
        onLeave={() => {
          setTabPrompt(false);
          say("The tab closed. What was not kept is gone.");
          browser.close();
        }}
        windowRef={windowRef}
      >
        {browser.page === "profile" ? (
          <form
            noValidate
            onSubmit={(e: FormEvent) => e.preventDefault()}
            onBlur={(e) => {
              // Moving between the boxes of one group is not moving on from the control.
              const group = (e.target as HTMLElement).closest("fieldset");
              if (group && group === (e.relatedTarget as HTMLElement | null)?.closest("fieldset")) return;
              commit();
            }}
            className="grid gap-4"
          >
            <div className="grid gap-1">
              <h4 data-page-heading tabIndex={-1} className="m-0 text-base font-semibold">
                Hike leader profile
              </h4>
              {line && <Status kind={line.kind}>{line.text}</Status>}
            </div>
            <Field label="Phone">
              <Input
                type="tel"
                autoComplete="tel"
                value={values.phone}
                onChange={(e) => setValues({ ...values, phone: e.target.value })}
              />
            </Field>
            <Field label="First aid course date">
              <Input
                type="date"
                value={values.firstAid}
                onChange={(e) => setValues({ ...values, firstAid: e.target.value })}
              />
            </Field>
            <FieldSet legend="Areas you lead in">
              {areaNames.map((a) => (
                <Field key={a} label={a} layout="inline">
                  <Checkbox checked={values.areas.includes(a)} onCheckedChange={(on) => toggleArea(a, on === true)} />
                </Field>
              ))}
            </FieldSet>
            <Field label="Longest hike you lead">
              <NativeSelect value={values.longest} onChange={(e) => setValues({ ...values, longest: e.target.value })}>
                {distances.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="About you">
              <Textarea
                rows={3}
                value={values.about}
                onChange={(e) => setValues({ ...values, about: e.target.value })}
              />
            </Field>
          </form>
        ) : (
          <div className="grid gap-3">
            <h4 data-page-heading tabIndex={-1} className="m-0 text-base font-semibold">
              Events
            </h4>
            <p className="m-0 text-muted-foreground">Three hikes this month.</p>
          </div>
        )}
      </BrowserWindow>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <Field label="Pretend the connection is lost" layout="inline">
          <Switch checked={offline} onCheckedChange={setOffline} />
        </Field>
        <Button
          variant="outline"
          size="sm"
          disabled={Boolean(browser.closed)}
          onClick={() => {
            setTabPrompt(false);
            say("The tab crashed. The browser showed no question.");
            browser.close("crashed");
          }}
        >
          Crash the tab
        </Button>
      </div>

      <LeaveQuestion
        guard={guard}
        title="Discard changes to your profile?"
        text="The changes that were not kept will be lost."
        afterLeave={() => focusHeading(windowRef.current)}
      />
      <Outcome>{said || "You are on Hike leader profile. Change a value and move on to the next field."}</Outcome>
    </div>
  );
}

/* ---- Join the club -------------------------------------------------------- */

type Answers = { name: string; email: string; area: string; level: string; contact: string; contactPhone: string };
type JoinPage = "home" | "step1" | "step2" | "step3" | "welcome";

const blank: Answers = { name: "", email: "", area: "", level: "", contact: "", contactPhone: "" };
const stepTitles = ["Your details", "Where you hike", "Emergency contact"];

function JoinClub() {
  const browser = useBrowser<JoinPage>(["home", "step1"]);
  const [answers, setAnswers] = useState<Answers>(blank);
  // The browser's storage: the draft for this form. It outlives the tab.
  const [draft, setDraft] = useState<Answers | null>(null);
  const [note, setNote] = useState<"idle" | "kept" | "back" | "discarded">("idle");
  const [thrown, setThrown] = useState<Answers | null>(null);
  const [said, say] = useSay();
  const windowRef = useRef<HTMLDivElement>(null);
  const shown = useRef(`${browser.page}-${browser.closed}`);
  const discardButton = useRef<HTMLButtonElement>(null);
  const undoButton = useRef<HTMLButtonElement>(null);
  const focusNext = useRef<"discard" | "undo" | null>(null);

  useEffect(() => {
    const now = `${browser.page}-${browser.closed}`;
    if (shown.current !== now) focusHeading(windowRef.current);
    shown.current = now;
  }, [browser.page, browser.closed]);

  // The button that was pressed is gone; the one that replaces it takes focus.
  useEffect(() => {
    if (focusNext.current === "undo") undoButton.current?.focus();
    if (focusNext.current === "discard") discardButton.current?.focus();
    focusNext.current = null;
  }, [note]);

  const change = (key: keyof Answers, v: string) => {
    const next = { ...answers, [key]: v };
    setAnswers(next);
    setDraft(next);
    setNote("kept");
  };

  // Loading the form: an existing draft comes back, with a word about it.
  const loadForm = () => {
    if (draft) {
      setAnswers(draft);
      setNote("back");
    } else {
      setAnswers(blank);
      setNote("idle");
    }
  };

  const step = browser.page.startsWith("step") ? Number(browser.page.slice(4)) : 0;

  const discard = () => {
    setThrown(draft);
    setDraft(null);
    setAnswers(blank);
    setNote("discarded");
    focusNext.current = "undo";
  };

  const undo = () => {
    if (!thrown) return;
    setDraft(thrown);
    setAnswers(thrown);
    setNote("kept");
    focusNext.current = "discard";
  };

  const finish = (e: FormEvent) => {
    e.preventDefault();
    setDraft(null);
    setNote("idle");
    say("Joined. The draft was removed, so it will not come back on a later visit.");
    browser.push("welcome");
  };

  const next = (e: FormEvent) => {
    e.preventDefault();
    browser.push(`step${step + 1}` as JoinPage);
  };

  const text =
    note === "back"
      ? "Your draft from earlier is back."
      : note === "kept"
        ? "Draft kept in this browser."
        : note === "discarded"
          ? "Draft discarded."
          : "Your answers are kept in this browser as you go.";

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <BrowserWindow
        label="A drawn browser window"
        address={
          step
            ? `hikeclub.example/join/${step}`
            : browser.page === "welcome"
              ? "hikeclub.example/welcome"
              : "hikeclub.example"
        }
        canBack={Boolean(browser.previous)}
        onBack={() => {
          say("Moved back. Nothing was asked, and every answer is as it was.");
          browser.back();
        }}
        onClose={() => {
          say("The tab closed. Nothing was asked, because the draft is kept.");
          browser.close();
        }}
        closedHow={browser.closed}
        onReopen={() => {
          loadForm();
          browser.reopen("step1");
          say(draft ? "Reopened. The form loaded with the draft." : "Reopened. There was nothing to keep.");
        }}
        menu={[
          { id: "home", label: "Home" },
          { id: "step1", label: "Join the club" },
        ]}
        current={step ? "step1" : browser.page}
        onMenu={(id) => {
          say(`Moved to ${id === "home" ? "Home" : "Join the club"}. Nothing was asked.`);
          if (id === "step1") loadForm();
          browser.push(id as JoinPage);
        }}
        prompt={false}
        onStay={() => undefined}
        onLeave={() => undefined}
        windowRef={windowRef}
      >
        {step > 0 && (
          <form noValidate onSubmit={step === 3 ? finish : next} className="grid gap-4">
            <div className="grid gap-1">
              <h4 data-page-heading tabIndex={-1} className="m-0 text-base font-semibold">
                Join the club
              </h4>
              <p className="m-0 text-muted-foreground">
                Step {step} of 3: {stepTitles[step - 1]}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p role="status" className="m-0 text-sm text-muted-foreground">
                  {text}
                </p>
                {(note === "kept" || note === "back") && (
                  <Button ref={discardButton} type="button" variant="outline" size="sm" onClick={discard}>
                    Discard draft
                  </Button>
                )}
                {note === "discarded" && thrown && (
                  <Button ref={undoButton} type="button" variant="outline" size="sm" onClick={undo}>
                    Undo
                  </Button>
                )}
              </div>
            </div>
            {step === 1 && (
              <>
                <Field label="Full name">
                  <Input autoComplete="name" value={answers.name} onChange={(e) => change("name", e.target.value)} />
                </Field>
                <Field label="Email address">
                  <Input
                    type="email"
                    autoComplete="email"
                    value={answers.email}
                    onChange={(e) => change("email", e.target.value)}
                  />
                </Field>
              </>
            )}
            {step === 2 && (
              <>
                <Field label="Home area">
                  <NativeSelect value={answers.area} onChange={(e) => change("area", e.target.value)}>
                    <option value="">Not chosen</option>
                    {areaNames.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </NativeSelect>
                </Field>
                <Field label="Hiking experience">
                  <NativeSelect value={answers.level} onChange={(e) => change("level", e.target.value)}>
                    <option value="">Not chosen</option>
                    <option>Beginner</option>
                    <option>Some experience</option>
                    <option>Experienced</option>
                  </NativeSelect>
                </Field>
              </>
            )}
            {step === 3 && (
              <>
                <Field label="Emergency contact name">
                  <Input
                    autoComplete="off"
                    value={answers.contact}
                    onChange={(e) => change("contact", e.target.value)}
                  />
                </Field>
                <Field label="Emergency contact phone">
                  <Input
                    type="tel"
                    autoComplete="off"
                    value={answers.contactPhone}
                    onChange={(e) => change("contactPhone", e.target.value)}
                  />
                </Field>
              </>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    say("Went back a step. Every answer is as it was.");
                    browser.back();
                  }}
                >
                  Previous step
                </Button>
              )}
              <Button type="submit">{step === 3 ? "Join the club" : "Continue"}</Button>
            </div>
          </form>
        )}
        {browser.page === "home" && (
          <div className="grid gap-3">
            <h4 data-page-heading tabIndex={-1} className="m-0 text-base font-semibold">
              Home
            </h4>
            <p className="m-0 text-muted-foreground">Weekend hikes for every level.</p>
          </div>
        )}
        {browser.page === "welcome" && (
          <div className="grid gap-3">
            <h4 data-page-heading tabIndex={-1} className="m-0 text-base font-semibold">
              Welcome to the club
            </h4>
            <p className="m-0 text-muted-foreground">Your membership is ready.</p>
          </div>
        )}
      </BrowserWindow>
      <Outcome>{said || "You are on Join the club, step 1. Type an answer, then leave in any way you like."}</Outcome>
    </div>
  );
}

export const FRM004d: RuleExamples = {
  id: "FRM-004d",
  examples: [
    {
      kind: "do",
      title: "Save as the person moves on, and say so",
      caption: (
        <>
          Change <em>Phone</em> or tick an area and move on: the line at the top goes from &ldquo;Not saved yet&rdquo;
          to &ldquo;Saving &hellip;&rdquo; to &ldquo;All changes saved&rdquo;. <em>Close tab</em> then asks nothing, and{" "}
          <em>Reopen tab</em> shows your values. Turn on the lost connection and move on again: the same line says it
          was not saved, and leaving asks until a save works.
        </>
      ),
      Demo: () => <HikeProfile mode="kept" />,
    },
    {
      kind: "do",
      title: "Keep a draft across steps and visits, and say where",
      caption: (
        <>
          Fill in <em>Full name</em>, press <em>Continue</em>, then use the drawn <em>Back</em>: every answer is still
          there. <em>Close tab</em> asks nothing; <em>Reopen tab</em> brings the draft back with a line about it and{" "}
          <em>Discard draft</em>, which has an <em>Undo</em>. After <em>Join the club</em> the draft is gone.
        </>
      ),
      Demo: JoinClub,
    },
    {
      kind: "dont",
      title: "Hold the values in the page only, with no line",
      caption: (
        <>
          Change a value. Nothing is saved and nothing says so. Leaving asks, but a crash shows no question: press{" "}
          <em>Crash the tab</em>, then <em>Reopen tab</em>, and every change is gone.
        </>
      ),
      Demo: () => <HikeProfile mode="state-only" />,
    },
    {
      kind: "dont",
      title: "Say “All changes saved” before it is true",
      caption: (
        <>
          The connection is already lost. Change a value and move on: the line says &ldquo;All changes saved&rdquo; at
          once and keeps saying it. Close the tab and reopen it, and the change is gone with no warning.
        </>
      ),
      Demo: () => <HikeProfile mode="false-saved" />,
    },
  ],
};
