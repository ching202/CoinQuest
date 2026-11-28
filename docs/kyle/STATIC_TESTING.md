# Static testing of App.jsx

**Owner:** Kyle Kitching

**Review date:** November 24, 2026

**Source baseline:** `ae78c7005733e36c0e08c5d921938a7873c3181a`

**File reviewed:** original `frontend/src/App.jsx`, now preserved at [evidence/before-fixes/App.jsx](evidence/before-fixes/App.jsx).

**Correction update:** CQ-D001 and CQ-D002 are now corrected and retested locally: 37 component and 18 SQL cases pass. Live verification and final team acceptance remain pending. See [CORRECTION_REVIEW.md](CORRECTION_REVIEW.md). The source line numbers and original observations below refer to the archived baseline; ST-03/ST-04 remain open.

**Status:** Guided, AI-assisted source comparison completed; Kyle accepted CQ-D001/CQ-D002 and explicitly chose to leave ST-03/ST-04 open. See [REVIEW_DECISIONS.md](REVIEW_DECISIONS.md) for his exact decision and review scope.

## What static testing means

Static testing examines source code without executing the application. This section combines a source review with automated ESLint analysis. Component tests execute the code and belong in WHITE_BOX_TESTING.md instead.

The source review examines data loading, quest completion, collection processing, calculations, and JSX rendering. It asks whether each path preserves consistent state, handles missing/error data, and implements the intended rule. The current implementation is evidence of behavior, not an independent specification.

## Read the file in this order

| Lines | Purpose | Review question |
| --- | --- | --- |
| 5-12 | Component state | What data starts empty, and how is loading represented? |
| 14-51 | Six asynchronous reads | How are errors distinguished from successful empty responses? |
| 53-115 | Quest completion | Can only one of the two writes succeed? What stops duplicate rewards? |
| 117-133 | Quest classification | Does a matching row actually mean the quest is complete? |
| 135-164 | Financial calculations | What happens with zero income and empty transaction arrays? |
| 166-359 | Display and collection rendering | Which conditional displays and calculations need tests? |

Line numbers refer to the archived original baseline file. Inspect the linked code before adopting a finding.

## Findings and dispositions

### ST-01: XP and quest completion can be saved inconsistently

- **Location:** lines 72-99, inside `completeQuest`.
- **Evidence from reading:** The profile update is awaited first. The completion insert is a separate operation. On insert error, the function logs and returns without rolling back the earlier profile update.
- **Impact:** Under a successful first write and failed second write, stored XP can increase without recorded completion. Component state is updated only after both writes, so it can also differ from stored state.
- **Proposed severity / priority:** High / P1, subject to team triage.
- **Recommendation:** After inspecting the actual schema and policies, use an atomic database operation that records completion and updates XP together, with duplicate protection. Swapping the two client writes alone merely changes which partial result can remain.
- **Related report:** Bashir's CQ-D001, BB-17, and SV-02 in PR #9.
- **Confirmation design:** Start at XP 90, reward 10. Allow the profile update and fail the completion insert. Require stored XP to remain 90 when completion fails. Then verify successful completion and repeated attempts.
- **Current status:** Locally corrected and retested. Original failure preserved; local SQL rollback passes. Kyle accepted the correction after the guided comparison. Code is committed in PR #10; partner review and live integration verification remain pending.

### ST-02: Completion classification ignores the completed flag

- **Location:** duplicate check at lines 58-62; list classification at lines 119-125.
- **Evidence from reading:** Both checks use matching IDs without inspecting `completed`.
- **Impact:** A row with `completed: false` hides the quest from Available Quests and treats it as completed. The restored table definition explicitly uses `completed boolean null default false`.
- **Proposed severity / priority:** Medium / P2, for team triage; the false value is now supported by observed schema evidence.
- **Recommendation:** Consistently check completion status and decide whether completion updates an existing incomplete row or inserts a new one. Inspect separate indexes/triggers and respect uniqueness rules before choosing a write strategy.
- **Related report:** Bashir's CQ-D002, BB-16, and SV-01 in PR #9.
- **Confirmation design:** Compare false, true, absent, and another user's completion records. A false row should remain available under the proposed rule.
- **Current status:** Locally corrected and retested, including completion of existing false/null rows. The real column's false default was verified read-only. Kyle accepted the correction. Partner review and live integration verification remain pending. See CORRECTION_REVIEW.md.

### ST-03: Failed transaction retrieval can look like a true zero balance

- **Location:** lines 34-46, especially the transaction error log and `data || []` fallback.
- **Evidence from reading:** Read errors are logged to the console; transaction data defaults to an empty array. The rendered dashboard has no separate error state for unavailable financial data.
- **Impact:** The user may interpret zero totals as genuine financial data when retrieval actually failed.
- **Proposed severity / priority:** Medium / P2, pending agreement on expected error feedback.
- **Recommendation:** Track read failures separately and display an unavailable/retry message. Preserve the distinction between a successful empty response and an error.
- **Related investigation:** Bashir's BB-18 / SV-03; let Bashir decide whether to create another defect report.
- **Confirmation design:** Compare a successful empty transaction response with an error response and check that the UI distinguishes them after correction.
- **Final status for this review:** Open by Kyle's explicit decision. No correction applied; visible-error requirement needs team agreement. A passing characterization test of the current fallback does not close this finding.

