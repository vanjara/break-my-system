# Break My System — Learning and Product Backlog

This is a **prioritized list of ideas, not a commitment to implement everything**. Keep the current GitHub Pages demo as the baseline. Choose one small change at a time, test it with a learner, and document what was learned.

## Now — consolidate Lesson 1

- [ ] Verify the existing flow from first customer through bottleneck and backlog recovery.
- [ ] Make the transition to the software view educational, not just a change of labels.
- [ ] Explain **backlog recovery**: capacity can meet current demand while old orders still wait; show a careful recovery-time estimate.
- [ ] Check confusing wording and metrics (arrival rate vs total arrivals, busy vs available resources, theoretical vs observed throughput).
- [ ] Review whether all controls need to be visible at every stage.
- [ ] Add a few small regression checks for order accounting and resource limits before restructuring code.

**Lesson 1 boundary:** capacity, queues, bottlenecks, finite resources, backlog recovery, and a simple software analogy. No rate limiter, retry engine, or budget system in this lesson.

## Next lessons — only after Lesson 1 is clear

| Candidate lesson | Learner's question | Smallest useful experiment |
| --- | --- | --- |
| Peak-hour workloads | Can a finite system survive a temporary surge? | Change demand over a simple morning/lunch/afternoon timeline |
| Admission control | Why can't we control how many customers show up? | Separate incoming demand from accepted orders |
| Rate limiting | What happens when we accept at most N requests/min? | Accepted vs rejected counters, starting with a simple limiter |
| Rejection vs deferral | Do excess customers leave or wait? | Compare a bounded queue against rejection |
| Backpressure | How do overloaded components signal producers to slow down? | Introduce a bounded upstream queue and feedback |
| Limiter internals | Why token bucket instead of fixed window? | Compare burst behavior using identical demand |
| Retries and backoff | Can retrying make overload worse? | Failed requests return with and without backoff |
| Resource economics | When is adding capacity worth it? | Add a simple cost budget after the resource limits are understood |

## Longer-term learning paths

- **Database internals:** why databases, scans and indexes, B-trees/pages, transactions, WAL, replication.
- **Messaging:** why a queue or log, then RabbitMQ/ActiveMQ routing and acknowledgments, Kafka partitions/offsets/replay.
- **Caching:** why caches, then Redis/Memcached lookups, TTL, eviction, consistency, and failure modes.

For each technology: **problem → simplest solution → limitation → why the technology → how it works internally → tradeoffs and when not to use it**.

## Product guardrails

1. The real-world model should be understandable before introducing software terminology.
2. Visual activity must reflect actual simulation state, not decorative fake requests.
3. One scenario should teach one primary concept; advanced concepts can be separate lessons.
4. Preserve the white-and-blue visual identity and the static, browser-only architecture.
5. No AI requirement, backend, new framework, or generic scenario engine until a demonstrated need.
6. Keep changes small, reviewable, and understandable to a reader new to JavaScript.
