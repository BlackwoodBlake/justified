import rule from "../../rules/zoom-not-blocked.js";
import { run } from "../helpers.js";

run("zoom-not-blocked", rule, {
  valid: [
    `import type { Viewport } from "next";
export const viewport: Viewport = { width: "device-width", initialScale: 1 };`,
    `export const viewport = { width: "device-width", initialScale: 1, maximumScale: 5 };`,
    `export const viewport = { themeColor: "black", maximumScale: 2 };`,
    `export function generateViewport() { return { width: "device-width", initialScale: 1 }; }`,
    `export default function Head() {
  return <meta name="viewport" content="width=device-width, initial-scale=1" />;
}`,
    `export const H = () => <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />;`,
    // Not a viewport setting.
    `const options = { maximumScale: 1, userScalable: false, zoom: true };`,
    `const chart = { scale: { maximum: 1 } };`,
    `export const C = () => <p>Set maximum-scale=1 to see the problem.</p>;`,
    // Drawn as a line of code, not set.
    `export const L = () => <code>{'export const viewport = { maximumScale: 1, userScalable: false };'}</code>;`,
    // Computed values are left alone.
    `export const viewport = { width: "device-width", initialScale: 1, maximumScale: MAX };`,
    // A card that grows with its text: the Do.
    `<li className="flex min-h-32 flex-col gap-1 rounded-lg border p-3"><h4>Plot 14</h4><p className="m-0">South-facing, raised bed.</p></li>`,
    // Text cut on purpose with an ellipsis, or that does not wrap.
    `<div className="h-24 overflow-hidden"><p className="line-clamp-3">{plot.text}</p></div>`,
    `<div className="h-10 overflow-hidden"><p className="truncate">{plot.name}</p></div>`,
    `<div className="h-10 overflow-hidden whitespace-nowrap"><p>South-facing, raised bed.</p></div>`,
    // A one-line label or a heading in a bar, not a paragraph.
    `<header className="flex h-16 items-center overflow-hidden"><h1>Plot booking</h1><span>Signed in</span></header>`,
    `<div className="h-8 overflow-hidden"><span>Plot 14</span></div>`,
    // A box that scrolls, holds a picture, or fades the cut.
    `<div className="h-48 overflow-hidden overflow-y-auto"><p>{longText}</p></div>`,
    `<div className="h-48 overflow-hidden"><ScrollArea><p>{longText}</p></ScrollArea></div>`,
    `<div className="h-48 overflow-hidden rounded"><img src="/plot.jpg" alt="Plot 14" /><p>South-facing, raised bed.</p></div>`,
    `<div className="relative max-h-32 overflow-hidden"><p>{longText}</p><div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-card" /></div>`,
    // A fixed height with no clip, a collapsed panel, a height in a branch, and classes not stated in full.
    `<section className="h-[420px] p-4"><p>Book a plot for the spring season.</p></section>`,
    `<div className="h-0 overflow-hidden"><p>Hidden details here.</p></div>`,
    `<div className={open ? "h-auto" : "h-24 overflow-hidden"}><p>{details}</p></div>`,
    `<div className={cn("h-24 overflow-hidden", className)}><p>{details}</p></div>`,
    `<div className={\`h-24 overflow-hidden \${look}\`}><p>{details}</p></div>`,
    `<div className="h-24 overflow-hidden" {...props}><p>{details}</p></div>`,
    // A height that only applies at some size or state.
    `<div className="md:h-24 overflow-hidden"><p>{details}</p></div>`,
    // A frame round a layout, whose paragraphs sit deeper: a drawn phone screen, a page with a sliding panel.
    `<div className="relative flex h-80 w-60 flex-col overflow-hidden rounded-2xl border"><div className="border-b p-2">Write a review</div><div className="flex-1 p-3"><p>Quiet room, friendly staff.</p></div></div>`,
    `<p className="h-12 overflow-hidden truncate">{plot.text}</p>`,
    // A paragraph with one word, which cannot wrap.
    `<div className="h-10 overflow-hidden"><p>Booked</p></div>`,
    // Since the review of 0.1.1: panels that expand, frames round a layout, and components the rule cannot read.
    // A collapsed panel whose height is set only in a branch
    `
    export const A = ({ open }) => (<div className={open ? "" : "h-24 overflow-hidden"}><p>Long text goes here and wraps.</p></div>)`,
    // A panel that expands: data-[state=open]:max-h-none
    `
    export const A = () => (<div data-state="closed" className="max-h-24 overflow-hidden data-[state=open]:max-h-none"><p>Long text goes here and wraps.</p></div>)`,
    // A collapsed panel with h-0
    `
    export const A = () => (<div className="h-0 overflow-hidden"><p>Hidden text here</p></div>)`,
    // A visually hidden live region with h-px
    `
    export const A = () => (<div className="absolute h-px w-px overflow-hidden"><p>Saved to drafts</p></div>)`,
    // An app shell with h-screen
    `
    export const A = () => (<div className="flex h-screen overflow-hidden"><main><p>Welcome back to the app</p></main></div>)`,
    // A frame that holds a component the rule cannot read
    `
    export const A = () => (<div className="h-[600px] overflow-hidden"><Sidebar /><p>Some footer text here</p></div>)`,
    // A hidden box with h-[0px]
    `
    export const A = () => (<div className="h-[0px] overflow-hidden"><p>Hidden text</p></div>)`,
    // A box whose other child, a component, may scroll
    `
    export const A = () => (<div className="h-[400px] overflow-hidden"><p>Terms of service intro text</p><TermsList /></div>)`,
    // A chat panel: flex-col with a component list beside the paragraph
    `
    export function Chat() {
      return (
        <div className="flex h-[600px] flex-col overflow-hidden rounded-xl border">
          <p className="border-b p-3 text-sm text-muted-foreground">Messages are kept for 30 days.</p>
          <MessageList className="flex-1" />
          <Composer />
        </div>)
    }`,
    // A chat panel with a scrolling div beside the paragraph
    `
    export function Chat() {
      return (
        <div className="flex h-[600px] flex-col overflow-hidden rounded-xl border">
          <p className="border-b p-3 text-sm">Messages are kept for 30 days.</p>
          <div className="flex-1 overflow-y-auto"><Messages /></div>
        </div>)
    }`,
    // A panel that expands: aria-expanded:max-h-none
    `
    export function More({ open }) {
      return (
        <div aria-expanded={open} className="max-h-24 overflow-hidden aria-expanded:max-h-none">
          <p>A long description that wraps onto many lines of text.</p>
        </div>)
    }`,
    // A flex-col frame with a plain div beside the paragraph, which takes the rest of the height.
    `<div className="flex h-[600px] flex-col overflow-hidden"><p className="border-b p-3">Messages are kept for 30 days.</p><div className="flex-1">{list}</div></div>`,
    // Any other height under a variant, or overflow-auto under one.
    `<div className="h-24 overflow-hidden md:h-auto"><p>{details}</p></div>`,
    `<div className="h-24 overflow-hidden hover:overflow-auto"><p>{details}</p></div>`,
  ],
  invalid: [
    {
      // The card text in a box with h-32 and overflow-hidden
      code: `
      export const A = () => (<div className="h-32 overflow-hidden rounded border p-4"><p>South-facing, raised bed, water tap within ten metres.</p></div>)`,
      errors: [{ messageId: "clipsText" }],
    },
    {
      // A heading beside the paragraph in a flex-col card does not make it a frame round a layout.
      code: `<li className="flex h-[7.5em] flex-col overflow-hidden"><h4>{c.name}</h4><p className="m-0">{c.text}</p></li>`,
      errors: [{ messageId: "clipsText" }],
    },
    {
      // A variant that only changes the colour does not let the box grow.
      code: `<div className="h-32 overflow-hidden hover:bg-muted"><p>{plot.text}</p></div>`,
      errors: [{ messageId: "clipsText" }],
    },
    {
      // The Don't, written out: the card text in h-32 overflow-hidden.
      code: `<div className="h-32 overflow-hidden rounded-lg border p-3"><h4>Plot 14</h4><p>South-facing, raised bed, water tap within ten metres. Tools are kept in the shed by the gate.</p></div>`,
      errors: [{ messageId: "clipsText", data: { height: "h-32" } }],
    },
    {
      code: `export function Plots({ cards }) {
  return <ul>{cards.map((c) => <li key={c.name} className="flex h-[7.5em] flex-col overflow-hidden"><h4>{c.name}</h4><p className="m-0 text-muted-foreground">{c.text}</p></li>)}</ul>;
}`,
      errors: [{ messageId: "clipsText", data: { height: "h-[7.5em]" } }],
    },
    {
      code: `<Card className="max-h-40 overflow-clip"><p>{plot.description}</p></Card>`,
      errors: [{ messageId: "clipsText", data: { height: "max-h-40" } }],
    },
    {
      code: `<p className="h-12 overflow-hidden text-sm">{plot.text}</p>`,
      errors: [{ messageId: "clipsText", data: { height: "h-12" } }],
    },
    {
      code: `<div className={cn("h-[120px] overflow-y-hidden", "rounded-md")}><p>{toast.body}</p></div>`,
      errors: [{ messageId: "clipsText" }],
    },
    {
      code: `import type { Viewport } from "next";
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false };`,
      errors: [{ messageId: "lowMaximum" }, { messageId: "noScaling" }],
    },
    { code: `export const viewport = { maximumScale: 1 };`, errors: [{ messageId: "lowMaximum" }] },
    { code: `export const viewport = { userScalable: false } satisfies Viewport;`, errors: [{ messageId: "noScaling" }] },
    {
      code: `export const metadata = { title: "Garden", viewport: { width: "device-width", maximumScale: 1.5 } };`,
      errors: [{ messageId: "lowMaximum" }],
    },
    {
      code: `export const generateViewport = () => ({ userScalable: false });`,
      errors: [{ messageId: "noScaling" }],
    },
    {
      code: `export const metadata = { viewport: "width=device-width, initial-scale=1, maximum-scale=1" };`,
      errors: [{ messageId: "lowMaximum" }],
    },
    {
      code: `export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" /></head>
      <body>{children}</body>
    </html>
  );
}`,
      errors: [{ messageId: "lowMaximum" }, { messageId: "noScaling" }],
    },
    { code: `export const H = () => <meta name="viewport" content={"user-scalable=0"} />;`, errors: [{ messageId: "noScaling" }] },
    {
      code: `document.querySelector('meta[name="viewport"]')?.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1");`,
      errors: [{ messageId: "lowMaximum" }],
    },
  ],
});
