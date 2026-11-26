import rule from "../../rules/active-link-aria-current.js";
import { run } from "../helpers.js";

const NEXT = `import Link from "next/link";\n`;

/** A shadcn sidebar menu as its docs write it, with the given item inside the map. */
const sidebar = (item, imports = NEXT) => `${imports}
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar";

export function AppSidebar({ items, pathname }) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          ${item}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}`;

run("active-link-aria-current", rule, {
  valid: [
    // shadcn's own sidebar example: no isActive, so the menu shows no current item.
    sidebar(
      `<SidebarMenuButton asChild><a href={item.url}><item.icon /><span>{item.title}</span></a></SidebarMenuButton>`,
    ),
    // The link carries the mark from the same condition.
    sidebar(
      `<SidebarMenuButton asChild isActive={pathname === item.url}>
        <Link href={item.url} aria-current={pathname === item.url ? "page" : undefined}>{item.title}</Link>
      </SidebarMenuButton>`,
    ),
    // On the button itself: Slot passes it to the link.
    sidebar(
      `<SidebarMenuButton asChild isActive={active} aria-current={active ? "page" : undefined}>
        <a href={item.url}>{item.title}</a>
      </SidebarMenuButton>`,
    ),
    // Visually hidden text is another way.
    sidebar(
      `<SidebarMenuButton asChild isActive={active}>
        <a href={item.url}>{item.title}{active && <span className="sr-only"> (current page)</span>}</a>
      </SidebarMenuButton>`,
    ),
    sidebar(
      `<SidebarMenuButton asChild isActive={active}>
        <Link href={item.url}>{item.title}{active && <VisuallyHidden>(current page)</VisuallyHidden>}</Link>
      </SidebarMenuButton>`,
    ),
    // React Router's NavLink sets aria-current itself.
    sidebar(
      `<SidebarMenuButton asChild isActive={active}><NavLink to={item.url}>{item.title}</NavLink></SidebarMenuButton>`,
      `import { NavLink } from "react-router-dom";\n`,
    ),
    // TanStack Router's Link sets it too, and an unknown Link may.
    sidebar(
      `<SidebarMenuButton asChild isActive={active}><Link to={item.url}>{item.title}</Link></SidebarMenuButton>`,
      `import { Link } from "@tanstack/react-router";\n`,
    ),
    sidebar(
      `<SidebarMenuButton asChild isActive={active}><Link href={item.url}>{item.title}</Link></SidebarMenuButton>`,
      `import { Link } from "@/components/link";\n`,
    ),
    sidebar(
      `<SidebarMenuButton asChild isActive={active}><AppLink href={item.url}>{item.title}</AppLink></SidebarMenuButton>`,
    ),
    // Spread props may carry the mark.
    sidebar(
      `<SidebarMenuButton asChild isActive={active}><Link href={item.url} {...linkProps}>{item.title}</Link></SidebarMenuButton>`,
    ),
    sidebar(
      `<SidebarMenuButton asChild isActive={active} {...props}><Link href={item.url}>{item.title}</Link></SidebarMenuButton>`,
    ),
    // Without asChild it is a button, not a link to a page.
    sidebar(
      `<SidebarMenuButton isActive={view === item.id} onClick={() => setView(item.id)}>{item.title}</SidebarMenuButton>`,
    ),
    // isActive written as off.
    sidebar(`<SidebarMenuButton asChild isActive={false}><a href={item.url}>{item.title}</a></SidebarMenuButton>`),
    // More than one child, or a child from an expression: not certain which is the link.
    sidebar(`<SidebarMenuButton asChild isActive={active}>{renderLink(item)}</SidebarMenuButton>`),
    // SidebarMenuSubButton renders an a and takes the mark itself.
    sidebar(
      `<SidebarMenuSub><SidebarMenuSubItem>
        <SidebarMenuSubButton href={item.url} isActive={active} aria-current={active ? "page" : undefined}>{item.title}</SidebarMenuSubButton>
      </SidebarMenuSubItem></SidebarMenuSub>`,
    ),
    // A plain list item with the mark on its link.
    `export function Nav({ current }) {
      return <nav aria-label="Main"><ul><li><a href="/invoices" aria-current={current === "invoices" ? "page" : undefined}>Invoices</a></li></ul></nav>;
    }`,
    // aria-current on a list item with no link in it: a list of headings or landmarks.
    `export function Outline({ stops, at }) {
      return <ol>{stops.map((s, i) => <li key={i} aria-current={at === i ? "true" : undefined}>{s.text}</li>)}</ol>;
    }`,
    // Steps are outside this rule.
    `export function Steps() { return <ol><li aria-current="step"><a href="/billing">Billing</a></li></ol>; }`,
    // A computed value is not resolved.
    `export function Menu({ v }) { return <ul><li aria-current={v}><a href="/invoices">Invoices</a></li></ul>; }`,
    // Pagination is outside this rule.
    `export function Pages() {
      return <Pagination><PaginationContent><li aria-current="page"><a href="?page=2">2</a></li></PaginationContent></Pagination>;
    }`,
    // On the item and on the link: said on the link, so the link is fine.
    `export function Menu() { return <ul><li aria-current="page"><a href="/invoices" aria-current="page">Invoices</a></li></ul>; }`,
    // A NavLink inside may set it itself.
    `import { NavLink } from "react-router-dom";
    export function Menu() { return <ul><li aria-current="page"><NavLink to="/invoices">Invoices</NavLink></li></ul>; }`,
    // shadcn's breadcrumb sets it on BreadcrumbPage.
    `export function Crumbs() {
      return <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbPage>Invoices</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>;
    }`,
    // Tabs are outside this rule.
    `export function View() { return <Tabs defaultValue="list"><TabsList><TabsTrigger value="list">List</TabsTrigger></TabsList></Tabs>; }`,
  ],
  invalid: [
    {
      // The rule's own Don't: isActive and stop there.
      code: sidebar(
        `<SidebarMenuButton asChild isActive={pathname === item.url}><Link href={item.url}>{item.title}</Link></SidebarMenuButton>`,
      ),
      errors: [{ messageId: "activeWithoutCurrent" }],
    },
    {
      code: sidebar(
        `<SidebarMenuButton asChild isActive={item.isActive}>
          <a href={item.url}>
            <item.icon />
            <span>{item.title}</span>
          </a>
        </SidebarMenuButton>`,
      ),
      errors: [{ messageId: "activeWithoutCurrent" }],
    },
    {
      // A bare isActive.
      code: sidebar(`<SidebarMenuButton asChild isActive><a href="/invoices">Invoices</a></SidebarMenuButton>`),
      errors: [{ messageId: "activeWithoutCurrent" }],
    },
    {
      // aria-selected in its place still says nothing on a link.
      code: sidebar(
        `<SidebarMenuButton asChild isActive={active}><Link href={item.url} aria-selected={active}>{item.title}</Link></SidebarMenuButton>`,
      ),
      errors: [{ messageId: "activeWithoutCurrent" }],
    },
    {
      code: sidebar(
        `<SidebarMenuButton asChild isActive={active}><Link to={item.url}>{item.title}</Link></SidebarMenuButton>`,
        `import { Link } from "react-router-dom";\n`,
      ),
      errors: [{ messageId: "activeWithoutCurrent" }],
    },
    {
      // A renamed default import from next/link.
      code: sidebar(
        `<SidebarMenuButton asChild isActive={active}><NextLink href={item.url}>{item.title}</NextLink></SidebarMenuButton>`,
        `import NextLink from "next/link";\n`,
      ),
      errors: [{ messageId: "activeWithoutCurrent" }],
    },
    {
      code: sidebar(
        `<SidebarMenuSub><SidebarMenuSubItem>
          <SidebarMenuSubButton asChild isActive={pathname === item.url}><Link href={item.url}>{item.title}</Link></SidebarMenuSubButton>
        </SidebarMenuSubItem></SidebarMenuSub>`,
      ),
      errors: [{ messageId: "activeWithoutCurrent" }],
    },
    {
      // Without asChild, SidebarMenuSubButton is the a.
      code: sidebar(
        `<SidebarMenuSub><SidebarMenuSubItem>
          <SidebarMenuSubButton href={item.url} isActive={active}>{item.title}</SidebarMenuSubButton>
        </SidebarMenuSubItem></SidebarMenuSub>`,
      ),
      errors: [{ messageId: "activeWithoutCurrent" }],
    },
    {
      // The mark on the list item instead of the link, as in the Don't example.
      code: `export function Menu({ items, current }) {
        return (
          <ul>
            {items.map((item) => (
              <li key={item.id} aria-current={item.id === current ? "page" : undefined}>
                <a href={"#" + item.id}>{item.label}</a>
              </li>
            ))}
          </ul>
        );
      }`,
      errors: [{ messageId: "currentOnWrapper", data: { wrapper: "li" } }],
    },
    {
      code: sidebar(`<SidebarMenuButton asChild><Link href={item.url}>{item.title}</Link></SidebarMenuButton>`).replace(
        `<SidebarMenuItem key={item.title}>`,
        `<SidebarMenuItem key={item.title} aria-current={pathname === item.url && "page"}>`,
      ),
      errors: [{ messageId: "currentOnWrapper", data: { wrapper: "SidebarMenuItem" } }],
    },
    {
      code: `export function Menu() { return <ul><li aria-current="true"><a href="/invoices">Invoices</a></li></ul>; }`,
      errors: [{ messageId: "currentOnWrapper" }],
    },
  ],
});
