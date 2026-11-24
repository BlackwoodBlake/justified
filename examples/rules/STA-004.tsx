import { Alert, AlertDescription, AlertTitle } from "@blackwoodblake/justified-shadcn/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@blackwoodblake/justified-shadcn/alert-dialog";
import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { AlertIcon } from "@blackwoodblake/justified-shadcn/icons";
import { Textarea } from "@blackwoodblake/justified-shadcn/textarea";
import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";

import { Outcome, useSay } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * STA-004 (1.0.1): let people turn off, lengthen or extend a time limit the
 * product sets.
 *
 * Both examples show a page with a half-written note. A "Try it" button
 * stands in for 13 minutes without activity, so the example never opens
 * anything by itself.
 *
 *   - The Do opens the system's AlertDialog as the warning, with only
 *     Sign out and Stay signed in. Escape counts as Stay signed in. The
 *     warning lasts 30 seconds here instead of the 2 minutes a product
 *     would give, so it can be tried.
 *   - The Don't shows a warning in the page that counts down from 10
 *     seconds with no button, and then signs the person out and loses the
 *     note.
 */

const NOTE = "Call the supplier about";

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** A countdown that calls onEnd once when it reaches zero. */
function useCountdown(onEnd: () => void) {
  const [left, setLeft] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const end = useRef(onEnd);
  end.current = onEnd;

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  const start = (seconds: number) => {
    stop();
    setLeft(seconds);
    let n = seconds;
    timer.current = setInterval(() => {
      n -= 1;
      setLeft(n);
      if (n <= 0) {
        stop();
        end.current();
      }
    }, 1000);
  };
  useEffect(() => stop, []);
  return { left, start, stop, running: () => timer.current !== null };
}

/** Focus an element after the next render, once it is in the page. */
function useFocusNext() {
  const [target, setTarget] = useState<RefObject<HTMLElement | null> | null>(null);
  useEffect(() => {
    if (!target) return;
    target.current?.focus();
    setTarget(null);
  }, [target]);
  return setTarget;
}

function Page({
  note,
  setNote,
  noteRef,
  triggerRef,
  onTry,
  warning,
}: {
  note: string;
  setNote: (v: string) => void;
  noteRef: RefObject<HTMLTextAreaElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onTry: () => void;
  warning?: ReactNode;
}) {
  return (
    <div className="grid w-full gap-4 rounded-lg border border-border bg-background p-4">
      <h4 className="m-0 text-base font-semibold">Weekly planning</h4>
      <div>
        {warning}
        <Field label="Notes">
          <Textarea ref={noteRef} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </div>
      <div>
        <Button ref={triggerRef} variant="outline" size="sm" onClick={onTry}>
          Try it: skip to the warning
        </Button>
      </div>
    </div>
  );
}

/* Focus moves to Sign in again, which is described by the message, so the message is heard with it. */
function SignedOut({
  message,
  buttonRef,
  onSignIn,
}: {
  message: string;
  buttonRef: RefObject<HTMLButtonElement | null>;
  onSignIn: () => void;
}) {
  const messageId = useId();
  return (
    <div className="grid w-full gap-3 rounded-lg border border-border bg-background p-4">
      <h4 className="m-0 text-base font-semibold">Signed out</h4>
      <p id={messageId} className="m-0 text-sm">
        {message}
      </p>
      <div>
        <Button ref={buttonRef} aria-describedby={messageId} onClick={onSignIn}>
          Sign in again
        </Button>
      </div>
    </div>
  );
}

const WARN_DO = 30;
const WARN_DONT = 10;

