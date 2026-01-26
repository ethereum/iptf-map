#!/usr/bin/env node
/**
 * GLOSSARY.md Term Consistency Checker for IPTF Map
 * Parses GLOSSARY.md and checks all files for canonical term usage
 *
 * Usage:
 *   node scripts/check-terminology.js [--fix] [file1.md file2.md ...]
 *
 * Options:
 *   --fix    Show suggested replacements (no auto-fix, just suggestions)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const GLOSSARY_PATH = path.join(ROOT_DIR, 'GLOSSARY.md');
const CONTENT_DIRS = ['patterns', 'vendors', 'approaches', 'use-cases', 'jurisdictions', 'domains'];
const SKIP_FILES = ['_template.md', 'README.md', 'GLOSSARY.md', 'CHANGELOG.md'];

// Term variants to check (canonical -> variants)
// These are common issues that might slip past the Vale substitution rules
const TERM_VARIANTS = {
  'DvP': ['DVP', 'Dvp', 'dvp', 'D v P', 'd v p'],
  'PvP': ['PVP', 'Pvp', 'pvp', 'P v P', 'p v p'],
  'AoR': ['AOR', 'Aor', 'aor', 'A o R', 'a o r'],
  'RFQ': ['rfq', 'Rfq'],
  'TCA': ['tca', 'Tca'],
  'zk-SNARK': ['zkSNARK', 'zkSnark', 'zk-snark', 'ZK-SNARK', 'ZKSNARK', 'Zksnark', 'zk snark', 'ZK SNARK'],
  'zk-STARK': ['zkSTARK', 'zkStark', 'zk-stark', 'ZK-STARK', 'ZKSTARK', 'Zkstark', 'zk stark', 'ZK STARK'],
  'zero-knowledge proof': ['zk proof', 'zk-proof', 'ZKP', 'zkp', 'ZK proof', 'ZK-proof'],
  'Layer 1': ['layer 1', 'layer-1', 'Layer-1', 'L-1'],
  'Layer 2': ['layer 2', 'layer-2', 'Layer-2', 'L-2'],
  'ERC-3643': ['erc-3643', 'ERC3643', 'erc3643', 'Erc-3643', 'Erc3643'],
  'ERC-7573': ['erc-7573', 'ERC7573', 'erc7573', 'Erc-7573', 'Erc7573'],
  'EIP-6123': ['eip-6123', 'EIP6123', 'eip6123', 'Eip-6123', 'Eip6123'],
  'EIP-5564': ['eip-5564', 'EIP5564', 'eip5564', 'Eip-5564', 'Eip5564'],
  'ERC-4337': ['erc-4337', 'ERC4337', 'erc4337', 'Erc-4337', 'Erc4337'],
  'EIP-7805': ['eip-7805', 'EIP7805', 'eip7805', 'Eip-7805', 'Eip7805'],
  'eWpG': ['ewpg', 'EWPG', 'eWPG', 'Ewpg', 'EWpG'],
  'MiCA': ['mica', 'MICA', 'Mica', 'MiCa', 'MICA'],
  'Fully Homomorphic Encryption': ['fully homomorphic encryption', 'FHE encryption'],
  'Trusted Execution Environment': ['trusted execution environment', 'TEE environment'],
  'multi-party computation': ['multiparty computation', 'Multi-Party Computation', 'multi party computation'],
  'Data Availability': ['data availability', 'DA availability'],
  'ONCHAINID': ['OnchainID', 'onchainid', 'OnChainID', 'onChainId', 'Onchainid'],
  // Note: nullifier/commitment are not checked as they can be capitalized in headers
};

// Results tracking
let issues = [];
let fileCount = 0;
let termIssueCount = 0;

/**
 * Parse GLOSSARY.md to extract defined terms
 */
function parseGlossary() {
  const content = fs.readFileSync(GLOSSARY_PATH, 'utf8');
  const terms = [];

  // Match **Term** patterns from glossary
  const termRegex = /\*\*([^*]+)\*\*/g;
  let match;

  while ((match = termRegex.exec(content)) !== null) {
    terms.push(match[1].trim());
  }

  return terms;
}

