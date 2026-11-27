import { colourTransition, focusRing } from "@blackwoodblake/justified-shadcn/styles";
import { cn } from "@blackwoodblake/justified-shadcn/utils";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

import type { RuleExamples } from "./frame";
import { NAV_ITEMS, NavIcon, Tallowbrook } from "./nav-demo";

/*
 * NAV-002a (a requirement): when a menu shows the current page, the code or
 * the text says so too.
 *
 * Each scene is the drawn Tallowbrook sidebar: real links whose click is held
 * back, in a labelled group and not a nav, so the host page gets no extra
 * landmark. A readout under the scene shows what the highlighted item's
 * markup exposes and how a screen reader says it. Every Don't still
 * shows the highlight, so only the code differs.
 */

/*
 * The scene for the Don't that marks the list item: the same sidebar and
 * content as Tallowbrook (nav-demo), with the menu's list written out. The highlight
 * is the current item's weight, bar and filled icon; hover is a quieter
 * background.
 */

type Menu = { current: string; hovered: string | null; hover: (id: string | null) => void; select: (id: string) => void };

/** The class of a menu link: the full highlight when it is the current one. */
function linkClass(isCurrent: boolean, isHover: boolean) {
  return cn(
    "flex w-full min-h-9 items-center gap-2.5 text-left text-sm",
    colourTransition,
    focusRing,
    "rounded-r-md py-2 pr-2.5 no-underline",
    isCurrent ? "border-l-[3px] pl-2" : "border-l-0 pl-[11px]",
    isCurrent ? "border-foreground font-semibold text-foreground" : cn("font-normal text-foreground", isHover && "bg-muted"),
  );
}

function PointerGlyph() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="ml-auto size-3.5 shrink-0 text-foreground" fill="currentColor">
      <path d="M3 1.5v11l3-2.8 2 4.3 2-.9-2-4.2h4.2z" />
    </svg>
  );
}

function Scene({ menu }: { menu: (m: Menu) => ReactNode }) {
  const [current, setCurrent] = useState("invoices");
  const [hovered, setHovered] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
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
  const title = NAV_ITEMS.find((i) => i.id === current)?.label ?? current;
  const heard = info ? (info.own === "page" ? `${info.name}, current page, link` : `${info.name}, link`) : "";
  const attr = (v: string | null) => (v ? <code>aria-current="{v}"</code> : <em>no aria-current</em>);
  return (
    <div className="grid w-full max-w-md gap-3">
      <div
        ref={root}
        className="grid min-h-48 grid-cols-[9rem_minmax(0,1fr)] overflow-hidden rounded-lg border border-border bg-background"
      >
        <div className="border-r border-border p-2">
          <p className="m-0 mb-2 px-2 text-sm font-semibold">Tallowbrook</p>
          {menu({ current, hovered, hover: setHovered, select: setCurrent })}
        </div>
        <div className="grid content-start gap-3 p-3">
          <h4 className="m-0 text-base font-semibold">{title}</h4>
          <p className="m-0 text-sm text-muted-foreground">Nothing more in this demo.</p>
        </div>
      </div>
      {info && (
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
      )}
    </div>
  );
}

function MarkOnListItem() {
  return (
    <Scene
      menu={(m) => (
        <div role="group" aria-label="Tallowbrook sidebar (drawn example)">
          <ul className="m-0 grid list-none gap-0.5 p-0">
            {NAV_ITEMS.map((item) => (
              <li key={item.id} aria-current={item.id === m.current ? "page" : undefined}>
                <a
                  href={`#${item.id}`}
                  data-nav-item={item.label}
                  data-looks-current={item.id === m.current ? "" : undefined}
                  className={linkClass(item.id === m.current, m.hovered === item.id)}
                  onClick={(e) => {
                    e.preventDefault();
                    m.select(item.id);
                  }}
                  onPointerEnter={() => m.hover(item.id)}
                  onPointerLeave={() => m.hover(null)}
                >
                  <NavIcon id={item.id} filled={item.id === m.current} />
                  <span>{item.label}</span>
                  {m.hovered === item.id && <PointerGlyph />}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    />
  );
}

export const NAV002a: RuleExamples = {
  id: "NAV-002a",
  examples: [
    {
      kind: "do",
      title: "The highlighted item says it is current",
      caption: (
        <>
          <em>Invoices</em> is highlighted and carries <code>aria-current="page"</code>. Choose another item: the highlight
          and the code move together, and only one item has the mark. The items are real links, and the click is held back so the page does not move.
        </>
      ),
      Demo: () => <Tallowbrook mark="item" />,
    },
    {
      kind: "dont",
      title: "Only a highlight, nothing in the code",
      caption: (
        <>
          The highlight is the same, but the item has no <code>aria-current</code>. A person who cannot see the highlight
          hears "Invoices, link" and learns nothing about where they are.
        </>
      ),
      notLinted:
        "Lint gap: a link that is highlighted by its look alone is left alone, since a class cannot be told from other styling.",
      Demo: () => <Tallowbrook mark="none" />,
    },
    {
      kind: "do",
      title: "A page inside a section marks the section",
      caption: (
        <>
          This is invoice INV-0042, which is not in the menu, so <em>Invoices</em>, the section the person is in, has{" "}
          <code>"true"</code>. Press <em>Back to invoices</em> and it changes to <code>"page"</code>. <em>Open INV-0042</em>{" "}
          brings it back.
        </>
      ),
      Demo: () => <Tallowbrook mark="item" withDetail initial={{ item: "invoices", detail: "INV-0042" }} />,
    },
    {
      kind: "dont",
      title: "The mark sits on the list item",
      caption: (
        <>
          The attribute is on the <code>li</code> around the link, not on the link. When Tab or a list of links reaches the
          link, it is read as "Invoices, link", without "current page". Choose another item to see the mark move on the
          wrong element.
        </>
      ),
      Demo: MarkOnListItem,
    },
  ],
};
