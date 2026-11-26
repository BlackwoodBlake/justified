import rule from "../../rules/fields-take-paste.js";
import { run } from "../helpers.js";

const IMPORTS = `
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
`;

run("fields-take-paste", rule, {
  valid: [
    // The Do: plain fields with no paste handler.
    `${IMPORTS}
    export const Claim = () => (<form><Input name="policy" /><Textarea name="happened" /></form>);`,
    // A paste handler that spreads the value across two boxes.
    `${IMPORTS}
    export function Reference() {
      const onPaste = (e) => {
        const all = e.clipboardData.getData("text").replace(/[\\s-]/g, "");
        if (all.length <= 3) return;
        e.preventDefault();
        setA(all.slice(0, 3));
        setB(all.slice(3));
      };
      return (<><Input onPaste={onPaste} /><Input onPaste={onPaste} /></>);
    }`,
    // A handler that hands the event to another function, or cancels only in a condition.
    `${IMPORTS}
    export const F = () => (<><Input onPaste={(e) => handlePaste(e, "ref")} /><Input onPaste={(e) => { if (busy) e.preventDefault(); }} /></>);`,
    // Sign-in fields are FRM-008's.
    `${IMPORTS}
    export const SignIn = () => (
      <form>
        <Input autoComplete="username" onPaste={(e) => e.preventDefault()} />
        <Input type="password" autoComplete="current-password" onPaste={(e) => e.preventDefault()} />
        <Input autoComplete="one-time-code" onPaste={() => false} />
      </form>
    );`,
    // A password field whose purpose the code does not state may be either rule's.
    `${IMPORTS}
    export const P = () => (<><Input type="password" onPaste={(e) => e.preventDefault()} /><Input type={shown ? "text" : "password"} onPaste={(e) => e.preventDefault()} /></>);`,
    // A sign-in form that cancels paste, and a page listener in a file with a sign-in field.
    `${IMPORTS}
    document.addEventListener("paste", (e) => e.preventDefault());
    export const SignIn = () => (
      <form onPaste={(e) => e.preventDefault()}><Input autoComplete="username" /><Input type="password" autoComplete="current-password" /></form>
    );`,
    // A checkbox is not a text field; a listener that inserts the text itself.
    `${IMPORTS}
    document.addEventListener("paste", (e) => insert(e.clipboardData.getData("text")));
    export const C = () => (<input type="checkbox" onPaste={(e) => e.preventDefault()} />);`,
    // A listener on another element, which may be a typing test.
    `${IMPORTS}
    test.current.addEventListener("paste", (e) => e.preventDefault());
    export const T = () => <Textarea ref={test} />;`,
  ],
  invalid: [
    // The Don't: Confirm account number refuses paste.
    {
      code: `${IMPORTS}
      export const Confirm = () => (<Input inputMode="numeric" aria-label="Confirm account number" onPaste={(e) => e.preventDefault()} />);`,
      errors: [{ messageId: "pasteBlocked" }],
    },
    // New passwords take paste (FRM-008 leaves them out, this guideline asks for it).
    {
      code: `${IMPORTS}
      function noPaste(e) {
        e.preventDefault();
        toast("Please type your password again");
      }
      export const New = () => (<Input type="password" autoComplete="new-password" onPaste={noPaste} />);`,
      errors: [{ messageId: "pasteBlocked" }],
    },
    {
      code: `${IMPORTS}
      export const What = () => (<><Textarea onPaste={() => false} /><input type="email" onpaste="return false" /></>);`,
      errors: [{ messageId: "pasteBlocked" }, { messageId: "pasteBlocked" }],
    },
    // A form that cancels paste for every field in it.
    {
      code: `${IMPORTS}
      export const Claim = () => (<form onPasteCapture={(e) => e.preventDefault()}><Input name="policy" /></form>);`,
      errors: [{ messageId: "pasteBlocked" }],
    },
    // The whole page.
    {
      code: `${IMPORTS}
      useEffect(() => {
        const block = (e) => e.preventDefault();
        document.addEventListener("paste", block);
        return () => document.removeEventListener("paste", block);
      }, []);`,
      errors: [{ messageId: "pageBlocked" }],
    },
  ],
});
