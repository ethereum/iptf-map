#!/usr/bin/env node
/**
 * QA Audit Tracker Sync for IPTF Map
 *
 * TEMPORARY scaffolding for the Q2 2026 content audit (PR #130).
 * Delete this file and .github/workflows/audit-check.yml before
 * merging feat/audit into master.
 *
 * Compares QA-AUDIT.md against the content file list on origin/master
 * (so it catches new content even while feat/audit lags behind).
 *
 * Usage:
 *   node scripts/audit-sync.js          # check mode: report drift, exit 1 if any
 *   node scripts/audit-sync.js --sync   # rewrite tables, preserving review data
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const AUDIT_FILE = path.join(ROOT_DIR, 'QA-AUDIT.md');
const MASTER_REF = process.env.AUDIT_REF || 'origin/master';
const SYNC_MODE = process.argv.includes('--sync');

const SECTIONS = [
  { title: 'Patterns', dir: 'patterns' },
  { title: 'Use Cases', dir: 'use-cases' },
  { title: 'Approaches', dir: 'approaches' },
  { title: 'Domains', dir: 'domains' },
  { title: 'Jurisdictions', dir: 'jurisdictions' },
  { title: 'Vendors', dir: 'vendors' }
];

const STATUSES = ['pending', 'claimed', 'ok', 'needs-fix', 'deprecated'];
const REMOVED_NOTE = 'removed from master';

// --- Master file list ---

function masterFiles(dir) {
  let out;
  try {
    out = execSync(`git ls-tree -r ${MASTER_REF} --name-only -- ${dir}/`, {
      cwd: ROOT_DIR,
      encoding: 'utf8'
    });
  } catch (e) {
    console.error(`Error: could not read ${MASTER_REF}. Run "git fetch origin master" first.`);
    process.exit(2);
  }
  return out
    .split('\n')
    .filter((f) => f.endsWith('.md'))
    .filter((f) => !f.endsWith('_template.md') && !f.endsWith('README.md'))
    .sort();
}

// --- Tracker parsing ---

function parseRow(line) {
  if (!line.startsWith('|') || !line.includes('](')) return null;
  const cells = line.split('|').map((c) => c.trim());
  // cells[0] and cells[cells.length-1] are empty (leading/trailing pipes)
  const link = cells[2];
  const m = link && link.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if (!m) return null;
  const data = cells.slice(3, cells.length - 1);
  const status = (data[0] || '').replace(/`/g, '').trim();
  let reviewer, claimed, reviewed, notes;
  if (data.length >= 5) {
    // v2 format: Status | Reviewer | Claimed | Reviewed | Notes
    [, reviewer, claimed, reviewed, notes] = data;
  } else {
    // v1 format: Status | Reviewer | Date | Notes
    reviewer = data[1] || '';
    claimed = '';
    reviewed = data[2] || '';
    notes = data[3] || '';
  }
  return { file: m[2], status, reviewer, claimed, reviewed, notes };
}

function parseTracker(text) {
  const lines = text.split('\n');
  const sections = {};
  let current = null;
  for (const line of lines) {
    const heading = line.match(/^## (.+?) \(\d+\)\s*$/);
    if (heading) {
      current = SECTIONS.find((s) => s.title === heading[1]) ? heading[1] : null;
      if (current) sections[current] = [];
      continue;
    }
    if (line.startsWith('## ') || line.startsWith('---')) {
      current = null;
      continue;
    }
    if (current) {
      const row = parseRow(line);
      if (row) sections[current].push(row);
    }
  }
  return sections;
}

// --- Table generation ---

function buildRows(section, tracked) {
  const files = masterFiles(section.dir);
  const byFile = new Map((tracked || []).map((r) => [r.file, r]));
  const rows = [];

  for (const file of files) {
    const existing = byFile.get(file);
    if (existing) {
      rows.push(existing);
      byFile.delete(file);
    } else {
      rows.push({ file, status: 'pending', reviewer: '', claimed: '', reviewed: '', notes: '' });
    }
  }
  // Orphans: tracked rows whose file no longer exists on master
  for (const orphan of byFile.values()) {
    orphan.status = 'deprecated';
    if (!orphan.notes.includes(REMOVED_NOTE)) {
      orphan.notes = orphan.notes ? `${orphan.notes}; ${REMOVED_NOTE}` : REMOVED_NOTE;
    }
    rows.push(orphan);
  }
  rows.sort((a, b) => a.file.localeCompare(b.file));
  return rows;
}

function renderSection(section, rows) {
  const lines = [];
  lines.push(`## ${section.title} (${rows.length})`);
  lines.push('');
  lines.push('| # | File | Status | Reviewer | Claimed | Reviewed | Notes |');
  lines.push('|---|------|--------|----------|---------|----------|-------|');
  rows.forEach((r, i) => {
    const name = path.basename(r.file);
    lines.push(
      `| ${i + 1} | [${name}](${r.file}) | \`${r.status}\` | ${r.reviewer} | ${r.claimed} | ${r.reviewed} | ${r.notes} |`
    );
  });
  lines.push('');
  return lines;
}

function renderSummary(allRows) {
  const lines = [];
  lines.push('## Progress Summary');
  lines.push('');
  lines.push('| Section | Total | OK | Claimed | Needs Fix | Deprecated | Pending |');
  lines.push('|---------|-------|----|---------|-----------|------------|---------|');
  const totals = { total: 0, ok: 0, claimed: 0, 'needs-fix': 0, deprecated: 0, pending: 0 };
  for (const section of SECTIONS) {
    const rows = allRows[section.title];
    const c = { ok: 0, claimed: 0, 'needs-fix': 0, deprecated: 0, pending: 0 };
    for (const r of rows) if (c[r.status] !== undefined) c[r.status]++;
    lines.push(
      `| ${section.title} | ${rows.length} | ${c.ok} | ${c.claimed} | ${c['needs-fix']} | ${c.deprecated} | ${c.pending} |`
    );
    totals.total += rows.length;
    for (const k of Object.keys(c)) totals[k] += c[k];
  }
  lines.push(
    `| **Total** | **${totals.total}** | **${totals.ok}** | **${totals.claimed}** | **${totals['needs-fix']}** | **${totals.deprecated}** | **${totals.pending}** |`
  );
  lines.push('');
  return lines;
}

// Replace the block starting at a heading until the next '## ' or '---' line.
function replaceBlock(lines, headingRegex, newBlock) {
  const start = lines.findIndex((l) => headingRegex.test(l));
  if (start === -1) return null;
  let end = start + 1;
  while (end < lines.length && !lines[end].startsWith('## ') && !lines[end].startsWith('---')) {
    end++;
  }
  return [...lines.slice(0, start), ...newBlock, ...lines.slice(end)];
}

// --- Modes ---

function check(text) {
  const tracked = parseTracker(text);
  const problems = [];

  for (const section of SECTIONS) {
    const rows = tracked[section.title];
    if (!rows) {
      problems.push(`Section "${section.title}" not found in QA-AUDIT.md`);
      continue;
    }
    const files = masterFiles(section.dir);
    const trackedFiles = new Set(rows.map((r) => r.file));
    for (const f of files) {
      if (!trackedFiles.has(f)) problems.push(`Missing from tracker: ${f}`);
    }
    for (const r of rows) {
      if (!files.includes(r.file) && !r.notes.includes(REMOVED_NOTE)) {
        problems.push(`Tracked but not on ${MASTER_REF}: ${r.file}`);
      }
      if (!STATUSES.includes(r.status)) {
        problems.push(`Unknown status "${r.status}" on ${r.file}`);
      }
    }
    const heading = text.match(new RegExp(`^## ${section.title} \\((\\d+)\\)`, 'm'));
    if (heading && Number(heading[1]) !== rows.length) {
      problems.push(`Heading count for ${section.title} is ${heading[1]}, found ${rows.length} rows`);
    }
  }

  // Progress Summary must match computed counts
  const summary = renderSummary(
    Object.fromEntries(SECTIONS.map((s) => [s.title, tracked[s.title] || []]))
  );
  const docLines = text.split('\n');
  const start = docLines.findIndex((l) => /^## Progress Summary/.test(l));
  if (start === -1) {
    problems.push('Progress Summary section not found');
  } else {
    const current = docLines
      .slice(start)
      .filter((l) => l.startsWith('|'))
      .slice(0, summary.filter((l) => l.startsWith('|')).length)
      .join('\n');
    const expected = summary.filter((l) => l.startsWith('|')).join('\n');
    if (current !== expected) {
      problems.push('Progress Summary counts do not match table rows (run --sync)');
    }
  }

  if (problems.length) {
    console.error(`QA-AUDIT.md is out of sync with ${MASTER_REF}:\n`);
    for (const p of problems) console.error(`  - ${p}`);
    console.error('\nRun: node scripts/audit-sync.js --sync');
    process.exit(1);
  }
  console.log(`QA-AUDIT.md is in sync with ${MASTER_REF}.`);
}

function sync(text) {
  const tracked = parseTracker(text);
  const allRows = {};
  let lines = text.split('\n');

  for (const section of SECTIONS) {
    allRows[section.title] = buildRows(section, tracked[section.title]);
  }
  for (const section of SECTIONS) {
    const block = renderSection(section, allRows[section.title]);
    const replaced = replaceBlock(lines, new RegExp(`^## ${section.title} \\(\\d+\\)`), block);
    if (!replaced) {
      console.error(`Error: section heading "## ${section.title} (N)" not found in QA-AUDIT.md`);
      process.exit(2);
    }
    lines = replaced;
  }
  const replaced = replaceBlock(lines, /^## Progress Summary/, renderSummary(allRows));
  if (!replaced) {
    console.error('Error: "## Progress Summary" heading not found in QA-AUDIT.md');
    process.exit(2);
  }
  lines = replaced;

  fs.writeFileSync(AUDIT_FILE, lines.join('\n'));
  const total = SECTIONS.reduce((n, s) => n + allRows[s.title].length, 0);
  console.log(`QA-AUDIT.md updated: ${total} files tracked across ${SECTIONS.length} sections.`);
}

// --- Main ---

const text = fs.readFileSync(AUDIT_FILE, 'utf8');
if (SYNC_MODE) {
  sync(text);
} else {
  check(text);
}
