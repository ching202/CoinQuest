# Kyle's static and white-box testing walkthrough

Updated November 24, 2026. The branch tests/kyle-static-whitebox contains two proposed corrections, tests, and evidence. See [GITHUB_HANDOFF.md](GITHUB_HANDOFF.md) for publication status. No changes have been deployed to Supabase; Bashir's source files are unchanged.

## What changed

The original App made two independent saves: first XP, then quest completion. If the second failed, stored XP could stay at 100 while the screen showed 90. It also treated every matching user_quests row as completed, ignoring its completed flag.

The corrected App calls one database function for completion. That function saves both changes in a transaction, reads the reward and XP from the database, and avoids a second reward on a retry. React displays the returned values. A false or null completed flag leaves the quest available; completing it reuses that row. See [correction and deployment notes](CORRECTION_REVIEW.md).

**Deployment dependency:** The corrected frontend requires the new SQL function. Local tests pass, but the live app will show a completion error until the migration is reviewed and installed. The Supabase dashboard failed with ERR_SSL_PROTOCOL_ERROR during additional inspection. Existing functions, triggers, indexes, and actual caller privileges still need inspection before deployment.

## Walk through the evidence

1. Read [STATIC_TESTING.md](STATIC_TESTING.md) beside [the archived original App](evidence/before-fixes/App.jsx). Its line references describe the original source.
2. Review [the original full run](evidence/before-fixes/test-run.txt): **28 passed, 2 failed**. Your selected explanation remains in the static-review notes.
3. Read the new [completeQuest code](../../frontend/src/App.jsx) and [SQL function](../../supabase/migrations/202611240001_complete_quest.sql). Follow the failure from the completion write back to the transaction rollback.
4. Read [the current full component run](evidence/test-run.txt): **37 passed, 0 failed**. CQ-D002 now checks both the available state and successful completion of an existing false row.
5. Read [the local SQL run](evidence/database-tests.txt): **18 passed, 0 failed**. SQL-D01 rejects completion after XP has been updated, then checks that the database restored XP to 90.
6. Open [current coverage](evidence/coverage/index.html). App.jsx has **97.97% statement coverage and 98.64% branch coverage**. Coverage measures execution, not correctness.

The React tests use a simulated service. The SQL tests execute the actual migration in local PGlite with synthetic rows. Neither is a live Supabase integration test. [WHITE_BOX_TESTING.md](WHITE_BOX_TESTING.md) explains cases and limits.

## Run it yourself

Use Node 24.22.3 or a version permitted by package.json. From frontend:

~~~sh
npm ci
npm run lint
npm run test:coverage
npm run test:database
npm run build
~~~

The assistant used pnpm dlx npm@11.19.1 for installation because npm was absent from PATH. That wrapper is unnecessary where npm works normally.

For focused confirmation:

~~~sh
npm run test:defects
node --test --test-name-pattern=SQL-D01 database/complete-quest.test.js
~~~

The test:baseline script retains its earlier name for the 28 ordinary/characterization cases in App.test.jsx; it runs the **current corrected source**, not the archived original. The red results are under evidence/before-fixes. Current subset outputs are overwritten when their commands run. The full test and coverage command write evidence/test-results.json.

## What to finish with Bashir

- Personally review the original findings and local corrections, and record actual accept/revise/reject decisions in [AI_TESTING_LOG.md](AI_TESTING_LOG.md). The assistant has not signed your manual-review checklist.
- Give Bashir the before/after evidence for CQ-D001 and CQ-D002. Suggested status: **locally corrected and retested; live integration verification pending**. Bashir owns the final defect records.
- Once the dashboard is reachable, complete the database preflight, agree on deployment, and test the real app with controlled data. Do not deploy only the frontend or silently repair historical XP.
- Review ST-03 (read errors displayed as empty data) and ST-04 (zero savings target). Those findings remain open.
- Four actual AI-supported activities are now documented with their real prompts. Finish your technical review decisions; separate chats are not required.
- Review the draft PR with Bashir before treating it as ready. Presentation remains a later joint step.

Kyle's latest review answers are recorded: he has not yet read the code and still needs to review the fixes. Start with [MANUAL_REVIEW_GUIDE.md](MANUAL_REVIEW_GUIDE.md). The [contribution summary](CONTRIBUTION_SUMMARY.md) and [Bashir handoff](BASHIR_HANDOFF.md) distinguish completed technical work from remaining student/team work.

## Applying the package

The ZIP includes source, SQL proposal, tests, and reports, without node_modules, dist, or Git metadata. The patch is based on main commit ae78c7005733e36c0e08c5d921938a7873c3181a; it includes local app corrections as well as testing work. Review it on a clean branch and run git apply --check before applying. It does not modify Bashir's documentation.
