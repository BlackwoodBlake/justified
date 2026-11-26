/**
 * espree.test.js: the rules need no TypeScript parser. ESLint's own parser
 * with JSX on gives the same reports for plain JSX.
 */
import assert from "node:assert/strict";
import { it } from "node:test";

import { Linter } from "eslint";

import plugin from "../index.js";

const code = `
import { useForm } from "react-hook-form";

export function SignUp() {
  const form = useForm({ mode: "onChange" });
  const { isValid } = form.formState;
  return (
    <form onSubmit={form.handleSubmit(save)}>
      <input name="first" aria-label="First name" /><input name="last" aria-label="Last name" />
      <input name="email" type="email" aria-label="Email" /><input name="phone" type="tel" aria-label="Phone" />
      <input name="street" aria-label="Street" />
      <button type="submit" disabled={!isValid}>Create account</button>
    </form>
  );
}
`;

it("reports plain JSX parsed by espree", () => {
  const linter = new Linter({ configType: "flat" });
  const messages = linter.verify(
    code,
    [
      { files: ["**/*.jsx"], languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
      { files: ["**/*.jsx"], ...plugin.configs.recommended },
    ],
    { filename: "sign-up.jsx" },
  );
  assert.deepEqual(
    messages.map((m) => [m.ruleId, m.severity]),
    [
      ["justified/error-timing", 2],
      ["justified/submit-stays-enabled", 1],
    ],
  );
});
