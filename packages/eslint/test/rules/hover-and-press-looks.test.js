import rule from "../../rules/hover-and-press-looks.js";
import { run } from "../helpers.js";

const noLook = [{ messageId: "noLook" }];
const stripped = [{ messageId: "stripped" }];
const offReacts = [{ messageId: "offReacts" }];

run("hover-and-press-looks", rule, {
  valid: [
    // The VIS-008 Do, written out: a card with a link stretched over it, and its looks.
    `<Card className="relative hover:bg-accent hover:text-accent-foreground active:shadow-inner">
      <h4><a href="/projects/atlas" className="after:absolute after:inset-0">Atlas redesign</a></h4>
    </Card>`,
    `<Card onClick={open} className="cursor-pointer transition-colors hover:bg-accent active:bg-accent/80">Atlas</Card>`,
    `<li onClick={pick} className="rounded-md px-2 py-1 hover:bg-accent active:bg-accent/80">Plants</li>`,
    `<tr onClick={() => openOrder(o.id)} className="border-b hover:bg-muted/50">{cells}</tr>`,
    // Looks through a group, has-[], or a link that carries the look.
    `<Card onClick={open} className="group"><h4 className="group-hover:underline">Atlas</h4></Card>`,
    `<Card className="has-[a:hover]:bg-accent relative"><a href="/x" className="after:absolute after:inset-0">Atlas</a></Card>`,
    `<Link href="/projects/atlas" className="block rounded-lg hover:bg-accent"><Card>Atlas</Card></Link>`,
    `<Card className="relative"><a href="/x" className="after:absolute after:inset-0 hover:after:bg-accent/50">Atlas</a></Card>`,
    // A card with no link and no handler: a static panel.
    `<Card><CardHeader><CardTitle>Revenue</CardTitle></CardHeader></Card>`,
    `<Link href="/a"><Card>Atlas</Card><span>More</span></Link>`,
    // Class lists the code does not state in full, or the caller's className.
    `<div onClick={pick} className={cn(itemStyles, "px-2")} />`,
    `function Row({ className, ...props }) { return <div onClick={props.onClick} className={cn("flex", className)} />; }`,
    `<div onClick={pick} {...props} className="flex" />`,
    // A div with no class is not read; a handler that only stops the event.
    `<div onClick={pick}>Row</div>`,
    `<div className="flex gap-2" onClick={(e) => e.stopPropagation()}><Button>Edit</Button></div>`,
    // A div that only catches its children's clicks, not drawn as one target.
    `<div ref={scope} onClick={onClick} className="rounded-lg border border-border bg-background p-4">{children}</div>`,
    // A backdrop is a whole container.
    `<div className="fixed inset-0 z-50 bg-black/50" onClick={close} />`,
    `<div className="absolute inset-0" onClick={close} />`,
    // hover:bg-transparent with another look in its place, or on a link button.
    `<Button variant="ghost" className="hover:bg-transparent hover:text-foreground">More</Button>`,
    `<Button variant="ghost" className="hover:bg-transparent hover:underline">Terms</Button>`,
    `<Button variant="link" className="hover:bg-transparent">Terms</Button>`,
    `<Button variant="ghost" className={cn(big && "hover:bg-transparent")}>More</Button>`,
    `<DropdownMenuItem className="focus:bg-transparent focus:text-primary">Rename</DropdownMenuItem>`,
    // An off control whose looks are scoped, or overridden.
    `<Button variant="ghost" size="icon" aria-disabled="true" className="not-aria-disabled:hover:bg-accent not-aria-disabled:active:bg-accent/80" aria-label="Rename"><PencilIcon /></Button>`,
    `<button aria-disabled={locked} className="hover:bg-accent aria-disabled:pointer-events-none">Rename</button>`,
    `<button aria-disabled={locked} className="hover:bg-accent aria-disabled:hover:bg-transparent">Rename</button>`,
    `<button aria-disabled="false" className="hover:bg-accent">Rename</button>`,
    `<button disabled={locked} aria-disabled={locked} className="hover:bg-accent disabled:pointer-events-none">Rename</button>`,
    `<a aria-disabled={locked} className="[&:not([aria-disabled=true])]:hover:underline">Rename</a>`,
  ],
  invalid: [
    // The VIS-008 Don'ts, written out.
    { code: `<Card onClick={() => openProject("atlas")} className="cursor-pointer">Atlas redesign</Card>`, errors: noLook },
    { code: `<Card onClick={() => openProject("atlas")}>Atlas redesign</Card>`, errors: noLook },
    { code: `<div onClick={() => select(row.id)} className="flex cursor-pointer items-center gap-2 p-2">{row.name}</div>`, errors: noLook },
    { code: `<div role="button" tabIndex={0} onClick={open} className="rounded-md border p-3">Atlas</div>`, errors: noLook },
    { code: `<li onClick={() => pick(o)} className="px-2 py-1.5 text-sm">{o.label}</li>`, errors: noLook },
    { code: `<tr onClick={() => openOrder(o.id)} className="border-b">{cells}</tr>`, errors: noLook },
    { code: `<Link href="/projects/atlas"><Card>Atlas</Card></Link>`, errors: noLook },
    { code: `<Card className="relative"><a href="/x" className="after:absolute after:inset-0">Atlas</a></Card>`, errors: noLook },
    { code: `<Button variant="ghost" className="hover:bg-transparent">More</Button>`, errors: stripped },
    { code: `<Button variant="ghost" className="px-0 hover:bg-transparent hover:cursor-pointer">More</Button>`, errors: stripped },
    { code: `<CommandItem className="data-[selected=true]:bg-transparent">Calendar</CommandItem>`, errors: stripped },
    { code: `<DropdownMenuItem className="focus:bg-transparent">Rename</DropdownMenuItem>`, errors: stripped },
    {
      code: `<DropdownMenuItem aria-disabled="true" className="hover:bg-accent active:bg-accent/80">Rename</DropdownMenuItem>`,
      errors: offReacts,
    },
    { code: `<button aria-disabled={locked} className="rounded-md hover:bg-accent">Rename</button>`, errors: offReacts },
  ],
});
