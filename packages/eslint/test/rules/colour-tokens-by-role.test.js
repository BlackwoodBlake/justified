import rule from "../../rules/colour-tokens-by-role.js";
import { run } from "../helpers.js";

const rawPalette = [{ messageId: "rawPalette" }];
const wrongFill = [{ messageId: "wrongFill" }];
const fieldEdge = (output) => [
  { messageId: "fieldEdge", suggestions: output ? [{ messageId: "suggestBorderInput", output }] : [] },
];
const ringSelection = [{ messageId: "ringSelection" }];

/** Code as shadcn's own components write it, which must pass. */
const upstream = [
  // Dialog close button: muted-foreground on the accent fill when open.
  `<DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70"><XIcon /></DialogPrimitive.Close>`,
  // Overlays and the slider thumb use the palette on primitives, not on text or edges.
  `<DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />`,
  `<SliderPrimitive.Thumb className="border-primary ring-ring/50 block size-4 rounded-full border bg-white shadow-sm hover:ring-4 focus-visible:ring-4" />`,
  // Select trigger, input, checkbox, tabs, OTP slot, command item.
  `<SelectPrimitive.Trigger className={cn("border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50", className)} {...props} />`,
  `<input className={cn("file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input aria-invalid:ring-destructive/20", className)} />`,
  `<CheckboxPrimitive.Root className="peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary focus-visible:border-ring" />`,
  `<TabsPrimitive.Trigger className="data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground" />`,
  `<div className="data-[active=true]:border-ring data-[active=true]:ring-ring/50 border-input relative flex h-9 w-9 items-center justify-center border-y" />`,
  `<CommandPrimitive.Item className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground" />`,
  `<CommandPrimitive.Item className="data-[selected=true]:ring-2 data-[selected=true]:ring-ring" />`,
  // Tooltip: an inverse pair.
  `<TooltipPrimitive.Content className="bg-foreground text-background z-50 rounded-md px-3 py-1.5 text-xs" />`,
  // Sidebar.
  `<div className="bg-sidebar text-sidebar-foreground flex h-full w-full flex-col" />`,
  // Chart tooltip: CSS variables, not palette.
  `<div className="border-(--color-border) bg-(--color-bg) shrink-0 rounded-[2px]" style={{ "--color-bg": indicatorColor }} />`,
];

