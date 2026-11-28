# Partner contribution summary

Working record for the final project; presentation work is deferred until both partners are ready. Existing app: CoinQuest, originally created by Kyle Kitching. Final due December 16, 2026 at 11:59pm, as supplied in the assignment.

| Area | Lead | Current evidence/status |
| --- | --- | --- |
| Test planning | Bashir3355 | Plan prepared in [PR #9](https://github.com/ching202/CoinQuest/pull/9); team review pending |
| Black-box testing | Bashir3355 | 18 designed cases and EP/BVA artifacts in PR #9; that PR still records 0 browser executions |
| Defect documentation | Bashir3355 | CQ-D001/CQ-D002 reports in PR #9; Kyle's evidence is supplied for updates |
| Static testing | Kyle / ching202 | Guided App.jsx comparison, four findings and successful ESLint; Kyle accepted two fixes and retained ST-03/ST-04 as open |
| White-box testing | Kyle / ching202 | Real-component test suite, original 28 pass/2 fail, corrected 37 pass, coverage; code/tests prepared and executed with AI assistance |
| Correction/confirmation support | Kyle, with Bashir reviewing | Two local corrections, SQL proposal and 18 passing local SQL cases; no live deployment |
| AI-assisted testing | Kyle coordinating | Four actual activities/prompts, selected explanation and explicit review decisions recorded; see REVIEW_DECISIONS.md |
| Repository collaboration | Both | Bashir has PR #9; Kyle has [PR #10](https://github.com/ching202/CoinQuest/pull/10) and separate implementation/report commits; handoff posted on #9 |
| Presentation and demonstration | Both | Still to prepare; both partners must speak and participate |

## Kyle's observed participation

Kyle chose the existing app, clarified roles, requested guided static/white-box work, requested visible test demonstrations, supplied demonstration output, selected the AI-drafted XP explanation, restored/opened Supabase for read-only schema inspection, requested a database walkthrough, and directed preparation of his GitHub contribution.

The assistant wrote the proposed implementation, tests and documents and executed the recorded commands. Kyle subsequently completed the guided source comparison and explicitly accepted both fixes while leaving ST-03/ST-04 open. The exact decision and review scope are in REVIEW_DECISIONS.md. Assistant command execution remains attributed to the assistant.

## Handoff and remaining shared work

Kyle's static/white-box testing package, AI-use documentation and guided review decisions are ready for Bashir's review. The original failures and locally passing confirmations are preserved, and the contribution has commits and a pull request.

1. Bashir reviews PR #10 and updates his own defect records with the before/after evidence.
2. The team addresses live database preflight, deployment and integration verification before claiming live defect closure; the corrected frontend requires the migration.
3. Both partners prepare the final quality assessment, presentation and demonstration later.

Bashir retains ownership of black-box execution and defect records. A passing component test is not a substitute for his browser case results. ST-03 and ST-04 remain open by Kyle's decision.
