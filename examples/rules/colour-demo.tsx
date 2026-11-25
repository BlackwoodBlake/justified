import { CloseIcon, SuccessIcon } from "@blackwoodblake/justified-shadcn/icons";
import source from "@blackwoodblake/justified-tokens/tokens.css?raw";
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { parseThemes, ratio } from "../../packages/tokens/src/contrast";

/*
 * Helpers for the colour examples (VIS-001 to VIS-004).
 *
 *   - ThemePanel and Themes draw a scene in the light theme and in the dark
 *     theme at once, with the real token values from tokens.css, whatever
 *     theme the page is in.
 *   - Readouts measures what the browser actually paints on the elements an
 *     example marks with data-measure, with the same ratio code as the
 *     contrast test, and writes the figure and the verdict as text. It
 *     follows opacity, alpha colours and the fills behind the element.
 *   - Drawn holds a picture of a failing pair. It is hidden from assistive
 *     technology and inert, and the failing text inside it is drawn in SVG,
 *     so it is a picture and never real low-contrast text on the page.
 *   - GrayscalePair shows a scene as it is and again in grayscale.
 *   - PlanPicker, StatusTable, Meter and Episodes are the scenes shared by
 *     more than one example.
 *
 * For the examples only. They are not components of the system.
 */

const themes = parseThemes(source);

function varsOf(theme: "light" | "dark"): CSSProperties {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(themes[theme])) if (/^#[0-9a-f]{6,8}$/i.test(v)) out[`--${k}`] = v;
  return { ...out, colorScheme: theme } as CSSProperties;
}

/** The scope that Readouts search in. */
export function Scope({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div data-scope="" className={className}>
      {children}
    </div>
  );
}

/** A scene drawn in one theme, whatever theme the page is in. */
export function ThemePanel({ theme, children }: { theme: "light" | "dark"; children: ReactNode }) {
  return (
    <div
      data-scope=""
      style={varsOf(theme)}
      className="min-w-0 rounded-lg border border-border bg-background p-3 text-foreground"
    >
      <p className="m-0 mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {theme === "light" ? "Light theme" : "Dark theme"}
      </p>
      {children}
    </div>
  );
}

/** The same scene in both themes, one above the other. */
export function Themes({ children }: { children: (theme: "light" | "dark") => ReactNode }) {
  return (
    <div className="grid w-full gap-3">
      <ThemePanel theme="light">{children("light")}</ThemePanel>
      <ThemePanel theme="dark">{children("dark")}</ThemePanel>
    </div>
  );
}

/** A picture, not a control: hidden from assistive technology, inert, and with no live text in it. */
export function Drawn({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div aria-hidden="true" inert className={className}>
      {children}
    </div>
  );
}

/* Measuring. */

type Rgb = [number, number, number];
let ctx: CanvasRenderingContext2D | null = null;

/** Any CSS colour the browser can compute, read back as sRGB and alpha. */
function rgba(css: string): [Rgb, number] {
  ctx ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!ctx) return [[0, 0, 0], 1];
  ctx.canvas.width = ctx.canvas.height = 1;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#000000";
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  // The canvas keeps alpha in 8 bits; the computed string keeps it exactly.
  const m = css.match(/\/\s*([\d.]+)(%?)\s*\)/);
  const alpha = m ? parseFloat(m[1]) / (m[2] ? 100 : 1) : d[3] / 255;
  return [[d[0], d[1], d[2]], alpha];
}

const mix = (under: Rgb, over: Rgb, a: number): Rgb =>
  [0, 1, 2].map((i) => under[i] * (1 - a) + over[i] * a) as Rgb;

const hex = (c: Rgb) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

function hexToRgb(h: string): Rgb {
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
}

type Kind = "text" | "border" | "fill";

/**
 * The contrast of one element's text, border or fill against what is painted
 * behind it. Opacity of the element and of every ancestor counts. An ancestor
 * marked data-contrast-stop ends the walk; `under` is then the colour behind it.
 */
export function measureElement(el: Element, kind: Kind, under?: string): number {
  const chain: Element[] = [];
  for (let n: Element | null = el; n; n = n.parentElement) {
    chain.unshift(n);
    if (under && n.hasAttribute("data-contrast-stop")) break;
  }
  const stopped = under !== undefined && chain[0].hasAttribute("data-contrast-stop");
  let canvas: Rgb = stopped ? hexToRgb(under!) : [255, 255, 255];
  let cumulative = 1;
  chain.forEach((n, i) => {
    const cs = getComputedStyle(n);
    cumulative *= parseFloat(cs.opacity);
    if (stopped && i === 0) return;
    if (n === el && kind !== "text") return;
    const [c, a] = rgba(n instanceof SVGElement && !(n instanceof SVGSVGElement) && n !== el ? "transparent" : cs.backgroundColor);
    canvas = mix(canvas, c, a * cumulative);
  });
  const cs = getComputedStyle(el);
  const svg = el instanceof SVGElement;
  const css = kind === "text" ? (svg ? cs.fill : cs.color) : kind === "border" ? cs.borderTopColor : svg ? cs.fill : cs.backgroundColor;
  const [c, a] = rgba(css);
  return ratio(hex(mix(canvas, c, a * cumulative)), hex(canvas));
}

