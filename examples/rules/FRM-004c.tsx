import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { Textarea } from "@blackwoodblake/justified-shadcn/textarea";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { Outcome, useSay } from "./dialog";
import type { RuleExamples } from "./frame";
import { BrowserWindow, focusHeading, LeaveQuestion, useBrowser, useLeaveGuard } from "./leave-page";

/*
 * FRM-004c (a guideline, our own choice): when leaving a page would throw
 * away unsaved changes, ask first, by every way out. When nothing would be
 * lost, leave at once.
 *
 * Nothing real is left: the page sits in a drawn browser window with its own
 * Back, menu links and "Close tab" (see leave-page.tsx). The question is the
 * system's AlertDialog with the words of FRM-004a and FRM-004b. Closing the
 * tab shows the browser's own prompt as a drawing.
 *
 * Three behaviours of one page, told apart by `guard`:
 *   - "every-way" (the Do): one guard for every way out; a change is a value
 *     that differs from what the page loaded with; after a save the starting
 *     values are reset, so the move after saving asks nothing.
 *   - "cancel-only" (a Don't): the page's Cancel asks, but a menu link, Back
 *     and closing the tab leave with no question.
 *   - "no-reset" (a Don't): everything asks, but the starting values are never
 *     reset, so the move that follows a successful save asks too.
 */

type Guard = "every-way" | "cancel-only" | "no-reset";
type Page = "listings" | "edit" | "bookings";
type Values = { title: string; description: string; price: string };

const loaded: Values = {
  title: "Harbour Cottage",
  description: "Two bedrooms by the water, ten minutes from the ferry.",
  price: "120",
};

const names: Record<Page, string> = { listings: "Listings", edit: "Edit listing", bookings: "Bookings" };
const addresses: Record<Page, string> = {
  listings: "hosts.example/listings",
  edit: "hosts.example/listings/harbour-cottage/edit",
  bookings: "hosts.example/bookings",
};

const same = (a: Values, b: Values) => (Object.keys(a) as (keyof Values)[]).every((k) => a[k].trim() === b[k].trim());

