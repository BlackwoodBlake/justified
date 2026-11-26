/**
 * The colour pairs Justified promises, and how their contrast is measured.
 *
 * Shared by scripts/contrast.ts (the test) and the Foundations pages in
 * Storybook, so the numbers people read are the numbers that were tested.
 *
 *   - Text pairs need 4.5:1 (WCAG 2.2, 1.4.3 Contrast (Minimum)).
 *   - Input borders and focus rings need 3:1 against the page; the ring
 *     also against every surface it can sit on (card, muted, accent)
 *     (1.4.11 Non-text Contrast).
 */

export const TEXT = 4.5;
export const NON_TEXT = 3;

export type Pair = { fg: string; bg: string; min: number; use: string };

export const PAIRS: Pair[] = [
  { fg: "foreground", bg: "background", min: TEXT, use: "body text" },
  { fg: "muted-foreground", bg: "background", min: TEXT, use: "secondary text" },
  { fg: "muted-foreground", bg: "muted", min: TEXT, use: "secondary text on muted areas" },
  { fg: "card-foreground", bg: "card", min: TEXT, use: "text on cards" },
  { fg: "popover-foreground", bg: "popover", min: TEXT, use: "text in popovers" },
  { fg: "accent-foreground", bg: "accent", min: TEXT, use: "hovered item text" },
  { fg: "primary-foreground", bg: "primary", min: TEXT, use: "primary button label" },
  { fg: "secondary-foreground", bg: "secondary", min: TEXT, use: "secondary button label" },
  { fg: "primary", bg: "background", min: TEXT, use: "links" },
  { fg: "destructive-foreground", bg: "destructive", min: TEXT, use: "destructive button label" },
  { fg: "destructive", bg: "background", min: TEXT, use: "error messages" },
  { fg: "success-foreground", bg: "success", min: TEXT, use: "text on success fills" },
  { fg: "success", bg: "background", min: TEXT, use: "success messages" },
  { fg: "warning-foreground", bg: "warning", min: TEXT, use: "text on warning fills" },
  { fg: "warning", bg: "background", min: TEXT, use: "warning messages" },
  { fg: "info-foreground", bg: "info", min: TEXT, use: "text on info fills" },
  { fg: "info", bg: "background", min: TEXT, use: "info messages" },
  { fg: "input", bg: "background", min: NON_TEXT, use: "input borders" },
  { fg: "ring", bg: "background", min: NON_TEXT, use: "focus ring" },
  { fg: "ring", bg: "card", min: NON_TEXT, use: "focus ring on a card" },
  { fg: "ring", bg: "muted", min: NON_TEXT, use: "focus ring on a muted surface" },
  { fg: "ring", bg: "accent", min: NON_TEXT, use: "focus ring on an accent surface" },
];

/**
 * Colour tokens that are in no pair, and why. Every other colour token
 * must be in a pair, so a new colour cannot ship unmeasured.
 */
export const UNMEASURED: Record<string, string> = {
  border: "dividers and the edges of cards and tables, which are decoration; the edge of a control is --input",
  overlay: "the scrim behind a dialog, which carries no text and no control of its own",
};

/** A CSS value that is a colour: hex, a colour function, or a keyword. */
const COLOUR = /^(?:#[0-9a-f]{3,8}|(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\(.*\))$/i;
/** CSS's named colours (CSS Color Module Level 4) and colour keywords. */
const NAMED = new Set(
  ("aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown " +
   "burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan " +
   "darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid " +
   "darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet " +
   "deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro " +
   "ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki " +
   "lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow " +
   "lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray " +
   "lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine " +
   "mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise " +
   "mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab " +
   "orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru " +
   "pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown " +
   "seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan " +
   "teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen " +
   "transparent currentcolor canvas canvastext linktext visitedtext activetext buttonface buttontext " +
   "buttonborder field fieldtext highlight highlighttext selecteditem selecteditemtext mark marktext graytext accentcolor accentcolortext")
    .split(" "),
);

/** Whether a token's value is a colour, following var() to the token it names. */
function isColour(vars: Record<string, string>, value: string, seen = new Set<string>()): boolean {
  const v = value.trim();
  if (COLOUR.test(v) || NAMED.has(v.toLowerCase())) return true;
  const alias = v.match(/^var\(\s*--([a-z0-9-]+)\s*(?:,\s*(.+))?\)$/i);
  if (!alias || seen.has(alias[1])) return false;
  seen.add(alias[1]);
  const target = vars[alias[1]];
  return (target !== undefined && isColour(vars, target, seen)) || (alias[2] !== undefined && isColour(vars, alias[2], seen));
}

/**
 * Colour tokens that no pair measures and that UNMEASURED does not explain,
 * and UNMEASURED entries that are no longer colour tokens or are measured
 * after all. Both lists must be empty.
 */
export function coverage(themes: Themes): { unmeasured: string[]; stale: string[] } {
  const inPairs = new Set(PAIRS.flatMap((p) => [p.fg, p.bg]));
  const colours = new Set(
    (["light", "dark"] as const).flatMap((t) => Object.entries(themes[t]).filter(([, v]) => isColour(themes[t], v)).map(([k]) => k)),
  );
  return {
    unmeasured: [...colours].filter((t) => !inPairs.has(t) && !(t in UNMEASURED)).sort(),
    stale: Object.keys(UNMEASURED).filter((t) => !colours.has(t) || inPairs.has(t)).sort(),
  };
}

export type Themes = { light: Record<string, string>; dark: Record<string, string> };

function block(css: string, selector: RegExp): Record<string, string> {
  const m = css.match(selector);
  if (!m) throw new Error(`block not found: ${selector}`);
  const vars: Record<string, string> = {};
  for (const v of m[1].matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) vars[v[1]] = v[2].trim();
  return vars;
}

/** Reads the light and dark values from the text of tokens.css. */
export function parseThemes(source: string): Themes {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const light = block(css, /:root\s*\{([^}]*)\}/);
  const dark = { ...light, ...block(css, /\.dark,\s*\[data-theme="dark"\]\s*\{([^}]*)\}/) };
  return { light, dark };
}

function luminance(hex: string): number {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) throw new Error(`not a six-digit hex colour: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export type Result = Pair & { theme: "light" | "dark"; fgHex: string; bgHex: string; ratio: number; pass: boolean };

/** Measures every pair in both themes. */
export function measure(themes: Themes): Result[] {
  const results: Result[] = [];
  for (const theme of ["light", "dark"] as const) {
    const vars = themes[theme];
    for (const pair of PAIRS) {
      const fgHex = vars[pair.fg];
      const bgHex = vars[pair.bg];
      if (!fgHex || !bgHex) throw new Error(`${theme}: --${pair.fg} or --${pair.bg} is missing`);
      const r = ratio(fgHex, bgHex);
      results.push({ ...pair, theme, fgHex, bgHex, ratio: r, pass: r >= pair.min });
    }
  }
  return results;
}
