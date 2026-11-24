import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Textarea } from "@blackwoodblake/justified-shadcn/textarea";
import { useEffect, useRef, useState, type RefObject } from "react";

import type { RuleExamples } from "./frame";

/*
 * FBK-004: announce a status message from a live region, without moving focus.
 *
 * A note saves on its own after a pause in typing. Both examples show the
 * same words: "Saving draft …" and then "Draft saved at …". In the Do the
 * line is a role="status" region that is in the page from the start, so a
 * screen reader reads each change while focus stays in the text. In the
 * Don't the line is a plain paragraph, so nothing is read.
 *
 * Because the difference cannot be seen, a line under each editor shows
 * what the example sends to the live region. It sees only the roles the
 * example sets and the text written into them, not what a screen reader
 * says. It is hidden from assistive technology and is not a screen reader.
 */

const PAUSE = 1000;
const SAVING = 1000;

const now = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

const LIVE = "[role='status'], [role='alert'], [role='log'], [aria-live='polite'], [aria-live='assertive']";

/** Shows whether the line is a live region, and the last text it marked for announcement. */
function Announced({ target }: { target: RefObject<HTMLElement | null> }) {
  const [live, setLive] = useState<boolean | null>(null);
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    setLive(Boolean(el.closest(LIVE)));
    const observer = new MutationObserver(() => {
      const words = (el.textContent ?? "").replace(/\s+/g, " ").trim();
      if (el.closest(LIVE) && words) setText(words);
    });
    observer.observe(el, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [target]);

  return (
    <div
      aria-hidden="true"
      className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground"
    >
      <p className="m-0">
        The line is{" "}
        <span className="font-medium text-foreground">{live === false ? "a plain paragraph" : "a status region"}</span>
      </p>
      <p className="m-0">
        Sent to the live region:{" "}
        <span className="font-medium text-foreground">
          {text !== null ? `“${text}”` : live === false ? "nothing, the line is not a live region" : "nothing yet"}
        </span>
      </p>
    </div>
  );
}

function NotesEditor({ live }: { live: boolean }) {
  const [notes, setNotes] = useState("Budget for the spring fair agreed.\nOmar books the hall for 14 March.");
  const [line, setLine] = useState("Draft saved at 14:05");
  const pause = useRef<ReturnType<typeof setTimeout>>(undefined);
  const saving = useRef<ReturnType<typeof setTimeout>>(undefined);
  const busy = useRef(false);
  const again = useRef(false);
  const lineRef = useRef<HTMLParagraphElement>(null);

  useEffect(
    () => () => {
      clearTimeout(pause.current);
      clearTimeout(saving.current);
    },
    [],
  );

  const save = () => {
    busy.current = true;
    setLine("Saving draft …");
    saving.current = setTimeout(() => {
      busy.current = false;
      setLine(`Draft saved at ${now()}`);
      // Text typed during the save is saved next, after its own pause.
      if (again.current) {
        again.current = false;
        pause.current = setTimeout(save, PAUSE);
      }
    }, SAVING);
  };

  const type = (value: string) => {
    setNotes(value);
    clearTimeout(pause.current);
    // One save per pause in typing, not one per key press.
    if (busy.current) again.current = true;
    else pause.current = setTimeout(save, PAUSE);
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="grid gap-2 rounded-lg border border-border bg-background p-4 text-foreground">
        <Field label="Meeting notes">
          <Textarea value={notes} onChange={(e) => type(e.target.value)} />
        </Field>
        <p ref={lineRef} role={live ? "status" : undefined} className="m-0 min-h-5 text-sm text-muted-foreground">
          {line}
        </p>
      </div>
      <Announced target={lineRef} />
    </div>
  );
}

export const FBK004: RuleExamples = {
  id: "FBK-004",
  examples: [
    {
      kind: "do",
      title: "The save line is a live region",
      caption: (
        <>
          Type a few words in <em>Meeting notes</em> and stop. After a second the line says "Saving draft …", then
          "Draft saved at" the time. The line is a status region that was there from the start, so a screen reader reads
          each change while focus stays in the text. One save per pause, not one per key. The dashed box shows what is
          sent to the live region.
        </>
      ),
      Demo: () => <NotesEditor live />,
    },
    {
      kind: "dont",
      title: "The same line, not announced",
      caption: (
        <>
          Type and stop. The line changes just as in the Do, but it is a plain paragraph. A screen reader user hears
          nothing, and cannot tell that the draft is saving or that it was saved.
        </>
      ),
      Demo: () => <NotesEditor live={false} />,
    },
  ],
};
