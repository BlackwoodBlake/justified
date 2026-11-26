import { Input } from "@blackwoodblake/justified-shadcn/input";
import { Label } from "@blackwoodblake/justified-shadcn/label";
import { useRef, useState, type ClipboardEvent } from "react";

import type { RuleExamples } from "./frame";
import { box, PasteField, Readout, Samples, q } from "./masks";

/*
 * FRM-017 (a guideline, our own choice): outside sign-in, every text field
 * takes a pasted value, and nothing is cut or dropped without a word.
 *
 * Each sample is written out so it can be copied and pasted for real, and
 * "Paste sample" sends the same paste to the field without the clipboard.
 * The readout under a field says what the field shows and what the form gets.
 */

const happened =
  "The kitchen tap burst on Monday night. Water ran under the floor for about an hour before I found the stop valve.";

const fold = (t: string) => t.replace(/[\s-]/g, "").toUpperCase();

/** A reference written in two boxes. With `spread`, a paste into either box fills both. */
function TwoBoxes({ spread }: { spread: boolean }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const first = useRef<HTMLInputElement>(null);

  const second = useRef<HTMLInputElement>(null);

  // A paste longer than the first box fills the first three characters there and puts everything else in the second box.
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (!spread) return;
    const all = fold(e.clipboardData.getData("text"));
    if (all.length <= 3) return;
    e.preventDefault();
    setA(all.slice(0, 3));
    setB(all.slice(3));
  };

  // Typing past the third character moves the extra into the second box instead of refusing it.
  const onFirst = (v: string) => {
    const up = v.toUpperCase();
    if (spread && up.length > 3) {
      setA(up.slice(0, 3));
      setB(up.slice(3) + b);
      second.current?.focus();
    } else setA(up);
  };

  return (
    <div className="grid gap-2">
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-2 p-0 text-sm font-medium">Booking reference</legend>
        <div className="flex flex-wrap items-end gap-3">
          <div className="grid gap-1">
            <Label htmlFor="ref-first">First three</Label>
            <Input
              id="ref-first"
              ref={first}
              className="w-24 font-mono"
              maxLength={spread ? undefined : 3}
              autoComplete="off"
              value={a}
              onChange={(e) => onFirst(e.target.value)}
              onPaste={onPaste}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="ref-last">Last three</Label>
            <Input
              id="ref-last"
              ref={second}
              className="w-24 font-mono"
              maxLength={spread ? undefined : 3}
              autoComplete="off"
              value={b}
              onChange={(e) => setB(e.target.value.toUpperCase())}
              onPaste={onPaste}
            />
          </div>
        </div>
      </fieldset>
      <Samples items={["KP4-92X"]} target={first} name="Booking reference" />
      <Readout rows={[["The boxes show", `${q(a)} ${q(b)}`], ["The form gets", q(a + b)]]} />
    </div>
  );
}

export const FRM017: RuleExamples = {
  id: "FRM-017",
  examples: [
    {
      kind: "do",
      title: "A single line and a paragraph take the paste",
      caption: (
        <>
          Copy a sample and paste it with the keyboard or the pointer, or press <em>Paste sample</em>. The policy number
          arrives whole, hyphens and all, and so does the paragraph. The form gets the number with spaces at either end
          taken off, and the field keeps what was pasted.
        </>
      ),
      Demo: () => (
        <div className={box}>
          <h4 className="m-0 text-base font-semibold">Home insurance claim</h4>
          <PasteField label="Policy number" samples={["HX-4471-0923", "  HX-4471-0923 "]} clean={(v) => v.trim()} />
          <PasteField label="What happened" multiline samples={[happened]} clean={(v) => v.trim()} />
        </div>
      ),
    },
    {
      kind: "do",
      title: "A reference in two boxes: a paste spreads across both",
      caption: (
        <>
          Paste the sample into either box. The hyphen is dropped, the letters are folded to capitals, and the first three
          characters go in the first box and everything else in the second, so nothing is lost. A paste of three characters or fewer goes in as it is.
        </>
      ),
      Demo: () => (
        <div className={box}>
          <TwoBoxes spread />
        </div>
      ),
    },
    {
      kind: "dont",
      title: "A field that cancels paste",
      caption: (
        <>
          The handler cancels the paste, so nothing arrives and the readout says so. Press <em>Paste sample</em> or paste
          with the keyboard: the field stays empty, and the person has to read eight digits off another window and type
          them again.
        </>
      ),
      Demo: () => (
        <div className={box}>
          <PasteField label="Confirm account number" inputMode="numeric" samples={["55820419"]} allowPaste={() => false} />
        </div>
      ),
    },
    {
      kind: "dont",
      title: "A mask that drops a paste it did not expect",
      caption: (
        <>
          The mask only knows letters and digits. A policy number pasted with its hyphens is dropped whole, with no message.
          Paste the second sample, which has no hyphens, and it goes in, so the person cannot tell what the field wants.
        </>
      ),
      Demo: () => (
        <div className={box}>
          <PasteField
            label="Policy number"
            samples={["HX-4471-0923", "HX44710923"]}
            allowPaste={(t) => /^[A-Za-z0-9]*$/.test(t)}
          />
        </div>
      ),
    },
    {
      kind: "dont",
      title: "Boxes that take a paste in the first box only",
      caption: (
        <>
          Each box holds three characters, and nothing spreads a paste. The sample lands in the first box, which keeps only
          its first three characters, and the second box stays empty. The form gets half a reference.
        </>
      ),
      Demo: () => (
        <div className={box}>
          <TwoBoxes spread={false} />
        </div>
      ),
    },
  ],
};
