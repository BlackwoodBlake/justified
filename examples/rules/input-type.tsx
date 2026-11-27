import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { useLayoutEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";

/*
 * For FRM-014, FRM-014a and FRM-014b. The keyboard a phone shows cannot be
 * seen on a desktop, so each field is followed by a small readout of what the
 * browser was told: the type, the inputmode, the autocomplete value, and the
 * keyboard a phone would pick from them. The readout reads the field itself
 * and is hidden from assistive technology, which already meets the real field.
 *
 * "Value" modes make the harm of a number input tryable with the keyboard:
 * press the arrow keys, or scroll over the focused field, and the readout
 * shows what the form would receive.
 *
 * Watch is the readout around a field. A Don't writes its field out itself
 * inside Watch, so the mistake stays in the example file; Probe is Watch
 * around a field the Do examples configure with props.
 *
 * For the examples only. It is not a component of the system.
 */

/** Which keyboard a phone would show. inputmode wins over the type. */
export function keyboardFor(type: string, inputMode: string | null, pattern?: string | null): string {
  if (inputMode === "numeric") return "digit keypad";
  if (inputMode === "decimal") return "digit keypad with a decimal key";
  if (inputMode === "tel" || type === "tel") return "phone keypad";
  if (type === "email") return "email keyboard, @ and . on the first layout";
  if (type === "url") return "web keyboard, . and / on the first layout";
  if (type === "number") return "digit keypad";
  if (pattern === "[0-9]*")
    return "standard keyboard on most phones; Safari on iPhone treats this pattern as a keypad hint, so it is not reliable";
  return "standard keyboard, digits and symbols behind a layout switch";
}

type Facts = {
  type: string;
  inputMode: string | null;
  autoComplete: string | null;
  pattern: string | null;
  value: string;
  asNumber: string;
  accepted: boolean;
};

function read(el: HTMLInputElement): Facts {
  const n = el.valueAsNumber;
  return {
    type: el.type,
    inputMode: el.getAttribute("inputmode"),
    autoComplete: el.getAttribute("autocomplete"),
    pattern: el.getAttribute("pattern"),
    value: el.value,
    asNumber: Number.isNaN(n) ? "" : String(n),
    accepted: el.validity.valid,
  };
}

/** A field (as children) with a readout of its attributes. What the readout adds is set by `also`, as for Probe. */
export function Watch({
  children,
  also,
  digits,
}: {
  children: ReactNode;
  also?: "number" | "text" | "check" | "keys" | "scheme";
  digits?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [f, setF] = useState<Facts | null>(null);
  const update = () => {
    const el = box.current?.querySelector("input");
    if (el) setF(read(el));
  };

  useLayoutEffect(update, []);

  const absent = (v: string | null | undefined) => (v ? `"${v}"` : "not set");
  return (
    <div ref={box} onInput={update} onKeyUp={update} onWheel={update} onFocus={update}>
      {children}
      <div
        aria-hidden="true"
        className="mt-1 grid gap-0.5 rounded-md border border-dashed border-border px-2 py-1.5 font-mono text-xs text-muted-foreground"
      >
        <span>
          type=<b className="font-semibold text-foreground">&quot;{f?.type ?? "text"}&quot;</b> inputmode=
          <b className="font-semibold text-foreground">{absent(f?.inputMode)}</b> autocomplete=
          <b className="font-semibold text-foreground">{absent(f?.autoComplete)}</b>
          {f?.pattern ? (
            <>
              {" "}
              pattern=<b className="font-semibold text-foreground">&quot;{f.pattern}&quot;</b>
            </>
          ) : null}
        </span>
        <span className="font-sans">
          Phone shows: <b className="font-semibold text-foreground">{f ? keyboardFor(f.type, f.inputMode, f.pattern) : ""}</b>
        </span>
        {also === "number" && f && (
          <>
            <span>
              the form gets: <b className="break-all font-semibold text-foreground">{f.value || "(empty)"}</b>
            </span>
            <span>
              read as a number: <b className="break-all font-semibold text-foreground">{f.asNumber || "(nothing)"}</b>
            </span>
          </>
        )}
        {also === "text" && f && (
          <>
            <span>
              read as text: <b className="break-all font-semibold text-foreground">{f.value || "(empty)"}</b>
            </span>
            <span className="font-sans">
              {digits} digits once spaces are removed:{" "}
              <b className="font-semibold text-foreground">
                {new RegExp(`^\\d{${digits}}$`).test(f.value.replace(/\s/g, "")) ? "yes" : "no"}
              </b>
            </span>
          </>
        )}
        {also === "check" && f && (
          <span className="font-sans">
            Browser&apos;s own check:{" "}
            <b className="font-semibold text-foreground">{f.accepted ? "accepts this value" : "refuses this value"}</b>
          </span>
        )}
        {also === "scheme" && f && (
          <span className="font-sans">
            Sent as:{" "}
            <b className="break-all font-semibold text-foreground">
              {f.value.trim() ? (/^[a-z][a-z0-9+.-]*:\/\//i.test(f.value.trim()) ? f.value.trim() : `https://${f.value.trim()}`) : "(nothing)"}
            </b>
          </span>
        )}
        {also === "keys" && f && <MissingKeys value={f.value} inputMode={f.inputMode} />}
      </div>
    </div>
  );
}

export type ProbeProps = Omit<ComponentProps<"input">, "ref"> & {
  label: string;
  /**
   * What the readout adds under the attributes:
   * "number" the value as typed and as a number, "text" the value and whether
   * it is exactly digits, "check" whether the browser's own check accepts it,
   * "keys" the characters the keypad has no key for, "scheme" the address
   * as it would be sent once the scheme is added.
   */
  also?: "number" | "text" | "check" | "keys" | "scheme";
  /** For "text": the length the digits must have. */
  digits?: number;
};

/** A labelled field with a readout of its attributes. */
export function Probe({ label, also, digits, className, ...input }: ProbeProps) {
  return (
    <Watch also={also} digits={digits}>
      <Field label={label}>
        <Input className={className} {...input} />
      </Field>
    </Watch>
  );
}

function MissingKeys({ value, inputMode }: { value: string; inputMode: string | null }) {
  const allowed = inputMode === "decimal" ? /[0-9.,]/ : /[0-9]/;
  const missing = [...new Set([...value].filter((c) => !allowed.test(c)))];
  return (
    <span className="font-sans">
      Keys this keypad lacks for the value:{" "}
      <b className="font-semibold text-foreground">{missing.length ? missing.join(" ") : "none"}</b>
    </span>
  );
}

export const probeBox = "grid w-full max-w-sm gap-4 rounded-lg border border-border bg-background p-4";
