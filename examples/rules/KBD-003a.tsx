import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@blackwoodblake/justified-shadcn/tooltip";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { Outcome, useSay } from "./dialog";
import type { RuleExamples } from "./frame";
import { altName, ItemKeys, Kbd, menuItemClass, PageFrame, RotateIcon } from "./shortcuts";

/*
 * KBD-003a: every shortcut can be found inside the product.
 *
 * Each example is a small page drawn inside its frame. Its handler hears keys
 * only while focus is inside the frame, so nothing listens on the real document
 * or window. The shortcuts here all use Alt or Ctrl, so KBD-003 does not apply;
 * the point is whether anyone can find them.
 *
 *   Do 1: the menu item shows Alt+A, aria-hidden, and gives it to aria-keyshortcuts.
 *   Do 2: an icon button's tooltip shows its name and keys, on focus as well as hover.
 *   Don't 1: Alt+A works, but nothing shows it.
 *   Don't 2: the keys are written into the button's name.
 *
 * The dashed line under each example is for sighted readers. It reads the name
 * the example sets (without aria-hidden text) and its aria-keyshortcuts.
 */

const ITEM = "button, [role='menuitem']";

/** The name an element gets from its content, leaving out aria-hidden text. */
function nameWithoutHidden(el: Element): string {
  const label = el.getAttribute("aria-label");
  if (label) return label.trim();
  const clone = el.cloneNode(true) as Element;
  clone.querySelectorAll("[aria-hidden='true']").forEach((n) => n.remove());
  return (clone.textContent ?? "").replace(/\s+/g, " ").trim();
}

/** Shows the name of the control under focus or the pointer, and the keys it gives to screen readers. */
function KeyReadout({ children, first }: { children: ReactNode; first: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [info, setInfo] = useState<{ name: string; keys: string }>({ name: "", keys: "" });

  const read = (el: Element) =>
    setInfo({ name: nameWithoutHidden(el), keys: el.getAttribute("aria-keyshortcuts") ?? "" });

  useLayoutEffect(() => {
    const el = [...(ref.current?.querySelectorAll(ITEM) ?? [])].find((b) => nameWithoutHidden(b).startsWith(first));
    if (el) read(el);
  }, [first]);

  const show = (target: EventTarget) => {
    const el = target instanceof Element ? target.closest(ITEM) : null;
    if (el && ref.current?.contains(el)) read(el);
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div ref={ref} onFocusCapture={(e) => show(e.target)} onPointerOverCapture={(e) => show(e.target)}>
        {children}
      </div>
      <p aria-hidden="true" className="m-0 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
        Accessible name: <span className="font-medium text-foreground">“{info.name}”</span>
        <br />
        Keys given to screen readers:{" "}
        <span className="font-medium text-foreground">{info.keys ? info.keys : "none"}</span>
      </p>
    </div>
  );
}

function PhotoMenu({ showKeys }: { showKeys: boolean }) {
  const [open, setOpen] = useState(true);
  const [added, setAdded] = useState(0);
  const [said, say] = useSay();
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const focusOnOpen = useRef(false);

  useEffect(() => {
    if (open && focusOnOpen.current) {
      menu.current?.querySelector<HTMLElement>("[role='menuitem']")?.focus();
      focusOnOpen.current = false;
    }
  }, [open]);

  const addToAlbum = (how: string) => {
    setAdded((n) => n + 1);
    say(`${how} added the photo to the album Summer 2025.`);
  };

  const items = () => [...(menu.current?.querySelectorAll<HTMLElement>("[role='menuitem']") ?? [])];

  return (
    <KeyReadout first="Add to album">
      <div className="flex flex-col items-center gap-3">
        <PageFrame
          label={showKeys ? "Photo library, example page" : "Photo library, example page without listed keys"}
          onKeyDown={(e) => {
            if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === "KeyA") {
              e.preventDefault();
              addToAlbum("Alt+A");
            }
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="m-0 font-medium">IMG_2041</p>
            <Button
              ref={trigger}
              variant="outline"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => {
                focusOnOpen.current = !open;
                setOpen(!open);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (open) items()[0]?.focus();
                  else {
                    focusOnOpen.current = true;
                    setOpen(true);
                  }
                }
              }}
            >
              Photo actions
            </Button>
          </div>
          {open && (
            <div
              ref={menu}
              role="menu"
              aria-label="Photo actions"
              className="grid gap-0.5 rounded-md border border-border bg-popover p-1 text-popover-foreground"
              onKeyDown={(e) => {
                const list = items();
                const i = list.indexOf(document.activeElement as HTMLElement);
                if (e.key === "ArrowDown") list[(i + 1) % list.length]?.focus();
                else if (e.key === "ArrowUp") list[(i - 1 + list.length) % list.length]?.focus();
                else if (e.key === "Home") list[0]?.focus();
                else if (e.key === "End") list[list.length - 1]?.focus();
                else if (e.key === "Escape") {
                  e.stopPropagation();
                  setOpen(false);
                  trigger.current?.focus();
                  return;
                } else return;
                e.preventDefault();
              }}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null) && e.relatedTarget !== trigger.current) setOpen(false);
              }}
            >
              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                aria-keyshortcuts={showKeys ? "Alt+A" : undefined}
                className={menuItemClass}
                onClick={() => {
                  addToAlbum("The menu item");
                  setOpen(false);
                  trigger.current?.focus();
                }}
              >
                Add to album
                {showKeys && <ItemKeys>{altName()}+A</ItemKeys>}
              </button>
              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                className={menuItemClass}
                onClick={() => {
                  say("Download would start here.");
                  setOpen(false);
                  trigger.current?.focus();
                }}
              >
                Download
              </button>
            </div>
          )}
          <p className="m-0 text-xs text-muted-foreground">Photos in Summer 2025: {3 + added}</p>
        </PageFrame>
        <Outcome>{said}</Outcome>
      </div>
    </KeyReadout>
  );
}

