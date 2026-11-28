# Overrides test project

A small project for trying `/justified-review` by hand against a `justified.json`. It is not built, typechecked or published; the imports do not resolve. Open Claude Code in this folder with the review skill installed, run `/justified-review src`, and compare the report with what follows.

## What `justified.json` holds

| Id | Action | Scope | What it tests |
| --- | --- | --- | --- |
| ACT-006 | off | `src/admin/**` | A WCAG requirement turned off for one folder |
| ACT-001a | guideline | everywhere | A rule treated as a guideline |
| DLG-003 | note | `src/invoices/**` | The text applies; the reason is context |
| FRM-099 | off | everywhere | An id that does not exist |
| FRM-007 | off | `src/settings/**` | An old `rule_version` and a `review_by` date that has passed |

## What a correct report shows

- After *Reviewed*, the number of overrides that applied to the reviewed files.
- *Overridden by the project*, requirements first:
  - FRM-007 (off, `in src/settings/**`): quoted reason, "Not checked in 1 reviewed file.", the criterion WCAG 2.2 1.3.5 Identify Input Purpose, the past `review_by`, and "Would otherwise be reported at `src/settings/profile-form.tsx:10`."
  - ACT-006 (off, `in src/admin/**`): quoted reason, "Not checked in 1 reviewed file.", the criterion WCAG 2.2 2.5.8 Target Size (Minimum), `review_by` 2027-03-01, and "Would otherwise be reported at `src/admin/users-table.tsx:7`."
  - ACT-001a (guideline, everywhere), with its quoted reason, after the requirements. It is listed because it applied; see below for whether it is also reported.
  - DLG-003 is a `note`, so it is not listed here.
- *Overrides to look at*: FRM-099 does not exist, and FRM-007 has a `rule_version` below the current major version and a `review_by` that has passed. In both cases the override still applies. FRM-007 stays off.
- *Rules*:
  - ACT-006 at `src/settings/toolbar.tsx`, because the override covers only `src/admin/**`.
  - DLG-003 at `src/invoices/void-invoice.tsx`: "OK" does not name the action. The note's reason may be mentioned as context. It does not remove the finding unless the reviewer decides the rule does not apply.
- *Guidelines*: the "Submit" button in `src/settings/profile-form.tsx` is reported under ACT-001a only if the project has no convention of its own. The reason says it does, so it is left out.
- No ACT-006 finding for `src/admin/users-table.tsx` and no FRM-007 finding for the email field, other than the "Would otherwise be reported" lines above.
- Because there are findings and overrides, the report does not say "No problems found". It ends with the line about automated checks.
- Nothing says an overridden rule passes, is fine or is resolved.
