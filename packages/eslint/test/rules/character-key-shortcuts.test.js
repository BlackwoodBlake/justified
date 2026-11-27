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
    // Since the review of 0.1.1: a key counts as a modifier shortcut only when its action runs only with the modifier held.
    // Cmd+K: the action runs only with the modifier
    `
    useEffect(() => { const on = (e: KeyboardEvent) => { if (e.key === "k") { if (e.metaKey || e.ctrlKey) { e.preventDefault(); setOpen((o) => !o) } } }; document.addEventListener("keydown", on); return () => document.removeEventListener("keydown", on) }, [])`,
    // The action runs only with the modifier, after an early exit for every other key.
    `useEffect(() => { const on = (e: KeyboardEvent) => { if (e.key !== "k") return; if (e.metaKey || e.ctrlKey) { e.preventDefault(); toggle(); } }; document.addEventListener("keydown", on); return () => document.removeEventListener("keydown", on) }, [])`,
    `useEffect(() => { const on = (e: KeyboardEvent) => { if (e.key === "b" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); toggleSidebar(); } }; window.addEventListener("keydown", on); return () => window.removeEventListener("keydown", on) }, [])`,
    // A tracking call before a Cmd shortcut is not its action
    `
    export function A() {
      useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === "k") { track("key"); if (e.metaKey) open() } }
        window.addEventListener("keydown", h)
        return () => window.removeEventListener("keydown", h)
      }, [])
    }`,
    // Keeping the last key in a ref is not the action
    `
    export function A() { const last = useRef(""); useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === "k") { last.current = e.key; if (e.metaKey) open() } }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h) }, []) }`,
    // A console.log before a Cmd shortcut is not its action
    `
    export function A() { useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === "k") { console.log("k"); if (e.metaKey) open() } }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h) }, []) }`,
  ],
  invalid: [
    {
      // useHotkeys with a list of single keys whose callback reads the pressed keys
      code: `
      import { useHotkeys } from "react-hotkeys-hook"
      export function A() { useHotkeys(["j", "k"], (e, h) => (h.keys?.[0] === "j" ? next() : prev())) }`,
      errors: [{ messageId: "plain" }],
    },
    {
      // A branch that returns when a modifier is held still acts on the plain key
      code: `
      useEffect(() => { const on = (e: KeyboardEvent) => { if (e.key === "/") { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); focusSearch() } }; document.addEventListener("keydown", on); return () => document.removeEventListener("keydown", on) }, [])`,
      errors: [{ messageId: "plain" }],
    },
    {
      // The same after an early exit for other keys
      code: `
      useEffect(() => { const on = (e: KeyboardEvent) => { if (e.key !== "/") return; if (e.ctrlKey || e.metaKey || e.altKey) return; e.preventDefault(); focusSearch() }; window.addEventListener("keydown", on); return () => window.removeEventListener("keydown", on) }, [])`,
      errors: [{ messageId: "plain" }],
    },
    {
      // A ternary that picks one action with Alt and another without still acts on the key alone
      code: `
      useEffect(() => { const on = (e: KeyboardEvent) => { if (e.key === "?") { e.altKey ? openAbout() : openHelp() } }; document.addEventListener("keydown", on); return () => document.removeEventListener("keydown", on) }, [])`,
      errors: [{ messageId: "shift" }],
    },
    {
      // A switch case that checks only Shift
      code: `
      useEffect(() => { const on = (e: KeyboardEvent) => { switch (e.key) { case "e": if (e.shiftKey) archiveAll(); else archive(); break } }; document.addEventListener("keydown", on); return () => document.removeEventListener("keydown", on) }, [])`,
      errors: [{ messageId: "plain" }],
    },
    {
      // A switch case that reads Cmd only for logging
      code: `
      useEffect(() => { const on = (e: KeyboardEvent) => { switch (e.key) { case "e": track(e.metaKey ? "cmd-e" : "e"); closeTicket(); break } }; document.addEventListener("keydown", on); return () => document.removeEventListener("keydown", on) }, [])`,
      errors: [{ messageId: "plain" }],
    },
    {
      // A plain key after a Cmd shortcut in the same handler
      code: `
      useEffect(() => { const on = (e: KeyboardEvent) => { if (e.key === "k") { if (e.metaKey) open() } if (e.key === "/") focusSearch() }; document.addEventListener("keydown", on); return () => document.removeEventListener("keydown", on) }, [])`,
      errors: [{ messageId: "plain" }],
    },
    {
      // A modifier read after the action does not guard it
      code: `
      useEffect(() => { const on = (e: KeyboardEvent) => { if (e.key !== "/") return; focusSearch(); if (e.metaKey) track("meta") }; document.addEventListener("keydown", on); return () => document.removeEventListener("keydown", on) }, [])`,
      errors: [{ messageId: "plain" }],
    },
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
