import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { Label } from "@blackwoodblake/justified-shadcn/label";
import { useId, useRef, useState, type ClipboardEvent } from "react";

import type { RuleExamples } from "./frame";
import { box, PasteField, Readout, Samples, q } from "./masks";
import { pasteLastText, usePasteLog } from "./paste-log";

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

/** A reference written in two boxes. A paste into either box fills both. */
function TwoBoxes() {
  const firstId = useId();
  const lastId = useId();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const first = useRef<HTMLInputElement>(null);

  const second = useRef<HTMLInputElement>(null);

  // A paste longer than the first box fills the first three characters there and puts everything else in the second box.
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const all = fold(e.clipboardData.getData("text"));
    if (all.length <= 3) return;
    e.preventDefault();
    setA(all.slice(0, 3));
    setB(all.slice(3));
  };

  // Typing past the third character moves the extra into the second box instead of refusing it.
  const onFirst = (v: string) => {
    const up = v.toUpperCase();
    if (up.length > 3) {
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
            <Label htmlFor={firstId}>First three</Label>
            <Input
              id={firstId}
              ref={first}
              className="w-24 font-mono"
              autoComplete="off"
              value={a}
              onChange={(e) => onFirst(e.target.value)}
              onPaste={onPaste}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor={lastId}>Last three</Label>
            <Input
              id={lastId}
              ref={second}
              className="w-24 font-mono"
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

/** A confirmation field that cancels paste. */
function CancelledPaste() {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const log = usePasteLog();
  return (
    <form noValidate onSubmit={(e) => e.preventDefault()} onPasteCapture={log.cancelled} className="grid gap-2">
      <Field label="Confirm account number">
        <Input
          ref={ref}
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onPaste={(e) => e.preventDefault()}
        />
      </Field>
      <Samples items={["55820419"]} target={ref} name="Confirm account number" />
      <Readout rows={[["The field shows", q(value)], ["The form gets", q(value)], ["Last paste", pasteLastText(log.last)]]} />
    </form>
  );
}

/** A policy number field whose mask cancels any paste with a character it does not know. */
function MaskedPaste() {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const log = usePasteLog();
  return (
    <form noValidate onSubmit={(e) => e.preventDefault()} className="grid gap-2">
      <Field label="Policy number">
        <Input
          ref={ref}
          autoComplete="off"
          value={value}
          onChange={(e) => {
            log.changed(e.target.value);
            setValue(e.target.value);
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (!/^[A-Za-z0-9]*$/.test(text)) {
              e.preventDefault();
              log.blocked(text);
              return;
            }
            log.onPaste(e);
          }}
        />
      </Field>
      <Samples items={["HX-4471-0923", "HX44710923"]} target={ref} name="Policy number" />
      <Readout rows={[["The field shows", q(value)], ["The form gets", q(value)], ["Last paste", pasteLastText(log.last)]]} />
    </form>
  );
}

/** A reference in two boxes of three characters, with nothing that spreads a paste. */
function SplitBoxes() {
  const firstId = useId();
  const lastId = useId();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const first = useRef<HTMLInputElement>(null);
  return (
    <div className="grid gap-2">
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-2 p-0 text-sm font-medium">Booking reference</legend>
        <div className="flex flex-wrap items-end gap-3">
          <div className="grid gap-1">
            <Label htmlFor={firstId}>First three</Label>
            <Input
              id={firstId}
              ref={first}
              className="w-24 font-mono"
              maxLength={3}
              autoComplete="off"
              value={a}
              onChange={(e) => setA(e.target.value.toUpperCase())}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor={lastId}>Last three</Label>
            <Input
              id={lastId}
              className="w-24 font-mono"
              maxLength={3}
              autoComplete="off"
              value={b}
              onChange={(e) => setB(e.target.value.toUpperCase())}
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
          <TwoBoxes />
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
          <CancelledPaste />
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
      notLinted: "Lint gap: a paste cancelled after the handler reads the clipboard, as a mask does, is left alone.",
      Demo: () => (
        <div className={box}>
          <MaskedPaste />
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
      notLinted: "Lint gap: a code split over several boxes is not read, since it needs judgement.",
      Demo: () => (
        <div className={box}>
          <SplitBoxes />
        </div>
      ),
    },
  ],
};
