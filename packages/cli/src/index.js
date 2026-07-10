#!/usr/bin/env node

import { Command } from "commander";
import pc from "picocolors";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import crypto from "crypto";

const program = new Command();

program
  .name("aioengine")
  .description("AI change control for developers using AI coding tools.")
  .version(getCliVersion());

program
  .command("init")
  .description("Create aioengine config files")
  .option("--github", "Create a GitHub Actions workflow for aioengine PR checks")
  .action((options) => runInit(options));

program
  .command("snapshot")
  .description("Save a repo snapshot with Git HEAD, file hashes, and key project context.")
  .option("--name <name>", "Snapshot name", "latest")
  .action((options) => runSnapshot(options));

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
  .command("ci")
  .description("Run aioengine review checks in CI and pull request workflows.")
  .option("--task <task>", "Task description to compare changed files against")
  .option("--report <path>", "Write a Markdown CI report to a file")
  .option(
    "--profile <profile>",
    "Task profile override: ui, cli, docs, marketing, backend, ci"
  )
  .action((options) => runCi(options));

program
  .command("scope")
  .description("Check whether changed files match the task you gave your AI coding tool.")
  .argument("<task>", "Task description")
  .option(
    "--profile <profile>",
    "Task profile override: ui, cli, docs, marketing,backend, ci"
  )
  .action((task, options) => runScope(task, options));

program
  .command("rules")
  .description("Generate starter AI coding rules for this repo.")
  .action(() => {
    runRules();
  });

program.parse();

