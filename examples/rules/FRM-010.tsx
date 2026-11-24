import { Button } from "@blackwoodblake/justified-shadcn/button";
import { Checkbox } from "@blackwoodblake/justified-shadcn/checkbox";
import { Field, FieldSet } from "@blackwoodblake/justified-shadcn/field";
import { Input } from "@blackwoodblake/justified-shadcn/input";
import { NativeSelect } from "@blackwoodblake/justified-shadcn/native-select";
import { RadioGroup, RadioGroupItem } from "@blackwoodblake/justified-shadcn/radio-group";
import { Textarea } from "@blackwoodblake/justified-shadcn/textarea";
import { useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

import type { RuleExamples } from "./frame";

/*
 * FRM-010: every form control has a name in code, and when it shows label
 * text, the name contains that text.
 *
 * Both examples are the form "Book a swimming course", and under it a list of
 * the name each control carries in code. The list is worked out from what the
 * example itself sets (label tied with for/id, aria-labelledby, aria-label,
 * the legend of a fieldset). It is hidden from assistive technology, which
 * hears the real names, and it is not a screen reader.
 *
 * The Do ties every label to its control and the group question to its
 * group. The Don't has the same words on screen but leaves the names wrong:
 * one untied label, one aria-label that replaces the visible word, and a
 * question that is plain text over the options.
 */

const text = (el: Element | null | undefined) => (el?.textContent ?? "").replace(/\s+/g, " ").trim();

const byIds = (el: Element) =>
  (el.getAttribute("aria-labelledby") ?? "")
    .split(/\s+/)
    .map((id) => text(el.ownerDocument.getElementById(id)))
    .join(" ")
    .trim();

/** The name the example sets on a control: aria-labelledby, aria-label, then a label tied to it. */
function nameOfControl(el: HTMLElement): string {
  const labelled = byIds(el);
  if (labelled) return labelled;
  const label = el.getAttribute("aria-label")?.trim();
  if (label) return label;
  const labels = (el as HTMLInputElement).labels;
  return labels ? [...labels].map(text).join(" ").trim() : "";
}

/** The name of the group a radio button belongs to: a fieldset's legend, or a named radiogroup. */
function nameOfGroup(el: HTMLElement): string {
  const group = el.closest("[role='radiogroup']");
  if (group) {
    const named = byIds(group) || group.getAttribute("aria-label")?.trim();
    if (named) return named;
  }
  return text(el.closest("fieldset")?.querySelector(":scope > legend"));
}

const kinds: Record<string, string> = {
  checkbox: "checkbox",
  radio: "radio button",
  switch: "switch",
};

function kindOf(el: HTMLElement): string {
  const role = el.getAttribute("role");
  if (role && kinds[role]) return kinds[role];
  if (el instanceof HTMLSelectElement) return "select";
  if (el instanceof HTMLTextAreaElement) return "text area";
  return "text field";
}

type Row = { kind: string; name: string; group?: string };

const CONTROLS = "input, select, textarea, [role='checkbox'], [role='radio'], [role='switch']";

/** Lists the name of every control in the scene, as the example sets them. */
function Names({ scope }: { scope: React.RefObject<HTMLElement | null> }) {
  const [rows, setRows] = useState<Row[]>([]);

  useLayoutEffect(() => {
    if (!scope.current) return;
    setRows(
      [...scope.current.querySelectorAll<HTMLElement>(CONTROLS)]
        // Radix keeps a hidden copy of each control for forms; the visible button is the control.
        .filter((el) => !(el instanceof HTMLInputElement && el.getAttribute("aria-hidden") === "true"))
        .map((el) => ({
          kind: kindOf(el),
          name: nameOfControl(el),
          group: el.getAttribute("role") === "radio" ? nameOfGroup(el) : undefined,
        })),
    );
  }, [scope]);

  return (
    <div
      aria-hidden="true"
      className="w-full rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground"
    >
      <p className="m-0">Name of each control in code:</p>
      <ol className="m-0 mt-1 list-none p-0">
        {rows.map((r, i) => (
          <li key={i} className="py-0.5">
            <span>{r.kind}: </span>
            {r.name ? (
              <span className="font-medium text-foreground">“{r.name}”</span>
            ) : (
              <span className="font-semibold text-destructive">no name</span>
            )}
            {r.group !== undefined && (
              <span>
                {" "}
                in group{" "}
                {r.group ? (
                  <span className="font-medium text-foreground">“{r.group}”</span>
                ) : (
                  <span className="font-semibold text-destructive">no name</span>
                )}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

const box = "grid w-full gap-4 rounded-lg border border-border bg-background p-4";

function Course({ children, scope }: { children: ReactNode; scope: React.RefObject<HTMLFormElement | null> }) {
  const send = (e: FormEvent) => e.preventDefault();
  return (
    <form ref={scope} noValidate onSubmit={send} className={box}>
      <h4 className="m-0 text-base font-semibold">Book a swimming course</h4>
      {children}
      <div>
        <Button type="submit">Book course</Button>
      </div>
    </form>
  );
}

function Tied() {
  const scope = useRef<HTMLFormElement>(null);
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Course scope={scope}>
        {/* Field ties each label to its control with for and id, so the name is the label's own words. */}
        <Field label="Swimmer's school" required>
          <Input autoComplete="off" />
        </Field>
        <Field label="Pool">
          <NativeSelect defaultValue="north">
            <option value="north">Northside</option>
            <option value="harbour">Harbour</option>
          </NativeSelect>
        </Field>
        {/* The hint is a description, so it stays out of the name. */}
        <Field label="Pool card number" hint="Eight digits, on the back of your card" required>
          <Input inputMode="numeric" autoComplete="off" />
        </Field>
        <Field label="Notes for the teacher" optionalText="(optional)" mark>
          <Textarea rows={2} />
        </Field>
        <FieldSet legend="When can the swimmer come?">
          <RadioGroup defaultValue="before">
            <Field label="Before school" layout="inline">
              <RadioGroupItem value="before" />
            </Field>
            <Field label="After school" layout="inline">
              <RadioGroupItem value="after" />
            </Field>
          </RadioGroup>
        </FieldSet>
        <Field label="Tell me when a place becomes free" layout="inline">
          <Checkbox />
        </Field>
      </Course>
      <Names scope={scope} />
    </div>
  );
}

function Untied() {
  const scope = useRef<HTMLFormElement>(null);
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Course scope={scope}>
        <Field label="Swimmer's school" required>
          <Input autoComplete="off" />
        </Field>
        {/* The aria-label replaces the visible word "Pool" as the name. */}
        <Field label="Pool">
          <NativeSelect defaultValue="north" aria-label="Venue">
            <option value="north">Northside</option>
            <option value="harbour">Harbour</option>
          </NativeSelect>
        </Field>
        <Field label="Pool card number" hint="Eight digits, on the back of your card" required>
          <Input inputMode="numeric" autoComplete="off" />
        </Field>
        {/* The words are on screen, but nothing ties them to the text area. */}
        <div className="flex flex-col">
          <p className="m-0 text-sm font-medium text-foreground">
            Notes for the teacher <span className="font-normal text-muted-foreground">(optional)</span>
          </p>
          <div className="mt-2">
            <Textarea rows={2} />
          </div>
        </div>
        {/* A plain paragraph over the options, not tied to the group. */}
        <div className="flex flex-col">
          <p className="m-0 text-sm font-medium text-foreground">When can the swimmer come?</p>
          <div className="mt-3">
            <RadioGroup defaultValue="before">
              <Field label="Before school" layout="inline">
                <RadioGroupItem value="before" />
              </Field>
              <Field label="After school" layout="inline">
                <RadioGroupItem value="after" />
              </Field>
            </RadioGroup>
          </div>
        </div>
        <Field label="Tell me when a place becomes free" layout="inline">
          <Checkbox />
        </Field>
      </Course>
      <Names scope={scope} />
    </div>
  );
}

export const FRM010: RuleExamples = {
  id: "FRM-010",
  examples: [
    {
      kind: "do",
      title: "Every control is named by the words beside it",
      caption: (
        <>
          Each label is tied to its control, so the list under the form repeats the words on screen. Click{" "}
          <em>Swimmer's school</em> or <em>Tell me when a place becomes free</em>: the label is a place to click, and it
          reaches its control. The hint under <em>Pool card number</em> stays out of that name. The question{" "}
          <em>When can the swimmer come?</em> is the legend of its group, so a screen reader reads it when you tab in to
          the options.
        </>
      ),
      Demo: Tied,
    },
    {
      kind: "dont",
      title: "The words are on screen, the names are not",
      caption: (
        <>
          The form looks the same, but <em>Notes for the teacher</em> is an untied paragraph, so the text area has no
          name. The select shows <em>Pool</em> and is named “Venue”, so saying “Pool” to speech control does nothing.
          The question over the options is plain text, so the group has no name and the options are heard alone. Click
          the notes paragraph: nothing happens.
        </>
      ),
      Demo: Untied,
    },
  ],
};
