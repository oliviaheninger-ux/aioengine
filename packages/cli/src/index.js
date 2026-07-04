#!/usr/bin/env node

import { Command } from "commander";
import pc from "picocolors";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const program = new Command();

program
  .name("aioengine")
  .description("AI change control for developers using AI coding tools.")
  .version("0.1.0");

program
  .command("check")
  .description("Scan your repo for AI coding setup risks.")
  .action(() => {
    runCheck();
  });

program
  .command("review")
  .description("Review current Git changes for risky AI-generated edits.")
  .action(() => {
    runReview();
  });

  program
  .command("scope")
  .description("Check whether changed files match the requested task.")
  .argument("[task...]", "The task you asked the AI coding tool to do")
  .action((taskParts = []) => {
    const task = Array.isArray(taskParts) ? taskParts.join(" ") : "";
    runScope(task);
  });

program
  .command("rules")
  .description("Generate starter AI coding rules for this repo.")
  .action(() => {
    runRules();
  });

program.parse();

function runCheck() {
  const cwd = process.cwd();

  const critical = [];
  const warnings = [];
  const passed = [];

  printHeader("aioengine Check");

  const hasGit = exists(".git");
  const hasPackageJson = exists("package.json");
  const hasGitignore = exists(".gitignore");
  const hasClaude = exists("CLAUDE.md");
  const hasCursorRules = exists(".cursor/rules") || exists(".cursorrules");
  const envFiles = findFiles([
    ".env",
    ".env.local",
    ".env.production",
    ".env.development",
  ]);
  const mcpFiles = findFiles([".mcp.json", "mcp.json"]);
  const hasGithubActions = exists(".github/workflows");
  const hasTests =
    exists("__tests__") ||
    exists("tests") ||
    exists("test") ||
    packageScriptIncludes("test");

  if (hasGit) passed.push("Git repo detected");
  else warnings.push("No .git folder detected. aioengine works best inside a Git repo.");

  if (hasPackageJson) passed.push("package.json detected");
  else warnings.push("No package.json detected. Some checks may be limited.");

  if (hasGitignore) {
    passed.push(".gitignore detected");

    const gitignore = read(".gitignore");
    if (!gitignore.includes(".env")) {
      critical.push(".gitignore does not appear to include .env patterns.");
    }
  } else {
    critical.push("Missing .gitignore. Env files and generated files may be accidentally committed.");
  }

  if (envFiles.length > 0) {
    critical.push(
      `Env files detected at repo root: ${envFiles.join(", ")}. AI coding tools may be able to read sensitive local config.`
    );
  } else {
    passed.push("No common env files detected at repo root");
  }

  if (hasClaude) passed.push("CLAUDE.md detected");
  else warnings.push("No CLAUDE.md found. Claude Code may not have repo-specific boundaries.");

  if (hasCursorRules) passed.push("Cursor rules detected");
  else warnings.push("No Cursor rules detected. Cursor may not have project-specific boundaries.");

  if (mcpFiles.length > 0) {
    warnings.push(`MCP config detected: ${mcpFiles.join(", ")}. Review tool access carefully.`);
  } else {
    passed.push("No root MCP config detected");
  }

  if (hasGithubActions) passed.push("GitHub Actions detected");
  else warnings.push("No GitHub Actions folder detected. PR checks may not be configured yet.");

  if (hasTests) passed.push("Tests detected");
  else warnings.push("No obvious tests detected. AI-generated changes may be harder to verify.");

  const score = calculateScore(critical.length, warnings.length, passed.length);

  console.log(`${pc.bold("Project:")} ${cwd}`);
  console.log(`${pc.bold("AI coding setup score:")} ${formatScore(score)}\n`);

  printSection("Critical", critical, "red");
  printSection("Warnings", warnings, "yellow");
  printSection("Passed", passed, "green");

  console.log(pc.bold("Recommended next step:"));

  if (!hasClaude || !hasCursorRules) {
    console.log(`  Run ${pc.cyan("aioengine rules")} to generate starter AI coding rules.`);
  } else {
    console.log(`  Run ${pc.cyan("aioengine review")} before committing AI-generated changes.`);
  }
}

