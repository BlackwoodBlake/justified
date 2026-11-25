import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Switch } from "@blackwoodblake/justified-shadcn/switch";
import { colourTransition, focusRing } from "@blackwoodblake/justified-shadcn/styles";
import { cn } from "@blackwoodblake/justified-shadcn/utils";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

import { describeFocus } from "./focus-demo";

/*
 * Helpers for the navigation examples (NAV-002a, NAV-002b, NAV-003, NAV-004).
 * For the examples only. They are not components of the system.
 *
 * The app shell, Tallowbrook, is drawn inside the example. Its menu items are
 * real links that simulate going to a page (preventDefault, then a state
 * change), so the host page gets no extra nav landmark, main or h1. The readouts read what the example's own
 * markup exposes (aria-current, the order of the items) and are hidden from
 * assistive technology. They are not a screen reader.
 */

export type NavItem = { id: string; label: string };

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "invoices", label: "Invoices" },
  { id: "clients", label: "Clients" },
  { id: "reports", label: "Reports" },
  { id: "settings", label: "Settings" },
];

const labelOf = (id: string) => NAV_ITEMS.find((i) => i.id === id)?.label ?? id;

/* ------------------------------------------------------------------ icons */

export function NavIcon({ id, filled }: { id: string; filled?: boolean }) {
  const f = filled ? "currentColor" : "none";
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-[18px] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {id === "dashboard" && (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1" fill={f} />
          <rect x="14" y="3" width="7" height="7" rx="1" fill={f} />
          <rect x="3" y="14" width="7" height="7" rx="1" fill={f} />
          <rect x="14" y="14" width="7" height="7" rx="1" fill={f} />
        </>
      )}
      {id === "invoices" && (
        <>
          <path d="M6 3h8l5 5v13H6z" fill={f} />
          {!filled && <path d="M9 13h7M9 17h7" />}
        </>
      )}
      {id === "clients" && (
        <>
          <circle cx="12" cy="8" r="4" fill={f} />
          <path d="M4 21c0-4 4-6 8-6s8 2 8 6z" fill={f} />
        </>
      )}
      {id === "reports" && (
        <>
          <rect x="4" y="12" width="4" height="9" fill={f} />
          <rect x="10" y="6" width="4" height="15" fill={f} />
          <rect x="16" y="3" width="4" height="18" fill={f} />
        </>
      )}
      {id === "settings" && (
        <>
          <path d="M3 7h18M3 17h18" />
          <circle cx="9" cy="7" r="2.5" fill={filled ? "currentColor" : "var(--color-background)"} />
          <circle cx="15" cy="17" r="2.5" fill={filled ? "currentColor" : "var(--color-background)"} />
        </>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------- menu */

/** How the current item is told apart from the others. */
export type Cue =
  /** Weight, a bar on the leading edge and a filled icon. Hover is a quieter background. */
  | "full"
  /** Text colour alone. */
  | "colour"
  /** The same background pill that hover uses. */
  | "hoverlike";

type MenuProps = {
  items: NavItem[];
  /** The item that looks current. */
  current?: string;
  cue?: Cue;
  /** Where the code says it: on the item (the usual way), on the list item, or nowhere. */
  mark?: "item" | "li" | "none";
  markValue?: "page" | "true";
  collapsed?: boolean;
  /** The item the pointer is over. Driven by the real pointer. */
  hovered?: string | null;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  /** Items matched by a prefix, which also look current (a Don't). */
  alsoCurrent?: string[];
  label: string;
};

function itemClass(cue: Cue, isCurrent: boolean, isHover: boolean, collapsed: boolean) {
  const barOn = cue === "full" && isCurrent;
  const base = cn(
    "flex w-full min-h-9 items-center gap-2.5 text-left text-sm",
    colourTransition,
    focusRing,
  );
  if (collapsed) {
    return cn(
      base,
      "size-10 justify-center rounded-md p-0 no-underline",
      // Items that are not current have no border at all: forced colours repaint a transparent border.
      isCurrent ? "border-2 border-foreground text-foreground" : cn("border-0 text-foreground", isHover && "bg-muted"),
    );
  }
  const shape = cn("rounded-r-md py-2 pr-2.5 no-underline", barOn ? "border-l-[3px] pl-2" : "border-l-0 pl-[11px]");
  if (cue === "full") {
    return cn(
      base,
      shape,
      isCurrent ? "border-foreground font-semibold text-foreground" : cn("font-normal text-foreground", isHover && "bg-muted"),
    );
  }
  if (cue === "colour") {
    return cn(base, shape, "font-normal", isCurrent ? "text-foreground" : "text-muted-foreground");
  }
  return cn(base, shape, isCurrent || isHover ? "bg-muted font-medium text-foreground" : "font-normal text-foreground");
}

/*
 * In a product this list sits in a named nav (STR-004) and the items are the
 * router's links. Here it is a labelled group, so the rule page gets no extra
 * landmark, and each link's click is stopped (preventDefault) and turned into
 * a state change, as the router's Link does.
 */
export function Menu({
  items,
  current,
  cue = "full",
  mark = "item",
  markValue = "page",
  collapsed,
  hovered,
  onHover,
  onSelect,
  alsoCurrent = [],
  label,
}: MenuProps) {
  return (
    <div role="group" aria-label={label}>
      <ul className="m-0 grid list-none gap-0.5 p-0">
        {items.map((item) => {
          const looks = item.id === current || alsoCurrent.includes(item.id);
          const isMarked = item.id === current;
          const filled = cue === "full" && looks;
          return (
            <li key={item.id} aria-current={mark === "li" && isMarked ? markValue : undefined}>
              <a
                href={`#${item.id}`}
                data-nav-item={item.label}
                data-looks-current={looks ? "" : undefined}
                aria-current={mark === "item" && isMarked ? markValue : undefined}
                aria-label={collapsed ? item.label : undefined}
                title={collapsed ? item.label : undefined}
                className={itemClass(cue, looks, hovered === item.id, !!collapsed)}
                onClick={(e) => {
                  e.preventDefault();
                  onSelect?.(item.id);
                }}
                onPointerEnter={() => onHover?.(item.id)}
                onPointerLeave={() => onHover?.(null)}
              >
                <NavIcon id={item.id} filled={filled} />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && hovered === item.id && <PointerGlyph />}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** A small drawn pointer, so the hovered item can be shown without a real pointer. */
function PointerGlyph() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="ml-auto size-3.5 shrink-0 text-foreground" fill="currentColor">
      <path d="M3 1.5v11l3-2.8 2 4.3 2-.9-2-4.2h4.2z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ scene */

export type Route = { item: string; detail?: string };

/** The content area of the drawn app: a heading and one thing to try. */
function Content({ route, setRoute, withDetail }: { route: Route; setRoute: (r: Route) => void; withDetail?: boolean }) {
  const title = route.detail ? `Invoice ${route.detail}` : labelOf(route.item);
  return (
    <div className="grid content-start gap-3 p-3">
      <h4 className="m-0 text-base font-semibold">{title}</h4>
      {withDetail && route.item === "invoices" && (
        // One button whose text and action change, so it keeps focus when pressed.
        <Button
          size="sm"
          variant="outline"
          className="justify-self-start"
          onClick={() => setRoute(route.detail ? { item: "invoices" } : { item: "invoices", detail: "INV-0042" })}
        >
          {route.detail ? "Back to invoices" : "Open INV-0042"}
        </Button>
      )}
      {!(withDetail && route.item === "invoices") && (
        <p className="m-0 text-sm text-muted-foreground">Nothing more in this demo.</p>
      )}
    </div>
  );
}

/** What the highlighted item exposes, read from the example's own markup. */
function useCurrentReadout(root: RefObject<HTMLElement | null>) {
  const [info, setInfo] = useState<{ name: string; own: string | null; li: string | null } | null>(null);
  useLayoutEffect(() => {
    const el = root.current?.querySelector<HTMLElement>("[data-looks-current]");
    const next = el
      ? {
          name: el.getAttribute("data-nav-item") ?? "",
          own: el.getAttribute("aria-current"),
          li: el.closest("li")?.getAttribute("aria-current") ?? null,
        }
      : null;
    setInfo((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  });
  return info;
}

function CurrentReadout({ info }: { info: ReturnType<typeof useCurrentReadout> }) {
  if (!info) return null;
  const heard =
    info.own === "page"
      ? `${info.name}, current page, link`
      : info.own === "true"
        ? `${info.name}, current, link`
        : `${info.name}, link`;
  const attr = (v: string | null) => (v ? <code>aria-current="{v}"</code> : <em>no aria-current</em>);
  return (
    <div
      aria-hidden="true"
      className="grid gap-1 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground"
    >
      <p className="m-0">
        Highlighted item, <span className="font-medium text-foreground">{info.name}</span>:
      </p>
      <p className="m-0">
        Its link has: <span className="text-foreground">{attr(info.own)}</span>
      </p>
      {info.li && (
        <p className="m-0">
          Its list item has: <span className="text-foreground">{attr(info.li)}</span>
        </p>
      )}
      <p className="m-0">
        A screen reader says: <span className="font-medium text-foreground">“{heard}”</span>
      </p>
    </div>
  );
}

/**
 * The drawn Tallowbrook app: a sidebar and a content area. Clicking an item
 * simulates going to that page. The highlighted item follows the route.
 */
export function Tallowbrook({
  cue = "full",
  mark = "item",
  withDetail,
  readout = true,
  initial = { item: "invoices" },
  initialHover = null,
}: {
  cue?: Cue;
  mark?: "item" | "li" | "none";
  withDetail?: boolean;
  readout?: boolean;
  initial?: Route;
  /** An item drawn as if the pointer were over it, until the real pointer moves. */
  initialHover?: string | null;
}) {
  const [route, setRoute] = useState<Route>(initial);
  const [hovered, setHovered] = useState<string | null>(initialHover);
  const root = useRef<HTMLDivElement>(null);
  const info = useCurrentReadout(root);
  return (
    <div className="grid w-full max-w-md gap-3">
      <div
        ref={root}
        className="grid min-h-48 grid-cols-[9rem_minmax(0,1fr)] overflow-hidden rounded-lg border border-border bg-background"
      >
        <div className="border-r border-border p-2">
          <p className="m-0 mb-2 px-2 text-sm font-semibold">Tallowbrook</p>
          <Menu
            label="Tallowbrook sidebar (drawn example)"
            items={NAV_ITEMS}
            current={route.item}
            cue={cue}
            mark={mark}
            markValue={route.detail ? "true" : "page"}
            hovered={hovered}
            onHover={setHovered}
            onSelect={(id) => setRoute({ item: id })}
          />
        </div>
        <Content route={route} setRoute={setRoute} withDetail={withDetail} />
      </div>
      {readout && <CurrentReadout info={info} />}
    </div>
  );
}

/* ----------------------------------------------------------------- NAV-002b */

/** The same sidebar expanded and collapsed to icons, sharing one route. */
export function TwoWidths() {
  const [current, setCurrent] = useState("invoices");
  const [hoveredWide, setHoveredWide] = useState<string | null>("clients");
  const [hoveredNarrow, setHoveredNarrow] = useState<string | null>(null);
  return (
    <div className="grid w-full max-w-md gap-3">
      <div className="flex items-start justify-center gap-4">
        <div className="grid w-40 gap-1">
          <p className="m-0 text-xs font-medium text-muted-foreground">Expanded</p>
          <div className="rounded-lg border border-border bg-background p-2">
            <Menu
              label="Expanded sidebar (drawn example)"
              items={NAV_ITEMS}
              current={current}
              hovered={hoveredWide}
              onHover={setHoveredWide}
              onSelect={setCurrent}
            />
          </div>
        </div>
        <div className="grid gap-1">
          <p className="m-0 text-xs font-medium text-muted-foreground">Collapsed</p>
          <div className="rounded-lg border border-border bg-background p-2">
            <Menu
              label="Collapsed sidebar (drawn example)"
              items={NAV_ITEMS}
              current={current}
              collapsed
              hovered={hoveredNarrow}
              onHover={setHoveredNarrow}
              onSelect={setCurrent}
            />
          </div>
        </div>
      </div>
      <p aria-hidden="true" className="m-0 text-center text-xs text-muted-foreground">
        Current page: <strong className="font-medium text-foreground">{labelOf(current)}</strong>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ NAV-003 */

type OrderFn = (page: string, ctx: { bookkeeper: boolean; custom: string[] | null }) => string[];

const STANDARD = NAV_ITEMS.map((i) => i.id);

function without(ids: string[], gone: string[]) {
  return ids.filter((id) => !gone.includes(id));
}

export const orderShared: OrderFn = (_page, { bookkeeper, custom }) =>
  without(custom ?? STANDARD, bookkeeper ? ["reports"] : []);

/** Each page builds its own list. */
export const orderPerPage: OrderFn = (page) => {
  if (page === "settings") return ["clients", "dashboard", "invoices", "reports", "settings"];
  if (page === "reports") return ["dashboard", "invoices", "reports", "clients", "settings"];
  return STANDARD;
};

/** The current item is moved to the top. */
export const orderCurrentFirst: OrderFn = (page) => [page, ...STANDARD.filter((id) => id !== page)];

const toItems = (ids: string[]) => ids.map((id) => ({ id, label: labelOf(id) }));

/** Two small pictures of the same menu on two pages, built with the example's own order function. */
export function OrderPair({
  order,
  pages,
  custom = null,
}: {
  order: OrderFn;
  pages: [string, string];
  custom?: string[] | null;
}) {
  const uid = useId();
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-3">
      {pages.map((p) => (
        <div key={p} className="grid gap-1">
          <p id={`${uid}-${p}`} className="m-0 text-xs font-medium text-muted-foreground">
            On {labelOf(p).toLowerCase()}
          </p>
          <ol
            aria-labelledby={`${uid}-${p}`}
            className="m-0 grid list-none gap-0.5 rounded-lg border border-border bg-background p-2 text-sm"
          >
            {order(p, { bookkeeper: false, custom }).map((id) => (
              <li
                key={id}
                className={cn(
                  "rounded-r-md py-1 pr-2",
                  id === p ? "border-l-[3px] border-foreground pl-2 font-semibold" : "border-l-0 pl-[11px]",
                )}
              >
                {labelOf(id)}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

/** A sidebar whose order comes from the function it is given. */
export function OrderDemo({ order, controls }: { order: OrderFn; controls?: "role" | "custom" }) {
  const [page, setPage] = useState("dashboard");
  const [bookkeeper, setBookkeeper] = useState(false);
  const [custom, setCustom] = useState<string[] | null>(null);
  const [log, setLog] = useState<Record<string, string[]>>({});
  const root = useRef<HTMLDivElement>(null);

  const ids = order(page, { bookkeeper, custom });

  useLayoutEffect(() => {
    const names = [...(root.current?.querySelectorAll<HTMLElement>("[data-nav-item]") ?? [])].map(
      (b) => b.getAttribute("data-nav-item") ?? "",
    );
    setLog((prev) => (prev[page]?.join() === names.join() ? prev : { ...prev, [page]: names }));
  });

  return (
    <div className="grid w-full max-w-md gap-3">
      {controls === "role" && (
        <Field label="Bookkeeper view (no Reports)" layout="inline">
          <Switch
            checked={bookkeeper}
            onCheckedChange={(on) => {
              setBookkeeper(on);
              // Reports is hidden, so leave its page rather than sit on an item that is gone.
              if (on && page === "reports") setPage("dashboard");
              setLog({});
            }}
          />
        </Field>
      )}
      {controls === "custom" && (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setCustom(["clients", ...STANDARD.filter((i) => i !== "clients")]);
              setLog({});
            }}
          >
            Move Clients to the top
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setCustom(null);
              setLog({});
            }}
          >
            Reset order
          </Button>
        </div>
      )}
      <div
        ref={root}
        className="grid min-h-48 grid-cols-[9rem_minmax(0,1fr)] overflow-hidden rounded-lg border border-border bg-background"
      >
        <div className="border-r border-border p-2">
          <p className="m-0 mb-2 px-2 text-sm font-semibold">Tallowbrook</p>
          <Menu
            label="Tallowbrook sidebar (drawn example)"
            items={toItems(ids)}
            current={page}
            onSelect={setPage}
          />
        </div>
        <div className="grid content-start gap-3 p-3">
          <h4 className="m-0 text-base font-semibold">{labelOf(page)}</h4>
          <p className="m-0 text-sm text-muted-foreground">Choose another item and watch the order.</p>
        </div>
      </div>
      <div
        className="grid gap-1 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground"
      >
        <p className="m-0">Order of the menu on each page you have opened:</p>
        {Object.entries(log).map(([p, names]) => (
          <p key={p} className="m-0">
            <span className="font-medium text-foreground">{labelOf(p)}:</span> {names.join(", ")}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ NAV-004 */

export type SkipKind = "visible" | "hidden" | "none";

/**
 * The drawn Tallowbrook app with a header, a sidebar of five items and a
 * content area. The skip link is the first Tab stop of the example. A
 * "Start from the top" button puts focus just before the example, as if the
 * page had just loaded, so the next press of Tab is the first one.
 */
export function SkipDemo({ skip, targetRing = true }: { skip: SkipKind; targetRing?: boolean }) {
  const uid = useId();
  const headingId = `${uid}-heading`;
  const scene = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [presses, setPresses] = useState(0);
  const [reached, setReached] = useState(false);
  const done = useRef(false);
  const [focusText, setFocusText] = useState("");

  const reset = () => {
    setPresses(0);
    setReached(false);
    done.current = false;
    setArmed(true);
    setFocusText("nothing yet");
  };

  useEffect(() => {
    if (!armed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab" && !e.shiftKey && !done.current && scene.current?.contains(document.activeElement)) setPresses((n) => n + 1);
    };
    const onFocus = () => {
      const el = document.activeElement;
      if (el && shell.current?.contains(el)) {
        setFocusText(describeFocus(el));
        if (el instanceof HTMLElement && el.dataset.goal !== undefined) {
          done.current = true;
          setReached(true);
        }
      }
    };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("focusin", onFocus);
    };
  }, [armed]);

  const jump = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    heading.current?.focus();
  };

  return (
    <div ref={scene} className="grid w-full max-w-md gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* The shell follows this button in the code, so the next Tab reaches the skip link first. */}
        <Button size="sm" variant="outline" onClick={reset}>
          Start from the top of the page
        </Button>
        <span className="text-xs text-muted-foreground">Then press Tab.</span>
      </div>
      <div ref={shell} className="relative overflow-hidden rounded-lg border border-border bg-background">
        {skip !== "none" && (
          <a
            href={`#${headingId}`}
            onClick={jump}
            className={cn(
              "rounded-md text-sm font-medium",
              focusRing,
              skip === "visible"
                ? "sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:bg-background focus:px-3 focus:py-2 focus:text-foreground focus:underline"
                : "sr-only",
            )}
          >
            Skip to main content
          </a>
        )}
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
          <button type="button" className={cn("rounded-md px-1 text-sm font-semibold", focusRing)}>
            Tallowbrook
          </button>
          <div className="flex gap-1">
            <button type="button" className={cn("min-h-8 rounded-md px-2 text-sm", focusRing)}>
              Help
            </button>
            <button type="button" className={cn("min-h-8 rounded-md px-2 text-sm", focusRing)}>
              Account
            </button>
          </div>
        </div>
        <div className="grid grid-cols-[9rem_minmax(0,1fr)]">
          <div className="border-r border-border p-2">
            <Menu label="Tallowbrook sidebar (drawn example)" items={NAV_ITEMS} current="invoices" />
          </div>
          <div className="grid content-start gap-3 p-3">
            <h4
              ref={heading}
              id={headingId}
              tabIndex={-1}
              className={cn("m-0 w-fit rounded-sm text-base font-semibold", targetRing ? focusRing : "outline-none")}
            >
              Invoices
            </h4>
            <Button size="sm" variant="outline" data-goal="" className="justify-self-start">
              New invoice
            </Button>
          </div>
        </div>
      </div>
      <div className="grid gap-1 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
        <p aria-hidden="true" className="m-0">
          Focus is on: <strong className="font-medium text-foreground">{focusText || "press the button above"}</strong>
        </p>
        <p className="m-0">
          Presses of Tab to reach <em>New invoice</em>:{" "}
          <strong className="font-medium tabular-nums text-foreground">
            {reached ? presses : armed ? `${presses} so far` : "–"}
          </strong>
        </p>
      </div>
    </div>
  );
}

/** A picture of the skip link as the first Tab shows it, for the example's still. */
export function SkipStill({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden="true" inert className="w-full max-w-md">
      {children}
    </div>
  );
}
