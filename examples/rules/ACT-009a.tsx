import { Button } from "@blackwoodblake/justified-shadcn/button";
import { focusRing } from "@blackwoodblake/justified-shadcn/styles";
import { cn } from "@blackwoodblake/justified-shadcn/utils";

import type { RuleExamples } from "./frame";
import { Scene, useSceneSay } from "./links-buttons";
import { useSceneRouter, useSceneWindow } from "./scene-router";

/*
 * ACT-009a: a control that only takes people to another address is a link
 * in code, not a button that changes the address by script.
 *
 * Two scenes from a vet clinic's portal, each as a Do and a Don't:
 * the dashboard buttons and the page numbers under past visits. The list
 * under each scene shows what a screen reader's lists of links and buttons
 * hold. Links never leave Storybook: a plain click says where it would go and
 * the real href stays on the link, so Ctrl or Cmd click still opens a tab.
 * The Don'ts work with Tab and Enter, since a button does; the guideline is
 * about the role and what the browser gives every link.
 */

function DoDashboard() {
  const say = useSceneSay();
  return (
    <div className="grid gap-3">
      <h4 className="m-0 text-base font-semibold">Bella&rsquo;s dashboard</h4>
      <p className="m-0 text-sm text-muted-foreground">Next visit: vaccination, 14 December.</p>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <a href="/appointments">View appointments</a>
        </Button>
        <Button variant="outline" asChild>
          <a href="https://pharmacy.example.com">Open pharmacy site</a>
        </Button>
        {/* Its job is the booking, so it stays a button, and the page that follows is the result. */}
        <Button variant="outline" onClick={() => say("Booking saved. Showing your booking now.")}>
          Book appointment
        </Button>
      </div>
    </div>
  );
}

function DontDashboard() {
  const say = useSceneSay();
  const router = useSceneRouter(say);
  const site = useSceneWindow(say);
  return (
    <div className="grid gap-3">
      <h4 className="m-0 text-base font-semibold">Bella&rsquo;s dashboard</h4>
      <p className="m-0 text-sm text-muted-foreground">Next visit: vaccination, 14 December.</p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => router.push("/appointments")}>View appointments</Button>
        <Button variant="outline" onClick={() => site.open("https://pharmacy.example.com")}>
          Open pharmacy site
        </Button>
      </div>
    </div>
  );
}

const page = (current: boolean) =>
  cn(
    "inline-flex size-10 items-center justify-center rounded-md border text-sm font-medium",
    current
      ? "border-primary bg-primary text-primary-foreground"
      : "border-input bg-background text-foreground hover:bg-accent",
    focusRing,
  );

const VISITS = ["Vaccination, 14 June", "Dental check, 2 May", "Booster, 19 March"];

function DoPages() {
  return (
    <div className="grid gap-3">
      <h4 className="m-0 text-base font-semibold">Past visits</h4>
      <ul className="m-0 grid list-none gap-1 p-0 text-sm text-muted-foreground">
        {VISITS.map((v) => (
          <li key={v}>{v}</li>
        ))}
      </ul>
      <nav aria-label="Past visits, page links">
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {[1, 2, 3, 4].map((n) => (
            <li key={n}>
              <a
                href={`?page=${n}`}
                aria-current={n === 1 ? "page" : undefined}
                aria-label={`Page ${n}`}
                className={page(n === 1)}
              >
                {n}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function DontPages() {
  const say = useSceneSay();
  const router = useSceneRouter(say);
  return (
    <div className="grid gap-3">
      <h4 className="m-0 text-base font-semibold">Past visits</h4>
      <ul className="m-0 grid list-none gap-1 p-0 text-sm text-muted-foreground">
        {VISITS.map((v) => (
          <li key={v}>{v}</li>
        ))}
      </ul>
      <nav aria-label="Past visits, page buttons">
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {[1, 2, 3, 4].map((n) => (
            <li key={n}>
              <button
                type="button"
                aria-current={n === 1 ? "page" : undefined}
                aria-label={`Page ${n}`}
                className={cn(page(n === 1), "cursor-pointer")}
                onClick={() => router.push(`?page=${n}`)}
              >
                {n}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

const label = "In the lists of links and buttons:";

export const ACT009a: RuleExamples = {
  id: "ACT-009a",
  examples: [
    {
      kind: "do",
      title: "Going somewhere is a link, saving is a button",
      caption: (
        <>
          <em>View appointments</em> and <em>Open pharmacy site</em> are <code>Button asChild</code> around an{" "}
          <code>&lt;a href&gt;</code>: button looks, link behaviour. <em>Book appointment</em> saves the booking and
          then shows it, so it stays a button. A plain click reports where a link would go, so Storybook stays put; the
          real <code>href</code> is there, so Ctrl or Cmd click, a middle click and Copy link address work (Storybook
          has no such page to open).
        </>
      ),
      Demo: () => (
        <Scene listLabel={label}>
          <DoDashboard />
        </Scene>
      ),
    },
    {
      kind: "dont",
      title: "Buttons that change the address by script",
      caption: (
        <>
          The same buttons, built as <code>Button onClick</code> with <code>router.push</code> and{" "}
          <code>window.open</code>. They work with Tab and Enter and look identical, but they say &ldquo;button&rdquo;,
          are missing from the list of links, and have no address to open in a new tab, copy or preview. Try a middle
          click: nothing happens.
        </>
      ),
      Demo: () => (
        <Scene listLabel={label}>
          <DontDashboard />
        </Scene>
      ),
    },
    {
      kind: "do",
      title: "Page numbers are links",
      caption: (
        <>
          Each page number is an <code>&lt;a href=&quot;?page=n&quot;&gt;</code> inside a labelled <code>nav</code>, and
          the current page is marked with <code>aria-current</code> and a filled box, not by colour alone. Plain clicks
          report the address; a middle click opens the address in a new tab (Storybook has no such page).
        </>
      ),
      Demo: () => (
        <Scene listLabel={label}>
          <DoPages />
        </Scene>
      ),
    },
    {
      kind: "dont",
      title: "Page numbers that call router.push",
      caption: (
        <>
          The same numbers, built as buttons that change the address by script. They look and behave the same with a
          pointer or Tab and Enter, but a screen reader announces four buttons and the list of links holds none of them.
          No page can be opened in a new tab, and a search engine finds no address to follow.
        </>
      ),
      Demo: () => (
        <Scene listLabel={label}>
          <DontPages />
        </Scene>
      ),
    },
  ],
};
