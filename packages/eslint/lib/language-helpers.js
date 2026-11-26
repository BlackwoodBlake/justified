/**
 * language-helpers.js: checking `lang` values, for justified/page-language
 * (STR-006) and justified/language-of-parts (STR-006a).
 *
 * A value is a valid language tag when it is well formed (as `Intl` reads
 * it) and its language part is a real code: any two-letter code must be one
 * of ISO 639-1, which has a fixed list, so `cn`, `jp` and `gr` are caught.
 * Three-letter codes are taken as given, since checking them needs the
 * whole registry. A tag that is well formed but means the wrong language,
 * such as `se` for Swedish, cannot be told apart in code and is not
 * reported.
 */

/** ISO 639-1, with the deprecated codes the language subtag registry still lists. */
const ISO_639_1 = new Set(
  (
    "aa ab ae af ak am an ar as av ay az ba be bg bh bi bm bn bo br bs ca ce ch co cr cs cu cv cy da de dv dz ee el " +
    "en eo es et eu fa ff fi fj fo fr fy ga gd gl gn gu gv ha he hi ho hr ht hu hy hz ia id ie ig ii ik io is it iu " +
    "ja jv ka kg ki kj kk kl km kn ko kr ks ku kv kw ky la lb lg li ln lo lt lu lv mg mh mi mk ml mn mr ms mt my na " +
    "nb nd ne ng nl nn no nr nv ny oc oj om or os pa pi pl ps pt qu rm rn ro ru rw sa sc sd se sg si sk sl sm sn so " +
    "sq sr ss st su sv sw ta te tg th ti tk tl tn to tr ts tt tw ty ug uk ur uz ve vi vo wa wo xh yi yo za zh zu " +
    "in iw ji jw mo sh"
  ).split(" "),
);

/** Country codes often written where the language code belongs. */
const COUNTRY_FOR_LANGUAGE = /** @type {Record<string, string>} */ ({
  cn: "zh",
  jp: "ja",
  kr: "ko",
  gr: "el",
  dk: "da",
  cz: "cs",
  ua: "uk",
  rs: "sr",
});

/**
 * Why a written-out `lang` value is not a valid language tag, or
 * `undefined` when it is (or may be). An empty value is left to the caller.
 * @param {string} value
 * @returns {string | undefined} A short hint for the message.
 */
export function invalidTagHint(value) {
  if (value.trim() === "") return undefined;
  // Private-use and old registered tags are well formed but Intl rejects them.
  if (/^(x|i)-[a-z0-9-]+$/i.test(value)) return undefined;
  if (value.includes("_")) return `language tags use a hyphen, as in ${value.replace(/_/g, "-")}`;
  try {
    Intl.getCanonicalLocales(value);
  } catch {
    return "write a language code such as en, or en-GB with a region";
  }
  const language = value.split("-")[0].toLowerCase();
  if (language.length === 2 && !ISO_639_1.has(language)) {
    const fix = COUNTRY_FOR_LANGUAGE[language];
    return fix ? `${language} is a country code; the language code is ${fix}` : "use a language code, such as en";
  }
  if (language.length > 3) return "use the language code, not the language's name: en, not english";
  return undefined;
}

/**
 * The name of a language in that language, such as "polski" for `pl`, in
 * lower case, or `undefined` when it is not known.
 * @param {string} tag
 */
export function autonym(tag) {
  try {
    const name = new Intl.DisplayNames([tag], { type: "language", fallback: "none" }).of(tag);
    return name?.normalize("NFC").toLocaleLowerCase(tag);
  } catch {
    return undefined;
  }
}

/**
 * Whether a label is the language's own name for itself, for the full tag
 * or its language part: "Polski" for `pl`, "Português" for `pt-BR`.
 * @param {string} label
 * @param {string} tag
 */
export function isAutonym(label, tag) {
  if (invalidTagHint(tag) !== undefined) return false;
  const text = label.trim().normalize("NFC");
  const language = tag.split("-")[0];
  return [autonym(tag), autonym(language)].some((n) => n !== undefined && n === text.toLocaleLowerCase(language));
}
