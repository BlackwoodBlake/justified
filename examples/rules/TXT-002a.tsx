import { Button } from "@blackwoodblake/justified-shadcn/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@blackwoodblake/justified-shadcn/hover-card";
import { LinkIcon } from "@blackwoodblake/justified-shadcn/icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@blackwoodblake/justified-shadcn/tooltip";
import { useEffect, useState, type ComponentType, type MouseEvent, type ReactNode } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";

/*
 * TXT-002a: content that opens on hover or focus can be closed without
 * moving, can be hovered, and stays.
 *
 * Both examples show a comment thread. Each author's name is a link to the
 * profile and opens a card on hover and on focus, and each comment has a
 * Copy link button with a tooltip. The Do uses the adapter's HoverCard and
 * Tooltip unchanged, as the rule asks readers to check them. The Don't keeps
 * the same tooltip but draws its own card, 12 px below the name, that closes
 * the moment the pointer leaves the name. Escape and focus still work in the
 * Don't, so the gap is its only fault.
 */

type Person = { name: string; role: string; slug: string };

const priya: Person = { name: "Priya Shah", role: "Product designer, Payments team", slug: "priya-shah" };
const leon: Person = { name: "Leon Park", role: "Engineer, Payments team", slug: "leon-park" };

const link = "rounded-sm font-medium text-primary underline underline-offset-4 hover:decoration-2";

function CardBody({ person }: { person: Person }) {
  return (
    <>
      <span className="m-0 block font-medium">{person.name}</span>
      <span className="m-0 block text-muted-foreground">{person.role}</span>
    </>
  );
}

type AuthorProps = { person: Person; onOpenProfile: (e: MouseEvent, p: Person) => void };

/* The Do: shadcn's hover card, flush against the name. */
function FlushAuthor({ person, onOpenProfile }: AuthorProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <a href={`#${person.slug}`} className={link} onClick={(e) => onOpenProfile(e, person)}>
          {person.name}
        </a>
      </HoverCardTrigger>
      <HoverCardContent align="start" sideOffset={0}>
        <CardBody person={person} />
      </HoverCardContent>
    </HoverCard>
  );
}

/* The Don't: a hand-made card with a gap. It closes as soon as the pointer leaves the name. */
function GapAuthor({ person, onOpenProfile }: AuthorProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <span className="relative">
      <a
        href={`#${person.slug}`}
        className={link}
        onClick={(e) => onOpenProfile(e, person)}
        onPointerEnter={(e) => e.pointerType !== "touch" && setOpen(true)}
        onPointerLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {person.name}
      </a>
      {open && (
        <span
          data-gap-card=""
          className="absolute top-[calc(100%+12px)] left-0 z-10 block w-64 rounded-md border border-border bg-popover p-4 text-sm font-normal text-popover-foreground shadow-md"
        >
          <CardBody person={person} />
        </span>
      )}
    </span>
  );
}

function CopyLink({ onCopy }: { onCopy: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Copy link" onClick={onCopy}>
          <LinkIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Copy link</TooltipContent>
    </Tooltip>
  );
}

function Comment({
  author,
  when,
  children,
  onCopy,
}: {
  author: ReactNode;
  when: string;
  children: ReactNode;
  onCopy: () => void;
}) {
  return (
    <li className="flex items-start gap-2 border-b border-border py-3 first:pt-0 last:border-0 last:pb-0">
      <div className="min-w-0 flex-1 text-sm">
        <p className="m-0">
          {author} <span className="text-muted-foreground">{when}</span>
        </p>
        <p className="mt-1 mb-0">{children}</p>
      </div>
      <CopyLink onCopy={onCopy} />
    </li>
  );
}

function Thread({ Author }: { Author: ComponentType<AuthorProps> }) {
  const [said, setSaid] = useState("");
  const say = (s: string) => {
    setSaid("");
    setTimeout(() => setSaid(s), 50);
  };
  const openProfile = (e: MouseEvent, p: Person) => {
    e.preventDefault();
    say(`${p.name}'s profile would open here.`);
  };
  const copy = (p: Person) => () =>
    say(`Link to ${p.name}'s comment copied. (In this example nothing goes to your clipboard.)`);

  return (
    <TooltipProvider>
      <div className="flex w-full max-w-sm flex-col items-center gap-3">
        <div className="w-full rounded-lg border border-border bg-background p-4">
          <h4 className="m-0 mb-3 text-base font-semibold">Comments on Checkout redesign</h4>
          <ul className="m-0 list-none p-0">
            <Comment
              author={<Author person={priya} onOpenProfile={openProfile} />}
              when="2 hours ago"
              onCopy={copy(priya)}
            >
              The new card form saves a step. Can we test it with five customers this week?
            </Comment>
            <Comment
              author={<Author person={leon} onOpenProfile={openProfile} />}
              when="1 hour ago"
              onCopy={copy(leon)}
            >
              Yes. I can have a build ready by Wednesday.
            </Comment>
          </ul>
        </div>
        <Outcome>{said}</Outcome>
      </div>
    </TooltipProvider>
  );
}

export const TXT002a: RuleExamples = {
  id: "TXT-002a",
  examples: [
    {
      kind: "do",
      title: "The card can be reached and closed with Escape",
      caption: (
        <>
          Rest the pointer on <em>Priya Shah</em>: a card opens flush against her name. Move the pointer onto the card:
          it stays as long as you rest there. Tab to a name and press Escape: the card closes and focus stays on the
          name. Tab on and it closes too. On <em>Copy link</em>, Escape hides the tooltip and Enter still copies.
        </>
      ),
      Demo: () => <Thread Author={FlushAuthor} />,
    },
    {
      kind: "dont",
      title: "A gap that closes the card on the way",
      caption: (
        <>
          Rest the pointer on <em>Priya Shah</em>: a card opens 12 pixels below her name. Move the pointer down to read
          it: the card closes as soon as the pointer leaves the name, so it can never be reached. Escape and Tab close
          it as they should; the gap is the fault.
        </>
      ),
      Demo: () => <Thread Author={GapAuthor} />,
    },
  ],
};
