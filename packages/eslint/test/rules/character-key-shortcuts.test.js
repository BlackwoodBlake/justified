import rule from "../../rules/character-key-shortcuts.js";
import { run } from "../helpers.js";

const hk = `import { useHotkeys } from "react-hotkeys-hook";\n`;
const tk = `import { tinykeys } from "tinykeys";\n`;
const mt = `import Mousetrap from "mousetrap";\n`;
const plain = [{ messageId: "plain" }];
const shift = [{ messageId: "shift" }];

run("character-key-shortcuts", rule, {
  valid: [
    // Ctrl, Alt or Cmd: outside the rule.
    `${hk}export function Menu() { useHotkeys("mod+k", () => setOpen(true)); return null; }`,
    `${hk}export function Menu() { useHotkeys("ctrl+k, meta+k", open); return null; }`,
    `${hk}export function A() { useHotkeys("alt+shift+n", newInvoice); return null; }`,
    `${tk}useEffect(() => tinykeys(window, { "$mod+KeyK": () => setOpen(true) }), []);`,
    `${mt}Mousetrap.bind("mod+s", save);`,
    // shadcn's sidebar toggle and command menu.
    `useEffect(() => {
      const down = (e) => {
        if (e.key === "b" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); toggleSidebar(); }
      };
      window.addEventListener("keydown", down);
      return () => window.removeEventListener("keydown", down);
    }, [toggleSidebar]);`,
    `useEffect(() => {
      const down = (e: KeyboardEvent) => {
        if (e.key === "j" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen((open) => !open); }
      };
      document.addEventListener("keydown", down);
      return () => document.removeEventListener("keydown", down);
    }, []);`,
    `document.addEventListener("keydown", (e) => { if (!(e.metaKey || e.ctrlKey)) return; if (e.key === "k") open(); });`,
    `document.addEventListener("keydown", (e) => { const mod = e.ctrlKey || e.metaKey; if (mod && e.key === "k") open(); });`,
    // The modifier checked inside the branch for the key: Cmd+K or Ctrl+K, outside KBD-003.
    `document.addEventListener("keydown", (e) => { if (e.key === "k") { if (e.metaKey || e.ctrlKey) { e.preventDefault(); setOpen(true); } } });`,
    `document.addEventListener("keydown", (e) => { if (e.key !== "k") return; if (!(e.metaKey || e.ctrlKey)) return; setOpen(true); });`,
    `document.addEventListener("keydown", (e) => { switch (e.key) { case "k": if (e.metaKey) setOpen(true); break; } });`,
    `document.addEventListener("keydown", (e) => { e.key === "k" && (e.metaKey || e.ctrlKey) && setOpen(true); });`,
    `window.addEventListener("keydown", (e) => { if (e.getModifierState("Control") && e.key === "s") save(); });`,
    // Keys outside the criterion.
    `document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });`,
    `window.addEventListener("keydown", (e) => { switch (e.key) { case "ArrowDown": next(); break; case "Enter": pick(); } });`,
    `${hk}export function A() { useHotkeys("esc", close); return null; }`,
    `${tk}tinykeys(window, { Escape: close, "ArrowUp": up });`,
    // Focus-bound: a kept ref, an element target, a component's own onKeyDown.
    `${hk}export function List() { const ref = useHotkeys<HTMLUListElement>("j", next); return <ul ref={ref} tabIndex={0} />; }`,
    `${tk}useEffect(() => tinykeys(listRef.current, { j: next, k: prev }), []);`,
    `${mt}new Mousetrap(formRef.current).bind("e", edit);`,
    `<ul onKeyDown={(e) => { if (e.key === "j") next(); }} />`,
    `useEffect(() => { const el = ref.current; el.addEventListener("keydown", (e) => { if (e.key === "e") edit(); }); }, []);`,
    // A way out the code shows: an enabled option, a setting read in the handler or around the listener.
    `${hk}export function A({ singleKeys }) { useHotkeys("e", closeTicket, { enabled: singleKeys }); return null; }`,
    `${hk}export function A() { useHotkeys("e", () => { if (!settings.singleKeys) return; closeTicket(); }); return null; }`,
    `document.addEventListener("keydown", (e) => { if (!singleKeys) return; if (e.key === "/") focusSearch(); });`,
    `document.addEventListener("keydown", (e) => { if (enabled && e.key === "e") closeTicket(); });`,
    `useEffect(() => {
      if (!shortcutsOn) return;
      const down = (e) => { if (e.key === "e") closeTicket(); };
      document.addEventListener("keydown", down);
      return () => document.removeEventListener("keydown", down);
    }, [shortcutsOn]);`,
    `${tk}useEffect(() => { if (!prefs.singleKey) return; return tinykeys(window, { e: closeTicket }); }, [prefs]);`,
    // An event check through a function the rule cannot read.
    `document.addEventListener("keydown", (e) => { if (!hasModifier(e)) return; if (e.key === "e") closeTicket(); });`,
    // Options the code does not state.
    `${hk}export function A() { useHotkeys("e", closeTicket, options); return null; }`,
    // A key the handler skips, not one it acts on.
    `document.addEventListener("keydown", (e) => { if (e.key === "a") return; log(e); });`,
    // Not a key event, or not a character comparison.
    `document.addEventListener("click", (e) => { if (e.key === "e") x(); });`,
    `document.addEventListener("keydown", (e) => { if (e.key === shortcut) run(); });`,
    // A Space or Enter key.
    `window.addEventListener("keydown", (e) => { if (e.key === " ") togglePlay(); });`,
  ],
  invalid: [
    // The KBD-003 Don'ts, written out.
    { code: `${hk}export function Layout() { useHotkeys("e", closeTicket); return null; }`, errors: plain },
    {
      code: `useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
          const t = e.target as HTMLElement;
          if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) return;
          if (e.key === "/") { e.preventDefault(); searchRef.current?.focus(); }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
      }, []);`,
      errors: plain,
    },
    {
      code: `${hk}export function Drafts() { useHotkeys("shift+d", deleteDraft); return null; }`,
      errors: shift,
    },
    {
      code: `window.addEventListener("keydown", (e) => { if (e.shiftKey && e.key === "D" && !e.ctrlKey) deleteDraft(); });`,
      errors: shift,
    },
    { code: `document.addEventListener("keydown", (e) => { if (e.key === "?") setHelpOpen(true); });`, errors: shift },
    // Sequences and lists.
    { code: `${tk}useEffect(() => tinykeys(window, { "g t": goToTickets }), []);`, errors: plain },
    { code: `${tk}useEffect(() => tinykeys(document, { "Shift+D": deleteDraft, "$mod+K": open }), []);`, errors: shift },
    { code: `${mt}Mousetrap.bind(["?", "g i"], showHelp);`, errors: plain },
    { code: `${hk}export function A() { useHotkeys("mod+k, /", open); return null; }`, errors: plain },
    // A guard for text fields only, and modifiers ruled out.
    {
      code: `document.addEventListener("keydown", (e) => { if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return; switch (e.key) { case "e": closeTicket(); break; } });`,
      errors: plain,
    },
    {
      code: `window.onkeydown = (event) => { if (event.key.length === 1 && !event.ctrlKey) typeahead(event.key); };`,
      errors: plain,
    },
    { code: `const KEYS = ["/", "e"];\nwindow.addEventListener("keydown", (e) => { if (KEYS.includes(e.key)) act(e.key); });`, errors: plain },
    { code: `window.addEventListener("keydown", ({ key }) => { if (key.toLowerCase() === "e") closeTicket(); });`, errors: plain },
    { code: `${hk}export function A() { useHotkeys("e", closeTicket, { enableOnFormTags: false }, []); return null; }`, errors: plain },
  ],
});
