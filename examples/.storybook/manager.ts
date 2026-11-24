import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

/*
 * The site's sidebar opens Storybook in the same tab, so the brand at the
 * top left is the way back to the site. It follows the reader's light or
 * dark setting, as the site does.
 */
const dark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;

addons.setConfig({
  theme: create({
    base: dark ? "dark" : "light",
    brandTitle: "← Justified by Blackwood & Blake",
    brandUrl: "https://blackwoodblake.com/design-system/",
    brandTarget: "_self",
  }),
});
