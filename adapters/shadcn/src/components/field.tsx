import { Slot } from "@radix-ui/react-slot";
import { createContext, useContext, useId, useState, type ReactElement, type ReactNode } from "react";

import { AlertIcon } from "../lib/icons";
import { cn } from "../lib/utils";
import { Label } from "./label";

/*
 * Field ties a control to its label, hint and error, so that the wiring
 * is never forgotten:
 *
 *   - The label is always visible (FRM-001) and points at the control (FRM-010).
 *   - The hint and the error are read out with the control
 *     (aria-describedby), the error first.
 *   - An error is shown at the field, as an icon and text, never as colour
 *     alone, and marks the control as invalid (aria-invalid) (FRM-002a).
 *   - The error area is a polite live region that is always present, so an
 *     error that appears while focus stays elsewhere is announced
 *     (FRM-002b). Set `announce={false}` when the form moves focus to the
 *     field itself, for example after sending, so nothing is read twice.
 *   - When a shown error goes away, a second polite region says so
 *     ("Fixed."), so a person who corrects a field while typing hears that
 *     it is now right without moving (FRM-002b). It is heard even when
 *     `announce` is false. The note is for screen readers only.
 *
 * When to show an error is the form's decision: pass `error` when the form
 * decides there is one. Field sets aria-required rather than the required
 * attribute, so the browser's own error bubbles do not take over.
 */

type Marking = {
  /** The field must be filled in. Sets aria-required on the control. */
  required?: boolean;
  /**
   * Show "(required)" or "(optional)" after the label, as part of its
   * accessible name. Give every field of the same status the same mark
   * (FRM-005). A written word needs no note explaining it.
   */
  mark?: boolean;
  /** Text for the marks, for other languages. */
  requiredText?: string;
  optionalText?: string;
};

type Messages = {
  /** Help that applies before anything goes wrong. */
  hint?: ReactNode;
  /** What is wrong and how to fix it. Shown at the field. */
  error?: ReactNode;
  /** Read before the error by screen readers. Change it for other languages. */
  errorPrefix?: string;
  /** Announce the error when it appears. Default true. */
  announce?: boolean;
  /** Read when a shown error goes away. Change it for other languages. */
  fixedText?: string;
};

function Mark({ required, mark, requiredText = "(required)", optionalText = "(optional)" }: Marking) {
  if (!mark) return null;
  return <span className="font-normal text-muted-foreground"> {required ? requiredText : optionalText}</span>;
}

export function FieldHint({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} data-slot="field-hint" className="text-sm text-muted-foreground">
      {children}
    </p>
  );
}

/**
 * The error area. Always rendered, empty when there is no error, so that
 * screen readers notice when an error appears in it.
 */
export function FieldError({
  id,
  prefix = "Error:",
  announce = true,
  fixedText = "Fixed.",
  children,
}: {
  id: string;
  prefix?: string;
  announce?: boolean;
  fixedText?: string;
  children?: ReactNode;
}) {
  // Remember whether an error was shown, so its going away can be announced.
  const has = Boolean(children);
  const [hadError, setHadError] = useState(has);
  const [fixed, setFixed] = useState(false);
  if (has !== hadError) {
    setHadError(has);
    setFixed(!has);
  }
  return (
    <>
      {/* "Fixed." has its own polite region, so it is heard even when the error region is quiet. */}
      <span data-slot="field-fixed" aria-live="polite" className="sr-only">
        {fixed ? fixedText : null}
      </span>
      <div
        id={id}
        data-slot="field-error"
        aria-live={announce ? "polite" : "off"}
        aria-atomic="true"
        className={has ? "mt-1" : undefined}
      >
        {children ? (
          <p className="flex items-start gap-1.5 text-sm font-medium text-destructive">
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            <span>
              <span className="sr-only">{prefix} </span>
              {children}
            </span>
          </p>
        ) : null}
      </div>
    </>
  );
}

