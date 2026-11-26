import assert from "node:assert/strict";
import { it } from "node:test";

import { examplesOf } from "./example-map.js";

const file = `import type { RuleExamples } from "./frame";

function Shared({ on }: { on: boolean }) {
  return <Inner on={on} />;
}

function Inner({ on }: { on: boolean }) {
  return <button disabled={on}>Send</button>;
}

function OnlyBad() {
  return <button disabled>Send</button>;
}

export const X: RuleExamples = {
  id: "X-001",
  examples: [
    { kind: "do", title: "Good", caption: <>Fine</>, Demo: () => <Shared on={false} /> },
    { kind: "dont", title: "Bad", caption: <>Not fine</>, Demo: OnlyBad },
    { kind: "dont", title: "Also bad", caption: <>Not fine</>, Demo: () => <Shared on /> },
  ],
};
`;

it("maps each example to the lines its Demo reaches", () => {
  const [good, bad, alsoBad] = examplesOf(file);
  const lines = (e) => e.ranges.map(([a, b]) => `${a}-${b}`).sort();
  assert.equal(good.kind, "do");
  assert.deepEqual(lines(good), ["18-18", "3-5", "7-9"]);
  assert.equal(bad.kind, "dont");
  assert.deepEqual(lines(bad), ["11-13", "19-19"]);
  assert.deepEqual(lines(alsoBad), ["20-20", "3-5", "7-9"]);
});
