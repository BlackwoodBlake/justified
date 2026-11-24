#!/usr/bin/env node
/**
 * build-registry.ts: turns the tokens and components into a shadcn
 * registry, so that a project adds them with the shadcn CLI:
 *
 *   npx shadcn@latest add https://blackwoodblake.com/design-system/r/field.json
 *
 * Writes dist/r/<name>.json (one registry item each) and
 * dist/r/registry.json (the index). The website serves dist/r/ at
 * /design-system/r/.
 *
 * REGISTRY_URL overrides where items point to each other, for testing
 * against a local server. Exit code: 0 = written, 2 = setup error.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const adapter = here("../");
const tokensDir = here("../../../packages/tokens/");
const out = join(adapter, "dist", "r");
const BASE = (process.env.REGISTRY_URL ?? "https://blackwoodblake.com/design-system/r").replace(/\/$/, "");
const SCHEMA = "https://ui.shadcn.com/schema/registry-item.json";

const pkg = JSON.parse(readFileSync(join(adapter, "package.json"), "utf8")) as { dependencies: Record<string, string> };
const version = (name: string) => {
  const v = pkg.dependencies[name];
  if (!v) fail(`${name} is not a dependency of the adapter`);
  return `${name}@${v}`;
};

function fail(message: string): never {
  console.error(`registry: ${message}`);
  process.exit(2);
}

// ------------------------------------------------------------ the theme

function vars(block: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const m of block.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) result[m[1]] = m[2].trim().replace(/\s+/g, " ");
  return result;
}

const tokens = readFileSync(join(tokensDir, "tokens.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const theme = readFileSync(join(tokensDir, "theme.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const light = tokens.match(/:root\s*\{([^}]*)\}/)?.[1] ?? fail("no :root block in tokens.css");
const dark = tokens.match(/\.dark,\s*\[data-theme="dark"\]\s*\{([^}]*)\}/)?.[1] ?? fail("no dark block in tokens.css");
const reduced =
  tokens.match(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*:root\s*\{([^}]*)\}/)?.[1] ??
  fail("no reduced-motion block");
const inline = theme.match(/@theme inline\s*\{([^}]*)\}/)?.[1] ?? fail("no @theme inline block in theme.css");

const themeItem = {
  $schema: SCHEMA,
  name: "justified-theme",
  type: "registry:theme",
  title: "Justified theme",
  description:
    "The neutral default theme of Justified by Blackwood & Blake: colours in shadcn's names, typography, space, focus, target size, layout and motion. Every colour pair is contrast-checked in light and dark.",
  cssVars: { theme: vars(inline), light: vars(light), dark: vars(dark) },
  css: {
    ":root": { "color-scheme": "light" },
    ".dark": { "color-scheme": "dark" },
    "@media (prefers-reduced-motion: reduce)": {
      ":root": Object.fromEntries(Object.entries(vars(reduced)).map(([k, v]) => [`--${k}`, v])),
    },
  },
};

// ------------------------------------------------------- the components

type Item = {
  name: string;
  title: string;
  description: string;
  deps: string[];
  internal: string[];
  file: string;
  type: "registry:ui" | "registry:lib";
};

const ITEMS: Item[] = [
  {
    name: "justified-styles",
    title: "Justified shared styles",
    description: "Focus ring, motion, field and target-size classes shared by the components.",
    deps: [],
    internal: [],
    file: "src/lib/styles.ts",
    type: "registry:lib",
  },
  {
    name: "justified-icons",
    title: "Justified icons",
    description: "The few decorative icons the components use, drawn inline.",
    deps: [],
    internal: [],
    file: "src/lib/icons.tsx",
    type: "registry:lib",
  },
  {
    name: "justified-dialog-focus",
    title: "Justified dialog focus",
    description: "Where focus starts and returns in a dialog, and the inert layer beneath a second dialog.",
    deps: [],
    internal: [],
    file: "src/lib/dialog-focus.ts",
    type: "registry:lib",
  },
  {
    name: "button",
    title: "Button",
    description: "A button with a visible focus ring that defaults to type=button.",
    deps: ["@radix-ui/react-slot", "class-variance-authority"],
    internal: ["justified-styles"],
    file: "src/components/button.tsx",
    type: "registry:ui",
  },
  {
    name: "label",
    title: "Label",
    description: "A visible label for a form control.",
    deps: ["@radix-ui/react-label"],
    internal: [],
    file: "src/components/label.tsx",
    type: "registry:ui",
  },
  {
    name: "field",
    title: "Field",
    description:
      "Ties a control to its visible label, hint and error, and announces errors (FRM-001, FRM-010, FRM-002a, FRM-002b).",
    deps: ["@radix-ui/react-slot"],
    internal: ["label", "justified-icons"],
    file: "src/components/field.tsx",
    type: "registry:ui",
  },
  {
    name: "input",
    title: "Input",
    description: "A text input that does not zoom on phones.",
    deps: [],
    internal: ["justified-styles"],
    file: "src/components/input.tsx",
    type: "registry:ui",
  },
  {
    name: "textarea",
    title: "Textarea",
    description: "Several lines of text.",
    deps: [],
    internal: ["justified-styles"],
    file: "src/components/textarea.tsx",
    type: "registry:ui",
  },
  {
    name: "native-select",
    title: "Native select",
    description: "A select built on the browser's own select element.",
    deps: [],
    internal: ["justified-styles", "justified-icons"],
    file: "src/components/native-select.tsx",
    type: "registry:ui",
  },
  {
    name: "checkbox",
    title: "Checkbox",
    description: "A checkbox with a 24 px target and an indeterminate state.",
    deps: ["@radix-ui/react-checkbox"],
    internal: ["justified-styles", "justified-icons"],
    file: "src/components/checkbox.tsx",
    type: "registry:ui",
  },
  {
    name: "radio-group",
    title: "Radio group",
    description: "One choice from a short list, wired to a FieldSet.",
    deps: ["@radix-ui/react-radio-group"],
    internal: ["field", "justified-styles"],
    file: "src/components/radio-group.tsx",
    type: "registry:ui",
  },
  {
    name: "switch",
    title: "Switch",
    description: "A setting that takes effect at once.",
    deps: ["@radix-ui/react-switch"],
    internal: ["justified-styles"],
    file: "src/components/switch.tsx",
    type: "registry:ui",
  },
  {
    name: "alert",
    title: "Alert",
    description:
      "An inline notice in the page, next to what it is about. No role by default, so a notice that is already there does not interrupt.",
    deps: ["class-variance-authority"],
    internal: [],
    file: "src/components/alert.tsx",
    type: "registry:ui",
  },
  {
    name: "tooltip",
    title: "Tooltip",
    description: "Extra help that opens on hover and on keyboard focus and closes with Escape (TXT-002a, TXT-002b).",
    deps: ["@radix-ui/react-tooltip"],
    internal: [],
    file: "src/components/tooltip.tsx",
    type: "registry:ui",
  },
  {
    name: "hover-card",
    title: "Hover card",
    description: "A card that opens on hover or focus, can be hovered and closes with Escape (TXT-002a).",
    deps: ["@radix-ui/react-hover-card"],
    internal: [],
    file: "src/components/hover-card.tsx",
    type: "registry:ui",
  },
  {
    name: "dialog",
    title: "Dialog",
    description:
      "A modal dialog where Escape does what Cancel does, focus returns to the opener and the buttons never reverse when they stack (DLG-001, DLG-002, ACT-003a, LAY-002).",
    deps: ["@radix-ui/react-dialog"],
    internal: ["button", "justified-styles", "justified-icons", "justified-dialog-focus"],
    file: "src/components/dialog.tsx",
    type: "registry:ui",
  },
  {
    name: "alert-dialog",
    title: "Alert dialog",
    description:
      "A confirmation that starts on Cancel, always has Cancel and names its action, with a destructive style for steps that destroy (DLG-003, DLG-004, DLG-005).",
    deps: ["@radix-ui/react-alert-dialog"],
    internal: ["button", "justified-styles", "justified-dialog-focus"],
    file: "src/components/alert-dialog.tsx",
    type: "registry:ui",
  },
];

/** Imports inside the package become the paths a shadcn project uses. */
function rewrite(source: string): string {
  return source
    .replace(/from "\.\.\/lib\/utils"/g, 'from "@/lib/utils"')
    .replace(/from "\.\.\/lib\/styles"/g, 'from "@/lib/justified-styles"')
    .replace(/from "\.\.\/lib\/icons"/g, 'from "@/lib/justified-icons"')
    .replace(/from "\.\.\/lib\/dialog-focus"/g, 'from "@/lib/justified-dialog-focus"')
    .replace(/from "\.\/([a-z-]+)"/g, 'from "@/components/ui/$1"');
}

