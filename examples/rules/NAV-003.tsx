import { OrderDemo, OrderPair, orderCurrentFirst, orderPerPage, orderShared } from "./nav-demo";
import type { RuleExamples } from "./frame";

/*
 * NAV-003 (a requirement): navigation repeated across pages keeps the same
 * relative order, unless the person changed it.
 *
 * Two small pictures show the menu on two pages, built with the same order
 * function as the live sidebar under them, so they cannot drift from it. The
 * live sidebar lists the order it really rendered, for every page opened.
 */

export const NAV003: RuleExamples = {
  id: "NAV-003",
  examples: [
    {
      kind: "do",
      title: "One shared list, filtered not sorted",
      caption: (
        <>
          Open each page: the order never changes. Turn on <em>Bookkeeper view</em>: <em>Reports</em> goes, and
          the rest keep their order.
        </>
      ),
      Demo: () => (
        <div className="grid w-full justify-items-center gap-4">
          <OrderPair order={orderShared} pages={["dashboard", "settings"]} />
          <OrderDemo order={orderShared} controls="role" />
        </div>
      ),
    },
    {
      kind: "dont",
      title: "Each page builds its own list",
      caption: (
        <>
          The settings page lists <em>Clients</em> first. Open <em>Settings</em>, then <em>Dashboard</em>, and compare the
          order lines under the menu. Someone who learned the first menu now reaches for the wrong item.
        </>
      ),
      Demo: () => (
        <div className="grid w-full justify-items-center gap-4">
          <OrderPair order={orderPerPage} pages={["dashboard", "settings"]} />
          <OrderDemo order={orderPerPage} />
        </div>
      ),
    },
    {
      kind: "dont",
      title: "The current item jumps to the top",
      caption: (
        <>
          Open a few pages. The item for the page you are on always moves to the first place, so no item has a fixed
          position to reach for.
        </>
      ),
      Demo: () => (
        <div className="grid w-full justify-items-center gap-4">
          <OrderPair order={orderCurrentFirst} pages={["dashboard", "settings"]} />
          <OrderDemo order={orderCurrentFirst} />
        </div>
      ),
    },
    {
      kind: "do",
      title: "An order the person set holds",
      caption: (
        <>
          Press <em>Move Clients to the top</em>, then open other pages. The person's order stays on every page until they
          press <em>Reset order</em>.
        </>
      ),
      Demo: () => (
        <div className="grid w-full justify-items-center gap-4">
          <OrderPair order={orderShared} pages={["dashboard", "settings"]} custom={["clients", "dashboard", "invoices", "reports", "settings"]} />
          <OrderDemo order={orderShared} controls="custom" />
        </div>
      ),
    },
  ],
};
