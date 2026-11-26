import { Button } from "@blackwoodblake/justified-shadcn/button";
import { useState, type ReactNode } from "react";

/*
 * Small pieces for the label-target examples (FRM-016a, FRM-016b). For the
 * examples only; not a component of the system.
 *
 * useTally counts the changes the control reported and the presses that
 * landed on the words. Tally draws both, so a press on words that do nothing
 * is visible: the first count rises and the second stays still.
 * DeadWords is text that looks like a label and is tied to nothing. It only
 * counts the press, it never changes the control.
 */

export function useTally() {
  const [changes, setChanges] = useState(0);
  const [words, setWords] = useState(0);
  return {
    changes,
    words,
    changed: () => setChanges((n) => n + 1),
    pressedWords: () => setWords((n) => n + 1),
    reset: () => {
      setChanges(0);
      setWords(0);
    },
  };
}

export function Tally({
  summary,
  changes,
  words,
  onReset,
  explain,
}: {
  summary: ReactNode;
  changes: number;
  /** Set only where the words are dead: presses on them are counted and explained. */
  words?: number;
  onReset: () => void;
  explain?: string;
}) {
  return (
    <div className="grid gap-1 border-t border-border pt-3 text-sm">
      <p className="m-0">{summary}</p>
      <p className="m-0">
        Changes made: <strong className="tabular-nums">{changes}</strong>
        {words !== undefined && (
          <>
            {" · "}Presses on the words: <strong className="tabular-nums">{words}</strong>
          </>
        )}
      </p>
      {explain !== undefined && (
        <p role="status" className="m-0 min-h-10 text-muted-foreground">
          {words ? explain : ""}
        </p>
      )}
      <div>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Start again
        </Button>
      </div>
    </div>
  );
}

/** Text that looks like a label and does nothing when pressed, as a span or a Label with no htmlFor would. */
export function DeadWords({ id, onPress, children }: { id: string; onPress: () => void; children: ReactNode }) {
  return (
    <span id={id} onClick={onPress} className="text-sm font-medium text-foreground select-none">
      {children}
    </span>
  );
}

export function Scene({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid w-full max-w-sm gap-3 rounded-lg border border-border bg-background p-4">
      <h4 className="m-0 text-base font-semibold">{title}</h4>
      {children}
    </div>
  );
}
