# aioengine

AI change control for developers using Claude Code, Cursor, Codex, Copilot, and MCP tools.

aioengine helps you review AI-generated code before you trust it. It scans your repo for missing guardrails, checks changed files for risky edits, and flags when AI may have wandered outside the requested task.

## Commands

```bash
aioengine init
aioengine check
aioengine scope "add init command"
aioengine review
aioengine rules
```

## Why aioengine exists

AI coding tools can move fast, but review becomes the bottleneck.

A simple prompt can lead to unexpected changes in sensitive files like auth, billing, database migrations, environment config, deployment settings, or dependency files.

aioengine helps answer:

- Did AI touch sensitive files?
- Did AI change files outside the task?
- Did AI add or modify dependencies?
- Does this repo have AI coding rules?
- What should I review before committing?

## `aioengine init`

Sets up aioengine in your repo.

Creates:

```txt
.aioengine/config.json
CLAUDE.md
.cursor/rules/aioengine.mdc
```

Run:

```bash
aioengine init
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
aioengine check
```

## `aioengine scope`

Checks whether changed files match the task you gave your AI coding tool.

Example:

```bash
aioengine scope "update landing page headline"
```

If the task sounds like a UI change but AI modified billing, database, env, dependency, or deployment files, aioengine will flag possible scope drift.

## `aioengine review`

Reviews current uncommitted changes for risky files.

Run:

```bash
aioengine review
```

aioengine will flag changes to files that often deserve extra review, such as:

- env files
- auth files
- billing files
- database files
- deployment config
- dependency files
- GitHub workflow files

## `aioengine rules`

Generates starter AI coding rules for Claude Code and Cursor.

Run:

```bash
aioengine rules
```

This creates or skips:

```txt
CLAUDE.md
.cursor/rules/aioengine.mdc
```

## Example workflow

```bash
aioengine init
aioengine check

# Ask Claude, Cursor, Codex, or another AI coding tool to make a change.

aioengine scope "update landing page headline"
aioengine review
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