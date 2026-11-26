import rule from "../../rules/act-with-button.js";
import { run } from "../helpers.js";

const wrap = (jsx, before = "") => `
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Episode({ episode, markPlayed, href }) {
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  ${before}
  return (
    <>
      ${jsx}
    </>
  );
}`;

run("act-with-button", rule, {
  valid: [
    // Our Do: buttons that look like links.
    wrap(`<Button variant="link" onClick={markPlayed}>Mark as played</Button>
      <Collapsible><CollapsibleTrigger asChild><Button variant="link">Show episode notes</Button></CollapsibleTrigger></Collapsible>
      <Dialog><DialogTrigger asChild><Button variant="link">Share episode</Button></DialogTrigger></Dialog>`),
    // A jump on the same page.
    wrap(`<Button variant="link" asChild><a href="#transcript">Jump to transcript</a></Button>`),
    wrap(`<a href="#transcript" onClick={(e) => { e.preventDefault(); setOpen(true); }}>Transcript</a>`),
    // href="#" whose handler only scrolls to the top.
    wrap(
      `<a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Back to top</a>`,
    ),
    wrap(`<a href="#" onClick={scrollToTop}>Back to top</a>`),
    wrap(`<a href="#top" onClick={() => setMenuOpen(false)}>Top</a>`),
    // A real link that also records the click or prefetches.
    wrap(`<a href="/episodes/42" onClick={() => track("episode")}>Episode 42</a>`),
    wrap(`<Link href="/episodes/42" onMouseEnter={() => router.prefetch("/episodes/42")}>Episode 42</Link>`),
    wrap(`<a href="tel:+46123456" onClick={() => track("call")}>Call us</a>`),
    // preventDefault, then go to the same address.
    wrap(`<a href={href} onClick={(e) => { e.preventDefault(); router.push(href); }}>Open</a>`),
    // A modifier-key check.
    wrap(
      `<a href={href} onClick={(e) => { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); setSelected(episode.id); }}>Open</a>`,
    ),
    // preventDefault only under a condition.
    wrap(`<a href={href} onClick={(e) => { if (dirty) e.preventDefault(); }}>Open</a>`),
    // A smooth scroll to the section it links to.
    wrap(
      `<a href="/guide#install" onClick={(e) => { e.preventDefault(); document.getElementById("install")?.scrollIntoView({ behavior: "smooth" }); }}>Install</a>`,
    ),
    // An unknown call may navigate.
    wrap(`<a href={href} onClick={(e) => { e.preventDefault(); openInPlayer(href); }}>Play</a>`, ""),
    // No href at all is ACT-009.
    wrap(`<a onClick={markPlayed}>Mark as played</a>`),
    // Spread props may bring the address or the handler.
    wrap(`<a href="#" {...props} onClick={markPlayed}>Mark</a>`),
    // href="#" with no click handler, as in shadcn's own pagination examples.
    `export function P() { return <PaginationLink href="#">2</PaginationLink>; }`,
    // Triggers around other things, and links outside triggers.
    wrap(`<HoverCard><HoverCardTrigger asChild><Button variant="link">@nextjs</Button></HoverCardTrigger></HoverCard>`),
    wrap(`<HoverCardTrigger asChild><a href="/u/nextjs">@nextjs</a></HoverCardTrigger>`),
    wrap(`<DropdownMenuItem asChild><Link href="/episodes">Episodes</Link></DropdownMenuItem>`),
    // Since the shadcn apps/v4 corpus.
    // A placeholder link that only cancels its address acts on nothing in place.
    `export const A = () => <a href="#" onClick={(e) => e.preventDefault()}>Learn more</a>;`,
  ],
  invalid: [
    {
      code: `export const A = () => <a href="#" onClick={(e) => { e.preventDefault(); setShareOpen(true); }}>Share</a>;`,
      errors: [{ messageId: "fakeHref" }],
    },
    // The Don'ts, with their values written out.
    {
      code: wrap(`<a href="#" onClick={(e) => { e.preventDefault(); setShareOpen(true) }}>Share episode</a>`),
      errors: [{ messageId: "fakeHref", data: { href: '"#"' } }],
    },
    { code: wrap(`<Link href="#" onClick={markPlayed}>Mark as played</Link>`), errors: [{ messageId: "fakeHref" }] },
    {
      code: wrap(`<a href="javascript:void(0)" onClick={remove}>Remove from queue</a>`),
      errors: [{ messageId: "fakeHref" }],
    },
    { code: wrap(`<a href="" onClick={remove}>Remove from queue</a>`), errors: [{ messageId: "fakeHref" }] },
    { code: wrap(`<a href={"#"} onClick={() => setShareOpen(true)}>Share</a>`), errors: [{ messageId: "fakeHref" }] },
    {
      code: wrap(
        `<DropdownMenu><DropdownMenuTrigger asChild><a href="#">Episode options</a></DropdownMenuTrigger></DropdownMenu>`,
      ),
      errors: [{ messageId: "triggerLink", data: { trigger: "DropdownMenuTrigger", child: "<a>" } }],
    },
    {
      code: wrap(`<DialogTrigger asChild><Link href="/share">Share</Link></DialogTrigger>`),
      errors: [{ messageId: "triggerLink" }],
    },
    // A real address cancelled to act in place.
    {
      code: wrap(
        `<a href="/episodes/42/share" onClick={(e) => { e.preventDefault(); setShareOpen(true); }}>Share episode</a>`,
      ),
      errors: [{ messageId: "cancelled" }],
    },
    {
      code: wrap(
        `<Link href={href} onClick={handleClick}>Notes</Link>`,
        "const handleClick = (e) => { e.preventDefault(); toggleNotes(); };",
      ),
      errors: [{ messageId: "cancelled" }],
    },
  ],
});
