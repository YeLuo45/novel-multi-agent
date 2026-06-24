# novel-multi-agent

中文说明见 `README.zh-CN.md`。

A Flue-inspired multi-agent fiction writing scaffold that can create a story from a theme, continue from existing chapters, inspect exported writing artifacts, and catalog saved projects. V7 adds an artifact catalog contract for stable project indexing across CLI and future Web surfaces.

## Quick Start

```bash
npm install --include=dev --ignore-scripts --no-audit --no-fund
npm run check
npm test
npm run build
npm run coverage:incremental
npm run verify:readme
npm run bootstrap
```

## Web Workbench

Open `apps/web/index.html` in a browser. It runs fully locally and can create a theme artifact, continue from pasted chapters, score foreshadowing, preview the JSON payload, and download the artifact.

## CLI

```bash
npm run cli -- new "月球图书馆的守夜人与失忆AI" --chapters 3 --words 900
npm run cli -- continue examples/existing-chapters.md --words 900
npm run cli -- provider-smoke "写一段章节开头"
npm run cli -- provider-doctor
npm run cli -- artifact-inspect .novel-ma/projects/<project-id>/artifact.json
npm run cli -- artifact-catalog .novel-ma/projects
npm run cli -- artifact-catalog .novel-ma/projects --enrich
npm run cli -- artifact-latest .novel-ma/projects
npm run cli -- artifact-search .novel-ma/projects 月球
npm run cli -- artifact-search .novel-ma/projects 月球 --latest-only
npm run cli -- artifact-version-tree .novel-ma/projects/<project-id>/artifact.json
npm run cli -- artifact-diff .novel-ma/projects/<left>/artifact.json .novel-ma/projects/<right>/artifact.json --format text
npm run cli -- artifact-prune .novel-ma/projects --keep 1
```

## GitHub Pages

`.github/workflows/pages.yml` deploys the zero-dependency web workbench from `apps/web`. Enable Pages in workflow mode, then push or run the workflow manually.
