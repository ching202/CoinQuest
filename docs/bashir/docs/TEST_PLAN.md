# CoinQuest — My Test Plan

**Author:** Bashir Abdulkadir  
**Partner:** Kyle Kitching  
**Version:** 2.0 — first-person project package  
**Status:** Prepared for team review; browser execution blocked.

## 1. My application and baseline

I am testing CoinQuest, Kyle's existing gamified student-budgeting prototype. It uses React, Vite, CSS, and Supabase/PostgreSQL. The supplied source includes a dashboard that shows profiles, quests, achievements, transactions, savings goals, and financial analytics. Users can click Complete Quest to earn XP.

My baseline is the supplied CoinQuest-main.zip, whose archive identifies commit ae78c7005733e36c0e08c5d921938a7873c3181a. The SHA-256 of frontend/src/App.jsx is ec2f40cf4e5b93c3aef148616888c4b37a9fa22adee3892d92ee164d2f2efd5c. I will record the actual shared-repository commit when I run the browser cases.

I will confirm these proposed rules with Kyle: income minus expenses gives net balance; savings rate is rounded to a whole percentage and is zero when income is zero; level increases every 100 XP starting at level 1; an achievement unlocks when XP reaches its threshold; and only genuinely completed quests should be shown as completed. The code currently implements most of these formulas, but implementation alone does not establish requirements. My cases use these as provisional test oracles pending team review.

## 2. My test objectives

- I will check that the dashboard shows the correct synthetic data and counts.
- I will compare financial totals, balances, percentages, XP, and progress against independently calculated expected values.
- I will test quest completion, level and achievement boundaries, and persistence after reload.
- I will document real findings clearly and link each defect to its review or test.
- I will retest agreed corrections and check related behavior for regressions.
- I will report remaining failures, blocked work, and limitations honestly.

## 3. My scope

| Included area | What I will check |
| --- | --- |
| Dashboard | Loading, displayed data, counts, and empty-data behavior. |
| Financial analytics | Income, expenses, net balance, savings rate, and transaction summary. |
| Quests | Available/completed status, successful completion, reward, repeat attempts, and failed writes. |
| XP and achievements | Level boundaries and locked/unlocked thresholds. |
| Savings goals | Currency display and progress below, at, and above the target. |
| Defects | Reproduction, impact, proposed correction, status, and confirmation steps. |

I will not test nonexistent login, transaction-entry, or goal-entry forms. I will not build a new application, connect real bank accounts, or claim comprehensive security, load, or cross-browser testing. The prototype's first-profile selection and handling of multiple users need clarification from Kyle before I assess user isolation.

## 4. My environment and tools

| Item | My plan |
| --- | --- |
| Local application | I will use the existing frontend and its locked dependencies. Startup commands are npm ci and npm run dev from frontend/. |
| Browser | I will use Chrome and record its version, my operating system, and the execution commit. These values are pending. |
| Data | I will use synthetic records in an isolated Supabase test environment or explicitly labeled mocks. Kyle must confirm schema, access policies, and reset steps. |
| Configuration | I will configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY locally for the test service and verify the destination before quest writes. |
| Documentation | I will keep Markdown test cases and defect reports in the shared GitHub repository. |
| Collaboration | I will use branches, commits, pull requests, and Zoom/Slack to coordinate with Kyle. |
| Diagnostic environment already used by AI | Linux, Node v24.22.3, original pre-JSX application logic executed in a Node VM with simulated hooks and database responses. This is not a browser or real Supabase environment. |

In the assistant workspace, npm ci failed with HTTP 403 while downloading zod-validation-error. An alternative isolated install was also blocked while downloading esbuild. Therefore the dashboard was not rendered or executed in a browser. The simulated source checks are preserved separately in evidence/.

## 5. My test approach

### My planning and data preparation

I will review the expected behavior with Kyle before assigning final pass/fail results. I will use the same synthetic profile and clearly identified fixtures, reset data between independent cases, and record all setup changes. I will use a safe test service because quest completion updates profile XP and user_quests.

### My black-box testing

