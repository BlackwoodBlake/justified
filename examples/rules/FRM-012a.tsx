import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Checkbox } from "@blackwoodblake/justified-shadcn/checkbox";
import { Field, FieldSet } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { NativeSelect } from "@blackwoodblake/justified-shadcn/native-select";
import { useEffect, useRef, useState } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";
import { FocusTrace, Screen, useFocusTrace } from "./oninput-demo";

/*
 * FRM-012a: changing a value does not send a form, open a page or move focus
 * unless people were told first.
 *
 * Scenes from the rule's own text, all drawn inside the example: a tool
 * library's filter list, a branch select, and a confirmation code. A change
 * of context is simulated by swapping the drawn page or by a log line, never
 * by real navigation. Every Don't has a Reset button.
 *
 * Do: the filter and the sort change the list in place, focus stays and the
 * count is said from a polite status; a code that sends at six digits has a
 * notice before the field, tied to it by the hint.
 * Don't: a select that swaps the page, a code that sends with no notice, a
 * filter that moves focus into the results.
 */

const TOOLS = [
  { name: "Hedge trimmer", category: "Garden", km: 4 },
  { name: "Lawn aerator", category: "Garden", km: 9 },
  { name: "Cordless drill", category: "Power tools", km: 2 },
  { name: "Circular saw", category: "Power tools", km: 6 },
  { name: "Claw hammer", category: "Hand tools", km: 3 },
  { name: "Pruning saw", category: "Garden", km: 1 },
];
const CATEGORIES = ["Garden", "Power tools", "Hand tools"];