export type Row = { id?: string; target: string; label: string; kind?: Kind; need: number; under?: string };

function useRemeasure(scopeOf: () => Element | null | undefined, run: () => void, key: string) {
  useEffect(() => {
    const scope = scopeOf();
    if (!scope) return;
    let t: ReturnType<typeof setTimeout>;
    const later = () => {
      clearTimeout(t);
      t = setTimeout(run, 260);
    };
    run();
    later();
    const obs = new MutationObserver(later);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    obs.observe(scope, { subtree: true, attributes: true, attributeFilter: ["class", "style", "data-state", "aria-checked", "aria-pressed"] });
    const events = ["pointerover", "pointerout", "focusin", "focusout"];
    events.forEach((e) => scope.addEventListener(e, later));
    return () => {
      clearTimeout(t);
      obs.disconnect();
      events.forEach((e) => scope.removeEventListener(e, later));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

/** One decimal, but two where rounding would show the threshold as reached when it is not. */
const floor1 = (n: number, need = 0) => {
  const one = n.toFixed(1);
  return n < need && Number(one) >= need ? (Math.floor(n * 100) / 100).toFixed(2) : one;
};

function Verdict({ pass, children }: { pass: boolean; children: ReactNode }) {
  return (
    <>
      {pass ? (
        <SuccessIcon className="mt-0.5 size-4 shrink-0 text-success" />
      ) : (
        <CloseIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
      )}
      <span>{children}</span>
    </>
  );
}

/** The measured ratio of each marked element, with a word for pass or fail. */
export function Readouts({ rows, tick, live }: { rows: Row[]; tick?: unknown; live?: boolean }) {
  const ref = useRef<HTMLUListElement>(null);
  const [vals, setVals] = useState<Record<string, number>>({});
  const key = JSON.stringify(rows) + String(tick);
  useRemeasure(
    () => ref.current?.closest("[data-scope]"),
    () => {
      const scope = ref.current?.closest("[data-scope]");
      if (!scope) return;
      const next: Record<string, number> = {};
      for (const r of rows) {
        const el = scope.querySelector(`[data-measure="${r.target}"]`);
        if (el) next[r.id ?? r.target] = measureElement(el, r.kind ?? "text", r.under);
      }
      setVals(next);
    },
    key,
  );
  return (
    <ul ref={ref} aria-live={live ? "polite" : undefined} className="m-0 mt-3 grid list-none gap-1 border-t border-border p-0 pt-2 text-xs text-muted-foreground">
      {rows.map((r) => {
        const v = vals[r.id ?? r.target];
        if (v === undefined) return <li key={r.id ?? r.target}>{r.label}: measuring …</li>;
        const pass = v >= r.need;
        return (
          <li key={r.id ?? r.target} className="flex items-start gap-1.5">
            <Verdict pass={pass}>
              {r.label}: <strong className="font-semibold text-foreground tabular-nums">{floor1(v, r.need)}:1</strong> (needs {r.need}:1).{" "}
              <strong className="font-semibold text-foreground">{pass ? "Passes" : "Fails"}</strong>
            </Verdict>
          </li>
        );
      })}
    </ul>
  );
}

/** For a link in running text: how far its colour is from the words around it, and whether it is underlined at rest. */
export function LinkReadout({ tick }: { tick?: unknown }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<{ gap: number; underlined: boolean } | null>(null);
  useRemeasure(
    () => ref.current?.closest("[data-scope]"),
    () => {
      const el = ref.current?.closest("[data-scope]")?.querySelector('[data-measure="link"]');
      const around = el?.parentElement;
      if (!el || !around) return;
      // Defined at rest: leave the figures alone while the pointer or focus is on the link.
      if (el.matches(":hover, :focus-visible")) return;
      const a = rgba(getComputedStyle(el).color)[0];
      const b = rgba(getComputedStyle(around).color)[0];
      setState({ gap: ratio(hex(a), hex(b)), underlined: getComputedStyle(el).textDecorationLine.includes("underline") });
    },
    String(tick),
  );
  if (!state) return <div ref={ref} className="mt-3 border-t border-border pt-2 text-xs text-muted-foreground">Measuring …</div>;
  const stands = state.underlined || state.gap >= 3;
  return (
    <div ref={ref} className="mt-3 grid gap-1 border-t border-border pt-2 text-xs text-muted-foreground">
      <p className="m-0">
        Link colour against the words around it: <strong className="font-semibold text-foreground tabular-nums">{floor1(state.gap)}:1</strong>
        {" "}(3:1 would do on its own)
      </p>
      <p className="m-0">
        Underline at rest: <strong className="font-semibold text-foreground">{state.underlined ? "yes" : "no"}</strong>
      </p>
      <p className="m-0 flex items-start gap-1.5">
        <Verdict pass={stands}>
          <strong className="font-semibold text-foreground">{stands ? "The link stands out at rest." : "The link does not stand out at rest."}</strong>
        </Verdict>
      </p>
    </div>
  );
}

/* Scenes shared by more than one example. */

/** A scene as it is, and the same scene again as a drawing in grayscale. */
export function GrayscalePair({ render }: { render: (grey: boolean) => ReactNode }) {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <div>{render(false)}</div>
      <Drawn className="grayscale">
        <p className="m-0 mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">The same in grayscale</p>
        {render(true)}
      </Drawn>
    </div>
  );
}

const PLANS = [
  { name: "Starter", price: "£9 a month", note: "1 project" },
  { name: "Team", price: "£29 a month", note: "5 projects" },
  { name: "Studio", price: "£79 a month", note: "Unlimited projects" },
];

export type PlanStyle = "ring" | "mark" | "tint";

/**
 * Three plan cards. Which one is chosen is shown by `style`:
 * ring (the focus ring's colours), mark (a fill, a check and the word) or tint (the fill alone).
 */
export function PlanPicker({ style, inertCopy, chosen: shared, onChoose }: { style: PlanStyle; inertCopy?: boolean; chosen?: string; onChoose?: (name: string) => void }) {
  const name = useId();
  const [own, setOwn] = useState("Team");
  const chosen = shared ?? own;
  const setChosen = (n: string) => {
    setOwn(n);
    onChoose?.(n);
  };
  return (
    <fieldset className="m-0 grid min-w-0 gap-2 border-0 p-0">
      <legend className="mb-2 p-0 text-sm font-semibold">Choose a plan</legend>
      {PLANS.map((p) => {
        const on = chosen === p.name;
        const look =
          style === "ring"
            ? on
              ? "border-ring ring-2 ring-ring"
              : "border-border bg-card"
            : on
              ? "border-border bg-accent"
              : "border-border bg-card";
        return (
          <label
            key={p.name}
            className={`relative flex cursor-pointer items-start justify-between gap-3 rounded-lg border p-3 text-sm text-card-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background ${look}`}
          >
            <input
              type="radio"
              name={name}
              value={p.name}
              checked={on}
              onChange={() => setChosen(p.name)}
              tabIndex={inertCopy ? -1 : undefined}
              className="sr-only"
            />
            <span className="grid gap-0.5">
              <span className="font-semibold">{p.name}</span>
              <span className="text-muted-foreground">{p.note}</span>
            </span>
            <span className="grid justify-items-end gap-0.5">
              <span className="font-medium">{p.price}</span>
              {style === "mark" && on && (
                <span aria-hidden="true" className="flex items-center gap-1 font-semibold">
                  <SuccessIcon className="size-4" />
                  Selected
                </span>
              )}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

function Spin() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 shrink-0 motion-safe:animate-spin" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const BUILDS = [
  { name: "main", id: "4f2a1c", status: "Passed", took: "2 min 14 s" },
  { name: "fix-login", id: "9b03de", status: "Failed", took: "1 min 02 s" },
  { name: "docs-update", id: "c71e58", status: "Running", took: "0 min 41 s" },
] as const;

const TONE = { Passed: "text-success", Failed: "text-destructive", Running: "text-info" } as const;
const FILL = { Passed: "bg-success", Failed: "bg-destructive", Running: "bg-info" } as const;

/** A build server's Builds table. "words" gives each status a word and an icon; "dots" only a coloured dot. */
export function StatusTable({ cue }: { cue: "words" | "dots" }) {
  return (
    <table className="w-full border-collapse text-left text-sm">
      <caption className="mb-2 text-left text-sm font-semibold">Builds</caption>
      <thead>
        <tr className="border-b border-border text-muted-foreground">
          <th scope="col" className="py-1.5 pr-2 font-medium">Branch</th>
          <th scope="col" className="py-1.5 pr-2 font-medium">Status</th>
          <th scope="col" className="py-1.5 font-medium">Time</th>
        </tr>
      </thead>
      <tbody>
        {BUILDS.map((b) => (
          <tr key={b.id} className="border-b border-border last:border-0">
            <th scope="row" className="py-2 pr-2 font-medium">{b.name}</th>
            <td className="py-2 pr-2">
              {cue === "words" ? (
                <span className="flex items-center gap-1.5">
                  <span className={TONE[b.status]}>
                    {b.status === "Passed" && <SuccessIcon className="size-4" />}
                    {b.status === "Failed" && <CloseIcon className="size-4" />}
                    {b.status === "Running" && <Spin />}
                  </span>
                  {b.status}
                </span>
              ) : (
                <span className="flex items-center">
                  <span aria-hidden="true" className={`size-2.5 rounded-full ${FILL[b.status]}`} />
                  <span className="sr-only">{b.status}</span>
                </span>
              )}
            </td>
            <td className="py-2 tabular-nums">{b.took}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const PARTS = [
  { key: "photos", name: "Photos", size: "4.1 GB", pct: 41, solid: "bg-primary", pale: "bg-primary/20" },
  { key: "videos", name: "Videos", size: "2.6 GB", pct: 26, solid: "bg-info", pale: "bg-info/20" },
  { key: "documents", name: "Documents", size: "0.8 GB", pct: 8, solid: "bg-success", pale: "bg-success/20" },
] as const;

export const meterRows: Row[] = PARTS.map((p) => ({ target: p.key, label: `${p.name} against the track`, kind: "fill", need: 3 }));

/** A storage meter. Solid segments with a 2 px gap, or pale segments that touch. The names and sizes stand beside it. */
export function Meter({ pale, sizes }: { pale: boolean; sizes: boolean }) {
  return (
    <div className="grid gap-3">
      <h4 className="m-0 text-sm font-semibold">Storage used: 7.5 GB of 10 GB</h4>
      <div data-measure="track" className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
        {PARTS.map((p) => (
          <div key={p.key} data-measure={p.key} style={{ width: `${p.pct}%` }} className={pale ? p.pale : `${p.solid} border-r-2 border-background last:border-r-0`} />
        ))}
      </div>
      <ul className="m-0 grid list-none gap-1 p-0 text-sm">
        {PARTS.map((p) => (
          <li key={p.key} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className={`size-3 rounded-sm ${pale ? p.pale : p.solid}`} />
              {p.name}
            </span>
            {sizes && <span className="tabular-nums text-muted-foreground">{p.size}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

const EPISODES = [
  { title: "The lighthouse keeper's call", date: "12 March 2026" },
  { title: "Night buses of Lisbon", date: "5 March 2026" },
  { title: "A pharmacy at 3 a.m.", date: "26 February 2026" },
];

/** A podcast host's Episodes list, with the date in muted-foreground as it is. */
export function Episodes() {
  return (
    <div className="grid gap-2">
      <h4 className="m-0 text-sm font-semibold">Episodes</h4>
      <ul className="m-0 grid list-none gap-2 p-0">
        {EPISODES.map((e, i) => (
          <li key={e.title} className="grid text-sm">
            <span className="font-medium">{e.title}</span>
            <time data-measure={i === 0 ? "date" : undefined} className="text-muted-foreground">{e.date}</time>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const FADES = {
  opacity: { label: "opacity-50", cls: "fill-muted-foreground opacity-50" },
  alpha: { label: "text-muted-foreground/70", cls: "fill-muted-foreground/70" },
  foreground: { label: "text-foreground/50", cls: "fill-foreground/50" },
} as const;
export type Fade = keyof typeof FADES;

/** The Episodes list drawn as a picture, with the dates faded. The dates are SVG text. */
export function FadedEpisodes({ fade }: { fade: Fade }) {
  return (
    <Drawn>
      <svg viewBox="0 0 260 120" className="block h-auto w-full max-w-xs" role="presentation" focusable="false">
        <text x="0" y="14" fontSize="14" fontWeight="600" className="fill-foreground">Episodes</text>
        {EPISODES.map((e, i) => (
          <g key={e.title}>
            <text x="0" y={42 + i * 34} fontSize="14" fontWeight="500" className="fill-foreground">{e.title}</text>
            <text data-measure={i === 0 ? "date" : undefined} x="0" y={58 + i * 34} fontSize="14" className={FADES[fade].cls}>{e.date}</text>
          </g>
        ))}
      </svg>
    </Drawn>
  );
}

/** A photo drawn as a gradient. The lightest and darkest spots are known, so they can be measured against. */
export const LIGHTEST = "#e8d5a8";
export const DARKEST = "#2f2a38";
export function PhotoDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={DARKEST} />
        <stop offset="0.4" stopColor="#8f7a68" />
        <stop offset="0.65" stopColor={LIGHTEST} />
        <stop offset="1" stopColor={LIGHTEST} />
      </linearGradient>
    </defs>
  );
}
