import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Label } from "@blackwoodblake/justified-shadcn/label";
import { Switch } from "@blackwoodblake/justified-shadcn/switch";
import { useId, useState, type ReactNode } from "react";

import type { RuleExamples } from "./frame";
import { DeadWords, Scene, Tally, useTally } from "./label-target";

/*
 * FRM-016b (a guideline, our own choice): a press on the text of a switch
 * does what a press on the switch does.
 *
 * One ferry-app settings row, in the justify-between layout the guideline
 * names, where the text sits at the far side from the switch. Each scene
 * counts the changes the switch reported and, in a Don't, the presses on the
 * words. Every Don't keeps a name in code (aria-labelledby), so only this
 * guideline is broken, not FRM-010.
 *
 * Do: a Label tied to the switch by htmlFor and id.
 * Don't: the words in a span; a Label with no htmlFor.
 */

const TEXT = "Email me before departure";

function Row({ children, text }: { children: ReactNode; text: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-2">
      {text}
      {children}
    </div>
  );
}

function SwitchDo() {
  const id = useId();
  const [on, setOn] = useState(false);
  const t = useTally();
  return (
    <Scene title="Notification settings">
      <Row text={<Label htmlFor={id}>{TEXT}</Label>}>
        <Switch
          id={id}
          checked={on}
          onCheckedChange={(v) => {
            setOn(v);
            t.changed();
          }}
        />
      </Row>
      <Tally
        summary={<>Departure email: <strong>{on ? "on" : "off"}</strong></>}
        changes={t.changes}
        onReset={() => {
          setOn(false);
          t.reset();
        }}
      />
    </Scene>
  );
}

function SwitchDont({ plainSpan }: { plainSpan: boolean }) {
  const id = useId();
  const [on, setOn] = useState(false);
  const t = useTally();
  return (
    <Scene title="Notification settings">
      <Row
        text={
          plainSpan ? (
            <DeadWords id={id} onPress={t.pressedWords}>
              {TEXT}
            </DeadWords>
          ) : (
            <Label id={id} onClick={t.pressedWords}>
              {TEXT}
            </Label>
          )
        }
      >
        <Switch
          aria-labelledby={id}
          checked={on}
          onCheckedChange={(v) => {
            setOn(v);
            t.changed();
          }}
        />
      </Row>
      <Tally
        summary={<>Departure email: <strong>{on ? "on" : "off"}</strong></>}
        changes={t.changes}
        words={t.words}
        explain={
          plainSpan
            ? "Nothing changed. These words are in a span, tied to nothing, so only the switch answers."
            : "Nothing changed. This Label has no htmlFor, so it is tied to nothing and only the switch answers."
        }
        onReset={() => {
          setOn(false);
          t.reset();
        }}
      />
    </Scene>
  );
}

export const FRM016b: RuleExamples = {
  id: "FRM-016b",
  examples: [
    {
      kind: "do",
      title: "The words turn the switch on",
      caption: (
        <>
          Click the words <em>Email me before departure</em>, then the switch, or Tab to the switch and press Space. Each
          one flips the setting and adds one to the count, although the words sit at the far side of the row. The label
          is tied to the switch with <code>htmlFor</code> and <code>id</code>. This is our own choice, not something the
          judges decided.
        </>
      ),
      Demo: SwitchDo,
    },
    {
      kind: "dont",
      title: "The words are a span",
      caption: (
        <>
          Click the words <em>Email me before departure</em>. Nothing changes: the presses on the words rise, the changes
          stay at zero, and a line says why. The switch still has a name in code. Only a press on the switch flips it.
        </>
      ),
      Demo: () => <SwitchDont plainSpan />,
    },
    {
      kind: "dont",
      title: "A Label with no htmlFor",
      caption: (
        <>
          Click the words <em>Email me before departure</em>. It is a real <code>Label</code>, but it names no control,
          so a press on it does nothing and the changes stay at zero. Only the switch flips.
        </>
      ),
      Demo: () => <SwitchDont plainSpan={false} />,
    },
  ],
};
