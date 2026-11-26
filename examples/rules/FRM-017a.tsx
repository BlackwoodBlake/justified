import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { useRef, useState, type FormEvent } from "react";

import type { RuleExamples } from "./frame";
import { box, PasteField, Readout, Samples, q } from "./masks";
import { pasteLastText, usePasteLog } from "./paste-log";

/*
 * FRM-017a (a guideline, our own choice): a number or code people write in
 * several ways is cleaned before it is checked, and nothing is refused for
 * its spaces, hyphens, brackets, dots or letter case.
 *
 * The field keeps what was typed or pasted; the form gets the cleaned value.
 * Each Don't breaks one thing: the check, the length cap, or the keys.
 */

const cleanRef = (v: string) => v.replace(/[\s\-().]/g, "").toUpperCase();
const refProblem = (c: string) =>
  /^[A-Z0-9]{6}$/.test(c) ? undefined : "Enter a booking reference with 6 letters and digits, such as KP492X.";

const cleanPhone = (v: string) => {
  const t = v.trim();
  return (t.startsWith("+") ? "+" : "") + t.replace(/[^\d]/g, "");
};
const phoneProblem = (c: string) =>
  /^\+?\d{10,13}$/.test(c) ? undefined : "Enter a mobile number with 10 to 13 digits, such as 07700 900123.";

const groups = (v: string) => (v.replace(/[\s\-().]/g, "").match(/.{1,4}/g) ?? []).join(" ");

/** A booking reference field that checks exactly what was typed. */
function RawCheck() {
  const [value, setValue] = useState("");
  const [shown, setShown] = useState(false);
  const [changed, setChanged] = useState(false);
  const [round, setRound] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const log = usePasteLog();
  const problem = /^[A-Z0-9]{6}$/.test(value) ? undefined : "Invalid booking reference";

  const send = (e: FormEvent) => {
    e.preventDefault();
    setShown(true);
    // With a problem, focus goes to the field, and the move reads the message, so the region stays quiet this round.
    if (problem) {
      setRound(true);
      ref.current?.focus();
    }
  };

  return (
    <form noValidate onSubmit={send} className="grid gap-2">
      <Field label="Booking reference" error={shown ? problem : undefined} announce={!round}>
        <Input
          ref={ref}
          autoComplete="off"
          value={value}
          onChange={(e) => {
            log.changed(e.target.value);
            setValue(e.target.value);
            setChanged(true);
            setRound(false);
          }}
          onPaste={log.onPaste}
          onBlur={() => {
            if (changed) setShown(true);
          }}
        />
      </Field>
      <div>
        <Button type="submit" size="sm" variant="secondary">
          Find booking
        </Button>
      </div>
      <Samples items={["KP4 92X", "KP492X"]} target={ref} name="Booking reference" />
      <Readout
        rows={[
          ["The field shows", q(value)],
          ["The form gets", q(value)],
          ["Check", !value ? "(nothing yet)" : problem ? "refused" : "accepted"],
          ["Last paste", pasteLastText(log.last)],
        ]}
      />
    </form>
  );
}

/** A booking reference field with a length cap of six. */
function CappedReference() {
  const [value, setValue] = useState("");
  const [shown, setShown] = useState(false);
  const [changed, setChanged] = useState(false);
  const [round, setRound] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const log = usePasteLog();
  const cleaned = cleanRef(value);
  const problem = refProblem(cleaned);

  const send = (e: FormEvent) => {
    e.preventDefault();
    setShown(true);
    // With a problem, focus goes to the field, and the move reads the message, so the region stays quiet this round.
    if (problem) {
      setRound(true);
      ref.current?.focus();
    }
  };

  return (
    <form noValidate onSubmit={send} className="grid gap-2">
      <Field label="Booking reference" error={shown ? problem : undefined} announce={!round}>
        <Input
          ref={ref}
          autoComplete="off"
          maxLength={6}
          value={value}
          onChange={(e) => {
            log.changed(e.target.value);
            setValue(e.target.value);
            setChanged(true);
            setRound(false);
          }}
          onPaste={log.onPaste}
          onBlur={() => {
            if (changed) setShown(true);
          }}
        />
      </Field>
      <div>
        <Button type="submit" size="sm" variant="secondary">
          Find booking
        </Button>
      </div>
      <Samples items={["KP4 92X"]} target={ref} name="Booking reference" />
      <Readout
        rows={[
          ["The field shows", q(value)],
          ["The form gets", q(cleaned)],
          ["Check", !cleaned ? "(nothing yet)" : problem ? "refused" : "accepted"],
          ["Last paste", pasteLastText(log.last)],
        ]}
      />
    </form>
  );
}

