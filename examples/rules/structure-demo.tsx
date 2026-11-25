import { Button } from "@blackwoodblake/justified-shadcn/button";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type SVGProps } from "react";

import { Still, useSay } from "./dialog";

/*
 * Helpers for the page structure examples (STR-001 to STR-005).
 *
 * A page title, the heading levels and the landmarks of a page are facts of
 * the whole page. An example must never change them for real: the page it
 * sits in has its own title, one main and one h1. So each scene here is drawn
 * (hidden from assistive technology) and a readout beside it lists what the
 * code would expose, as a screen reader's lists would. The readout is real
 * text, so a person who cannot see the drawing gets the same facts.
 *
 * For the examples only. None of this is a component of the system.
 */

/* ------------------------------------------------------------------ */
/* Headings                                                            */
/* ------------------------------------------------------------------ */

export type HNode =
  | {
      t: "h";
      text: string;
      /** Words added for assistive technology only (a visually hidden span). */
      hidden?: string;
      /** The level in code. null means the text only looks like a heading. */
      level: number | null;
      /** How big it looks, 1 largest. */
      look: 1 | 2 | 3 | 4;
      /** The element it is in code when it is not a heading. */
      tag?: string;
    }
  | { t: "p"; text: string }
  | { t: "card"; children: HNode[] };

type Heading = Extract<HNode, { t: "h" }>;

function flatten(nodes: HNode[]): HNode[] {
  return nodes.flatMap((n) => (n.t === "card" ? [n, ...flatten(n.children)] : [n]));
}

function stopsOf(nodes: HNode[]): Heading[] {
  return flatten(nodes).filter((n): n is Heading => n.t === "h" && n.level !== null);
}

const LOOK = {
  1: "text-lg font-bold",
  2: "text-base font-semibold",
  3: "text-sm font-semibold",
  4: "text-sm font-medium",
} as const;

function Chip({ children, strong }: { children: ReactNode; strong?: boolean }) {
  return (
    <code
      className={`mr-1.5 inline-block rounded border px-1 align-middle text-[10px] leading-4 ${
        strong ? "border-foreground/60 bg-muted font-semibold text-foreground" : "border-dashed border-border text-muted-foreground"
      }`}
    >
      {children}
    </code>
  );
}

function DrawnNode({ n, current }: { n: HNode; current?: HNode }) {
  if (n.t === "p") return <p className="m-0 text-xs text-muted-foreground">{n.text}</p>;
  if (n.t === "card") {
    return (
      <div className="grid gap-1 rounded-md border border-border p-2">
        {n.children.map((c, i) => (
          <DrawnNode key={i} n={c} current={current} />
        ))}
      </div>
    );
  }
  const isCurrent = current === n;
  return (
    <div className={`rounded px-1 ${isCurrent ? "bg-accent ring-2 ring-ring" : ""}`}>
      <Chip strong={n.level !== null}>{n.level !== null ? `h${n.level}` : (n.tag ?? "div")}</Chip>
      <span className={LOOK[n.look]}>{n.text}</span>
    </div>
  );
}

/** What a heading list would say about the levels (the check a linter does). */
function findings(hs: Heading[]): string[] {
  const out: string[] = [];
  const h1s = hs.filter((h) => h.level === 1).length;
  if (h1s === 0) out.push("No h1.");
  if (h1s > 1) out.push(`${h1s} h1s.`);
  for (let i = 1; i < hs.length; i++) {
    const a = hs[i - 1].level!;
    const b = hs[i].level!;
    if (b > a + 1) out.push(`h${a} is followed by h${b}, so h${a + 1} is skipped.`);
  }
  return out;
}

/**
 * A drawn page and the heading list a screen reader would build from its
 * code, with a button that jumps to the next heading as a screen reader's
 * heading key does.
 */
