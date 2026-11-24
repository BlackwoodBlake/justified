import { Button } from "@blackwoodblake/justified-shadcn/button";
import { useState } from "react";

import { DialogPicture, Outcome } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * ACT-001a: an action button starts with a verb that names the action.
 *
 * Both examples draw the same dialog, with the same title, order, styles and
 * outcomes. Only the words on the two buttons differ.
 */

const title = "Book a dentist appointment on Tuesday 16 March at 9:30?";

function useOutcome() {
  const [said, setSaid] = useState("");
  // Empty first, so pressing the same button twice is announced twice.
  const say = (s: string) => () => {
    setSaid("");
    setTimeout(() => setSaid(s), 50);
  };
  return [said, say] as const;
}

function Booking({ back, go }: { back: string; go: string }) {
  const [said, say] = useOutcome();
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <DialogPicture
        title={title}
        footer={
          <>
            <Button variant="outline" onClick={say("Not booked. Nothing has changed.")}>
              {back}
            </Button>
            <Button onClick={say("Booked for Tuesday 16 March at 9:30.")}>{go}</Button>
          </>
        }
      >
        A check-up with Dr Orla Venn at Millbrook Dental, about 30 minutes.
      </DialogPicture>
      <Outcome>{said}</Outcome>
    </div>
  );
}

function Do() {
  return <Booking back="Cancel" go="Book appointment" />;
}

function Dont() {
  return <Booking back="No" go="Yes" />;
}

export const ACT001a: RuleExamples = {
  id: "ACT-001a",
  examples: [
    {
      kind: "do",
      title: "The button names the booking",
      caption: (
        <>
          <em>Book appointment</em> says what pressing it does, even read on its own. Tab to each button, then press
          one: the line below says whether the time was booked.
        </>
      ),
      Demo: Do,
    },
    {
      kind: "dont",
      title: "Yes and No",
      caption: (
        <>
          The same dialog with <em>No</em> and <em>Yes</em>. Tab to <em>Yes</em>: the word alone says nothing about what
          happens. A person who skims past the title, or lands on the button without it, has to go back and work out
          what Yes would do.
        </>
      ),
      Demo: Dont,
    },
  ],
};