function Listing({ guard: mode }: { guard: Guard }) {
  const browser = useBrowser<Page>(["listings", "edit"]);
  const guard = useLeaveGuard();
  const [saved, setSaved] = useState<Values>(loaded);
  const [values, setValues] = useState<Values>(loaded);
  const [titleError, setTitleError] = useState<string | undefined>();
  const [tabPrompt, setTabPrompt] = useState(false);
  const [said, say] = useSay();
  const windowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const shown = useRef(`${browser.page}-${browser.closed}`);

  // The page's starting values: what it loaded with. The Do resets them after a save; the "no-reset" Don't keeps
  // them until the page loads again, so only the move right after the save is wrong.
  const [start, setStart] = useState<Values>(loaded);
  const dirty = browser.page === "edit" && !same(values, start);
  const asksEverywhere = mode !== "cancel-only";

  // A new page takes focus on its heading, as a router should. Not on first load.
  useEffect(() => {
    const now = `${browser.page}-${browser.closed}`;
    if (shown.current !== now) focusHeading(windowRef.current);
    shown.current = now;
  }, [browser.page, browser.closed]);

  const enter = (page: Page) => {
    if (page === "edit") {
      setValues(saved);
      setStart(saved);
      setTitleError(undefined);
    }
    browser.push(page);
  };

  const left = (page: string, lost: boolean) =>
    say(lost ? `Moved to ${page}. The changes were discarded.` : `Moved to ${page}. Nothing was asked.`);

  const goTo = (page: Page) => (opener: HTMLElement) =>
    guard.attempt(
      opener,
      () => {
        left(names[page], dirty);
        enter(page);
      },
      dirty && asksEverywhere,
    );

  const cancelPage = (opener: HTMLElement) =>
    // The page's own Cancel asks in every version of the page.
    guard.attempt(
      opener,
      () => {
        left(names.listings, dirty);
        enter("listings");
      },
      dirty,
    );

  const back = (opener: HTMLElement) => {
    const target = browser.previous ? names[browser.previous] : "the previous page";
    guard.attempt(
      opener,
      () => {
        left(target, dirty);
        if (browser.previous === "edit") {
          setValues(saved);
          setStart(saved);
        }
        browser.back();
      },
      dirty && asksEverywhere,
    );
  };

  const closeTab = () => {
    if (dirty && asksEverywhere) {
      say("The browser asks before the tab closes. Cancel keeps the page, Leave closes the tab.");
      setTabPrompt(true);
    } else {
      say(dirty ? "The tab closed at once. What you changed is gone." : "The tab closed. Nothing was asked.");
      browser.close();
    }
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!values.title.trim()) {
      setTitleError("Enter a title for the listing.");
      titleRef.current?.focus();
      return;
    }
    setSaved(values);
    // The Do resets the starting values to the saved ones here, so the move below sees nothing unsaved.
    const asksNow = mode === "no-reset" && !same(values, start);
    if (!asksNow) setStart(values);
    guard.attempt(
      document.activeElement as HTMLElement | null,
      () => {
        say(
          asksNow
            ? "Saved, but the page asked to discard changes that were already saved. You are on Listings."
            : "Saved. You are back on Listings, and nothing was asked.",
        );
        enter("listings");
      },
      asksNow,
    );
  };

  const page = browser.page;

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <BrowserWindow
        label="A drawn browser window"
        address={addresses[page]}
        canBack={Boolean(browser.previous)}
        onBack={back}
        onClose={closeTab}
        closedHow={browser.closed}
        onReopen={() => {
          setValues(saved);
          browser.reopen("edit");
          say("Reopened. The page loaded again with the saved values.");
        }}
        menu={[
          { id: "listings", label: "Listings" },
          { id: "bookings", label: "Bookings" },
        ]}
        current={page}
        onMenu={(id, opener) => goTo(id as Page)(opener)}
        prompt={tabPrompt}
        onStay={() => {
          setTabPrompt(false);
          say("Stayed on the page. Every value is still there.");
        }}
        onLeave={() => {
          setTabPrompt(false);
          say("The tab closed. What you changed is gone.");
          browser.close();
        }}
        windowRef={windowRef}
      >
        {page === "edit" && (
          <form noValidate onSubmit={save} className="grid gap-4">
            <h4 data-page-heading tabIndex={-1} className="m-0 text-base font-semibold">
              Edit listing
            </h4>
            <Field label="Title" error={titleError} announce={false}>
              <Input
                ref={titleRef}
                autoComplete="off"
                value={values.title}
                onChange={(e) => {
                  setValues({ ...values, title: e.target.value });
                  if (titleError && e.target.value.trim()) setTitleError(undefined);
                }}
              />
            </Field>
            <Field label="Description">
              <Textarea
                rows={3}
                value={values.description}
                onChange={(e) => setValues({ ...values, description: e.target.value })}
              />
            </Field>
            <Field label="Nightly price">
              <Input
                inputMode="numeric"
                autoComplete="off"
                value={values.price}
                onChange={(e) => setValues({ ...values, price: e.target.value })}
              />
            </Field>
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={(e) => cancelPage(e.currentTarget)}>
                Cancel
              </Button>
              <Button type="submit">Save listing</Button>
            </div>
          </form>
        )}
        {page === "listings" && (
          <div className="grid gap-3">
            <h4 data-page-heading tabIndex={-1} className="m-0 text-base font-semibold">
              Listings
            </h4>
            <p className="m-0">
              {saved.title}, {saved.price} a night
            </p>
            <div>
              <Button variant="outline" size="sm" onClick={() => enter("edit")}>
                Edit {saved.title}
              </Button>
            </div>
          </div>
        )}
        {page === "bookings" && (
          <div className="grid gap-3">
            <h4 data-page-heading tabIndex={-1} className="m-0 text-base font-semibold">
              Bookings
            </h4>
            <p className="m-0 text-muted-foreground">No bookings this week.</p>
          </div>
        )}
      </BrowserWindow>

      <LeaveQuestion
        guard={guard}
        title={`Discard changes to ${saved.title}?`}
        text="The changes you made to this listing will be lost."
        afterLeave={() => focusHeading(windowRef.current)}
      />
      <Outcome>{said || "You are on Edit listing. Nothing has changed yet, so every way out leaves at once."}</Outcome>
    </div>
  );
}

export const FRM004c: RuleExamples = {
  id: "FRM-004c",
  examples: [
    {
      kind: "do",
      title: "Every way out asks, and only after a change",
      caption: (
        <>
          Rewrite the description, then try <em>Bookings</em>, <em>Back</em>, <em>Cancel</em> or <em>Close tab</em>. The
          first three open the same question, with focus on <em>Cancel</em>, which keeps every value and returns focus
          to what you pressed. <em>Close tab</em> shows the browser&rsquo;s own prompt, drawn here; the browser words
          it, and the words differ between browsers. Without a change, or after <em>Save listing</em>, every way out
          leaves at once.
        </>
      ),
      Demo: () => <Listing guard="every-way" />,
    },
    {
      kind: "dont",
      title: "Only Cancel asks, the other ways out do not",
      caption: (
        <>
          Rewrite the description. <em>Cancel</em> asks, but <em>Bookings</em>, <em>Back</em> and <em>Close tab</em>{" "}
          leave at once, and the new text is gone. A question on one way out protects nothing.
        </>
      ),
      Demo: () => <Listing guard="cancel-only" />,
    },
    {
      kind: "dont",
      title: "Ask again after a successful save",
      caption: (
        <>
          Change the description and press <em>Save listing</em>. The save works, then the move to <em>Listings</em>{" "}
          asks to discard changes that were just saved, because the page never reset its starting values to the saved
          ones.
        </>
      ),
      Demo: () => <Listing guard="no-reset" />,
    },
  ],
};
