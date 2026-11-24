import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@blackwoodblake/justified-shadcn/alert-dialog";
import { Button } from "@blackwoodblake/justified-shadcn/button";
import { useEffect, useId, useRef, useState } from "react";

import { DialogPicture, drawnRing, Outcome, Still, useSay } from "./dialog";
import type { RuleExamples } from "./frame";
import { Toast, ToastRegion } from "./toast";

/*
 * DST-001a: when an action can be fully reversed, run it at once and offer
 * Undo, instead of asking first.
 *
 * A list of projects with Archive on each row. Archived projects stay under
 * Archived projects, where Restore brings them back, so the action is fully
 * reversed and a lasting way back remains (FBK-005).
 *
 *   - Do: Archive runs at once. The list shows the change (FBK-003), and a
 *     message with Undo appears in a polite region that is in the page from
 *     the start (FBK-004), below the list so it covers nothing (KBD-002). It
 *     stays until it is used or closed. The scene starts just after Autumn
 *     2026 was archived, with the message showing.
 *   - Don't: Archive asks "Archive this project?" every time, in the
 *     system's AlertDialog, and offers no Undo.
 *
 * Focus: after Archive, to the next row's Archive button, or the list's
 * heading. After Undo or Restore, to the project that came back. After the
 * message is closed, to Archived projects.
 */

const projects = ["Spring 2027", "Autumn 2026", "Winter 2026", "Harbour survey"];

