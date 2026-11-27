/**
 * examples.spec.js: every helper against the live examples.
 *
 * For each rule a helper checks, every Do story in
 * examples/stories/rules/<ID>.stories.tsx must pass and every Don't story
 * must be caught with a finding for that rule. The stories are read from
 * the Storybook build's index.json, so a new example fails here until it
 * has a scenario below.
 *
 * A Don't the helper leaves alone on purpose carries `notCaught` with the
 * reason, such as a Don't that shows our own advice rather than the rule.
 */
import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

import {
  expectAnnounced,
  expectEscapeCloses,
  expectFocusInside,
  expectFocusReturns,
  expectNoContextChangeOnInput,
  expectReducedMotion,
  expectTitleChangesOnNavigate,
  JustifiedFinding,
  ruleUrl,
} from "../index.js";

/** @typedef {import("@playwright/test").Page} Page */

const index = JSON.parse(readFileSync(new URL("../../../examples/dist/index.json", import.meta.url), "utf8"));

/** @param {Page} page @param {string} id */
const open = async (page, id) => {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await page.locator("#storybook-root figure").waitFor();
};

/** The live tab title drawn in the STR-001 examples. The real page's title is never touched there. */
const drawnTitle = (/** @type {Page} */ page) => async () => {
  const tab = page.locator('div:has(> [role="group"][aria-label$=" views"]) [role="status"]').first();
  return ((await tab.textContent()) ?? "").replace("Tab title in the example:", "").trim();
};

/** @param {Page} page */
const views = (page) => page.locator('[role="group"][aria-label$=" views"]').getByRole("button");

/** Moves through every view after the first, one press each. @param {Page} page */
const everyView = async (page) => {
  const count = await views(page).count();
  return Array.from({ length: count - 1 }, (_, i) => () => views(page).nth(i + 1).click());
};

/**
 * One entry per story: `check` runs the helper on the story, as many times
 * as there are ways to try it.
 * @type {Record<string, { check: (page: Page, id: string) => Promise<void>, notCaught?: string }>}
 */
