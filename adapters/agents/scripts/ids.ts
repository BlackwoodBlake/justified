/**
 * ids.ts: the rule data and the schema for a project's justified.json.
 *
 * `buildIds` and `buildSchema` are pure, so the build writes the files and
 * the tests recompute them from the rule files. Both outputs are written to
 * packages/eslint and adapters/agents/dist, and nothing here depends on the
 * website.
 */

export type IdRule = {
  id: string;
  title: string;
  short: string;
  status: string;
  version: string;
  verdict: string;
  judges: { spoken: number; agreeing: number };
  law?: { criterion: string; name: string; relation: string }[];
};

export type IdEntry = {
  id: string;
  short: string;
  title: string;
  level: "rule" | "guideline";
  /** As the site shows it, such as "Requirement" or "Unanimous (2 of 2)". */
  verdict: string;
  version: string;
  status: string;
  /** Only for a Requirement: the WCAG 2.2 criteria it requires. */
  wcag?: { criterion: string; name: string }[];
};

const VERDICT: Record<string, string> = {
  requirement: "Requirement",
  unanimous: "Unanimous",
  majority: "Majority",
  split: "Split",
  "insufficient-evidence": "Insufficient evidence",
};

export function verdictText(r: Pick<IdRule, "verdict" | "judges">): string {
  if (r.verdict === "requirement") return VERDICT.requirement;
  if (r.verdict === "insufficient-evidence") return `${VERDICT[r.verdict]} (${r.judges.spoken} of 3 judges spoke)`;
  return `${VERDICT[r.verdict]} (${r.judges.agreeing} of ${r.judges.spoken})`;
}

const byId = (a: { id: string }, b: { id: string }) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

export function buildIds(rules: IdRule[]): IdEntry[] {
  return [...rules].sort(byId).map((r) => {
    const entry: IdEntry = {
      id: r.id,
      short: r.short,
      title: r.title,
      level: r.verdict === "split" || r.verdict === "insufficient-evidence" ? "guideline" : "rule",
      verdict: verdictText(r),
      version: String(r.version),
      status: r.status,
    };
    if (r.verdict === "requirement") {
      entry.wcag = (r.law ?? []).filter((l) => l.relation === "requires").map((l) => ({ criterion: String(l.criterion), name: l.name }));
    }
    return entry;
  });
}

export const SCHEMA_ID = "https://blackwoodblake.com/design-system/schema/justified.schema.json";

export function buildSchema(ids: IdEntry[]) {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: SCHEMA_ID,
    title: "Justified project overrides",
    description: "Your project's own decisions to depart from rules and guidelines of Justified by Blackwood & Blake. Each needs a reason.",
    type: "object",
    additionalProperties: false,
    required: ["overrides"],
    properties: {
      $schema: { type: "string" },
      justified: { type: "string", pattern: "^\\d+\\.\\d+\\.\\d+$", description: "The Justified version the file was written for. Informational." },
      overrides: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "action", "reason"],
          properties: {
            id: { type: "string", pattern: "^[A-Z]{3}-\\d{3}[a-z]?$", examples: ids.slice(0, 3).map((i) => i.id), description: "One exact id, such as FRM-004. No wildcards or families. An id that Justified does not have is not a schema error: the linter warns and ignores it, or throws with strict." },
            action: {
              enum: ["off", "guideline", "note"],
              description: "off: the project does not follow the text. guideline: treat a rule as a guideline that yields to the project's own convention (not for a WCAG requirement). note: the text applies in full; the reason is context.",
            },
            reason: { type: "string", minLength: 20, pattern: "\\S", description: "Your project's own words for the decision." },
            files: {
              type: "array",
              minItems: 1,
              items: { type: "string", pattern: "^[^!]", minLength: 1 },
              description: "Positive globs, relative to this file. Without it, the whole project.",
            },
            rule_version: { type: "string", pattern: "^\\d+\\.\\d+\\.\\d+$", description: "The version of the rule the override was written against." },
            review_by: { type: "string", format: "date", description: "A date to look at the decision again. ESLint ignores it." },
            owner: { type: "string" },
            lint_rules: {
              type: "array",
              minItems: 1,
              items: { type: "string", pattern: "^justified/" },
              description: "Limits off and guideline to some of the id's lint rules.",
            },
          },
        },
      },
    },
  };
}

export const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
