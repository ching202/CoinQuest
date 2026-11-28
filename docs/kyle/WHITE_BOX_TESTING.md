# White-box testing and confirmation results

Owner: Kyle Kitching. Date: November 24, 2026. Preparation/execution: AI-assisted. Kyle has accepted the two corrections after the guided source/evidence comparison; no personal command rerun is claimed. See REVIEW_DECISIONS.md.

## Baseline and corrected source

The original main commit was ae78c7005733e36c0e08c5d921938a7873c3181a. Its App.jsx SHA-256 was ec2f40cf4e5b93c3aef148616888c4b37a9fa22adee3892d92ee164d2f2efd5c. Original source, tests, mock, full results, and coverage are preserved in [evidence/before-fixes](evidence/before-fixes). The [original report](evidence/before-fixes/WHITE_BOX_TESTING.txt) records baseline test inputs and counts.

Corrected App.jsx SHA-256: 29460de0075467c06ef6316af0cbbb2a798ff6edce293815785afac10c17942a.

After local correction: **37 component cases pass, 18 SQL cases pass, no failures or skipped cases in either full run**. ESLint and the Vite production build exit 0. The migration has not been applied to Supabase. These results support local correction, not live closure of Bashir's defect reports.

## Design and tools

Component cases render the real App.jsx using React Testing Library and jsdom, replacing only Supabase's boundary with a controlled service. Design follows source decisions, early returns, and collection iteration. Tests inspect visible results and service calls. A fetch guard prevents unexpected real requests.

Versions: Node 24.22.3, Vitest/V8 coverage 5.1.1, React Testing Library 16.3.3, jsdom 31.0.1, PGlite 0.6.0. Versions are locked. PGlite executes the actual SQL migration with synthetic data in memory. user_quests and savings_goals use captured read-only DDL; profiles and quests use a minimal fixture based on observed column names/types. Live triggers, grants and full table definitions are not replicated.

## Component cases

| IDs | Source-based purpose and independent expectation | Cases |
| --- | --- | ---: |
| WB-01 | Loading remains until reads resolve, then dashboard appears | 1 |
| WB-02 to WB-05 | Zero/one/multiple transaction iterations; numeric strings; zero-income division guard. Multiple case expects income 1050, expenses 250, net 800, rate 76% | 4 |
| WB-06 | Strict health thresholds: net 100/101/250/251 gives 75/90/90/100 | 4 |
| WB-07 | Render server XP 99/100/101 and levels 1/2/2 after one-XP quest; other profile unchanged; one RPC and one completion | 3 |
| WB-08 | RPC error leaves displayed XP unchanged, shows an error, and produces no success alert | 1 |
| WB-09 | No-profile early return makes no writes | 1 |
| WB-10 | Only current profile's true completions hide available quests | 1 |
| WB-11 / WB-12 | Achievement below/equal/above threshold and absent profile | 4 |
| WB-13 | Savings progress 99/100/101 against target 100 gives 99%/100%/100% | 3 |
| WB-14 | Six read errors exercise existing logging/fallback. Characterization, not acceptance of ST-03 | 6 |
| CQ-D001 / WB-D01 | Failed atomic RPC: one call, no separate client writes, screen stays 90, error visible. SQL-D01 checks actual rollback | 1 |
| CQ-D002 / WB-D02 | False completion stays available; click completes it, shows XP 100, and reuses original row | 1 |
| WB-15 | Pending operation disables clicks; double-click produces one RPC | 1 |
| WB-16 | Retry clears error and uses server values (215 XP, level 3, reward 20), not stale local values | 1 |
| WB-17 | Completion saved by another session reconciles screen without a second reward | 1 |
| WB-18 | Missing result/completion gives visible error and allows retry | 2 |
| WB-19 | Null flag stays available; completing it preserves unrelated rows/cards | 1 |
| WB-20 | No current profile means another user's completion is not classified as current | 1 |
| Total | All pass | **37** |

WB-07 verifies the client/server contract. The level calculation moved from App into SQL; SQL-05 independently checks its boundary values. The service stub is not proof of transaction guarantees.

