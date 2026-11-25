# AI-assisted testing record

Date: November 24, 2026. Tool: Codex. Student: Kyle Kitching (ching202).

This records four actual activities in the same conversation. Separate chats are not required by the assignment. AI-01 and AI-02 share the actual initiating request; the distinct follow-up prompts below are preserved without inventing prompts after the fact. The assistant wrote code/documents and ran the checks. Kyle requested demonstrations, supplied their output, and selected an explanation.

**Current human review status:** After the guided App.jsx comparison, Kyle accepted both fixes and explicitly retained ST-03/ST-04 as open. His exact confirmation and scope are recorded in [REVIEW_DECISIONS.md](REVIEW_DECISIONS.md). Earlier pending-review answers are historical; command execution remains attributed to Codex.

The earlier chronological record is preserved in [AI-session-history.txt](evidence/AI-session-history.txt).

## AI-01 — Static source review

### Complete initiating prompt

> Okay let's start on my portion. Help me do the static testing for App.jsx first, then set up the automated tests. Walk me through it so I understand what we're doing.

### Activity and context

Manual-style source inspection and automated static analysis of the existing App.jsx, based on main commit ae78c7005733e36c0e08c5d921938a7873c3181a. Context included the assignment, agreed roles, Bashir's PR #9, the original App.jsx and configuration, and the requirement to explain the work.

### Response and how it was used

The assistant traced loading, completion writes, quest classification, financial calculations and rendering; drafted ST-01 to ST-04 in [STATIC_TESTING.md](STATIC_TESTING.md); and ran ESLint. Clean lint output did not remove the two logic findings. The source review guided defect reproductions and later corrections.

### Review decisions and verification

- Kyle's decision after the guided comparison: **accept the ST-01/ST-02 fixes; leave ST-03/ST-04 open**. The accepted rationale is preserving reward/completion consistency and distinguishing incomplete records from true completions.
- Assistant revision based on later evidence: changed the incomplete-row finding from a schema assumption to schema-supported after observing completed boolean null default false. Live integration remains unverified.
- Assistant rejected treating clean lint as proof of correct behavior.
- Verification: saved lint outputs, original source and failing component tests. These are assistant-executed checks; Kyle's later guided source-review decisions are documented separately.

## AI-02 — White-box test design and automated demonstrations

### Complete initiating prompt

> Okay let's start on my portion. Help me do the static testing for App.jsx first, then set up the automated tests. Walk me through it so I understand what we're doing.

### Complete focused follow-up prompt

> Can you do the test and I watch, then explain in my own words after?

### Activity and context

Automated tests selected from App.jsx's internal branches and collection operations. The preceding work supplied the real component, dependency/configuration files, static findings, synthetic profile p1 at XP 90, quest q1 rewarding 10 XP, and the distinction between simulated-service checks and real Supabase integration.

### Response and how it was used

The assistant installed Vitest, React Testing Library and jsdom, wrote the service mock and test cases, and ran coverage. It demonstrated WB-04's independently expected net balance of 800 and rate of 76%, then the failing XP consistency case. Baseline: 28 pass / 2 fail. After local corrections and added regression cases: 37 pass. Actual SQL runs add 18 passing cases.

### Review decisions and verification

- Kyle requested visible demonstrations and supplied the output for discussion. He has not claimed personal command execution.
- Review use/disposition: Kyle requested the demonstrations, supplied output for discussion, and then accepted the two corrections supported by the discussed failure/confirmation evidence. No test-design revisions were requested. This records scoped review of the fixes and evidence, not independent execution of every test.
- Assistant decisions: test the real React component, keep expected values independent of the implementation, preserve ordinary failing assertions, and keep SQL rollback checks separate from the service stub.
- Verification: [original results](evidence/before-fixes/test-run.txt), [current results](evidence/test-run.txt), [SQL results](evidence/database-tests.txt), and [coverage](evidence/coverage/index.html).
- Limits: component tests use simulated data; SQL tests use a single local PGlite connection; neither is live Supabase verification.

## AI-03 — Explain a failing test using its evidence

### Complete prompt

> Please In your own words, why did the stored XP reach 100 while the screen stayed at 90? Two or three sentences are enough—I’ll help refine your explanation.
>
> Do this for me

The prompt included the pasted "COINQUEST: LIVE AUTOMATED TEST DEMONSTRATION" output, covering WB-04 and CQ-D001. Matching run evidence is preserved in [passing-run.txt](evidence/demonstrations/passing-run.txt) and [defect-run.txt](evidence/demonstrations/defect-run.txt).

### Activity and context

Interpretation of actual failure evidence: the original App saved profile XP first, then the completion insert failed. The service stored XP 100, the screen remained at 90, and the expectation that stored XP remain 90 failed.

### Response used

> The app saved the extra 10 XP to the simulated database first, increasing it from 90 to 100. When saving the quest-completion record failed, the function stopped without undoing that XP update. The screen stayed at 90 because the code only updates the displayed XP after both saves succeed.

### Review decision

Kyle repeated that explanation and requested: "remember this for my ow words explanation". This is an explicit selection of AI-drafted wording. The wording remains AI-drafted and selected by Kyle. The later guided source comparison confirmed it matches the original code, and Kyle separately accepted the repair. No revision/rejection of this wording was requested.

### Verification

The explanation matches the original code sequence and the failed assertion "expected 100 to be 90". The separate screen assertion passed at 90. It describes the original defect; it is not the corrected behavior or a claim about live stored data.

## AI-04 — Review correction behavior before deployment

### Complete prompt

> okay continue, walk me through the database changes before we apply them to Supabase

### Activity and context

Correction review and confirmation-test interpretation. Context included the prepared SQL migration, corrected App, captured user_quests definition, original failure, 37 passing component cases and 18 passing SQL cases. Existing live functions/triggers/indexes/privileges were still unverified.

### Response and how it was used

The assistant explained the unique user/quest index, invoker-rights function, profile row lock, reuse of incomplete rows, transaction rollback and repeat requests. It mapped success to XP 100 plus completion, failed completion to XP 90, and repeat success to no extra reward. It identified read-only preflight checks and the need to install the migration before the corrected frontend can complete live quests.

### Review decisions and verification

- Kyle initially said "I still need to review them". After the guided App.jsx comparison, he explicitly **accepted both fixes** and chose to keep ST-03/ST-04 open.
- Accepted rationale: the transaction preserves XP/completion consistency, and explicit true-flag checks prevent incomplete records from appearing completed. No revision or rejection of these fixes was requested.
- Assistant verification: SQL-D01 raises a completion error after the XP write and checks rollback; SQL-D02 tests false/null rows; SQL-03 tests repeat calls; SQL-10 checks duplicate-data migration failure.
- The Supabase connection failure prevented added live inspection; no live database change was made.
- Kyle subsequently directed work back to his testing deliverables and GitHub handoff. Deployment remains outside this handoff.

## Recorded review completion

Follow-up request:

> okay let's check the saved explanations against App.jsx and go over the fixes so I can finish my portion

The assistant compared original XP-save/error-return/UI-update locations, the corrected RPC and returned state, original/corrected completion filters, and the remaining loading/calculation/rendering/goal concerns. Kyle then replied:

> Okay, I accept both fixes and agree to leave ST-03 and ST-04 open. Update my review notes and the GitHub PR so we can finish my portion.

The review decisions are now recorded. The existing four AI-use entries preserve actual prompts, context, response use and verification. No fabricated rejection or personal command run is added. Partner review, live verification and the shared presentation remain separate work.