const SCENARIOS = {
  // DLG-006: focus in and back.
  "DLG-006/Example1": {
    async check(page, id) {
      const trigger = page.getByRole("button", { name: "Add expense", exact: true });
      await open(page, id);
      await expectFocusReturns(trigger);
      await open(page, id);
      await expectFocusReturns(trigger, { close: (d) => d.getByRole("button", { name: "Cancel" }).click() });
      await open(page, id);
      await expectFocusReturns(trigger, {
        close: async (d) => {
          await d.getByLabel("Amount").fill("12.50");
          await d.getByLabel("Category").fill("Meals");
          await d.getByRole("button", { name: "Add expense" }).click();
        },
      });
    },
  },
  "DLG-006/Example2": {
    async check(page, id) {
      await open(page, id);
      await expectFocusReturns(page.getByRole("button", { name: "Add expense", exact: true }));
    },
  },
  "DLG-006/Example3": {
    async check(page, id) {
      const trigger = page.getByRole("button", { name: "Send back claim 1042" });
      await open(page, id);
      await expectFocusReturns(trigger);
      await open(page, id);
      await expectFocusReturns(trigger, { close: (d) => d.getByRole("button", { name: "Send back claim" }).click() });
      await open(page, id);
      await expectFocusReturns(page.getByRole("button", { name: "Send back claim 1043" }), {
        close: (d) => d.getByRole("button", { name: "Send back claim" }).click(),
      });
    },
  },
  "DLG-006/Example4": {
    async check(page, id) {
      await open(page, id);
      await expectFocusReturns(page.getByRole("button", { name: "Send back claim 1042" }), {
        close: (d) => d.getByRole("button", { name: "Send back claim" }).click(),
      });
    },
  },

  // DLG-007: focus stays inside.
  "DLG-007/Example1": {
    async check(page, id) {
      await open(page, id);
      await page.getByRole("button", { name: "Plan a meal" }).click();
      await expectFocusInside(page.getByRole("dialog"));
    },
  },
  "DLG-007/Example2": {
    async check(page, id) {
      await open(page, id);
      await page.getByRole("button", { name: "Plan a meal" }).click();
      await expectFocusInside(page.getByRole("dialog"));
    },
  },

  // STR-001: a title for every view.
  "STR-001/Example1": {
    async check(page, id) {
      await open(page, id);
      await expectTitleChangesOnNavigate(page, await everyView(page), { readTitle: drawnTitle(page), settle: 2200, appName: "Fernhill" });
    },
  },
  "STR-001/Example2": {
    async check(page, id) {
      // Without appName, so the finding is the title that stays the same.
      await open(page, id);
      await expectTitleChangesOnNavigate(page, await everyView(page), { readTitle: drawnTitle(page), settle: 2200 });
    },
  },
  "STR-001/Example3": {
    async check(page, id) {
      await open(page, id);
      await expectTitleChangesOnNavigate(page, await everyView(page), { readTitle: drawnTitle(page), settle: 2200, appName: "Fernhill" });
    },
  },
  "STR-001/Example4": {
    notCaught:
      "The email address in the title breaks our own advice under Do, not the rule: every view still gets its own title.",
    async check(page, id) {
      await open(page, id);
      await expectTitleChangesOnNavigate(page, await everyView(page), { readTitle: drawnTitle(page), appName: "Fernhill" });
    },
  },

  // DLG-001: Escape does what Cancel does.
  "DLG-001/Example1": {
    async check(page, id) {
      await expectEscapeCloses(page, {
        setup: async () => {
          await open(page, id);
          await page.getByRole("button", { name: "Rename folder" }).click();
          await page.getByRole("dialog").getByLabel("Folder name").fill("Invoices 2027");
        },
        snapshot: (p) => p.locator("figure").innerText(),
      });
    },
  },
  "DLG-001/Example2": {
    async check(page, id) {
      await expectEscapeCloses(page, {
        setup: async () => {
          await open(page, id);
          await page.getByRole("button", { name: "New customer" }).click();
          await page.getByRole("dialog").getByLabel("Name").fill("Maya Ortiz");
        },
        snapshot: (p) => p.locator("figure").innerText(),
      });
    },
  },
  "DLG-001/Example3": {
    async check(page, id) {
      await expectEscapeCloses(page, {
        setup: async () => {
          await open(page, id);
          await page.getByRole("button", { name: "New customer" }).click();
          await page.getByRole("dialog").getByLabel("Name").fill("Maya Ortiz");
        },
        snapshot: (p) => p.locator("figure").innerText(),
      });
    },
  },

  // FBK-004: status messages are announced.
  "FBK-004/Example1": {
    async check(page, id) {
      const notes = page.getByLabel("Meeting notes");
      const type = async () => {
        await notes.click();
        await page.keyboard.press("End");
        await page.keyboard.type(" Next meeting in April.");
      };
      await open(page, id);
      await expectAnnounced(page, "Saving draft", { action: type });
      await expectAnnounced(page, /Draft saved at \d\d:\d\d/);
    },
  },
  "FBK-004/Example2": {
    async check(page, id) {
      await open(page, id);
      await expectAnnounced(page, "Saving draft", {
        action: async () => {
          await page.getByLabel("Meeting notes").click();
          await page.keyboard.type(" Next meeting in April.");
        },
      });
    },
  },

  // FRM-012a: changing a value changes nothing else.
  "FRM-012a/Example1": {
    async check(page, id) {
      await open(page, id);
      await expectNoContextChangeOnInput(page.getByRole("checkbox", { name: "Garden" }));
      await expectNoContextChangeOnInput(page.getByLabel("Sort by"));
    },
  },
  "FRM-012a/Example2": {
    async check(page, id) {
      await open(page, id);
      await expectNoContextChangeOnInput(page.getByLabel("Branch"));
    },
  },
  "FRM-012a/Example3": {
    async check(page, id) {
      await open(page, id);
      await expectNoContextChangeOnInput(page.getByLabel("Confirmation code"), {
        change: (c) => c.pressSequentially("123456"),
        notice: page.getByText("We check the code as soon as all six digits are in."),
      });
    },
  },
  "FRM-012a/Example4": {
    async check(page, id) {
      await open(page, id);
      await expectNoContextChangeOnInput(page.getByLabel("Confirmation code"), {
        change: (c) => c.pressSequentially("123456"),
      });
    },
  },
  "FRM-012a/Example5": {
    async check(page, id) {
      await open(page, id);
      await expectNoContextChangeOnInput(page.getByRole("checkbox", { name: "Garden" }));
    },
  },

  // VIS-006: reduced motion.
  "VIS-006/Example1": {
    async check(page, id) {
      await open(page, id);
      const filters = page.getByRole("button", { name: "Filters" });
      await expectReducedMotion(page, { scope: page.locator("figure"), action: async () => {
        await filters.click();
        await filters.click();
      } });
    },
  },
  "VIS-006/Example2": {
    async check(page, id) {
      await open(page, id);
      const filters = page.getByRole("button", { name: "Filters" });
      await expectReducedMotion(page, { scope: page.locator("figure"), action: async () => {
        await filters.click();
        await filters.click();
      } });
    },
  },
  "VIS-006/Example3": {
    async check(page, id) {
      await open(page, id);
      await expectReducedMotion(page, {
        scope: page.locator("figure"),
        action: () => page.getByRole("button", { name: "Show total again" }).click(),
      });
    },
  },
  "VIS-006/Example4": {
    async check(page, id) {
      await open(page, id);
      const summary = page.getByRole("button", { name: "Summary" });
      await expectReducedMotion(page, { scope: page.locator("figure"), action: async () => {
        await summary.click();
        await summary.click();
      } });
    },
  },
};

const RULE_IDS = [...new Set(Object.keys(SCENARIOS).map((k) => k.split("/")[0]))];

for (const ruleId of RULE_IDS) {
  const stories = Object.values(index.entries).filter(
    (e) => e.type === "story" && e.importPath === `./stories/rules/${ruleId}.stories.tsx` && /^(Do|Don't):/.test(e.name),
  );

  test.describe(ruleId, () => {
    test("every Do and Don't story has a scenario", () => {
      expect(stories.length).toBeGreaterThan(0);
      const missing = stories.map((s) => `${ruleId}/${s.exportName}`).filter((k) => !SCENARIOS[k]);
      expect(missing, "stories with no scenario").toEqual([]);
    });

    for (const story of stories) {
      const key = `${ruleId}/${story.exportName}`;
      const scenario = SCENARIOS[key];
      if (!scenario) continue;
      const isDo = story.name.startsWith("Do:");

      test(`${story.exportName} ${story.name}`, async ({ page }) => {
        if (isDo || scenario.notCaught) {
          if (scenario.notCaught) test.info().annotations.push({ type: "not caught", description: scenario.notCaught });
          await scenario.check(page, story.id);
          return;
        }
        let error;
        try {
          await scenario.check(page, story.id);
        } catch (e) {
          error = e;
        }
        expect(error, "the Don't should be caught").toBeInstanceOf(JustifiedFinding);
        const message = /** @type {Error} */ (error).message;
        expect(message).toContain(`May break ${ruleId} (`);
        expect(message).toContain(ruleUrl(ruleId));
        test.info().annotations.push({ type: "finding", description: message });
      });
    }
  });
}
