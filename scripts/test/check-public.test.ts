/**
 * Tests for scripts/check-public.ts. The private texts are put together
 * from pieces, so that this file does not hold them itself.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { scanFile } from "../check-public.ts";

/** A Swedish sentence with none of the three extra letters, split mid-word so no line here reads as Swedish. */
const SWEDISH = ["Det", "ta ar in", "te kl", "art o", "ch sk", "a fixas"].join("");
const TILDE = "~" + "/";

const scan = (text: string | Buffer, file = "notes.md", allowed: string[] = []) =>
  scanFile(file, Buffer.isBuffer(text) ? text : Buffer.from(text), new Set(allowed));
const caught = (text: string, what: RegExp, file?: string) => {
  const problems = scan(text, file);
  assert.ok(problems.some((p) => what.test(p)), `expected ${what} for ${JSON.stringify(text)}, got ${JSON.stringify(problems)}`);
};
const clean = (text: string, file?: string) => assert.deepEqual(scan(text, file), []);

describe("check-public", () => {
  it("passes plain English", () => {
    clean("Start the label of an action button with a verb, such as Save draft.");
  });

  describe("Swedish", () => {
    it("catches Swedish written without its extra letters", () => {
      caught(SWEDISH, /Swedish words/);
      caught(["Reg", "eln finns ef", "tersom"].join(""), /Swedish words/);
    });

    it("leaves English that holds one such word alone", () => {
      clean("The ska and the art of men's tailoring.");
      clean("Set det to the determinant, as in linear algebra.");
      clean("An Inte-Grade value or an Och-id key in code.");
      clean("Call `har()` from the CLI with --kan as a flag.");
    });

    it("leaves English with no Swedish word alone across the repository's own words", () => {
      clean("Under the hood, men and women read the den of a page till the end.");
    });
  });

  describe("home paths", () => {
    it("catches a path that starts at the home folder", () => {
      caught(`Notes are in ${TILDE}notes/plan.md.`, /absolute path/);
      caught(`cat "${TILDE}.npmrc"`, /absolute path/);
      caught("cp $" + "HOME/plan.md .", /absolute path/);
    });

    it("leaves a tilde that is not a path alone", () => {
      clean("About ~20 rules, and `~` in a version range like ~1.2.3.");
    });
  });

  describe("tokens", () => {
    it("catches GitHub and npm tokens", () => {
      caught("token: " + "gh" + "p_" + "A1b2C3d4".repeat(5), /token/);
      caught("github" + "_pat_" + "11ABCDEFG0123456789_abcdefghijklmnop", /token/);
      caught("NPM_TOKEN=" + "np" + "m_" + "x9Y8z7W6".repeat(5), /token/);
    });

    it("leaves short names with the same start alone", () => {
      clean("Set NPM_VERSION and run npm_config_cache.");
    });
  });

  describe("files named as images", () => {
    const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]);

    it("skips a real image", () => {
      assert.deepEqual(scan(PNG, "logo.png"), []);
    });

    it("checks text saved under an image name", () => {
      const problems = scan(SWEDISH, "notes.png");
      assert.ok(problems.some((p) => /does not hold one/.test(p)), JSON.stringify(problems));
      assert.ok(problems.some((p) => /Swedish words/.test(p)), JSON.stringify(problems));
    });
  });

  describe("allow list", () => {
    it("allows an exact line in a named file, and only there", () => {
      const line = `Notes are in ${TILDE}notes/plan.md.`;
      assert.deepEqual(scan(line, "notes.md", [`notes.md: ${TILDE}notes/plan.md`]), []);
      assert.notDeepEqual(scan(line, "other.md", [`notes.md: ${TILDE}notes/plan.md`]), []);
    });
  });

  it("still fails a file from a folder that is never committed", () => {
    caught("", /never committed/, ".analysis/ACT-001.md");
  });
});
