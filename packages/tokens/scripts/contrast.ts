#!/usr/bin/env node
/**
 * contrast.ts: checks every colour pair in tokens.css against WCAG 2.2,
 * in both the light and the dark theme. The pairs and the maths live in
 * src/contrast.ts, which Storybook's Foundations pages use as well.
 * It also fails when a colour token is in no pair and not listed in
 * UNMEASURED, so a new colour cannot pass unmeasured.
 *
 * Usage: tsx scripts/contrast.ts [path/to/tokens.css]
 *
 * Exit code: 0 = all pairs pass, 1 = a pair fails, 2 = setup error.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { coverage, measure, parseThemes } from "../src/contrast.ts";

let results;
let covered;
try {
  const css = readFileSync(process.argv[2] ?? fileURLToPath(new URL("../tokens.css", import.meta.url)), "utf8");
  const themes = parseThemes(css);
  results = measure(themes);
  covered = coverage(themes);
} catch (error) {
  console.error(`contrast: ${(error as Error).message}`);
  process.exit(2);
}

// A colour token in no pair would pass without being measured.
if (covered.unmeasured.length || covered.stale.length) {
  for (const t of covered.unmeasured) console.log(`FAIL  --${t} is a colour in no pair: add its pairs to PAIRS, or say why in UNMEASURED (src/contrast.ts)`);
  for (const t of covered.stale) console.log(`FAIL  --${t} is in UNMEASURED but is not an unmeasured colour token: remove it there`);
  process.exit(1);
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
console.log(`\ncontrast: all ${results.length} pairs meet the WCAG 2.2 minimum, and every colour token is in a pair or in UNMEASURED.`);
