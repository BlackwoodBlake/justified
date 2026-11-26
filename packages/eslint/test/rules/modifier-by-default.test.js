import rule from "../../rules/modifier-by-default.js";
import { run } from "../helpers.js";

const hk = `import { useHotkeys } from "react-hotkeys-hook";\n`;
const tk = `import { tinykeys } from "tinykeys";\n`;
const mt = `import Mousetrap from "mousetrap";\n`;
const startsOn = [{ messageId: "startsOn" }];

run("modifier-by-default", rule, {
  valid: [
    // The KBD-003b Do examples, written out.
    `${hk}export function Invoices() { useHotkeys("mod+k", () => setOpen(true)); return null; }`,
    `window.addEventListener("keydown", (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(true); } });`,
    `window.addEventListener("keydown", (e) => { if (e.altKey && e.shiftKey && e.code === "KeyN") newInvoice(); });`,
    `${tk}tinykeys(window, { "$mod+KeyK": open, "Alt+Shift+KeyN": newInvoice });`,
    // Single keys only after the person turns them on.
    `${hk}export function Invoices() {
      const [singleKeys, setSingleKeys] = useState(false);
      useHotkeys("n", newInvoice, { enabled: singleKeys });
      return <Switch checked={singleKeys} onCheckedChange={setSingleKeys} />;
    }`,
    `document.addEventListener("keydown", (e) => { if (!prefs.singleKeyShortcuts) return; if (e.key === "n") newInvoice(); });`,
    `const [useSingleKeyShortcuts, setUse] = useState(false);`,
    `const [singleKey, setSingleKey] = useLocalStorage("single-key-shortcuts", false);`,
    // Shift alone meets this rule's default (KBD-003 asks for a way out).
    `${hk}export function A() { useHotkeys("shift+n", newInvoice); return null; }`,
    `window.addEventListener("keydown", (e) => { if (e.shiftKey && e.key === "N") newInvoice(); });`,
    `document.addEventListener("keydown", (e) => { if (e.key === "?") setHelpOpen(true); });`,
    // Focus-bound keys and the standard keys of a control.
    `${hk}export function List() { const ref = useHotkeys("j", next); return <ul ref={ref} tabIndex={0} />; }`,
    `<ul onKeyDown={(e) => { if (e.key === "j") next(); if (e.key === "k") prev(); }} />`,
    `${tk}tinykeys(canvasRef.current, { b: brush, e: eraser });`,
    `document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });`,
    `${hk}export function A() { useHotkeys("escape", close); useHotkeys("enter", pick); return null; }`,
    // A state that starts on but is not a single-key setting.
    `const [open, setOpen] = useState(true);`,
    `const [shortcutsHelpOpen, setOpen] = useState(true);`,
    // The KBD-003b Don't and other page-wide single-key bindings with no
    // gate: character-key-shortcuts (KBD-003) reports them, and this rule
    // does not repeat the report.
    `${hk}export function Invoices() { useHotkeys("n", newInvoice); return null; }`,
    `${hk}export function A() { useHotkeys("/", () => searchRef.current?.focus()); return null; }`,
    `useEffect(() => {
        const down = (e: KeyboardEvent) => {
          if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
          typeahead(e.key);
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
      }, []);`,
    `window.addEventListener("keydown", (e) => { if (e.key === "n" && !e.metaKey) newInvoice(); });`,
    `${tk}useEffect(() => tinykeys(window, { n: newInvoice }), []);`,
    `${mt}Mousetrap.bind("g i", goToInbox);`,
  ],
  invalid: [
    // A setting for single-key shortcuts that starts on.
    { code: `const [singleKeyShortcuts, setSingleKeyShortcuts] = useState(true);`, errors: startsOn },
    { code: `const [on, setOn] = useLocalStorage("characterKeyShortcuts", true);`, errors: startsOn },
  ],
});
