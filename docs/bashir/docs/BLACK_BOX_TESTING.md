CoinQuest — My Black-Box Testing
Author: Bashir Abdulkadir

Project: CoinQuest — AD361 final project

Original design baseline: Supplied CoinQuest-main.zip; see TEST_PLAN.md for source identity.

Current record: One browser case passed based on my supplied screenshots. The browser-served commit, exact browser version, and data-service type still need recording. I do not assume the browser used the same commit as my automated rerun.
My execution status
I executed BB-01 in my local browser and compared the visible transaction records with the dashboard calculations. The screenshots show income of $150.00, expenses of $20.00, a net balance of $130.00, a savings rate of 87%, one income transaction, and two expense transactions. BB-01 passed for this observed dataset.

The other 17 cases have no recorded browser execution. They remain blocked pending the controlled datasets or failure scenarios specified in each case. My local installation and application startup now work; the earlier assistant-workspace download restriction is historical and is not my current general blocker.

I have not met the minimum of six executed black-box cases across two techniques yet. My executed case uses equivalence partitioning; my boundary cases remain unexecuted. My screenshots do not establish values at XP 99/100/101 or savings completion boundaries.

The original four AI-executed source diagnostics are preserved in evidence/source_verification.json. They are supporting investigations, not browser execution or live Supabase verification.
My requirements and setup
I compare displayed income and expenses with the transaction list. For BB-01, I independently calculate $7.50 + $12.50 = $20.00, $150.00 - $20.00 = $130.00, and round(($130.00 / $150.00) × 100) = 87%. I recorded the screenshot result after opening the application; I did not personally seed that dataset or verify database record IDs.

For the remaining cases, I will agree on the expected behavior and controlled test data with Kyle. Monetary values here describe stored test records, not nonexistent input forms. I will use an approved isolated service or a clearly identified browser mock, reset fixtures between independent runs, and identify the data source in my evidence. I will not modify shared data just to obtain expected results.
Environment field	Recorded information
Browser URL for BB-01	http://localhost:5173/
Operating system	Windows; exact version not yet recorded.
Browser	Chrome interface visible in screenshot; exact version pending.
Browser-served source commit	Pending confirmation from the terminal serving this page.
Data source	Records displayed successfully; real-service versus mock and fixture IDs not yet confirmed.
Browser evidence date	Screenshots supplied November 27, 2026 Pacific; exact capture time not independently verified.
BB-01 screenshot names	image(20261128-005554).png and image(20261128-005624).png; copy these into repository evidence before final submission.
Separate automated baseline	I reran component/SQL checks at 6582a3bc0e90a158b6428b7af431c150f9706012; this does not identify the browser baseline.


What I still need to record for BB-01
I will confirm the running frontend's commit, browser version, and data source. I will preserve both screenshots in docs/bashir/evidence/browser/ and add relative links after the files exist. If I cannot identify the browser baseline reliably, I will rerun BB-01 under a recorded baseline rather than guess.
1. My equivalence partitions
ID	Input/state group	Representative	Related case
EP-01	Income exceeds expenses	150 income, 20 expenses	BB-01
EP-02	Income equals expenses	500 income, 500 expense	BB-02
EP-03	Expenses exceed positive income	100 income, 150 expense	BB-03
EP-04	Income is zero	No income, 50 expense	BB-04
EP-05	Successful empty transaction data	Empty list	BB-05
EP-06	Completed quest record	completed=true	BB-15
EP-07	Incomplete quest record	completed=false	BB-16
EP-08	Data retrieval failure	Controlled transactions error	BB-18


I keep failed retrieval separate from a successful empty response because their meanings differ.
2. My boundary design
ID	Boundary and assumed rule	Below	At	Above	Cases
BV-01	First level increase at 100 total XP	99 XP → level 1	100 XP → level 2	101 XP → level 2	BB-06–08
BV-02	Achievement unlock at 100 XP	99 → locked	100 → unlocked	101 → unlocked	BB-09–11
BV-03	Savings target $100	$99 → 99%	$100 → 100%	$101 → capped 100%	BB-12–14


