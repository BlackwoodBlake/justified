/**
 * justified/meaningful-alt, for STR-005 (a rule): an image that carries
 * information has a text alternative that says what it tells, never a file
 * name or a word that only names the kind of picture.
 *
 * Flags the `alt` of an `img`, a Next.js `Image`, a shadcn `AvatarImage`,
 * an `area`, an `<input type="image">` or another element whose name ends
 * in `Image`, when it is:
 *   - a literal that, trimmed and in any case, is exactly a kind word such
 *     as "logo", "image", "hero", "screenshot", "avatar" or "decoration";
 *   - a literal that ends in an image file extension, such as
 *     "clock-red-2.svg" or "/img/hero.png";
 *   - an expression that reads a file name or an address: `alt={src}`,
 *     `alt={photo.url}`, `alt={file.fileName}`, or `.name` on something
 *     called file, upload or attachment, as in `alt={file.name}`.
 *
 * Left alone:
 *   - `alt=""` (decoration, which the rule asks for), any alt with more
 *     than the kind word ("Fernhill logo"), and names such as
 *     `alt={user.name}`.
 *   - A missing `alt`: jsx-a11y's `alt-text` covers it, also for `Image`
 *     and `AvatarImage` with its `img` setting.
 *   - Images inside a link or button: the exceptions send them to TXT-003
 *     and ACT-001b, which name them after where they go or what they do.
 *   - Inline `svg` (see `justified/svg-hidden-or-named`), an `aria-hidden`
 *     icon that is the only sign of a status, and CSS background images:
 *     these need to know what the page around them says.
 */
import { defineRule } from "../lib/define-rule.js";
import { attributeValue, elementName, findAncestorElement, getAttribute, unwrap } from "../lib/jsx.js";

/** Words that only name the kind of picture. Matched whole, never as part of a longer alt. */
const KIND_WORDS = new Set([
  "logo",
  "image",
  "img",
  "picture",
  "photo",
  "photograph",
  "hero",
  "screenshot",
  "avatar",
  "decoration",
  "decorative",
  "icon",
  "banner",
  "thumbnail",
  "graphic",
  "illustration",
  "placeholder",
]);

const FILE_EXTENSION = /\.(png|jpe?g|gif|svg|webp|avif|bmp|ico|tiff?|heic)$/i;
/** Names whose value is an address or file name. */
const ADDRESS_NAME = /^(src|url|href|path|file_?name|file_?path)$/i;
/** Endings of camel-case names whose value is an address or file name, such as `imageUrl`. */
const ADDRESS_ENDING = /[a-z](Src|Url|URL|Href|Path|FileName|Filename)$/;
/** Objects whose `.name` is a file name. */
const FILE_OBJECT = /file|upload|attachment/i;

/** Links and buttons, whose images follow TXT-003 and ACT-001b. */
const isControl = (/** @type {string} */ name) => {
  const base = name.split(".").pop() ?? "";
  return name === "a" || name === "button" || /(Button|Link|Trigger)$/.test(base);
};

/** Whether an element takes an image alternative in `alt`. @param {any} opening */
function takesAlt(opening) {
  const name = elementName(opening) ?? "";
  if (name === "img" || name === "area") return true;
  if (name === "input") return attributeValue(getAttribute(opening, "type")) === "image";
  return /(^|\.)([A-Z]\w*)?Image$/.test(name);
}

/** The last name an expression reads, as `x` for `x` or `a.b.x`. @param {any} node */
function lastName(node) {
  const n = unwrap(node);
  if (n?.type === "Identifier") return n.name;
  if (n?.type === "MemberExpression" && !n.computed && n.property.type === "Identifier") return n.property.name;
  return undefined;
}

/** Whether an expression is certain to be a file name or an address. @param {any} expression */
function readsFileName(expression) {
  const n = unwrap(expression);
  const name = lastName(n);
  if (!name) return false;
  if (ADDRESS_NAME.test(name) || ADDRESS_ENDING.test(name)) return true;
  if (name === "name" && n.type === "MemberExpression") {
    const owner = lastName(n.object);
    return Boolean(owner && FILE_OBJECT.test(owner));
  }
  return false;
}

export default defineRule({
  id: "STR-005",
  level: "rule",
  verdict: "Requirement",
  description: 'An image alt that is a file name or only names the kind of picture, such as "logo" or "Avatar".',
  messages: {
    kindWord:
      'the alt "{{alt}}" only names the kind of picture, and a screen reader already says it is an image. Write what the image tells the person in this place, or use alt="" if it only decorates or the text beside it already says it.',
    fileName:
      'the alt "{{alt}}" is a file name, which tells a screen reader user nothing. Write what the image tells the person in this place, or use alt="" if it only decorates.',
    fileExpression:
      'this alt is a file name or an address, which tells a screen reader user nothing. Write what the image tells the person in this place, or use alt="" if it only decorates.',
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (!takesAlt(node)) return;
        const alt = getAttribute(node, "alt");
        if (!alt?.value) return;
        if (findAncestorElement(node, isControl)) return;

        const value = attributeValue(alt);
        if (typeof value === "string") {
          const text = value.trim();
          if (KIND_WORDS.has(text.toLowerCase()))
            context.report({ node: alt, messageId: "kindWord", data: { alt: text } });
          else if (FILE_EXTENSION.test(text)) context.report({ node: alt, messageId: "fileName", data: { alt: text } });
          return;
        }
        if (alt.value.type === "JSXExpressionContainer" && readsFileName(alt.value.expression)) {
          context.report({ node: alt, messageId: "fileExpression" });
        }
      },
    };
  },
});
