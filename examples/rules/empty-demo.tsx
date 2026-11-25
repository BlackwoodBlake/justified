import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

/*
 * Small pieces shared by the examples for STA-002a, STA-002b and STA-003.
 * For the examples only. They are not components of the system.
 *
 *   Spinner        a small working sign, still when reduced motion is asked for.
 *   DemoTable      plain table markup, with a visible-or-hidden header row.
 *   EmptyState     the message that fills a space with nothing in it.
 *   Announced      shows what an example writes into a live region. It sees only
 *                  the roles the example sets and the text written into them. It
 *                  is not a screen reader and is hidden from assistive technology.
 *   useFetch       a pretend request: answers after a wait, can return rows,
 *                  nothing, or fail. It also tells when the wait has passed half
 *                  a second, the point where STA-001 starts to show it.
 */

export const focusRing =
  "outline-none focus-visible:outline-hidden focus-visible:ring-(length:--focus-ring-width) focus-visible:ring-ring " +
  "focus-visible:ring-offset-[length:var(--focus-ring-offset)] focus-visible:ring-offset-background";

export function Spinner({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} shrink-0 motion-safe:animate-spin`} fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** A plain table. `head` are the column titles; a title given as `{ hidden }` is read but not seen. */
export function DemoTable({
  labelledBy,
  head,
  busy,
  dim,
  className = "",
  children,
}: {
  labelledBy: string;
  head: (string | { hidden: string })[];
  busy?: boolean;
  /**
   * Dim the rows, not the header, so the header keeps its contrast. Only for rows in
   * `foreground` text: muted text falls below 4.5:1 at 70 %. Dim only once the wait has
   * passed half a second, never from the first moment.
   */
  dim?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table
        aria-labelledby={labelledBy}
        aria-busy={busy ? true : undefined}
        className={`w-full border-collapse text-sm ${dim ? "[&_tbody]:opacity-70 [&_tbody]:transition-opacity motion-reduce:[&_tbody]:transition-none" : ""}`}
      >
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            {head.map((h, i) => (
              <th key={i} scope="col" className="py-2 pr-3 font-medium last:pr-0">
                {typeof h === "string" ? h : <span className="sr-only">{h.hidden}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export const cell = "py-2 pr-3 align-middle last:pr-0";
export const rowLine = "border-b border-border last:border-0";

/** The message in a space that holds nothing. The heading takes focus when it is given a ref. */
export function EmptyState({
  heading,
  headingRef,
  children,
  actions,
}: {
  heading?: string;
  headingRef?: RefObject<HTMLHeadingElement | null>;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="grid justify-items-center gap-2 rounded-md border border-dashed border-border px-4 py-6 text-center">
      {heading && (
        <h5 ref={headingRef} tabIndex={-1} className={`m-0 rounded-sm text-base font-semibold ${focusRing}`}>
          {heading}
        </h5>
      )}
      <p className="m-0 max-w-xs text-sm text-muted-foreground">{children}</p>
      {actions && <div className="mt-1 flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>
  );
}

const LIVE = "[role='status'], [role='alert'], [role='log'], [aria-live='polite'], [aria-live='assertive']";

/** Shows whether the line is a live region, and the last text it marked for announcement. */
export function Announced({ target, plainName = "a plain line" }: { target: RefObject<HTMLElement | null>; plainName?: string }) {
  const [live, setLive] = useState<boolean | null>(null);
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    setLive(Boolean(el.closest(LIVE)));
    const observer = new MutationObserver(() => {
      const words = (el.textContent ?? "").replace(/\s+/g, " ").trim();
      if (el.closest(LIVE) && words) setText(words);
    });
    observer.observe(el, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [target]);

  return (
    <div aria-hidden="true" className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
      <p className="m-0">
        The line is <span className="font-medium text-foreground">{live === false ? plainName : "a status region"}</span>
      </p>
      <p className="m-0">
        Sent to the live region:{" "}
        <span className="font-medium text-foreground">
          {text !== null ? `“${text}”` : live === false ? "nothing, it is not a live region" : "nothing yet"}
        </span>
      </p>
    </div>
  );
}

/** Move focus once the next paint has put the target in place. */
export function focusSoon(ref: RefObject<HTMLElement | null>) {
  setTimeout(() => ref.current?.focus(), 0);
}

export type Phase = "pending" | "success" | "error";

/**
 * A pretend request. `resolve` gives the rows for a key, or null for a failure.
 * The reply comes after `delay` ms; `slow` turns true after half a second.
 * `load(key, keep)` keeps the old rows while the new ones come when `keep` is true.
 */
export function useFetch<T>({
  resolve,
  initial,
  delay = 2000,
}: {
  resolve: (key: string) => T[] | null;
  initial?: T[];
  delay?: number;
}) {
  const [phase, setPhase] = useState<Phase>("pending");
  const [slow, setSlow] = useState(false);
  const [data, setData] = useState<T[] | undefined>(initial);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const resolveRef = useRef(resolve);
  resolveRef.current = resolve;

  const stop = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => stop, []);

  const load = useCallback(
    (key: string, keep = true) => {
      stop();
      setPhase("pending");
      setSlow(false);
      if (!keep) setData([]);
      timers.current.push(setTimeout(() => setSlow(true), 500));
      timers.current.push(
        setTimeout(() => {
          const rows = resolveRef.current(key);
          setSlow(false);
          if (rows === null) {
            setPhase("error");
            if (!keep) setData(undefined);
          } else {
            setData(rows);
            setPhase("success");
          }
        }, delay),
      );
    },
    [delay],
  );

  return { phase, slow, data, load };
}
