/**
 * Project status summary for local operations.
 * Keeps output aligned with the current repository state.
 */

const { execSync } = require("child_process");
const chalk = require("chalk");
const pkg = require("../package.json");

function run(command) {
  try {
    return execSync(command, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function parseAheadBehind(raw) {
  if (!raw) return { ahead: "?", behind: "?" };
  const parts = raw.split(/\s+/);
  if (parts.length !== 2) return { ahead: "?", behind: "?" };
  return { behind: parts[0], ahead: parts[1] };
}

const today = new Date().toISOString().slice(0, 10);
const branch = run("git rev-parse --abbrev-ref HEAD") || "unknown";
const lastCommit =
  run('git log -1 --pretty=format:"%h | %ad | %s" --date=short') || "unavailable";
const aheadBehind = parseAheadBehind(run("git rev-list --left-right --count origin/dev...HEAD"));
const shortStatus = run("git status --short");
const isDirty = Boolean(shortStatus);

const nextVersion = pkg.dependencies?.next || "unknown";
const reactVersion = pkg.dependencies?.react || "unknown";
const typescriptVersion = pkg.dependencies?.typescript || "unknown";

const sep = chalk.gray("-".repeat(70));
const ok = chalk.green("OK");
const warn = chalk.yellow("WARN");

console.clear();
console.log(chalk.green.bold("AGRI POINT E-COMMERCE - STATUS"));
console.log(chalk.gray(`Generated: ${today}`));
console.log(sep);

console.log(chalk.cyan.bold("Repository"));
console.log(`Branch: ${branch}`);
console.log(`Remote sync (origin/dev): ahead ${aheadBehind.ahead}, behind ${aheadBehind.behind}`);
console.log(`Working tree: ${isDirty ? `${warn} (changes pending)` : `${ok} (clean)`}`);
console.log(`Last commit: ${lastCommit}`);

if (isDirty && shortStatus) {
  console.log(chalk.yellow("\nPending changes:"));
  console.log(shortStatus);
}

console.log(sep);
console.log(chalk.cyan.bold("Stack"));
console.log(`Next.js: ${nextVersion}`);
console.log(`React: ${reactVersion}`);
console.log(`TypeScript: ${typescriptVersion}`);

console.log(sep);
console.log(chalk.cyan.bold("Quality Gates"));
console.log("- npm run lint       (fast, errors only)");
console.log("- npm run lint:full  (full warnings report)");
console.log("- npm run type-check");
console.log("- npm run build");

console.log(sep);
console.log(chalk.cyan.bold("Notes"));
console.log("- CI workflow runs lint + type-check + build on dev/main push and PR.");
console.log("- Use npm audit to verify dependency security state before release.");
console.log("- For release confidence, run lint:full regularly to reduce warning debt.");
console.log(sep);
