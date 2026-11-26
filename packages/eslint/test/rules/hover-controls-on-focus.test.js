import rule from "../../rules/hover-controls-on-focus.js";
import { run } from "../helpers.js";

const hoverOnly = [{ messageId: "hoverOnly" }];

/** A booking row whose actions sit in an element with these classes. */
const row = (classes) => `
<TableRow className="group">
  <TableCell>Leeds, 4 December</TableCell>
  <TableCell>
    <div className="${classes}">
      <Button variant="outline" size="sm">Change</Button>
      <Button variant="outline" size="sm">Cancel booking</Button>
    </div>
  </TableCell>
</TableRow>`;

run("hover-controls-on-focus", rule, {
  valid: [
    // The KBD-001 and TBL-003 Do: shown on focus as well.
    row("flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"),
    row("hidden gap-1 group-hover:flex group-focus-within:flex"),
    `<Button className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">Assign</Button>`,
    `<div className="invisible group-hover:visible focus-within:visible"><button>Copy link</button></div>`,
    // Always shown.
    row("flex gap-1"),
    // Hover reveal of something that holds no control: decoration, not a control.
    `<div className="group relative"><img src="/a.jpg" alt="Allotment" /><span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100" /></div>`,
    `<span className="hidden group-hover:inline text-muted-foreground">Updated today</span>`,
    // Hidden at a size, not by hover.
    `<nav className="hidden md:flex"><a href="/a">Plans</a></nav>`,
    // The only control is out of the Tab order already.
    `<div className="opacity-0 group-hover:opacity-100"><button tabIndex={-1}>Copy</button></div>`,
    // Hiding only in a branch, as a shared component may do for one caller.
    `<div className={cn("flex gap-1", hoverOnly && "opacity-0 group-hover:opacity-100")}><Button>Change</Button></div>`,
    `<Button className={shown}>Assign</Button>`,
    `<Button className={reveal === "focus" ? "opacity-0 group-hover:opacity-100 focus-visible:opacity-100" : "opacity-0 group-hover:opacity-100"}>Assign</Button>`,
    // Class lists the code does not state in full, and spreads.
    `<div className={cn("opacity-0 group-hover:opacity-100", revealClass)}><Button>Change</Button></div>`,
    `<div {...props} className="opacity-0 group-hover:opacity-100"><Button>Change</Button></div>`,
  ],
  invalid: [
    // The KBD-001 Don't, written out: actions on hover only.
    { code: row("flex gap-1 opacity-0 group-hover:opacity-100"), errors: hoverOnly },
    { code: row("hidden gap-1 group-hover:flex"), errors: hoverOnly },
    { code: row("invisible group-hover:visible"), errors: hoverOnly },
    { code: row("flex opacity-0 transition-opacity group-hover/row:opacity-100"), errors: hoverOnly },
    // On the control itself.
    {
      code: `<Button variant="ghost" size="icon" aria-label="Delete note" className="opacity-0 hover:opacity-100"><Trash2 /></Button>`,
      errors: hoverOnly,
    },
    { code: `<a href="/edit" className="ml-2 hidden text-sm group-hover:inline-flex">Edit</a>`, errors: hoverOnly },
    // A touch-screen class alone does not help a keyboard on a desktop.
    {
      code: `<Button className="opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100">Assign</Button>`,
      errors: hoverOnly,
    },
    // Responsive variants are ignored when matching.
    {
      code: `<div className="sm:opacity-0 sm:group-hover:opacity-100"><button>Copy link</button></div>`,
      errors: hoverOnly,
    },
    // Both sides of a branch hide it.
    {
      code: `<div className={dense ? "opacity-0 group-hover:opacity-100 gap-1" : "opacity-0 group-hover:opacity-100 gap-2"}><Button>Change</Button></div>`,
      errors: hoverOnly,
    },
    // Through cn with literals only.
    {
      code: `<div className={cn("flex gap-1", "opacity-0 group-hover:opacity-100")}><DropdownMenuTrigger asChild><Button>More</Button></DropdownMenuTrigger></div>`,
      errors: hoverOnly,
    },
  ],
});
