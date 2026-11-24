import { Field } from "@blackwoodblake/justified-shadcn/field";
import { Switch } from "@blackwoodblake/justified-shadcn/switch";
import { useId, useRef, useState, type MouseEvent, type ReactNode } from "react";

import { Outcome } from "./dialog";
import type { RuleExamples } from "./frame";
import { LinkNames } from "./readout";

/*
 * TXT-003: a link says where it goes, alone or with its sentence, list item
 * or cell.
 *
 * Both examples show the same three monthly reports and a switch that lists
 * every link by its name, as a screen reader's list of links would. In the Do
 * each link names its report. In the Don't each link says only "Download"
 * and sits under a label line that names the report. The label is a separate
 * paragraph, not the link, its sentence, a list item or a cell, so nothing in
 * code ties it to the link. The code order is the screen order. The label is
 * body-size text, so it does not pass for a heading.
 */

type Report = { month: string; size: string; slug: string };

const reports: Report[] = [
  { month: "March", size: "1.2 MB", slug: "march" },
  { month: "April", size: "0.9 MB", slug: "april" },
  { month: "May", size: "1.4 MB", slug: "may" },
];

const link = "rounded-sm text-primary underline underline-offset-4 hover:decoration-2";

function useReports() {
  const [said, setSaid] = useState("");
  const [show, setShow] = useState(false);
  const scope = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const download = (r: Report) => (e: MouseEvent) => {
    e.preventDefault();
    setSaid("");
    setTimeout(() => setSaid(`The ${r.month} report would download now. (In this example no file is saved.)`), 50);
  };
  return { said, show, setShow, scope, headingId, download };
}

function Frame({ s, children }: { s: ReturnType<typeof useReports>; children: ReactNode }) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
      <div ref={s.scope} className="grid w-full gap-3 rounded-lg border border-border bg-background p-4">
        <h4 id={s.headingId} className="m-0 text-base font-semibold">
          Monthly reports
        </h4>
        {children}
      </div>
      <Field label="Show links as a list" layout="inline" className="w-full">
        <Switch checked={s.show} onCheckedChange={s.setShow} />
      </Field>
      <LinkNames scope={s.scope} show={s.show} />
      <Outcome>{s.said}</Outcome>
    </div>
  );
}

function NamedLinks() {
  const s = useReports();
  return (
    <Frame s={s}>
      <table aria-labelledby={s.headingId} className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th scope="col" className="py-2 pr-3 font-medium">
              Month
            </th>
            <th scope="col" className="py-2 pr-3 font-medium">
              Size
            </th>
            <th scope="col" className="py-2 font-medium">
              File
            </th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.slug} className="border-b border-border last:border-0">
              <th scope="row" className="py-2 pr-3 font-normal">
                {r.month}
              </th>
              <td className="py-2 pr-3 whitespace-nowrap tabular-nums">{r.size}</td>
              <td className="py-2">
                <a href={`#report-${r.slug}`} className={link} onClick={s.download(r)}>
                  Download {r.month} report (CSV)
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Frame>
  );
}

function BareLinks() {
  const s = useReports();
  return (
    <Frame s={s}>
      {/* Plain divs on purpose: a list item or a cell would count as context and the link would pass. */}
      <div className="grid text-sm">
        {reports.map((r) => (
          <div key={r.slug} className="border-b border-border py-2 first:pt-0 last:border-0 last:pb-0">
            <p className="m-0 font-semibold">
              {r.month} report, {r.size}
            </p>
            <div className="mt-1">
              <a href={`#report-${r.slug}`} className={link} onClick={s.download(r)}>
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export const TXT003: RuleExamples = {
  id: "TXT-003",
  examples: [
    {
      kind: "do",
      title: "Each link names its report",
      caption: (
        <>
          Every link says which report it downloads and in what format. Turn on <em>Show links as a list</em> to see the
          links by name, as a screen reader can list them: all three read differently, with nothing around them.
        </>
      ),
      Demo: NamedLinks,
    },
    {
      kind: "dont",
      title: "The same word on every link",
      caption: (
        <>
          Each <em>Download</em> sits under its report's name, but that name is a separate paragraph: not in the link,
          its sentence, a list item or a cell. Turn on <em>Show links as a list</em>: "Download" three times, with no
          way to tell them apart.
        </>
      ),
      Demo: BareLinks,
    },
  ],
};
