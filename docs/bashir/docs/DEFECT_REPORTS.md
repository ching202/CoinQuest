# CoinQuest — My Defect Reports

**Author:** Bashir Abdulkadir  
**Status note:** These reports are based on source review and AI-executed diagnostic checks. They are not presented as defects reproduced by me in a browser or against Kyle's live database. I will review the expected behavior and schema with Kyle before final triage.

## My severity and priority rules

Severity describes impact: High means major functional/data inconsistency, Medium means a limited functional error, and Low means minor presentation impact. Priority describes repair urgency: P1 before final acceptance, P2 next available repair slot, and P3 lower urgency. The assignments below are proposed for team review.

## CQ-D001 — XP update can succeed when quest completion is not recorded

| Required field | My report |
| --- | --- |
| Defect ID/title | CQ-D001 — XP update can succeed when quest completion is not recorded. |
| Related test/review | BB-17; source review of completeQuest; diagnostic SV-02. |
| Environment | Original frontend/src/App.jsx from supplied archive; Linux, Node v24.22.3; simulated hooks and Supabase-compatible response stub. No browser or real Supabase calls. Source hash is in source_verification.json. |
| Code location | frontend/src/App.jsx lines 69–99: profile update at 72–78, completion insert at 85–94, return on insert error at 96–99. |
| Expected result | My proposed consistency requirement is that a failed quest completion must not leave a permanent XP reward without a corresponding completion record. Kyle and I must agree on the recovery policy. |
| Actual result | With initial XP 90 and reward 10, the profile update stores XP 100 and level 2 in the stub. The forced user_quests insert failure leaves zero completion rows. The component's profile state still holds XP 90. |
| Severity | High — the workflow can leave reward and completion state inconsistent. Actual database impact remains to be confirmed. |
| Priority | P1 proposed — resolve or explicitly assess before accepting quest completion as reliable. |
| Status | Open — reproduced in simulated source execution; integration confirmation pending; no correction applied. |

### My reproduction steps

1. I prepare a synthetic profile p1 with XP 90 and level 1, a quest q1 with reward 10, and no completed record.
2. I allow the profiles update to succeed and configure only the user_quests insert to return an error.
3. I invoke the original completeQuest workflow through the diagnostic runner.
4. I compare the stored profile, completion rows, and component state.
5. I observe stored XP 100, level 2, zero completion rows, and component-state XP 90 in SV-02.

To reproduce the preserved diagnostic, I run `node evidence/verify_source.cjs /path/to/CoinQuest-main/frontend/src/App.jsx` from the package root. The script reports observations; it is not an assertion-based browser test. I will have Kyle repeat the failure safely using the real test service and inspect state after reloading.

### My recommended correction and retest

I recommend that Kyle evaluate a database transaction/RPC that records completion and updates XP atomically, with duplicate protection. Simply reordering the two client writes can create the opposite partial-write problem. The final implementation depends on the actual schema and policies.

I will force the second operation to fail again and confirm that no incomplete reward remains, then test one successful completion and a repeated attempt. **Correction commit:** none. **Confirmation result:** Not Run. **Final disposition:** Open.

## CQ-D002 — A user-quest record marked incomplete is treated as completed

| Required field | My report |
| --- | --- |
| Defect ID/title | CQ-D002 — A user-quest record marked incomplete is treated as completed. |
| Related test/review | BB-16; source review of completion classification/duplicate check; diagnostic SV-01. |
| Environment | Same isolated source-diagnostic environment as CQ-D001. Synthetic user_quests data includes completed=false. Whether Kyle's schema permits this state needs confirmation. |
| Code location | frontend/src/App.jsx lines 119–125 classify matching rows without checking completed; lines 58–62 use the same ID-only logic for duplicate prevention. |
| Expected result | If completed=false means an incomplete quest, I expect it to remain available and not appear in Completed Quests. This expectation is conditional on Kyle confirming the field semantics and allowed data state. |
| Actual result | For p1/q1 with completed=false, SV-01 reports zero available quests and one completed quest. Source review also shows that the duplicate check ignores completed. |
| Severity | Medium proposed — an incomplete quest may be unavailable to finish and be displayed incorrectly. |
| Priority | P2 proposed — confirm schema semantics, then repair if incomplete rows are supported. |
| Status | Open — source behavior reproduced with synthetic data; requirement/schema validation and integration reproduction pending. No correction applied. |

### My reproduction steps

1. I prepare profile p1 and quest q1.
2. I supply a matching user_quests row containing user_id p1, quest_id q1, and completed=false.
3. I execute the original filtering logic through the diagnostic runner.
4. I inspect availableQuests and completedQuests.
5. I observe available count 0 and completed count 1 in SV-01.

### My recommended correction and retest

If incomplete rows are valid, I recommend checking the completed flag when deriving completed quests and preventing duplicates. Kyle must decide whether completing an existing incomplete row should update it rather than insert another row, because database uniqueness rules may matter. If the schema intentionally allows only completed rows and enforces that rule, I will document this as an unsupported-data robustness finding instead of a confirmed normal-use defect.

I will compare true, false, and absent completion records for the same user, check a different user's record, and complete a legitimate available quest. **Correction commit:** none. **Confirmation result:** Not Run. **Final disposition:** Open pending team triage.

## My defect summary

| ID | Diagnostic observation | Integration reproduction | Fix/retest |
| --- | --- | --- | --- |
| CQ-D001 | Reproduced with forced insert failure | Pending | No fix; retest Not Run |
| CQ-D002 | Reproduced with completed=false fixture | Pending; allowed state must be confirmed | No fix; retest Not Run |

I have not closed either report. I will preserve the original evidence and add actual environment details, correction commits, and confirmation results as the team completes the work.
