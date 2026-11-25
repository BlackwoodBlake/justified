import { CheckIcon } from "@blackwoodblake/justified-shadcn/icons";

import type { RuleExamples } from "./frame";
import { ClockIcon, ReadList, ReadRow, avatarSrc, clockSrc } from "./structure-demo";

/*
 * STR-005 (a requirement): an image or icon that carries information has a
 * text alternative; one that only decorates is hidden.
 *
 * Each row is real markup; the line under it is what a screen reader would
 * speak, worked out from the alt, aria-label, aria-hidden and text the row
 * sets. It is not a screen reader.
 */

const lena = avatarSrc("LO", 200);
const tomas = avatarSrc("TR", 20);
const maya = avatarSrc("ML", 140);

function PaidBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs font-medium">
      <CheckIcon className="size-3.5" />
      Paid
    </span>
  );
}

export const STR005: RuleExamples = {
  id: "STR-005",
  examples: [
    {
      kind: "do",
      title: "The icon that carries the status has a name",
      caption: (
        <>
          The red clock is the only sign that invoice 2026-114 is overdue, so it is a graphic named "Overdue". The tick before{" "}
          <em>Paid</em> only repeats the word, so it is hidden and the row reads once.
        </>
      ),
      Demo: () => (
        <ReadList label="Invoices">
          <ReadRow>
            <span>Invoice 2026-114</span>
            <ClockIcon role="img" aria-label="Overdue" />
          </ReadRow>
          <ReadRow>
            <span>Invoice 2026-113</span>
            <PaidBadge />
          </ReadRow>
        </ReadList>
      ),
    },
    {
      kind: "dont",
      title: "The only sign of the status is hidden",
      caption: (
        <>
          The same row, but the clock is hidden with <code>aria-hidden</code> and nothing else says the invoice is overdue. A sighted
          person sees the problem; a screen reader user never learns of it.
        </>
      ),
      Demo: () => (
        <ReadList label="Invoices">
          <ReadRow>
            <span>Invoice 2026-114</span>
            <ClockIcon aria-hidden="true" />
          </ReadRow>
          <ReadRow>
            <span>Invoice 2026-113</span>
            <PaidBadge />
          </ReadRow>
        </ReadList>
      ),
    },
    {
      kind: "do",
      title: "Avatars named, or empty, by what is beside them",
      caption: (
        <>
          Beside a name, the picture adds nothing and has an empty <code>alt</code>. In the row of faces with no names, each picture
          carries the person's name.
        </>
      ),
      Demo: () => (
        <ReadList label="Customers and team">
          <ReadRow>
            <img src={lena} alt="" width={32} height={32} className="size-8 rounded-full" />
            <span>Lena Okafor</span>
          </ReadRow>
          <ReadRow>
            <span className="flex gap-1">
              <img src={lena} alt="Lena Okafor" width={32} height={32} className="size-8 rounded-full" />
              <img src={tomas} alt="Tomas Reyes" width={32} height={32} className="size-8 rounded-full" />
              <img src={maya} alt="Maya Lindqvist" width={32} height={32} className="size-8 rounded-full" />
            </span>
          </ReadRow>
        </ReadList>
      ),
    },
    {
      kind: "dont",
      title: "A file name and a kind of picture as alternatives",
      caption: (
        <>
          The overdue clock is an <code>img</code> whose <code>alt</code> is its file name, and the avatar's is "Avatar" beside a name
          that is already there. The first says nothing useful; the second adds noise to every row.
        </>
      ),
      Demo: () => (
        <ReadList label="Invoices and customers">
          <ReadRow>
            <span>Invoice 2026-114</span>
            <img src={clockSrc} alt="clock-red-2.svg" width={20} height={20} className="size-5" />
          </ReadRow>
          <ReadRow>
            <img src={lena} alt="Avatar" width={32} height={32} className="size-8 rounded-full" />
            <span>Lena Okafor</span>
          </ReadRow>
        </ReadList>
      ),
    },
  ],
};
