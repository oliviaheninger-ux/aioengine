# aioengine

AI change control for developers using Claude Code, Cursor, Codex, Copilot, and MCP tools.

aioengine helps you review AI-generated code before you trust it. It scans your repo for missing guardrails, saves repo snapshots, checks changed files for risky edits, flags when AI may have wandered outside the requested task, and can comment directly on GitHub pull requests with a change-control report.

## Quick start

Run a local setup check:

```bash
npx aioengine@latest check
```

Set up local guardrails and GitHub pull request comments:

```bash
npx aioengine@latest init --github
```

Save a repo snapshot before AI changes code:

```bash
npx aioengine@latest snapshot
```

After your AI coding tool makes changes, check whether the changes stayed in scope:

```bash
npx aioengine@latest scope "update landing page headline" --profile ui
```

Then review risky files before committing:

```bash
npx aioengine@latest review
```

Open a pull request. aioengine will run in GitHub Actions and comment directly on the PR with a change-control report.

## Commands

```bash
npx aioengine@latest check
npx aioengine@latest init
npx aioengine@latest init --github
npx aioengine@latest snapshot
npx aioengine@latest snapshot --name before-ai-edit
npx aioengine@latest scope "update landing page headline"
npx aioengine@latest scope "update landing page headline" --profile ui
npx aioengine@latest review
npx aioengine@latest ci
npx aioengine@latest ci --profile ci
npx aioengine@latest ci --report aioengine-report.md
npx aioengine@latest rules
```

## Why aioengine exists

AI coding tools can move fast, but review becomes the bottleneck.

A simple prompt can lead to unexpected changes in sensitive files like auth, billing, database migrations, environment config, deployment settings, dependency files, or CI workflows.

aioengine helps answer:

- Did AI touch sensitive files?
- Did AI change files outside the task?
- Did AI add or modify dependencies?
- Does this repo have AI coding rules?
- What changed since the last repo snapshot?
- What should I review before committing or merging?

## `aioengine check`

Scans your repo for AI coding setup risks.

Run:

```bash
npx aioengine@latest check
```

Checks for:

- Git repo
- `package.json`
- `.aioengine/config.json`
- `.gitignore`
- env files
- Claude rules
- Cursor rules
- MCP config
- GitHub Actions
- tests

## `aioengine init`

Sets up aioengine in your repo.

Run:

```bash
npx aioengine@latest init
```

Creates missing files only:

```txt
.aioengine/config.json
CLAUDE.md
.cursor/rules/aioengine.mdc
```

aioengine will not overwrite an existing `CLAUDE.md`.

If `CLAUDE.md` already exists, aioengine leaves it untouched and saves suggested rules to:

```txt
.aioengine/suggested-claude-rules.md
```

## `aioengine init --github`

Sets up aioengine local guardrails and a GitHub Actions workflow for PR checks.

Run:

```bash
npx aioengine@latest init --github
```

Creates missing files only:

```txt
.aioengine/config.json
CLAUDE.md
.cursor/rules/aioengine.mdc
.github/workflows/aioengine.yml
```

The generated workflow runs aioengine on pull requests, writes a Markdown report, uploads the report as an artifact, and comments directly on the PR.

aioengine will not overwrite an existing:

```txt
.github/workflows/aioengine.yml
```

## GitHub pull request comments

When you run:

```bash
npx aioengine@latest init --github
```

aioengine creates a GitHub Actions workflow. On pull requests, aioengine runs automatically and comments directly on the PR with a change-control report.

Example passing report:

```md
# aioengine CI Report

**Status:** Passed
**Environment:** GitHub Actions
**Task:** Update landing page headline
**Detected task type:** UI / frontend task

## Summary

- Changed files: 1
- Possible scope drift: 0
- Risky files: 0

## Changed files

- [OK] `src/app/page.tsx`

## Recommendation

No obvious AI change-control issues were detected.
```

Example scope drift report:

```md
# aioengine CI Report

**Status:** Review required
**Environment:** GitHub Actions
**Task:** Update landing page headline
**Detected task type:** UI / frontend task

## Summary

- Changed files: 2
- Possible scope drift: 1
- Risky files: 1

## Changed files

- [OK] `src/app/page.tsx`
- [SCOPE DRIFT] `supabase/migrations/add-policy.sql` — possible scope drift

## Recommendation

Review these changes before merging. aioengine detected possible scope drift.
```

By default:

- possible scope drift fails the CI check
- risky files warn but do not fail the CI check
- a Markdown report is uploaded as a workflow artifact
- the same report is posted as a PR comment

## Scope profiles

aioengine can automatically guess the task type from your task description, but you can also set it manually.

Use `--profile` when you already know what kind of change AI was supposed to make:

```bash
npx aioengine@latest scope "update landing page headline" --profile ui
npx aioengine@latest scope "update README docs" --profile docs
npx aioengine@latest scope "add CLI command" --profile cli
npx aioengine@latest scope "update GitHub Actions workflow" --profile ci
npx aioengine@latest scope "add API route" --profile backend
```

Available profiles:

```txt
ui
docs
cli
ci
backend
```

Profiles help aioengine judge whether changed files make sense for the task.

For example, this command tells aioengine the expected change is frontend/UI work:

```bash
npx aioengine@latest scope "update dashboard header" --profile ui
```

