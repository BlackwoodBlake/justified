/**
 * justified/destructive-confirm-style, for DLG-005 (a guideline): in a
 * dialog that asks the person to confirm a destructive action, the
 * destructive button has the danger style.
 *
 * Looks only inside an `AlertDialogContent` or `AlertDialogFooter`, since
 * an alert dialog is the confirmation for certain. Flags, on `Button` and
 * `AlertDialogAction`, and on `AlertDialogCancel`:
 *   - a button whose words start with Delete, Remove, Erase, Revoke,
 *     Discard or Destroy and that has no danger style: no
 *     `variant="destructive"` and no `bg-destructive` class;
 *   - the danger style on Cancel, or on a button that destroys nothing:
 *     the whole label Close, Done, Back, Next or Continue, or a label that
 *     starts with Save, Send, Create, Add or Publish;
 *   - Cancel drawn as the filled main button while the destructive button
 *     in the same footer uses `outline`, `secondary`, `ghost` or `link`;
 *   - `opacity-*` or `bg-destructive/*` with no state prefix on a
 *     destructive button that can be pressed, which fades it all the time.
 *
 * Left alone:
 *   - `Dialog` and other containers: a delete in an edit form that runs at
 *     once and offers Undo is outside the guideline, and from the code a
 *     `Dialog` can be such a form.
 *   - Any button whose variant, classes or props are not written out, such
 *     as `variant={look}`, `className={buttonVariants(...)}` or a spread.
 *   - Labels that are not written out, and labels that only end with a
 *     destructive word ("Yes, delete" is ACT-001a's concern).
 *   - A red OK or Yes: ACT-001a reports those words already.
 *   - A custom red, or danger shown only by a border or icon: telling
 *     these apart takes judgement, so the review skill covers them.
 *   - The faded look of a button with a literal `disabled`.
 */
import { ancestorInTree, staticClasses, visibleText } from "../lib/button-label-helpers.js";
import { defineRule } from "../lib/define-rule.js";
import { attributeValue, elementName, getAttribute, hasSpread, parentElement } from "../lib/jsx.js";

const DESTRUCTIVE = new Set(["delete", "remove", "erase", "revoke", "discard", "destroy"]);
const SAFE_WHOLE = new Set(["cancel", "close", "done", "back", "next", "continue"]);
const SAFE_FIRST = new Set(["save", "send", "create", "add", "publish"]);
/** Words that make a "safe" label destructive after all, such as "Send to trash". */
const LOSS = /\b(delete|remove|erase|revoke|discard|destroy|trash|bin|permanent|for good)/i;
const QUIET = new Set(["outline", "secondary", "ghost", "link"]);

/** The first word, in lower case. @param {string} text */
const firstWord = (text) => text.split(/[\s,.!:]/)[0].toLowerCase();
/** The label as compared: lower case, no trailing full stop. @param {string} text */
const whole = (text) =>
  text
    .replace(/[.!]+$/, "")
    .trim()
    .toLowerCase();

/**
 * The button's look, when the code states it: its literal variant
 * (`undefined` when none is given) and its classes. `null` when either is
 * not written out.
 * @param {any} opening
 * @returns {{ variant: string | undefined, classes: string[] } | null}
 */
function look(opening) {
  if (hasSpread(opening)) return null;
  const variantAttribute = getAttribute(opening, "variant");
  const variant = variantAttribute ? attributeValue(variantAttribute) : undefined;
  if (variantAttribute && typeof variant !== "string") return null;
  const classes = staticClasses(getAttribute(opening, "className"));
  if (!classes) return null;
  return { variant: /** @type {string | undefined} */ (variant), classes };
}

/** Whether the look is the danger style. @param {{ variant: string | undefined, classes: string[] }} l */
const isRed = (l) => l.variant === "destructive" || l.classes.some((c) => /^bg-destructive(\/\d+)?$/.test(c));

/** Whether the look is the filled main button. @param {string} name @param {{ variant: string | undefined, classes: string[] }} l */
const isFilled = (name, l) =>
  !isRed(l) &&
  (l.classes.some((c) => /^bg-primary(\/\d+)?$/.test(c)) ||
    l.variant === "default" ||
    (name === "Button" && l.variant === undefined));