function runReview() {
  printHeader("aioengine Review");

  if (!exists(".git")) {
    console.log(pc.red("This command must be run inside a Git repo."));
    return;
  }

  let diff = "";

  try {
    diff = execSync("git diff --name-only", { encoding: "utf8" }).trim();
  } catch {
    console.log(pc.red("Could not read Git diff."));
    return;
  }

  if (!diff) {
    console.log(pc.green("No uncommitted changes found."));
    return;
  }

  const files = diff.split("\n").filter(Boolean);
  const riskyFiles = files.filter(isRiskyFile);
  const reviewItems = [];

  if (files.length > 12) {
    reviewItems.push(`Large change set detected: ${files.length} files changed.`);
  }

  if (riskyFiles.length > 0) {
    reviewItems.push(`High-risk files changed: ${riskyFiles.join(", ")}`);
  }

  const packageChanged = files.some((file) =>
    ["package.json", "package-lock.json", "pnpm-lock.yaml", "yarn.lock"].includes(file)
  );

  if (packageChanged) {
    reviewItems.push("Package/dependency files changed. Review for unexpected dependency additions.");
  }

  console.log(`${pc.bold("Changed files:")} ${files.length}\n`);

  files.forEach((file) => {
    const marker = isRiskyFile(file) ? pc.red("✗") : pc.green("✓");
    console.log(`  ${marker} ${file}`);
  });

  console.log("");

  if (reviewItems.length === 0) {
    console.log(pc.green("No obvious high-risk changes detected."));
  } else {
    printSection("Review recommended", reviewItems, "yellow");
  }
}

function runScope(task) {
  printHeader("aioengine Scope");

  if (!exists(".git")) {
    console.log(pc.red("This command must be run inside a Git repo."));
    return;
  }

  const files = getChangedFiles();

  if (files.length === 0) {
    console.log(pc.green("No uncommitted changes found."));
    return;
  }

  const cleanTask = task.trim();

  if (!cleanTask) {
    console.log(pc.yellow("No task description provided."));
    console.log("");
    console.log("Try:");
    console.log(`  ${pc.cyan('aioengine scope "fix pricing page layout"')}`);
    console.log("");
  }

  const profile = inferTaskProfile(cleanTask);
  const outOfScopeFiles = files.filter((file) =>
    isProbablyOutOfScope(file, profile)
  );
  const riskyFiles = files.filter(isRiskyFile);

  const reviewItems = [];

  if (cleanTask) {
    console.log(`${pc.bold("Task:")} ${cleanTask}`);
  }

  console.log(`${pc.bold("Detected task type:")} ${profile.label}`);
  console.log(`${pc.bold("Changed files:")} ${files.length}\n`);

  files.forEach((file) => {
    const outOfScope = outOfScopeFiles.includes(file);
    const risky = riskyFiles.includes(file);

    let marker = pc.green("✓");
    let note = pc.dim("in scope");

    if (outOfScope) {
      marker = pc.red("✗");
      note = pc.red("possible scope drift");
    } else if (risky) {
      marker = pc.yellow("!");
      note = pc.yellow("review carefully");
    }

    console.log(`  ${marker} ${file} ${pc.dim("—")} ${note}`);
  });

  if (outOfScopeFiles.length > 0) {
    reviewItems.push(
      `Possible out-of-scope files changed: ${outOfScopeFiles.join(", ")}`
    );
  }

  if (riskyFiles.length > 0) {
    reviewItems.push(`High-risk files changed: ${riskyFiles.join(", ")}`);
  }

  if (files.length > 12) {
    reviewItems.push(
      `Large change set detected: ${files.length} files changed. AI may have touched more than needed.`
    );
  }

  console.log("");

  if (reviewItems.length === 0) {
    console.log(pc.green("No obvious scope drift detected."));
    console.log("");
    console.log(
      pc.dim("Still review the diff normally before committing AI-generated code.")
    );
    return;
  }

  printSection("Scope review recommended", reviewItems, "yellow");

  console.log(pc.bold("Recommendation:"));

  if (outOfScopeFiles.length > 0) {
    console.log(
      `  ${pc.red("Do not commit yet.")} Review the out-of-scope files and revert anything unrelated to the task.`
    );
  } else {
    console.log(
      `  ${pc.yellow("Review carefully.")} These changes may be valid, but they touch sensitive areas.`
    );
  }
}

