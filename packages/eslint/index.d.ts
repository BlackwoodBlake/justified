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

export interface FromProjectOptions {
  /** Limit the rules to these globs, such as ["**\/*.{jsx,tsx}"]. Relative to the config file. */
  files?: Linter.Config["files"];
  /** The file to look for, upwards from `dir`. Default "justified.json". */
  file?: string;
  /** Throw on an id that Justified does not have, instead of warning. Default false. */
  strict?: boolean;
  /** Where warnings go. Default console.warn. */
  onWarning?: (message: string) => void;
}

/**
 * `recommended` plus the departures a project wrote down in justified.json,
 * as flat config objects. Searches upwards from `dir` for the nearest file.
 * Returns just `recommended` when there is none.
 */
export type FromProject = (dir: string, options?: FromProjectOptions) => Linter.Config[];

export interface JustifiedPlugin extends ESLint.Plugin {
  meta: { name: string; version: string; namespace: "justified" };
  rules: Record<JustifiedRuleName, Rule.RuleModule>;
  configs: {
    /** Every rule on: rules as "error", guidelines as "warn". A flat config object. */
    recommended: Linter.Config;
  };
  fromProject: FromProject;
}

export declare const fromProject: FromProject;

declare const plugin: JustifiedPlugin;
export default plugin;