/** A class that fades the button all the time, or undefined. @param {string[]} classes */
const fadingClass = (classes) =>
  classes.find((c) => {
    const m = c.match(/^(?:opacity-(\d+)|bg-destructive\/(\d+))$/);
    return Boolean(m) && Number(m?.[1] ?? m?.[2]) < 100;
  });

export default defineRule({
  id: "DLG-005",
  level: "guideline",
  verdict: "Split (1 of 2)",
  description:
    "In an alert dialog: a Delete or Remove button without the danger style, the danger style on Cancel or on a safe action, a filled Cancel beside a quiet destructive button, and a faded destructive button.",
  type: "suggestion",
  messages: {
    missingDanger:
      '"{{text}}" in this alert dialog destroys something, but the button has no danger style. Give it variant="destructive", so its look warns before the loss as its words do.',
    redCancel:
      "the Cancel button has the danger style here. Keep red for the button that destroys something, so it still warns, and give Cancel the outline style.",
    redSafe:
      '"{{text}}" destroys nothing, but has the danger style. Keep red for the button that deletes or removes something, so it still warns.',
    filledCancel:
      'the Cancel button is the filled main button while "{{text}}" is drawn as a quiet button. That steers the person away instead of warning them. Give Cancel the outline style and the destructive button variant="destructive".',
    faded:
      '"{{className}}" fades this destructive button while it can be pressed, which may lower the contrast of its text. Remove the class; a disabled button fades on its own while it cannot be pressed.',
  },
  create(context) {
    /** Per alert dialog footer: its Cancel buttons drawn filled, and its quiet destructive buttons. */
    const footers = new Map();
    /** @param {any} footer */
    const footerEntry = (footer) => {
      if (!footers.has(footer)) footers.set(footer, { filledCancels: [], quiet: [] });
      return footers.get(footer);
    };

    return {
      JSXElement(element) {
        const opening = element.openingElement;
        const name = elementName(opening);
        if (name !== "Button" && name !== "AlertDialogAction" && name !== "AlertDialogCancel") return;
        if (!ancestorInTree(element, (n) => n === "AlertDialogContent" || n === "AlertDialogFooter")) return;
        if (getAttribute(opening, "asChild")) return;
        const l = look(opening);
        if (!l) return;
        const footer = ancestorInTree(element, (n) => n === "AlertDialogFooter");
        const parent = parentElement(element);
        const insideCancel = parent && elementName(parent.openingElement) === "AlertDialogCancel";
        const text = visibleText(element, { ignoreSelfClosing: true });

        const cancel = name === "AlertDialogCancel" || insideCancel || (text !== undefined && whole(text) === "cancel");
        if (cancel) {
          if (isRed(l)) context.report({ node: opening, messageId: "redCancel" });
          else if (footer && isFilled(insideCancel ? "Button" : name, l))
            footerEntry(footer).filledCancels.push(opening);
          return;
        }
        if (!text) return;

        if (DESTRUCTIVE.has(firstWord(text))) {
          if (!isRed(l)) {
            context.report({ node: opening, messageId: "missingDanger", data: { text } });
            if (footer && l.variant && QUIET.has(l.variant)) footerEntry(footer).quiet.push(text);
          }
          const disabled = attributeValue(getAttribute(opening, "disabled"));
          const fading = disabled === true ? undefined : fadingClass(l.classes);
          if (fading && isRed(l)) context.report({ node: opening, messageId: "faded", data: { className: fading } });
          return;
        }

        if (isRed(l) && !LOSS.test(text) && (SAFE_WHOLE.has(whole(text)) || SAFE_FIRST.has(firstWord(text)))) {
          context.report({ node: opening, messageId: "redSafe", data: { text } });
        }
      },
      "Program:exit"() {
        for (const { filledCancels, quiet } of footers.values()) {
          if (!quiet.length) continue;
          for (const node of filledCancels)
            context.report({ node, messageId: "filledCancel", data: { text: quiet[0] } });
        }
      },
    };
  },
});