function describedBy(...ids: (string | false | undefined)[]) {
  const list = ids.filter(Boolean).join(" ");
  return list || undefined;
}

export type FieldProps = Marking &
  Messages & {
    label: ReactNode;
    /** The control: Input, Textarea, NativeSelect, Checkbox or Switch. */
    children: ReactElement;
    /** "inline" puts the control before the label, for checkboxes and switches. */
    layout?: "stacked" | "inline";
    id?: string;
    className?: string;
  };

export function Field({
  label,
  children,
  hint,
  error,
  errorPrefix,
  announce,
  fixedText,
  required,
  mark,
  requiredText,
  optionalText,
  layout = "stacked",
  id: idProp,
  className,
}: FieldProps) {
  const auto = useId();
  const id = idProp ?? auto;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const control = (
    <Slot
      id={id}
      aria-describedby={describedBy(error ? errorId : undefined, hint ? hintId : undefined)}
      aria-invalid={error ? true : undefined}
      aria-required={required || undefined}
    >
      {children}
    </Slot>
  );
  const labelEl = (
    <Label htmlFor={id}>
      {label}
      <Mark required={required} mark={mark} requiredText={requiredText} optionalText={optionalText} />
    </Label>
  );
  const messages = (
    <>
      {hint && (
        <div className="mt-1">
          <FieldHint id={hintId}>{hint}</FieldHint>
        </div>
      )}
      <FieldError id={errorId} prefix={errorPrefix} announce={announce} fixedText={fixedText}>
        {error}
      </FieldError>
    </>
  );

  if (layout === "inline") {
    return (
      <div data-slot="field" className={cn("flex items-start gap-3", className)}>
        <div className="flex h-5 items-center">{control}</div>
        <div className="flex flex-col">
          {labelEl}
          {messages}
        </div>
      </div>
    );
  }

  return (
    <div data-slot="field" className={cn("flex flex-col", className)}>
      {labelEl}
      {messages}
      <div className="mt-2">{control}</div>
    </div>
  );
}

/* A group of related controls (radio buttons, several checkboxes) under one legend. */

type GroupContext = { labelledBy?: string; describedBy?: string; invalid?: boolean; required?: boolean };
const FieldSetContext = createContext<GroupContext>({});

/** Read by RadioGroup, so the group itself carries the legend as its name, the hint, the error and the required state. */
export function useFieldSet() {
  return useContext(FieldSetContext);
}

export type FieldSetProps = Marking &
  Messages & {
    legend: ReactNode;
    children: ReactNode;
    id?: string;
    className?: string;
  };

export function FieldSet({
  legend,
  children,
  hint,
  error,
  errorPrefix,
  announce,
  fixedText,
  required,
  mark,
  requiredText,
  optionalText,
  id: idProp,
  className,
}: FieldSetProps) {
  const auto = useId();
  const id = idProp ?? auto;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const legendId = `${id}-legend`;
  const ids = describedBy(error ? errorId : undefined, hint ? hintId : undefined);

  return (
    <fieldset
      id={id}
      data-slot="fieldset"
      aria-describedby={ids}
      className={cn("m-0 flex min-w-0 flex-col border-0 p-0", className)}
    >
      <legend id={legendId} className="p-0 text-sm font-medium text-foreground">
        {legend}
        <Mark required={required} mark={mark} requiredText={requiredText} optionalText={optionalText} />
      </legend>
      {hint && (
        <div className="mt-1">
          <FieldHint id={hintId}>{hint}</FieldHint>
        </div>
      )}
      <FieldError id={errorId} prefix={errorPrefix} announce={announce} fixedText={fixedText}>
        {error}
      </FieldError>
      <div className="mt-3 flex flex-col gap-3">
        <FieldSetContext.Provider value={{ labelledBy: legendId, describedBy: ids, invalid: !!error, required }}>
          {children}
        </FieldSetContext.Provider>
      </div>
    </fieldset>
  );
}
