# CoinQuest — My Final Project Sections

**Bashir Abdulkadir | Partner: Kyle Kitching | AD361**

My assigned sections are test planning, black-box testing, and defect
documentation for Kyle's existing CoinQuest application.

## My files

1. [My test plan](docs/TEST_PLAN.md)
2. [My black-box testing](docs/BLACK_BOX_TESTING.md)
3. [My defect reports](docs/DEFECT_REPORTS.md)
4. [My AI transparency and review checklist](docs/Myparts.md)
5. Original diagnostic evidence:
   [observations](evidence/source_verification.json) and
   [runner](evidence/verify_source.cjs).

## My completed work

I prepared my test plan, equivalence partitioning and boundary value
analysis tables, 18 black-box test cases, and two defect reports.

I committed my documentation as 9aff352, pushed the
docs/bashir-testing branch, and opened PR #9.

I also reran Kyle's automated checks at commit
6582a3bc0e90a158b6428b7af431c150f9706012:

- ESLint passed.
- All 37 component tests passed.
- All 18 local SQL tests passed.
- The production build passed.

My run used Windows PowerShell 5.1, Node v25.2.1, and npm v11.6.2.
Node produced unsupported-engine warnings. Installation also reported
11 dependency vulnerabilities: 4 moderate and 7 high. These limitations
need assessment; I have not changed dependencies to address them.

## My defect status

Kyle proposed corrections for CQ-D001 and CQ-D002 in PR #10.
My local automated rerun passed.

Both defects are locally corrected and retested, with browser
confirmation and live integration verification pending. I have
preserved the original failure evidence and have not closed the reports.

According to Kyle's handoff, the SQL migration has not been deployed
to Supabase, and the corrected frontend depends on it.

ST-03, failed-read feedback, and ST-04, zero-target savings handling,
remain open.

## My remaining work

1. Confirm controlled test data and expected behavior with Kyle.
2. Execute at least six black-box cases across two techniques.
3. Record actual browser results, pass/fail status, and evidence.
4. Complete browser confirmation of the corrected quest behavior in
   an approved test environment.
5. Keep my AI prompts and actual review decisions accurate.
6. Commit and push my documentation updates to the existing PR #9.
7. Prepare the presentation and demonstration with Kyle.

My automated rerun does not replace my black-box browser testing.
The 18 browser cases remain unexecuted unless their individual records
contain actual execution evidence.

## AI transparency

AI helped draft and organize my documentation and performed the
original simulated source diagnostics. I personally ran the automated
commands listed above and supplied their terminal output.

I am reviewing the generated work and recording my own observations.
I will not claim browser testing, live verification, or review decisions
that I have not completed.

## Team responsibilities

I lead test planning, black-box testing, and defect documentation.
Kyle leads static and white-box testing and the proposed corrections.
We share review, presentation, and demonstration responsibilities.

My work is in PR #9. Kyle's testing and correction package is in PR #10.