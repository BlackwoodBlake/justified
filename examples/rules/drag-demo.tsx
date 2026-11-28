import { ChevronDownIcon } from "@blackwoodblake/justified-shadcn/icons";
import { cn } from "@blackwoodblake/justified-shadcn/utils";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

/*
 * A small sortable list or board for the drag examples (ACT-007a, ACT-007b,
 * ACT-008). It is written here because the examples add no dependency. For
 * the examples only. It is not a component of the system.
 *
 * What it does, by setting:
 *   - Pointer drag on the handle, with real pointer events and capture. The
 *     held card follows the pointer. The cards stay where they are until the
 *     drop, so the mark on the landing place is the only sign of it.
 *   - Keyboard move on the handle: Space or Enter picks up and drops, the
 *     arrow keys walk through the places, Escape cancels, leaving the handle
 *     cancels.
 *   - mark: what shows the landing place (ACT-008). "line" is a 2px line in
 *     the gap, "column" is a thicker border and a fill on the column under
 *     the card, and "stale" leaves every column the card passed marked.
 *   - buttons: Move up and Move down on each row (ACT-007a).
 *   - pick: tap a card to open Move to buttons for the other columns.
 *   - announce: the words for assistive technology (ACT-007b). "words" are
 *     the guideline, "ids" is the library default that reads out ids, "zero"
 *     counts from zero. The live region sits outside the list.
 *   - frozen: draws the list as it looks mid-drag, for a still picture.
 */

export type Item = { id: string; label: string; code: string };
export type Col = { id: string; title: string; code: string; items: Item[] };
type Slot = { c: number; i: number };
export type Drag = {
  id: string;
  from: Slot;
  to: Slot | null;
  by: "pointer" | "keyboard";
  dx: number;
  dy: number;
  /** Every column the card has been over, for the "stale" mark. */
  seen: number[];
};

export type DragDemoProps = {
  title: string;
  columns: Col[];
  layout: "list" | "board";
  mark?: "line" | "column" | "stale";
  keyboard?: boolean;
  buttons?: boolean;
  pick?: boolean;
  announce?: "words" | "ids" | "zero" | "none";
  /** Show the announcements as text too, for sighted readers. */
  log?: boolean;
  /** Show the live region as a visible line (for a status message). */
  visibleStatus?: boolean;
  frozen?: Drag;
};

export const grip =
  "flex size-8 shrink-0 cursor-grab touch-none select-none items-center justify-center rounded-md text-muted-foreground " +
  "hover:bg-accent hover:text-accent-foreground active:cursor-grabbing " +
  "outline-none focus-visible:outline-hidden focus-visible:ring-(length:--focus-ring-width) focus-visible:ring-ring " +
  "focus-visible:ring-offset-[length:var(--focus-ring-offset)] focus-visible:ring-offset-background";

const small =
  "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-input bg-background " +
  "text-foreground not-aria-disabled:hover:bg-accent not-aria-disabled:hover:text-accent-foreground aria-disabled:cursor-not-allowed aria-disabled:opacity-50 " +
  "outline-none focus-visible:outline-hidden focus-visible:ring-(length:--focus-ring-width) focus-visible:ring-ring " +
  "focus-visible:ring-offset-[length:var(--focus-ring-offset)] focus-visible:ring-offset-background";

function GripIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4" fill="currentColor">
      {[5, 11].flatMap((x) => [3, 8, 13].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.3" />))}
    </svg>
  );
}

function find(cols: Col[], id: string): Slot {
  for (let c = 0; c < cols.length; c++) {
    const i = cols[c].items.findIndex((it) => it.id === id);
    if (i >= 0) return { c, i };
  }
  return { c: 0, i: 0 };
}

function move(cols: Col[], id: string, to: Slot): Col[] {
  const from = find(cols, id);
  const item = cols[from.c].items[from.i];
  const next = cols.map((col) => ({ ...col, items: col.items.filter((it) => it.id !== id) }));
  next[to.c].items.splice(to.i, 0, item);
  return next;
}

/** Every place the held card could go, in reading order. */
function slotsOf(cols: Col[], id: string): Slot[] {
  return cols.flatMap((col, c) => {
    const n = col.items.filter((it) => it.id !== id).length;
    return Array.from({ length: n + 1 }, (_, i) => ({ c, i }));
  });
}

