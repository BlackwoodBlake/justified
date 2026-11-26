import { useId, useState } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";
import { stopPlainClick } from "./links-buttons";
import {
  COLOUR_TRANSITION,
  DownloadGlyph,
  FileGlyph,
  FOCUS,
  HOVER_STILL,
  IconButton,
  LIVE_PRESS,
  PRESSED_STILL,
  RenameGlyph,
  ShareGlyph,
  Strip,
  TrackLook,
  type Look,
} from "./states";

/*
 * VIS-008: everything that does something when pressed changes its look while
 * it is pressed and, where a pointer can hover, while it is over it. A
 * control that is off shows neither change.
 *
 * Two scenes from the rule's own text. A project card with a link stretched
 * over it, and a file card with the icon buttons Download, Share and Rename
 * (Rename is off, because someone else is editing the file).
 *
 * A hover and a press cannot be seen in a still, so each example shows the
 * control in labelled stills (At rest, Hover, Pressed) drawn with the same
 * classes, and the live control can be tried with a mouse, the keyboard
 * (Space or Enter) or a touch. "Right now" writes what the pointer or the
 * keyboard is doing to the control. On a touch screen it shows a press and
 * never a hover.
 */

const ITEM = { title: "Atlas redesign", meta: "12 tasks · due 4 Dec" };
const HREF = "/projects/atlas";

function ProjectCard({ force, onOpen }: { force?: Look; onOpen?: () => void }) {
  const still = force === "hover" ? HOVER_STILL : force === "pressed" ? PRESSED_STILL : "";
  const look = force ? still || "bg-card" : `bg-card ${LIVE_PRESS}`;
  return (
    <div
      data-look-name="Project card"
      className={`relative flex w-full flex-col gap-1 rounded-lg border border-border p-4 text-card-foreground ${COLOUR_TRANSITION} ${look}`}
    >
      <h4 className="m-0 text-base font-semibold">
        {/* A real address. A plain click is stopped so the example stays put, and the line below says where it would go. */}
        <a
          href={HREF}
          onClick={(e) => {
            if (stopPlainClick(e)) onOpen?.();
          }}
          className="rounded-sm after:absolute after:inset-0 after:rounded-lg focus-visible:outline-hidden focus-visible:after:ring-(length:--focus-ring-width) focus-visible:after:ring-ring"
        >
          {ITEM.title}
        </a>
      </h4>
      <p className="m-0 text-sm text-muted-foreground">{ITEM.meta}</p>
    </div>
  );
}

function PointerOnlyCard({ onOpen }: { onOpen?: () => void }) {
  return (
    <div
      data-look-name="Project card"
      className="relative flex w-full flex-col gap-1 rounded-lg border border-border p-4 text-card-foreground transition-colors duration-(--motion-duration-fast) ease-standard bg-card cursor-pointer"
    >
      <h4 className="m-0 text-base font-semibold">
        {/* A real address. A plain click is stopped so the example stays put, and the line below says where it would go. */}
        <a
          href={HREF}
          onClick={(e) => {
            if (stopPlainClick(e)) onOpen?.();
          }}
          className="rounded-sm after:absolute after:inset-0 after:rounded-lg focus-visible:outline-hidden focus-visible:after:ring-(length:--focus-ring-width) focus-visible:after:ring-ring"
        >
          {ITEM.title}
        </a>
      </h4>
      <p className="m-0 text-sm text-muted-foreground">{ITEM.meta}</p>
    </div>
  );
}

function CardScene() {
  const [said, setSaid] = useState("");
  const cell = (label: string, force: Look) => ({
    label,
    node: <ProjectCard force={force} />,
  });
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Strip cols={3} cells={[cell("At rest", "rest"), cell("Hover", "hover"), cell("Pressed", "pressed")]} />
      <TrackLook>
        <ProjectCard onOpen={() => setSaid(`Would go to ${HREF}`)} />
      </TrackLook>
      <Outcome>{said}</Outcome>
    </div>
  );
}

function CardSceneDont() {
  const [said, setSaid] = useState("");
  const cell = (label: string) => ({
    label,
    node: <PointerOnlyCard />,
  });
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Strip cols={3} cells={[cell("At rest"), cell("Hover"), cell("Pressed")]} />
      <TrackLook>
        <PointerOnlyCard onOpen={() => setSaid(`Would go to ${HREF}`)} />
      </TrackLook>
      <Outcome>{said}</Outcome>
    </div>
  );
}

function FileScene() {
  const [said, setSaid] = useState("");
  const lockedId = useId();
  const tools = (force?: Look) => (
    <>
      <IconButton name="Download" mode="do" icon={<DownloadGlyph />} force={force} onPress={() => setSaid("Download started: Q3 budget.xlsx")} />
      <IconButton name="Share" mode="do" icon={<ShareGlyph />} force={force} onPress={() => setSaid("Share link copied")} />
      <IconButton name="Rename" mode="do" icon={<RenameGlyph />} off scoped force={force} describedBy={force ? undefined : lockedId} />
    </>
  );
  const download = (label: string, force: Look) => ({
    label,
    node: <IconButton name="Download" mode="do" icon={<DownloadGlyph />} force={force} />,
  });
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Strip
        cells={[
          download("Download at rest", "rest"),
          download("Download hover", "hover"),
          download("Download pressed", "pressed"),
          {
            label: "Rename (off) hover",
            node: <IconButton name="Rename" mode="do" icon={<RenameGlyph />} off scoped force="hover" />,
          },
        ]}
      />
      <TrackLook>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-card-foreground">
          <FileGlyph />
          <div className="min-w-0 flex-1">
            <h4 className="m-0 truncate text-base font-semibold">Q3 budget.xlsx</h4>
            <p className="m-0 text-sm text-muted-foreground">Edited yesterday</p>
          </div>
          <div role="group" aria-label="File actions" className="flex gap-1">
            {tools()}
          </div>
        </div>
      </TrackLook>
      <p id={lockedId} className="m-0 text-sm text-muted-foreground">
        Rename is off while Ana Ruiz is editing this file.
      </p>
      <Outcome>{said}</Outcome>
    </div>
  );
}

