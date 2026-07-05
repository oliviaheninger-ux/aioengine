# aioengine

AI change control for developers using Claude Code, Cursor, Codex, Copilot, and MCP tools.

aioengine helps you review AI-generated code before you trust it. It scans your repo for missing guardrails, checks changed files for risky edits, and flags when AI may have wandered outside the requested task.

## Quick start

Run aioengine in any JavaScript or TypeScript project:

```bash
npx aioengine check
```

Then set up AI coding guardrails:

```bash
npx aioengine init
```

After your AI coding tool makes changes, review them before committing:

```bash
npx aioengine scope "update landing page headline"
npx aioengine review
```

In CI or pull request workflows:

```bash
npx aioengine ci --task "update landing page headline"
```

## Commands

```bash
npx aioengine init
npx aioengine check
npx aioengine scope "add init command"
npx aioengine review
npx aioengine ci --task "add init command"
npx aioengine rules
```

## Why aioengine exists

AI coding tools can move fast, but review becomes the bottleneck.

A simple prompt can lead to unexpected changes in sensitive files like auth, billing, database migrations, environment config, deployment settings, dependency files, or CI workflows.

aioengine helps answer:

- Did AI touch sensitive files?
- Did AI change files outside the task?
- Did AI add or modify dependencies?
- Does this repo have AI coding rules?
- What should I review before committing or merging?

## `aioengine init`

Sets up aioengine in your repo.

Creates missing files only. aioengine will not overwrite an existing `CLAUDE.md`.

Creates:

```txt
.aioengine/config.json
CLAUDE.md
.cursor/rules/aioengine.mdc
```

If `CLAUDE.md` already exists, aioengine leaves it untouched and saves suggested rules to:

```txt
.aioengine/suggested-claude-rules.md
```

Run:

```bash
npx aioengine init
```

## `aioengine check`

Scans your repo for AI coding setup risks.

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

Run:

```bash
npx aioengine check
```

## `aioengine scope`

Checks whether changed files match the task you gave your AI coding tool.

Example:

```bash
npx aioengine scope "update landing page headline"
```

If the task sounds like a UI change but AI modified billing, database, env, dependency, CLI, or deployment files, aioengine will flag possible scope drift.

## `aioengine review`

Reviews current uncommitted changes for risky files.

Run:

```bash
npx aioengine review
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
npx aioengine ci --task "update landing page headline"
```

In GitHub Actions, aioengine will try to detect changed files from the pull request context. If a task is available from the PR title, event payload, or `AIOENGINE_TASK`, it can flag possible scope drift.

By default:

- possible scope drift fails the CI check
- risky files warn but do not fail the CI check

Example GitHub Actions step:

```yaml
- name: Run aioengine
  run: npx aioengine ci
```

For more reliable PR diffs, use checkout with full history:

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0

- name: Run aioengine
  run: npx aioengine ci
```

You can also pass a task manually:

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0

- name: Run aioengine
  run: npx aioengine ci --task "update landing page headline"
```

## `aioengine rules`

Generates starter AI coding rules for Claude Code and Cursor.

Run:

```bash
npx aioengine rules
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
npx aioengine init
npx aioengine check

# Ask Claude, Cursor, Codex, or another AI coding tool to make a change.

npx aioengine scope "update landing page headline"
npx aioengine review
npx aioengine ci --task "update landing page headline"
```

## Current status

aioengine is in early development.

The first goal is simple: help AI-assisted developers catch risky or out-of-scope changes before committing code.

Future goals include:

- better risk detection
- prettier local reports
- GitHub PR checks
- saved reports
- team rules
- paid CI features