import { Tallowbrook, TwoWidths } from "./nav-demo";
import type { RuleExamples } from "./frame";

/*
 * NAV-002b (a requirement): the menu marks the current item, only that item,
 * and not by colour alone.
 *
 * The drawn Tallowbrook sidebar again. Clients is drawn as if the pointer
 * were over it until the real pointer moves, so the current mark and the
 * hover style can be compared at once. The pointer glyph is drawn, not real.
 */

export const NAV002b: RuleExamples = {
  id: "NAV-002b",
  examples: [
    {
      kind: "do",
      title: "Weight, a bar and a filled icon",
      caption: (
        <>
          <em>Invoices</em> is semibold, has a bar on its leading edge and a filled icon. <em>Clients</em> is drawn as if under the
          pointer and only gets a quiet background, so the two cannot be mixed up. Click an item: the mark follows the page.
        </>
      ),
      Demo: () => <Tallowbrook cue="full" readout={false} initialHover="clients" />,
    },
    {
      kind: "do",
      title: "The mark survives the collapsed sidebar",
      caption: (
        <>
          With the labels gone, the current item keeps a filled icon and a border around it that holds its contrast against
          the bar behind. Click an item in either bar: both follow.
        </>
      ),
      Demo: () => <TwoWidths />,
    },
    {
      kind: "dont",
      title: "Colour is the only difference",
      caption: (
        <>
          <em>Invoices</em> uses the full text colour and the rest a muted one, with the same weight and icons. Take the
          colour away, in forced colours or for a person who does not tell the shades apart, and nothing marks the page. The difference is also under 3:1 in lightness, the least VIS-003a accepts.
        </>
      ),
      Demo: () => <Tallowbrook cue="colour" readout={false} />,
    },
    {
      kind: "dont",
      title: "Current looks like hover",
      caption: (
        <>
          <em>Clients</em> is drawn as if under the pointer and gets the same pill as the current page, so two items look current. Move
          the pointer over the other items to see the second one appear.
        </>
      ),
      Demo: () => <Tallowbrook cue="hoverlike" readout={false} initialHover="clients" />,
    },
  ],
};