export function SpokenLog({ items, empty }: { items: string[]; empty?: string }) {
  return (
    <div aria-hidden="true" className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
      <p className="m-0 text-xs font-medium uppercase tracking-wide">What a screen reader is told</p>
      {items.length === 0 ? (
        <p className="m-0 mt-1 text-muted-foreground">{empty ?? "Nothing yet."}</p>
      ) : (
        <ol className="m-0 mt-1 list-none p-0 text-foreground">
          {items.map((l, i) => (
            <li key={i}>“{l}”</li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function DragDemo({
  title,
  columns,
  layout,
  mark = "line",
  keyboard = true,
  buttons = false,
  pick = false,
  announce = "none",
  log = false,
  visibleStatus = false,
  frozen,
}: DragDemoProps) {
  const [cols, setCols] = useState(columns);
  const [drag, setDrag] = useState<Drag | null>(frozen ?? null);
  const [said, setSaid] = useState("");
  const [heard, setHeard] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const start = useRef<{ id: string; x: number; y: number } | null>(null);
  const focusNext = useRef<string | null>(null);
  const dragRef = useRef<Drag | null>(drag);
  dragRef.current = drag;
  const colsRef = useRef(cols);
  colsRef.current = cols;
  const hintId = useId();

  const sayTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(sayTimer.current), []);
  // Empty first, so the same words are read again on a repeat.
  const say = (s: string) => {
    setSaid("");
    clearTimeout(sayTimer.current);
    sayTimer.current = setTimeout(() => setSaid(s), 50);
    if (log) setHeard((h) => [...h.slice(-3), s]);
  };

  // A card that moves to another column is a new element, so focus is put back.
  useEffect(() => {
    if (!focusNext.current) return;
    const el = root.current?.querySelector<HTMLElement>(focusNext.current);
    focusNext.current = null;
    el?.focus();
  }, [cols]);

  const where = (list: Col[], id: string, extra = 0) => {
    const s = find(list, id);
    return { s, n: list[s.c].items.length + extra, col: list[s.c] };
  };

  const words = (kind: "pick" | "move" | "drop" | "cancel", list: Col[], id: string, to: Slot) => {
    if (announce === "none") return "";
    const item = list.flatMap((c) => c.items).find((it) => it.id === id)!;
    const col = list[to.c];
    const home = find(list, id);
    const n = col.items.filter((it) => it.id !== id).length + 1;
    if (announce === "ids") {
      if (kind === "pick") return `Picked up draggable item ${item.code}.`;
      if (kind === "move") return `Draggable item ${item.code} was moved over droppable area ${col.code}.`;
      if (kind === "drop") return `Draggable item ${item.code} was dropped over droppable area ${col.code}.`;
      return `Dragging was cancelled. Draggable item ${item.code} was dropped.`;
    }
    const zero = announce === "zero";
    const place = (s: Slot, count: number) =>
      zero ? `index ${s.i}` : layout === "list" ? `position ${s.i + 1} of ${count}` : `${list[s.c].title}, ${s.i + 1} of ${count}`;
    if (kind === "pick") return `Picked up ${item.label}, ${place(home, list[home.c].items.length)}`;
    if (kind === "move") return `${item.label}, ${place(to, n)}`;
    if (kind === "drop") {
      const at = zero ? `at ${place(to, n)}` : layout === "list" ? `at ${place(to, n)}` : `in ${place(to, n)}`;
      return `Dropped ${item.label} ${at}`;
    }
    const back = zero || layout === "list" ? `at ${place(to, n)}` : `in ${place(to, n)}`;
    return `Move cancelled. ${item.label} is back ${back}`;
  };

  const finish = (d: Drag, dropped: boolean, refocus = true) => {
    const list = colsRef.current;
    const to = d.to;
    setDrag(null);
    start.current = null;
    focusNext.current = refocus ? `[data-handle="${d.id}"]` : null;
    if (dropped && to) {
      const next = move(list, d.id, to);
      setCols(next);
      if (announce !== "none") say(words("drop", next, d.id, find(next, d.id)));
    } else {
      // The card stays where it was. The cols effect puts focus back on the handle.
      setCols([...list]);
      if (announce !== "none") say(words("cancel", list, d.id, d.from));
    }
  };

  const cancel = (refocus = true) => {
    if (dragRef.current) finish(dragRef.current, false, refocus);
  };

  // Escape ends a pointer drag as well.
  useEffect(() => {
    if (drag?.by !== "pointer" || frozen) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") cancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag?.by, frozen]);

  const over = (x: number, y: number, id: string): Slot | null => {
    const colEls = [...(root.current?.querySelectorAll<HTMLElement>("[data-col]") ?? [])];
    for (let c = 0; c < colEls.length; c++) {
      const r = colEls[c].getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        const cards = [...colEls[c].querySelectorAll<HTMLElement>("[data-card]")].filter((el) => el.dataset.card !== id);
        const i = cards.filter((el) => {
          const b = el.getBoundingClientRect();
          return b.top + b.height / 2 < y;
        }).length;
        return { c, i };
      }
    }
    return null;
  };

  const onDown = (e: PointerEvent<HTMLButtonElement>, id: string) => {
    if (e.button !== 0 || frozen) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { id, x: e.clientX, y: e.clientY };
  };

  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    const s = start.current;
    if (!s || frozen) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    const d = dragRef.current;
    if (!d && Math.hypot(dx, dy) < 4) return;
    const from = d?.from ?? find(colsRef.current, s.id);
    const to = over(e.clientX, e.clientY, s.id);
    const seen = d?.seen ?? [];
    setDrag({
      id: s.id,
      from,
      to,
      by: "pointer",
      dx,
      dy,
      seen: to && !seen.includes(to.c) ? [...seen, to.c] : seen,
    });
  };

  const onUp = () => {
    const d = dragRef.current;
    start.current = null;
    if (d?.by === "pointer") finish(d, true);
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, id: string) => {
    if (!keyboard || frozen) return;
    const d = dragRef.current;
    const list = colsRef.current;
    if (e.repeat && (e.key === " " || e.key === "Enter")) {
      e.preventDefault();
      return;
    }
    if (!d) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        const from = find(list, id);
        setDrag({ id, from, to: from, by: "keyboard", dx: 0, dy: 0, seen: [from.c] });
        say(words("pick", list, id, from));
      }
      return;
    }
    if (d.by !== "keyboard" || d.id !== id) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const all = slotsOf(list, id);
      const at = Math.max(0, all.findIndex((s) => d.to && s.c === d.to.c && s.i === d.to.i));
      const to = all[Math.min(all.length - 1, Math.max(0, at + (e.key === "ArrowDown" ? 1 : -1)))];
      if (to.c === d.to?.c && to.i === d.to?.i) return;
      setDrag({ ...d, to, seen: d.seen.includes(to.c) ? d.seen : [...d.seen, to.c] });
      say(words("move", list, id, to));
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      finish(d, true);
    } else if (e.key === "Escape") {
      e.preventDefault();
      finish(d, false);
    }
  };

  const onBlur = (id: string) => {
    const d = dragRef.current;
    if (d?.by === "keyboard" && d.id === id) finish(d, false, false);
  };

  const step = (id: string, by: number) => {
    const list = colsRef.current;
    const { s, n, col } = where(list, id);
    const label = col.items[s.i].label;
    const i = s.i + by;
    if (i < 0 || i >= n) {
      say(`${label} is already ${by < 0 ? "first" : "last"}`);
      return;
    }
    const next = move(list, id, { c: s.c, i });
    setCols(next);
    say(`Moved ${label} ${by < 0 ? "up" : "down"}, position ${i + 1} of ${n}`);
  };

  const send = (id: string, c: number) => {
    const list = colsRef.current;
    const label = list[find(list, id).c].items.find((it) => it.id === id)!.label;
    const next = move(list, id, { c, i: list[c].items.length });
    setCols(next);
    setOpen(null);
    focusNext.current = `[data-pick="${id}"]`;
    say(`${label} moved to ${list[c].title}`);
  };

  const marked = (c: number) => {
    if (!drag?.to) return false;
    if (mark === "stale") return drag.seen.includes(c);
    return drag.to.c === c;
  };

  const list = (col: Col, c: number) => {
    const rows: React.ReactNode[] = [];
    let k = 0;
    const line = (key: string) => (
      <li key={key} role="presentation" aria-hidden="true" className="relative h-0">
        <span className="absolute inset-x-0 -top-1.25 z-30 h-0.5 rounded-full bg-primary" />
      </li>
    );
    const home = drag && drag.to && drag.to.c === drag.from.c && drag.to.i === drag.from.i;
    // A keyboard pick-up draws no line until the first arrow press, so it does not run into the held card.
    const showLine = (mark === "line" || (mark === "column" && drag?.by === "keyboard")) && drag?.to?.c === c && !(drag?.by === "keyboard" && home);
    col.items.forEach((it) => {
      const held = drag?.id === it.id;
      if (showLine && !held && drag?.to?.i === k) rows.push(line(`line${k}`));
      if (!held) k += 1;
      rows.push(
        <li
          key={it.id}
          data-card={it.id}
          style={held && drag?.by === "pointer" ? { transform: `translate(${drag.dx}px, ${drag.dy}px)` } : undefined}
          className={cn(
            "relative mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-border bg-card p-1.5 text-sm",
            held && "z-20 border-primary shadow-lg",
            held && drag?.by === "pointer" && "opacity-90",
          )}
        >
          <button
            type="button"
            aria-label={`Reorder ${it.label}`}
            aria-describedby={keyboard ? hintId : undefined}
            data-handle={it.id}
            data-focus={it.id}
            className={grip}
            onPointerDown={(e) => onDown(e, it.id)}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={() => cancel(false)}
            onKeyDown={(e) => onKey(e, it.id)}
            onBlur={() => onBlur(it.id)}
          >
            <GripIcon />
          </button>
          {pick ? (
            <button
              type="button"
              data-pick={it.id}
              aria-expanded={open === it.id}
              onClick={() => setOpen(open === it.id ? null : it.id)}
              className="h-8 min-w-0 flex-1 cursor-pointer rounded-md px-2 text-left font-medium hover:bg-accent focus-visible:outline-hidden focus-visible:ring-(length:--focus-ring-width) focus-visible:ring-ring"
            >
              {it.label}
            </button>
          ) : (
            <span className="min-w-0 flex-1 px-1 font-medium">{it.label}</span>
          )}
          {buttons && (
            <>
              <button type="button" aria-label={`Move ${it.label} up`} aria-disabled={col.items[0].id === it.id || undefined} onClick={() => step(it.id, -1)} className={small}>
                <ChevronDownIcon className="size-4 rotate-180" />
              </button>
              <button type="button" aria-label={`Move ${it.label} down`} aria-disabled={col.items[col.items.length - 1].id === it.id || undefined} onClick={() => step(it.id, 1)} className={small}>
                <ChevronDownIcon className="size-4" />
              </button>
            </>
          )}
          {pick && open === it.id && (
            <div
              role="group"
              aria-label={`Move ${it.label}`}
              className="flex basis-full flex-wrap gap-1.5 pl-1"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  setOpen(null);
                  root.current?.querySelector<HTMLElement>(`[data-pick="${it.id}"]`)?.focus();
                }
              }}
            >
              {cols.map((target, t) =>
                t === c ? null : (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => send(it.id, t)}
                    className="h-8 cursor-pointer rounded-md border border-input bg-background px-2.5 text-xs font-medium hover:bg-accent focus-visible:outline-hidden focus-visible:ring-(length:--focus-ring-width) focus-visible:ring-ring"
                  >
                    Move to {target.title}
                  </button>
                ),
              )}
            </div>
          )}
        </li>,
      );
    });
    if (showLine && drag?.to?.i === k) rows.push(line(`line${k}`));
    return rows;
  };

  const on = (c: number) => marked(c) && mark !== "line";

  return (
    <div ref={root} className="grid w-full max-w-md gap-3 rounded-lg border border-border bg-background p-4">
      <h4 className="m-0 text-base font-semibold">{title}</h4>
      {keyboard && (
        <p id={hintId} className="m-0 text-xs text-muted-foreground">
          Space picks up and drops the item, the up and down arrow keys move it, Escape cancels.
        </p>
      )}
      <div className="grid gap-2">
        {cols.map((col, c) => (
          <div
            key={col.id}
            data-col={col.id}
            className={cn(
              layout === "board" && "rounded-lg border p-2 pb-0",
              layout === "board" && !on(c) && "border-border",
              // A thicker, dashed border and a fill, kept apart from the focus ring. The padding gives back the extra pixel.
              on(c) && "border-2 border-dashed border-primary bg-primary/10 px-[7px] pt-[7px]",
            )}
          >
            {layout === "board" && <h5 className="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{col.title}</h5>}
            <ul aria-label={layout === "list" ? title : col.title} className="m-0 min-h-10 list-none p-0">
              {list(col, c)}
            </ul>
          </div>
        ))}
      </div>
      {log && <SpokenLog items={heard} empty="Nothing yet. Pick up an item with Space." />}
      <p role="status" className={visibleStatus ? "m-0 min-h-5 text-center text-sm text-muted-foreground" : "sr-only"}>
        {said}
      </p>
    </div>
  );
}
