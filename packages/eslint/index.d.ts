import type { ESLint, Linter, Rule } from "eslint";

/** Rule names without the `justified/` prefix, such as "submit-stays-enabled". */
export type JustifiedRuleName = string;

export interface JustifiedRuleDocs {
  description: string;
  url: string;
  /** The Justified id, such as "FRM-002b". */
  justifiedId: string;
  /** "rule" is decided by WCAG or the judges; "guideline" is our choice. */
  justifiedLevel: "rule" | "guideline";
  /** The verdict as the site shows it, such as "Unanimous (2 of 2)". */
  justifiedVerdict: string;
}

export interface JustifiedPlugin extends ESLint.Plugin {
  meta: { name: string; version: string; namespace: "justified" };
  rules: Record<JustifiedRuleName, Rule.RuleModule>;
  configs: {
    /** Every rule on: rules as "error", guidelines as "warn". A flat config object. */
    recommended: Linter.Config;
  };
}

declare const plugin: JustifiedPlugin;
export default plugin;
