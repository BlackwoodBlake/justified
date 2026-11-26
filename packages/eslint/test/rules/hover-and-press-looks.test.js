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
    // A box with a link stretched over it and a look, on the box, its group or the link.
    `<div className="relative cursor-pointer rounded-lg border hover:bg-accent active:shadow-inner"><h4><a href="/x" className="after:absolute after:inset-0">Atlas</a></h4></div>`,
    `<div className="group relative cursor-pointer rounded-lg border"><a href="/x" className="after:absolute after:inset-0 group-hover:underline">Atlas</a></div>`,
    `<li className="relative cursor-pointer"><a href="/x" className="after:absolute after:inset-0 hover:after:bg-accent/50">Atlas</a></li>`,
    // Not certain the link stretches over this box: no relative, no cursor-pointer, or a positioned box between.
    `<div className="cursor-pointer rounded-lg border"><a href="/x" className="after:absolute after:inset-0">Atlas</a></div>`,
    `<div className="relative rounded-lg border"><a href="/x" className="after:absolute after:inset-0">Atlas</a></div>`,
    `<div className="relative cursor-pointer"><div className="relative p-4"><a href="/x" className="after:absolute after:inset-0">Atlas</a></div></div>`,
    `<div className="relative cursor-pointer"><Header><a href="/x" className="after:absolute after:inset-0">Atlas</a></Header></div>`,
    `<div className="relative cursor-pointer"><a href="/x" className={linkClass}>Atlas</a></div>`,
    // Native buttons with a look, left to the browser, or whose look a child carries.
    `<button type="button" onClick={go} className="rounded-md border px-3 hover:bg-accent">Share</button>`,
    `<button type="button" onClick={go} className="rounded-md bg-primary px-3 active:bg-primary/80">Share</button>`,
    `<button type="button" onClick={go}>Share</button>`,
    `<button type="button" onClick={go} className="px-3 text-sm underline">Show more</button>`,
    `<button type="button" onClick={go} className="rounded-md border px-3"><span className="hover:underline">Share</span></button>`,
    `<button type="button" onClick={go} className="rounded-md border px-3"><Icon {...props} /></button>`,
    `<button type="button" onClick={go} className={cn("rounded-md border px-3", look)}>Share</button>`,
    `<div className="flex [&_button]:hover:bg-accent"><button type="button" onClick={go} className="rounded-md border px-3">Share</button></div>`,
    `<div className={cn("flex", toolbar)}><button type="button" onClick={go} className="rounded-md border px-3">Share</button></div>`,
    // A button that is off, or a picture of one with no handler.
    `<button type="button" onClick={go} disabled className="rounded-md border px-3">Share</button>`,
    `<button type="button" tabIndex={-1} className="rounded-md bg-accent px-3">Share</button>`,
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
    {
      // The card Don't, written out: a div with only a pointing cursor and a link stretched over it.
      code: `<div className="relative flex flex-col gap-1 rounded-lg border p-4 bg-card cursor-pointer"><h4 className="m-0 text-base"><a href="/projects/atlas" className="after:absolute after:inset-0">Atlas redesign</a></h4><p>12 tasks</p></div>`,
      errors: [{ messageId: "noLook", data: { name: "div" } }],
    },
    {
      code: `<li className="relative cursor-pointer border-b py-2"><Link href="/a" className="after:absolute after:inset-0">Atlas</Link></li>`,
      errors: [{ messageId: "noLook", data: { name: "li" } }],
    },
    {
      // A native button the code styles, with nothing under the pointer or the press.
      code: `<button type="button" onClick={download} className="inline-flex size-10 items-center justify-center rounded-md border cursor-pointer"><DownloadIcon /></button>`,
      errors: [{ messageId: "noLook", data: { name: "button" } }],
    },
    {
      code: `<button onClick={save} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Save</button>`,
      errors: [{ messageId: "noLook", data: { name: "button" } }],
    },
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
