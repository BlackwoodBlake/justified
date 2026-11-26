---
id: LAY-003a
title: Let text grow to 200 percent without losing content or function
short: Resize text to 200%
area: layout
status: proposed
version: "1.0.0"
verdict: requirement
judges: { spoken: 2, agreeing: 2 }
law:
  - criterion: "1.4.4"
    name: Resize Text
    url: https://www.w3.org/TR/WCAG22/#resize-text
    relation: requires
  - criterion: "1.4.10"
    name: Reflow
    url: https://www.w3.org/TR/WCAG22/#reflow
    relation: supports
stances:
  material: { stance: supports, sources: [material-text-resizing, material-text-truncation] }
  apple:    { stance: supports, sources: [apple-accessibility, apple-typography, apple-layout] }
  carbon:   { stance: silent }
  govuk:    { stance: supports, sources: [govuk-type-scale] }
  nngroup:  { stance: supports, sources: [nngroup-let-users-control-font-size] }
conflicts_checked: 2026-11-26
check: runtime
how_to_check:
  - 'A viewport meta tag or a Next.js `viewport` export with `user-scalable=no`, `user-scalable=0`, `userScalable: false`, or `maximum-scale` / `maximumScale` below 2.'
  - 'Text sized only in viewport or container units, such as `text-[4vw]`, `text-[3vh]`, `vmin`, `vmax`, `dvw`, `svh`, `lvh`, `cqw` or `cqi`. A `clamp()` that mixes `rem` with `vw` is not a hit by itself: zoom to 200 percent and see whether the text has doubled.'
  - 'Zoom a window about 1280 pixels wide to 200 percent, and to the steps between, and look over every view, open menus, dialogs, popovers and toasts included, for text that is cut off, overlaps other content or no longer works.'
  - 'A fixed `h-*` or `max-h-*` on a box of text that can wrap onto more lines, with or without `overflow-hidden`, so grown text is cut or spills. Leave alone one-line controls such as `Button` or `Input`, image crops, avatars, carousels and scroll areas.'
changelog:
  - version: "1.0.0"
    date: 2026-11-26
    note: First version.
---

## Rule

Text, also in controls and labels, can be enlarged to 200 percent without losing content or function: nothing is cut off, laid over other content or stops working. Do not switch off zoom or cap it below 200 percent in the viewport setting, and size no text in viewport units alone.

## Why

Many people with low vision read the web at a larger size, and on the web the usual way to get there is the browser's own zoom, on a phone by pinching. The page rarely has to do anything special for this. It has to stay out of the way: let the browser zoom, let text sizes follow the zoom, and let every box that holds text grow with it. [WCAG 2.2, 1.4.4 Resize Text](https://www.w3.org/TR/WCAG22/#resize-text) requires that text can be resized to 200 percent without assistive technology and without loss of content or function. The page meets it when at least one way of enlarging works, and each step between 100 and 200 percent must work too. The Working Group documents the breaks this rule names: zoom switched off in the viewport setting, text sized in viewport units, and text that is clipped or overlaps once it grows. The W3C test fails a viewport setting that blocks or caps zoom whatever the browser, even though desktop browsers and most current phone browsers ignore it or let people override it. Treat it as a break, never as an old-phone detail. Browser zoom enlarges fixed heights too, but the zoomed layout is narrower, so wrapping text takes more lines and a box of fixed height clips it or lets it spill. The boxes that break are those holding text that can wrap, not one-line controls. Above 200 percent, the page must still reflow at 320 CSS pixels, which is LAY-001. What happens when people widen the spacing of text, rather than its size, is LAY-003b.

## Do

- In a Next.js app, write the viewport export as `export const viewport = { width: "device-width", initialScale: 1 }` and leave `maximumScale` and `userScalable` out. A `maximumScale` of 5 is fine too.
- Stop iOS Safari from zooming in when a field gets focus by giving the field text of at least 16 px, never by blocking zoom. Justified's `Input` already uses `text-base` for this.
- Size text in `rem` or with Tailwind's text classes. A fluid heading such as `text-[clamp(1.75rem,1.25rem+2vw,3rem)]` can work, because its rem part grows with zoom. Check it at 200 percent rather than assuming it does.
- In a community garden's booking app, the cards *Plot 14*, *Plot 15* and *Herb bed* let their description set their height: `min-h-24` instead of `h-24`, padding instead of a fixed height, and grid rows that size to their content. At 200 percent the cards get taller and every line is still there.
- Give a sticky header vertical padding, such as `py-3`, instead of `h-14`, so the page title *Book a plot for the spring season* can wrap onto a second line without running under the content.
- Let a hero banner with text over a photo grow with its text: `min-h-[420px]` with padding, not `h-[420px]`.
- Keep toasts, popovers and tooltips free of a fixed height, so an enlarged message wraps instead of being cut.
- Test with the browser's own zoom in a window about 1280 pixels wide, at 200 percent and at the steps between, such as 125, 150 and 175. Open the menus, dialogs, popovers and toasts as well, since a closed menu hides its own breaks.
- `overflow-hidden` is fine where nothing but an image or a scroll area is clipped, such as a rounded photo crop, an avatar, a carousel track or a list in `ScrollArea`.
- Sizes in px are not a break on their own: browser zoom enlarges them. We still prefer `rem`, so the browser's text-size setting works as well. That is our own choice.

## Don't

- Write `maximumScale: 1, userScalable: false` in the viewport export, or `user-scalable=no` in a hand-written meta tag in `app/layout.tsx` or `index.html`, to stop the zoom on focus. `maximum-scale=1` on its own blocks zoom too.
- Size the garden's welcome heading as `text-[5vw]`. Zooming does not change it, so it never reaches twice its size.
- Put `h-32 overflow-hidden` on the card text "South-facing, raised bed, water tap within ten metres. Tools are kept in the shed by the gate." At 200 percent the last lines vanish with no way to read them.
- Give the hero banner `h-[420px]` with its heading and *Book a plot* button inside it, so that at 200 percent the button spills out over the section below.
- Give a toast body a fixed height, so the end of "Your booking for Plot 14 is confirmed for 12 April" is cut off.

## Exceptions

- **Captions and images of text.** Captions and text that is part of an image are outside this rule. When text may be an image at all is a separate criterion, not covered here.
- **Text the browser draws.** Only what the browser or the system draws is exempt, such as the browser's built-in validation bubble or an `alert()` or `confirm()` dialog. The page's own controls still have to grow, including the button of an `<input type="file">` and any tooltip the page builds.
- **Truncation with a way to the whole.** Let text wrap or its box grow first. Where that cannot be done, an ellipsis is acceptable when it is clear that more can be seen and the full text is one step away, such as a plot name in a card that is visibly a link to the plot's page. A tooltip may be that way only when the visible part still tells the item apart from the others and is enough to use it, and it opens on focus too; what the person needs stays on the page (TXT-002b). Where the ellipsis leads nowhere, the text is lost. LAY-001 covers the same case at 320 pixels.
- **No exception for small labels.** Tabs, app bars and navigation labels grow with the rest of the page. Browser zoom enlarges them, and the criterion makes no exception for them.
- **Neighbouring rules.** Reflow at 400 percent is LAY-001, text spacing is LAY-003b, contrast is VIS-001, and target size is ACT-006.
