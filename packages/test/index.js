/**
 * @blackwoodblake/justified-test: Playwright helpers for the rules of
 * Justified by Blackwood & Blake that show only when the page runs
 * (`check: runtime` in the rule files), and the part of FRM-012a that
 * does (its file says `check: review`).
 *
 * Each helper rests on one rule. When the page may break it, the helper
 * throws a JustifiedFinding that names the rule, says what happened and how
 * to fix it, and links the rule's page. A JustifiedUsageError means the
 * helper could not check, such as a dialog that never opened.
 */
export { expectEscapeCloses, expectFocusInside, expectFocusReturns } from "./lib/dialogs.js";
export { expectTitleChangesOnNavigate } from "./lib/title.js";
export { expectAnnounced } from "./lib/announce.js";
export { expectNoContextChangeOnInput } from "./lib/input.js";
export { expectReducedMotion } from "./lib/motion.js";
export { JustifiedFinding, JustifiedUsageError, RULES, ruleUrl } from "./lib/report.js";
