import rule from "../../rules/clickable-has-role.js";
import { run } from "../helpers.js";

/** A Next.js component with a router, around the given JSX. */
const next = (jsx, before = "") => `
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, X } from "lucide-react";

export function Loans({ book, onRenew }) {
  const router = useRouter();
  ${before}
  return (
    <>
      ${jsx}
    </>
  );
}`;

run("clickable-has-role", rule, {
  valid: [
    // Our Do: the title is a link, the actions are buttons.
    next(`<Card>
      <CardHeader><CardTitle><Link href={"/books/" + book.id}>{book.title}</Link></CardTitle></CardHeader>
      <CardFooter><Button onClick={onRenew}>Renew loan</Button></CardFooter>
    </Card>`),
    // A pointer shortcut: the card's click repeats the link inside.
    next(`<Card onClick={() => router.push("/books/" + book.id)} className="cursor-pointer">
      <CardHeader><CardTitle><Link href={"/books/" + book.id}>{book.title}</Link></CardTitle></CardHeader>
    </Card>`),
    // A card that holds another component, which may render the link.
    next(`<Card onClick={() => router.push("/books/" + book.id)}><BookTitle book={book} /></Card>`),
    // A wrapper that only stops propagation.
    next(`<Card onClick={(e) => e.stopPropagation()}><CardContent>Due back 3 December</CardContent></Card>`),
    // A hand-built control with a role.
    next(
      `<Card role="button" tabIndex={0} onClick={onRenew} onKeyDown={onRenew}><CardContent>Renew</CardContent></Card>`,
    ),
    // Spread props may bring the role.
    next(`<Badge {...props} onClick={onRenew}>New</Badge>`),
    // An icon inside a real button.
    next(`<Button size="icon" aria-label="Remove"><X onClick={onRemove} /></Button>`, "const onRemove = () => {};"),
    // The star as a Button with the icon inside.
    next(`<Button variant="outline" size="icon" aria-label="Add to wish list" onClick={onRenew}><Star /></Button>`),
    // Native elements are left to eslint-plugin-jsx-a11y.
    next(`<div onClick={onRenew}>Renew</div>`),
    next(`<span className="underline cursor-pointer" onClick={() => router.push("/fees")}>Late fees</span>`),
    next(`<a onClick={onRenew}>Renew loan</a>`),
    // A link that looks like a link and is one.
    next(`<Button variant="link" asChild><Link href="/branches">All branches</Link></Button>`),
    // Act, then move: a link-looking button that saves first, signs out, or searches.
    next(
      `<Button variant="link" onClick={async () => { await save(); router.push("/done"); }}>Save and close</Button>`,
    ),
    next(`<Button variant="link" onClick={() => router.push("/logout")}>Sign out</Button>`),
    next(
      `<Button variant="link" onClick={() => router.push("/search?q=" + query)}>Search</Button>`,
      'const [query] = useState("");',
    ),
    next(
      `<Button variant="link" onClick={() => router.push("/track/" + code)}>Track parcel</Button>`,
      'const [code, setCode] = useState("");',
    ),
    // A link-looking button that acts in place.
    next(`<Button variant="link" onClick={() => setOpen(true)}>Show details</Button>`),
    // router.back is going back in history, not to an address in code.
    next(`<Button variant="link" onClick={() => router.back()}>Back</Button>`),
    `import { useNavigate } from "react-router-dom";
    export function Back() {
      const navigate = useNavigate();
      return <Button variant="link" onClick={() => navigate(-1)}>Back</Button>;
    }`,
    // A navigate that is not from useNavigate is not traced.
    `export function A({ navigate }) { return <Button variant="link" onClick={() => navigate("/fees")}>Late fees</Button>; }`,
    // Triggers around real buttons, and without asChild.
    `export function T() { return <Dialog><DialogTrigger asChild><Button variant="outline">Share</Button></DialogTrigger></Dialog>; }`,
    `export function T() { return <Popover><PopoverTrigger>Open</PopoverTrigger></Popover>; }`,
    // A span with a role inside a trigger is a hand-built control.
    `export function T() { return <PopoverTrigger asChild><span role="button" tabIndex={0}>Open</span></PopoverTrigger>; }`,
    // Tooltip and hover card triggers are not on the list.
    `export function T() { return <TooltipTrigger asChild><span tabIndex={0}><Button disabled>Save</Button></span></TooltipTrigger>; }`,
    // shadcn pagination with an address.
    `export function P() { return <PaginationLink href="?page=2" onClick={track}>2</PaginationLink>; }`,
    `export function P() { return <PaginationLink href="#">2</PaginationLink>; }`,
    `export function B() { return <BreadcrumbLink asChild><Link href="/docs">Docs</Link></BreadcrumbLink>; }`,
  ],
  invalid: [
    // The Don't: the card has the click and nothing inside is a link.
    {
      code: next(`<Card onClick={() => router.push("/books/" + book.id)} className="cursor-pointer">
        <CardHeader><CardTitle>{book.title}</CardTitle><CardDescription>Due back 3 December</CardDescription></CardHeader>
      </Card>`),
      errors: [{ messageId: "noRole", data: { what: "Card" } }],
    },
    { code: next(`<Badge onClick={onRenew}>Overdue</Badge>`), errors: [{ messageId: "noRole" }] },
    {
      code: next(
        `<Avatar onClick={() => router.push("/profile")}><AvatarImage src="/me.png" alt="" /><AvatarFallback>CM</AvatarFallback></Avatar>`,
      ),
      errors: [{ messageId: "noRole", data: { what: "Avatar" } }],
    },
    // onClick straight on the lucide Star.
    {
      code: next(`<Star className="size-4 cursor-pointer" onClick={onRenew} />`),
      errors: [{ messageId: "noRole", data: { what: "icon" } }],
    },
    { code: `export function X() { return <StarIcon onClick={toggle} />; }`, errors: [{ messageId: "noRole" }] },
    // shadcn parts that render an <a> with no address.
    {
      code: `export function P() { return <PaginationLink onClick={() => setPage(2)}>2</PaginationLink>; }`,
      errors: [{ messageId: "noHref" }],
    },
    { code: `export function P() { return <PaginationNext onClick={next} />; }`, errors: [{ messageId: "noHref" }] },
    {
      code: `export function B() { return <BreadcrumbLink onClick={() => go("/docs")}>Docs</BreadcrumbLink>; }`,
      errors: [{ messageId: "noHref" }],
    },
    // The Don't: All branches as a link-looking button that navigates.
    {
      code: next(`<Button variant="link" onClick={() => router.push("/branches")}>All branches</Button>`),
      errors: [{ messageId: "scriptedLink" }],
    },
    {
      code: `import { useNavigate } from "react-router-dom";
      export function Fees() {
        const navigate = useNavigate();
        return <button type="button" className="underline text-primary" onClick={() => navigate("/fees")}>Late fees</button>;
      }`,
      errors: [{ messageId: "scriptedLink" }],
    },
    {
      code: next(
        `<Button variant="link" onClick={() => { window.location.href = "/branches"; }}>All branches</Button>`,
      ),
      errors: [{ messageId: "scriptedLink" }],
    },
    {
      code: next(`<Button variant="link" onClick={() => window.open("https://example.com/map")}>Map</Button>`),
      errors: [{ messageId: "scriptedLink" }],
    },
    // A handler declared in the file.
    {
      code: next(
        `<Button variant="link" onClick={goToBranches}>All branches</Button>`,
        'const goToBranches = () => router.push("/branches");',
      ),
      errors: [{ messageId: "scriptedLink" }],
    },
    // A trigger around something with no role.
    {
      code: `export function T() { return <Popover><PopoverTrigger asChild><span className="underline">Opening hours</span></PopoverTrigger></Popover>; }`,
      errors: [{ messageId: "triggerChild", data: { trigger: "PopoverTrigger", child: "span" } }],
    },
    {
      code: `export function T() { return <DropdownMenu><DropdownMenuTrigger asChild><Avatar><AvatarFallback>CM</AvatarFallback></Avatar></DropdownMenuTrigger></DropdownMenu>; }`,
      errors: [{ messageId: "triggerChild" }],
    },
    {
      code: `export function T() { return <DialogTrigger asChild><div className="card">Open</div></DialogTrigger>; }`,
      errors: [{ messageId: "triggerChild" }],
    },
  ],
});