function RotateButton() {
  const [turns, setTurns] = useState(0);
  const [said, say] = useSay();

  return (
    <TooltipProvider>
      <KeyReadout first="Rotate left">
        <div className="flex flex-col items-center gap-3">
          <PageFrame
            label="Photo editor, example page"
            onKeyDown={(e) => {
              if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === "KeyL") {
                e.preventDefault();
                setTurns((t) => t + 1);
                say("Alt+L rotated the photo left.");
              }
            }}
          >
            <div className="flex items-center gap-3 pb-12">
              <Tooltip defaultOpen>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Rotate left"
                    aria-keyshortcuts="Alt+L"
                    onClick={() => {
                      setTurns((t) => t + 1);
                      say("The button rotated the photo left.");
                    }}
                  >
                    <RotateIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" collisionPadding={16}>
                  Rotate left ({altName()}+L)
                </TooltipContent>
              </Tooltip>
              <div
                aria-hidden="true"
                className="grid size-14 place-items-center rounded-md border border-border bg-muted text-xs text-muted-foreground motion-safe:transition-transform motion-safe:duration-(--motion-duration-fast)"
                style={{ transform: `rotate(${-90 * turns}deg)` }}
              >
                Photo
              </div>
            </div>
          </PageFrame>
          <Outcome>{said}</Outcome>
        </div>
      </KeyReadout>
    </TooltipProvider>
  );
}

function SearchButton() {
  const [said, say] = useSay();

  return (
    <KeyReadout first="Search">
      <div className="flex flex-col items-center gap-3">
        <PageFrame
          label="Mailbox, example page"
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "k") {
              e.preventDefault();
              say(`${e.metaKey ? "Cmd" : "Ctrl"}+K opened search.`);
            }
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="m-0 font-medium">Inbox</p>
            <Button variant="outline" onClick={() => say("The button opened search.")}>
              Search <span className="text-muted-foreground">Ctrl K</span>
            </Button>
          </div>
        </PageFrame>
        <Outcome>{said}</Outcome>
      </div>
    </KeyReadout>
  );
}

export const KBD003a: RuleExamples = {
  id: "KBD-003a",
  examples: [
    {
      kind: "do",
      title: "The menu item shows its keys",
      caption: (
        <>
          The menu item <em>Add to album</em> shows <Kbd>Alt</Kbd>+<Kbd>A</Kbd> at its end, in text hidden from screen
          readers, so the item's name stays “Add to album”. The keys go to screen readers through{" "}
          <code>aria-keyshortcuts</code>, as the line under the frame shows. Click inside the frame, then press{" "}
          <Kbd>Alt</Kbd>+<Kbd>A</Kbd>: the shortcut works, and the menu item does the same. The keys are matched on the
          physical key, so Option works on a Mac.
        </>
      ),
      Demo: () => <PhotoMenu showKeys />,
    },
    {
      kind: "do",
      title: "A tooltip with the name and keys",
      caption: (
        <>
          The icon button is named <em>Rotate left</em>, and its tooltip adds the keys: “Rotate left (Alt+L)”. The
          tooltip opens when the button gets keyboard focus as well as on hover, so Tab to the button, or click inside
          the frame and press <Kbd>Alt</Kbd>+<Kbd>L</Kbd> to rotate the photo. The keys are not part of the button's
          name. On a Mac the tooltip and the menu item show Option, the key's name there.
        </>
      ),
      Demo: RotateButton,
    },
    {
      kind: "dont",
      title: "A shortcut that is shown nowhere",
      caption: (
        <>
          The same photo page, with the same shortcut, <Kbd>Alt</Kbd>+<Kbd>A</Kbd>, but the menu item shows nothing and
          gives screen readers nothing. Click inside the frame and press <Kbd>Alt</Kbd>+<Kbd>A</Kbd>: it works, but
          nothing in the page ever told you that it would.
        </>
      ),
      Demo: () => <PhotoMenu showKeys={false} />,
    },
    {
      kind: "dont",
      title: "The keys written into the button's name",
      caption: (
        <>
          The button reads “Search Ctrl K”, so its accessible name carries the keys. Someone using voice control has to
          say “Search Ctrl K” to press it, and a screen reader reads the keys as part of the name. Click inside the
          frame and press <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd> to try the shortcut. The keys belong in a separate element that
          is hidden from assistive technology, with <code>aria-keyshortcuts</code> beside it.
        </>
      ),
      Demo: SearchButton,
    },
  ],
};
