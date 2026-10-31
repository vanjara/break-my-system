# GitHub Pages demo

This folder contains a standalone, browser-only prototype of the guided pizza restaurant lesson.

## Why a separate demo?

The existing repository contains a Next.js application with server-side features. GitHub Pages serves static files and cannot run those server-side features. To avoid replacing or breaking the existing application, this first experiment lives at `docs/index.html`.

## Try it locally

Open `docs/index.html` in a browser. No installation, database, API key, or build step is required.

## Publish with GitHub Pages

After merging the pull request, open **Repository Settings → Pages** and choose **Deploy from a branch**, branch **main**, folder **/docs**, then Save. GitHub Pages availability depends on the repository's visibility and plan; the repository is currently private. If Pages isn't offered for this repository, change its visibility only after reviewing the existing code for secrets and confirming you want it public, or use another static host.

When Pages is enabled, the expected address is `https://vanjara.github.io/break-my-system/`.

## Learning flow

1. Start one cook and one oven at 3 orders/minute.
2. Increase demand to 10 orders/minute.
3. Hire a cook or add an oven.
4. Observe the queue and explain why the bottleneck changes.
5. Continue improving without resetting orders.
6. Switch to the equivalent software view.

## Scope and tradeoffs

- One readable HTML file with embedded CSS and JavaScript, intentionally avoiding a build system.
- One deterministic, simplified simulation shared by both views.
- No AI, backend, database, user accounts, or external dependencies.
- Existing Next.js application is unchanged.
- The current visual is a flow with changing counts, not animated customers.
- Timing uses a one-second simulation step; this is not a production queueing model.

## Next step

Have a new learner try the experiment. Record what is confusing before adding animations or architecture.
