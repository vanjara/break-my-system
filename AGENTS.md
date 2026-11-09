# Project map

The current MVP is the standalone pizza lesson in `docs/index.html`. Keep its
white/blue single-page dashboard, deterministic model and lack of dependencies.
The Next.js app in `app/`, `components/`, `lib/` and `prisma/` is a separate path;
do not change it for a Pages-demo task unless the request calls for that work.

- Run and scope: `docs/GITHUB_PAGES_DEMO.md`.
- Acceptance checks and browser QA: `docs/testing.md`.
- Deterministic regression suite: `tests/pizza-demo.test.cjs`.
- Existing Next.js setup and checks: `README.md` and `package.json`.
- Pages production/PR packaging: `.github/scripts/build_pages.py` and
  `.github/workflows/pages-previews.yml`.

Before a fix, define the expected behavior and reproduce the bug in a failing
test where possible. Run `npm run test:demo` after changing the inline script.
Tests execute the shipped script, not a copied simulation. For UI changes also
check the browser flows in `docs/testing.md`; a mocked DOM is not browser proof.

Keep changes bounded. Record the defect, expected versus observed behavior,
verification and any blocker in the PR. Seek an independent review for changes
to the simulation. If the same fix fails twice without new evidence, stop and
report the exact blocker rather than silently expanding the scope.

Use a branch and draft PR for review. Do not merge or deploy production changes
without the user's authorization. Do not add autonomous agents or a backend to
this browser-only lesson merely to support the development workflow.
