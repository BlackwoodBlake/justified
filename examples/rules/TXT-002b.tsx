import { Button } from "@blackwoodblake/justified-shadcn/button";
import { InfoIcon } from "@blackwoodblake/justified-shadcn/icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@blackwoodblake/justified-shadcn/tooltip";
import { useState } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * TXT-002b: a tooltip opens on keyboard focus too, and holds only extra help.
 *
 * Both examples show the same booking card with an info button that opens a
 * tooltip on hover and on focus (the adapter's Tooltip, unchanged). In the
 * Do the deadline for changes is written on the card and the tooltip adds a
 * detail people can do without. In the Don't the deadline is only in the
 * tooltip.
 */

const deadline = "You can change this booking until 6 pm the day before.";

function Booking({ deadlineOnCard }: { deadlineOnCard: boolean }) {
  const [said, setSaid] = useState("");
  const say = (s: string) => () => {
    setSaid("");
    setTimeout(() => setSaid(s), 50);
  };

  return (
    <TooltipProvider>
      <div className="flex w-full max-w-sm flex-col items-center gap-3">
        <div className="grid w-full gap-3 rounded-lg border border-border bg-background p-4">
          <div>
            <div className="flex items-center gap-1">
              <h4 className="m-0 text-base font-semibold">Table for 2, Friday 7 pm</h4>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="About bookings">
                    <InfoIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {deadlineOnCard ? "We keep your table for 15 minutes after the booked time." : deadline}
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="m-0 text-sm text-muted-foreground">The Copper Pot, 14 Mill Street</p>
            {deadlineOnCard && <p className="mt-2 mb-0 text-sm">{deadline}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={say("The form to change the booking would open here.")}>
              Change booking
            </Button>
            <Button
              variant="outline"
              onClick={say("Link to the booking copied. (In this example nothing goes to your clipboard.)")}
            >
              Copy link
            </Button>
          </div>
        </div>
        <Outcome>{said}</Outcome>
      </div>
    </TooltipProvider>
  );
}

export const TXT002b: RuleExamples = {
  id: "TXT-002b",
  examples: [
    {
      kind: "do",
      title: "The deadline is on the card",
      caption: (
        <>
          The card itself says until when the booking can be changed. Tab to the info button next to the heading, or
          rest the pointer on it: the tooltip opens and adds a detail the person can do without.
        </>
      ),
      Demo: () => <Booking deadlineOnCard />,
    },
    {
      kind: "dont",
      title: "The deadline only in a tooltip",
      caption: (
        <>
          Nothing on the card says until when the booking can be changed. That is only in the tooltip on the info
          button, which opens on focus and hover. Touch screens have no hover, and many people never think to look.
        </>
      ),
      Demo: () => <Booking deadlineOnCard={false} />,
    },
  ],
};
