/*
 * The Foundations pages read tokens.css itself and measure it with the same
 * code as `npm test`, so every value and ratio shown here is the real one.
 */
import { measure, parseThemes } from "@blackwoodblake/justified-tokens/contrast";
import source from "@blackwoodblake/justified-tokens/tokens.css?raw";

export const themes = parseThemes(source);
export const results = measure(themes);

/** "1.125rem" → "18 px", assuming the browser default of 16 px. */
export function px(rem: string): string {
  const n = parseFloat(rem);
  return rem.endsWith("rem") ? `${n * 16} px` : rem;
}
