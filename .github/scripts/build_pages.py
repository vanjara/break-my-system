"""Build GitHub Pages with previews for open same-repository pull requests.

The production site comes from main/docs. PR HTML is copied as static data;
nothing from a pull request is executed on the Actions runner.
"""
import base64
import json
import os
from pathlib import Path
import shutil
from urllib.error import HTTPError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
SITE = ROOT / "_site"
REPO = os.environ["GITHUB_REPOSITORY"]
TOKEN = os.environ["GITHUB_TOKEN"]
API = "https://api.github.com"


def get_json(path):
    req = Request(
        API + path,
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": "Bearer " + TOKEN,
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "break-my-system-pages-preview",
        },
    )
    with urlopen(req, timeout=30) as response:
        return json.load(response)


shutil.copytree(ROOT / "docs", SITE, dirs_exist_ok=True)
# GitHub Pages serves this directory as a site, not a Jekyll project.
(SITE / ".nojekyll").touch()
index = ["<h1>Open PR previews</h1>", "<p>Previews are unmerged code and may be broken.</p>", "<ul>"]
page = 1
while True:
    pulls = get_json(f"/repos/{REPO}/pulls?state=open&per_page=100&page={page}")
    if not pulls:
        break
    for pull in pulls:
        # Never publish content from untrusted forked PRs on our site's origin.
        if pull["head"]["repo"] is None or pull["head"]["repo"]["full_name"] != REPO:
            continue
        number = pull["number"]
        try:
            # Pin to the PR's exact head SHA so the preview is reproducible.
            contents = get_json(
                f"/repos/{REPO}/contents/docs/index.html?ref={pull['head']['sha']}"
            )
        except HTTPError as exc:
            if exc.code == 404:
                continue  # Not a UI PR.
            raise
        if contents.get("type") != "file":
            continue
        html = base64.b64decode(contents["content"]).decode("utf-8")
        destination = SITE / "previews" / f"pr-{number}"
        destination.mkdir(parents=True, exist_ok=True)
        (destination / "index.html").write_text(html, encoding="utf-8")
        index.append(f'<li><a href="pr-{number}/">PR #{number}</a></li>')
    page += 1

index.append("</ul>")
preview_root = SITE / "previews"
preview_root.mkdir(parents=True, exist_ok=True)
(preview_root / "index.html").write_text(
    "<!doctype html><html lang='en'><meta charset='utf-8'>"
    "<title>Break My System PR previews</title>"
    "<body style='font-family:system-ui;padding:2rem'>"
    + "\n".join(index)
    + "</body></html>",
    encoding="utf-8",
)
print("Built Pages output in", SITE)
