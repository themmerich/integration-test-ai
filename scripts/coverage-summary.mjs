import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

// Renders the frontend coverage totals as a Markdown table. Run after `pnpm test:coverage`.
// In GitHub Actions the table is appended to the job summary; locally it is only printed.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const summaryFile = path.join(repoRoot, 'frontend', 'coverage', 'frontend', 'coverage-summary.json');

// The tests can fail before any report is written; say so instead of crashing on a missing file.
if (!existsSync(summaryFile)) {
  process.stdout.write(`No coverage summary found at ${summaryFile}. Did the test run finish?\n`);
  process.exit(0);
}

const { total } = JSON.parse(readFileSync(summaryFile, 'utf8'));

const metrics = [
  ['Lines', 'lines'],
  ['Branches', 'branches'],
  ['Statements', 'statements'],
  ['Functions', 'functions'],
];

// Istanbul reports `pct` as the string "Unknown" when a metric has nothing to count.
const formatPct = (pct) => (typeof pct === 'number' ? `${pct.toFixed(2)} %` : '–');

const markdown = [
  '### Frontend coverage',
  '',
  '| Metric | Coverage | Covered |',
  '| --- | ---: | ---: |',
  ...metrics.map(([label, key]) => `| ${label} | ${formatPct(total[key].pct)} | ${total[key].covered} / ${total[key].total} |`),
  '',
  'Thresholds for lines and branches are set in `frontend/vitest-base.config.ts`. ' +
    'The full HTML report is attached to this run as the `coverage-report` artifact.',
  '',
].join('\n');

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
}
process.stdout.write(markdown);
