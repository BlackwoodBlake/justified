import { drawnRing } from "./dialog";
import { SkipDemo, SkipStill } from "./nav-demo";
import type { RuleExamples } from "./frame";

/*
 * NAV-004 (a guideline, our own choice): a skip link is the first thing Tab
 * reaches, is visible while focused, and moves focus to the main content.
 *
 * A drawn Tallowbrook shell with a header and a sidebar. "Start from the top
 * of the page" puts focus just before the shell, as after a page load, and a
 * readout counts the presses of Tab to reach the first control in the
 * content. The skip link and its target are inside the example frame, so the
 * host page is not touched.
 */

function SkipLinkStill() {
  return (
    <SkipStill>
      <div className="relative rounded-lg border border-border bg-background">
        <div className="flex min-h-14 items-center justify-between rounded-t-lg px-3 py-2 text-sm">
          <span className="font-semibold">Tallowbrook</span>
          <span className="text-muted-foreground">Help · Account</span>
        </div>
        <span
          className={`absolute top-2.5 left-2.5 rounded-md bg-background px-3 py-2 text-sm font-medium text-foreground underline ${drawnRing}`}
        >
          Skip to main content
        </span>
      </div>
      <p className="mt-2 mb-0 text-center text-xs text-muted-foreground">What the first press of Tab shows.</p>
    </SkipStill>
  );
}

export const NAV004: RuleExamples = {
  id: "NAV-004",
  examples: [
    {
      kind: "do",
      title: "A visible skip link goes to the content",
      caption: (
        <>
          Press <em>Start from the top of the page</em>, then Tab. <em>Skip to main content</em> appears with its focus
          ring. Press Enter: focus lands on the heading <em>Invoices</em>, with its own ring, and one more Tab reaches{" "}
          <em>New invoice</em>. The count under the example says how many presses it took.
        </>
      ),
      Demo: () => (
        <div className="grid w-full justify-items-center gap-4">
          <SkipLinkStill />
          <SkipDemo skip="visible" />
        </div>
      ),
    },
    {
      kind: "dont",
      title: "No skip link",
      caption: (
        <>
          Start from the top and keep pressing Tab until <em>New invoice</em> has focus. Every header and sidebar control
          comes first, and this has to be done again on every page.
        </>
      ),
      Demo: () => <SkipDemo skip="none" />,
    },
    {
      kind: "dont",
      title: "A skip link that is never shown",
      caption: (
        <>
          Start from the top and press Tab. The link does get focus, as the line under the example says, but nothing
          appears on screen, so a person who sees the page has no idea where focus is.
        </>
      ),
      Demo: () => <SkipDemo skip="hidden" />,
    },
    {
      kind: "dont",
      title: "The target hides its focus ring",
      caption: (
        <>
          Start from the top, press Tab and then Enter. Focus moves to the heading, as the line under the example says, but
          the heading shows no ring, so the person cannot see where they now are.
        </>
      ),
      Demo: () => <SkipDemo skip="visible" targetRing={false} />,
    },
  ],
};
