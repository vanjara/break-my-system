# Pizza-demo acceptance checks

## Automated check

From the repository root, with Node.js 20.9+:

```sh
npm run test:demo
# Equivalent, with no install step:
node --test tests/pizza-demo.test.cjs
```

The suite uses Node's built-in runner and a minimal DOM double. It evaluates the
actual inline script from `docs/index.html`. It does not launch Next.js, require
an API key, install packages, or contact a server.

The contract is:

- Start seeds one order; preparation takes 10 seconds and baking takes 15.
- Every rate from 1 to 20/min creates the scheduled number of orders; 10/min
  creates an order every six seconds. Credits use integer units to avoid drift.
- Received equals queued, in progress and completed orders. Workers never exceed
  their configured count. A backlog can recover when capacity exceeds demand.
- Demand/resource changes and view switches preserve existing work.
- Demand stays between 1 and 20/min; at most four cooks and three ovens.
- Pause updates immediately and freezes the clock. Restart resets model and
  controls, including after pause or a view switch.
- At capacity, all explanations say there is no spare throughput for old work.
- Software-view health and bottleneck explanations match the displayed stages.
- Dialog padding stays interactive; only a true backdrop click dismisses it.

`.github/workflows/pizza-demo-checks.yml` runs this check on pushes and PRs. This
is a check, not branch protection or deployment approval. Existing repository
permissions still govern merge and deployment.

## Browser QA before requesting review

Open `docs/index.html` directly or run `python3 -m http.server 8000 --directory docs`.
Verify the actual page, not just the test runner:

1. Initial state: no errors, Start visible, Pause disabled, six stations readable.
2. Start, increase demand, add resources and change demand. Values update without
   resetting elapsed time or losing orders. Test the resource and demand caps.
3. Pause and resume, then Pause → Restart → Start. The button must say Pause
   while running, and the live activity must say paused while stopped.
4. Switch both views while running and paused. Counts stay the same; the software
   analogy is clearly labeled as simplified, not a claim about real DB scaling.
5. Open the explanation. Click its padding, Close, the backdrop, and Escape.
   Reopen it repeatedly. Keyboard focus should return to the opener after Close
   or Escape, without navigation or URL/history changes.
6. Expand the metrics. Compare demand with capacity for below, equal and above
   capacity. Lower demand after the surge and confirm the lesson is not claiming
   a queue is growing when the system has spare capacity.
7. Check desktop and narrow layouts, keyboard controls and visible focus. Use
   Back/Forward after leaving the page to check the browser's restored state.

Record passed, failed and not-run checks separately. The Node check cannot prove
layout, focus restoration, native dialog behavior or cross-browser compatibility.
The Next.js lint/build/typecheck/Jest commands are separate checks for its app;
they are not a substitute for this standalone demo's tests.

## Review method

This lightweight workflow applies the useful parts of [Whitemon's harness,
loop and graph article](https://x.com/0xWhitemon/status/2119430401701621865): a short
project map, explicit acceptance criteria, failures reproduced before fixes,
deterministic checks and an independent review. Keep the implementation a simple
loop of reproduce → fix → verify. No agent framework is needed in the product.
