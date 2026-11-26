import rule from "../../rules/svg-hidden-or-named.js";
import { run } from "../helpers.js";

const path = `<path d="M5 12l5 5L20 7" />`;

run("svg-hidden-or-named", rule, {
  valid: [
    // Hidden decoration, as the adapter's icons and the examples draw it.
    `export const Tick = () => <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">${path}</svg>;`,
    `export const Tick = () => <svg viewBox="0 0 24 24" aria-hidden className="size-4">${path}</svg>;`,
    `export const Tick = () => <svg viewBox="0 0 24 24" aria-hidden={true}>${path}</svg>;`,
    `export const Chart = () => <svg viewBox="0 0 260 120" role="presentation" focusable="false">${path}</svg>;`,
    `export const Chart = () => <svg viewBox="0 0 260 120" role="none">${path}</svg>;`,
    // Named: role="img" with a label, a label alone, or a title.
    `export const Clock = () => <svg role="img" aria-label="Overdue" viewBox="0 0 24 24">${path}</svg>;`,
    `export const Clock = () => <svg aria-labelledby="t1" viewBox="0 0 24 24"><title id="t1">Overdue</title>${path}</svg>;`,
    `export const Clock = () => <svg viewBox="0 0 24 24"><title>Overdue</title>${path}</svg>;`,
    `export const Clock = ({ label }) => <svg role="img" aria-label={label} viewBox="0 0 24 24">${path}</svg>;`,
    // An icon component that spreads props: the caller decides.
    `export function Icon({ children, ...props }) {
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" {...props}>{children}</svg>;
    }`,
    `export const ClockIcon = (props) => <svg viewBox="0 0 24 24" className="size-5" {...props}>${path}</svg>;`,
    // A computed aria-hidden.
    `export const I = ({ decorative }) => <svg aria-hidden={decorative} viewBox="0 0 24 24">${path}</svg>;`,
    // Icons that are a button's or link's only content follow ACT-001b and TXT-003.
    `export const Close = () => <Button variant="ghost" size="icon" aria-label="Close"><svg viewBox="0 0 24 24">${path}</svg></Button>;`,
    `export const Close = () => <button type="button" aria-label="Close"><svg viewBox="0 0 24 24">${path}</svg></button>;`,
    `export const Home = () => <a href="/" aria-label="Home"><svg viewBox="0 0 24 24">${path}</svg></a>;`,
    `export const M = () => <DropdownMenuItem><svg viewBox="0 0 24 24">${path}</svg>Rename</DropdownMenuItem>;`,
    `export const T = () => <div role="button" tabIndex={0} aria-label="Sort"><svg viewBox="0 0 24 24">${path}</svg></div>;`,
    // Inside something hidden, or itself hidden.
    `export const D = () => <span aria-hidden="true"><svg viewBox="0 0 24 24">${path}</svg></span>;`,
    // A hidden class at any width: the shown copy is usually another element, so stay quiet.
    `export const D = () => <svg className="hidden md:block" viewBox="0 0 24 24">${path}</svg>;`,
    `export const D = () => <svg className="hidden"><defs><linearGradient id="g" /></defs></svg>;`,
    `export const D = () => <svg style={{ display: "none" }}><symbol id="tick" viewBox="0 0 24 24">${path}</symbol></svg>;`,
    `export const Sprite = () => <svg width="0" height="0"><defs><clipPath id="c"><rect width="1" height="1" /></clipPath></defs></svg>;`,
    // Nested svg: only the outer one is checked.
    `export const N = () => <svg aria-hidden="true"><svg x="10">${path}</svg></svg>;`,
    // Library icons are not inline svg.
    `import { Check } from "lucide-react";\nexport const C = () => <span><Check className="size-4" /> Paid</span>;`,
  ],
  invalid: [
    {
      code: `export const Tick = () => <svg viewBox="0 0 24 24" className="size-4">${path}</svg>;`,
      errors: [{ messageId: "unnamed" }],
    },
    {
      // A decorative tick before a word, not hidden.
      code: `export const Paid = () => <span className="inline-flex gap-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor">${path}</svg>Paid</span>;`,
      errors: [{ messageId: "unnamed" }],
    },
    {
      code: `export const I = () => <svg aria-hidden="false" viewBox="0 0 24 24">${path}</svg>;`,
      errors: [{ messageId: "unnamed" }],
    },
    {
      code: `export const I = () => <svg aria-hidden={false} viewBox="0 0 24 24">${path}</svg>;`,
      errors: [{ messageId: "unnamed" }],
    },
    // focusable="false" alone does not hide it from a screen reader.
    {
      code: `export const I = () => <svg focusable="false" viewBox="0 0 24 24">${path}</svg>;`,
      errors: [{ messageId: "unnamed" }],
    },
    // role="img" with no name is still unnamed.
    {
      code: `export const I = () => <svg role="img" viewBox="0 0 24 24">${path}</svg>;`,
      errors: [{ messageId: "unnamed" }],
    },
    // An inline status icon in a table row, unnamed.
    {
      code: `export const Row = () => <TableRow><TableCell>Invoice 2026-114</TableCell><TableCell><svg viewBox="0 0 24 24" className="text-destructive"><circle cx="12" cy="12" r="9" /></svg></TableCell></TableRow>;`,
      errors: [{ messageId: "unnamed" }],
    },
  ],
});
