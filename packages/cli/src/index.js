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
  .command("init")
  .description("Set up aioengine for AI change control in this repo.")
  .action(() => {
    runInit();
  });

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

function runInit() {
  printHeader("aioengine Init");

  const root = getProjectRoot();
  const created = [];
  const skipped = [];

  const aioengineDir = ".aioengine";
  const configPath = path.join(aioengineDir, "config.json");
  const claudePath = "CLAUDE.md";
  const cursorDir = ".cursor/rules";
  const cursorPath = path.join(cursorDir, "aioengine.mdc");

  if (!isInsideGitRepo()) {
    console.log(
      pc.yellow(
        "Warning: aioengine works best inside a Git repo. Run this from your project folder."
      )
    );
    console.log("");
  }

  if (!exists(aioengineDir, root)) {
    fs.mkdirSync(path.join(root, aioengineDir), { recursive: true });
    created.push(aioengineDir);
  } else {
    skipped.push(aioengineDir);
  }

  if (!exists(configPath, root)) {
    fs.writeFileSync(
      path.join(root, configPath),
      JSON.stringify(getDefaultConfig(), null, 2)
    );
    created.push(configPath);
  } else {
    skipped.push(configPath);
  }

  if (!exists(claudePath, root)) {
    fs.writeFileSync(path.join(root, claudePath), getClaudeRules());
    created.push(claudePath);
  } else {
    skipped.push(claudePath);
  }

  if (!exists(cursorDir, root)) {
    fs.mkdirSync(path.join(root, cursorDir), { recursive: true });
  }

  if (!exists(cursorPath, root)) {
    fs.writeFileSync(path.join(root, cursorPath), getCursorRules());
    created.push(cursorPath);
  } else {
    skipped.push(cursorPath);
  }

  printSection("Created", created, "green");
  printSection("Skipped", skipped, "yellow");

  console.log(pc.bold("Next steps:"));
  console.log(`  1. Run ${pc.cyan("aioengine check")}`);
  console.log(`  2. Make or review AI-generated changes`);
  console.log(`  3. Run ${pc.cyan('aioengine scope "describe the task"')}`);
  console.log(`  4. Run ${pc.cyan("aioengine review")} before committing`);
}

function runCheck() {
  const root = getProjectRoot();

  const critical = [];
  const warnings = [];
  const passed = [];

  printHeader("aioengine Check");

  const hasGit = isInsideGitRepo();
  const hasPackageJson = exists("package.json", root);
  const hasGitignore = exists(".gitignore", root);
  const hasClaude = exists("CLAUDE.md", root);
  const hasCursorRules =
    exists(".cursor/rules", root) || exists(".cursorrules", root);
  const hasAioengineConfig = exists(".aioengine/config.json", root);
  const envFiles = findFiles(root, [
    ".env",
    ".env.local",
    ".env.production",
    ".env.development",
  ]);
  const mcpFiles = findFiles(root, [".mcp.json", "mcp.json"]);
  const hasGithubActions = exists(".github/workflows", root);
  const hasTests =
    exists("__tests__", root) ||
    exists("tests", root) ||
    exists("test", root) ||
    packageScriptIncludes(root, "test");

  if (hasGit) passed.push("Git repo detected");
  else warnings.push("No Git repo detected. aioengine works best inside a Git repo.");

  if (hasPackageJson) passed.push("package.json detected");
  else warnings.push("No package.json detected. Some checks may be limited.");

  if (hasAioengineConfig) passed.push(".aioengine/config.json detected");
  else warnings.push("No .aioengine/config.json found. Run aioengine init to create one.");

  if (hasGitignore) {
    passed.push(".gitignore detected");

    const gitignore = read(".gitignore", root);
    if (!gitignore.includes(".env")) {
      critical.push(".gitignore does not appear to include .env patterns.");
    }
  } else {
    critical.push(
      "Missing .gitignore. Env files and generated files may be accidentally committed."
    );
  }

  if (envFiles.length > 0) {
    critical.push(
      `Env files detected at repo root: ${envFiles.join(
        ", "
      )}. AI coding tools may be able to read sensitive local config.`
    );
  } else {
    passed.push("No common env files detected at repo root");
  }

  if (hasClaude) passed.push("CLAUDE.md detected");
  else warnings.push("No CLAUDE.md found. Claude Code may not have repo-specific boundaries.");

  if (hasCursorRules) passed.push("Cursor rules detected");
  else warnings.push("No Cursor rules detected. Cursor may not have project-specific boundaries.");

  if (mcpFiles.length > 0) {
    warnings.push(
      `MCP config detected: ${mcpFiles.join(", ")}. Review tool access carefully.`
    );
  } else {
    passed.push("No root MCP config detected");
  }
    if (hasGithubActions) passed.push("GitHub Actions detected");
  else warnings.push("No GitHub Actions folder detected. PR checks may not be configured yet.");

  if (hasTests) passed.push("Tests detected");
  else warnings.push("No obvious tests detected. AI-generated changes may be harder to verify.");

  const score = calculateScore(critical.length, warnings.length, passed.length);

  console.log(`${pc.bold("Project:")} ${root}`);
  console.log(`${pc.bold("AI coding setup score:")} ${formatScore(score)}\n`);

  printSection("Critical", critical, "red");
  printSection("Warnings", warnings, "yellow");
  printSection("Passed", passed, "green");

  console.log(pc.bold("Recommended next step:"));

  if (!hasAioengineConfig || !hasClaude || !hasCursorRules) {
    console.log(`  Run ${pc.cyan("aioengine init")} to set up AI change control.`);
  } else {
    console.log(`  Run ${pc.cyan("aioengine review")} before committing AI-generated changes.`);
  }
}