function WarnAndExtend() {
  const [note, setNote] = useState(NOTE);
  const [signedIn, setSignedIn] = useState(true);
  const [outMessage, setOutMessage] = useState("");
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const [said, say] = useSay();
  const focusNext = useFocusNext();
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const signInRef = useRef<HTMLButtonElement>(null);
  // Where focus goes once the warning has closed: back to the page, or to Sign in again.
  const afterClose = useRef<RefObject<HTMLElement | null>>(triggerRef);

  const close = () => {
    openRef.current = false;
    countdown.stop();
    setOpen(false);
  };

  const signOut = (message: string) => {
    if (!openRef.current) return;
    close();
    setSignedIn(false);
    setOutMessage(message);
    say("");
    afterClose.current = signInRef;
  };

  const countdown = useCountdown(() =>
    signOut("You were signed out because you were inactive. Your note is kept for when you sign in again."),
  );

  const warn = () => {
    say("");
    openRef.current = true;
    countdown.start(WARN_DO);
    setOpen(true);
  };

  // Stay signed in, and Escape, which counts as the same. Safe to call twice.
  const stay = () => {
    if (!openRef.current) return;
    close();
    say("You are still signed in.");
    afterClose.current = triggerRef;
  };

  const signIn = () => {
    setSignedIn(true);
    say("Signed in. Your note is as you left it.");
    focusNext(noteRef);
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
      {signedIn ? (
        <Page note={note} setNote={setNote} noteRef={noteRef} triggerRef={triggerRef} onTry={warn} />
      ) : (
        <SignedOut message={outMessage} buttonRef={signInRef} onSignIn={signIn} />
      )}
      {/* No Cancel or Close, so Escape, which closes through onOpenChange, counts as Stay signed in. */}
      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          if (!next) stay();
        }}
      >
        <AlertDialogContent
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            afterClose.current.current?.focus();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>You will be signed out soon</AlertDialogTitle>
            <AlertDialogDescription>
              You have been inactive for 13 minutes.{" "}
              <span className="mt-1 block">
                Time left:{" "}
                {/* The ticking clock is for the eye. Screen readers get the time in words, read once as the dialog opens. */}
                <span aria-hidden="true" className="font-medium text-foreground tabular-nums">
                  {clock(countdown.left)}
                </span>
                <span className="sr-only">{WARN_DO} seconds</span>
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => signOut("You have signed out.")}>
              Sign out
            </Button>
            <Button data-autofocus="" onClick={stay}>
              Stay signed in
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Outcome>{said}</Outcome>
    </div>
  );
}

function CountdownOnly() {
  const [note, setNote] = useState(NOTE);
  const [signedIn, setSignedIn] = useState(true);
  const [warning, setWarning] = useState(false);
  const [said, say] = useSay();
  const focusNext = useFocusNext();
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const signInRef = useRef<HTMLButtonElement>(null);
  const message = "You have been signed out because you were inactive. Your note was not saved.";

  const countdown = useCountdown(() => {
    setWarning(false);
    setSignedIn(false);
    setNote("");
    say("");
    focusNext(signInRef);
  });

  const warn = () => {
    if (countdown.running()) return;
    say("");
    countdown.start(WARN_DONT);
    setWarning(true);
  };

  const signIn = () => {
    setSignedIn(true);
    say("Signed in.");
    focusNext(noteRef);
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
      {signedIn ? (
        <Page
          note={note}
          setNote={setNote}
          noteRef={noteRef}
          triggerRef={triggerRef}
          onTry={warn}
          // In the page from the start and empty, so the warning is read when it appears (FBK-004).
          warning={
            <div role="alert">
              {warning && (
                <Alert variant="destructive" className="mb-4">
                  <AlertIcon />
                  <AlertTitle>You will be signed out in {WARN_DONT} seconds because you have been inactive.</AlertTitle>
                  <AlertDescription aria-hidden="true">
                    <p className="tabular-nums">Time left: {clock(countdown.left)}</p>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          }
        />
      ) : (
        <SignedOut message={message} buttonRef={signInRef} onSignIn={signIn} />
      )}
      <Outcome>{said}</Outcome>
    </div>
  );
}

export const STA004: RuleExamples = {
  id: "STA-004",
  examples: [
    {
      kind: "do",
      title: "A warning with one press to stay",
      caption: (
        <>
          <em>Try it: skip to the warning</em> stands in for 13 minutes without activity. The warning opens with focus
          on <em>Stay signed in</em>. Press it, or Escape: the warning closes, focus goes back to the button and the
          note is untouched. Do it as often as you like. If the time runs out, you are signed out and the note is kept.
          The warning lasts 30 seconds here, shortened for the example; a product would give 2 minutes.
        </>
      ),
      Demo: WarnAndExtend,
    },
    {
      kind: "dont",
      title: "A countdown with no way to get more time",
      caption: (
        <>
          Press <em>Try it: skip to the warning</em> and wait. A warning counts down from 10 seconds, with nothing to
          press to stay. At zero you are signed out and the note is gone.
        </>
      ),
      Demo: CountdownOnly,
    },
  ],
};
