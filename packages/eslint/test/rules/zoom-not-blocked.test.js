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
  ],
  invalid: [
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
