import { Button } from "@blackwoodblake/justified-shadcn/button";
import { AlertIcon, TrashIcon } from "@blackwoodblake/justified-shadcn/icons";
import { useEffect, useRef, useState } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";
import { NameReadout } from "./readout";

/*
 * ACT-001b: every button has a name that says what it does and holds its
 * visible text.
 *
 * Both examples show the same draft with two attachments: one uploaded, one
 * that failed. The Do names the bin buttons by what they do, with the file,
 * and keeps the visible words of Try again in its name. The Don't names the
 * bins after the picture and gives Try again a name without its words.
 * The readout under the scene shows the name each button was given.
 *
 * Removing a file asks no question; Undo next to the status line puts it
 * back (DST-001a). Both examples name Undo correctly, so the Don't breaks
 * only ACT-001b.
 */

type Attachment = { name: string; size: string; failed: boolean };

const start: Attachment[] = [
  { name: "contract.pdf", size: "240 KB", failed: false },
  { name: "floor-plan.png", size: "1.2 MB", failed: true },
];

type Names = {
  remove: (file: string) => string;
  retry: (file: string) => string;
};

function Draft({ names }: { names: Names }) {
  const [files, setFiles] = useState(start);
  const [said, setSaid] = useState("");
  // Where focus should go after the list changes: a file's bin, or the reset button.
  const [focusNext, setFocusNext] = useState<string | null>(null);
  // The last file removed and where it was, for Undo.
  const [removed, setRemoved] = useState<{ file: Attachment; at: number } | null>(null);
  const scene = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focusNext) return;
    scene.current?.querySelector<HTMLElement>(`[data-focus="${focusNext}"]`)?.focus();
    setFocusNext(null);
  }, [focusNext]);

  const say = (s: string) => {
    setSaid("");
    setTimeout(() => setSaid(s), 50);
  };

  const retry = (name: string) => {
    setFiles((fs) => fs.map((f) => (f.name === name ? { ...f, failed: false } : f)));
    setRemoved(null);
    say(`${name} uploaded.`);
    // The Try again button goes away, so focus moves to the same row's bin.
    setFocusNext(`remove-${name}`);
  };

  const remove = (name: string) => {
    const i = files.findIndex((f) => f.name === name);
    const rest = files.filter((f) => f.name !== name);
    setFiles(rest);
    setRemoved({ file: files[i], at: i });
    say(`${name} removed.`);
    const next = rest[i] ?? rest[i - 1];
    setFocusNext(next ? `remove-${next.name}` : "reset");
  };

  const undo = () => {
    if (!removed) return;
    const { file, at } = removed;
    setFiles((fs) => [...fs.slice(0, at), file, ...fs.slice(at)]);
    setRemoved(null);
    say(`${file.name} is back in the draft.`);
    setFocusNext(`remove-${file.name}`);
  };

  const reset = () => {
    setFiles(start);
    setRemoved(null);
    say("");
    setFocusNext(`remove-${start[0].name}`);
  };

  return (
    <div ref={scene} className="flex w-full max-w-sm flex-col items-center gap-3">
      <NameReadout>
        <div className="rounded-lg border border-border bg-background p-4">
          <h4 className="m-0 text-sm font-semibold">Attachments</h4>
          {files.length > 0 ? (
            <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
              {files.map((f) => (
                <li key={f.name} className="flex items-start gap-2">
                  <div className="min-w-0 flex-1 pt-2.5 text-sm">
                    {f.failed ? (
                      <>
                        <p className="m-0 flex items-start gap-1.5 font-medium text-destructive">
                          <AlertIcon className="mt-0.5 size-4 shrink-0" />
                          <span className="min-w-0 break-words">
                            {f.name} could not be uploaded. The connection dropped. Try again.
                          </span>
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          aria-label={names.retry(f.name)}
                          onClick={() => retry(f.name)}
                        >
                          Try again
                        </Button>
                      </>
                    ) : (
                      <p className="m-0 break-words">
                        {f.name}, <span className="text-muted-foreground">{f.size}</span>
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    data-focus={`remove-${f.name}`}
                    aria-label={names.remove(f.name)}
                    onClick={() => remove(f.name)}
                  >
                    <TrashIcon />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <p className="m-0 text-muted-foreground">No files attached.</p>
              <Button variant="outline" size="sm" data-focus="reset" onClick={reset}>
                Reset example
              </Button>
            </div>
          )}
        </div>
      </NameReadout>
      <Outcome>{said}</Outcome>
      {removed && (
        <Button variant="outline" size="sm" aria-label={`Undo removing ${removed.file.name}`} onClick={undo}>
          Undo
        </Button>
      )}
    </div>
  );
}

const named: Names = {
  remove: (file) => `Remove attachment ${file}`,
  retry: (file) => `Try again, upload ${file}`,
};

const misnamed: Names = {
  remove: () => "Bin",
  retry: () => "Resend file",
};

function Do() {
  return <Draft names={named} />;
}

function Dont() {
  return <Draft names={misnamed} />;
}

export const ACT001b: RuleExamples = {
  id: "ACT-001b",
  examples: [
    {
      kind: "do",
      title: "Named by what it does, visible words kept",
      caption: (
        <>
          The bin buttons show no text, so their names say what they do and to which file. <em>Try again</em> keeps its
          words at the start of its name. Tab through the buttons and read the name under the list. Press{" "}
          <em>Try again</em>: the file uploads and focus moves to its bin. Remove a file and <em>Undo</em> puts it back.
        </>
      ),
      Demo: Do,
    },
    {
      kind: "dont",
      title: "Named after the picture, visible words missing",
      caption: (
        <>
          The bins are named after their picture, so a screen reader says “Bin” and not what pressing it does. Tab to{" "}
          <em>Try again</em>: its name is “Resend file”, so a speech command for the words on screen finds nothing.
        </>
      ),
      Demo: Dont,
    },
  ],
};