### ST-04: Savings progress has no guard for a zero target

- **Location:** lines 331-346.
- **Evidence from reading:** Progress divides `current_amount` by `target_amount`. If both are zero, JavaScript produces NaN, which is not fixed by `Math.min(..., 100)`.
- **Impact:** If a zero target is allowed, the progress text/width can be invalid. Negative amounts also need a defined policy if supported.
- **Proposed severity / priority:** Medium / P2 if reachable with supported data; otherwise a robustness recommendation.
- **Recommendation:** The inspected table definition has `target_amount numeric(10, 2) not null` and no positive-target check. Inspect any separate triggers/write-path rules; require a positive target or define explicit handling for invalid targets before division.
- **Confirmation design:** If supported, test zero and negative targets, and preserve below/at/above-positive-target cases.
- **Final status for this review:** Left open by Kyle; source-review candidate strengthened by the absence of a positive-target check in the displayed table definition. No live insert, trigger review, or runtime invalid-target reproduction was performed. No correction applied.

## Automated static analysis

Run from `frontend/`:

```sh
npm run lint
```

The existing script runs `eslint .`. Its configured rule sets include recommended JavaScript, React Hooks, and React Refresh rules. The automated evidence records the exact command, tool versions, exit code, and output. A clean lint run does not prove that the application has no logical defects; ST-01 and ST-02 concern behavior that these rules do not establish.

A separate production build is a build check, not a substitute for static review or test execution.

### Recorded results

| Check | Result | Evidence |
| --- | --- | --- |
| ESLint before setup | Exit 0; no findings | [lint-before.txt](evidence/lint-before.txt) |
| ESLint after setup | Exit 0; no findings | [lint-after.txt](evidence/lint-after.txt) |
| Production build | Exit 0; Vite build successful | [build.txt](evidence/build.txt) |
| Supplementary dependency audit | 11 package findings: 7 high, 4 moderate | [dependency-audit.json](evidence/dependency-audit.json) |

The audit concerns package advisories, not eleven proven exploitable defects in App.jsx. The listed top-level package versions match those in the original lockfile. Remediation was not applied as part of this testing setup. Status: open for separate dependency review; assess applicable advisories, update compatible packages, and rerun lint/build/tests after any change. This does not replace the required source review.

## Kyle's guided review record

- Review date: **November 24, 2026**. Method: **guided, AI-assisted source comparison**.
- Original and corrected completion logic, classification, loading/error fallback, calculations, rendering and savings progress were covered in the walkthrough. The scope and exact confirmation are in [REVIEW_DECISIONS.md](REVIEW_DECISIONS.md).
- ST-01 / CQ-D001: **Fix accepted.** Save reward and completion together; preserve consistent state and prevent repeated rewards.
- ST-02 / CQ-D002: **Fix accepted.** Require a true completion flag; retain false/null rows as available and reuse them when completing.
- ST-03: **Leave open**, as Kyle requested. No error-display correction is claimed.
- ST-04: **Leave open**, as Kyle requested. No invalid-target correction is claimed.
- Original XP explanation: **Retained unchanged**, at Kyle's request.
- Automated checks: **Executed by Codex**; recorded results are 37 component and 18 local SQL cases passing, clean lint and successful build. No student command rerun is claimed.
- PR status and commits: see [GITHUB_HANDOFF.md](GITHUB_HANDOFF.md). Partner review, live deployment and integration verification remain separate.

### Kyle's selected CQ-D001 explanation

This wording was drafted with AI assistance and explicitly selected by Kyle for the report/presentation:

> The app saved the extra 10 XP to the simulated database first, increasing it from 90 to 100. When saving the quest-completion record failed, the function stopped without undoing that XP update. The screen stayed at 90 because the code only updates the displayed XP after both saves succeed.

### CQ-D002 explanation discussed

The code treats a matching user/quest record as completion without checking the completed flag. The supplied demonstration showed both a missing Complete Quest button and a completed quest card for completed=false. This is one failed test with two failed assertions. The separate XP test was filtered out in that run. A later read-only schema review confirmed that the real column defaults to false; live integration reproduction remains unverified.

See [the guided review notes](REVIEW_SESSION.md) and [the saved demonstration transcript](evidence/demonstrations/incomplete-quest-run.txt).

## Links

- [Source baseline](https://github.com/ching202/CoinQuest/blob/ae78c7005733e36c0e08c5d921938a7873c3181a/frontend/src/App.jsx)
- [Bashir's PR and defect documentation](https://github.com/ching202/CoinQuest/pull/9)
- [ESLint rule configuration](../../frontend/eslint.config.js)
- [Restored database schema evidence](SCHEMA_REVIEW.md)