mkdirSync(out, { recursive: true });
const index: { name: string; type: string; title: string; description: string }[] = [];

writeFileSync(join(out, "justified-theme.json"), JSON.stringify(themeItem, null, 2) + "\n");
index.push({ name: themeItem.name, type: themeItem.type, title: themeItem.title, description: themeItem.description });

for (const item of ITEMS) {
  const content = rewrite(readFileSync(join(adapter, item.file), "utf8"));
  const usesUtils = content.includes('from "@/lib/utils"');
  const json = {
    $schema: SCHEMA,
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    dependencies: item.deps.map(version),
    registryDependencies: [...(usesUtils ? ["utils"] : []), ...item.internal.map((n) => `${BASE}/${n}.json`)],
    files: [
      {
        // The file name decides where the CLI puts it: components/ui/ or lib/.
        path:
          item.type === "registry:lib"
            ? `registry/justified/lib/${item.name}${item.file.slice(item.file.lastIndexOf("."))}`
            : `registry/justified/ui/${item.name}.tsx`,
        type: item.type,
        content,
      },
    ],
  };
  writeFileSync(join(out, `${item.name}.json`), JSON.stringify(json, null, 2) + "\n");
  index.push({ name: item.name, type: item.type, title: item.title, description: item.description });
}

writeFileSync(
  join(out, "registry.json"),
  JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: "justified",
      homepage: "https://blackwoodblake.com/design-system/",
      items: index,
    },
    null,
    2,
  ) + "\n",
);
console.log(`registry: wrote ${index.length} items to dist/r/ (links point to ${BASE})`);