const ICON_BUTTON = `inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground ${COLOUR_TRANSITION} ${FOCUS}`;

function FileSceneDont() {
  const [said, setSaid] = useState("");
  const lockedId = useId();
  const stillDownload = (label: string) => ({
    label,
    node: (
      <button type="button" data-look-name="Download" aria-label="Download" className={ICON_BUTTON}>
        <DownloadGlyph />
      </button>
    ),
  });
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Strip
        cells={[
          stillDownload("Download at rest"),
          stillDownload("Download hover"),
          stillDownload("Download pressed"),
          {
            label: "Rename (off) hover",
            node: (
              <button
                type="button"
                data-look-name="Rename"
                aria-label="Rename"
                aria-disabled="true"
                className={`${ICON_BUTTON} bg-accent text-accent-foreground cursor-not-allowed text-muted-foreground`}
              >
                <RenameGlyph />
              </button>
            ),
          },
        ]}
      />
      <TrackLook>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-card-foreground">
          <FileGlyph />
          <div className="min-w-0 flex-1">
            <h4 className="m-0 truncate text-base font-semibold">Q3 budget.xlsx</h4>
            <p className="m-0 text-sm text-muted-foreground">Edited yesterday</p>
          </div>
          <div role="group" aria-label="File actions" className="flex gap-1">
            <button type="button" data-look-name="Download" aria-label="Download" onClick={() => setSaid("Download started: Q3 budget.xlsx")} className={ICON_BUTTON}>
              <DownloadGlyph />
            </button>
            <button type="button" data-look-name="Share" aria-label="Share" onClick={() => setSaid("Share link copied")} className={ICON_BUTTON}>
              <ShareGlyph />
            </button>
            <button
              type="button"
              data-look-name="Rename"
              aria-label="Rename"
              aria-disabled="true"
              aria-describedby={lockedId}
              className="hover:bg-accent hover:text-accent-foreground active:bg-accent active:text-accent-foreground active:shadow-[inset_0_2px_4px_color-mix(in_oklab,var(--foreground)_25%,transparent)] inline-flex size-10 shrink-0 cursor-pointer cursor-not-allowed items-center justify-center rounded-md text-foreground text-muted-foreground transition-colors duration-(--motion-duration-fast) ease-standard outline-none focus-visible:outline-hidden focus-visible:ring-(length:--focus-ring-width) focus-visible:ring-ring focus-visible:ring-offset-[length:var(--focus-ring-offset)] focus-visible:ring-offset-background"
            >
              <RenameGlyph />
            </button>
          </div>
        </div>
      </TrackLook>
      <p id={lockedId} className="m-0 text-sm text-muted-foreground">
        Rename is off while Ana Ruiz is editing this file.
      </p>
      <Outcome>{said}</Outcome>
    </div>
  );
}

export const VIS008: RuleExamples = {
  id: "VIS-008",
  examples: [
    {
      kind: "do",
      title: "A card that answers the pointer and the press",
      caption: (
        <>
          The card keeps its border at rest, takes <code>hover:bg-accent</code> under the pointer and an inner shadow
          while pressed, with <code>active:</code> so a touch shows it too. The stills show the three looks. Try it with
          a mouse, with Tab then Enter (it opens the card; for the keyboard the signal is the focus ring), and with a finger: "Right now" shows a press on touch and no hover.
        </>
      ),
      Demo: CardScene,
    },
    {
      kind: "dont",
      title: "A card with only a pointing cursor",
      caption: (
        <>
          The same card with only <code>cursor-pointer</code>. The cursor is not a change of the card, and a touch
          screen has no cursor. The three stills are identical, and "Right now" says the pointer is on a card that
          looks the same.
        </>
      ),
      Demo: CardSceneDont,
    },
    {
      kind: "do",
      title: "Icon buttons that change, and one that stays still",
      caption: (
        <>
          <em>Download</em> and <em>Share</em> each get a hover fill and a pressed look. <em>Rename</em> is off, set
          with <code>aria-disabled="true"</code>, and its hover and press are scoped with{" "}
          <code>not-aria-disabled:</code>, so it stays as it is. The line under the card says why it is off, and the
          button points to it.
        </>
      ),
      Demo: FileScene,
    },
    {
      kind: "dont",
      title: "Icon buttons with no change, and an off one that lights up",
      caption: (
        <>
          <em>Download</em> and <em>Share</em> are stripped of their hover and have no pressed look, so nothing on the
          screen shows a press. <em>Rename</em> is off with <code>aria-disabled="true"</code> but keeps unscoped{" "}
          <code>hover:</code> and <code>active:</code> classes, so it lights up and presses in like a button that
          works.
        </>
      ),
      Demo: FileSceneDont,
    },
  ],
};

