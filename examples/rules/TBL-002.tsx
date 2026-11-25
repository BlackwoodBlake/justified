import { Button } from "@blackwoodblake/justified-shadcn/button";
import { useId, useMemo, useRef, useState } from "react";

import { Outcome, useSay } from "./dialog";
import type { RuleExamples } from "./frame";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  HeaderFacts,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  titleCaption,
} from "./table-demo";

/*
 * TBL-002: a sortable header holds a keyboard sort control, and the order is
 * in code, not in an arrow alone.
 *
 * A club's page "Spring 10k results". Club and Finish time sort; Runner and
 * Age group are plain text. The page opens sorted by Finish time, fastest
 * first. Under each table, a note lists what the code holds for each column
 * heading: its control, its name and its aria-sort.
 *
 *   Do: a ghost Button inside the th, aria-sort on the th, an icon that
 *     follows the state and is hidden from assistive technology, and a
 *     polite status line that says the new order (FBK-004). Focus stays on
 *     the same button as the rows move.
 *   Don't (pointer only): the click is on the th, with no control inside.
 *   Don't (arrow only): a button, but no aria-sort. The arrow carries the
 *     order.
 *   Don't (instruction as name): a button named "Sort by finish time".
 *
 * Each Don't breaks only its own point. The Don'ts say nothing after a sort,
 * so the status line does not make up for what they leave out.
 */

type Key = "club" | "time";
type Dir = "asc" | "desc";
type Mode = "do" | "pointer" | "arrow" | "label";

const RUNNERS = [
  { name: "Amira Haddad", club: "Harbour Harriers", time: "38:12", age: "30 to 39" },
  { name: "Tom Brandt", club: "Eastside Runners", time: "41:05", age: "40 to 49" },
  { name: "Priya Nair", club: "Harbour Harriers", time: "36:48", age: "30 to 39" },
  { name: "Jonas Berg", club: "Fell Foxes", time: "44:30", age: "50 to 59" },
  { name: "Lena Ortiz", club: "Eastside Runners", time: "39:27", age: "20 to 29" },
  { name: "Sam Whitlock", club: "Fell Foxes", time: "42:51", age: "40 to 49" },
];

const seconds = (t: string) => {
  const [m, s] = t.split(":").map(Number);
  return m * 60 + s;
};

const WORDS: Record<Key, { name: string; asc: string; desc: string }> = {
  club: { name: "club", asc: "A to Z", desc: "Z to A" },
  time: { name: "finish time", asc: "fastest first", desc: "slowest first" },
};

function Results({ mode }: { mode: Mode }) {
  const id = useId();
  const [sort, setSort] = useState<{ key: Key; dir: Dir }>({ key: "time", dir: "asc" });
  const [said, say] = useSay();
  const scope = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => {
    const sign = sort.dir === "asc" ? 1 : -1;
    return [...RUNNERS].sort((a, b) =>
      sort.key === "time" ? sign * (seconds(a.time) - seconds(b.time)) : sign * a.club.localeCompare(b.club),
    );
  }, [sort]);

  const press = (key: Key) => {
    const dir: Dir = sort.key === key && sort.dir === "asc" ? "desc" : "asc";
    setSort({ key, dir });
    if (mode === "do") say(`Sorted by ${WORDS[key].name}, ${WORDS[key][dir]}.`);
  };

  const heading = (key: Key, text: string) => {
    const active = sort.key === key;
    const icon = !active ? <ArrowUpDownIcon /> : sort.dir === "asc" ? <ArrowUpIcon /> : <ArrowDownIcon />;
    // aria-sort belongs on the header cell, and only the Don't about arrows leaves it out.
    const ariaSort = active && mode !== "arrow" ? (sort.dir === "asc" ? "ascending" : "descending") : undefined;

    if (mode === "pointer") {
      return (
        <TableHead key={key} scope="col" aria-sort={ariaSort} onClick={() => press(key)} className="cursor-pointer">
          <span className="inline-flex items-center gap-2">
            {text}
            {icon}
          </span>
        </TableHead>
      );
    }
    return (
      <TableHead key={key} scope="col" aria-sort={ariaSort}>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3"
          aria-label={mode === "label" ? `Sort by ${WORDS[key].name}` : undefined}
          onClick={() => press(key)}
        >
          {text}
          {icon}
        </Button>
      </TableHead>
    );
  };

  return (
    <div ref={scope} className="flex w-full min-w-0 flex-col gap-3">
      <Table scrollLabelledBy={id}>
        <TableCaption id={id} className={titleCaption}>
          Spring 10k results
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Runner</TableHead>
            {heading("club", "Club")}
            {heading("time", "Finish time")}
            <TableHead scope="col">Age group</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.name}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.club}</TableCell>
              <TableCell className="tabular-nums">{r.time}</TableCell>
              <TableCell>{r.age}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Outcome>{said}</Outcome>
      <HeaderFacts scope={scope} />
    </div>
  );
}

export const TBL002: RuleExamples = {
  id: "TBL-002",
  examples: [
    {
      kind: "do",
      title: "A button in the header, the order in aria-sort",
      caption: (
        <>
          The page opens sorted by <em>Finish time</em>, fastest first, with <code>aria-sort</code> already on that
          column. Tab to <em>Club</em> and press Enter or Space: the rows move, focus stays on the button and the note
          under the table follows. Press it again to reverse the order. The arrow is decoration; the order is in the
          code and in the status line.
        </>
      ),
      Demo: () => <Results mode="do" />,
    },
    {
      kind: "dont",
      title: "The click is on the header cell",
      caption: (
        <>
          Click <em>Club</em> and the rows sort. Tab through the page: no heading can be reached, because the click
          handler sits on the cell and there is no button inside it. A keyboard user cannot sort at all.
        </>
      ),
      Demo: () => <Results mode="pointer" />,
    },
    {
      kind: "dont",
      title: "The arrow alone shows the order",
      caption: (
        <>
          The buttons work from the keyboard, but no heading has <code>aria-sort</code>, so the note under the table
          shows none. Press <em>Finish time</em> twice: the arrow turns, and a person who cannot see it does not know
          whether the fastest runner is at the top or at the bottom.
        </>
      ),
      Demo: () => <Results mode="arrow" />,
    },
    {
      kind: "dont",
      title: "A button named Sort by finish time",
      caption: (
        <>
          The order is in <code>aria-sort</code>, as it should be. But the button now has the name &ldquo;Sort by finish
          time&rdquo;, an instruction read out on every visit, and the same name is given to the column heading,
          so a screen reader says &ldquo;Sort by club&rdquo; before each value in the column. The name still contains
          the visible words, so this is our own advice and not a failure of the law: keep the name to the heading.
        </>
      ),
      Demo: () => <Results mode="label" />,
    },
  ],
};
