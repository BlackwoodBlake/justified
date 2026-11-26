/**
 * setup.js: loaded before every test (`node --import ./test/setup.js`).
 *
 * The repository root uses TypeScript 7, which has no JavaScript API. The
 * TypeScript parser for ESLint needs TypeScript 5, so this package installs
 * its own copy, and this hook points every `typescript` import in the tests
 * at it, also from helpers npm placed at the root, such as ts-api-utils.
 */
import { createRequire, registerHooks } from "node:module";
import { pathToFileURL } from "node:url";

const path = createRequire(import.meta.url).resolve("typescript");
const url = pathToFileURL(path).href;

registerHooks({
  resolve(specifier, context, next) {
    if (specifier !== "typescript") return next(specifier, context);
    // require() wants a path, import a URL.
    return next(context.conditions?.includes("require") ? path : url, context);
  },
});