run("colour-tokens-by-role", rule, {
  valid: [
    ...upstream,
    // An arbitrary colour that only reads a token is a token.
    `<p className="text-[hsl(var(--muted-foreground))] text-sm">Last updated today</p>`,
    `<div className="border-[hsl(var(--border))] text-[oklch(var(--foreground)/0.8)]" />`,
    // shadcn v4's own destructive Button and Badge: text-white on bg-destructive.
    `<Button className="bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive/60">Delete</Button>`,
    `<span className="bg-destructive/90 text-white rounded-md px-2">3 errors</span>`,
    `<button className="hover:bg-destructive hover:text-white">Remove</button>`,
        // shadcn's Spinner is an icon: its colour is left to judgement, like other icons.
    `<Spinner className="size-6 text-red-500" />`,
    // The VIS-002 Do pairs.
    `<div className="rounded-lg border border-border bg-card p-3 text-sm text-card-foreground"><p className="text-destructive">Payment failed</p></div>`,
    `<p className="m-0 rounded-md bg-muted px-3 py-2 text-muted-foreground">3 plants, delivery on Friday</p>`,
    `<Badge className="bg-primary/10 text-primary">Ships in 2 days</Badge>`,
    `<Button className="bg-primary text-primary-foreground hover:bg-primary/90">Retry payment</Button>`,
    `<div className="bg-popover text-popover-foreground" />`,
    `<span className="bg-success text-success-foreground">Paid</span>`,
    // muted-foreground and foreground on light fills, as shadcn does.
    `<div className="bg-accent text-muted-foreground" />`,
    `<div className="bg-card text-muted-foreground" />`,
    `<div className="bg-secondary text-foreground" />`,
    // A branch swaps both text and fill, as cn does.
    `<button className={cn("bg-muted text-muted-foreground", selected && "bg-primary text-primary-foreground")}>Monthly</button>`,
    `<button className={selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}>Monthly</button>`,
    // Different variants are different states.
    `<button className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">Save</button>`,
    // A palette fill on a plain layout element is not text, a control or a state.
    `<div className="min-h-screen bg-zinc-50" />`,
    `<section className="bg-slate-900/5 p-8" />`,
    // Illustrations and photos.
    `<svg viewBox="0 0 10 10" className="text-emerald-500"><circle className="fill-emerald-500 stroke-white" r="4" /><text className="fill-zinc-700">A</text></svg>`,
    `<img src="/fern.jpg" alt="A fern" className="border-white" />`,
    `import { Leaf } from "lucide-react";\n<Leaf className="size-24 text-emerald-200" />`,
    `<div className="relative"><img src="/cover.jpg" alt="" /><div className="absolute inset-0 bg-black/60 p-4"><h4 className="text-white">Marrowfield Hours</h4></div></div>`,
    // Text on a photo or video behind a scrim: on the text, between, or laid over as a sibling.
    `<div className="relative bg-[url(/night.jpg)] bg-cover"><h2 className="bg-black/50 px-2 text-white">Night shift</h2></div>`,
    `<div className="relative"><img src="/cover.jpg" alt="" /><div className="absolute inset-0 bg-black/40" /><h2 className="absolute bottom-4 text-white">Night shift</h2></div>`,
    `<div className="relative"><video src="/tour.mp4" muted /><div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-4"><p className="text-white">Tour of the nursery</p></div></div>`,
    `<div className="relative"><Image src="/fern.jpg" alt="" fill /><div className="absolute inset-0 bg-gradient-to-t from-black/70" /><div className="relative p-6"><h3 className="text-white">Ferns</h3></div></div>`,
    `<div className="relative"><img src="/snow.jpg" alt="" /><p className="absolute inset-0 text-black" style={{ background: "linear-gradient(to top, rgb(255 255 255 / 0.8), transparent)" }}>Snow</p></div>`,
    `<div className="relative"><img src="/snow.jpg" alt="" /><div className="absolute inset-0 bg-white/70" /><p className="relative text-black">Snow</p></div>`,
    // A scrim a branch adds, as on a page that lets people turn it off: left alone when in doubt.
    `<div className="relative"><video src="/tour.mp4" /><p className={cn("absolute text-white", dim && "bg-black/50")}>Tour</p></div>`,
    // Only in a branch: the branch may never be taken.
    `<Input className={faint ? "border-border" : undefined} />`,
    `<p className={cn("text-sm", legacy && "text-gray-500")}>Old</p>`,
    // Ring without a selection variant, or with focus.
    `<div className="rounded-lg ring-2 ring-ring" />`,
    `<div className="aria-selected:focus-visible:ring-ring" />`,
    // border-border on a card or a divider.
    `<Card className="border-border" />`,
    `<Separator className="bg-border" />`,
    `<input type="checkbox" className="border-border" />`,
    // Hover and focus edges on a field are not its resting edge.
    `<Input className="hover:border-border" />`,
    // Non-colour text and bg utilities.
    `<p className="bg-cover text-sm text-left text-muted-foreground" />`,
    // Style with tokens or computed values.
    `<p style={{ color: "var(--muted-foreground)" }}>Note</p>`,
    `<div style={{ backgroundColor: "#f5f5f5" }} />`,
    `<span style={{ backgroundColor: item.color }} />`,
    // Classes the code does not state, and partial classes.
    `<span className={\`text-\${tone}-600\`}>Status</span>`,
    `<span className={tone}>Status</span>`,
  ],
  invalid: [
    // Raw palette on text, a control, a state or an edge.
    { code: `<p className="text-sm text-gray-500">Last updated today</p>`, errors: rawPalette },
    { code: `<div className="rounded-lg border border-gray-200 p-4" />`, errors: rawPalette },
    { code: `<span className="text-blue-600 underline">View order</span>`, errors: rawPalette },
    { code: `<Button className="bg-green-600 text-white hover:bg-green-700">Confirm</Button>`, errors: rawPalette },
    {
      code: `<Badge variant="secondary" className="bg-blue-500 text-white dark:bg-blue-600">Verified</Badge>`,
      errors: rawPalette,
    },
    { code: `<button className="bg-slate-100">Filter</button>`, errors: rawPalette },
    // A raw colour in an arbitrary value is still raw, and text-white on another fill is still reported.
    { code: `<p className="text-[hsl(220_10%_40%)]">Updated</p>`, errors: rawPalette },
    { code: `<Button className="bg-primary text-white">Save</Button>`, errors: rawPalette },
    { code: `<button className="bg-destructive hover:text-white">Remove</button>`, errors: rawPalette },
    { code: `<div className="hover:bg-gray-50">Row</div>`, errors: rawPalette },
    {
      code: `<Checkbox className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600" />`,
      errors: rawPalette,
    },
    { code: `<DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>`, errors: rawPalette },
    { code: `<p className="text-[#6b7280]">Hint</p>`, errors: rawPalette },
    { code: `<hr className="border-t-zinc-200" />`, errors: rawPalette },
    { code: `<ul className="divide-y divide-gray-100" />`, errors: rawPalette },
    { code: `<input className="ring-1 ring-blue-500/50 placeholder:text-gray-400" />`, errors: rawPalette },
    { code: `<p className={cn("text-sm", "text-zinc-500 dark:text-zinc-400")}>Note</p>`, errors: rawPalette },
    { code: `<p className={big ? "text-lg text-gray-600" : "text-sm text-gray-600"}>Note</p>`, errors: rawPalette },
    // Text over a plain fill is not over a photo.
    { code: `<div className="bg-primary"><p className="text-white">Sale</p></div>`, errors: rawPalette },
    // Text straight on a photo or video, with no scrim.
    {
      code: `<div className="relative bg-[url(/night.jpg)] bg-cover"><h2 className="text-white">Night shift</h2></div>`,
      errors: rawPalette,
    },
    {
      code: `<div className="relative"><img src="/cover.jpg" alt="" /><h2 className="absolute bottom-4 text-white">Night shift</h2></div>`,
      errors: rawPalette,
    },
    // A token fill with opacity is not a scrim made for the picture.
    {
      code: `<div className="relative"><img src="/cover.jpg" alt="" /><div className="absolute inset-0 bg-background/60" /><h2 className="absolute text-white">Night shift</h2></div>`,
      errors: rawPalette,
    },
    // Mixing a token fill with a palette one for dark.
    { code: `<div className="bg-card dark:bg-zinc-900" />`, errors: [{ messageId: "darkMix" }] },
    // Style.
    { code: `<p style={{ color: "#6b7280" }}>Hint</p>`, errors: [{ messageId: "rawStyle" }] },
    { code: `<div style={{ borderColor: "rgb(229 231 235)" }} />`, errors: [{ messageId: "rawStyle" }] },
    { code: `<button style={{ backgroundColor: "#16a34a" }}>Pay</button>`, errors: [{ messageId: "rawStyle" }] },
    // The VIS-002 Don't pairs, written out.
    { code: `<span className="bg-muted text-primary-foreground">Ships in 2 days</span>`, errors: wrongFill },
    { code: `<p className="bg-primary text-muted-foreground">3 plants in your basket</p>`, errors: wrongFill },
    { code: `<p className="bg-destructive text-accent-foreground">Payment failed</p>`, errors: wrongFill },
    { code: `<p className="bg-destructive text-foreground">Payment failed</p>`, errors: wrongFill },
    { code: `<li className="hover:bg-muted hover:text-accent-foreground">Plans</li>`, errors: wrongFill },
    {
      code: `<Button className={cn("bg-secondary text-primary-foreground", className)}>Save</Button>`,
      errors: wrongFill,
    },
    // border-border on a field.
    {
      code: `<Input className="border-border" />`,
      errors: fieldEdge(`<Input className="border-input" />`),
    },
    {
      code: `<Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between border-border">Select a plant</Button>`,
      errors: fieldEdge(
        `<Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between border-input">Select a plant</Button>`,
      ),
    },
    {
      code: `<SelectTrigger className={cn("w-40", "border-border")}><SelectValue /></SelectTrigger>`,
      errors: fieldEdge(),
    },
    {
      code: `<textarea className="rounded-md border dark:border-border/60" />`,
      errors: fieldEdge(`<textarea className="rounded-md border dark:border-input/60" />`),
    },
    // The ring colour for selection.
    {
      code: `<div role="radio" aria-checked={chosen} className="rounded-lg border aria-checked:border-ring aria-checked:ring-2 aria-checked:ring-ring" />`,
      errors: [{ messageId: "ringSelection" }, { messageId: "ringSelection" }],
    },
    { code: `<RadioGroupItem className="data-[state=checked]:ring-ring" />`, errors: ringSelection },
    { code: `<label className="has-[:checked]:border-ring"><input type="radio" /></label>`, errors: ringSelection },
  ],
});