function runReview() {
  printHeader("aioengine Review");

  if (!isInsideGitRepo()) {
    console.log(pc.red("This command must be run inside a Git repo."));
    return;
  }

  const root = getProjectRoot();
  const files = getChangedFiles(root);

  if (files.length === 0) {
    console.log(pc.green("No uncommitted changes found."));
    return;
  }

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
    reviewItems.push(
      "Package/dependency files changed. Review for unexpected dependency additions."
    );
  }

  console.log(`${pc.bold("Project:")} ${root}`);
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

  if (!isInsideGitRepo()) {
    console.log(pc.red("This command must be run inside a Git repo."));
    return;
  }

  const root = getProjectRoot();
  const files = getChangedFiles(root);

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
      `  ${pc.red(
        "Do not commit yet."
      )} Review the out-of-scope files and revert anything unrelated to the task.`
    );
  } else {
    console.log(
      `  ${pc.yellow(
        "Review carefully."
      )} These changes may be valid, but they touch sensitive areas.`
    );
  }
}
function runRules() {
  printHeader("aioengine Rules");

  const root = getProjectRoot();

  const claudePath = "CLAUDE.md";
  const cursorDir = ".cursor/rules";
  const cursorPath = path.join(cursorDir, "aioengine.mdc");

  const created = [];
  const skipped = [];

  if (!exists(claudePath, root)) {
    fs.writeFileSync(path.join(root, claudePath), getClaudeRules());
    created.push(claudePath);
  } else {
    skipped.push(claudePath);
  }

  if (!exists(cursorDir, root)) {
    fs.mkdirSync(path.join(root, cursorDir), { recursive: true });
  }

  if (!exists(cursorPath, root)) {
    fs.writeFileSync(path.join(root, cursorPath), getCursorRules());
    created.push(cursorPath);
  } else {
    skipped.push(cursorPath);
  }

  printSection("Created", created, "green");
  printSection("Skipped", skipped, "yellow");

  console.log(pc.bold("Next step:"));
  console.log(`  Run ${pc.cyan("aioengine check")} again.`);
}

function getChangedFiles(root) {
  try {
    const changed = execSync("git diff --name-only", {
      encoding: "utf8",
      cwd: root,
    })
      .trim()
      .split("\n")
      .filter(Boolean);

    const untracked = execSync("git ls-files --others --exclude-standard", {
      encoding: "utf8",
      cwd: root,
    })
      .trim()
      .split("\n")
      .filter(Boolean);

    return Array.from(new Set([...changed, ...untracked]));
  } catch {
    return [];
  }
}

function inferTaskProfile(task) {
  const cleanTask = task.toLowerCase();

  const profiles = [
    {
      id: "ui",
      label: "UI / frontend task",
      strongKeywords: [
        "landing page",
        "home page",
        "hero",
        "headline",
        "cta",
        "navbar",
        "footer",
        "layout",
        "mobile",
        "responsive",
        "pricing page",
        "dashboard header",
      ],
      keywords: [
        "ui",
        "frontend",
        "front end",
        "page",
        "component",
        "style",
        "css",
        "tailwind",
        "design",
        "copy",
        "button",
        "card",
        "section",
      ],
      allowed: [
        "src/app/",
        "src/components/",
        "src/siteconfig.ts",
        "public/",
        "next-env.d.ts",
      ],
      sensitive: [
        ".env",
        "auth",
        "stripe",
        "billing",
        "payment",
        "supabase",
        "migration",
        "middleware",
        "package.json",
        ".github/workflows",
      ],
    },
    {
      id: "cli",
      label: "CLI / tooling task",
      strongKeywords: [
        "cli",
        "command",
        "terminal command",
        "npm package",
        "package executable",
        "bin",
        "commander",
        "aioengine init",
        "aioengine check",
        "aioengine review",
        "aioengine scope",
        "aioengine rules",
      ],
      keywords: [
        "terminal",
        "init",
        "check",
        "review",
        "scope",
        "rules",
        "script",
        "npm",
        "package",
        "developer tool",
        "tooling",
        "publish",
      ],
      allowed: [
        "packages/cli/",
        "package.json",
        "package-lock.json",
        ".aioengine/",
        "CLAUDE.md",
        ".cursor/",
      ],
      sensitive: [
        ".env",
        "auth",
        "stripe",
        "billing",
        "payment",
        "supabase",
        "migration",
        "middleware",
        ".github/workflows",
      ],
    },
    {
      id: "docs",
      label: "Docs / copy task",
      strongKeywords: ["readme", "documentation", "docs"],
      keywords: ["copy", "text", "wording", "content", "instructions"],
      allowed: ["README", "readme", "docs/", ".md", "CLAUDE.md"],
      sensitive: [
        ".env",
        "auth",
        "stripe",
        "billing",
        "payment",
        "supabase",
        "migration",
        "middleware",
        "package.json",
      ],
    },
    {
      id: "backend",
      label: "Backend / API task",
      strongKeywords: ["api route", "route handler", "database", "server action"],
      keywords: [
        "api",
        "backend",
        "server",
        "database",
        "supabase",
        "schema",
        "auth",
        "webhook",
        "stripe",
      ],
      allowed: [
        "src/app/api/",
        "src/lib/",
        "supabase/",
        "prisma/",
        "package.json",
      ],
      sensitive: [
        ".env",
        "stripe",
        "billing",
        "payment",
        "auth",
        "migration",
        "schema",
        "rls",
        "middleware",
      ],
    },
  ];

  const scoredProfiles = profiles
    .map((profile) => {
      const strongScore = profile.strongKeywords.filter((keyword) =>
        cleanTask.includes(keyword)
      ).length;

      const normalScore = profile.keywords.filter((keyword) =>
        cleanTask.includes(keyword)
      ).length;

      return {
        ...profile,
        score: strongScore * 3 + normalScore,
      };
    })
    .filter((profile) => profile.score > 0)
    .sort((a, b) => b.score - a.score);

  return (
    scoredProfiles[0] ?? {
      id: "unknown",
      label: "Unknown / general task",
      allowed: [],
      sensitive: [],
    }
  );
}

