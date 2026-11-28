# CoinQuest — My Defect Reports

**Author:** Bashir Abdulkadir  
**Partner:** Kyle Kitching  
**Course:** AD361 — Application Testing  
**Last updated:** November 27, 2026

## My testing and evidence

I documented two defects found through AI-assisted source review and
simulated diagnostic checks. Kyle later added component tests, local SQL
tests, and proposed corrections in PR #10.

I personally reran the corrected automated checks on Windows at commit:

6582a3bc0e90a158b6428b7af431c150f9706012

My results were:

- ESLint: passed.
- Component tests: 37 passed, 0 failed.
- Local SQL tests: 18 passed, 0 failed.
- Production build: passed.

These results confirm the local automated checks passed. They do not
establish that the corrections work against the live Supabase database.
My browser confirmation and live integration verification remain pending.

## My severity and priority rules

Severity describes the impact of a defect:

- High: major functional or data inconsistency.
- Medium: limited functional behavior is incorrect.
- Low: minor presentation or usability issue.

Priority describes repair urgency:

- P1: address before accepting the affected feature.
- P2: address in the next planned repair.
- P3: lower urgency.

The severity and priority assignments below are my proposed assessments.

## CQ-D001 — XP can be awarded without a recorded quest completion

| Required field | My report |
| --- | --- |
| Defect ID and title | CQ-D001 — XP can be awarded without a recorded quest completion. |
| Related test or review | BB-17; original diagnostic SV-02; component regression WB-D01; local SQL regression SQL-D01. |
| Original environment | Original App.jsx from the supplied archive; Linux and Node v24.22.3; simulated hooks and database responses. This was an AI-executed diagnostic, not my browser reproduction. |
| My retest environment | Windows PowerShell 5.1; Node v25.2.1; npm v11.6.2; local component tests and PGlite SQL tests at commit 6582a3bc0e90a158b6428b7af431c150f9706012. |
| Original code location | frontend/src/App.jsx, original lines 69–99. The profile update occurred before the completion insert. These references apply to the original source, not necessarily the corrected file. |
| Expected result | Quest completion and its XP reward should be saved together. If completion fails, the operation should not leave an XP reward without a completion record. |
| Original actual result | Starting with 90 XP and a reward of 10, the simulated profile update stored 100 XP and level 2. The following completion insert failed, leaving no completion record while the component state still showed 90 XP. |
| Severity | High — reward and completion records can become inconsistent. Live database impact has not been reproduced. |
| Priority | P1 — address before accepting quest completion as reliable. |
| Current status | Locally corrected and retested. My automated rerun passed; browser confirmation and live integration verification remain pending. Not closed. |

### Original reproduction procedure

The original diagnostic used these steps:

1. Prepare a synthetic profile with 90 XP and level 1.
2. Prepare an available quest with a reward of 10 XP.
3. Allow the profile update to succeed.
4. Force the following user_quests insert to fail.
5. Compare the stored profile, completion records, and component state.

The original observation was stored XP 100, no completion record, and
component-state XP 90. I retain the original diagnostic evidence in:

- evidence/source_verification.json — SV-02.
- evidence/verify_source.cjs — original diagnostic runner.

Kyle also preserved the original real-component failures in
docs/kyle/evidence/before-fixes/ on his PR #10 branch.

### Correction

Kyle replaced the separate client-side writes with one database RPC
designed to update XP and record completion atomically.

His correction includes rollback behavior and protection against
duplicate rewards. The proposed SQL migration has not been applied to
Supabase according to his handoff, and the corrected frontend depends
on that migration.

Correction reference: PR #10, tests/kyle-static-whitebox.

My tested snapshot is commit:

6582a3bc0e90a158b6428b7af431c150f9706012

This is the snapshot I tested, not a claim that this documentation
commit originally introduced the code fix.

### My confirmation and regression results

I ran:

- npm run test:coverage
- npm run test:database

All 37 component cases and 18 local SQL cases passed.

The passing SQL-D01 case forces completion insertion to fail after the
XP update and checks rollback. The passing SQL-03 case checks that a
retry awards XP only once and retains one completion record.

These checks support the local correction. They do not replace my
browser confirmation or verify the deployed Supabase environment.

### Remaining work

I will confirm the migration dependency with Kyle and verify the
workflow in an approved test environment. I will check successful
completion, failure recovery, reload behavior, and repeated requests.

**Final disposition:** Locally corrected and retested; browser and live
integration verification pending.