/**
 * Check a file for terminology inconsistencies
 */
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const relativePath = path.relative(ROOT_DIR, filePath);
  const fileIssues = [];

  // Skip code blocks for checking
  let inCodeBlock = false;
  let inFrontmatter = false;

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];

    // Track frontmatter (YAML between --- markers)
    if (lineNum === 0 && line === '---') {
      inFrontmatter = true;
      continue;
    }
    if (inFrontmatter && line === '---') {
      inFrontmatter = false;
      continue;
    }
    if (inFrontmatter) continue;

    // Track code blocks
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    // Skip inline code
    let lineWithoutCode = line.replace(/`[^`]+`/g, '');

    // Skip URLs (both markdown links and bare URLs)
    lineWithoutCode = lineWithoutCode.replace(/\[[^\]]*\]\([^)]+\)/g, ''); // [text](url)
    lineWithoutCode = lineWithoutCode.replace(/https?:\/\/[^\s)>]+/g, ''); // bare URLs
    lineWithoutCode = lineWithoutCode.replace(/<[^>]+>/g, ''); // <url> format

    // Check for each term variant
    for (const [canonical, variants] of Object.entries(TERM_VARIANTS)) {
      for (const variant of variants) {
        // Create a regex that matches the variant as a whole word
        // Use word boundaries but be careful with special characters
        const escapedVariant = variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<![-\\w])${escapedVariant}(?![-\\w])`, 'g');

        if (regex.test(lineWithoutCode)) {
          fileIssues.push({
            file: relativePath,
            line: lineNum + 1,
            found: variant,
            expected: canonical,
            context: line.trim().substring(0, 80)
          });
          termIssueCount++;
        }
      }
    }
  }

  if (fileIssues.length > 0) {
    issues.push(...fileIssues);
  }
}

/**
 * Get all markdown files from content directories
 */
function getAllMarkdownFiles() {
  const files = [];

  for (const dir of CONTENT_DIRS) {
    const dirPath = path.join(ROOT_DIR, dir);
    if (!fs.existsSync(dirPath)) continue;

    const dirFiles = fs.readdirSync(dirPath);
    for (const file of dirFiles) {
      if (!file.endsWith('.md')) continue;
      if (SKIP_FILES.includes(file)) continue;
      files.push(path.join(dirPath, file));
    }
  }

  return files;
}

/**
 * Generate report
 */
function generateReport() {
  console.log('');
  console.log('='.repeat(60));
  console.log('GLOSSARY.md Term Consistency Report');
  console.log('='.repeat(60));
  console.log('');

  if (issues.length === 0) {
    console.log('✅ All files use canonical terminology!');
    console.log('');
    console.log(`Checked ${fileCount} files.`);
    return 0;
  }

  // Group issues by file
  const byFile = {};
  for (const issue of issues) {
    if (!byFile[issue.file]) {
      byFile[issue.file] = [];
    }
    byFile[issue.file].push(issue);
  }

  console.log(`Found ${termIssueCount} terminology issue(s) in ${Object.keys(byFile).length} file(s):\n`);

  for (const [file, fileIssues] of Object.entries(byFile)) {
    console.log(`\n📄 ${file}`);
    for (const issue of fileIssues) {
      console.log(`   Line ${issue.line}: "${issue.found}" → "${issue.expected}"`);
      console.log(`      Context: ${issue.context}...`);
    }
  }

  console.log('');
  console.log('-'.repeat(60));
  console.log('');
  console.log('Summary:');
  console.log(`  Files checked: ${fileCount}`);
  console.log(`  Files with issues: ${Object.keys(byFile).length}`);
  console.log(`  Total issues: ${termIssueCount}`);
  console.log('');
  console.log('Run with specific files to check only those:');
  console.log('  node scripts/check-terminology.js patterns/pattern-foo.md');
  console.log('');

  return 1;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const showFix = args.includes('--fix');
  const specificFiles = args.filter(arg => arg.endsWith('.md'));

  console.log('🔍 Checking terminology consistency against GLOSSARY.md...\n');

  // Parse glossary for reference
  const glossaryTerms = parseGlossary();
  console.log(`Found ${glossaryTerms.length} terms defined in GLOSSARY.md`);
  console.log(`Checking ${Object.keys(TERM_VARIANTS).length} canonical terms for variants\n`);

  // Get files to check
  let filesToCheck;
  if (specificFiles.length > 0) {
    filesToCheck = specificFiles.map(f => path.resolve(f));
  } else {
    filesToCheck = getAllMarkdownFiles();
  }

  fileCount = filesToCheck.length;
  console.log(`Scanning ${fileCount} files...\n`);

  // Check each file
  for (const filePath of filesToCheck) {
    if (fs.existsSync(filePath)) {
      checkFile(filePath);
    } else {
      console.warn(`Warning: File not found: ${filePath}`);
    }
  }

  // Generate report
  const exitCode = generateReport();

  // Exit with appropriate code for CI
  process.exit(process.env.CI_MODE === 'strict' ? exitCode : 0);
}

// Run
main();