The original defect cases were ordinary failing assertions. CQ-D001 now targets RPC failure because the service boundary changed, while its consistency requirement is unchanged. No failure was hidden with skip, expected-failure configuration, or changing expected XP to 100. CQ-D002 retains the initial availability assertions and adds successful completion checks.

## SQL cases

| IDs | Expected behavior | Cases |
| --- | --- | ---: |
| SQL-01 | Saves XP 100, level 2, timestamp and one record; other profile unchanged | 1 |
| SQL-D01 | Trigger sees updated XP 100, raises error on completion; transaction restores XP 90 and no completion | 1 |
| SQL-D02 | Existing false/null completion becomes true using same row | 2 |
| SQL-02 | Failed completion preserves an existing false row and XP 90 | 1 |
| SQL-03 | Retry returns already_completed and zero reward; one completion, XP 100 | 1 |
| SQL-04 | Two different quests accumulate to XP 105 | 1 |
| SQL-05 | XP 98/99/100 plus one produces 99/100/101 at levels 1/2/2 | 3 |
| SQL-06 | Missing profile/quest and null profile/quest IDs reject without writes | 4 |
| SQL-07 | Negative reward rejects without writes | 1 |
| SQL-08 | Unique index rejects duplicate profile/quest rows | 1 |
| SQL-09 | Invoker rights and fixed empty search_path | 1 |
| SQL-10 | Migration rejects existing duplicates without deleting them or leaving a function installed | 1 |
| Total | All pass | **18** |

## Coverage, branches, and iteration

| Scope | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: |
| Original App | 96.73% (89/92) | 92.18% (59/64) | 96% (24/25) | 96.29% (78/81) |
| Corrected App | 97.97% (97/99) | 98.64% (73/74) | 100% (26/26) | 97.70% (85/87) |
| Corrected whole source | 94.17% (97/103) | 93.58% (73/78) | 100% (26/26) | 93.40% (85/91) |

App has no explicit for/while loops. WB-02/03/04 cover zero/one/multiple array iterations. WB-07 covers matching/nonmatching profiles in map; WB-19 covers retaining/removing completion rows. There is no separate loop-coverage percentage.

The unexecuted App path is the defensive already-completed alert/return at lines 69-70. The UI removes that quest's button; tests do not reach the branch by manipulating internals. Server idempotency is tested separately. main.jsx and real supabase.js initialization remain unexecuted because tests mount App directly with a mock. SQL is not included in V8 percentages; no SQL branch-coverage percentage is claimed.

## Evidence and commands

From frontend, run npm run lint, npm run test:coverage, npm run test:database, and npm run build. The assistant used direct Node entry points for checks and pnpm dlx npm@11.19.1 for installation. test:baseline selects App.test.jsx against current source; it does not restore the original App.

- [Current component output](evidence/test-run.txt) and [JSON](evidence/test-results.json)
- [Current HTML coverage](evidence/coverage/index.html), [summary](evidence/coverage/coverage-summary.json), and [LCOV](evidence/coverage/lcov.info)
- [SQL output](evidence/database-tests.txt)
- [Lint](evidence/lint-after-fixes.txt) and [build](evidence/build-after-fixes.txt)
- [Original failures](evidence/before-fixes/test-run.txt) and [coverage](evidence/before-fixes/coverage/index.html)
- [Correction review and live preflight](CORRECTION_REVIEW.md)

## Limits and remaining work

PGlite has one connection, so this run does not test competing live transactions. Row locks and a unique index are designed to serialize completions through this function, but live concurrency, PostgREST, RLS/grants, authentication/ownership, external writers, and network loss require integration verification. The app still chooses profiles[0]; this correction does not add authentication or fix user ordering.

A lost response may occur after a successful commit. The UI therefore says it could not confirm completion, and retry asks for the saved result without another reward. The tests establish local idempotency, not real network behavior.

ST-03 and ST-04 remain open. Green tests and coverage do not close untested requirements. Kyle's guided review and decisions are recorded. Bashir's review/defect updates, live verification and the shared presentation remain separate work.
