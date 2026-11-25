import { Button } from "@blackwoodblake/justified-shadcn/button";
import { SuccessIcon } from "@blackwoodblake/justified-shadcn/icons";
import { useId, useState } from "react";

import {
  DARKEST,
  Drawn,
  Episodes,
  FADES,
  FadedEpisodes,
  LIGHTEST,
  PhotoDefs,
  Readouts,
  Scope,
  Themes,
  type Fade,
} from "./colour-demo";
import type { RuleExamples } from "./frame";

/*
 * VIS-001: give text at least 4.5:1 contrast against the colour it is drawn on.
 *
 * Two scenes from the rule's own text. A podcast host's Episodes list, where
 * the publish date is secondary text, and a show page where the title sits on
 * the cover photo. Each Do is real text and passes; each Don't is a drawing
 * (SVG, hidden from assistive technology), so no real low-contrast text is on
 * the page. The figures are measured in the browser from what is painted.
 */

const LISTING = [{ target: "date", label: "Publish date on the page", need: 4.5 }];

function EpisodesDo() {
  return (
    <Themes>
      {() => (
        <>
          <Episodes />
          <Readouts rows={LISTING} />
        </>
      )}
    </Themes>
  );
}

function EpisodesFaded() {
  const [fade, setFade] = useState<Fade>("opacity");
  return (
    <div className="grid w-full gap-3">
      <div role="group" aria-label="How the date is faded" className="flex flex-wrap gap-2">
        {(Object.keys(FADES) as Fade[]).map((k) => (
          <Button
            key={k}
            size="sm"
            variant="outline"
            aria-pressed={fade === k}
            onClick={() => setFade(k)}
            className="font-mono text-xs"
          >
            {fade === k && <SuccessIcon />}
            {FADES[k].label}
          </Button>
        ))}
      </div>
      <Themes>
        {() => (
          <>
            <FadedEpisodes fade={fade} />
            <Readouts rows={[{ target: "date", label: "Publish date on the page", need: 4.5 }]} tick={fade} live />
          </>
        )}
      </Themes>
    </div>
  );
}

function Cover({ scrim }: { scrim: boolean }) {
  const id = useId();
  return (
    <Scope>
      <div data-contrast-stop className="relative overflow-hidden rounded-lg">
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 300 150"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
        >
          <PhotoDefs id={id} />
          <rect width="300" height="150" fill={`url(#${id})`} />
        </svg>
        <div className={`relative mt-16 p-4 ${scrim ? "bg-black/60" : ""}`}>
          <h4 data-measure="title" className="m-0 text-lg font-semibold text-white">
            Marrowfield Hours
          </h4>
          <p className="m-0 text-sm text-white">Stories from people who work at night</p>
        </div>
      </div>
      <Readouts
        rows={[{ target: "title", label: "Title against the lightest spot of the photo under the scrim", need: 4.5, under: LIGHTEST }]}
      />
    </Scope>
  );
}

function CoverDrawn() {
  const id = useId();
  return (
    <Scope>
      <Drawn>
        <div data-contrast-stop className="overflow-hidden rounded-lg">
          <svg viewBox="0 0 300 150" className="block h-auto w-full" role="presentation" focusable="false">
            <PhotoDefs id={id} />
            <rect width="300" height="150" fill={`url(#${id})`} />
            <text data-measure="title" x="16" y="104" fontSize="20" fontWeight="600" fill="#ffffff">
              Marrowfield Hours
            </text>
            <text x="16" y="126" fontSize="14" fill="#ffffff">
              Stories from people who work while the city sleeps
            </text>
          </svg>
        </div>
      </Drawn>
      <Readouts
        rows={[
          {
            id: "dark",
            target: "title",
            label: "White title against the darkest part of the photo",
            need: 4.5,
            under: DARKEST,
          },
          {
            id: "light",
            target: "title",
            label: "White title against the lightest part, behind the letters",
            need: 4.5,
            under: LIGHTEST,
          },
        ]}
      />
    </Scope>
  );
}

export const VIS001: RuleExamples = {
  id: "VIS-001",
  examples: [
    {
      kind: "do",
      title: "Secondary text keeps its colour",
      caption: (
        <>
          The publish dates use <code>text-muted-foreground</code> as it is, in the light and in the dark theme. The
          figures under each scene are measured in your browser from what is painted. To make a date weigh less, make it
          smaller, not fainter.
        </>
      ),
      Demo: EpisodesDo,
    },
    {
      kind: "dont",
      title: "Fading the date with opacity",
      caption: (
        <>
          A drawing of the same list. Choose how the date is faded and read the figure under each theme: every choice
          fails on the light page, and the dark theme does not always save it (here some choices pass there), which is
          why the rule measures both. The drawing is not real text, so the page itself stays readable.
        </>
      ),
      Demo: EpisodesFaded,
    },
    {
      kind: "do",
      title: "A scrim under a title on a photo",
      caption: (
        <>
          The title sits on a <code>bg-black/60</code> scrim. The figure is measured against the lightest spot of the
          photo behind the letters, not the average, and it still passes.
        </>
      ),
      Demo: () => (
        <div className="w-full max-w-sm">
          <Cover scrim />
        </div>
      ),
    },
    {
      kind: "dont",
      title: "White title, no scrim, one spot checked",
      caption: (
        <>
          A drawing of the same cover with no scrim. Checked against the darkest part alone it looks fine; the lightest
          spot behind the letters is where it fails.
        </>
      ),
      Demo: () => (
        <div className="w-full max-w-sm">
          <CoverDrawn />
        </div>
      ),
    },
  ],
};
