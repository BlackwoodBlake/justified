import rule from "../../rules/sign-in-allows-paste.js";
import { run } from "../helpers.js";

/** Six boxes made in a map, with the given props on each and on the wrapper. */
const boxes = (props, wrapper = "") => `
export function Code({ digits }) {
  return (
    <FieldSet legend="One-time code">
      <div className="flex gap-2"${wrapper}>
        {digits.map((d, i) => (
          <Input key={i} inputMode="numeric" maxLength={1} value={d} onChange={(e) => set(i, e.target.value)} ${props} />
        ))}
      </div>
    </FieldSet>
  );
}`;

run("sign-in-allows-paste", rule, {
  valid: [
    // The Do: one field that takes the whole code.
    `export function OneField() {
      return (
        <Field label="One-time code">
          <Input inputMode="numeric" autoComplete="one-time-code" value={value} onChange={(e) => setValue(e.target.value.replace(/[\\s-]/g, ""))} />
        </Field>
      );
    }`,
    // Sign-in fields with the right tokens and no paste handler.
    `export const SignIn = () => (<form><Input type="email" autoComplete="username" /><Input type="password" autoComplete="current-password" /></form>);`,
    // shadcn InputOTP spreads a paste across its slots.
    `export function Otp() {
      return (
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      );
    }`,
    // Creating an account is outside the rule.
    `export const Confirm = () => <Input type="password" autoComplete="new-password" onPaste={(e) => e.preventDefault()} />;`,
    // Whose password a field with no autoComplete holds is not known.
    `export const Unknown = () => <Input type="password" onPaste={(e) => e.preventDefault()} />;`,
    // Blocking paste on a field that is not for signing in.
    `export const Notes = () => <Textarea onPaste={(e) => e.preventDefault()} />;`,
    // A handler that puts the pasted code in itself.
    `export const Pasted = () => (
      <Input autoComplete="one-time-code" onPaste={(e) => { e.preventDefault(); setCode(e.clipboardData.getData("text").replace(/\\D/g, "")); }} />
    );`,
    // A handler that hands the event on, or blocks only in some cases.
    `export const Handed = () => <Input autoComplete="one-time-code" onPaste={(e) => { e.preventDefault(); handlePaste(e); }} />;`,
    `export const Sometimes = () => <Input autoComplete="current-password" onPaste={(e) => { if (locked) e.preventDefault(); }} />;`,
    // A handler from another file is not followed.
    `import { onPaste } from "./paste";\nexport const Elsewhere = () => <Input autoComplete="current-password" onPaste={onPaste} />;`,
    // Boxes that take paste, on each box or around them.
    boxes(`onPaste={(e) => spread(e.clipboardData.getData("text"))}`),
    boxes("", ` onPaste={spreadCode}`),
    // Boxes with a spread may get a paste handler from it.
    boxes(`{...slot}`),
    // A file that listens for paste itself.
    `${boxes("")}
    export function useCodePaste(ref) { useEffect(() => ref.current.addEventListener("paste", spread), [ref]); }`,
    // One-letter cells with no sign of a code, such as a puzzle.
    `export function Puzzle({ cells }) {
      return <div className="grid">{cells.map((c) => <input key={c.id} aria-label={\`Row \${c.row}, column \${c.col}\`} maxLength={1} />)}</div>;
    }`,
    // A single one-character field is not a code split into boxes.
    `export const Initial = () => <Field label="Middle initial"><Input maxLength={1} name="initial" /></Field>;`,
  ],
  invalid: [
    {
      code: `export const Password = () => <Input type="password" autoComplete="current-password" onPaste={(e) => e.preventDefault()} />;`,
      errors: [{ messageId: "pasteBlocked" }],
    },
    {
      code: `export const User = () => <input autoComplete="username" onPaste={(event) => { event.preventDefault(); toast("Please type your email"); }} />;`,
      errors: [{ messageId: "pasteBlocked" }],
    },
    {
      // A named handler in the same file.
      code: `function noPaste(e) { e.preventDefault(); }
      export const Code = () => <Input autoComplete="one-time-code" inputMode="numeric" onPaste={noPaste} />;`,
      errors: [{ messageId: "pasteBlocked" }],
    },
    {
      code: `const block = (e: React.ClipboardEvent) => { e.preventDefault(); return false; };
      export const Code = () => <InputOTP maxLength={6} onPaste={block}><InputOTPGroup><InputOTPSlot index={0} /></InputOTPGroup></InputOTP>;`,
      errors: [{ messageId: "pasteBlocked" }],
    },
    {
      code: `export const Password = () => <input type="password" autoComplete="current-password" onPaste={() => false} />;`,
      errors: [{ messageId: "pasteBlocked" }],
    },
    {
      code: `export const Password = () => <input type="password" autoComplete="current-password" onpaste="return false" />;`,
      errors: [{ messageId: "pasteBlocked" }],
    },
    {
      // The Don't example: six boxes, with the code sign in the legend and the label.
      code: `export function SixBoxes({ digits, refs }) {
        return (
          <FieldSet legend="One-time code" error={error}>
            <div className="flex gap-2">
              {digits.map((d, i) => (
                <Input
                  key={i}
                  ref={(el) => { refs.current[i] = el; }}
                  aria-label={\`Digit \${i + 1}\`}
                  inputMode="numeric"
                  maxLength={1}
                  className="w-10 px-0 text-center"
                  value={d}
                  onChange={(e) => { const v = e.target.value.slice(-1); setDigits((s) => s.map((x, j) => (j === i ? v : x))); }}
                />
              ))}
            </div>
          </FieldSet>
        );
      }`,
      errors: [{ messageId: "splitCode" }],
    },
    {
      // Only the legend says it is a code.
      code: boxes(""),
      errors: [{ messageId: "splitCode" }],
    },
    {
      // Boxes in a map, each in a wrapper.
      code: `export const Pin = ({ digits }) => (
        <div>{digits.map((d, i) => <div key={i}><input name={\`pin-\${i}\`} maxLength={1} /></div>)}</div>
      );`,
      errors: [{ messageId: "splitCode" }],
    },
    {
      // Boxes written out, reported once.
      code: `export const Verify = () => (
        <fieldset>
          <legend>Verification code</legend>
          <input maxLength={1} inputMode="numeric" autoComplete="one-time-code" />
          <input maxLength={1} inputMode="numeric" />
          <input maxLength={1} inputMode="numeric" />
          <input maxLength={1} inputMode="numeric" />
        </fieldset>
      );`,
      errors: [{ messageId: "splitCode" }],
    },
  ],
});
