# App.jsx manual-review guide

This reading aid supported the guided App.jsx comparison. Kyle has now accepted both fixes and retained ST-03/ST-04 as open; see [REVIEW_DECISIONS.md](REVIEW_DECISIONS.md) for the exact confirmation and review scope.

Open the [original App.jsx](evidence/before-fixes/App.jsx) beside [STATIC_TESTING.md](STATIC_TESTING.md). The original file is the basis for the findings and original line numbers. Use the [corrected App.jsx](../../frontend/src/App.jsx) afterward to compare changes.

## Read these six sections

| Original lines | What the code does | What to check while reading |
| --- | --- | --- |
| 1-12 | Imports tools and creates state arrays/loading state | Identify which state holds profiles, quests and completion records. Empty arrays are the initial values. |
| 14-51 | Loads six tables, logs read errors and stores data | Find the error check and data-or-empty-array fallback. Explain why an error can look like a genuine empty transaction list (ST-03). |
| 53-115 | Completes a quest through two separate writes | Trace the profile update, completion insert, error return and UI update. At the second error return, XP was already saved (ST-01). |
| 117-133 | Builds completed IDs, then available/completed lists | Find the user-ID comparison and quest-ID map. The original classification does not inspect completed (ST-02). |
| 135-164 | Computes totals, rate, health and transaction counts | Income minus expenses gives net. The rate guards zero income. The health checks use strict greater-than boundaries. filter/reduce/map process collections. |
| 166-359 | Renders loading, cards, quest buttons, achievements and goals | Find the empty-list branches, XP threshold comparison and progress formula. Division by target lacks a zero guard (ST-04). |

## Compare the correction

In corrected completeQuest, the app sends IDs through one RPC, waits for the result and renders returned XP/level. It disables overlapping actions and shows an error if completion cannot be confirmed. It uses completed === true when classifying rows. The SQL function calculates rewards and performs both saves within one transaction.

The original explanation remains valid for the original version. After the correction, a completion error in the local SQL test rolls back XP too. The SQL migration is proposed and has not been installed in Supabase.

## Record your own review

After reading, record:

- Which sections you actually inspected and on what date.
- Whether ST-01 and ST-02 match what you saw; your reason for accepting or changing the proposed fix.
- Your disposition for ST-03 and ST-04. They may remain open with an explanation; not every finding must be fixed to document a review.
- One test expectation you checked yourself, such as 1050 income minus 250 expenses equals 800, or why a false completion should remain available.
- Questions or changes you want before the PR is ready.

Do not check off a section merely because this guide describes it. The assignment asks for a manual review of a source file and review of AI-generated work. Personal execution of every automated command is not separately stated as a requirement, but you should understand and be able to demonstrate the tests.
