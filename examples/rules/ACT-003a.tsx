import { Button } from "@blackwoodblake/justified-shadcn/button";
import { DialogFooter } from "@blackwoodblake/justified-shadcn/dialog";
import { dialogSurface } from "@blackwoodblake/justified-shadcn/styles";
import { useId, useState } from "react";

import { DialogPicture, Outcome } from "./dialog";
import type { RuleExamples } from "./frame";

/* ACT-003a: when a dialog's buttons sit in a row, the confirming one is last. */

function useOutcome() {
  const [said, setSaid] = useState("");
  // Empty first, so pressing the same button twice is announced twice.
  const say = (s: string) => () => {
    setSaid("");
    setTimeout(() => setSaid(s), 50);
  };
  return [said, say] as const;
}

function PackedAtEnd() {
  const [said, say] = useOutcome();
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <DialogPicture
        title="Renew your library loan for two more weeks?"
        // A row at every width: this rule is about buttons side by side.
        footerClassName="flex-row flex-wrap justify-end"
        footer={
          <>
            <Button variant="outline" onClick={say("Cancelled. The loan ends on Friday.")}>
              Cancel
            </Button>
            <Button onClick={say("Renewed. The book is due back in two weeks.")}>Renew loan</Button>
          </>
        }
      >
        The Glass Orchard is due back on Friday.
      </DialogPicture>
      <Outcome>{said}</Outcome>
    </div>
  );
}

function FillsWidth() {
  const [said, say] = useOutcome();
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <DialogPicture
        className="max-w-[17rem]"
        title="Order 24 photo prints?"
        footerClassName="grid grid-cols-2"
        footer={
          <>
            <Button variant="outline" onClick={say("Cancelled. Nothing was ordered.")}>
              Cancel
            </Button>
            <Button onClick={say("Ordered. The prints arrive in about three days.")}>Order prints</Button>
          </>
        }
      >
        Glossy, 10 × 15 cm, for £8.50.
      </DialogPicture>
      <Outcome>{said}</Outcome>
    </div>
  );
}

function Reversed() {
  const [said, say] = useOutcome();
  const id = useId();
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div role="group" aria-labelledby={id} className={dialogSurface}>
        <h4 id={id} className="m-0 text-base font-semibold leading-snug">
          Join the waitlist for the pottery course?
        </h4>
        <div className="mt-2 text-sm text-muted-foreground">We will email you when a place opens up.</div>
        <DialogFooter className="flex-row flex-wrap justify-end">
          <Button onClick={say("Joined. Did you mean to?")}>Join waitlist</Button>
          <Button variant="outline" onClick={say("Cancelled.")}>
            Cancel
          </Button>
        </DialogFooter>
      </div>
      <Outcome>{said}</Outcome>
    </div>
  );
}

export const ACT003a: RuleExamples = {
  id: "ACT-003a",
  examples: [
    {
      kind: "do",
      title: "Buttons packed at the end",
      caption: (
        <>
          <em>Cancel</em> comes first and <em>Renew loan</em> last, at the trailing end. The code has the same order, so
          Tab moves through them the way they look.
        </>
      ),
      Demo: PackedAtEnd,
    },
    {
      kind: "do",
      title: "Buttons fill the width",
      caption: (
        <>
          On a narrow screen the two buttons share the footer. The order is the same: <em>Cancel</em> on the leading
          half, <em>Order prints</em> on the trailing half.
        </>
      ),
      Demo: FillsWidth,
    },
    {
      kind: "dont",
      title: "Confirming button first",
      caption: (
        <>
          <em>Join waitlist</em> sits where people expect <em>Cancel</em>. Someone who has learned the usual order can
          press the wrong one.
        </>
      ),
      Demo: Reversed,
    },
  ],
};
