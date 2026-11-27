import rule from "../../rules/navigate-with-link.js";
import { run } from "../helpers.js";

/** A Next.js component with a router, around the given JSX. */
const next = (jsx, before = "") => `
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function Dashboard({ pet, onBook }) {
  const router = useRouter();
  const pathname = usePathname();
  ${before}
  return (
    <>
      ${jsx}
    </>
  );
}`;

run("navigate-with-link", rule, {
  valid: [
    // Our Do: links with button looks, and a button that books.
    next(`<Button asChild><Link href="/appointments">View appointments</Link></Button>
      <Button variant="outline" asChild><a href="https://pharmacy.example.com">Open pharmacy site</a></Button>
      <Button variant="outline" onClick={onBook}>Book appointment</Button>`),
    // Act, then move: save, then go to the result.
    next(
      `<Button onClick={async () => { await saveBooking(); router.push("/appointments"); }}>Book appointment</Button>`,
    ),
    next(`<Button onClick={() => router.push("/logout")}>Sign out</Button>`),
    next(`<Button onClick={() => router.push("/auth/sign-out")}>Leave</Button>`),
    next(
      `<Button onClick={() => router.push("/search?q=" + query)}>Search</Button>`,
      'const [query, setQuery] = useState("");',
    ),
    next(
      `<Button onClick={() => router.push(\`/orders/\${orderNumber}\`)}>Find order</Button>`,
      'const [orderNumber] = useState("");',
    ),
    next(`<Button onClick={() => router.push("/pets/" + form.getValues("id"))}>Open</Button>`),
    next(`<Button onClick={() => router.push("/pets/" + inputRef.current.value)}>Open</Button>`),
    // Inside a form, the button may send what was typed.
    next(
      `<form onSubmit={onSubmit}><Input name="q" /><Button onClick={() => router.push("/results")}>Go</Button></form>`,
    ),
    next(`<Button type="submit" onClick={() => router.push("/next")}>Next</Button>`),
    // Shown as a link: ACT-009's requirement, another lint rule.
    next(`<Button variant="link" onClick={() => router.push("/branches")}>All branches</Button>`),
    next(`<button type="button" className="underline" onClick={() => router.push("/fees")}>Late fees</button>`),
    // Going back in history, and a refresh.
    next(`<Button variant="ghost" onClick={() => router.back()}>Back</Button>`),
    next(`<Button onClick={() => router.refresh()}>Reload</Button>`),
    `import { useNavigate } from "react-router-dom";
    export function Back() {
      const navigate = useNavigate();
      return <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>;
    }`,
    // A handler from props, and a navigate that is not traced.
    next(`<Button onClick={onBook}>View appointments</Button>`),
    `export function A({ navigate }) { return <Button onClick={() => navigate("/a")}>Open</Button>; }`,
    // Menu items that wrap a real link, and items that act.
    next(`<DropdownMenuItem asChild><Link href="/pets/bella">Bella</Link></DropdownMenuItem>
      <DropdownMenuItem onSelect={() => setOpen(true)}>Rename</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => router.push("/logout")}>Log out</DropdownMenuItem>`),
    next(`<SidebarMenuButton asChild isActive><Link href="/pets">Pets</Link></SidebarMenuButton>`),
    // Radix Tabs that mirror the open tab in a search param of the same page.
    next(`<Tabs value={tab} onValueChange={(v) => router.push("?tab=" + v)}><TabsList /></Tabs>`),
    next(`<Tabs onValueChange={(v) => router.replace(\`\${pathname}?tab=\${v}\`)}><TabsList /></Tabs>`),
    next(`<Tabs onValueChange={(v) => router.push("#" + v)}><TabsList /></Tabs>`),
    next(`<Tabs defaultValue="account" onValueChange={setTab}><TabsList /></Tabs>`),
    // A command palette item cannot hold a link.
    next(`<CommandItem onSelect={() => router.push("/settings")}>Settings</CommandItem>`),
    // A role on a hand-built control.
    next(`<button role="tab" onClick={() => router.push("/a")}>A</button>`),
  ],
  invalid: [
    // The Don'ts, with their values written out.
    {
      code: next(`<Button onClick={() => router.push("/appointments")}>View appointments</Button>`),
      errors: [{ messageId: "button" }],
    },
    {
      code: next(
        `<Button variant="outline" onClick={() => window.open("https://pharmacy.example.com")}>Open pharmacy site</Button>`,
      ),
      errors: [{ messageId: "button" }],
    },
    {
      code: next(`<DropdownMenuItem onSelect={() => router.push("/pets/bella")}>Bella</DropdownMenuItem>`),
      errors: [{ messageId: "menuItem", data: { what: "DropdownMenuItem" } }],
    },
    // Page numbers as buttons that change the address.
    {
      code: next(`<button type="button" aria-label="Page 3" onClick={() => router.push("?page=3")}>3</button>`),
      errors: [{ messageId: "button" }],
    },
    // Other ways agents write it.
    {
      code: next(`<Button onClick={() => { window.location.href = "/appointments"; }}>View appointments</Button>`),
      errors: [{ messageId: "button" }],
    },
    {
      code: next(`<Button size="sm" onClick={() => router.push(\`/pets/\${pet.id}\`)}>Open {pet.name}</Button>`),
      errors: [{ messageId: "button" }],
    },
    {
      code: next(`<Button onClick={goToPets}>Pets</Button>`, 'const goToPets = () => router.push("/pets");'),
      errors: [{ messageId: "button" }],
    },
    {
      code: `import { useNavigate } from "react-router-dom";
      export function Nav() {
        const navigate = useNavigate();
        return <SidebarMenuButton onClick={() => navigate("/pets")}>Pets</SidebarMenuButton>;
      }`,
      errors: [{ messageId: "menuItem", data: { what: "SidebarMenuButton" } }],
    },
    // Tabs that are routes.
    {
      code: next(`<Tabs value={tab} onValueChange={(v) => router.push("/settings/" + v)}><TabsList /></Tabs>`),
      errors: [{ messageId: "tabs" }],
    },
  ],
});
