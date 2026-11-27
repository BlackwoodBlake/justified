import rule from "../../rules/underline-links-in-text.js";
import { run } from "../helpers.js";

const nextLink = `import Link from "next/link";`;
const routerLink = `import { Link } from "react-router-dom";`;
const lesson = (link) =>
  `export const Lesson = () => <p className="text-base">Before the next lesson, read the chapter once. ${link} and bring your answers.</p>;`;

run("underline-links-in-text", rule, {
  valid: [
    // The Do in examples/rules/VIS-003b.tsx.
    lesson(
      `<a href="#worksheet" className="text-primary underline underline-offset-4 hover:decoration-2">Download the worksheet</a>`,
    ),
    // Other cues beyond colour.
    lesson(`<a href="/w" className="font-semibold text-primary">Download the worksheet</a>`),
    lesson(`<a href="/w" className="font-medium text-primary">Download the worksheet</a>`),
    lesson(`<a href="/w" className="border-b border-primary text-primary">Download the worksheet</a>`),
    lesson(`<a href="/w" className="no-underline font-bold">Download the worksheet</a>`),
    lesson(`<a href="/w" className={cn("text-primary", "underline underline-offset-4")}>Download the worksheet</a>`),
    // shadcn's own description links, which underline at rest.
    `export const D = () => <FormDescription>Shown on certificates. <a href="/privacy" className="underline underline-offset-4 hover:text-primary">Read how we use your name.</a></FormDescription>;`,
    `export const D = () => <p className="px-8 text-center text-sm text-muted-foreground">By clicking continue, you agree to our <a href="/terms" className="underline underline-offset-4 hover:text-primary">Terms of Service</a>.</p>;`,
    // No className: a project stylesheet may underline it.
    lesson(`<a href="/w">Download the worksheet</a>`),
    // Classes from expressions, such as buttonVariants or a condition.
    lesson(`<a href="/w" className={buttonVariants({ variant: "link" })}>Download the worksheet</a>`),
    lesson(`<a href="/w" className={cn("text-primary", active && "underline")}>Download the worksheet</a>`),
    lesson(`<a href="/w" className={linkClass}>Download the worksheet</a>`),
    // Links styled as buttons.
    lesson(`<Button variant="link" asChild><a href="/w" className="text-primary">Download</a></Button>`),
    // Lists of links, menus and footers are not running text.
    `export const Nav = () => <ul><li><a href="/a" className="text-primary hover:underline">Pricing</a></li><li><a href="/b" className="text-primary hover:underline">Docs</a></li></ul>;`,
    `export const F = () => <footer className="flex gap-4"><a href="/a" className="text-sm hover:underline">Privacy</a><a href="/b" className="text-sm hover:underline">Terms</a></footer>;`,
    // A paragraph that is only the link.
    `export const More = () => <p><a href="/more" className="text-primary hover:underline">Read more</a></p>;`,
    `export const More = () => <p>{" "}<a href="/more" className="text-primary">Read more</a>.</p>;`,
    // Prose underlines links.
    `export const Article = () => <article className="prose dark:prose-invert"><p>See the <a href="/guide" className="text-primary">guide</a> first.</p></article>;`,
    `export const Article = ({ c }) => <div className={cn("prose", c)}><p>See the <a href="/guide" className="text-primary">guide</a> first.</p></div>;`,
    // A parent that underlines the links inside it.
    `export const Note = () => <div className="text-sm [&_a]:underline [&_a]:underline-offset-4"><p>See the <a href="/guide" className="text-primary">guide</a> first.</p></div>;`,
    `export const Note = () => <FieldDescription className="[&>a]:underline">Read the <a href="/terms">terms</a> first.</FieldDescription>;`,
    `export const Note = () => <div className="prose-a:underline"><p>See the <a href="/guide" className="text-primary">guide</a> first.</p></div>;`,
    // A link drawn as a button is outside the rule.
    `export const Empty = () => <p>No projects yet. <a href="/new" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-primary-foreground">Create one</a></p>;`,
    `import Link from "next/link";
    export const Empty = () => <TableCell>None. <Link href="/new" className="rounded-md border px-3 py-1 text-sm">Add</Link></TableCell>;`,
    // A plain anchor without href, a Link from elsewhere, a styled or spread link.
    lesson(`<a className="text-primary">Download the worksheet</a>`),
    `import { Link } from "@/components/link";\n${lesson(`<Link href="/w" className="text-primary">Download</Link>`)}`,
    lesson(`<a href="/w" className="text-primary" style={{ textDecoration: "underline" }}>Download</a>`),
    lesson(`<a href="/w" className="text-primary" {...props}>Download</a>`),
    // Renderer mappings that underline, or with classes the props may replace.
    `export const components = { a: (props) => <a {...props} className="text-primary underline underline-offset-4" /> };`,
    `export const components = { a: ({ className, ...props }) => <a className={cn("text-primary underline", className)} {...props} /> };`,
    `export const components = { a: (props) => <a className="text-primary" {...props} /> };`,
    `export const Md = ({ text }) => <ReactMarkdown components={{ a: (props) => <a {...props} /> }}>{text}</ReactMarkdown>;`,
    // An `a` key that is not a renderer mapping.
    `export const letters = { a: () => <a href="/x" className="text-primary">x</a> };`,
  ],
  invalid: [
    // The Don'ts in examples/rules/VIS-003b.tsx, written as real links.
    {
      code: lesson(`<a href="#worksheet" className="text-primary">Download the worksheet</a>`),
      errors: [{ messageId: "colourOnly" }],
    },
    {
      code: `export const Hint = () => <p className="m-0 text-sm text-muted-foreground">Shown on certificates. <a href="#name" className="cursor-pointer text-primary hover:underline">Read how we use your name.</a></p>;`,
      errors: [{ messageId: "stateOnly" }],
    },
    {
      code: lesson(`<a href="/w" className="text-primary focus-visible:underline">Download</a>`),
      errors: [{ messageId: "stateOnly" }],
    },
    {
      code: lesson(`<a href="/w" className="text-primary no-underline">Download</a>`),
      errors: [{ messageId: "noUnderline" }],
    },
    {
      code: lesson(`<a href="/w" className={cn("text-primary", "hover:underline")}>Download</a>`),
      errors: [{ messageId: "stateOnly" }],
    },
    { code: lesson(`<a href="/w" className={\`text-primary\`}>Download</a>`), errors: [{ messageId: "colourOnly" }] },
    // Router links.
    {
      code: `${nextLink}\n${lesson(`<Link href="/w" className="text-primary hover:underline">Download</Link>`)}`,
      errors: [{ messageId: "stateOnly" }],
    },
    {
      code: `${routerLink}\n${lesson(`<Link to="/w" className="font-normal text-primary">Download</Link>`)}`,
      errors: [{ messageId: "colourOnly" }],
    },
    // Help text and descriptions.
    {
      code: `export const D = () => <FormDescription>We never share it. <a href="/privacy" className="text-primary">Privacy policy</a></FormDescription>;`,
      errors: [{ messageId: "colourOnly" }],
    },
    {
      code: `export const D = () => <AlertDescription>Your card was declined. <a href="/billing" className="font-normal text-primary hover:underline">Update billing</a> to continue.</AlertDescription>;`,
      errors: [{ messageId: "stateOnly" }],
    },
    {
      code: `export const D = () => <DialogDescription>This removes the project. <a href="/docs/delete" className="text-primary">Learn more</a></DialogDescription>;`,
      errors: [{ messageId: "colourOnly" }],
    },
    {
      code: `export const C = () => <TableCell>Paid by <a href="/u/7" className="text-primary hover:underline">Lena Okafor</a> on 3 May</TableCell>;`,
      errors: [{ messageId: "stateOnly" }],
    },
    // A parent cue only on hover does not count, and a plain fill with no padding is not a button.
    {
      code: `export const Note = () => <div className="[&_a:hover]:underline"><p>See the <a href="/g" className="text-primary">guide</a>.</p></div>;`,
      errors: [{ messageId: "colourOnly" }],
    },
    {
      code: `export const Note = () => <p>See the <a href="/g" className="bg-muted text-primary">guide</a>.</p>;`,
      errors: [{ messageId: "colourOnly" }],
    },
    // A prefixed prose does not reach this link; not-prose turns prose off.
    {
      code: `export const A = () => <div className="not-prose"><p>See the <a href="/g" className="text-primary">guide</a>.</p></div>;`,
      errors: [{ messageId: "colourOnly" }],
    },
    // No className, with the option on.
    {
      code: lesson(`<a href="/w">Download</a>`),
      options: [{ flagUnstyled: true }],
      errors: [{ messageId: "colourOnly" }],
    },
    // Renderer mappings.
    {
      code: `export const Md = ({ text }) => <ReactMarkdown components={{ a: (props) => <a {...props} className="text-primary hover:underline" /> }}>{text}</ReactMarkdown>;`,
      errors: [{ messageId: "mapping" }],
    },
    {
      code: `const mdxComponents: MDXComponents = { a: ({ href, children }) => <a href={href} className="font-normal text-primary no-underline">{children}</a> };`,
      errors: [{ messageId: "mapping" }],
    },
    {
      code: `export function useMDXComponents(components) {
        return { ...components, a: (props) => { return <a {...props} className="text-primary" />; } };
      }`,
      errors: [{ messageId: "mapping" }],
    },
    {
      code: `${nextLink}\nexport const components = { a: ({ href, ...props }) => <Link href={href} {...props} className="text-primary" /> };`,
      errors: [{ messageId: "mapping" }],
    },
  ],
});
