# Local correction review: CQ-D001 and CQ-D002

Prepared November 24, 2026 by Codex with Kyle's continuing instructions. Status: implemented and tested locally; accepted by Kyle after guided review; partner review, live database inspection, deployment and integration verification pending. Bashir retains ownership/credit for defect documentation. See [GITHUB_HANDOFF.md](GITHUB_HANDOFF.md) for current GitHub publication status.

## Correction and reasoning

App.jsx now checks completed === true for both classification and duplicate detection. False and null rows remain available, consistent with the observed nullable false-default column. The database function updates an existing row instead of adding another.

The client now sends only profile and quest IDs to complete_quest. SQL locks the profile row, reads stored XP and the stored quest reward, checks for an existing true completion, then saves XP and completion in the same transaction. It returns authoritative XP, level, completion and awarded XP. A repeated successful request returns the existing completion with zero reward.

A unique index prevents duplicate user/quest pairs. The migration fails if existing duplicates or same-named objects prevent installation; it does not remove data or replace unknown functions. The profile lock serializes calls through this function for one user, including different quests. Concurrent live connections have not been tested, and legacy/direct writers are outside that guarantee.

React prevents overlapping completion actions in one screen, displays an error on failure, and allows retry. It does not fall back to the unsafe two-write path. A lost response can occur after a commit, so the message says completion could not be confirmed rather than promising no save occurred.

See the [SQL migration](../../supabase/migrations/202611240001_complete_quest.sql), [component](../../frontend/src/App.jsx), [component tests](../../frontend/src/App.defects.test.jsx), and [SQL tests](../../frontend/database/complete-quest.test.js).

## Verification

- Original full suite: 28 passed, 2 failed. Preserved in evidence/before-fixes with source/tests/coverage.
- Corrected full component suite: 37 passed, 0 failed, 0 skipped.
- Local SQL suite: 18 passed, 0 failed, 0 skipped.
- SQL-D01 verifies an injected failure occurs after XP becomes 100, then asserts persisted XP is 90 and no completion remains.
- SQL-D02 verifies both false and null rows can complete while retaining the same ID.
- SQL-03 checks retry without a second reward. SQL-10 rejects duplicate legacy rows without deleting them.
- ESLint and production build exit 0.
- App.jsx coverage: 97.97% statements, 98.64% branches. See [full report](WHITE_BOX_TESTING.md).

The actual SQL runs in PGlite with captured user_quests DDL and minimal profiles/quests fixtures. These results do not verify live Supabase behavior or multi-connection concurrency.

## Live preflight still required

The dashboard showed ERR_SSL_PROTOCOL_ERROR when attempting to inspect functions. No SQL was executed against Supabase.

When reachable, inspect:

1. Full profiles/quests definitions, existing completion functions, user triggers and indexes, and the actual application's privileges.
2. Duplicate non-null user/quest pairs. The new unique index deliberately rejects those; agree on resolution rather than deleting records automatically.
3. Existing objects named complete_quest(uuid,uuid) or user_quests_user_quest_unique. CREATE deliberately fails instead of overwriting one.
4. Whether existing RLS/policies and grants allow the current app role to select/lock/update the profile, read the quest, and insert/update/read its completion.
5. Whether another app/client continues to use the old two-write completion path.

Read-only diagnostics are provided in [preflight.sql](../../supabase/preflight.sql); results may include row identifiers and should stay within the project.

The function uses SECURITY INVOKER and a fixed empty search_path. It adds no grants and changes no RLS settings. Default function execution privileges are determined by the existing database configuration. It requires existing table access; it does not add ownership checks to an app that currently uses profiles[0] and tables displayed as unrestricted. Authentication/access redesign is outside this correction.

## Deployment sequence for later review

1. Complete the inspection above and agree with the team on schema/behavior.
2. Apply the reviewed migration as one transaction before releasing the corrected frontend. Existing rows and historical XP are not recalculated.
3. Confirm the RPC is available to the actual app role, then deploy the corresponding frontend.
4. With agreed synthetic/test records, verify success, incomplete-row completion, retry, forced failure in a test environment, and competing requests. Do not inject failure triggers into the shared live project casually.
5. Attach real results to Bashir's reports before marking them verified/closed.

Kyle accepted both fixes and chose to leave ST-03/ST-04 open; see [REVIEW_DECISIONS.md](REVIEW_DECISIONS.md). The files are ready for partner review. Live deployment is a separate action and is not claimed completed.

## Sources used in the implementation

- [Supabase database functions](https://supabase.com/docs/guides/database/functions): function calls, invoker rights, exception behavior.
- [Supabase JavaScript RPC](https://supabase.com/docs/reference/javascript/rpc): passing named arguments and receiving data/errors.
- [PostgreSQL SELECT](https://www.postgresql.org/docs/current/sql-select.html): row-locking clauses.
- [PGlite getting started](https://pglite.dev/docs/) and [API](https://pglite.dev/docs/api): in-memory SQL execution; single-connection limitation.

These references informed the design. Saved test outputs establish the local results.
