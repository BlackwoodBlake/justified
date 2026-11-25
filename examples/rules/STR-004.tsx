import type { RuleExamples } from "./frame";
import { LandmarkDemo, type Region } from "./structure-demo";

/*
 * STR-004 (a requirement, with landmarks as one way to meet it): regions are
 * landmark elements, one main, and repeated landmarks have names.
 *
 * A drawn app shell, Ridgeway, shows the element of every region as a chip,
 * and the list is what a screen reader would offer. No landmark is added to
 * the real page.
 */

const header = (nav?: Region): Region => ({
  el: "header",
  label: "Ridgeway · Account menu",
  children: nav ? [nav] : undefined,
});

const footer: Region = { el: "footer", label: "Help · Status" };

export const STR004: RuleExamples = {
  id: "STR-004",
  examples: [
    {
      kind: "do",
      title: "Regions are landmarks, navs are named",
      caption: (
        <>
          Press <em>Next landmark</em>. It goes from the top bar to each of the two navigation lists, named <em>Main</em> and{" "}
          <em>Projects</em>, then to the one <code>main</code> and the footer. The screen reader adds "navigation" itself, so the
          names do not.
        </>
      ),
      Demo: () => (
        <LandmarkDemo
          top={header({ el: "nav", name: "Main", label: "Projects · Reports" })}
          side={{ el: "nav", name: "Projects", label: "Spring launch · Autumn sale" }}
          content={{ el: "main", label: "The view" }}
          bottom={footer}
        />
      ),
    },
    {
      kind: "dont",
      title: "A shell built from divs",
      caption: (
        <>
          Same shell and same looks, but every region is a <code>div</code>. The landmark list is empty, so there is nothing to jump
          between and a person passes every link on the way to the content.
        </>
      ),
      Demo: () => (
        <LandmarkDemo
          top={{ el: "div", label: "Ridgeway · Account menu" }}
          side={{ el: "div", label: "Spring launch · Autumn sale" }}
          content={{ el: "div", label: "The view" }}
          bottom={{ el: "div", label: "Help · Status" }}
        />
      ),
    },
    {
      kind: "dont",
      title: "Two navs with no names",
      caption: (
        <>
          The landmarks are all there, but both lists of links are announced as just "navigation". The person has to try each one to
          find the menu they wanted.
        </>
      ),
      Demo: () => (
        <LandmarkDemo
          top={header({ el: "nav", label: "Projects · Reports" })}
          side={{ el: "nav", label: "Spring launch · Autumn sale" }}
          content={{ el: "main", label: "The view" }}
          bottom={footer}
        />
      ),
    },
    {
      kind: "dont",
      title: "A second main",
      caption: (
        <>
          The shell's inset already renders a <code>main</code>, and the page adds another inside it. A page has one, so the list
          offers two and neither is clearly the content.
        </>
      ),
      Demo: () => (
        <LandmarkDemo
          top={header({ el: "nav", name: "Main", label: "Projects · Reports" })}
          side={{ el: "nav", name: "Projects", label: "Spring launch · Autumn sale" }}
          content={{ el: "main", label: "The shell's inset", children: [{ el: "main", label: "The page's own main" }] }}
          bottom={footer}
        />
      ),
    },
  ],
};
