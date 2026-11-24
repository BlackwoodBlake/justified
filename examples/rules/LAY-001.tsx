import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Field } from "@blackwoodblake/justified-shadcn/field";
import { NativeSelect } from "@blackwoodblake/justified-shadcn/native-select";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * LAY-001: the page fits a 320-pixel viewport without sideways scrolling.
 *
 * A box stands in for a browser window 320, 480 or 768 px wide. The layout
 * inside it answers to the box with container queries, not to the real
 * window. When the box is wider than the room in the example frame, it is
 * drawn smaller to fit, so the real page never scrolls sideways. The box keeps
 * its own width for layout, so what happens inside it is what a window of
 * that width would show.
 *
 * The Don't is the same content with a minimum width of 768 px on the
 * wrapper, so at 320 and 480 it runs past the box edge and the box scrolls
 * sideways.
 */

const WIDTHS = [320, 480, 768] as const;
type Width = (typeof WIDTHS)[number];

const PRODUCTS = [
  { name: "Wool cardigan", price: "$89" },
  { name: "Beanie", price: "$24" },
  { name: "Mittens", price: "$19" },
];

/** Draws a box of the given width, scaled down if the frame is narrower. */
function Viewport({ width, children }: { width: Width; children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState<number>(width);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const measure = () => {
      setRoom(o.clientWidth);
      setHeight(i.offsetHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(o);
    observer.observe(i);
    return () => observer.disconnect();
  }, []);

  // The 1 px border on each side is the window's edge, outside its width.
  const outside = width + 2;
  const scale = room > 0 ? Math.min(1, room / outside) : 1;
  const percent = Math.round(scale * 100);

  return (
    <div className="flex w-full flex-col gap-1">
      <p className="m-0 text-sm font-medium text-foreground">
        Window {width} px wide
        {percent < 100 && (
          <span aria-hidden="true" className="font-normal text-muted-foreground">
            {" "}
            (drawn at {percent}% to fit)
          </span>
        )}
      </p>
      <div ref={outer} className="w-full overflow-hidden" style={{ height: height ? height * scale : undefined }}>
        <div
          ref={inner}
          data-testid="viewport"
          className="origin-top-left"
          style={{ width: outside, transform: scale < 1 ? `scale(${scale})` : undefined }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Shop({ fixedWidth }: { fixedWidth: boolean }) {
  const [width, setWidth] = useState<Width>(320);
  const [said, setSaid] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const add = (name: string) => {
    // Empty first, so adding the same item twice is announced twice.
    clearTimeout(timer.current);
    setSaid("");
    timer.current = setTimeout(() => setSaid(`${name} added to your bag.`), 50);
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <Field label="Width" className="w-40">
        <NativeSelect value={width} onChange={(e) => setWidth(Number(e.target.value) as Width)}>
          {WIDTHS.map((w) => (
            <option key={w} value={w}>
              {w} px
            </option>
          ))}
        </NativeSelect>
      </Field>

      <Viewport width={width}>
        <div data-testid="window" className="overflow-x-auto rounded-lg border border-border bg-background">
          <div className={`@container grid gap-4 p-4 ${fixedWidth ? "min-w-[768px]" : ""}`}>
            <h4 className="m-0 text-lg font-semibold">Winter knits</h4>
            <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 @min-[26rem]:grid-cols-2 @min-[40rem]:grid-cols-3">
              {PRODUCTS.map((p) => (
                <li key={p.name} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
                  <p className="m-0 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium">{p.name}</span>
                    <span className="tabular-nums">{p.price}</span>
                  </p>
                  <Button variant="outline" aria-label={`Add to bag, ${p.name}`} onClick={() => add(p.name)}>
                    Add to bag
                  </Button>
                </li>
              ))}
            </ul>
            <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm [overflow-wrap:anywhere]">
              <p className="m-0">Your last order is on its way.</p>
              <p className="m-0 mt-1">
                Tracking number <span className="font-mono">GB123456789012345678</span>
              </p>
              <p className="m-0 mt-1">
                Receipt: <span className="font-mono">winter-knits-order-receipt-2026-11-24.pdf</span>
              </p>
            </div>
          </div>
        </div>
      </Viewport>

      <Outcome>{said}</Outcome>
    </div>
  );
}

export const LAY001: RuleExamples = {
  id: "LAY-001",
  examples: [
    {
      kind: "do",
      title: "Cards reflow and long strings wrap",
      caption: (
        <>
          The box stands in for a narrow browser window. At 320 px the cards sit in one column and the long receipt name
          breaks onto a second line. Change <em>Width</em> to 480 for two columns or 768 for three. Nothing in the box
          ever scrolls sideways. On a phone the wider windows are drawn small to fit. The real test is your own browser,
          1280 px wide and zoomed to 400 percent.
        </>
      ),
      Demo: () => <Shop fixedWidth={false} />,
    },
    {
      kind: "dont",
      title: "A minimum width of 768 px",
      caption: (
        <>
          The same content, with a minimum width of 768 px on the page wrapper. At 320 px <em>Beanie</em> is cut off at
          the edge, <em>Mittens</em> is out of sight and so is the end of the receipt name. Scroll the box sideways, or
          Tab to the third <em>Add to bag</em>, to reach <em>Mittens</em>. At 768 px it fits.
        </>
      ),
      Demo: () => <Shop fixedWidth />,
    },
  ],
};