function runRules() {
  printHeader("aioengine Rules");

  const claudePath = "CLAUDE.md";
  const cursorDir = ".cursor/rules";
  const cursorPath = path.join(cursorDir, "aioengine.mdc");

  const claudeContent = `# AI Coding Rules

This project uses AI-assisted development. Follow these rules carefully.

## Before changing code

- Understand the requested task before editing files.
- Keep changes narrow and directly related to the task.
- Do not modify auth, billing, database, env, deployment, or security files unless explicitly asked.
- Do not add new dependencies unless clearly necessary.
- Do not delete files without explaining why.

## High-risk areas

Changes to these areas require extra human review:

- Authentication and session logic
- Billing and payment code
- Database migrations and RLS policies
- Environment variables and config files
- Deployment settings
- GitHub Actions and CI
- Middleware and API routes
- Package/dependency files

## Testing

When making code changes:

- Run relevant tests when possible.
- Mention any tests that were not run.
- Keep the final summary specific and honest.

## Scope

If the task is UI-only, do not edit backend, database, billing, auth, or deployment files.
`;

  const cursorContent = `---
description: AI coding safety rules generated by aioengine
alwaysApply: true
---

Keep changes narrow and task-focused.

Do not modify auth, billing, database, environment, deployment, dependency, or security files unless explicitly requested.

Flag high-risk changes for human review.

Do not add dependencies without a clear reason.

For UI-only tasks, avoid backend, API, database, and config changes.
`;

  if (!exists(claudePath)) {
    fs.writeFileSync(claudePath, claudeContent);
    console.log(pc.green(`Created ${claudePath}`));
  } else {
    console.log(pc.yellow(`${claudePath} already exists. Skipped.`));
  }

  if (!exists(cursorDir)) {
    fs.mkdirSync(cursorDir, { recursive: true });
  }

  if (!exists(cursorPath)) {
    fs.writeFileSync(cursorPath, cursorContent);
    console.log(pc.green(`Created ${cursorPath}`));
  } else {
    console.log(pc.yellow(`${cursorPath} already exists. Skipped.`));
  }

  console.log("");
  console.log(pc.bold("Next step:"));
  console.log(`  Run ${pc.cyan("aioengine check")} again.`);
}

