import type { RuleExamples } from "./frame";
import { box, Counted, textOf } from "./masks";

/*
 * FRM-017c (a guideline, our own choice): at a limit, the field says so in
 * words, and never stops or cuts typed or pasted text in silence. The rule
 * allows both a hard stop and an overflow, so each has a Do.
 *
 * The sample is a longer paragraph than the field takes, so a paste shows
 * what happens at the limit. The readout says what was pasted and what was kept.
 */

const hint = "Up to 500 characters";
const paragraph = textOf(700, 2);

export const FRM017c: RuleExamples = {
  id: "FRM-017c",
  examples: [
    {
      kind: "do",
      title: "Input stops at the limit, and the count says so",
      caption: (
        <>
          The field holds 500 characters and the count reads &ldquo;Limit reached&rdquo;. Type another character, or paste
          the sample: nothing more goes in, and your own text and the caret stay where they are. After a paste the count
          says how many of the pasted characters were not added, so the lost end is never a surprise. The words are
          announced politely, and focus stays in the field.
        </>
      ),
      Demo: () => (
        <div className={box}>
          <h4 className="m-0 text-base font-semibold">Volunteer sign-up</h4>
          <Counted
            label="Tell us about yourself"
            hint={hint}
            limit={500}
            unit="characters"
            initial={textOf(500)}
            sample={paragraph}
            count="tied"
            at="stop"
            say="polite"
          />
        </div>
      ),
    },
    {
      kind: "do",
      title: "Input runs past the limit, and the count and the error say so",
      caption: (
        <>
          The field already holds 520 characters, so the count reads &ldquo;20 characters over the limit&rdquo;, with an icon
          as well as words. Nothing is cut, and while the person types the count is not an error: the field is not
          marked invalid. Leave the field after a change, or press <em>Send application</em>, and the message at the
          field says what to do, naming the field by its visible label. Delete 20 characters and it goes.
        </>
      ),
      Demo: () => (
        <div className={box}>
          <h4 className="m-0 text-base font-semibold">Volunteer sign-up</h4>
          <Counted
            label="Tell us about yourself"
            hint={hint}
            limit={500}
            unit="characters"
            initial={textOf(520)}
            sample={paragraph}
            count="tied"
            at="over"
            say="polite"
            send
          />
        </div>
      ),
    },
    {
      kind: "dont",
      title: "A cap that cuts a paste in silence",
      caption: (
        <>
          <code>maxLength</code> is 500 and nothing else speaks. Paste the sample, which is 700 characters: the field keeps
          the first 500 and the readout shows the difference. The end of what the person wrote is gone, and the page said
          nothing.
        </>
      ),
      Demo: () => (
        <div className={box}>
          <h4 className="m-0 text-base font-semibold">Volunteer sign-up</h4>
          <Counted
            label="Tell us about yourself"
            hint={hint}
            limit={500}
            unit="characters"
            sample={paragraph}
            count="none"
            at="maxlength"
            say="none"
          />
        </div>
      ),
    },
    {
      kind: "dont",
      title: "A count that only turns red",
      caption: (
        <>
          The count reads &ldquo;500/500&rdquo; and turns red at the limit, and that is all. Type another character or paste
          the sample: the field stops and nothing says why. A person who cannot see the colour, or does not know what it
          means, has only a field that seems broken.
        </>
      ),
      Demo: () => (
        <div className={box}>
          <h4 className="m-0 text-base font-semibold">Volunteer sign-up</h4>
          <Counted
            label="Tell us about yourself"
            hint={hint}
            limit={500}
            unit="characters"
            initial={textOf(500)}
            sample={paragraph}
            count="tied"
            at="stop"
            say="none"
            words="fraction"
            redOnly
          />
        </div>
      ),
    },
  ],
};
