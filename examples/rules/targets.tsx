import { useEffect, useState, type RefObject } from "react";

/*
 * Draws each pointer target inside a scene as a dashed box, and a 24 px circle
 * on the centre of each target smaller than 24 by 24, so the reader can see the
 * size and spacing test of ACT-006 (WCAG 2.2, 2.5.8). A small target passes
 * the spacing test when its circle touches no other target and no other
 * small target's circle.
 *
 * The scope must be positioned (relative). The drawing is hidden from
 * assistive technology and lets the pointer through.
 *
 * For the examples only. It is not a component of the system.
 */

const TARGETS = "button, a[href], input:not([type='hidden']), [data-target]";

type Box = { left: number; top: number; width: number; height: number };

export function TargetAreas({ scope, show }: { scope: RefObject<HTMLElement | null>; show: boolean }) {
  const [boxes, setBoxes] = useState<Box[]>([]);

  // A passive effect, not a layout effect: when the drawing sits inside its own
  // scope, a child's layout effect runs before the parent's ref is set.
  useEffect(() => {
    const root = scope.current;
    if (!show || !root) return;
    const measure = () => {
      const base = root.getBoundingClientRect();
      setBoxes(
        [...root.querySelectorAll(TARGETS)].map((el) => {
          const r = el.getBoundingClientRect();
          return { left: r.left - base.left, top: r.top - base.top, width: r.width, height: r.height };
        }),
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [scope, show]);

  if (!show) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {boxes.map((b, i) => (
        <div key={i}>
          <div className="absolute border border-dashed border-muted-foreground" style={b} />
          {/* The spacing test only applies to a target smaller than 24 by 24. */}
          {(b.width < 24 || b.height < 24) && (
            <div
              className="absolute size-6 rounded-full border-2 border-foreground"
              style={{ left: b.left + b.width / 2 - 12, top: b.top + b.height / 2 - 12 }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
