import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";

import { Drawn, LinkReadout, Scope } from "./colour-demo";
import type { RuleExamples } from "./frame";

/*
 * VIS-003b: a link in running text stands out at rest.
 *
 * A lesson page of a course platform and the help line under a field. The
 * Dos are real links with an underline. The Don'ts are drawings of a link,
 * not links: a real link in a sentence with only a colour would fail axe's
 * link-in-text-block check, as it fails the criterion. The readout measures
 * the colour gap to the words around it and whether an underline is there at
 * rest, from what is painted.
 */

const stop = (e: { preventDefault: () => void }) => e.preventDefault();

function Lesson({ cls }: { cls: string }) {
  return (
    <p className="m-0 text-base">
      Before the next lesson, read the chapter once.{" "}
      <a data-measure="link" href="#worksheet" onClick={stop} className={cls}>
        Download the worksheet for this lesson
      </a>{" "}
      and bring your answers on Thursday.
    </p>
  );
}

export const VIS003b: RuleExamples = {
  id: "VIS-003b",
  examples: [
    {
      kind: "do",
      title: "An underlined link in a paragraph",
      caption: (
        <>
          The link is <code>text-primary underline underline-offset-4</code>. It differs from the words around it by
          little in lightness, and it does not matter: the underline is there at rest. Tab to it to see focus.
        </>
      ),
      Demo: () => (
        <Scope className="w-full max-w-sm rounded-lg border border-border bg-background p-4">
          <h4 className="m-0 mb-2 text-sm font-semibold">Lesson 3: Reading a balance sheet</h4>
          <Lesson cls="text-primary underline underline-offset-4 hover:decoration-2" />
          <LinkReadout />
        </Scope>
      ),
    },
    {
      kind: "dont",
      title: "A link with only its colour",
      caption: (
        <>
          A drawing of the same paragraph with <code>text-primary</code> alone. Tailwind removes the underline from
          every link, so the link is the same shape as the words around it, and the colour gap is far under 3:1.
        </>
      ),
      notLinted:
        "A real link with only its colour fails axe's link-in-text-block check on this page, so the link is drawn as a span inside an inert picture.",
      Demo: () => (
        <Scope className="w-full max-w-sm rounded-lg border border-border bg-background p-4">
          <h4 className="m-0 mb-2 text-sm font-semibold">Lesson 3: Reading a balance sheet</h4>
          <Drawn>
            <p className="m-0 text-base">
              Before the next lesson, read the chapter once.{" "}
              <span data-measure="link" className="text-primary">
                Download the worksheet for this lesson
              </span>{" "}
              and bring your answers on Thursday.
            </p>
          </Drawn>
          <LinkReadout />
        </Scope>
      ),
    },
    {
      kind: "do",
      title: "An underlined link in help text",
      caption: (
        <>
          Under <em>Display name</em>, the last sentence of the help line is an underlined link. Help text is running
          text too.
        </>
      ),
      Demo: () => (
        <Scope className="w-full max-w-sm rounded-lg border border-border bg-background p-4">
          <Field
            label="Display name"
            hint={
              <>
                Shown on certificates.{" "}
                <a data-measure="link" href="#name" onClick={stop} className="text-primary underline underline-offset-4 hover:decoration-2">
                  Read how we use your name.
                </a>
              </>
            }
          >
            <Input defaultValue="Maya Okafor" autoComplete="off" />
          </Field>
          <LinkReadout />
        </Scope>
      ),
    },
    {
      kind: "dont",
      title: "An underline only on hover",
      caption: (
        <>
          A drawing with <code>text-primary hover:underline</code>. Move the pointer over the link and the underline
          appears, but only for someone who already found it. It is a drawing, so it has no keyboard path. The readout
          is taken at rest.
        </>
      ),
      notLinted:
        "A real link with only its colour fails axe's link-in-text-block check on this page, so the link is drawn as a span in a picture hidden from assistive technology.",
      Demo: () => (
        <Scope className="w-full max-w-sm rounded-lg border border-border bg-background p-4">
          <p className="m-0 mb-1 text-sm font-medium">Display name</p>
          <div className="mb-2 rounded-md border border-input px-3 py-2 text-base">Maya Okafor</div>
          <div aria-hidden="true">
            <p className="m-0 text-sm text-muted-foreground">
              Shown on certificates.{" "}
              <span data-measure="link" className="cursor-pointer text-primary hover:underline">
                Read how we use your name.
              </span>
            </p>
          </div>
          <LinkReadout />
        </Scope>
      ),
    },
  ],
};