## CQ-D002 — An incomplete quest record is treated as completed

| Required field | My report |
| --- | --- |
| Defect ID and title | CQ-D002 — An incomplete quest record is treated as completed. |
| Related test or review | BB-16; original diagnostic SV-01; component regression tests; SQL-D02 tests for false/null completion rows. |
| Original environment | Original App.jsx; Linux and Node v24.22.3; synthetic data with completed=false and simulated database responses. This was an AI-executed diagnostic. |
| My retest environment | Windows PowerShell 5.1; Node v25.2.1; npm v11.6.2; local component tests and PGlite SQL tests at commit 6582a3bc0e90a158b6428b7af431c150f9706012. |
| Original code location | frontend/src/App.jsx, original lines 119–125 classified matching records without checking completed. Original lines 58–62 also checked matching IDs without checking the completion flag. |
| Expected result | A record marked completed=false or completed=null should not be treated as a completed quest. Completion should handle an existing incomplete record without creating a duplicate. |
| Original actual result | A matching record with completed=false produced zero available quests and one completed quest in the source diagnostic. |
| Schema evidence | Kyle reported read-only inspection showing completed is a nullable boolean with default false. This supports the test state but is not a live reproduction. |
| Severity | Medium — an incomplete quest can be displayed as completed and become unavailable to finish. |
| Priority | P2 — correct the classification and handling of incomplete records. |
| Current status | Locally corrected and retested. My automated rerun passed; browser confirmation and live integration verification remain pending. Not closed. |

### Original reproduction procedure

The original diagnostic used these steps:

1. Prepare synthetic profile p1 and quest q1.
2. Add a matching user_quests record with completed=false.
3. Execute the original quest-classification logic.
4. Inspect the available and completed quest lists.
5. Observe that q1 is classified as completed instead of available.

I retain the original diagnostic evidence in:

- evidence/source_verification.json — SV-01.
- evidence/verify_source.cjs — original diagnostic runner.

### Correction

Kyle added explicit completion-flag checks so incomplete records do not
count as completed.

The corrected database workflow also handles existing false/null
records by reusing them instead of inserting a duplicate.

Correction reference: PR #10, tests/kyle-static-whitebox.

My tested snapshot is commit:

6582a3bc0e90a158b6428b7af431c150f9706012

### My confirmation and regression results

My automated rerun completed successfully:

- All 37 component cases passed.
- All 18 local SQL cases passed.
- SQL-D02 passed for an existing completed=false record.
- SQL-D02 passed for an existing completed=null record.
- SQL-08 passed for duplicate profile/quest rejection.
- SQL-10 passed for migration rejection of pre-existing duplicates.

Kyle's component report also describes checking that an incomplete
quest stays available and can then be completed.

These results support the local correction. I have not yet recorded
the corresponding browser observations or live integration results.

### Remaining work

I will verify available/completed display behavior using controlled
test data, confirm completion of an incomplete record, and check the
result after reloading.

**Final disposition:** Locally corrected and retested; browser and live
integration verification pending.

## My retest summary

| Defect | Original finding | My local automated retest | Browser/live verification | Status |
| --- | --- | --- | --- | --- |
| CQ-D001 | XP persisted after failed completion insertion. | Related component and SQL checks passed. | Pending. | Locally corrected and retested; not closed. |
| CQ-D002 | Incomplete record was classified as completed. | Related component and false/null SQL checks passed. | Pending. | Locally corrected and retested; not closed. |

## Environment limitations

My run used Node v25.2.1. Installation produced unsupported-engine
warnings because this version is outside the project's declared
supported versions. The checks still passed, but I will record this
limitation and use a supported version for subsequent validation.

npm also reported 11 dependency vulnerabilities: 4 moderate and 7 high.
These require assessment. I have not run npm audit fix or changed the
dependencies as part of this retest.

## Other open findings

Kyle's ST-03 and ST-04 remain open:

- ST-03: failed reads can appear as empty or zero data.
- ST-04: zero-target savings calculations need handling.

I am not claiming that either finding has been corrected.

## My evidence and contribution

I retain my original defect reports and diagnostic evidence, credit
Kyle's correction work, and record my own successful local rerun.

The local automated results do not complete my black-box browser
testing. I still need at least six executed black-box cases across two
techniques, with actual results and evidence.

Neither defect is marked closed, and I am not claiming that the SQL
migration has been deployed or that live integration has passed.