const focusable =
  "rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function Projects({ undo }: { undo: boolean }) {
  // The Do starts just after Autumn 2026 was archived; the Don't starts with nothing archived.
  const [archived, setArchived] = useState<string[]>(undo ? ["Autumn 2026"] : []);
  // One message per archived project, so a newer one never takes away an Undo that still applies.
  const [messages, setMessages] = useState<string[]>(undo ? ["Autumn 2026"] : []);
  const [asking, setAsking] = useState<string | null>(null);
  const [said, say] = useSay();
  const listId = useId();
  const archiveId = useId();
  const listHeading = useRef<HTMLHeadingElement>(null);
  const archiveHeading = useRef<HTMLHeadingElement>(null);
  const rowRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [focusNext, setFocusNext] = useState<(() => HTMLElement | null) | null>(null);
  // In the Don't, focus is set once the question has closed, not while it still holds focus.
  const afterQuestion = useRef<(() => HTMLElement | null) | null>(null);

  useEffect(() => {
    if (!focusNext) return;
    focusNext()?.focus();
    setFocusNext(null);
  }, [focusNext]);

  const active = projects.filter((p) => !archived.includes(p));

  const archive = (name: string) => {
    const i = active.indexOf(name);
    const next = active[i + 1] ?? active[i - 1];
    setArchived((a) => [...a, name]);
    const target = () => (next ? buttonRefs.current[next] : listHeading.current);
    if (undo) setFocusNext(() => target);
    else afterQuestion.current = target;
    if (undo) setMessages((m) => [...m.filter((n) => n !== name), name]);
    else say(`Project ${name} archived.`);
  };

  const bringBack = (name: string, words: string) => {
    setArchived((a) => a.filter((p) => p !== name));
    // Only this project's message goes; the others still apply.
    setMessages((m) => m.filter((n) => n !== name));
    setFocusNext(() => () => rowRefs.current[name]);
    say(words);
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {!undo && (
        <Still>
          <DialogPicture
            title="Archive this project?"
            footer={
              <>
                <Button variant="outline" tabIndex={-1} className={drawnRing}>
                  Cancel
                </Button>
                <Button tabIndex={-1}>Archive project</Button>
              </>
            }
          >
            Spring 2027 moves to Archived projects.
          </DialogPicture>
        </Still>
      )}

      <div className="w-full max-w-sm rounded-lg border border-border bg-background p-4 text-sm text-foreground">
        <h4 ref={listHeading} id={listId} tabIndex={-1} className={`m-0 text-base font-semibold ${focusable}`}>
          Projects
        </h4>
        <ul aria-labelledby={listId} className="m-0 mt-2 list-none p-0">
          {active.map((p) => (
            <li
              key={p}
              ref={(el) => {
                rowRefs.current[p] = el;
              }}
              tabIndex={-1}
              className={`flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-border py-1.5 last:border-0 ${focusable}`}
            >
              <span className="font-medium">{p}</span>
              <Button
                ref={(el) => {
                  buttonRefs.current[p] = el;
                }}
                variant="ghost"
                size="sm"
                onClick={() => {
                  say("");
                  if (undo) archive(p);
                  else setAsking(p);
                }}
              >
                Archive<span className="sr-only"> {p}</span>
              </Button>
            </li>
          ))}
        </ul>
        {active.length === 0 && <p className="m-0 mt-2 text-muted-foreground">No active projects.</p>}

        <h4 ref={archiveHeading} id={archiveId} tabIndex={-1} className={`m-0 mt-4 text-sm font-semibold ${focusable}`}>
          Archived projects
        </h4>
        {archived.length > 0 ? (
          <ul aria-labelledby={archiveId} className="m-0 mt-1 list-none p-0">
            {archived.map((p) => (
              <li key={p} className="flex min-h-10 flex-wrap items-center justify-between gap-2">
                <span className="text-muted-foreground">{p}</span>
                <Button variant="ghost" size="sm" onClick={() => bringBack(p, `Restored. ${p} is back in Projects.`)}>
                  Restore<span className="sr-only"> {p}</span>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 mt-1 text-muted-foreground">None.</p>
        )}
      </div>

      {undo && (
        <div className="w-full max-w-sm">
          <ToastRegion>
            {messages.map((name) => (
              <Toast
                key={name}
                closeLabel={`Close message about ${name}`}
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`Undo archiving ${name}`}
                    onClick={() => bringBack(name, `Undone. ${name} is back in Projects.`)}
                  >
                    Undo
                  </Button>
                }
                onClose={() => {
                  setMessages((m) => m.filter((n) => n !== name));
                  setFocusNext(() => () => archiveHeading.current);
                }}
              >
                Project {name} archived
              </Toast>
            ))}
          </ToastRegion>
        </div>
      )}

      {!undo && (
        <AlertDialog
          open={asking !== null}
          onOpenChange={(next) => {
            if (!next && asking) {
              setAsking(null);
              say(`Cancelled. ${asking} is still in Projects.`);
            }
          }}
        >
          <AlertDialogContent
            onCloseAutoFocus={(e) => {
              // After Archive, the row's own button is gone; archive() has chosen where focus goes.
              const target = afterQuestion.current;
              if (!target) return;
              afterQuestion.current = null;
              e.preventDefault();
              target()?.focus();
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Archive this project?</AlertDialogTitle>
              <AlertDialogDescription>{asking} moves to Archived projects.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel />
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  if (!asking) return;
                  setAsking(null);
                  archive(asking);
                }}
              >
                Archive project
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <Outcome>{said}</Outcome>
    </div>
  );
}

export const DST001a: RuleExamples = {
  id: "DST-001a",
  examples: [
    {
      kind: "do",
      title: "Archive at once, with Undo",
      caption: (
        <>
          Autumn 2026 has just been archived: it has left the list, and the message below offers <em>Undo</em>, which
          puts it back in its place. Archive another project and it gets its own message. Each message stays until you
          use or close it, and <em>Restore</em> under <em>Archived projects</em> works later too.
        </>
      ),
      Demo: () => <Projects undo />,
    },
    {
      kind: "dont",
      title: "A question before every archive",
      caption: (
        <>
          Each <em>Archive</em> asks &ldquo;Archive this project?&rdquo; first, although <em>Restore</em> undoes it in
          one click. After a few projects, people press <em>Archive project</em> without reading, and there is still no{" "}
          <em>Undo</em> for the slip.
        </>
      ),
      Demo: () => <Projects undo={false} />,
    },
  ],
};