export function OutlineDemo({ title, nodes, check }: { title: string; nodes: HNode[]; check?: boolean }) {
  const stops = stopsOf(nodes);
  const [at, setAt] = useState(-1);
  const [said, say] = useSay();
  const current = at >= 0 ? stops[at] : undefined;

  const next = () => {
    if (stops.length === 0) {
      say("In the drawn page: nothing to jump to. It has no headings in its code.");
      return;
    }
    const i = (at + 1) % stops.length;
    setAt(i);
    const s = stops[i];
    say(`In the drawn page: heading level ${s.level}, ${s.text}${s.hidden ?? ""}`);
  };

  const found = check ? findings(stops) : [];

  return (
    <div className="grid w-full max-w-md gap-3">
      <div className="grid gap-1.5 rounded-lg border border-border bg-background p-3">
        <p className="m-0 mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Page: {title}</p>
        {nodes.map((n, i) => (
          <DrawnNode key={i} n={n} current={current} />
        ))}
      </div>

      <div className="grid gap-2 rounded-md border border-dashed border-border px-3 py-2 text-sm">
        <p className="m-0 text-muted-foreground">Simulated: the heading list a screen reader would build from this page's code:</p>
        {stops.length === 0 ? (
          <p className="m-0 font-medium">No headings. A person who lists headings finds nothing.</p>
        ) : (
          <ol className="m-0 grid list-none gap-0.5 p-0">
            {stops.map((s, i) => (
              <li
                key={i}
                aria-current={at === i ? "true" : undefined}
                style={{ paddingLeft: `${(s.level! - 1) * 14 + 4}px` }}
                className={`rounded py-0.5 pr-1 ${at === i ? "bg-accent font-semibold underline underline-offset-4" : ""}`}
              >
                <Chip strong>h{s.level}</Chip>
                {s.text}
                {s.hidden && <span className="text-muted-foreground">{s.hidden}</span>}
              </li>
            ))}
          </ol>
        )}
        {check && (
          <p className="m-0 border-t border-border pt-2 text-muted-foreground">
            Check: <span className="font-medium text-foreground">{found.length ? found.join(" ") : "one h1, no skipped levels."}</span>
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={next}>
          Next heading
        </Button>
        <p role="status" className="m-0 min-h-10 flex-1 basis-40 text-sm text-muted-foreground">
          {said}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Landmarks                                                           */
/* ------------------------------------------------------------------ */

export type Region = {
  el: "div" | "header" | "nav" | "main" | "footer" | "aside";
  /** The accessible name, set with aria-label. */
  name?: string;
  label: string;
  children?: Region[];
};

const ROLE: Record<string, string> = {
  header: "banner",
  nav: "navigation",
  main: "main",
  footer: "contentinfo",
  aside: "complementary",
};

function landmarksOf(rs: Region[]): Region[] {
  return rs.flatMap((r) => [...(ROLE[r.el] ? [r] : []), ...landmarksOf(r.children ?? [])]);
}

function tagOf(r: Region) {
  return `<${r.el}${r.name ? ` aria-label="${r.name}"` : ""}>`;
}

function Box({ r, current }: { r: Region; current?: Region }) {
  const isLandmark = !!ROLE[r.el];
  return (
    <div
      className={`grid min-w-0 gap-1 rounded border p-1.5 text-xs ${isLandmark ? "border-foreground/50" : "border-dashed border-border"} ${
        current === r ? "bg-accent ring-2 ring-ring" : ""
      }`}
    >
      <p className="m-0 break-words">
        <code className={`mr-1 rounded text-[10px] [overflow-wrap:anywhere] ${isLandmark ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{tagOf(r)}</code>
        <span className="text-muted-foreground">{r.label}</span>
      </p>
      {r.children?.map((c, i) => (
        <Box key={i} r={c} current={current} />
      ))}
    </div>
  );
}

/**
 * A drawn app shell (top bar, sidebar, content, bottom bar) and the landmark
 * list a screen reader would build from its code.
 */
export function LandmarkDemo({ top, side, content, bottom }: { top: Region; side: Region; content: Region; bottom: Region }) {
  const lms = landmarksOf([top, side, content, bottom]);
  const [at, setAt] = useState(-1);
  const [said, say] = useSay();
  const current = at >= 0 ? lms[at] : undefined;

  const next = () => {
    if (lms.length === 0) {
      say("In the drawn page: nothing to jump to. It has no landmarks in its code.");
      return;
    }
    const i = (at + 1) % lms.length;
    setAt(i);
    const l = lms[i];
    say(`In the drawn page: ${l.name ? `${l.name} ` : ""}${ROLE[l.el]} landmark`);
  };

  return (
    <div className="grid w-full max-w-md gap-3">
      <div className="grid gap-1.5 rounded-lg border border-border bg-background p-2">
        <Box r={top} current={current} />
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-1.5">
          <Box r={side} current={current} />
          <Box r={content} current={current} />
        </div>
        <Box r={bottom} current={current} />
      </div>

      <div className="grid gap-2 rounded-md border border-dashed border-border px-3 py-2 text-sm">
        <p className="m-0 text-muted-foreground">Simulated: the landmark list a screen reader would build from this page's code:</p>
        {lms.length === 0 ? (
          <p className="m-0 font-medium">No landmarks. A person who lists them finds nothing.</p>
        ) : (
          <ol className="m-0 grid list-none gap-0.5 p-0">
            {lms.map((l, i) => (
              <li key={i} aria-current={at === i ? "true" : undefined} className={`rounded px-1 py-0.5 ${at === i ? "bg-accent font-semibold underline underline-offset-4" : ""}`}>
                {ROLE[l.el]}
                {l.name ? <span className="text-muted-foreground">, named “{l.name}”</span> : <span className="text-muted-foreground">, no name</span>}
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={next}>
          Next landmark
        </Button>
        <p role="status" className="m-0 min-h-10 flex-1 basis-40 text-sm text-muted-foreground">
          {said}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page titles                                                         */
/* ------------------------------------------------------------------ */

export type TitleView = {
  id: string;
  label: string;
  path: string;
  /** What the view shows as its own heading. */
  heading: string;
  /** The title in the tab once the view is ready. */
  title: string;
  /** If set, the view loads for a moment and the tab shows this meanwhile. */
  loading?: string;
};

function TabStrip({ title, path }: { title: string; path: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-background">
      <div className="flex bg-muted px-2 pt-2">
        <div role="status" className="flex min-w-0 max-w-full items-center gap-2 rounded-t-md border border-b-0 border-border bg-background px-3 py-1.5 text-xs">
          <span aria-hidden="true" className="size-3 shrink-0 rounded-full border border-foreground/60" />
          <span className="truncate">
            <span className="sr-only">Tab title in the example: </span>
            {title}
          </span>
        </div>
      </div>
      <p className="m-0 border-t border-border px-3 py-1 text-[11px] text-muted-foreground">{path}</p>
    </div>
  );
}

/** A tab, frozen, for the state that goes by too fast to see. */
export function TabStill({ title, path, note }: { title: string; path: string; note: string }) {
  return (
    <Still note={note}>
      <TabStrip title={title} path={path} />
    </Still>
  );
}

/**
 * A tiny single page app. Choosing a view changes the tab title the way the
 * code under test would; the history list shows what each visit looks like
 * to someone with many tabs or a long history.
 */
export function TitleApp({ views, appName }: { views: TitleView[]; appName: string }) {
  const [id, setId] = useState(views[0].id);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([...views.slice(1).filter((v) => v.id !== "invoice").reverse().map((v) => v.title), views[0].title]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const view = views.find((v) => v.id === id)!;
  const title = loading && view.loading ? view.loading : view.title;

  const go = (v: TitleView) => {
    clearTimeout(timer.current);
    setId(v.id);
    if (v.loading) {
      setLoading(true);
      setHistory((h) => [...h, v.loading!].slice(-6));
      timer.current = setTimeout(() => {
        setLoading(false);
        setHistory((h) => [...h.slice(0, -1), v.title]);
      }, 1800);
    } else {
      setLoading(false);
      setHistory((h) => [...h, v.title].slice(-6));
    }
  };

  return (
    <div className="grid w-full max-w-md gap-3">
      <TabStrip title={title} path={`${appName.toLowerCase()}.example${view.path}`} />

      <div role="group" aria-label={`${appName} views`} className="flex flex-wrap gap-2">
        {views.map((v) => (
          <Button key={v.id} variant="outline" size="sm" aria-current={v.id === id ? "page" : undefined} className={v.id === id ? "bg-accent font-semibold underline underline-offset-4" : ""} onClick={() => go(v)}>
            {v.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-1 rounded-md border border-border bg-background p-3 text-sm">
        <h4 className="m-0 text-base font-semibold">{view.heading}</h4>
        <p className="m-0 text-muted-foreground">{loading ? "Loading …" : "Ready."}</p>
      </div>

      <div className="rounded-md border border-dashed border-border px-3 py-2 text-sm">
        <p className="m-0 text-muted-foreground">History, newest last:</p>
        <ol className="m-0 mt-1 list-decimal pl-5">
          {history.map((h, i) => (
            <li key={i} className="break-words">
              {h}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Text for images                                                     */
/* ------------------------------------------------------------------ */

/**
 * The words a screen reader would speak for an element: what the example set
 * in alt, aria-label and text, skipping what is hidden with aria-hidden. It
 * is not a screen reader.
 */
function speak(node: Node): string[] {
  if (node.nodeType === 3) {
    const t = (node.textContent ?? "").replace(/\s+/g, " ").trim();
    return t ? [t] : [];
  }
  if (!(node instanceof Element)) return [];
  if (node.getAttribute("aria-hidden") === "true") return [];
  if (node instanceof HTMLImageElement) {
    const alt = node.getAttribute("alt");
    return alt ? [`graphic, ${alt}`] : [];
  }
  if (node.getAttribute("role") === "img") {
    const label = node.getAttribute("aria-label");
    return label ? [`graphic, ${label}`] : [];
  }
  return [...node.childNodes].flatMap(speak);
}

/** One row of a list, with what it says aloud written under it. */
export function ReadRow({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [said, setSaid] = useState("");
  useLayoutEffect(() => {
    if (ref.current) setSaid(speak(ref.current).join(" · "));
  });
  return (
    <li className="grid gap-1 rounded-md border border-border bg-background px-3 py-2 text-sm">
      <div ref={ref} className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {children}
      </div>
      <p aria-hidden="true" className="m-0 border-t border-dashed border-border pt-1 text-xs text-muted-foreground">
        What a screen reader gets, simulated: <span className="font-medium text-foreground">{said ? `“${said}”` : "nothing"}</span>
      </p>
    </li>
  );
}

export function ReadList({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid w-full max-w-md gap-2">
      <h4 className="m-0 text-sm font-medium">{label}</h4>
      <ul className="m-0 grid list-none gap-2 p-0">{children}</ul>
    </div>
  );
}

/** A small round picture, as data, so no file is needed. */
export function avatarSrc(initials: string, hue: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="hsl(${hue} 45% 38%)"/><text x="16" y="21" font-family="sans-serif" font-size="13" text-anchor="middle" fill="white">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** The overdue clock as a picture file, for an img element. */
export const clockSrc = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
)}`;

/** The overdue clock as an inline icon. The caller decides its name or hiding. */
export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0 text-destructive" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