function getChangedFiles() {
  try {
    const diff = execSync("git diff --name-only", { encoding: "utf8" }).trim();

    if (!diff) {
      return [];
    }

    return diff.split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function inferTaskProfile(task) {
  const lower = task.toLowerCase();

  const profiles = [
    {
      id: "ui",
      label: "UI / frontend task",
      keywords: [
        "ui",
        "layout",
        "style",
        "design",
        "button",
        "card",
        "page",
        "copy",
        "text",
        "color",
        "colour",
        "spacing",
        "responsive",
        "navbar",
        "footer",
        "hero",
        "landing",
        "pricing",
      ],
      allowed: [
        "app/",
        "pages/",
        "components/",
        "styles/",
        "public/",
        "src/app/",
        "src/components/",
        "src/styles/",
        ".css",
        ".tsx",
        ".jsx",
      ],
      sensitive: [
        "api/",
        "auth",
        "session",
        "stripe",
        "billing",
        "payment",
        "supabase",
        "migration",
        "schema",
        "rls",
        ".env",
        "package.json",
        "package-lock.json",
        "middleware",
        ".github/workflows",
        "next.config",
        "vercel",
      ],
    },
    {
      id: "docs",
      label: "Docs / copy task",
      keywords: [
        "docs",
        "readme",
        "copy",
        "text",
        "wording",
        "content",
        "landing page copy",
        "headline",
        "description",
      ],
      allowed: [".md", "readme", "app/", "src/app/", "components/", "src/components/"],
      sensitive: [
        "api/",
        "auth",
        "stripe",
        "billing",
        "payment",
        "supabase",
        "migration",
        ".env",
        "package.json",
        "middleware",
      ],
    },
    {
      id: "backend",
      label: "Backend / API task",
      keywords: [
        "api",
        "route",
        "server",
        "backend",
        "database",
        "supabase",
        "webhook",
        "stripe",
        "auth",
        "login",
        "billing",
      ],
      allowed: [
        "api/",
        "server",
        "lib/",
        "src/lib/",
        "supabase",
        "schema",
        "migration",
        "middleware",
        "package.json",
      ],
      sensitive: [".env", "billing", "payment", "stripe", "auth", "rls", "migration"],
    },
  ];

  const matched = profiles.find((profile) =>
    profile.keywords.some((keyword) => lower.includes(keyword))
  );

  return (
    matched ?? {
      id: "unknown",
      label: "Unknown / general task",
      keywords: [],
      allowed: [],
      sensitive: [
        ".env",
        "auth",
        "session",
        "stripe",
        "billing",
        "payment",
        "supabase",
        "migration",
        "schema",
        "rls",
        "middleware",
        "package.json",
        "package-lock.json",
        ".github/workflows",
      ],
    }
  );
}

function isProbablyOutOfScope(file, profile) {
  const lower = file.toLowerCase();

  if (profile.id === "unknown") {
    return false;
  }

  const touchesSensitiveArea = profile.sensitive.some((pattern) =>
    lower.includes(pattern)
  );

  if (!touchesSensitiveArea) {
    return false;
  }

  const explicitlyAllowed = profile.allowed.some((pattern) =>
    lower.includes(pattern)
  );

  return !explicitlyAllowed;
}

function exists(relativePath) {
  return fs.existsSync(path.join(process.cwd(), relativePath));
}

function read(relativePath) {
  try {
    return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
  } catch {
    return "";
  }
}

function findFiles(files) {
  return files.filter((file) => exists(file));
}

function packageScriptIncludes(scriptName) {
  try {
    const pkg = JSON.parse(read("package.json"));
    return Boolean(pkg.scripts?.[scriptName]);
  } catch {
    return false;
  }
}

function isRiskyFile(file) {
  const riskyPatterns = [
    ".env",
    "auth",
    "session",
    "middleware",
    "stripe",
    "billing",
    "payment",
    "supabase",
    "migration",
    "schema",
    "rls",
    "vercel",
    "netlify",
    "docker",
    "package.json",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    ".github/workflows",
  ];

  const lower = file.toLowerCase();
  return riskyPatterns.some((pattern) => lower.includes(pattern));
}

function calculateScore(criticalCount, warningCount, passedCount) {
  const raw = 100 - criticalCount * 18 - warningCount * 7 + Math.min(passedCount * 2, 10);
  return Math.max(0, Math.min(100, raw));
}

function formatScore(score) {
  if (score >= 80) return pc.green(`${score}/100`);
  if (score >= 60) return pc.yellow(`${score}/100`);
  return pc.red(`${score}/100`);
}

function printHeader(title) {
  console.log("");
  console.log(pc.bold(pc.cyan(title)));
  console.log(pc.dim("AI change control for developers"));
  console.log("");
}

function printSection(title, items, color) {
  if (items.length === 0) return;

  const colorFn = color === "red" ? pc.red : color === "yellow" ? pc.yellow : pc.green;
  const icon = color === "red" ? "✗" : color === "yellow" ? "!" : "✓";

  console.log(pc.bold(colorFn(title)));

  items.forEach((item) => {
    console.log(`  ${colorFn(icon)} ${item}`);
  });

  console.log("");
}