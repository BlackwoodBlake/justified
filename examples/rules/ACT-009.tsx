import { Button } from "@blackwoodblake/justified-shadcn/button";
import { focusRing } from "@blackwoodblake/justified-shadcn/styles";

import type { RuleExamples } from "./frame";
import { Scene, useSceneSay } from "./links-buttons";
import { useSceneRouter } from "./scene-router";

/*
 * ACT-009: everything people click to go somewhere or to act has a control
 * role in code.
 *
 * One library loan card and one opening-hours note, each in a Do and a Don't.
 * A list under every scene shows what a screen reader's lists of links and
 * buttons hold for it, read from the markup. Links never leave Storybook:
 * a plain click says where it would go, and the real href stays on the link.
 *
 * Two Don'ts have parts that cannot be reached with Tab; the captions say so.
 */

const TITLE = "The Dispossessed";

const linkText = `text-primary underline underline-offset-4 hover:decoration-2 rounded-sm ${focusRing}`;

function StarIcon({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <svg
      onClick={onClick}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className ?? "size-4"}
    >
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z" />
    </svg>
  );
}

function Due() {
  return <p className="m-0 text-sm text-muted-foreground">Due back 3 December</p>;
}

/** The Do: the title is a link, Renew loan and the star are buttons. */
function RealCard() {
  const say = useSceneSay();
  return (
    <article className="grid gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-1">
          <h4 className="m-0 text-base font-semibold">
            <a href="/books/the-dispossessed" className={`inline-block py-0.5 ${linkText}`}>
              {TITLE}
            </a>
          </h4>
          <Due />
        </div>
        <Button
          variant="outline"
          size="icon"
          aria-label="Add to wish list"
          onClick={() => say(`${TITLE} added to your wish list.`)}
        >
          <StarIcon />
        </Button>
      </div>
      <div>
        <Button onClick={() => say("Loan renewed until 17 December.")}>Renew loan</Button>
      </div>
    </article>
  );
}

/** The Don't: the card itself has the click handler, and nothing inside is a link. */
function ClickableCard() {
  const say = useSceneSay();
  return (
    <article
      className="-m-2 grid cursor-pointer gap-3 rounded-md p-2 hover:bg-accent"
      onClick={() => say("Would go to /books/the-dispossessed")}
    >
      <div className="grid gap-1">
        <h4 className="m-0 text-base font-semibold">{TITLE}</h4>
        <Due />
      </div>
      <div>
        {/* Stops the click here, so Renew loan does not also open the book. */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            say("Loan renewed until 17 December.");
          }}
        >
          Renew loan
        </Button>
      </div>
    </article>
  );
}

function Hours({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <h4 className="m-0 text-base font-semibold">Opening hours</h4>
      <p className="m-0 text-sm text-muted-foreground">Monday to Friday 9 to 18, Saturday 10 to 14.</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">{children}</div>
    </div>
  );
}

function RealLinks() {
  return (
    <Hours>
      <Button variant="link" asChild>
        <a href="/branches">All branches</a>
      </Button>
      <Button variant="link" asChild>
        <a href="/loans.csv" download>
          Download loan history (CSV)
        </a>
      </Button>
    </Hours>
  );
}

function ScriptedLink() {
  const say = useSceneSay();
  const router = useSceneRouter(say);
  return (
    <Hours>
      <Button variant="link" onClick={() => router.push("/branches")}>
        All branches
      </Button>
    </Hours>
  );
}

