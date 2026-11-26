import { Checkbox } from "@blackwoodblake/justified-shadcn/checkbox";
import { Field, FieldSet } from "@blackwoodblake/justified-shadcn/field";
import { Label } from "@blackwoodblake/justified-shadcn/label";
import { RadioGroup, RadioGroupItem } from "@blackwoodblake/justified-shadcn/radio-group";
import { useId, useState } from "react";

import type { RuleExamples } from "./frame";
import { DeadWords, Scene, Tally, useTally } from "./label-target";

/*
 * FRM-016a: a press on the text of a checkbox or radio button does what a
 * press on the box does.
 *
 * Scenes from the rule's own text, a ferry booking form. Each scene counts the
 * changes the control reported, and in a Don't also the presses that landed on
 * the words, so a press on dead text shows as a count that rises while the
 * changes stay still. Every Don't keeps a name in code (aria-labelledby), so
 * only this rule is broken, not FRM-010.
 *
 * Do: a Label tied to a checkbox by htmlFor and id; a legend and one Label per
 * radio item.
 * Don't: the words in a span; mapped boxes that all share one id, so every
 * label reaches the first box.
 */

const CABIN = "Add a cabin for the night crossing";
const DEAD = "Nothing changed. These words are in a span, tied to nothing, so only the box answers.";

function CabinDo() {
  const id = useId();
  const [on, setOn] = useState(false);
  const t = useTally();
  return (
    <Scene title="Night crossing">
      <Field label={CABIN} layout="inline" id={id}>
        <Checkbox
          checked={on}
          onCheckedChange={(v) => {
            setOn(v === true);
            t.changed();
          }}
        />
      </Field>
      <Tally
        summary={<>Cabin: <strong>{on ? "added" : "not added"}</strong></>}
        changes={t.changes}
        onReset={() => {
          setOn(false);
          t.reset();
        }}
      />
    </Scene>
  );
}

function CabinDont() {
  const id = useId();
  const [on, setOn] = useState(false);
  const t = useTally();
  return (
    <Scene title="Night crossing">
      <div className="flex items-start gap-3">
        <div className="flex h-5 items-center">
          <Checkbox
            aria-labelledby={id}
            checked={on}
            onCheckedChange={(v) => {
              setOn(v === true);
              t.changed();
            }}
          />
        </div>
        <DeadWords id={id} onPress={t.pressedWords}>
          {CABIN}
        </DeadWords>
      </div>
      <Tally
        summary={<>Cabin: <strong>{on ? "added" : "not added"}</strong></>}
        changes={t.changes}
        words={t.words}
        explain={DEAD}
        onReset={() => {
          setOn(false);
          t.reset();
        }}
      />
    </Scene>
  );
}

const SEATS = [
  { value: "seat", label: "Reclining seat" },
  { value: "bed", label: "Cabin bed" },
];

function SeatDo() {
  const [seat, setSeat] = useState("seat");
  const t = useTally();
  return (
    <Scene title="Your berth">
      <FieldSet legend="Seat type">
        <RadioGroup
          value={seat}
          onValueChange={(v) => {
            setSeat(v);
            t.changed();
          }}
        >
          {SEATS.map((s) => (
            <Field key={s.value} label={s.label} layout="inline">
              <RadioGroupItem value={s.value} />
            </Field>
          ))}
        </RadioGroup>
      </FieldSet>
      <Tally
        summary={<>Seat type: <strong>{SEATS.find((s) => s.value === seat)?.label}</strong></>}
        changes={t.changes}
        onReset={() => {
          setSeat("seat");
          t.reset();
        }}
      />
    </Scene>
  );
}

const EXTRAS = ["Breakfast on board", "Priority boarding", "Bike space"];

/** Every box has the same id, so each label finds the first box. */
function ExtrasDont() {
  const [ticked, setTicked] = useState<string[]>([]);
  const t = useTally();
  return (
    <Scene title="Extras">
      <FieldSet legend="Add to your booking">
        {EXTRAS.map((name) => (
          <div key={name} className="flex items-start gap-3">
            <div className="flex h-5 items-center">
              <Checkbox
                id="option"
                aria-label={name}
                checked={ticked.includes(name)}
                onCheckedChange={(v) => {
                  setTicked((cur) => (v ? [...cur, name] : cur.filter((x) => x !== name)));
                  t.changed();
                }}
              />
            </div>
            <Label htmlFor="option">{name}</Label>
          </div>
        ))}
      </FieldSet>
      <Tally
        summary={<>Ticked: <strong>{ticked.length ? ticked.join(", ") : "none"}</strong></>}
        changes={t.changes}
        onReset={() => {
          setTicked([]);
          t.reset();
        }}
      />
    </Scene>
  );
}

export const FRM016a: RuleExamples = {
  id: "FRM-016a",
  examples: [
    {
      kind: "do",
      title: "The words tick the box",
      caption: (
        <>
          Click the words <em>Add a cabin for the night crossing</em>, then click the box, or Tab to the box and press
          Space. Each one changes the cabin and adds one to the count. The label is tied to the box with <code>htmlFor</code> and{" "}
          <code>id</code>.
        </>
      ),
      Demo: CabinDo,
    },
    {
      kind: "dont",
      title: "The words are a span",
      caption: (
        <>
          Click the words <em>Add a cabin for the night crossing</em>. Nothing changes: the presses on the words rise and
          the changes stay at zero, and a line says why. The box still has a name in code, so only this rule is broken.
          Only a press on the box ticks it.
        </>
      ),
      Demo: CabinDont,
    },
    {
      kind: "do",
      title: "Each seat type answers its own words",
      caption: (
        <>
          Click <em>Cabin bed</em>, then <em>Reclining seat</em>, on the words and not on the circles. Each press selects
          that option. Tab to the group and use the arrow keys to move between the options. The question is the legend of the group, and each option has its own label.
        </>
      ),
      Demo: SeatDo,
    },
    {
      kind: "dont",
      title: "Every label reaches the first box",
      caption: (
        <>
          Click the words <em>Priority boarding</em> or <em>Bike space</em>. The first box, <em>Breakfast on board</em>,
          is ticked or cleared instead, because all three boxes share the id "option". Clicking a box itself still
          works, which hides the fault.
        </>
      ),
      Demo: ExtrasDont,
    },
  ],
};
