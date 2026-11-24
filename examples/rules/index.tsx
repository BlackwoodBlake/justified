import { ACT001a } from "./ACT-001a";
import { ACT001b } from "./ACT-001b";
import { ACT002a } from "./ACT-002a";
import { ACT002b } from "./ACT-002b";
import { ACT003a } from "./ACT-003a";
import { ACT003b } from "./ACT-003b";
import { ACT004 } from "./ACT-004";
import { ACT005 } from "./ACT-005";
import { ACT006 } from "./ACT-006";
import { DLG001 } from "./DLG-001";
import { DLG002 } from "./DLG-002";
import { DLG003 } from "./DLG-003";
import { DLG004 } from "./DLG-004";
import { DLG005 } from "./DLG-005";
import { DLG006 } from "./DLG-006";
import { DLG007 } from "./DLG-007";
import { DST001a } from "./DST-001a";
import { DST001b } from "./DST-001b";
import { FBK002 } from "./FBK-002";
import { FBK003 } from "./FBK-003";
import { FBK004 } from "./FBK-004";
import { FBK005 } from "./FBK-005";
import { ExampleGrid, type RuleExamples } from "./frame";
import { FRM001 } from "./FRM-001";
import { FRM002a } from "./FRM-002a";
import { FRM002b } from "./FRM-002b";
import { FRM003 } from "./FRM-003";
import { FRM004a } from "./FRM-004a";
import { FRM004b } from "./FRM-004b";
import { FRM005 } from "./FRM-005";
import { FRM007 } from "./FRM-007";
import { FRM008 } from "./FRM-008";
import { FRM009 } from "./FRM-009";
import { FRM010 } from "./FRM-010";
import { FRM011 } from "./FRM-011";
import { KBD001 } from "./KBD-001";
import { KBD002 } from "./KBD-002";
import { LAY001 } from "./LAY-001";
import { LAY002 } from "./LAY-002";
import { STA001 } from "./STA-001";
import { STA004 } from "./STA-004";
import { STA005a } from "./STA-005a";
import { STA005b } from "./STA-005b";
import { TXT001a } from "./TXT-001a";
import { TXT002a } from "./TXT-002a";
import { TXT002b } from "./TXT-002b";
import { TXT003 } from "./TXT-003";

/*
 * Live Do and Don't examples for the rules. Every example is our own and
 * built from Justified's components; none is taken from a source.
 * The website shows them on each rule page, and Storybook under Rules.
 */

export const ruleExamples: RuleExamples[] = [
  ACT001a,
  ACT001b,
  ACT002a,
  ACT002b,
  ACT003a,
  ACT003b,
  ACT004,
  ACT005,
  ACT006,
  DLG001,
  DLG002,
  DLG003,
  DLG004,
  DLG005,
  DLG006,
  DLG007,
  DST001a,
  DST001b,
  FBK002,
  FBK003,
  FBK004,
  FBK005,
  FRM001,
  FRM002a,
  FRM002b,
  FRM003,
  FRM004a,
  FRM004b,
  FRM005,
  FRM007,
  FRM008,
  FRM009,
  FRM010,
  FRM011,
  KBD001,
  KBD002,
  LAY001,
  LAY002,
  STA001,
  STA004,
  STA005a,
  STA005b,
  TXT001a,
  TXT002a,
  TXT002b,
  TXT003,
];

const byId = new Map(ruleExamples.map((r) => [r.id, r]));

export function hasExamples(id: string) {
  return byId.has(id);
}

/** All examples of one rule, or nothing if it has none yet. */
export function RuleExamplesFor({ id }: { id: string }) {
  const rule = byId.get(id);
  return rule ? <ExampleGrid examples={rule.examples} /> : null;
}

export { ExampleFrame, ExampleGrid } from "./frame";
export type { RuleExample, RuleExamples } from "./frame";
