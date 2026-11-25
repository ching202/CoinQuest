# Restored Supabase schema review

**Date:** November 24, 2026. **Project:** CoinQuest, `wkosszjasogusmogumcj`. **Method:** read-only inspection of the authenticated Supabase dashboard in Chrome, Table Editor > Definition. The project had finished restoration and its table definitions were accessible.

No SQL was executed. No test rows, schemas, permissions, or database settings were changed. The inspection supports schema conclusions; it is not a live reproduction of the application defects.

## Observed definitions

The complete displayed definitions are preserved in [schema-definitions.sql](evidence/schema-definitions.sql). This file is reference evidence, not a runnable migration.

| Table / field | Observed definition | What it establishes |
| --- | --- | --- |
| user_quests.completed | `boolean null default false` | False is explicitly the table default; null is also permitted by the column. |
| user_quests constraints | Primary key on id; foreign keys to quests and profiles | No completed=true check or unique user_id/quest_id pair is shown in this table definition. Separate index/trigger/policy inspection was not performed. |
| savings_goals.target_amount | `numeric(10, 2) not null` | A value is required; NOT NULL does not require a positive value. |
| savings_goals.current_amount | `numeric(10, 2) null default 0` | The default saved amount is zero; the column is nullable. |
| savings_goals constraints | Primary key and profile foreign key | No target_amount > 0 check appears in the displayed definition. |

## Effect on the testing findings

**CQ-D002 / ST-02:** Upgrade the evidence status from "synthetic behavior; schema assumption pending" to **schema-supported; reproduced in component tests; live integration reproduction pending**. The actual column defaults to false, so the component test is grounded in the real table definition. The frontend still ignores that flag. This does not establish that a particular normal user workflow currently creates incomplete rows, and it is not a successful correction/retest.

**ST-04:** The positive-target assumption is not enforced by a check in the displayed table definition. This strengthens the zero-target review concern. No insert was attempted, and no runtime zero-target test has been added in this session. Triggers, other write paths, and intended invalid-input behavior still need review before asserting what the live service accepts.

**CQ-D001 / ST-01:** The partial-write finding remains open. Reading these definitions does not establish an atomic completion operation or confirm transactional behavior. A correction needs to keep the reward and completion consistent and prevent duplicate rewards.

## Correction direction for team review

1. For CQ-D002, check `completed === true` consistently in classification and duplicate prevention. Decide how a legitimate incomplete row is completed so that a correction does not create duplicate rows.
2. For CQ-D001, inspect existing indexes, triggers, functions, and access rules before designing one atomic completion operation. Preserve the failing baseline evidence and verify success, failure, and repeated requests after correction.
3. For ST-04, agree on a positive-target rule or an explicit invalid-target display, then test zero as well as valid targets.

These were the recommendations at the time of schema inspection. Subsequent local corrections and SQL tests are in [CORRECTION_REVIEW.md](CORRECTION_REVIEW.md): 37 component and 18 SQL cases pass. The original 28 pass / 2 fail evidence is archived. No changes have been applied to the live database. The later attempt to inspect functions/triggers/indexes was blocked by ERR_SSL_PROTOCOL_ERROR. Earlier transcripts, screenshots, and test titles retain their original "schema assumption" wording as historical evidence from before this inspection.

## Source locations

- [user_quests definition in Supabase](https://supabase.com/dashboard/project/wkosszjasogusmogumcj/editor/17598?schema=public&view=definition)
- [savings_goals definition in Supabase](https://supabase.com/dashboard/project/wkosszjasogusmogumcj/editor/17574?schema=public&view=definition)

These account pages require project access. The saved SQL snapshot provides the relevant evidence without exposing any row data or credentials.