/** A mobile number field that only lets digit keys through. */
function DigitKeysOnly() {
  const [value, setValue] = useState("");
  const [refused, setRefused] = useState<string | null>(null);
  const log = usePasteLog();
  return (
    <form noValidate onSubmit={(e) => e.preventDefault()} className="grid gap-2">
      <Field label="Mobile number">
        <Input
          type="tel"
          autoComplete="tel"
          value={value}
          onChange={(e) => {
            log.changed(e.target.value);
            setValue(e.target.value);
          }}
          onPaste={log.onPaste}
          onKeyDown={(e) => {
            if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
            if (!/\d/.test(e.key)) {
              e.preventDefault();
              setRefused(e.key === " " ? "space" : e.key);
            }
          }}
        />
      </Field>
      <p className="m-0 text-xs text-muted-foreground">
        Try typing{" "}
        <code className="whitespace-pre rounded-md bg-muted px-2 py-1">
          <span aria-hidden="true" className="select-none">“</span>
          <span className="select-all">+44 7700 900123</span>
          <span aria-hidden="true" className="select-none">”</span>
        </code>
      </p>
      <Readout
        rows={[
          ["The field shows", q(value)],
          ["The form gets", q(cleanPhone(value))],
          ["Last paste", pasteLastText(log.last)],
          ["Last key refused", refused ? q(refused) : "(none yet)"],
        ]}
      />
    </form>
  );
}

export const FRM017a: RuleExamples = {
  id: "FRM-017a",
  examples: [
    {
      kind: "do",
      title: "Cleaned before it is checked",
      caption: (
        <>
          Paste each sample, or copy and paste it yourself. Capitals, spaces, hyphens, brackets and a leading plus all
          pass. The field keeps exactly what was pasted, and the line below it shows what the form gets. Then press
          the button with an empty or wrong value to see a message that says what to do.
        </>
      ),
      Demo: () => (
        <div className={box}>
          <h4 className="m-0 text-base font-semibold">Find your booking</h4>
          <p className="m-0 text-sm text-muted-foreground">Look it up by booking reference or by mobile number.</p>
          <PasteField
            label="Booking reference"
            samples={["kp4 92x", "KP492X", " KP4-92X "]}
            clean={cleanRef}
            check={refProblem}
            action="Find booking"
          />
          <PasteField
            label="Mobile number"
            type="tel"
            autoComplete="tel"
            samples={["+44 7700 900123", "07700 900123", "(07700) 900-123"]}
            clean={cleanPhone}
            check={phoneProblem}
            action="Find booking by phone"
          />
        </div>
      ),
    },
    {
      kind: "do",
      title: "A field that groups as people type keeps the caret",
      caption: (
        <>
          A space goes in after every four characters. Type a space or a hyphen anywhere: nothing happens and nothing is
          refused. Paste the hyphenated sample and it is grouped whole. Click between two digits and type: the caret stays
          where you are typing. The form gets the value without the spaces.
        </>
      ),
      Demo: () => (
        <div className={box}>
          <PasteField
            label="Library card number"
            samples={["2938-0047-1182-06", "29380047118206"]}
            format={groups}
            clean={(v) => v.replace(/[\s\-().]/g, "")}
            check={(c) => (/^\d{14}$/.test(c) ? undefined : "Enter a library card number with 14 digits.")}
            action="Check card"
          />
        </div>
      ),
    },
    {
      kind: "dont",
      title: "The raw value is checked",
      caption: (
        <>
          The check runs on exactly what was typed, so a reference with a space in it, which is how it is written on the
          letter, is refused with a message that does not say why. Paste the first sample and press the button. The second
          sample, with the reference run together, is accepted, so the person is left to guess what was wrong.
        </>
      ),
      notLinted: "Lint gap: only a Zod schema is read for a check on the raw value, not a hand-written one.",
      Demo: () => (
        <div className={box}>
          <RawCheck />
        </div>
      ),
    },
    {
      kind: "dont",
      title: "A length cap that cuts the paste",
      caption: (
        <>
          The field holds six characters, because a reference has six. The sample has a space in it, which uses up a place, so
          its last character is lost. Nothing says so, and the readout shows what was pasted against what was kept.
        </>
      ),
      Demo: () => (
        <div className={box}>
          <CappedReference />
        </div>
      ),
    },
    {
      kind: "dont",
      title: "Keys the field refuses",
      caption: (
        <>
          Only digit keys work. Try typing the sample: the plus sign and the spaces do nothing, and the readout names the last
          key that was refused. A person who types a number as it is written gets a field that seems not to listen.
        </>
      ),
      Demo: () => (
        <div className={box}>
          <DigitKeysOnly />
        </div>
      ),
    },
  ],
};
