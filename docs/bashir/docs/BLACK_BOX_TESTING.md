# CoinQuest — My Black-Box Testing

**Author:** Bashir Abdulkadir  
**Baseline:** Supplied CoinQuest-main.zip; see TEST_PLAN.md for source identity.

## My execution status

I designed the cases below around visible application behavior. Browser execution was blocked by HTTP 403 dependency downloads in the assistant workspace. Therefore all 18 cases currently have **Actual result: Not observed in a browser** and **Status: Blocked**. No black-box case is claimed as passed or failed.

The assistant executed four separate source diagnostics with simulated data. These are supporting investigations, not black-box execution, browser evidence, real Supabase integration tests, or the team's required automated test suite. Their exact observations are in ../evidence/source_verification.json.

## My requirements and setup

I will ask Kyle to confirm the provisional behavioral rules in TEST_PLAN.md before treating the expected results as authoritative. I will use a synthetic profile p1, quest q1, and reset fixtures before each independent case. Monetary inputs here are stored test records, not entries in an application form. Dates can be fixed ISO timestamps and all required database fields must match Kyle's schema. I will seed boundary XP values and matching initial levels directly through an approved test-data setup. I will record my OS, browser/version, actual repository commit, fixture IDs, execution date, and evidence for every run.

## 1. My equivalence partitions

| ID | Input/state group | Representative | Related case |
| --- | --- | --- | --- |
| EP-01 | Income exceeds expenses | 1000 income, 250 expense | BB-01 |
| EP-02 | Income equals expenses | 500 income, 500 expense | BB-02 |
| EP-03 | Expenses exceed positive income | 100 income, 150 expense | BB-03 |
| EP-04 | Income is zero | No income, 50 expense | BB-04 |
| EP-05 | Successful empty transaction data | Empty list | BB-05 |
| EP-06 | Completed quest record | completed=true | BB-15 |
| EP-07 | Incomplete quest record | completed=false | BB-16 |
| EP-08 | Data retrieval failure | Controlled transactions error | BB-18 |

I keep failed retrieval separate from a successful empty response because their meanings differ.

## 2. My boundary design

| ID | Boundary and assumed rule | Below | At | Above | Cases |
| --- | --- | --- | --- | --- | --- |
| BV-01 | First level increase at 100 total XP | 99 XP → level 1 | 100 XP → level 2 | 101 XP → level 2 | BB-06–08 |
| BV-02 | Achievement unlock at 100 XP | 99 → locked | 100 → unlocked | 101 → unlocked | BB-09–11 |
| BV-03 | Savings target $100 | $99 → 99% | $100 → 100% | $101 → capped 100% | BB-12–14 |

I use whole-dollar neighbors for the initial savings display cases because the percentage is displayed as a whole number. If Kyle requires cent-level monetary boundaries, I will add $99.99/$100.00/$100.01 with an agreed rounding rule rather than claim that the displayed integer distinguishes them.

## 3. My test cases

For every case I will start with the application running, the isolated service reachable, the case fixture loaded, and prior state reset. After preparing the fixture, I will reload the page and wait for loading to finish. I will attach the observed UI text and any relevant test-service state after execution.

### BB-01 — Positive balance

- **Technique:** Equivalence partitioning.
- **Test data:** Income 1000; expense 250.
- **Steps:** I load the prepared data and read the totals, net balance, savings rate, and transaction counts.
- **Expected result:** Income $1000.00; expenses $250.00; net $750.00; savings rate 75%; counts 1 income and 1 expense.
- **Actual result:** Not observed in a browser.
- **Status:** Blocked — working dependency installation and test-data environment required.
- **Execution environment/commit/evidence:** Pending browser execution.

### BB-02 — Equal income and expenses

- **Technique:** Equivalence partitioning.
- **Test data:** Income 500; expense 500.
- **Steps:** I load the prepared data and read financial analytics.
- **Expected result:** Net $0.00; savings rate 0%; each total $500.00.
- **Actual result:** Not observed in a browser.
- **Status:** Blocked — working dependency installation and test-data environment required.
- **Execution environment/commit/evidence:** Pending browser execution.

### BB-03 — Negative balance

