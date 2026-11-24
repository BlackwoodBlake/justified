#!/usr/bin/env node
/**
 * contrast.ts: checks every colour pair in tokens.css against WCAG 2.2,
 * in both the light and the dark theme. The pairs and the maths live in
 * src/contrast.ts, which Storybook's Foundations pages use as well.
 *
 * Exit code: 0 = all pairs pass, 1 = a pair fails, 2 = setup error.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { measure, parseThemes } from "../src/contrast.ts";

let results;
try {
  const css = readFileSync(fileURLToPath(new URL("../tokens.css", import.meta.url)), "utf8");
  results = measure(parseThemes(css));
} catch (error) {
  console.error(`contrast: ${(error as Error).message}`);
  process.exit(2);
}

for (const r of results) {
  console.log(
    `${r.pass ? "pass" : "FAIL"}  ${r.theme.padEnd(5)}  ${r.ratio.toFixed(2).padStart(5)}:1  (needs ${r.min}:1)  --${r.fg} on --${r.bg}, ${r.use}`,
  );
}

const failures = results.filter((r) => !r.pass).length;
if (failures > 0) {
  console.log(`\ncontrast: ${failures} pair(s) below the WCAG 2.2 minimum.`);
  process.exit(1);
}
console.log(`\ncontrast: all ${results.length} pairs meet the WCAG 2.2 minimum.`);