I will use equivalence partitioning and boundary value analysis, with supporting state-transition checks. My partition table groups financial states and quest states. My boundary table covers level thresholds, achievement thresholds, and savings-goal completion. I have prepared 18 cases with data, steps, expected outcomes, actual-result fields, and statuses in BLACK_BOX_TESTING.md. I will observe browser behavior rather than use source calculations as a substitute for execution.

### My defect management

I will give each finding an ID and record its related test/review, environment, steps or code location, expected and actual results, severity, priority, and status. I will preserve the original failure and record correction and retest evidence separately. Source-supported findings will stay clearly labeled until confirmed in the actual integration environment. I will not invent defects or claim a fix that has not been made.

### Static and white-box testing coordination

I will coordinate with Kyle so the team reviews at least one source file manually and runs automated static analysis, using the existing npm run lint script. Kyle is proposed to lead automated white-box tests and coverage; the supplied package has no test or coverage script yet. The team needs at least four automated tests covering statements, branches, and applicable loops/collection processing, with results and coverage. I will review his findings and link relevant issues to my reports. This package does not claim that those requirements are complete.

### AI assistance and reporting

I will disclose that AI helped draft these documents and run limited source diagnostics. I will review the suggestions and record actual accept/revise/reject decisions. I will coordinate with Kyle to keep at least three focused AI-use records for the overall project. At the end, I will summarize test counts, defects, limitations, and quality for the tested commit.

## 6. My risks and mitigation

| Risk | What I will do |
| --- | --- |
| Dependencies or database access block execution | I will preserve the error, mark affected cases blocked, and rerun in a working environment. |
| Test actions change shared XP or quest data | I will use isolated fixtures and reset them between cases. |
| Expected behavior or schema is unclear | I will confirm it with Kyle and identify provisional expectations. |
| Quest completion only partly succeeds | I will simulate a failed second write, inspect state, and ask Kyle to reproduce safely against the test service. |
| Sample data contains incomplete user-quest records | I will check completed=false semantics with Kyle before confirming that finding as an integration defect. |
| Time-zone or task handoff delays | I will agree on meeting times in Pacific/Eastern time and use small written handoffs and PRs. |
| Limited scope suggests more confidence than evidence supports | I will separate source diagnostics, mocks, browser results, and real-service results. |

## 7. My entry criteria

- I can access the shared repository and agree on responsibilities with Kyle.
- The application starts and the browser can load the dashboard.
- Test configuration, synthetic data, and a safe reset method are available.
- Kyle and I have reviewed the relevant behavior and expected results.
- I have recorded versions, commit, and evidence locations.

These criteria are not all met in the assistant workspace; browser execution remains blocked.

## 8. My exit criteria

- I have reviewed the plan with Kyle.
- I have executed at least six black-box cases using at least two techniques and recorded actual outcomes.
- I have documented at least two genuine defects or source findings with the required fields and clear verification limits.
- Agreed corrections have confirmation/regression evidence; unresolved defects have a documented disposition.
- I have summarized the tested version, results, open risks, and blocked work.
- I have contributed commits, a pull request, documentation, testing, presentation, and demonstration.

I will not mark my section finished merely because the documents are written. The blocked execution and retesting still need to be completed or explicitly addressed with the instructor.

## 9. My deliverables and schedule

| Session | My work | Estimate |
| --- | --- | --- |
| 1 | Review plan/rules with Kyle; confirm setup, schema, and fixtures. | 1 hour |
| 2 | Prepare/reset data and execute financial and boundary cases. | 2 hours |
| 3 | Execute quest/failure cases and update defect reports. | 1–2 hours |
| 4 | Retest agreed fixes, review results, and open my PR. | 1–2 hours |
| 5 | Help finalize slides, contribution summary, and demonstration. | 1 hour |

These are estimates, not completed-hour claims. I will confirm the Canvas deadline with Kyle and schedule these sessions before it.

My deliverables are this plan, partition and boundary tables, 18 specified black-box cases, two detailed defect reports, diagnostic evidence, and an AI transparency/review checklist. My final browser evidence, commits/PR links, and personal verification notes will be added after execution.
