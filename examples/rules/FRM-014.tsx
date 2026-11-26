import { Probe, probeBox } from "./input-type";
import type { RuleExamples } from "./frame";

/*
 * FRM-014: email, phone and web address fields get the input type that
 * matches the value. The keyboard a phone would show is written under each
 * field, since a desktop shows none.
 */

function Matching() {
  return (
    <form noValidate onSubmit={(e) => e.preventDefault()} className={probeBox}>
      <Probe label="Email" type="email" autoComplete="email" defaultValue="mira@example.com" />
      <Probe label="Mobile number" type="tel" autoComplete="tel" defaultValue="+44 7700 900123" />
      <Probe label="Shop website" type="url" autoComplete="url" defaultValue="fieldandfork.example" also="scheme" />
    </form>
  );
}

function AllText() {
  return (
    <form noValidate onSubmit={(e) => e.preventDefault()} className={probeBox}>
      <Probe label="Email" autoComplete="email" defaultValue="mira@example.com" />
      <Probe label="Mobile number" autoComplete="tel" defaultValue="+44 7700 900123" />
      <Probe label="Shop website" autoComplete="url" defaultValue="fieldandfork.example" />
    </form>
  );
}

function TypeWithoutPurpose() {
  return (
    <form noValidate onSubmit={(e) => e.preventDefault()} className={probeBox}>
      <Probe label="Email" type="email" defaultValue="mira@example.com" />
    </form>
  );
}

function SignIn({ type }: { type: "email" | "text" }) {
  return (
    <form noValidate onSubmit={(e) => e.preventDefault()} className={probeBox}>
      <Probe
        label="Email or username"
        type={type}
        autoComplete="username"
        defaultValue="mira_84"
        also="check"
      />
    </form>
  );
}

export const FRM014: RuleExamples = {
  id: "FRM-014",
  examples: [
    {
      kind: "do",
      title: "The type that matches each value",
      caption: (
        <>
          Each field has a visible label, the type that fits its value and its own <code>autocomplete</code> value. The
          line under a field shows the keyboard a phone would pick. Everything is still typed as before on a
          computer. The web address is typed without <code>https://</code>: the form has its own check turned off and adds the
          scheme itself, as the last line shows.
        </>
      ),
      Demo: Matching,
    },
    {
      kind: "dont",
      title: "Every field left as text",
      caption: (
        <>
          All three fields open the standard letters keyboard on a phone, so the at sign, the dot, the digits and the
          slash sit behind a layout switch. Nothing looks different here, which is why the line under each field is
          the only place the miss shows.
        </>
      ),
      Demo: AllText,
    },
    {
      kind: "dont",
      title: "The type in place of the autocomplete value",
      caption: (
        <>
          The keyboard is right, but the field has no <code>autocomplete</code> value, so the code never states its
          purpose. The type picks the keyboard; only <code>autocomplete</code> says what the field is for.
        </>
      ),
      Demo: TypeWithoutPurpose,
    },
    {
      kind: "do",
      title: "A field that takes a user name stays text",
      caption: (
        <>
          <em>Email or username</em> takes more than one kind of value, so it keeps the text type. Its user name goes
          through. Compare the next example.
        </>
      ),
      Demo: () => <SignIn type="text" />,
    },
    {
      kind: "dont",
      title: "An email type on Email or username",
      caption: (
        <>
          The browser&apos;s own check refuses the user name, as the line under the field shows, and the keyboard suits
          only half of what the field takes. Replace the text with an address to see the check accept it.
        </>
      ),
      Demo: () => <SignIn type="email" />,
    },
  ],
};
