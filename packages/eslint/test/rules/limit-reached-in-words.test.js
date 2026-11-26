import rule from "../../rules/limit-reached-in-words.js";
import { run } from "../helpers.js";

const IMPORTS = `
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
`;

run("limit-reached-in-words", rule, {
  valid: [
    // The Do: a hard stop with a count that says when the limit is reached.
    `${IMPORTS}
    const MAX = 500;
    export function About() {
      const [text, setText] = useState("");
      const left = MAX - text.length;
      return (
        <div className="grid gap-2">
          <Label htmlFor="about">Tell us about yourself</Label>
          <p id="about-hint">Up to 500 characters</p>
          <Textarea id="about" aria-describedby="about-hint about-count" maxLength={MAX} value={text} onChange={(e) => setText(e.target.value)} />
          <p id="about-count" aria-live="polite">{left === 0 ? "Limit reached" : left + " characters left"}</p>
        </div>
      );
    }`,
    // A counter component that is given the limit.
    `${IMPORTS}
    import { CharacterCount } from "./character-count";
    export const About = () => (<><Textarea maxLength={500} value={v} onChange={(e) => setV(e.target.value)} /><CharacterCount value={v} max={500} /></>);`,
    // No limit, or one switched off.
    `${IMPORTS}
    export const Note = ({ limit }) => (<><Textarea /><Textarea maxLength={undefined} /><Textarea maxLength={limit ? 500 : undefined} /></>);`,
    // shadcn's Textarea as its docs write it.
    `${IMPORTS}
    export function TextareaWithLabel() {
      return (
        <div className="grid w-full gap-3">
          <Label htmlFor="message">Your message</Label>
          <Textarea placeholder="Type your message here." id="message" />
        </div>
      );
    }`,
    // A single-line Input with maxLength: lint cannot tell free text from a code (FRM-017a).
    `import { Input } from "@/components/ui/input";
    export const Postcode = () => <Input maxLength={8} />;`,
    // A Textarea from another module may count by itself.
    `import { Textarea } from "./counted-textarea";
    export const About = () => <Textarea maxLength={500} />;`,
    // A cut that something on screen reports.
    `${IMPORTS}
    export function About() {
      const [cut, setCut] = useState(0);
      return (
        <>
          <Textarea onChange={(e) => { const v = e.target.value; setCut(v.length - 500); setText(v.slice(0, 500)); }} />
          {cut > 0 && <p role="status">Limit reached. The last {cut} characters you pasted were not added.</p>}
        </>
      );
    }`,
  ],
  invalid: [
    // The Don't: maxLength copied from the database column, with nothing else.
    {
      code: `${IMPORTS}
      export function About() {
        return (
          <div className="grid gap-2">
            <Label htmlFor="about">Tell us about yourself</Label>
            <Textarea id="about" maxLength={500} />
          </div>
        );
      }`,
      errors: [{ messageId: "silentStop" }],
    },
    // A hint that states the limit is not words at the limit.
    {
      code: `${IMPORTS}
      const MAX = 500;
      export const About = () => (<><p id="h">Up to 500 characters</p><textarea aria-describedby="h" maxLength={MAX} /></>);`,
      errors: [{ messageId: "silentStop" }],
    },
    // The Don't: onChange trims to 500 and the field stays silent.
    {
      code: `${IMPORTS}
      export function About() {
        const [text, setText] = useState("");
        return <Textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 500))} />;
      }`,
      errors: [{ messageId: "silentCut" }],
    },
  ],
});
