import rule from "../../rules/meaningful-alt.js";
import { run } from "../helpers.js";

const avatar = `import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";`;
const nextImage = `import Image from "next/image";`;

run("meaningful-alt", rule, {
  valid: [
    // shadcn's own Avatar example, with the person's name.
    `${avatar}
    export function Owner() {
      return (
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      );
    }`,
    `${avatar}
    export function Row({ user }) {
      return <Avatar><AvatarImage src={user.image} alt={user.name} /><AvatarFallback>{user.initials}</AvatarFallback></Avatar>;
    }`,
    // Decoration: an empty alt is what the rule asks for.
    `export const A = () => <img src="/divider.svg" alt="" />;`,
    `export const A = () => <img src={lena} alt="" width={32} height={32} className="size-8 rounded-full" />;`,
    // More than the kind word.
    `export const A = () => <img src="/fernhill.svg" alt="Fernhill logo" />;`,
    `export const A = () => <img src="/chart.png" alt="Revenue rose each month from January to June" />;`,
    `${nextImage}
    export const Hero = () => <Image src="/team.jpg" alt="The Fernhill team at the spring meeting" width={800} height={400} />;`,
    // Names and descriptions from data.
    `export const A = ({ product }) => <img src={product.imageUrl} alt={product.title} />;`,
    `export const A = ({ photo }) => <img src={photo.src} alt={photo.description} />;`,
    `export const A = ({ image }) => <img src={image.src} alt={image.name} />;`,
    // A missing alt is jsx-a11y's alt-text.
    `export const A = ({ url }) => <img src={url} />;`,
    // Images in links and buttons follow TXT-003 and ACT-001b.
    `export const Home = () => <a href="/"><img src="/logo.svg" alt="logo" /></a>;`,
    `${avatar}
    export const Menu = () => (
      <DropdownMenuTrigger asChild>
        <Button variant="ghost"><Avatar><AvatarImage src={me.image} alt="Avatar" /></Avatar></Button>
      </DropdownMenuTrigger>
    );`,
    // Not an image element.
    `export const A = () => <Card alt="logo" />;`,
    `export const A = () => <input type="text" alt="image" />;`,
    // Words that contain a kind word, and a file name in a sentence that says more.
    `export const A = () => <img src="/x.png" alt="Logo of the Tallowbrook bakery" />;`,
  ],
  invalid: [
    // The Don't in examples/rules/STR-005.tsx, with its values.
    {
      code: `export const Row = () => <img src={clockSrc} alt="clock-red-2.svg" width={20} height={20} className="size-5" />;`,
      errors: [{ messageId: "fileName", data: { alt: "clock-red-2.svg" } }],
    },
    {
      code: `export const Row = () => <img src={lena} alt="Avatar" width={32} height={32} className="size-8 rounded-full" />;`,
      errors: [{ messageId: "kindWord", data: { alt: "Avatar" } }],
    },
    {
      code: `${avatar}\nexport const A = () => <Avatar><AvatarImage src={src} alt="avatar" /></Avatar>;`,
      errors: [{ messageId: "kindWord" }],
    },
    { code: `export const A = () => <img src="/logo.svg" alt="logo" />;`, errors: [{ messageId: "kindWord" }] },
    {
      code: `export const A = () => <img src="/hero.jpg" alt=" Hero " />;`,
      errors: [{ messageId: "kindWord", data: { alt: "Hero" } }],
    },
    { code: `export const A = () => <img src="/s.png" alt={"Screenshot"} />;`, errors: [{ messageId: "kindWord" }] },
    { code: `export const A = () => <img src="/line.svg" alt="decoration" />;`, errors: [{ messageId: "kindWord" }] },
    {
      code: `${nextImage}\nexport const A = () => <Image src={hero} alt="image" priority />;`,
      errors: [{ messageId: "kindWord" }],
    },
    {
      code: `export const A = () => <img src="/img/hero-2x.PNG" alt="/img/hero-2x.PNG" />;`,
      errors: [{ messageId: "fileName" }],
    },
    // A file name or address read from data.
    {
      code: `export const A = ({ file }) => <img src={URL.createObjectURL(file)} alt={file.name} />;`,
      errors: [{ messageId: "fileExpression" }],
    },
    {
      code: `export const A = ({ upload }) => <img src={upload.url} alt={upload.file.name} />;`,
      errors: [{ messageId: "fileExpression" }],
    },
    { code: `export const A = ({ src }) => <img src={src} alt={src} />;`, errors: [{ messageId: "fileExpression" }] },
    {
      code: `export const A = ({ photo }) => <img src={photo.url} alt={photo.url} />;`,
      errors: [{ messageId: "fileExpression" }],
    },
    {
      code: `export const A = ({ item }) => <img src={item.imageUrl} alt={item.imageUrl as string} />;`,
      errors: [{ messageId: "fileExpression" }],
    },
    {
      code: `export const A = ({ doc }) => <img src={doc.preview} alt={doc.fileName} />;`,
      errors: [{ messageId: "fileExpression" }],
    },
  ],
});
