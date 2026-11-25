import { useState } from "react";

import { GrayscalePair, PlanPicker, StatusTable } from "./colour-demo";
import type { RuleExamples } from "./frame";

/*
 * VIS-003a: never let colour be the only sign of what something means.
 *
 * Two scenes from the rule's own text: a build server's Builds table, and
 * three plan cards. Each Do gives a second cue (a word and an icon, a check
 * and the word Selected); each Don't gives only colour. Under every scene the
 * same scene is drawn again in grayscale, so the missing cue can be seen
 * without special eyes. The Don't dots still carry their status for assistive
 * technology, so only this rule is broken.
 */

function PlansPair({ style }: { style: "mark" | "tint" }) {
  const [chosen, setChosen] = useState("Team");
  return <GrayscalePair render={(grey) => <PlanPicker style={style} inertCopy={grey} chosen={chosen} onChoose={setChosen} />} />;
}

export const VIS003a: RuleExamples = {
  id: "VIS-003a",
  examples: [
    {
      kind: "do",
      title: "Every status has a word",
      caption: (
        <>
          <em>Passed</em>, <em>Failed</em> and <em>Running</em> are written out, each with its own icon shape. Colour is
          an extra. The grayscale copy below reads as clearly as the coloured one.
        </>
      ),
      Demo: () => <GrayscalePair render={() => <StatusTable cue="words" />} />,
    },
    {
      kind: "dont",
      title: "A coloured dot for a status",
      caption: (
        <>
          Only a dot of <code>bg-success</code>, <code>bg-destructive</code> or <code>bg-info</code> says how each build
          went. In the grayscale copy the passed and the failed build look the same.
        </>
      ),
      Demo: () => <GrayscalePair render={() => <StatusTable cue="dots" />} />,
    },
    {
      kind: "do",
      title: "The chosen plan is marked, not only tinted",
      caption: (
        <>
          Choose a plan. The chosen card gets a check and the word <em>Selected</em> as well as its fill, so the
          grayscale copy still shows it. Use the arrow keys once a card has focus.
        </>
      ),
      Demo: () => <PlansPair style="mark" />,
    },
    {
      kind: "dont",
      title: "The chosen plan is only tinted",
      caption: (
        <>
          The chosen card changes only from <code>bg-card</code> to <code>bg-accent</code>, a step of about 1.2:1.
          Choose a plan: in the coloured scene it is hard to see (about 1.2:1 in the light theme and 1.3:1 in the dark one), in the grayscale copy it is gone.
        </>
      ),
      Demo: () => <PlansPair style="tint" />,
    },
  ],
};
