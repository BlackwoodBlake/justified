/*
 * Stand-ins for a router and for window.open in examples whose Don't calls
 * them. The examples have no pages to go to and must never open a tab, so
 * each call only reports where it would go, through the `report` the
 * example passes in (a scene's `say`, a status line's setter, or a setter
 * that swaps in the drawn screen the push would lead to).
 *
 * A Don't writes `const router = useSceneRouter(say)` and then the same
 * `router.push("/branches")` an app would, so the line that is wrong reads
 * like real code. The hook has its own name on purpose: it stands in for
 * next/navigation's useRouter without pretending to be it.
 */

export function useSceneRouter(report: (s: string) => void) {
  return {
    push: (to: string) => report(`Would go to ${to}`),
    replace: (to: string) => report(`Would go to ${to}`),
  };
}

/** Stands in for `window`, for a Don't that calls `window.open`. */
export function useSceneWindow(report: (s: string) => void) {
  return {
    open: (url: string) => report(`Would go to ${url} (window.open)`),
  };
}