/** The Don't with three things that look and click like controls but have no role. */
function NoRole() {
  const say = useSceneSay();
  return (
    <div className="grid gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-1">
          <h4 className="m-0 text-base font-semibold">{TITLE}</h4>
          <p className="m-0 text-sm text-muted-foreground">
            Due back 3 December.{" "}
            <span
              className="cursor-pointer text-primary underline underline-offset-4"
              onClick={() => say("Would go to /fees")}
            >
              Late fees
            </span>
          </p>
        </div>
        <StarIcon className="size-6 shrink-0 cursor-pointer" onClick={() => say(`${TITLE} added to your wish list.`)} />
      </div>
      <div>
        <a
          className="inline-flex h-10 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          onClick={() => say("Loan renewed until 17 December.")}
        >
          Renew loan
        </a>
      </div>
    </div>
  );
}
export const ACT009: RuleExamples = {
  id: "ACT-009",
  examples: [
    {
      kind: "do",
      title: "The title is a link, the actions are buttons",
      caption: (
        <>
          On the loan card, <em>The Dispossessed</em> is an <code>&lt;a href&gt;</code>, and <em>Renew loan</em> and the
          star are buttons. The list under the card is what a screen reader&rsquo;s lists of links and buttons hold. Tab
          reaches all three. A plain click on the link only reports where it would go, so Storybook stays put; the real{" "}
          <code>href</code> is still there, so Ctrl or Cmd click opens the address in a new tab, as on any link
          (Storybook has no such page).
        </>
      ),
      Demo: () => (
        <Scene listLabel="In the lists of links and buttons:">
          <RealCard />
        </Scene>
      ),
    },
    {
      kind: "dont",
      title: "The whole card has the click handler",
      notLinted:
        "Lint gap: a click handler on a native article is left to eslint-plugin-jsx-a11y, and the adapter has no Card to put it on.",
      caption: (
        <>
          Click anywhere on the card and it says where it would go, but the card is a plain <code>article</code> with{" "}
          <code>onClick</code>. The list is empty of links: nothing here is a link, so a screen reader reads the title
          as text. Tab skips the card, so this opening works with a pointer only. The one button, <em>Renew loan</em>,
          is real and stops the click from reaching the card.
        </>
      ),
      Demo: () => (
        <Scene listLabel="In the lists of links and buttons:">
          <ClickableCard />
        </Scene>
      ),
    },
    {
      kind: "do",
      title: "A link that looks like a link is one",
      caption: (
        <>
          <em>All branches</em> is <code>Button variant=&quot;link&quot; asChild</code> around an{" "}
          <code>&lt;a href&gt;</code>. It looks like a text link and is announced as one.{" "}
          <em>Download loan history (CSV)</em> is a link to the file, as it still goes to an address. Plain clicks
          report where they would go; Ctrl or Cmd click, a middle click and Copy link address work for real (Storybook
          has no such page).
        </>
      ),
      Demo: () => (
        <Scene listLabel="In the lists of links and buttons:">
          <RealLinks />
        </Scene>
      ),
    },
    {
      kind: "dont",
      title: "A link-looking button that goes by script",
      caption: (
        <>
          <em>All branches</em> looks the same, but it is <code>Button variant=&quot;link&quot; onClick</code> that
          changes the address by script. It works with Tab and Enter, but a screen reader calls it a button, and it is
          not in the list of links. A middle click or Copy link address has no address to use.
        </>
      ),
      Demo: () => (
        <Scene listLabel="In the lists of links and buttons:">
          <ScriptedLink />
        </Scene>
      ),
    },
    {
      kind: "dont",
      title: "Click handlers on an anchor, a span and an icon",
      caption: (
        <>
          <em>Renew loan</em> is an <code>&lt;a&gt;</code> with no <code>href</code>, <em>Late fees</em> an underlined{" "}
          <code>span</code> and the star an icon, each with <code>onClick</code>. A click with a pointer works. In HTML
          none of them has a role, so the list is empty. Chrome guesses <em>link</em> for the anchor from its click
          handler, but Tab still cannot reach it, and other browsers read it as text. Tab reaches none of the three:
          this example cannot be used with a keyboard at all.
        </>
      ),
      Demo: () => (
        <Scene listLabel="In the lists of links and buttons:">
          <NoRole />
        </Scene>
      ),
    },
  ],
};
