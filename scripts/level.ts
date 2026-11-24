/**
 * level.ts: works out whether a published text is a rule or a guideline.
 *
 * Like the verdict, the level is never set by hand. It follows from the
 * verdict:
 *
 *   - Rule: the law or the judges decide. Requirement, Unanimous, Majority.
 *   - Guideline: we decide. Split, or Insufficient evidence (fewer than two
 *     judges have spoken). A guideline is shown as our choice, with our
 *     reasons, and never as a verdict of support.
 */
export type Level = "rule" | "guideline";

export function deriveLevel(verdict: string): Level {
  return verdict === "split" || verdict === "insufficient-evidence" ? "guideline" : "rule";
}

/** The words in the "## Rule" section, for the length limit. */
export function ruleWords(body: string): number {
  const m = body.match(/## Rule\s+([\s\S]*?)(?:\n## |$)/);
  return (m?.[1] ?? "").split(/\s+/).filter(Boolean).length;
}

/** A rule sentence longer than this gets a warning from check-rules. */
export const RULE_WORD_LIMIT = 60;