function isProbablyOutOfScope(file, profile) {
  if (!profile || profile.id === "unknown") {
    return false;
  }

  const normalizedFile = file.replaceAll("\\", "/").toLowerCase();

  const allowedPatterns = profile.allowed ?? [];
  const sensitivePatterns = profile.sensitive ?? [];

  const isAllowed = allowedPatterns.some((pattern) => {
    const normalizedPattern = pattern.replaceAll("\\", "/").toLowerCase();

    if (normalizedPattern.endsWith("/")) {
      return normalizedFile.startsWith(normalizedPattern);
    }

    return (
      normalizedFile === normalizedPattern ||
      normalizedFile.includes(normalizedPattern)
    );
  });

  if (isAllowed) {
    return false;
  }

  const isSensitive = sensitivePatterns.some((pattern) =>
    normalizedFile.includes(pattern.toLowerCase())
  );

  if (isSensitive) {
    return true;
  }

  return allowedPatterns.length > 0;
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
function getProjectRoot() {
  try {
    return execSync("git rev-parse --show-toplevel", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return process.cwd();
  }
}

function isInsideGitRepo() {
  try {
    const result = execSync("git rev-parse --is-inside-work-tree", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .trim()
      .toLowerCase();

    return result === "true";
  } catch {
    return false;
  }
}

function exists(relativePath, root = process.cwd()) {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath, root = process.cwd()) {
  try {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  } catch {
    return "";
  }
}

function findFiles(root, files) {
  return files.filter((file) => exists(file, root));
}

function packageScriptIncludes(root, scriptName) {
  const packageJson = read("package.json", root);

  if (!packageJson) {
    return false;
  }

  try {
    const parsed = JSON.parse(packageJson);
    const script = parsed.scripts?.[scriptName];

    if (!script) {
      return false;
    }

    if (scriptName === "test") {
      const normalized = script.toLowerCase().replace(/\s+/g, " ").trim();

      const fakeTestScripts = [
        'echo "error: no test specified" && exit 1',
        "echo 'error: no test specified' && exit 1",
        "echo error: no test specified && exit 1",
      ];

      if (fakeTestScripts.includes(normalized)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

function calculateScore(criticalCount, warningCount, passedCount) {
  const raw =
    100 - criticalCount * 18 - warningCount * 7 + Math.min(passedCount * 2, 10);

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

  const colorFn =
    color === "red" ? pc.red : color === "yellow" ? pc.yellow : pc.green;

  const icon = color === "red" ? "✗" : color === "yellow" ? "!" : "✓";

  console.log(pc.bold(colorFn(title)));

  items.forEach((item) => {
    console.log(`  ${colorFn(icon)} ${item}`);
  });

  console.log("");
}

function getDefaultConfig() {
  return {
    version: "0.1.0",
    projectType: "auto",
    highRiskPatterns: [
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
    ],
    reviewRules: {
      warnOnLargeChanges: true,
      largeChangeFileCount: 12,
      requireReviewForSensitiveFiles: true,
      warnOnDependencyChanges: true,
    },
  };
}

function getClaudeRules() {
  return `# AI Coding Rules

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
}

function getCursorRules() {
  return `---
description: AI coding safety rules generated by aioengine
alwaysApply: true
---

Keep changes narrow and task-focused.

Do not modify auth, billing, database, environment, deployment, dependency, or security files unless explicitly requested.

Flag high-risk changes for human review.

Do not add dependencies without a clear reason.

For UI-only tasks, avoid backend, API, database, and config changes.
`;
}