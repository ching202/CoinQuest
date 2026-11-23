# CoinQuest — My Final Project Sections

**Bashir Abdulkadir | Partner: Kyle Kitching | AD361**

My assigned sections are test planning, black-box testing, and defect documentation for Kyle's existing CoinQuest application.

## My files

1. [My test plan](docs/TEST_PLAN.md)
2. [My black-box test design and execution record](docs/BLACK_BOX_TESTING.md)
3. [My defect reports](docs/DEFECT_REPORTS.md)
4. [My AI transparency and review checklist](docs/AI_TRANSPARENCY.md)
5. Diagnostic evidence: [observations](evidence/source_verification.json) and [repeatable runner](evidence/verify_source.cjs).

## Current completion status

I have a prepared test plan, two black-box design artifacts, 18 specified black-box test cases, and two defect reports supported by source review and simulated-service diagnostics. Browser execution remains blocked in the assistant workspace, so my black-box cases do not have passing or failing UI results yet. The defect reports distinguish observed source behavior from real-database behavior that still needs confirmation.

This package uses first-person wording as my draft submission voice. AI drafted these documents and performed the listed source diagnostics; I need to review the work, understand it, and personally verify the applicable results before submitting. This package does not claim that I manually performed the assistant's checks.

## How I will finish the execution record

1. I will review expected behavior and the defect reports with Kyle.
2. I will get the shared repository URL, the current commit, a working local setup, and isolated test data/reset instructions.
3. From the repository's frontend folder, I will run `npm ci` and `npm run dev`, then open Vite's displayed local URL.
4. I will prepare each case's data with Kyle using the test database or a clearly labeled mock. The dashboard has no transaction-entry or goal-entry form.
5. I will execute the documented steps, replace each Blocked status with the actual outcome, and save evidence. I will not substitute the diagnostic observations for browser results.
6. I will commit my files to a branch, open a pull request, and ask Kyle to review. No commits or PRs have been created by this package.

The complete team project also needs Kyle's agreed sections, automated tests/coverage, static testing, slides, both partners' contributions, and a demonstration. Those team requirements are not completed by this package.
