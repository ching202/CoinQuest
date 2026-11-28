# My AI Transparency and Review Checklist

AI helped draft my test plan, black-box design, and defect reports. It also executed limited source diagnostics using simulated database responses. I have not yet personally verified the browser results, and I will not describe the source diagnostics as my own manual browser testing.

## Complete user prompts that led to this assistance

### Initial planning request

> Start Final Project
> Topics
> My sections are these.
> Test planning
> Black-box testing
> Defect management or documentation for CoinQuest.
>
> 1. Test Plan
> Create a test plan that includes:
>
> Test objectives
> Scope
> Test environment and tools
> Test approach
> Risks
> Entry and exit criteria
> Test deliverables
> Static Testing
>
> 2. Black-Box Testing
> Apply at least two black-box testing techniques:
>
> Equivalence partitioning
> Boundary value analysis
> Decision table testing
> State transition testing
>
>
> 3. Defect Management
> Create at least two defect reports based on problems discovered during testing.
>
> Each report must include:
>
> Defect ID and title
> Related test or review
> Environment
> Steps to reproduce or code location
> Expected and actual results
> Severity and priority
> Status


### Follow-up request


Context supplied: the same archive, the earlier plan, and my assigned sections. Activities supported: first-person documentation, test-case design, and source-based defect investigation. AI created the present documents and diagnostic runner/output. My acceptance/revision/rejection decisions: pending my review.

These are the actual requests, not three invented historical AI interactions. The follow-up is broad, so I will not claim it alone satisfies the assignment's requirement for three focused uses. Kyle and I still need three focused, documented interactions with specific context, response use, and review decisions.

## Three proposed focused prompts for my next review sessions — not yet executed

1. **Black-box design review:** “CoinQuest has a dashboard and Complete Quest button, with no transaction-entry form. Here are our agreed financial rules and my EP/boundary tables: [paste them]. Identify missing partitions and boundary cases. Do not invent UI features or requirements. Explain every proposed case and keep actual results unfilled.”
2. **Defect review:** “Here is CoinQuest completeQuest and the SV-02 diagnostic output: [paste both]. Review CQ-D001 for reproducibility and distinguish source evidence, simulated persistence, and real-database claims. Suggest a correction approach that addresses both writes atomically. Do not claim a fix was executed.”
3. **Result/report review:** “Here are my actual browser execution records, environment, and open defects: [paste records after execution]. Check counts and whether each quality claim has evidence. Flag unsupported claims. Do not turn blocked cases into passes.”

For each actual use I will save the complete expanded prompt, context, response or relevant excerpt, how I used it, accepted/revised/rejected items, and what I verified. Placeholders above must be replaced with actual context before use.

## My review checklist

- [ ] I reviewed the plan with Kyle and confirmed rules/schema assumptions.
- [ ] I understand the EP and boundary tables and can explain my cases.
- [ ] I ran the browser cases and recorded genuine results, or reported the remaining blockage.
- [ ] I reviewed the diagnostic limitations and reproduced relevant findings safely.
- [ ] I documented my actual AI review decisions.
- [ ] I contributed commits/PRs and prepared my presentation/demo portion.