I use whole-dollar neighbors for the initial savings display cases because the percentage is displayed as a whole number. If Kyle requires cent-level monetary boundaries, I will add $99.99/$100.00/$100.01 with an agreed rounding rule rather than claim that the displayed integer distinguishes them.
3. My test cases
For each future case, I will confirm the application is running, load the case fixture through an approved test-data method, reset prior state, and reload the page. BB-01 instead used the existing visible dataset documented below. I will attach actual evidence and will not describe planned setup as completed work.
BB-01 — Positive balance
- Technique: Equivalence partitioning.
- Test data: One income transaction of $150.00 and two
  expense transactions of $7.50 and $12.50.
- Steps: I opened CoinQuest and compared its transaction
  list with the dashboard totals and financial analytics.
- Expected result: Income $150.00; expenses $20.00;
  net balance $130.00; savings rate 87%; one income
  transaction and two expense transactions.
- Actual result: I observed all the expected values
  in the browser.
- Status: Pass.
- Evidence: Dashboard screenshot image(20261128-005554).png and transaction-list screenshot image(20261128-005624).png supplied in the conversation; repository evidence copies pending.
- Environment: Local application at localhost:5173.
  Running commit and browser version still need recording.
BB-02 — Equal income and expenses
- Technique: Equivalence partitioning.
- Test data: Income 500; expense 500.
- Steps: I load the prepared data and read financial analytics.
- Expected result: Net $0.00; savings rate 0%; each total $500.00.
- Actual result: Not observed in a browser.
- Status: Blocked — the required controlled dataset has not yet been prepared and verified for this browser case.
- Execution environment/commit/evidence: Pending browser execution.
BB-03 — Negative balance
- Technique: Equivalence partitioning.
- Test data: Income 100; expense 150.
- Steps: I load the prepared data and read financial analytics.
- Expected result: Net $-50.00 and savings rate -50%, subject to the agreed negative-value display convention.
- Actual result: Not observed in a browser.
- Status: Blocked — the required controlled dataset has not yet been prepared and verified for this browser case.
- Execution environment/commit/evidence: Pending browser execution.
BB-04 — Zero income
- Technique: Equivalence partitioning.
- Test data: Income none; expense 50.
- Steps: I load the prepared data and inspect savings rate and net balance.
- Expected result: Income $0.00; expense $50.00; net $-50.00; savings rate 0% under the proposed zero-income rule; no NaN/Infinity.
- Actual result: Not observed in a browser.
- Status: Blocked — the required controlled dataset has not yet been prepared and verified for this browser case.
- Execution environment/commit/evidence: Pending browser execution.
BB-05 — Empty transactions
- Technique: Equivalence partitioning.
- Test data: transactions is an empty list.
- Steps: I load a successful empty response and read totals/counts.
- Expected result: Income, expenses, and net are $0.00; rate 0%; both transaction counts are zero.
- Actual result: Not observed in a browser.
- Status: Blocked — the required controlled dataset has not yet been prepared and verified for this browser case.
- Execution environment/commit/evidence: Pending browser execution.
BB-06 — Below first level boundary
- Technique: Boundary value analysis.
- Test data: Profile XP 98, level 1; available quest reward 1.
- Steps: I click Complete Quest once and reload after success.
- Expected result: XP 99, level 1; quest remains completed after reload.
- Actual result: Not observed in a browser.
- Status: Blocked — controlled quest/profile fixtures and approved integration setup are not yet confirmed. The corrected quest action requires its database RPC/migration.
- Execution environment/commit/evidence: Pending browser execution.
BB-07 — At first level boundary
- Technique: Boundary value analysis.
- Test data: Profile XP 99, level 1; available quest reward 1.
- Steps: I click Complete Quest once and reload after success.
- Expected result: XP 100, level 2; one completion record; quest appears in Completed Quests.
- Actual result: Not observed in a browser.
- Status: Blocked — controlled quest/profile fixtures and approved integration setup are not yet confirmed. The corrected quest action requires its database RPC/migration.
- Execution environment/commit/evidence: Pending browser execution.
BB-08 — Above first level boundary
- Technique: Boundary value analysis.
- Test data: Profile XP 100, level 2; available quest reward 1.
- Steps: I click Complete Quest once and reload after success.
- Expected result: XP 101, level 2; reward applied once.
- Actual result: Not observed in a browser.
- Status: Blocked — controlled quest/profile fixtures and approved integration setup are not yet confirmed. The corrected quest action requires its database RPC/migration.
- Execution environment/commit/evidence: Pending browser execution.
BB-09 — Below achievement threshold
- Technique: Boundary value analysis.
- Test data: Profile XP 99; achievement xp_required 100.
- Steps: I load the data and inspect the achievement card.
- Expected result: Achievement says Locked.
- Actual result: Not observed in a browser.
- Status: Blocked — the required controlled dataset has not yet been prepared and verified for this browser case.
- Execution environment/commit/evidence: Pending browser execution.
BB-10 — At achievement threshold
- Technique: Boundary value analysis.
- Test data: Profile XP 100; achievement xp_required 100.
- Steps: I load the data and inspect the achievement card.
- Expected result: Achievement says Unlocked.
- Actual result: Not observed in a browser.
- Status: Blocked — the required controlled dataset has not yet been prepared and verified for this browser case.
- Execution environment/commit/evidence: Pending browser execution.
BB-11 — Above achievement threshold
- Technique: Boundary value analysis.
- Test data: Profile XP 101; achievement xp_required 100.
- Steps: I load the data and inspect the achievement card.
- Expected result: Achievement says Unlocked.
- Actual result: Not observed in a browser.
- Status: Blocked — the required controlled dataset has not yet been prepared and verified for this browser case.
- Execution environment/commit/evidence: Pending browser execution.
BB-12 — Below savings target
- Technique: Boundary value analysis.
- Test data: Goal current_amount 99; target_amount 100.
- Steps: I load the data and inspect the goal amounts/progress.
- Expected result: Saved $99.00 of $100.00; 99% complete.
- Actual result: Not observed in a browser.
- Status: Blocked — the required controlled dataset has not yet been prepared and verified for this browser case.
- Execution environment/commit/evidence: Pending browser execution.
BB-13 — At savings target
- Technique: Boundary value analysis.
- Test data: Goal current_amount 100; target_amount 100.
- Steps: I load the data and inspect the goal amounts/progress.
- Expected result: Saved $100.00 of $100.00; 100% complete.
- Actual result: Not observed in a browser.
- Status: Blocked — the required controlled dataset has not yet been prepared and verified for this browser case.
- Execution environment/commit/evidence: Pending browser execution.
BB-14 — Above savings target
- Technique: Boundary value analysis.
- Test data: Goal current_amount 101; target_amount 100.
- Steps: I load the data and inspect the goal amounts/progress.
- Expected result: Saved $101.00 of $100.00; progress capped at 100% under the proposed cap rule.
- Actual result: Not observed in a browser.
- Status: Blocked — the required controlled dataset has not yet been prepared and verified for this browser case.
- Execution environment/commit/evidence: Pending browser execution.
BB-15 — Completed quest
- Technique: Equivalence partitioning; state transition.
- Test data: Profile p1; quest q1; matching user_quests row completed=true.
- Steps: I load the data, inspect both quest lists, and reload.
- Expected result: Quest appears only in Completed Quests; no new reward is given by reloading.
- Actual result: Not observed in a browser.
- Status: Blocked — controlled quest/profile fixtures and approved integration setup are not yet confirmed. The corrected quest action requires its database RPC/migration.
- Execution environment/commit/evidence: Pending browser execution.
BB-16 — Incomplete quest record
- Technique: Equivalence partitioning; state transition.
- Test data: Profile p1; quest q1; matching user_quests row completed=false.
- Steps: I load the data and inspect Available Quests and Completed Quests.
- Expected result: An incomplete completed=false record leaves q1 available rather than completed. Kyle reports the column is nullable with default false, supporting this test state; my browser confirmation remains pending.
- Actual result: Not observed in a browser.
- Status: Blocked — controlled quest/profile fixtures and approved integration setup are not yet confirmed. The corrected quest action requires its database RPC/migration.
- Execution environment/commit/evidence: Pending browser execution.
BB-17 — Quest completion fails without retaining a reward
- Technique: State transition; error handling.
- Test data: Profile XP 90, level 1; quest reward 10. On the original client, force the second write to fail. On Kyle’s corrected branch, use an approved test-only failure inside the completion transaction after its XP update. A generic rejected network request alone does not prove database rollback.
- Steps: I will trigger the controlled completion failure, compare profile XP and completion records through approved test access, inspect user feedback, and reload. The browser/integration run is not yet performed.
- Expected result: XP stays at 90, no completion is recorded, and the UI does not claim success. The original defect evidence is retained separately; Kyle’s local SQL rollback test is not this browser case.
- Actual result: Not observed in a browser.
- Status: Blocked — a controlled transactional failure scenario and approved corrected-app integration setup are not yet available.
- Execution environment/commit/evidence: Pending browser execution.
BB-18 — Transaction fetch fails
- Technique: Equivalence partitioning; error handling.
- Test data: Return a controlled error for transactions retrieval; other reads succeed.
- Steps: I load the dashboard and inspect the financial section and error feedback.
- Expected result: Failed retrieval is distinguishable from a true $0 balance; proposed error-feedback requirement needs Kyle’s agreement.
- Actual result: Not observed in a browser.
- Status: Blocked — a controlled browser request-failure scenario has not yet been prepared.
- Execution environment/commit/evidence: Pending browser execution.
4. My results and links to findings
Evidence	What was observed	Related case/report
SV-01, simulated source logic	completed=false row is classified as completed.	BB-16 / CQ-D002
SV-02, simulated source logic	Profile stores 100 XP after failed completion insert; component state retains 90 XP.	BB-17 / CQ-D001
SV-03, simulated source logic	Failed transaction read produces empty transaction state and zero calculations.	BB-18 / additional review concern, not a third confirmed defect report
SV-04, original simulated source logic	1000 income and 250 expenses produce 750 net and 75% savings rate.	Historical arithmetic diagnostic; different data from executed BB-01.