- **Technique:** Equivalence partitioning.
- **Test data:** Income 100; expense 150.
- **Steps:** I load the prepared data and read financial analytics.
- **Expected result:** Net $-50.00 and savings rate -50%, subject to the agreed negative-value display convention.
- **Actual result:** Not observed in a browser.
- **Status:** Blocked — working dependency installation and test-data environment required.
- **Execution environment/commit/evidence:** Pending browser execution.

### BB-04 — Zero income

- **Technique:** Equivalence partitioning.
- **Test data:** Income none; expense 50.
- **Steps:** I load the prepared data and inspect savings rate and net balance.
- **Expected result:** Income $0.00; expense $50.00; net $-50.00; savings rate 0% under the proposed zero-income rule; no NaN/Infinity.
- **Actual result:** Not observed in a browser.
- **Status:** Blocked — working dependency installation and test-data environment required.
- **Execution environment/commit/evidence:** Pending browser execution.

### BB-05 — Empty transactions

- **Technique:** Equivalence partitioning.
- **Test data:** transactions is an empty list.
- **Steps:** I load a successful empty response and read totals/counts.
- **Expected result:** Income, expenses, and net are $0.00; rate 0%; both transaction counts are zero.
- **Actual result:** Not observed in a browser.
- **Status:** Blocked — working dependency installation and test-data environment required.
- **Execution environment/commit/evidence:** Pending browser execution.

### BB-06 — Below first level boundary

- **Technique:** Boundary value analysis.
- **Test data:** Profile XP 98, level 1; available quest reward 1.
- **Steps:** I click Complete Quest once and reload after success.
- **Expected result:** XP 99, level 1; quest remains completed after reload.
- **Actual result:** Not observed in a browser.
- **Status:** Blocked — working dependency installation and test-data environment required.
- **Execution environment/commit/evidence:** Pending browser execution.

### BB-07 — At first level boundary

- **Technique:** Boundary value analysis.
- **Test data:** Profile XP 99, level 1; available quest reward 1.
- **Steps:** I click Complete Quest once and reload after success.
- **Expected result:** XP 100, level 2; one completion record; quest appears in Completed Quests.
- **Actual result:** Not observed in a browser.
- **Status:** Blocked — working dependency installation and test-data environment required.
- **Execution environment/commit/evidence:** Pending browser execution.

### BB-08 — Above first level boundary

- **Technique:** Boundary value analysis.
- **Test data:** Profile XP 100, level 2; available quest reward 1.
- **Steps:** I click Complete Quest once and reload after success.
- **Expected result:** XP 101, level 2; reward applied once.
- **Actual result:** Not observed in a browser.
- **Status:** Blocked — working dependency installation and test-data environment required.
- **Execution environment/commit/evidence:** Pending browser execution.

### BB-09 — Below achievement threshold

- **Technique:** Boundary value analysis.
- **Test data:** Profile XP 99; achievement xp_required 100.
- **Steps:** I load the data and inspect the achievement card.
- **Expected result:** Achievement says Locked.
- **Actual result:** Not observed in a browser.
- **Status:** Blocked — working dependency installation and test-data environment required.
- **Execution environment/commit/evidence:** Pending browser execution.

### BB-10 — At achievement threshold

- **Technique:** Boundary value analysis.
- **Test data:** Profile XP 100; achievement xp_required 100.
- **Steps:** I load the data and inspect the achievement card.
- **Expected result:** Achievement says Unlocked.
- **Actual result:** Not observed in a browser.
- **Status:** Blocked — working dependency installation and test-data environment required.
- **Execution environment/commit/evidence:** Pending browser execution.

### BB-11 — Above achievement threshold

- **Technique:** Boundary value analysis.
- **Test data:** Profile XP 101; achievement xp_required 100.
- **Steps:** I load the data and inspect the achievement card.
- **Expected result:** Achievement says Unlocked.
- **Actual result:** Not observed in a browser.
- **Status:** Blocked — working dependency installation and test-data environment required.
- **Execution environment/commit/evidence:** Pending browser execution.

### BB-12 — Below savings target

- **Technique:** Boundary value analysis.
- **Test data:** Goal current_amount 99; target_amount 100.
- **Steps:** I load the data and inspect the goal amounts/progress.
- **Expected result:** Saved $99.00 of $100.00; 99% complete.
- **Actual result:** Not observed in a browser.
- **Status:** Blocked — working dependency installation and test-data environment required.
- **Execution environment/commit/evidence:** Pending browser execution.

### BB-13 — At savings target

