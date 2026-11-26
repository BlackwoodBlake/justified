import rule from "../../rules/language-of-parts.js";
import { run } from "../helpers.js";

const entries = `
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "pl", label: "Polski" },
  { code: "pt", label: "Português" },
  { code: "ko", label: "한국어" },
];`;

const picker = (item) => `
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
${entries}
export function LanguagePicker({ onPick }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="outline">Language</Button></DropdownMenuTrigger>
      <DropdownMenuContent>
        {LANGUAGES.map((l) => (
          ${item}
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}`;

run("language-of-parts", rule, {
  valid: [
    picker(`<DropdownMenuItem key={l.code} lang={l.code} onSelect={() => onPick(l.code)}>{l.label}</DropdownMenuItem>`),
    picker(`<DropdownMenuItem key={l.code} onSelect={() => onPick(l.code)}><span lang={l.code}>{l.label}</span></DropdownMenuItem>`),
    picker(`<DropdownMenuItem key={l.code} {...itemProps(l)}>{l.label}</DropdownMenuItem>`),
    // Labels written in English are one language.
    `const LANGUAGES = [{ code: "pl", label: "Polish" }, { code: "pt", label: "Portuguese" }];
export const P = () => <ul>{LANGUAGES.map((l) => <li key={l.code}>{l.label}</li>)}</ul>;`,
    // A list from another file cannot be read.
    `import { LANGUAGES } from "./languages";
export const P = () => <ul>{LANGUAGES.map((l) => <li key={l.code}>{l.label}</li>)}</ul>;`,
    // A list that is not of languages.
    `const PLANS = [{ value: "basic", label: "Basic" }, { value: "pro", label: "Pro" }];
export const P = () => PLANS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>);`,
    // Valid tags on parts, and lang="" for an unknown language.
    `export const Q = () => (<>
  <blockquote lang="es">La cena fue excelente, un auténtico <span lang="en">Sunday roast</span>.</blockquote>
  <p lang="zh-Hans">你好</p><p lang="">Unknown</p><p lang={review.language}>{review.text}</p>
</>);`,
    // html is STR-006.
    `export const R = ({ children }) => <html lang="en_US"><body>{children}</body></html>;`,
  ],
  invalid: [
    {
      code: picker(`<DropdownMenuItem key={l.code} onSelect={() => onPick(l.code)}>{l.label}</DropdownMenuItem>`),
      errors: [{ messageId: "pickerNoLang" }],
    },
    // Only hreflang on links.
    {
      code: `${entries}
export const Links = () => (
  <nav>{LANGUAGES.map(({ code, label }) => <a key={code} href={"/" + code} hrefLang={code}>{label}</a>)}</nav>
);`,
      errors: [{ messageId: "pickerNoLang" }],
    },
    {
      code: `const LOCALES = [{ locale: "de", name: "Deutsch" }, { locale: "fr", name: "Français" }] as const;
export const S = () => (
  <SelectContent>{LOCALES.map((l) => <SelectItem key={l.locale} value={l.locale}>{l.name}</SelectItem>)}</SelectContent>
);`,
      errors: [{ messageId: "pickerNoLang" }],
    },
    { code: `export const T = () => <p lang="en_US">Hello</p>;`, errors: [{ messageId: "invalidLang" }] },
    { code: `export const T = () => <span lang="cn">中文</span>;`, errors: [{ messageId: "invalidLang" }] },
  ],
});
