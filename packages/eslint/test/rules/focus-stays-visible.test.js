import rule from "../../rules/focus-stays-visible.js";
import { run } from "../helpers.js";

const outlineRemoved = [{ messageId: "outlineRemoved" }];

run("focus-stays-visible", rule, {
  valid: [
    // A replacement focus style on the same element.
    `<button className="rounded-md px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring">Search tickets</button>`,
    `<a href="/trips" className="underline outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">Your trips</a>`,
    `<input className="h-9 border border-input outline-none focus:border-ring focus:ring-2" />`,
    // Our focusRing, written out.
    `<a href="#t" className="outline-none focus-visible:outline-hidden focus-visible:ring-(length:--focus-ring-width) focus-visible:ring-ring focus-visible:ring-offset-background">Leeds</a>`,
    // A slight focus change is a judgement for review, not lint.
    `<button className="outline-none focus:bg-accent">Add passenger</button>`,
    // A focus style through a constant in the file.
    `const ring = "outline-none focus-visible:ring-2 focus-visible:ring-ring";
     export function A() { return <a href="/x" className={ring}>Read more</a>; }`,
    `const ring = "outline-none " + "focus-visible:ring-2";
     export function A() { return <button className={ring}>Read more</button>; }`,
    // shadcn components keep their own focus ring.
    `<Button className="outline-none">Save draft</Button>`,
    `<Input className="outline-none" />`,
    `<SelectTrigger className="outline-none"><SelectValue /></SelectTrigger>`,
    // Not focusable by Tab: only a script focuses it, as after a form is sent.
    `<h4 tabIndex={-1} className="m-0 text-base font-semibold outline-none">Your booking</h4>`,
    `<div className="outline-none">Panel</div>`,
    `<a className="outline-none">No href, no focus</a>`,
    `<input type="hidden" className="outline-none" />`,
    // Disabled controls need not take focus.
    `<button disabled className="outline-none">Send</button>`,
    // Class lists the code does not state in full.
    `<button className={cn("outline-none", focusRing)}>Save</button>`,
    `<a href="/x" className={buttonVariants({ variant: "ghost" }) + " outline-none"}>Back</a>`,
    `export function L({ className }) { return <a href="/x" className={cn("outline-none", className)}>Back</a>; }`,
    `<button {...props} className="outline-none">Save</button>`,
    // The outline is removed only in a branch.
    `<button className={cn("rounded", plain && "outline-none")}>Save</button>`,
    // An indicator on the wrapper, as in a search box that rings itself.
    `<div className="flex rounded-md border border-input focus-within:ring-2 focus-within:ring-ring">
       <input className="flex-1 border-0 bg-transparent outline-none" placeholder="Search" />
     </div>`,
    `<div className="has-[:focus-visible]:ring-2"><div><input className="outline-none" /></div></div>`,
    // A peer or a group that draws it elsewhere.
    `<label><input type="checkbox" className="peer sr-only outline-none" /><span className="peer-focus-visible:ring-2">Remember me</span></label>`,
    `<a href="/x" className="group outline-none"><span className="group-focus-visible:underline">Read more</span></a>`,
    // A style that keeps the outline.
    `<button style={{ outlineOffset: 2 }}>Save</button>`,
    `<button className="focus-visible:ring-2" style={{ outline: "none" }}>Save</button>`,
  ],
  invalid: [
    // The KBD-001 Don't: outline removed on all controls, nothing in its place.
    { code: `<button className="rounded-md border px-3 outline-none">Search tickets</button>`, errors: outlineRemoved },
    { code: `<a href="/help" className="text-primary underline focus:outline-none">Help</a>`, errors: outlineRemoved },
    {
      code: `<input type="search" className="h-9 w-full border border-input px-3 focus-visible:outline-none" />`,
      errors: outlineRemoved,
    },
    { code: `<textarea className="outline-hidden" />`, errors: outlineRemoved },
    {
      code: `<select className={cn("h-9 rounded-md", "outline-none")}><option>UK</option></select>`,
      errors: outlineRemoved,
    },
    {
      code: `<div role="button" tabIndex={0} className="outline-none" onClick={more} onKeyDown={key}>Show more trips</div>`,
      errors: outlineRemoved,
    },
    { code: `<div contentEditable className="min-h-20 outline-none" />`, errors: outlineRemoved },
    // Removing a focus ring is not a focus style.
    {
      code: `<button className="outline-none focus:ring-0 focus-visible:shadow-none">Save</button>`,
      errors: outlineRemoved,
    },
    // Both sides of a branch remove it.
    {
      code: `<button className={active ? "outline-none font-bold" : "outline-none"}>Tab</button>`,
      errors: outlineRemoved,
    },
    // A router link renders a plain a.
    {
      code: `import Link from "next/link";\n<Link href="/trips" className="outline-none">Trips</Link>`,
      errors: outlineRemoved,
    },
    {
      code: `import { Link } from "react-router-dom";\n<Link to="/trips" className="outline-none">Trips</Link>`,
      errors: outlineRemoved,
    },
    // A constant in the file.
    {
      code: `const plain = "rounded px-2 outline-none";\nexport function B() { return <button className={plain}>Save</button>; }`,
      errors: outlineRemoved,
    },
    // Inline style.
    { code: `<button style={{ outline: "none" }}>Search tickets</button>`, errors: outlineRemoved },
    { code: `<a href="/x" style={{ outline: 0 }}>Read more</a>`, errors: outlineRemoved },
  ],
});
