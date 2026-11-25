import { Checkbox } from "@blackwoodblake/justified-shadcn/checkbox";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { Switch } from "@blackwoodblake/justified-shadcn/switch";

import { Meter, meterRows, Readouts, Themes } from "./colour-demo";
import type { RuleExamples } from "./frame";

/*
 * VIS-004: the parts people need to see to find a control and tell its state
 * reach 3:1.
 *
 * Two scenes. A small account form (an email field, a checkbox, a switch)
 * drawn with Justified's controls as they are, against the same three with
 * the faint edges the Don't text names. And a storage meter split into
 * Photos, Videos and Documents: solid segments with a 2 px gap, against pale
 * segments that touch. The controls are real and can be used; the meters are
 * pictures of bars with their names and sizes in text beside them. Each
 * figure is measured in the browser, in both themes.
 */

const CONTROL_ROWS = [
  { target: "email", label: "Email field edge against the page", kind: "border" as const, need: 3 },
  { target: "remember", label: "Checkbox edge against the page", kind: "border" as const, need: 3 },
  { target: "alerts", label: "Switch track against its panel", kind: "fill" as const, need: 3 },
];

function Controls({ faint }: { faint: boolean }) {
  return (
    <Themes>
      {() => (
        <>
          <div className="grid gap-3">
            <Field label="Email">
              <Input
                data-measure="email"
                type="email"
                autoComplete="off"
                defaultValue=""
                placeholder="you@example.com"
                className={faint ? "border-border" : undefined}
              />
            </Field>
            <Field layout="inline" label="Remember me">
              <Checkbox data-measure="remember" className={faint ? "border-muted-foreground/30" : undefined} />
            </Field>
            <div className={`rounded-md p-2 ${faint ? "bg-muted" : "bg-background"}`}>
              <Field layout="inline" label="Email alerts">
                <Switch data-measure="alerts" className={faint ? "bg-muted" : undefined} />
              </Field>
            </div>
          </div>
          <Readouts rows={CONTROL_ROWS} />
        </>
      )}
    </Themes>
  );
}

function MeterScene({ pale }: { pale: boolean }) {
  return (
    <Themes>
      {() => (
        <>
          <Meter pale={pale} sizes={!pale} />
          <Readouts rows={meterRows} />
        </>
      )}
    </Themes>
  );
}

export const VIS004: RuleExamples = {
  id: "VIS-004",
  examples: [
    {
      kind: "do",
      title: "Fields and switches you can find",
      caption: (
        <>
          The field and the checkbox use <code>border-input</code>, and the off switch has a <code>bg-input</code>{" "}
          track. Type in the field, tick the box, flip the switch: each part is measured against what touches it, in
          both themes.
        </>
      ),
      Demo: () => <Controls faint={false} />,
    },
    {
      kind: "dont",
      title: "Edges and tracks that fade away",
      caption: (
        <>
          The same controls with <code>border-border</code> on the field, <code>border-muted-foreground/30</code> on the
          checkbox and a <code>bg-muted</code> track on a <code>bg-muted</code> panel. They still work, but you have to
          already know where they are.
        </>
      ),
      Demo: () => <Controls faint />,
    },
    {
      kind: "do",
      title: "A meter with a gap between segments",
      caption: (
        <>
          The meter alone tells how full the account is and how it divides, so each segment is 3:1 or more against the
          track, with a 2 px gap in the page colour between them. The exact sizes also stand in a list beside it.
        </>
      ),
      Demo: () => (
        <div className="w-full max-w-sm">
          <MeterScene pale={false} />
        </div>
      ),
    },
    {
      kind: "dont",
      title: "Pale segments that touch",
      caption: (
        <>
          The segments are 20 % tints of the same colours, with no gap. The only text says 7.5 GB of 10 GB, not how
          much each type takes, so the bar is the one place that says it, and against the track each segment is far
          below 3:1.
        </>
      ),
      Demo: () => (
        <div className="w-full max-w-sm">
          <MeterScene pale />
        </div>
      ),
    },
  ],
};
