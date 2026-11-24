import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { useEffect, useRef, useState } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * TXT-001a: a problem message says what went wrong, names the thing, and
 * gives a next step.
 *
 * Both examples open just after a receipt was refused for being too large.
 * The only difference is the words of the message at the field. A real file
 * picker cannot be driven by the example, so two buttons pick a file for
 * the reader; choosing a file of your own works too.
 */

const LIMIT_MB = 10;

type Picked = { name: string; mb: number };

const large: Picked = { name: "receipt-march.pdf", mb: 18 };
const small: Picked = { name: "receipt-march-small.pdf", mb: 2 };

// One decimal, so a file just over the limit never reads as exactly the limit. A trailing .0 is dropped.
const size = (mb: number) => String(Math.round(mb * 10) / 10);

function AddReceipt({ message }: { message: (p: Picked) => string }) {
  const [error, setError] = useState<string | undefined>(message(large));
  // Bumped on every refusal, so the same message is put in the field's live region again and read again.
  const [tries, setTries] = useState(0);
  const [attached, setAttached] = useState<string | null>(null);
  const [said, setSaid] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Show a file name in the native control, as if the person had chosen it.
  const showInControl = (name: string) => {
    const input = inputRef.current;
    if (!input || typeof DataTransfer === "undefined") return;
    try {
      const dt = new DataTransfer();
      dt.items.add(new File([""], name, { type: "application/pdf" }));
      input.files = dt.files;
    } catch {
      // Some browsers do not let a page set the files. The message still tells the story.
    }
  };

  useEffect(() => showInControl(large.name), []);

  const pick = (p: Picked) => {
    setSaid("");
    if (p.mb > LIMIT_MB) {
      setAttached(null);
      setTries((n) => n + 1);
      setError(message(p));
      return;
    }
    setError(undefined);
    setAttached(p.name);
    setTimeout(() => setSaid("Receipt added to Taxi, 12 March."), 50);
  };

  const pickFor = (p: Picked) => () => {
    showInControl(p.name);
    pick(p);
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
      <div className="grid w-full gap-4 rounded-lg border border-border bg-background p-4">
        <div>
          <h4 className="m-0 text-base font-semibold">Add a receipt</h4>
          <p className="mt-1 mb-0 text-sm text-muted-foreground">
            Taxi, 12 March, $34. {attached ? `Receipt: ${attached}` : "Receipt missing."}
          </p>
        </div>
        <Field label="Receipt" error={error && <span key={tries}>{error}</span>}>
          <Input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="h-auto"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pick({ name: f.name, mb: f.size / (1024 * 1024) });
            }}
          />
        </Field>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
        <span>Try it:</span>
        <Button variant="outline" size="sm" onClick={pickFor(small)}>
          Pick a 2 MB file
        </Button>
        <Button variant="outline" size="sm" onClick={pickFor(large)}>
          Pick the 18 MB file
        </Button>
      </div>
      <Outcome>{said}</Outcome>
    </div>
  );
}

function Do() {
  return (
    <AddReceipt message={(p) => `The file ${p.name} is ${size(p.mb)} MB. Upload a file of ${LIMIT_MB} MB or less.`} />
  );
}

function Dont() {
  return <AddReceipt message={() => "Upload failed"} />;
}

export const TXT001a: RuleExamples = {
  id: "TXT-001a",
  examples: [
    {
      kind: "do",
      title: "The file, the fault and the fix",
      caption: (
        <>
          The message at <em>Receipt</em> names the file, says it is too large and gives the limit to meet. Press{" "}
          <em>Pick a 2 MB file</em>: the message goes and the receipt is added. <em>Pick the 18 MB file</em> brings it
          back. A file of your own works too.
        </>
      ),
      Demo: Do,
    },
    {
      kind: "dont",
      title: "A bare verdict",
      caption: (
        <>
          The message at <em>Receipt</em> says only "Upload failed". Which file, what was wrong with it, and what should
          the person do now? It sits in the same place and comes and goes the same way as in the Do. Only the words
          differ.
        </>
      ),
      Demo: Dont,
    },
  ],
};
