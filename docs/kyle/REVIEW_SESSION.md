# Guided review: original demonstrations

**Current update:** These notes preserve the original red-test demonstrations. The local corrections now pass 37 component and 18 SQL cases; see [CORRECTION_REVIEW.md](CORRECTION_REVIEW.md) and [WHITE_BOX_TESTING.md](WHITE_BOX_TESTING.md). No live deployment has occurred.

Date: November 24, 2026. This records AI-assisted explanation and demonstration; it does not certify an independent manual review or live database integration.

**Later schema update:** The restored Supabase dashboard was inspected read-only. The completed column defaults to false, and no positive savings-target check appears in the displayed definition. See [SCHEMA_REVIEW.md](SCHEMA_REVIEW.md); historical schema qualifications below describe what was known at the time of the demonstrations.

## What was demonstrated

| Demonstration | Actual result | Scope |
| --- | --- | --- |
| WB-04 financial calculations | 1 pass; 27 filtered/skipped | Real App component, synthetic transactions |
| CQ-D001 / WB-D01 partial XP update | 1 fail; 1 filtered/skipped | Expected stored XP 90; received 100 after simulated insert failure; screen remains 90 |
| CQ-D002 / WB-D02 incomplete quest | 1 fail with two failed assertions; 1 filtered/skipped | Button missing and completed card present for completed=false |

The filtered demo runs are separate from the full suite. They do not change its recorded totals of 28 pass, 2 fail, 0 skipped. At that point the application source had not changed; the later local corrections are documented separately.

Evidence: [passing run](evidence/demonstrations/passing-run.txt), [XP failure](evidence/demonstrations/defect-run.txt), [incomplete-quest failure](evidence/demonstrations/incomplete-quest-run.txt). Their matching JSON reports are saved in the same folder.

Kyle explicitly selected the CQ-D001 explanation recorded in STATIC_TESTING.md. Kyle also supplied the CQ-D002 transcript and asked whether the explanation matched it. The assistant confirmed that it did while retaining the schema qualification. This does not establish that Kyle independently executed the commands, approved all findings, or completed a full-file manual review.

## How to read coverage

The saved [original HTML report](evidence/before-fixes/coverage/index.html) comes from the full 30-case run. Click App.jsx to inspect annotated source. Statement/line highlights show code that did or did not execute; branch markers identify unexercised alternatives.

| Scope | Executed statements | Executed branches |
| --- | --- | --- |
| App.jsx | 89/92 = 96.73% | 59/64 = 92.18% |
| All included application source | 89/96 = 92.70% | 59/68 = 86.76% |

These are execution measurements, not a percentage of correctness, requirements satisfied, or bugs found. The two failed checks demonstrate that executed code can still violate an expectation.

The whole-source numbers include main.jsx and supabase.js. The tests mount App directly, so they do not run the browser entry point. They replace Supabase with a service mock, so they do not run the real client initialization or confirm database connectivity.

### Remaining App.jsx paths

| Location | What was not exercised | What to investigate next |
| --- | --- | --- |
| Lines 58-66 | The duplicate-check callback conditions and already-completed early return | The normal UI hides completed quests' buttons. Review repeated requests and duplicate protection deliberately; this report does not establish concurrency safety. |
| Line 111 | The fallback to [] when a successful insert has no returned rows | Determine whether that response is supported, then specify expected state and add a case if relevant. |
| Lines 119-124 | The completion-filter fallback when there is no current profile but completion records exist | Agree on behavior for that inconsistent/missing-profile state before adding a requirement check. |

The objective is useful behavior coverage, not changing the source or adding artificial cases solely to reach 100%.

Suggested explanation for Kyle to review (not yet selected):

> Our tests executed most of App.jsx, including the main calculations and success and error paths. Coverage shows how much code ran, but our assertions still found two problems. We also documented the paths and real database behavior that these tests did not cover.

## Finish the remaining static review

### ST-03: a failed read can look like a true zero balance

At lines 34-46, the app logs a read error to the console and uses an empty array when transaction data is absent. The totals for an empty array are zero. Consequently, unavailable data and a genuine empty transaction list can produce the same financial display.

Recommendation for team review: track the failure separately and show a visible unavailable/retry state. The existing WB-14 characterization confirms the current fallback; its passing result does not approve that behavior or close ST-03. Kyle subsequently chose to keep ST-03 open; no error-display correction is claimed.

### ST-04: zero savings target

At lines 331-346, the app divides current_amount by target_amount. If both are zero, the calculation is 0/0, which is NaN; capping with Math.min does not turn NaN into a valid percentage.

The later schema inspection found no positive-target check in the displayed table definition. Recommendation for team review: inspect any separate triggers/write-path rules and define invalid-target handling. This remains a source-review candidate, not a live reproduction. No additional runtime case or correction is claimed here.

## Updated completion status

- Static report and lint evidence: prepared; guided source comparison and Kyle's acceptance/open-finding decisions recorded in REVIEW_DECISIONS.md.
- Automated setup, results, and coverage: original two failures preserved; corrected local suite has 37 passing component cases and 18 passing SQL cases.
- Defect verification: local corrections and confirmation complete; live inspection, deployment, integration verification and final team acceptance pending.
- AI use: four actual activities and real prompts are recorded, together with Kyle's explicit acceptance of both fixes and decision to leave ST-03/ST-04 open. The assignment does not require separate chats.
- Repository: see GITHUB_HANDOFF.md for publication status. No merge or live database deployment is claimed.

Relevant table definitions were inspected earlier. The subsequent dashboard connection failed. Before deploying the prepared local corrections, inspect separate indexes, triggers, functions, and access rules for the chosen write strategy. Presentation work remains a later shared task.

## Later guided review decision

After comparing the saved explanations with the original and corrected App.jsx, Kyle accepted both fixes and agreed to leave ST-03/ST-04 open. See [REVIEW_DECISIONS.md](REVIEW_DECISIONS.md). Earlier passages describe the state at the time of the original demonstrations.
