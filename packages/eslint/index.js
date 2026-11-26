/**
 * @blackwoodblake/justified-eslint: lint rules that flag code in shadcn and
 * React apps that may break a rule of Justified by Blackwood & Blake.
 *
 * `configs.recommended` turns on every rule: a Justified rule as "error"
 * and a guideline, which is our choice, as "warn".
 */
import { createRequire } from "node:module";

import rules from "./rules/index.js";

const { name, version } = createRequire(import.meta.url)("./package.json");

/** @type {import("./index.d.ts").JustifiedPlugin} */
const plugin = {
  meta: { name, version, namespace: "justified" },
  rules,
  configs: /** @type {any} */ ({}),
};

plugin.configs.recommended = {
  name: "justified/recommended",
  plugins: { justified: plugin },
  rules: Object.fromEntries(
    Object.entries(rules).map(([rule, module]) => [
      `justified/${rule}`,
      /** @type {any} */ (module.meta?.docs)?.justifiedLevel === "guideline" ? "warn" : "error",
    ]),
  ),
};

export default plugin;
