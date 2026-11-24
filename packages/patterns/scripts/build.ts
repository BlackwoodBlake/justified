#!/usr/bin/env node
/**
 * build.ts: turns the rule files in rules/ into dist/rules.json, which the
 * website and the agent adapter read.
 *
 * Each entry holds the rule's frontmatter, its level (rule or guideline,
 * worked out from the verdict), the sources it cites (from
 * sources/sources.yaml) and the Markdown body. Run `npm run check` first;
 * this script assumes the rules are valid and only stops on unreadable
 * files.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

import { deriveLevel } from "../../../scripts/level.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const rulesDir = join(root, "rules");
const registry = join(root, "sources", "sources.yaml");
const outDir = fileURLToPath(new URL("../dist/", import.meta.url));

function listMarkdown(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .flatMap((entry) => {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) return listMarkdown(path);
      return extname(path) === ".md" ? [path] : [];
    })
    .sort();
}

/** YAML dates become Date objects; keep them as ISO strings in JSON. */
function plain(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value, (_k, v) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/.test(v) ? v.slice(0, 10) : v)));
}

const sources = new Map<string, Record<string, unknown>>();
for (const s of (parse(readFileSync(registry, "utf8")) ?? []) as Record<string, unknown>[]) {
  sources.set(String(s.id), s);
}

const rules = listMarkdown(rulesDir).map((file) => {
  const text = readFileSync(file, "utf8");
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: frontmatter is missing`);
  const meta = parse(m[1]) as Record<string, unknown>;
  const stances = (meta.stances ?? {}) as Record<string, { sources?: string[] }>;
  const cited = [...new Set(Object.values(stances).flatMap((s) => s.sources ?? []))];
  return plain({ ...meta, level: deriveLevel(String(meta.verdict)), sources: cited.map((id) => sources.get(id)).filter(Boolean), body: m[2].trim() });
});

rules.sort((a, b) => String((a as { id: string }).id).localeCompare(String((b as { id: string }).id)));
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "rules.json"), JSON.stringify(rules, null, 2) + "\n");
console.log(`patterns: wrote ${rules.length} rule(s) to dist/rules.json`);