function runInit(options = {}) {
  printHeader("aioengine Init");

  const root = getProjectRoot();
  const created = [];
  const skipped = [];

  const aioengineDir = ".aioengine";
  const configPath = path.join(aioengineDir, "config.json");
  const cursorDir = ".cursor/rules";
  const cursorPath = path.join(cursorDir, "aioengine.mdc");
  const snapshotsDir = path.join(aioengineDir, "snapshots");
  const snapshotsGitignorePath = path.join(snapshotsDir, ".gitignore");

  const isGitRepo = isInsideGitRepo();

  if (!isGitRepo) {
    console.log(
      pc.yellow(
        "Warning: aioengine works best inside a Git repo. Run git init before committing setup files."
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

  if (!exists(snapshotsDir, root)) {
    fs.mkdirSync(path.join(root, snapshotsDir), { recursive: true });
  }

  if (!exists(snapshotsGitignorePath, root)) {
    fs.writeFileSync(
      path.join(root, snapshotsGitignorePath),
      "*\n!.gitignore\n",
      "utf8"
    );
    created.push(snapshotsGitignorePath);
  } else {
    skipped.push(snapshotsGitignorePath);
  }

  createClaudeRulesSafely(root, created, skipped);

  if (!exists(cursorDir, root)) {
    fs.mkdirSync(path.join(root, cursorDir), { recursive: true });
  }

  if (!exists(cursorPath, root)) {
    fs.writeFileSync(path.join(root, cursorPath), getCursorRules());
    created.push(cursorPath);
  } else {
    skipped.push(cursorPath);
  }

  if (options.github) {
    createGithubWorkflowSafely(root, created, skipped);
  }

  printSection("Created", created, "green");
  printSection("Skipped", skipped, "yellow");

  if (skipped.includes("CLAUDE.md already exists")) {
    console.log(
      `\n${pc.dim(
        "aioengine did not modify your existing CLAUDE.md. Suggested Claude rules were saved to .aioengine/suggested-claude-rules.md if that file did not already exist."
      )}`
    );
  }

  const setupPaths = [
    ".aioengine",
    "CLAUDE.md",
    ".cursor",
    options.github ? ".github" : null,
    exists("package.json", root) ? "package.json" : null,
  ].filter(Boolean);

  console.log(pc.bold("Before you start:"));
  console.log(`  - Requires ${pc.cyan("Node.js/npm")} and ${pc.cyan("Git")}`);

  if (options.github) {
    console.log(
      `  - GitHub PR comments require a GitHub repo with Actions enabled`
    );
  }

  console.log("");
  console.log(pc.bold("Next steps:"));
  console.log(`  1. Review the files aioengine created`);

  let step = 2;

  if (!isGitRepo) {
    console.log(`  ${step}. Initialize Git before committing setup files:`);
    console.log(`     ${pc.cyan("git init")}`);
    step += 1;
  }

  console.log(`  ${step}. Commit the setup files before running scope checks:`);
  console.log(`     ${pc.cyan(`git add ${setupPaths.join(" ")}`)}`);
  console.log(`     ${pc.cyan('git commit -m "Add aioengine guardrails"')}`);
  step += 1;

  console.log(`  ${step}. Run ${pc.cyan("aioengine check")}`);
  step += 1;

  console.log(`  ${step}. Save a snapshot before a larger AI edit:`);
  console.log(`     ${pc.cyan("aioengine snapshot --name checkpoint")}`);
  step += 1;

  console.log(`  ${step}. Create a branch for the AI-assisted change:`);
  console.log(`     ${pc.cyan("git checkout -b describe-change")}`);
  step += 1;

  console.log(`  ${step}. Make or review AI-generated changes`);
  step += 1;

  console.log(`  ${step}. Check whether the changed files match the task:`);
  console.log(
    `     ${pc.cyan('aioengine scope "describe the task" --profile ui')}`
  );
  console.log(
    `     ${pc.dim("Profiles: ui, docs, cli, ci, backend, marketing")}`
  );
  step += 1;

  console.log(`  ${step}. Run ${pc.cyan("aioengine review")} before committing`);
  step += 1;

  if (options.github) {
    console.log(
      `  ${step}. Open a pull request to see the ${pc.cyan(
        "aioengine CI report"
      )} comment`
    );
  }
}

function runSnapshot(options = {}) {
  printHeader("aioengine Snapshot");

  const root = getProjectRoot();

  if (!isInsideGitRepo()) {
    console.log(
      pc.yellow(
        "Snapshot requires a Git repo because it records Git HEAD and tracked file state."
      )
    );
    process.exitCode = 1;
    return;
  }

  const snapshotName = sanitizeSnapshotName(options.name || "latest");
  const snapshotDir = path.join(root, ".aioengine", "snapshots");
  const snapshotPath = path.join(snapshotDir, `${snapshotName}.json`);

  fs.mkdirSync(snapshotDir, { recursive: true });
  ensureSnapshotGitignore(snapshotDir);

  const snapshot = buildRepoSnapshot(root);

  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), "utf8");

  console.log(`${pc.green("✓")} Saved repo snapshot`);
  console.log(`${pc.dim("Path:")} ${path.relative(root, snapshotPath)}`);
  console.log(`${pc.dim("Git HEAD:")} ${snapshot.git.head || "unknown"}`);
  console.log(`${pc.dim("Tracked files hashed:")} ${snapshot.files.length}`);

  if (snapshot.git.dirty) {
    console.log(
      pc.yellow(
        "Note: your working tree has uncommitted changes. The snapshot records this."
      )
    );
  }
}

function buildRepoSnapshot(root) {
  const trackedFiles = getTrackedFiles(root);
  const fileSnapshots = [];

  for (const file of trackedFiles) {
    if (shouldSkipSnapshotFile(file)) {
      continue;
    }

    const absolutePath = path.join(root, file);

    if (!fs.existsSync(absolutePath)) {
      fileSnapshots.push({
        path: normalizePath(file),
        status: "deleted",
      });
      continue;
    }

    const stats = fs.statSync(absolutePath);

    if (!stats.isFile()) {
      continue;
    }

    fileSnapshots.push({
      path: normalizePath(file),
      sizeBytes: stats.size,
      sha256: hashFile(absolutePath),
    });
  }

  return {
    snapshotVersion: 1,
    aioengineVersion: getCliVersion(),
    createdAt: new Date().toISOString(),
    git: {
      head: safeGit("rev-parse HEAD", root),
      branch: safeGit("branch --show-current", root),
      dirty: safeGit("status --porcelain", root).length > 0,
      status: safeGit("status --short", root)
        .split("\n")
        .filter(Boolean),
    },
    summary: {
      trackedFilesHashed: fileSnapshots.length,
      keyContextIncluded: true,
    },
    context: collectKeyRepoContext(root),
    files: fileSnapshots,
  };
}

function collectKeyRepoContext(root) {
  return {
    packageJson: collectPackageJsonContext(root),
    guardrails: {
      aioengineConfig: exists(".aioengine/config.json", root),
      claudeRules: exists("CLAUDE.md", root),
      cursorRules: exists(".cursor/rules/aioengine.mdc", root),
      githubWorkflow: exists(".github/workflows/aioengine.yml", root),
    },
    workflows: collectWorkflowContext(root),
    lockfiles: {
      packageLock: exists("package-lock.json", root),
      pnpmLock: exists("pnpm-lock.yaml", root),
      yarnLock: exists("yarn.lock", root),
    },
  };
}

function collectPackageJsonContext(root) {
  const packagePath = path.join(root, "package.json");

  if (!fs.existsSync(packagePath)) {
    return null;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

    return {
      name: packageJson.name || null,
      version: packageJson.version || null,
      type: packageJson.type || null,
      scripts: Object.keys(packageJson.scripts || {}),
      dependencies: Object.keys(packageJson.dependencies || {}),
      devDependencies: Object.keys(packageJson.devDependencies || {}),
    };
  } catch {
    return {
      error: "Could not parse package.json",
    };
  }
}

function collectWorkflowContext(root) {
  const workflowDir = path.join(root, ".github", "workflows");

  if (!fs.existsSync(workflowDir)) {
    return [];
  }

  return fs
    .readdirSync(workflowDir)
    .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"))
    .map((file) => {
      const absolutePath = path.join(workflowDir, file);
      const content = fs.readFileSync(absolutePath, "utf8");

      return {
        file: normalizePath(path.join(".github", "workflows", file)),
        lines: content.split("\n").length,
        sha256: hashFile(absolutePath),
      };
    });
}

function getTrackedFiles(root) {
  return safeGit("ls-files", root)
    .split("\n")
    .map((file) => file.trim())
    .filter(Boolean);
}

function safeGit(command, root) {
  try {
    return execSync(`git ${command}`, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function hashFile(filePath) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(filePath))
    .digest("hex");
}

function sanitizeSnapshotName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function shouldSkipSnapshotFile(file) {
  const normalized = normalizePath(file);

  return [
    "node_modules/",
    ".git/",
    ".next/",
    "dist/",
    "build/",
    "coverage/",
    ".turbo/",
    ".vercel/",
    ".aioengine/snapshots/",
  ].some((prefix) => normalized.startsWith(prefix));
}

function ensureSnapshotGitignore(snapshotDir) {
  const gitignorePath = path.join(snapshotDir, ".gitignore");

  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, "*\n!.gitignore\n", "utf8");
  }
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

function runCi(options = {}) {
  printHeader("aioengine CI");

  const root = getProjectRoot();

  if (!isInsideGitRepo()) {
    console.log(
      `${pc.red("✗")} No Git repo detected. aioengine ci must run inside a Git repository.`
    );
    process.exitCode = 1;
    return;
  }

  const task = options.task || getCiTask();
  const files = getCiChangedFiles(root);

  console.log(`${pc.dim("Project:")} ${root}`);

  if (isGitHubActions()) {
    console.log(`${pc.dim("Environment:")} GitHub Actions`);
  } else {
    console.log(`${pc.dim("Environment:")} Local / unknown CI`);
  }

  if (task) {
    console.log(`${pc.dim("Task:")} ${task}`);
  } else {
    console.log(
      `${pc.yellow("!")} No task detected. Scope checks will be less precise.`
    );
  }

  if (files.length === 0) {
    console.log(pc.green("\nNo changed files found."));
    return;
  }

  const profile = inferTaskProfile(task, options.profile);
  const riskyFiles = files.filter(isRiskyFile);
  const outOfScopeFiles = profile
    ? files.filter((file) => isProbablyOutOfScope(file, profile))
    : [];

  if (profile) {
    console.log(`${pc.dim("Detected task type:")} ${profile.label}`);
  }

  console.log(`${pc.dim("Changed files:")} ${files.length}\n`);

  for (const file of files) {
    const risky = riskyFiles.includes(file);
    const outOfScope = outOfScopeFiles.includes(file);

    if (outOfScope) {
      console.log(`  ${pc.red("✗")} ${file} ${pc.red("— possible scope drift")}`);
    } else if (risky) {
      console.log(`  ${pc.yellow("!")} ${file} ${pc.yellow("— review carefully")}`);
    } else {
      console.log(`  ${pc.green("✓")} ${file}`);
    }
  }

  const hasScopeDrift = outOfScopeFiles.length > 0;
  const hasRiskyFiles = riskyFiles.length > 0;

  if (options.report) {
    writeCiReport(root, options.report, {
      task,
      profile,
      files,
      riskyFiles,
      outOfScopeFiles,
      hasScopeDrift,
      hasRiskyFiles,
      environment: isGitHubActions() ? "GitHub Actions" : "Local / unknown CI",
    });
  }

  if (hasScopeDrift) {
    console.log(pc.yellow("\nCI review recommended"));

    printSection(
      "Possible scope drift",
      outOfScopeFiles.map(
        (file) => `Possible out-of-scope file changed: ${file}`
      ),
      "warning"
    );

    if (hasRiskyFiles) {
      printSection(
        "Risky files",
        riskyFiles.map((file) => `High-risk file changed: ${file}`),
        "warning"
      );
    }

    console.log(
      pc.dim(
        "\nRecommendation: Review these changes before merging. aioengine is failing this CI check because possible scope drift was detected."
      )
    );

    process.exitCode = 1;
    return;
  }

  if (hasRiskyFiles) {
    console.log(
      pc.yellow(
        "\nRisky files were changed. aioengine is allowing this check to pass, but these files should receive extra human review."
      )
    );
    return;
  }

  console.log(pc.green("\nNo obvious AI change-control issues detected."));
}

function runScope(task, options = {}) {
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

  const profile = inferTaskProfile(task, options.profile);
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

  const cursorDir = ".cursor/rules";
  const cursorPath = path.join(cursorDir, "aioengine.mdc");

  const created = [];
  const skipped = [];

  createClaudeRulesSafely(root, created, skipped);

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

  if (skipped.includes("CLAUDE.md already exists")) {
    console.log(
      `\n${pc.dim(
        "aioengine did not modify your existing CLAUDE.md. Suggested Claude rules were saved to .aioengine/suggested-claude-rules.md if that file did not already exist."
      )}`
    );
  }

  console.log(pc.bold("Next step:"));
  console.log(`  Run ${pc.cyan("aioengine check")} again.`);
}

function createGithubWorkflowSafely(root, created, skipped) {
  const workflowDir = ".github/workflows";
  const workflowPath = path.join(workflowDir, "aioengine.yml");

  if (!exists(workflowDir, root)) {
    fs.mkdirSync(path.join(root, workflowDir), { recursive: true });
    created.push(workflowDir);
  }

  if (!exists(workflowPath, root)) {
    fs.writeFileSync(
      path.join(root, workflowPath),
      getGithubActionsWorkflow(),
      "utf8"
    );
    created.push(workflowPath);
  } else {
    skipped.push(`${workflowPath} already exists`);
  }
}

function getGithubActionsWorkflow() {
  return [
    "name: aioengine",
    "",
    "on:",
    "  pull_request:",
    "    types: [opened, synchronize, reopened, edited]",
    "  workflow_dispatch:",
    "",
    "permissions:",
    "  contents: read",
    "  pull-requests: write",
    "  issues: write",
    "",
    "jobs:",
    "  ai-change-control:",
    "    name: AI change control",
    "    runs-on: ubuntu-latest",
    "",
    "    steps:",
    "      - name: Check out repository",
    "        uses: actions/checkout@v6",
    "        with:",
    "          fetch-depth: 0",
    "",
    "      - name: Set up Node",
    "        uses: actions/setup-node@v6",
    "        with:",
    "          node-version: 24",
    "          package-manager-cache: false",
    "",
    "      - name: Run aioengine",
    "        run: npx aioengine@latest ci --report aioengine-report.md",
    "",
    "      - name: Comment aioengine report on PR",
    "        if: always() && github.event_name == 'pull_request'",
    "        env:",
    "          GH_TOKEN: ${{ github.token }}",
    "          PR_NUMBER: ${{ github.event.pull_request.number }}",
    "          REPO: ${{ github.repository }}",
    '        run: gh pr comment "$PR_NUMBER" --repo "$REPO" --body-file aioengine-report.md --edit-last --create-if-none',
    "",
    "      - name: Upload aioengine report",
    "        if: always()",
    "        uses: actions/upload-artifact@v6",
    "        with:",
    "          name: aioengine-report",
    "          path: aioengine-report.md",
    "",
  ].join("\n");
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

function inferTaskProfile(task = "", forcedProfileId) {
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
      id: "marketing",
      label: "Marketing / docs-site task",
      strongKeywords: [
        "docs and site",
        "site and docs",
        "documentation and landing page",
        "landing page and docs",
        "readme and landing page",
        "website copy",
        "homepage copy",
        "product page",
        "launch page",
        "marketing page",
      ],
      keywords: [
        "docs",
        "documentation",
        "readme",
        "site",
        "website",
        "landing page",
        "homepage",
        "copy",
        "pricing",
        "cta",
        "feature section",
        "product messaging",
      ],
      allowed: [
        "README",
        "readme",
        "docs/",
        ".md",
        "packages/cli/README.md",
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
        "ci command",
        "ci report",
        "markdown report",
        "report output",
        "aioengine init",
        "aioengine check",
        "aioengine review",
        "aioengine scope",
        "aioengine rules",
        "aioengine ci",
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
        "report",
        "markdown",
        "ci",
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
    {
      id: "ci",
      label: "CI / workflow task",
      strongKeywords: [
        "github actions",
        "workflow",
        "ci workflow",
        "pull request",
        "pr check",
        "github action",
        "node 24",
      ],
      keywords: [
        "ci",
        "pipeline",
        "runner",
        "actions",
        "checkout",
        "setup-node",
        "upload artifact",
        "artifact",
        "permissions",
      ],
      allowed: [
        ".github/workflows/",
        "packages/cli/",
        "package.json",
        "package-lock.json",
        "README.md",
        "docs/",
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
      ],
    },
  ];

  if (forcedProfileId) {
    const forcedProfile = profiles.find(
      (profile) => profile.id === forcedProfileId
    );

    if (forcedProfile) {
      return forcedProfile;
    }

    console.log(
      pc.yellow(
        `Unknown profile "${forcedProfileId}". Using automatic task detection instead.`
      )
    );
  }

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

function createClaudeRulesSafely(root, created, skipped) {
  const claudePath = path.join(root, "CLAUDE.md");
  const aioengineDir = path.join(root, ".aioengine");
  const suggestedPath = path.join(
    root,
    ".aioengine",
    "suggested-claude-rules.md"
  );

  if (!fs.existsSync(aioengineDir)) {
    fs.mkdirSync(aioengineDir, { recursive: true });
    created.push(".aioengine");
  }

  if (!fs.existsSync(claudePath)) {
    fs.writeFileSync(claudePath, getClaudeRules(), "utf8");
    created.push("CLAUDE.md");
    return;
  }

  skipped.push("CLAUDE.md already exists");

  if (!fs.existsSync(suggestedPath)) {
    fs.writeFileSync(suggestedPath, getClaudeRules(), "utf8");
    created.push(".aioengine/suggested-claude-rules.md");
    return;
  }

  skipped.push(".aioengine/suggested-claude-rules.md already exists");
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

function isGitHubActions() {
  return process.env.GITHUB_ACTIONS === "true";
}

function getCiTask() {
  const explicitTask = process.env.AIOENGINE_TASK;

  if (explicitTask) {
    return explicitTask;
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;

  if (!eventPath || !fs.existsSync(eventPath)) {
    return "";
  }

  try {
    const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));

    return (
      event.pull_request?.title ||
      event.issue?.title ||
      event.head_commit?.message ||
      ""
    );
  } catch {
    return "";
  }
}

function getCiChangedFiles(root) {
  if (isGitHubActions()) {
    const files = getGitHubActionsChangedFiles(root);

    if (files.length > 0) {
      return files;
    }
  }

  return getChangedFiles(root);
}

function getGitHubActionsChangedFiles(root) {
  const baseRef = process.env.GITHUB_BASE_REF;
  const beforeSha = process.env.GITHUB_EVENT_BEFORE;
  const currentSha = process.env.GITHUB_SHA || "HEAD";

  try {
    if (baseRef) {
      try {
        execSync(`git fetch origin ${baseRef} --depth=1`, {
          cwd: root,
          stdio: "ignore",
        });
      } catch {
        // The workflow may already have enough history.
      }

      return uniqueFiles(
        execSync(`git diff --name-only origin/${baseRef}...HEAD`, {
          cwd: root,
          encoding: "utf8",
        })
          .split("\n")
          .map((file) => file.trim())
          .filter(Boolean)
      );
    }

    if (beforeSha && currentSha) {
      return uniqueFiles(
        execSync(`git diff --name-only ${beforeSha} ${currentSha}`, {
          cwd: root,
          encoding: "utf8",
        })
          .split("\n")
          .map((file) => file.trim())
          .filter(Boolean)
      );
    }
  } catch {
    return [];
  }

  return [];
}

function uniqueFiles(files) {
  return [...new Set(files)].sort();
}

function writeCiReport(root, reportPath, data) {
  const outputPath = path.isAbsolute(reportPath)
    ? reportPath
    : path.join(root, reportPath);

  const outputDir = path.dirname(outputPath);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, buildCiReport(data), "utf8");

  console.log(`${pc.dim("Report:")} ${outputPath}`);
}

function buildCiReport({
  task,
  profile,
  files,
  riskyFiles,
  outOfScopeFiles,
  hasScopeDrift,
  hasRiskyFiles,
  environment,
}) {
  const status = hasScopeDrift
    ? "Review required"
    : hasRiskyFiles
      ? "Passed with warnings"
      : "Passed";

  const lines = [
    "# aioengine CI Report",
    "",
    `**Status:** ${status}`,
    `**Environment:** ${environment}`,
    `**Task:** ${task || "Not detected"}`,
    `**Detected task type:** ${profile?.label || "Unknown / general task"}`,
    "",
    "## Summary",
    "",
    `- Changed files: ${files.length}`,
    `- Possible scope drift: ${outOfScopeFiles.length}`,
    `- Risky files: ${riskyFiles.length}`,
    "",
    "## Changed files",
    "",
  ];

  if (files.length === 0) {
    lines.push("No changed files found.", "");
  } else {
   for (const file of files) {
  if (outOfScopeFiles.includes(file)) {
    lines.push(`- [SCOPE DRIFT] \`${file}\` — possible scope drift`);
  } else if (riskyFiles.includes(file)) {
    lines.push(`- [REVIEW] \`${file}\` — review carefully`);
  } else {
    lines.push(`- [OK] \`${file}\``);
  }
}

    lines.push("");
  }

  if (outOfScopeFiles.length > 0) {
    lines.push("## Possible scope drift", "");

    for (const file of outOfScopeFiles) {
      lines.push(`- \`${file}\``);
    }

    lines.push("");
  }

  if (riskyFiles.length > 0) {
    lines.push("## Risky files", "");

    for (const file of riskyFiles) {
      lines.push(`- \`${file}\``);
    }

    lines.push("");
  }

  lines.push("## Recommendation", "");

  if (hasScopeDrift) {
    lines.push(
      "Review these changes before merging. aioengine detected possible scope drift."
    );
  } else if (hasRiskyFiles) {
    lines.push(
      "Risky files were changed. aioengine allowed this check to pass, but these files should receive extra human review."
    );
  } else {
    lines.push("No obvious AI change-control issues were detected.");
  }

  lines.push("");

  return lines.join("\n");
}

function getCliVersion() {
  try {
    const currentFile = fileURLToPath(import.meta.url);
    const currentDir = path.dirname(currentFile);
    const packagePath = path.join(currentDir, "..", "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

    return packageJson.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}