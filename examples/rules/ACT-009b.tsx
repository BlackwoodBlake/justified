import { Button } from "@blackwoodblake/justified-shadcn/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@blackwoodblake/justified-shadcn/dialog";
import { focusRing } from "@blackwoodblake/justified-shadcn/styles";
import { useId, useRef, useState } from "react";

import type { RuleExamples } from "./frame";
import { Scene, useSceneSay } from "./links-buttons";

/*
 * ACT-009b: a control that acts where the person is is a button, also when
 * it looks like a link. No a href="#" or click that is cancelled.
 *
 * A podcast episode row in three scenes. The list under each scene shows
 * what a screen reader's lists of links and buttons hold, with the state
 * each control carries. The Don'ts use a real anchor, which works with Tab
 * and Enter; Space does nothing on it. Nothing leaves Storybook.
 */

const EPISODE = "Episode 42: Sleeping in the cold";
const linkLook = `text-primary underline underline-offset-4 hover:decoration-2 rounded-sm ${focusRing}`;

function Title() {
  return (
    <>
      <h4 className="m-0 text-base font-semibold">{EPISODE}</h4>
      <p className="m-0 text-sm text-muted-foreground">38 minutes</p>
    </>
  );
}

/** The Do: three buttons, one of them a disclosure and one that opens a dialog. */
function RealRow() {
  const say = useSceneSay();
  const [open, setOpen] = useState(false);
  const panel = useId();
  return (
    <div className="grid gap-2">
      <Title />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Button variant="link" onClick={() => say(`${EPISODE} marked as played.`)}>
          Mark as played
        </Button>
        <Button variant="link" aria-expanded={open} aria-controls={panel} onClick={() => setOpen(!open)}>
          Show episode notes
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="link">Share episode</Button>
          </DialogTrigger>
          <ShareContent />
        </Dialog>
      </div>
      <p id={panel} hidden={!open} className="m-0 text-sm text-muted-foreground">
        Recorded in January, with a trip to a hut above the tree line.
      </p>
    </div>
  );
}

function ShareContent({ onCloseAutoFocus }: { onCloseAutoFocus?: (e: Event) => void }) {
  return (
    <DialogContent onCloseAutoFocus={onCloseAutoFocus}>
      <DialogHeader>
        <DialogTitle>Share episode</DialogTitle>
        <DialogDescription>Anyone with the link can listen to this episode.</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <p className="m-0 text-sm">podcast.example.com/episodes/42</p>
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

/** The Don't: anchors with href="#" whose click is cancelled by script. */
function FakeRow() {
  const say = useSceneSay();
  const [shareOpen, setShareOpen] = useState(false);
  const shareLink = useRef<HTMLAnchorElement>(null);
  return (
    <div className="grid gap-2">
      <Title />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <a
          href="#"
          className={`inline-flex h-10 items-center px-2 text-sm font-medium ${linkLook}`}
          onClick={(e) => {
            e.preventDefault();
            say(`${EPISODE} marked as played.`);
          }}
        >
          Mark as played
        </a>
        <a
          ref={shareLink}
          href="#"
          className={`inline-flex h-10 items-center px-2 text-sm font-medium ${linkLook}`}
          onClick={(e) => {
            e.preventDefault();
            setShareOpen(true);
          }}
        >
          Share episode
        </a>
      </div>
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        {/* Focus goes back to the anchor, so the only thing wrong here is its role. */}
        <ShareContent
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            shareLink.current?.focus();
          }}
        />
      </Dialog>
    </div>
  );
}

/** The Do: a jump to a part of the same page is a link; printing is a button. */
function JumpRow() {
  const say = useSceneSay();
  const target = useId().replaceAll(":", "");
  return (
    <div className="grid gap-3">
      <Title />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Button variant="link" asChild>
          <a href={`#${target}`}>Jump to transcript</a>
        </Button>
        <Button variant="link" onClick={() => say("The print dialog would open.")}>
          Print transcript
        </Button>
      </div>
      <section
        id={target}
        tabIndex={-1}
        aria-label="Transcript"
        className={`rounded-md border border-border p-3 text-sm text-muted-foreground ${focusRing}`}
      >
        We start at the hut door. The snow is knee deep and the stove is already lit.
      </section>
    </div>
  );
}

/** The Don't: href="#" with its script missing a cancel, drawn with an address line. */
function BrokenRow() {
  const [url, setUrl] = useState("podcast.example.com/episodes/42");
  const say = useSceneSay();
  return (
    <div className="grid gap-2">
      <Title />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <a
          href="#"
          className={`inline-flex h-10 items-center px-2 text-sm font-medium ${linkLook}`}
          onClick={(e) => {
            // The product forgot to cancel the jump. Storybook has to cancel it, so the address and the jump are drawn.
            e.preventDefault();
            setUrl("podcast.example.com/episodes/42#");
            say("The page jumped to the top and the address now ends in #.");
          }}
        >
          Mark as played
        </a>
      </div>
      <p className="m-0 rounded-md border border-dashed border-border px-3 py-1 font-mono text-xs text-muted-foreground" aria-hidden="true">
        Address: {url}
      </p>
    </div>
  );
}

const label = "In the lists of links and buttons:";

export const ACT009b: RuleExamples = {
  id: "ACT-009b",
  examples: [
    {
      kind: "do",
      title: "Acting in place is a button that looks like a link",
      caption: (
        <>
          On the episode row, <em>Mark as played</em>, <em>Show episode notes</em> and <em>Share episode</em> are{" "}
          <code>Button variant=&quot;link&quot;</code>, so they render <code>&lt;button&gt;</code>. They look like text
          links, are announced as buttons, and take Enter and Space. The list shows the state each carries: the notes
          say expanded or collapsed, and the share button says it opens a dialog. Focus goes into the dialog and back to
          the button.
        </>
      ),
      Demo: () => (
        <Scene listLabel={label}>
          <RealRow />
        </Scene>
      ),
    },
    {
      kind: "dont",
      title: "Links to # whose click is cancelled",
      caption: (
        <>
          The same two actions as <code>&lt;a href=&quot;#&quot;&gt;</code> with <code>preventDefault</code>. A screen
          reader says &ldquo;link&rdquo; and promises a new place, and both are in the list of links though they go
          nowhere. Tab and Enter work; press Space and the link does nothing; on a long page it scrolls instead. A middle click
          or Copy link address gives a useless <code>#</code>.
        </>
      ),
      Demo: () => (
        <Scene listLabel={label}>
          <FakeRow />
        </Scene>
      ),
    },
    {
      kind: "do",
      title: "A jump on the same page is a link",
      caption: (
        <>
          <em>Jump to transcript</em> has a real target, <code>href=&quot;#…&quot;</code>, so it is a link and moves
          focus to the transcript inside this scene. <em>Print transcript</em> acts, so it is a button. The list
          holds one of each.
        </>
      ),
      Demo: () => (
        <Scene listLabel={label}>
          <JumpRow />
        </Scene>
      ),
    },
    {
      kind: "dont",
      title: "href=\"#\" when the script does not cancel",
      caption: (
        <>
          Without <code>preventDefault</code> the click follows <code>#</code>: the page jumps to the top and the address
          ends in <code>#</code>. Storybook cancels the jump for real, so the address line draws what would happen.
          Marking an episode as played changes nothing about the address, so it should have been a button.
        </>
      ),
      Demo: () => (
        <Scene listLabel={label}>
          <BrokenRow />
        </Scene>
      ),
    },
  ],
};
