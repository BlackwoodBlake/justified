import rule from "../../rules/page-language.js";
import { run } from "../helpers.js";

/** A root layout as create-next-app writes it. */
const rootLayout = (htmlAttrs, inner = "{children}") => `
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Larkspur", description: "Book a table." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html${htmlAttrs}>
      <body className="antialiased">${inner}</body>
    </html>
  );
}`;

const localeLayout = (htmlAttrs) => `
export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  return (
    <html${htmlAttrs}>
      <body>{children}</body>
    </html>
  );
}`;

run("page-language", rule, {
  valid: [
    { code: rootLayout(' lang="en"'), filename: "app/layout.tsx" },
    { code: rootLayout(' lang="en" suppressHydrationWarning'), filename: "app/layout.tsx" },
    { code: rootLayout(' lang="pt-BR"'), filename: "app/layout.tsx" },
    { code: rootLayout(' lang="zh-Hant-TW"'), filename: "app/layout.tsx" },
    { code: rootLayout(' lang="fil"'), filename: "app/layout.tsx" },
    // The locale from the route.
    { code: localeLayout(" lang={locale}"), filename: "app/[locale]/layout.tsx" },
    { code: localeLayout(" lang={locale} dir={dir(locale)}"), filename: "src/app/[lang]/layout.tsx" },
    // A literal lang is fine outside a locale segment.
    { code: localeLayout(' lang="de"'), filename: "app/(shop)/layout.tsx" },
    // next/document's Html: Next.js sets lang from the i18n config.
    {
      code: `import { Html, Head, Main, NextScript } from "next/document";
export default function Document() {
  return (<Html><Head /><body><Main /><NextScript /></body></Html>);
}`,
      filename: "pages/_document.tsx",
    },
    // The same lang on html and on a provider is fine.
    { code: rootLayout(" lang={locale}", '<main lang={locale}>{children}</main>'), filename: "app/[locale]/layout.tsx" },
    // A part in another language that does not wrap the app.
    { code: rootLayout(' lang="en"', '<p lang="fr">Bonjour</p>{children}'), filename: "app/layout.tsx" },
    // Spread props may set lang.
    { code: `export const Root = (props) => <html {...props}><body /></html>;` },
    // A lang outside any html element is STR-006a.
    { code: `export const P = ({ children }) => <div lang="pl">{children}</div>;` },
  ],
  invalid: [
    { code: rootLayout(""), filename: "app/layout.tsx", errors: [{ messageId: "missingLang" }] },
    { code: rootLayout(' lang=""'), filename: "app/layout.tsx", errors: [{ messageId: "emptyLang" }] },
    { code: rootLayout(' lang="en_US"'), filename: "app/root.tsx", errors: [{ messageId: "invalidLang" }] },
    { code: rootLayout(' lang="english"'), filename: "app/layout.tsx", errors: [{ messageId: "invalidLang" }] },
    { code: rootLayout(' lang="cn"'), filename: "app/layout.tsx", errors: [{ messageId: "invalidLang" }] },
    {
      code: `import { Html, Head, Main, NextScript } from "next/document";
export default function Document() { return (<Html lang="sv_SE"><Head /><body><Main /><NextScript /></body></Html>); }`,
      filename: "pages/_document.tsx",
      errors: [{ messageId: "invalidLang" }],
    },
    { code: localeLayout(' lang="en"'), filename: "app/[locale]/layout.tsx", errors: [{ messageId: "literalInLocaleLayout" }] },
    { code: localeLayout(' lang="en"'), filename: "src/app/[lng]/layout.jsx", errors: [{ messageId: "literalInLocaleLayout" }] },
    // lang on a wrapper while html has none, or another one.
    {
      code: rootLayout("", "<div lang={locale}>{children}</div>"),
      filename: "app/[locale]/layout.tsx",
      errors: [{ messageId: "missingLang" }, { messageId: "wrapperLang" }],
    },
    {
      code: rootLayout(' lang="en"', "<Providers><div lang={locale} className=\"contents\">{children}</div></Providers>"),
      filename: "app/layout.tsx",
      errors: [{ messageId: "wrapperLang" }],
    },
    { code: rootLayout(' lang="en"', '<body lang="pl">{children}</body>').replace('<body className="antialiased">', "").replace("</body></body>", "</body>"), filename: "app/layout.tsx", errors: [{ messageId: "wrapperLang" }] },
  ],
});
