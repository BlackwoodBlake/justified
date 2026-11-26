import rule from "../../rules/state-in-code.js";
import { run } from "../helpers.js";

const lookOnly = [{ messageId: "lookOnly" }];
const fadedOnly = [{ messageId: "fadedOnly" }];
const fixedState = [{ messageId: "fixedState" }];
const wrapperState = [{ messageId: "wrapperState" }];
const offStillRuns = [{ messageId: "offStillRuns" }];

run("state-in-code", rule, {
  valid: [
    // The VIS-008a Dos, written out.
    `<Button variant="outline" aria-pressed={isFavourite} onClick={() => setFavourite(!isFavourite)} className={cn(isFavourite && "bg-accent")}>Favourite</Button>`,
    `<button aria-pressed={on} onClick={() => setOn(!on)} className="aria-pressed:bg-primary aria-pressed:text-primary-foreground">Mute</button>`,
    `<Toggle aria-label="Bold" pressed={bold} onPressedChange={setBold} className={bold ? "bg-accent" : ""}>B</Toggle>`,
    `<Button variant="outline" aria-expanded={open} onClick={() => setOpen(!open)}>Show filters <ChevronDown className={cn(open && "rotate-180")} /></Button>`,
    `<Card onClick={() => setPlan("pro")} className={cn(plan === selectedPlan && "border-primary")}><RadioGroupItem value="pro" id="pro" /></Card>`,
    `<div role="option" aria-selected={selected} onClick={pick} className={cn(selected && "bg-accent")}>Leeds</div>`,
    // The name follows the state.
    `<Button onClick={() => setPlaying(!playing)} className={playing ? "bg-accent" : ""}>{playing ? "Pause" : "Play"}</Button>`,
    `<li onClick={() => pick(i)} className={cn(i === activeIndex && "bg-accent")}>{t.title}{i === activeIndex && <span className="sr-only">(selected)</span>}</li>`,
    // Not a control, not a look, or a stateful component.
    `<ChevronDown className={cn("size-4", open && "rotate-180")} />`,
    `<div className={cn(active && "bg-accent")}>Panel</div>`,
    `<Button onClick={save} className={cn(active && "hidden")}>Save</Button>`,
    `<TabsTrigger value="a" className={cn(active && "font-bold")} onClick={x}>A</TabsTrigger>`,
    `<Link href="/plants" onClick={close} className={cn(active && "text-primary")}>Plants</Link>`,
    `<Button {...props} onClick={toggle} className={cn(on && "bg-accent")}>Mute</Button>`,
    // A value the click changes that is not the control's state.
    `<Button onClick={() => setCount(count + 1)} className={cn(count > 5 && "text-destructive")}>Add</Button>`,
    // A pictured button that does nothing, and a guard in a function the file declares.
    `<Button variant="outline" tabIndex={-1} className={waits ? "opacity-50" : undefined}>Cancel</Button>`,
    `function send(guard) { if (guard && busy.current) return; post(); }\n<Button aria-disabled={guarded || undefined} onClick={() => send(guardClick)}>Send</Button>`,
    // Faded while off in code.
    `<Button disabled={sending} className={cn(sending && "opacity-50")}>Send</Button>`,
    `<Button aria-disabled={locked} className={cn(locked && "cursor-not-allowed opacity-50")} onClick={() => { if (locked) return; rename(); }}>Rename</Button>`,
    `<button className="disabled:opacity-50 disabled:pointer-events-none">Send</button>`,
    `<div className={cn(loading && "pointer-events-none opacity-50")}>List</div>`,
    // States bound to a value.
    `<Button aria-pressed={bold} onClick={() => setBold(!bold)}>Bold</Button>`,
    `<a href="/plants" aria-current="page">Plants</a>`,
    `<div aria-expanded="false">Static</div>`,
    `<li role="option" aria-selected={selected}><span>Leeds</span></li>`,
    `<li aria-selected={selected}>Leeds</li>`,
    // aria-disabled with a guard, or a handler the file does not show.
    `<Button aria-disabled={!canSave} onClick={() => { if (!canSave) return; save(); }}>Save</Button>`,
    `<Button aria-disabled={!canSave} onClick={() => canSave && save()}>Save</Button>`,
    `<Button aria-disabled={!canSave} onClick={save}>Save</Button>`,
    `const save = () => { if (!canSave) { setHint(true); return; } send(); };\n<Button aria-disabled={!canSave} onClick={save}>Save</Button>`,
  ],
  invalid: [
    // The VIS-008a Don'ts, written out.
    { code: `<Button variant="outline" onClick={() => setBold(!bold)} className={bold ? "bg-accent" : ""}>Bold</Button>`, errors: lookOnly },
    {
      code: `<Card onClick={() => setDelivery(o.id)} className={cn("cursor-pointer p-4", delivery === o.id && "border-primary")}>{o.title}</Card>`,
      errors: [{ messageId: "lookOnly" }],
    },
    { code: `<Card onClick={() => setDelivery(o.id)} className={cn("p-4", { "border-primary": o.id === selectedId })}>{o.title}</Card>`, errors: lookOnly },
    { code: `<button onClick={() => setOn(!on)} className={\`rounded-md \${on ? "bg-primary text-primary-foreground" : "bg-background"}\`}>Mute</button>`, errors: lookOnly },
    { code: `<Button onClick={() => setOpen(!open)} className={cn(open && "bg-accent")}>Show filters</Button>`, errors: lookOnly },
    { code: `<Button variant={isActive ? "default" : "outline"} onClick={() => setActive(!isActive)}>Grid view</Button>`, errors: lookOnly },
    { code: `<Button onClick={save} className={cn(isSaving && "pointer-events-none opacity-50")}>Save</Button>`, errors: fadedOnly },
    { code: `<a href="/next" className={cn(last && "pointer-events-none cursor-not-allowed")}>Next</a>`, errors: fadedOnly },
    { code: `<Button aria-pressed={true} onClick={() => setBold(!bold)}>Bold</Button>`, errors: fixedState },
    { code: `<button aria-expanded="false" onClick={() => setOpen(!open)}>Show filters</button>`, errors: fixedState },
    { code: `<li aria-selected={selected}><button onClick={pick}>Leeds</button></li>`, errors: wrapperState },
    { code: `<Button aria-disabled="true" onClick={() => rename()}>Rename</Button>`, errors: offStillRuns },
    { code: `<Button aria-disabled={!canSave} onClick={() => save(form)}>Save</Button>`, errors: offStillRuns },
  ],
});