If AI also changed database migrations, billing files, or GitHub workflows, aioengine can flag those files as possible scope drift.

## `aioengine snapshot`

Saves a repo snapshot with Git HEAD, tracked file hashes, and key project context.

Run:

```bash
npx aioengine@latest snapshot
```

Creates:

```txt
.aioengine/snapshots/latest.json
```

You can also name a snapshot:

```bash
npx aioengine@latest snapshot --name before-ai-edit
```

Creates:

```txt
.aioengine/snapshots/before-ai-edit.json
```

Snapshots include:

- Git HEAD
- current branch
- dirty working tree status
- tracked file hashes
- `package.json` context
- guardrail file status
- GitHub workflow context
- lockfile status

Snapshot JSON files are ignored by default so they do not get committed accidentally.

Use snapshots before letting AI make larger changes, so you have a clean record of the repo state before the edit.

## `aioengine scope`

Checks whether changed files match the task you gave your AI coding tool.

Run:

```bash
npx aioengine@latest scope "update landing page headline"
```

Or manually set the expected profile:

```bash
npx aioengine@latest scope "update landing page headline" --profile ui
```

If the task sounds like a UI change but AI modified billing, database, env, dependency, CLI, or deployment files, aioengine will flag possible scope drift.

## `aioengine review`

Reviews current uncommitted changes for risky files.

Run:

```bash
npx aioengine@latest review
```

aioengine will flag changes to files that often deserve extra review, such as:

- env files
- auth files
- billing files
- database files
- deployment config
- dependency files
- GitHub workflow files

## `aioengine ci`

Runs aioengine checks in CI or pull request workflows.

Run:

```bash
npx aioengine@latest ci
```

Or pass a task manually:

```bash
npx aioengine@latest ci --task "update landing page headline"
```

Use a manual profile:

```bash
npx aioengine@latest ci --task "update GitHub Actions workflow" --profile ci
```

Write a Markdown report:

```bash
npx aioengine@latest ci --report aioengine-report.md
```

In GitHub Actions, aioengine tries to detect the task from the pull request title, event payload, or `AIOENGINE_TASK`.

## Example GitHub Actions workflow

`aioengine init --github` can create this automatically:

```yaml
name: aioengine

on:
  pull_request:
    types: [opened, synchronize, reopened, edited]
  workflow_dispatch:

permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:
  ai-change-control:
    name: AI change control
    runs-on: ubuntu-latest

    steps:
      - name: Check out repository
        uses: actions/checkout@v6
        with:
          fetch-depth: 0

      - name: Set up Node
        uses: actions/setup-node@v6
        with:
          node-version: 24
          package-manager-cache: false

      - name: Run aioengine
        run: npx aioengine@latest ci --report aioengine-report.md

      - name: Comment aioengine report on PR
        if: always() && github.event_name == 'pull_request'
        env:
          GH_TOKEN: ${{ github.token }}
          PR_NUMBER: ${{ github.event.pull_request.number }}
          REPO: ${{ github.repository }}
        run: gh pr comment "$PR_NUMBER" --repo "$REPO" --body-file aioengine-report.md --edit-last --create-if-none

      - name: Upload aioengine report
        if: always()
        uses: actions/upload-artifact@v6
        with:
          name: aioengine-report
          path: aioengine-report.md
```

## `aioengine rules`

Generates starter AI coding rules for Claude Code and Cursor.

Run:

```bash
npx aioengine@latest rules
```

Creates missing files only. aioengine will not overwrite an existing `CLAUDE.md`.

If `CLAUDE.md` already exists, suggested Claude rules are saved to:

```txt
.aioengine/suggested-claude-rules.md
```

This command creates or skips:

```txt
CLAUDE.md
.cursor/rules/aioengine.mdc
.aioengine/suggested-claude-rules.md
```

## Example workflow

```bash
npx aioengine@latest init --github
npx aioengine@latest check

# Save the current repo state before AI edits.
npx aioengine@latest snapshot --name before-ai-edit

# Ask Claude, Cursor, Codex, Copilot, or another AI coding tool to make a change.

# Check whether the changed files match the task.
npx aioengine@latest scope "update landing page headline" --profile ui

# Review risky files before committing.
npx aioengine@latest review

# Open a pull request.
# aioengine will run in GitHub Actions and comment with a report.
```

## Security notes

aioengine is read-only by default.

It does not:

- run AI-generated shell commands
- start a local server
- connect to a CRM
- expose localhost ports
- collect code or secrets
- upload your source code to an aioengine server

Snapshots are saved locally inside your repo under:

```txt
.aioengine/snapshots/
```

Snapshot files contain file hashes and project context, not full source code contents.

The generated GitHub workflow uses limited permissions so it can read the repository, run the check, upload a report artifact, and comment on pull requests.

## Early feedback

aioengine is early. If you try it in a real repo, feedback is very welcome.

Open an issue with:

- what AI coding tool you use
- whether setup was clear
- what aioengine flagged correctly
- what aioengine flagged incorrectly
- what felt confusing or missing

## Current status

aioengine is in early development.

The first goal is simple: help AI-assisted developers catch risky or out-of-scope changes before committing or merging code.

Future goals include:

- better risk detection
- snapshot comparison
- prettier local reports
- custom rules
- saved reports
- team policies
- dashboard history
- paid CI features

## License

UNLICENSED