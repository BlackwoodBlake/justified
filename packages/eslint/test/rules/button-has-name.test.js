import rule from "../../rules/button-has-name.js";
import { run } from "../helpers.js";

const lucide = `import { Trash2, Settings, MoreHorizontal, ArrowRight, X } from "lucide-react";\n`;

run("button-has-name", rule, {
  valid: [
    // A button passed as a render prop gets its children and name from the component that takes it.
    `import { XIcon } from "lucide-react"; const a = <ComboboxPrimitive.ChipRemove render={<Button variant="ghost" size="icon-xs" />} aria-label="Remove Apple"><XIcon /></ComboboxPrimitive.ChipRemove>;`,
    `const a = <TooltipTrigger render={<Button variant="ghost" size="icon" />}>Save draft</TooltipTrigger>;`,
    // shadcn icon buttons as its docs write them.
    `${lucide}export const A = () => <Button variant="outline" size="icon" aria-label="Remove attachment"><Trash2 /></Button>;`,
    `${lucide}export const A = () => <Button size="icon"><Settings /><span className="sr-only">Open settings</span></Button>;`,
    `${lucide}export const A = () => <Button size="icon-sm" aria-label="More actions for Spring Fair"><MoreHorizontal /></Button>;`,
    `${lucide}export const A = () => <Button variant="outline" size="sm"><ArrowRight /> Continue</Button>;`,
    `${lucide}export const A = () => <button type="button" title="Close the panel"><X /></button>;`,
    `${lucide}export const A = () => <button type="button" aria-labelledby="close-label"><X /></button>;`,
    // Our Do: the visible word first, the row added.
    `export const A = () => <Button variant="outline" size="sm" aria-label="Archive Invoice 1042">Archive</Button>;`,
    `export const A = () => <Button aria-label="Try again, upload contract.pdf">Try again</Button>;`,
    // Holding the visible words without starting with them is advice, not the rule.
    `export const A = () => <Button aria-label="Upload contract.pdf, try again">Try again</Button>;`,
    // Case and punctuation do not count.
    `export const A = () => <Button aria-label="don't save">Don’t save!</Button>;`,
    // Text used as a symbol names the function.
    `export const A = () => <Button variant="outline" aria-label="Larger text">A+</Button>;`,
    `export const A = () => <Button aria-label="Mention a colleague">@</Button>;`,
    // The name or children come from expressions, props or other components.
    `${lucide}export const A = ({ names }) => <Button size="icon" aria-label={names.remove()}><Trash2 /></Button>;`,
    `${lucide}export const A = ({ open }) => <Button size="icon">{open ? <X /> : <MoreHorizontal />}</Button>;`,
    `export const A = ({ label }) => <Button aria-label="Go to payment">{label}</Button>;`,
    `export const A = () => <Button aria-label="Go to payment"><Trans>Continue</Trans></Button>;`,
    `export const A = (props) => <Button size="icon" {...props}><Trash2Icon /></Button>;`,
    `export const A = () => <Button size="icon"><Avatar /></Button>;`,
    // asChild: the child gives the name.
    `${lucide}export const A = () => <Button asChild size="icon"><a href="/settings" aria-label="Settings"><Settings /></a></Button>;`,
    // A decorative icon beside text, hidden.
    `export const A = () => <Button><svg aria-hidden="true"><title>Bin</title></svg>Remove</Button>;`,
    `${lucide}export const A = () => <Button><Trash2 aria-hidden="true" aria-label="Bin" />Remove</Button>;`,
    // An icon-only button whose icon carries the name.
    `export const A = () => <button type="button"><svg role="img" aria-label="Remove attachment" /></button>;`,
    // A tooltip with a named button.
    `${lucide}export const A = () => (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open settings"><Settings /></Button>
        </TooltipTrigger>
        <TooltipContent>Settings</TooltipContent>
      </Tooltip>
    );`,
    `export const A = () => <TooltipTrigger>Settings</TooltipTrigger>;`,
    // A name that holds the word button for another reason is left alone when only the word.
    `${lucide}export const A = () => <Button size="icon" aria-label="Button"><X /></Button>;`,
    // A button with text and no aria-label needs nothing.
    `export const A = () => <Button>Save draft</Button>;`,
  ],
  invalid: [
    {
      code: `${lucide}export const A = () => <Button variant="ghost" size="icon"><Trash2 /></Button>;`,
      errors: [{ messageId: "noName" }],
    },
    {
      code: `import { TrashIcon } from "@blackwoodblake/justified-shadcn/icons";\nexport const A = () => <Button size="icon" onClick={remove}>\n  <TrashIcon />\n</Button>;`,
      errors: [{ messageId: "noName" }],
    },
    {
      code: `export const A = () => <button type="button" onClick={close}><svg viewBox="0 0 24 24"><path d="M6 6l12 12" /></svg></button>;`,
      errors: [{ messageId: "noName" }],
    },
    {
      code: `export const A = () => <Button size="icon" />;`,
      errors: [{ messageId: "noName" }],
    },
    {
      code: `export const A = () => <button type="button" className="dot" onClick={next} />;`,
      errors: [{ messageId: "noName" }],
    },
    {
      // The tooltip is the only name.
      code: `${lucide}export const A = () => (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon"><Settings /></Button>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
      );`,
      errors: [{ messageId: "tooltipOnly" }],
    },
    {
      code: `${lucide}export const A = () => <Tooltip><TooltipTrigger><Settings /></TooltipTrigger><TooltipContent>Settings</TooltipContent></Tooltip>;`,
      errors: [{ messageId: "tooltipOnly" }],
    },
    {
      // The Don't, written out: "Continue" named "Go to payment".
      code: `export const A = () => <Button aria-label="Go to payment">Continue</Button>;`,
      errors: [{ messageId: "labelMissesText", data: { label: "Go to payment", text: "Continue" } }],
    },
    {
      code: `${lucide}export const A = () => <Button variant="outline" size="sm" aria-label="Resend file">Try again <ArrowRight /></Button>;`,
      errors: [{ messageId: "labelMissesText", data: { label: "Resend file", text: "Try again" } }],
    },
    {
      // Same words, other order.
      code: `export const A = () => <button aria-label="Again, try">Try again</button>;`,
      errors: [{ messageId: "labelMissesText" }],
    },
    {
      code: `export const A = () => <Button aria-label="Continue to checkout"><span>Pay now</span></Button>;`,
      errors: [{ messageId: "labelMissesText" }],
    },
    {
      // The Don't, written out: the bin named after its picture.
      code: `${lucide}export const A = () => <Button variant="ghost" size="icon" aria-label="Bin"><Trash2 /></Button>;`,
      errors: [{ messageId: "pictureName", data: { label: "Bin" } }],
    },
    {
      code: `${lucide}export const A = () => <Button size="icon" aria-label="Gear icon"><Settings /></Button>;`,
      errors: [{ messageId: "pictureName" }],
    },
    {
      code: `${lucide}export const A = () => <Button size="icon" aria-label="Three dots"><MoreHorizontal /></Button>;`,
      errors: [{ messageId: "pictureName" }],
    },
    {
      code: `${lucide}export const A = () => <Button size="icon" aria-label="Remove attachment button"><Trash2 /></Button>;`,
      errors: [{ messageId: "roleInName" }],
    },
    {
      code: `${lucide}export const A = () => <Button><Trash2 aria-label="Bin" />Remove</Button>;`,
      errors: [{ messageId: "namedIcon" }],
    },
    {
      code: `export const A = () => <button type="button"><svg><title>Bin</title><path d="M3 6h18" /></svg> Remove attachment</button>;`,
      errors: [{ messageId: "namedIcon" }],
    },
  ],
});