function Filters({ moves }: { moves: boolean }) {
  const [ticked, setTicked] = useState<string[]>([]);
  const [sort, setSort] = useState("name");
  const [said, setSaid] = useState("");
  const [bump, setBump] = useState(0);
  const first = useRef<HTMLLIElement>(null);
  const { text, ref } = useFocusTrace();

  const shown = TOOLS.filter((t) => ticked.length === 0 || ticked.includes(t.category)).sort((a, b) =>
    sort === "near" ? a.km - b.km : a.name.localeCompare(b.name),
  );

  // The Don't: after the list updates, focus is sent into the results.
  useEffect(() => {
    if (moves && bump > 0) first.current?.focus();
  }, [bump, moves]);

  const update = (next: string[], nextSort: string) => {
    setTicked(next);
    setSort(nextSort);
    const n = TOOLS.filter((t) => next.length === 0 || next.includes(t.category)).length;
    setSaid(
      nextSort !== sort
        ? `Sorted by ${nextSort === "near" ? "nearest first" : "name"}. ${n} tools match`
        : `${n} tools match`,
    );
    setBump((b) => b + 1);
  };

  return (
    <div className="grid w-full max-w-sm gap-3" ref={ref}>
      <Screen label="Find a tool">
        <FieldSet legend="Category">
          {CATEGORIES.map((c) => (
            <Field key={c} label={c} layout="inline">
              <Checkbox
                checked={ticked.includes(c)}
                onCheckedChange={(v) => update(v ? [...ticked, c] : ticked.filter((x) => x !== c), sort)}
              />
            </Field>
          ))}
        </FieldSet>
        <Field label="Sort by">
          <NativeSelect value={sort} onChange={(e) => update(ticked, e.target.value)}>
            <option value="name">Name</option>
            <option value="near">Nearest first</option>
          </NativeSelect>
        </Field>
        <ul className="m-0 grid list-none gap-1 p-0">
          {shown.map((t, i) => (
            <li
              key={t.name}
              data-focus-name={t.name}
              ref={i === 0 ? first : undefined}
              tabIndex={moves ? -1 : undefined}
              className="flex justify-between rounded-md border border-border px-3 py-1.5 outline-offset-2 focus:outline-2 focus:outline-ring"
            >
              <span>{t.name}</span>
              <span className="text-muted-foreground">{t.km} km</span>
            </li>
          ))}
        </ul>
      </Screen>
      <Outcome>{said}</Outcome>
      <FocusTrace text={text} />
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => {
            setTicked([]);
            setSort("name");
            setSaid("");
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

const BRANCHES: Record<string, string> = { north: "Northside", harbour: "Harbour", old: "Old Town" };

function BranchSelect() {
  const [branch, setBranch] = useState("");
  const { text, ref } = useFocusTrace();
  return (
    <div className="grid w-full max-w-sm gap-3" ref={ref}>
      {branch ? (
        <Screen label={`${BRANCHES[branch]} branch`}>
          <p className="m-0">You are now on the {BRANCHES[branch]} branch page.</p>
        </Screen>
      ) : (
        <Screen label="Find a tool">
          <Field label="Branch">
            <NativeSelect value="" onChange={(e) => setBranch(e.target.value)}>
              <option value="" disabled>
                Choose a branch
              </option>
              {Object.entries(BRANCHES).map(([v, n]) => (
                <option key={v} value={v}>
                  {n}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </Screen>
      )}
      <Outcome>
        {branch ? `The page changed as soon as ${BRANCHES[branch]} was chosen. No button was pressed.` : ""}
      </Outcome>
      <FocusTrace text={text} />
      <div className="flex justify-center">
        <Button variant="outline" onClick={() => setBranch("")}>
          Reset
        </Button>
      </div>
    </div>
  );
}

function Code({ told }: { told: boolean }) {
  const [value, setValue] = useState("");
  const [sent, setSent] = useState("");
  const { text, ref } = useFocusTrace();
  const change = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 6);
    setValue(digits);
    if (digits.length === 6 && value.length < 6) setSent(digits);
  };
  return (
    <div className="grid w-full max-w-sm gap-3" ref={ref}>
      {sent ? (
        <Screen label="Phone confirmed">
          <p className="m-0">Code {sent} was sent and checked. You are on the next step.</p>
        </Screen>
      ) : (
        <Screen label="Confirm your phone">
          <Field
            label="Confirmation code"
            hint={told ? "We check the code as soon as all six digits are in." : "Six digits, from your text message."}
          >
            <Input inputMode="numeric" autoComplete="off" value={value} onChange={(e) => change(e.target.value)} />
          </Field>
        </Screen>
      )}
      <Outcome>{sent ? `Code ${sent} sent. The page moved on.` : ""}</Outcome>
      <FocusTrace text={text} />
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => {
            setValue("");
            setSent("");
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

export const FRM012a: RuleExamples = {
  id: "FRM-012a",
  examples: [
    {
      kind: "do",
      title: "The list changes in place",
      caption: (
        <>
          Tick <em>Garden</em> or choose <em>Nearest first</em>. The list changes under the controls, focus stays where
          it was and the count is said from a status line, which also says when the sort changes.
        </>
      ),
      Demo: () => <Filters moves={false} />,
    },
    {
      kind: "dont",
      title: "A select swaps the page",
      caption: (
        <>Choose a branch. The page is replaced at once, with no button and no notice. Reset brings the form back.</>
      ),
      Demo: BranchSelect,
    },
    {
      kind: "do",
      title: "A notice before a code that sends itself",
      caption: (
        <>
          Type six digits. The text before the field says the code is checked as soon as the sixth digit is in, and the
          hint is tied to the field so it is read on arrival. Our own advice is to add a <em>Verify code</em> button as
          well.
        </>
      ),
      Demo: () => <Code told />,
    },
    {
      kind: "dont",
      title: "A code that sends with no notice",
      caption: (
        <>
          Type six digits. The code is sent on the sixth and the page moves on, and nothing before the field said it
          would.
        </>
      ),
      Demo: () => <Code told={false} />,
    },
    {
      kind: "dont",
      title: "A filter moves focus to the first result",
      caption: (
        <>
          Tick <em>Garden</em>. Focus jumps from the checkbox into the list, so the next tick has to be found again. The
          line under the scene says where focus is.
        </>
      ),
      Demo: () => <Filters moves />,
    },
  ],
};
