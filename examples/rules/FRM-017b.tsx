import type { RuleExamples } from "./frame";
import { box, Counted, textOf, wordsOf } from "./masks";

/*
 * FRM-017b (a guideline, our own choice): a free-text field with a limit
 * states the limit and shows a count that is tied to the field in code.
 *
 * Every field here is the same volunteer sign-up question. The readout reads
 * what the field is described by from the page and what a screen reader is
 * told, so a count that is only on the screen shows as missing.
 */

const hint = "Up to 500 characters";

export const FRM017b: RuleExamples = {
  id: "FRM-017b",
  examples: [
    {
      kind: "do",
      title: "The limit in the hint, the count tied to the field",
      caption: (
        <>
          The hint states the limit, and the count under the field says how many characters are left. The field points to
          both, and the readout shows they are read with it. Type or delete a few characters and pause: a screen reader is
          told the whole phrase once, politely, and not on every key. The count is not an error.
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
            initial={textOf(180)}
            count="tied"
            at="over"
            say="polite"
          />
        </div>
      ),
    },
    {
      kind: "do",
      title: "A word limit works the same way",
      caption: (
        <>
          The hint says &ldquo;Up to 250 words&rdquo; and the count says how many words are left. Add or delete a word and
          pause to hear the phrase. The count counts words the way the form does: runs of spaces and line breaks separate them.
        </>
      ),
      Demo: () => (
        <div className={box}>
          <h4 className="m-0 text-base font-semibold">Volunteer sign-up</h4>
          <Counted
            label="Tell us about yourself"
            hint="Up to 250 words"
            limit={250}
            unit="words"
            initial={wordsOf(210)}
            count="tied"
            at="over"
            say="polite"
          />
        </div>
      ),
    },
    {
      kind: "dont",
      title: "The limit only in the database column",
      caption: (
        <>
          <code>maxLength</code> is copied from the column and nothing else says there is a limit: no hint and no count. The
          field holds 480 characters and the person cannot know that 20 more is all there is. Type 25 characters to find out.
        </>
      ),
      Demo: () => (
        <div className={box}>
          <h4 className="m-0 text-base font-semibold">Volunteer sign-up</h4>
          <Counted
            label="Tell us about yourself"
            limit={500}
            unit="characters"
            initial={textOf(480)}
            count="none"
            at="maxlength"
            say="none"
          />
        </div>
      ),
    },
    {
      kind: "dont",
      title: "A count nothing points to",
      caption: (
        <>
          The count is on the screen, so it looks right. But the field is not described by it and it is not announced: the
          readout shows the field is read with the hint only, and that a screen reader is told nothing as the number changes.
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
            initial={textOf(180)}
            count="untied"
            at="over"
            say="none"
            words="fraction"
          />
        </div>
      ),
    },
    {
      kind: "dont",
      title: "A count that interrupts on every key",
      caption: (
        <>
          The count is tied to the field, but it is an assertive live region, so every key press interrupts what a screen
          reader is saying. Type a letter: the readout shows the phrase is announced at once, and again for the next key.
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
            initial={textOf(180)}
            count="tied"
            at="over"
            say="assertive"
          />
        </div>
      ),
    },
  ],
};
