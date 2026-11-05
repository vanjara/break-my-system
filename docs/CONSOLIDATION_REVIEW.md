# MVP Simplification and Consolidation Review

Date: 2026-10-31  
Status: **Review only — no refactor approved or implemented**

## What we have

- A public, static GitHub Pages pizza restaurant experiment in `docs/index.html`.
- A guided scenario, six visual stages, demand controls, resource limits, live activity, capacity calculations, and metrics.
- A second view with software terminology, sharing the same simulation state.
- An older, separate Next.js/Prisma application elsewhere in the repository. It is **not** the GitHub Pages runtime.

## What works and should stay

- White cards, bright blue actions, icons, and clear visual grouping.
- A simple progression from low demand to bottleneck and scaling decisions.
- Orders tracked through waiting, cooking, waiting for ovens, baking, and completed.
- A single client-side simulation; no deployment infrastructure or AI costs.
- Controls that let learners discover capacity limits and backlog behavior.

## Where complexity has accumulated

| Area | Observation | Smallest proposed response |
| --- | --- | --- |
| Lesson scope | Capacity, resource limits, live telemetry, and advanced topics compete for attention | Freeze Lesson 1's scope; move new concepts to separate lessons |
| Software view | Changing labels alone does not teach architectural reasoning | Add a short, guided mapping and one application question later |
| Metrics | Rate, cumulative totals, queues, capacity, and completion time are easy to confuse | Clarify labels and add contextual explanations; do not add more charts yet |
| Controls | Start, surge, demand adjustment, resource decisions, pause, restart, and view switch all coexist | Consider progressive disclosure after observing actual confusion |
| Code readability | HTML, CSS, rendering, and simulation share one ~220-line file | Keep it for now; extract files only when a specific edit or test becomes hard |
| Duplicate implementations | Existing Next.js application and the Pages demo represent different product directions | Document which is active; do not delete or migrate either without a separate decision |
| Verification | Browser behavior is manually tested; few focused simulation invariants are documented | Test received = completed + outstanding; caps and timing before refactoring |

## Important learning correction

A queue can stay large even after demand falls below capacity. At steady rates, approximate drain time is **backlog / (processing capacity − incoming demand)**, but only when processing capacity is actually available to that queue. In-flight work and upstream stages affect the estimate. This is a teaching approximation, not a guarantee.

## Recommended order of work

1. **Observe:** Test the current Lesson 1 with a new learner; note where they hesitate.
2. **Clarify:** Fix misleading labels and the restaurant-to-software learning transition.
3. **Verify:** Add minimal simulation checks for order conservation and resource caps.
4. **Refactor only if necessary:** Split the single file or add abstractions only when readability or testing demands it.
5. **Expand:** Build a separate peak-hours or admission-control lesson after Lesson 1 passes the learning test.

## Explicitly deferred

- General-purpose simulation framework or scenario plugin API.
- AI-generated lessons, centralized inference, and paid-provider key management.
- User accounts, databases, backend services, dashboards, and leaderboards.
- Rate limiting, backpressure, retry policies, budgets, and Kafka/Redis/database internals inside Lesson 1.

## Acceptance questions

A learner should be able to answer without outside help:

1. Where is work waiting?
2. Which resource limits maximum throughput, and why?
3. Why can a backlog persist after demand falls?
4. Why might adding a worker fail to improve throughput?
5. What is the equivalent software architecture behavior?

If these remain unclear, improve Lesson 1 before adding a new feature.
