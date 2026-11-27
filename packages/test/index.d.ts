import type { Locator, Page } from "@playwright/test";

/** A Justified id the helpers check, such as "DLG-006". */
export type JustifiedRuleId = "DLG-001" | "DLG-006" | "DLG-007" | "FBK-004" | "FRM-012a" | "STR-001" | "VIS-006";

/** Each rule's level and verdict, as the site shows them. */
export declare const RULES: Record<JustifiedRuleId, { level: "rule" | "guideline"; verdict: string }>;

/** The rule's page on the website. */
export declare function ruleUrl(id: string): string;

/** The page may break a Justified rule. The message names the rule, says what happened and how to fix it, and links the rule's page. */
export declare class JustifiedFinding extends Error {
  readonly name: "JustifiedFinding";
  readonly ruleId: JustifiedRuleId;
  readonly url: string;
}

/** The helper could not check, such as a dialog that never opened. Not a finding. */
export declare class JustifiedUsageError extends Error {
  readonly name: "JustifiedUsageError";
}

export interface FocusReturnsOptions {
  /** Opens the dialog. Default: focus the trigger and press Enter. */
  open?: (trigger: Locator) => Promise<void>;
  /** Closes the dialog, such as a press on Cancel. Default: press Escape. */
  close?: (dialog: Locator) => Promise<void>;
  /** The dialog. Default: the last open element with role="dialog" or "alertdialog", or an open `dialog`. */
  dialog?: Locator;
  /** How long focus may take to move, in milliseconds. Default 1000. */
  timeout?: number;
}

/**
 * DLG-006: opens the dialog from `trigger`, checks that focus moves into it,
 * closes it and checks that focus is back on `trigger`, or on an element in
 * the page if the close removed `trigger`. A close that goes to another
 * address is left alone.
 */
export declare function expectFocusReturns(trigger: Locator, options?: FocusReturnsOptions): Promise<void>;

export interface FocusInsideOptions {
  /** How many times to press Tab, and then Shift+Tab. Default: the dialog's controls plus two. */
  presses?: number;
}

/**
 * DLG-007: with `dialog` open, presses Tab and Shift+Tab past its ends and
 * checks that focus never reaches the page behind, that nothing behind can
 * be clicked, and that the page behind is hidden from assistive technology.
 */
export declare function expectFocusInside(dialog: Locator, options?: FocusInsideOptions): Promise<void>;

export interface EscapeClosesOptions {
  /** Brings a fresh page to the state to test, such as the dialog open with something typed. Called twice. */
  setup: () => Promise<void>;
  /** Presses the dismissive action. Default: the dialog's button named "Cancel", or else "Close". */
  cancel?: (dialog: Locator) => Promise<void>;
  /** The dialog. Default: the last open dialog. */
  dialog?: Locator;
  /** Anything else that must end the same, such as a saved value shown on the page. */
  snapshot?: (page: Page) => Promise<unknown>;
  /** How long to wait after each press, in milliseconds. Default 300. */
  settle?: number;
}

/** DLG-001: checks that Escape ends the same way as Cancel: the same dialogs open with the same text, and the same snapshot. */
export declare function expectEscapeCloses(page: Page, options: EscapeClosesOptions): Promise<void>;

export interface TitleOptions {
  /** How long to watch the title after each navigation, in milliseconds. Default 500. */
  settle?: number;
  /** The product's name. A title that is only this name is reported. */
  appName?: string;
  /** Reads the title. Default: `page.title()`. */
  readTitle?: () => Promise<string>;
}

/**
 * STR-001: runs each navigation and checks that the title changes with
 * every view, is not empty, a starter title or only the product's name, and
 * never shows a value that is not there yet, such as "undefined".
 */
export declare function expectTitleChangesOnNavigate(
  page: Page,
  navigations: Array<() => Promise<void>>,
  options?: TitleOptions,
): Promise<void>;

export interface AnnouncedOptions {
  /** What makes the message appear, such as typing or a press on Save. */
  action?: () => Promise<void>;
  /** How long to wait for the message, in milliseconds. Default 5000. */
  timeout?: number;
}

/**
 * FBK-004: runs the action, waits for new text matching `text`, and checks
 * that it sits in a live region. A message reached by moving focus is not a
 * status message and is left alone.
 */
export declare function expectAnnounced(page: Page, text: string | RegExp, options?: AnnouncedOptions): Promise<void>;

export interface NoContextChangeOptions {
  /** Changes the value. Default: another option in a select, Space on a checkbox, radio or switch, one character in a text field. */
  change?: (control: Locator) => Promise<void>;
  /** The text before the control that tells people what a change will do. With it, a change of context is allowed if the notice comes first. */
  notice?: Locator;
  /** How long to wait after the change, in milliseconds. Default 300. */
  settle?: number;
}

/**
 * FRM-012a: focuses `control`, changes its value and checks that this does
 * not open another page or window, send the form, open a dialog that takes
 * focus, replace the view or move focus, unless `notice` comes before it.
 */
export declare function expectNoContextChangeOnInput(control: Locator, options?: NoContextChangeOptions): Promise<void>;

export interface ReducedMotionOptions {
  /** What starts the motion, such as opening a panel. */
  action?: () => Promise<void>;
  /** Only look inside this element. Default: the whole page. */
  scope?: Locator;
  /** A selector for motion that is the content or that the person drives, such as a video. */
  ignore?: string;
  /** The longest wait for animations to end, in milliseconds. Default 2000. */
  settle?: number;
}

/**
 * VIS-006: turns on reduced motion for the page, runs the action and checks
 * that nothing slides, zooms, scales, turns or is moved by script, and that
 * no content is left invisible waiting for an animation.
 */
export declare function expectReducedMotion(page: Page, options?: ReducedMotionOptions): Promise<void>;