- **Technique:** Boundary value analysis.
- **Test data:** Goal current_amount 100; target_amount 100.
- **Steps:** I load the data and inspect the goal amounts/progress.
- **Expected result:** Saved $100.00 of $100.00; 100% complete.
- **Actual result:** Not observed in a browser.
- **Status:** Blocked — working dependency installation and test-data environment required.
- **Execution environment/commit/evidence:** Pending browser execution.

### BB-14 — Above savings target

- **Technique:** Boundary value analysis.
- **Test data:** Goal current_amount 101; target_amount 100.
- **Steps:** I load the data and inspect the goal amounts/progress.
- **Expected result:** Saved $101.00 of $100.00; progress capped at 100% under the proposed cap rule.
- **Actual result:** Not observed in a browser.
- **Status:** Blocked — working dependency installation and test-data environment required.
- **Execution environment/commit/evidence:** Pending browser execution.

### BB-15 — Completed quest

- **Technique:** Equivalence partitioning; state transition.
- **Test data:** Profile p1; quest q1; matching user_quests row completed=true.
- **Steps:** I load the data, inspect both quest lists, and reload.
- **Expected result:** Quest appears only in Completed Quests; no new reward is given by reloading.
- **Actual result:** Not observed in a browser.
- **Status:** Blocked — working dependency installation and test-data environment required.
- **Execution environment/commit/evidence:** Pending browser execution.

### BB-16 — Incomplete quest record

- **Technique:** Equivalence partitioning; state transition.
- **Test data:** Profile p1; quest q1; matching user_quests row completed=false.
- **Steps:** I load the data and inspect Available Quests and Completed Quests.
- **Expected result:** If completed=false represents an incomplete quest, q1 stays available and is not listed as completed. Confirm schema semantics with Kyle.
- **Actual result:** Not observed in a browser.
- **Status:** Blocked — working dependency installation and test-data environment required.
- **Execution environment/commit/evidence:** Pending browser execution.

### BB-17 — Second quest write fails

- **Technique:** State transition; error handling.
- **Test data:** Profile XP 90, level 1; quest reward 10; permit profile update but simulate user_quests insert failure.
- **Steps:** I click Complete Quest once, inspect both records and the dashboard, then reload.
- **Expected result:** No permanent XP reward without recorded completion; failure is communicated and state stays consistent. Confirm the required recovery policy with Kyle.
- **Actual result:** Not observed in a browser.
- **Status:** Blocked — working dependency installation and test-data environment required.
- **Execution environment/commit/evidence:** Pending browser execution.

### BB-18 — Transaction fetch fails

- **Technique:** Equivalence partitioning; error handling.
- **Test data:** Return a controlled error for transactions retrieval; other reads succeed.
- **Steps:** I load the dashboard and inspect the financial section and error feedback.
- **Expected result:** Failed retrieval is distinguishable from a true $0 balance; proposed error-feedback requirement needs Kyle’s agreement.
- **Actual result:** Not observed in a browser.
- **Status:** Blocked — working dependency installation and test-data environment required.
- **Execution environment/commit/evidence:** Pending browser execution.

## 4. My results and links to findings

| Evidence | What was observed | Related case/report |
| --- | --- | --- |
| SV-01, simulated source logic | completed=false row is classified as completed. | BB-16 / CQ-D002 |
| SV-02, simulated source logic | Profile stores 100 XP after failed completion insert; component state retains 90 XP. | BB-17 / CQ-D001 |
| SV-03, simulated source logic | Failed transaction read produces empty transaction state and zero calculations. | BB-18 / additional review concern, not a third confirmed defect report |
| SV-04, simulated source logic | 1000 income and 250 expenses produce 750 net and 75% savings rate. | BB-01 / diagnostic only |

**My black-box execution totals:** 18 specified; 0 executed in a browser; 0 passed; 0 failed; 18 blocked. These totals must change only when cases are actually run.

## 5. My confirmation and regression plan

After Kyle makes a correction, I will repeat the linked failing scenario in the test environment. For CQ-D001, I will also confirm successful completion still awards exactly one reward and that a failed profile update produces no completion record. For CQ-D002, I will compare completed=true, completed=false, and no matching record, then check that quests belonging to a different profile do not alter the current profile's state. I will keep original and corrected evidence and will close a defect only after confirmation succeeds.
