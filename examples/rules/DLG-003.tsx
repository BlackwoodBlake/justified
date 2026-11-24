import { DeleteOne, type ConfirmScene } from "./confirm";
import type { RuleExamples } from "./frame";

/*
 * DLG-003: in a destructive confirmation, the button names the action, and
 * there is always a Cancel that works.
 *
 * All three examples ask before 340 receipts are erased for good, which is
 * the kind of step DST-001b says to ask about. The title, the description,
 * the red style (DLG-005) and the first focus (DLG-004) stay the same; only
 * the buttons change.
 */

const base: Omit<ConfirmScene, "actionLabel"> = {
  heading: "Receipts from 2024",
  present: "340 receipts, kept nowhere else.",
  gone: "No receipts left for 2024.",
  trigger: "Delete 2024 receipts",
  title: "Delete the 340 receipts from 2024?",
  description: "They are erased for good and cannot be brought back.",
  deleted: "Deleted. The 340 receipts from 2024 are gone. (In this example, Reset example brings them back.)",
  kept: "Cancelled. Nothing was deleted.",
};

export const DLG003: RuleExamples = {
  id: "DLG-003",
  examples: [
    {
      kind: "do",
      title: "The button says what will be lost",
      caption: (
        <>
          Press <em>Delete 2024 receipts</em>. The dialog offers <em>Cancel</em> and <em>Delete receipts</em>: the
          button states the result on its face, and a screen reader reads the same words. <em>Cancel</em> and Escape
          close it with nothing changed.
        </>
      ),
      Demo: () => <DeleteOne scene={{ ...base, actionLabel: "Delete receipts" }} />,
    },
    {
      kind: "dont",
      title: "OK instead of the action",
      caption: (
        <>
          The same dialog with <em>Cancel</em> and <em>OK</em>. To know what <em>OK</em> does, the person has to read
          the question again. Someone in a hurry presses it and loses a year of receipts.
        </>
      ),
      Demo: () => <DeleteOne scene={{ ...base, actionLabel: "OK" }} />,
    },
    {
      kind: "dont",
      title: "No Cancel, only a close icon",
      caption: (
        <>
          The dialog has <em>Delete receipts</em> and a close icon, but no <em>Cancel</em>. The only visible button
          deletes. The safe way out is a small icon whose result the person has to guess.
        </>
      ),
      Demo: () => <DeleteOne scene={{ ...base, actionLabel: "Delete receipts", way: "no-cancel" }} />,
    },
  ],
};