My black-box execution totals: 18 specified; 1 executed in a browser; 1 passed; 0 failed; 17 blocked.
Technique	Recorded browser execution
Equivalence partitioning	BB-01 passed using the displayed positive-balance dataset.
Boundary value analysis	No cases executed yet.
Additional state-transition/error checks	No cases executed yet.


The observed BB-01 result is recorded; its source/environment metadata and repository evidence still need completion. No other case is marked passed based solely on the same screenshots or Kyle’s automated test results.
My separate automated rerun
I ran Kyle’s checks on Windows PowerShell 5.1 with Node v25.2.1 and npm v11.6.2 at commit 6582a3bc0e90a158b6428b7af431c150f9706012. ESLint passed, 37 component cases passed, 18 local SQL cases passed, and the build passed. Node produced unsupported-engine warnings and npm reported 11 vulnerabilities. These facts belong to my review/defect evidence; they do not add to my black-box execution totals.
5. My confirmation and regression plan
Kyle has proposed corrections in PR #10, and my local automated rerun passed. Browser confirmation and live integration verification remain pending. I will repeat the linked failing scenario in an approved test environment. For CQ-D001, I will also confirm successful completion still awards exactly one reward and that a failed profile update produces no completion record. For CQ-D002, I will compare completed=true, completed=false, and no matching record, then check that quests belonging to a different profile do not alter the current profile's state. I will keep original and corrected evidence and will close a defect only after confirmation succeeds.
6. My next execution steps
1. I will finish recording BB-01’s environment and save its screenshots in the repository.
2. With Kyle, I will prepare and execute BB-02 and BB-03 for equal and negative balances.
3. I will prepare and execute BB-09, BB-10, and BB-11 at XP 99, 100, and 101 for an achievement threshold of 100.
This gives six executed cases across equivalence partitioning and boundary value analysis only after the five remaining runs actually occur. I will record their actual values and pass/fail results even if they differ from my expectations. Other planned cases may remain blocked with reasons disclosed.

The current browser screenshots show XP 670 and unlocked achievements. That is not evidence for the exact 99/100/101 boundary cases. I will keep the intended boundary data rather than rename the existing screenshots as boundary execution.
7. My evidence and AI transparency
AI helped organize this report, reconcile its counts, and compare the values in my screenshots with the expected calculations. My BB-01 result comes from my supplied browser screenshots. Original source diagnostics and Kyle’s automated checks remain attributed separately. I will review the final document before submitting and will not claim the assignment is complete until its execution and evidence requirements are met.