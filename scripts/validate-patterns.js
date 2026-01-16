#!/usr/bin/env node
/**
 * Pattern Validation Script for IPTF Map
 * Validates pattern and vendor documents against PRD requirements
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration
const PATTERNS_DIR = path.join(__dirname, '..', 'patterns');
const VENDORS_DIR = path.join(__dirname, '..', 'vendors');
const APPROACHES_DIR = path.join(__dirname, '..', 'approaches');
const USE_CASES_DIR = path.join(__dirname, '..', 'use-cases');
const ROOT_DIR = path.join(__dirname, '..');
const IS_CI = process.env.CI_MODE === 'strict';

// Word count limits for conciseness
const WORD_LIMITS = {
  patterns: { warn: 800, error: 1500 },
  vendors: { warn: 1000, error: 1800 },
  approaches: { warn: 2000, error: 3000 }
};

// Required frontmatter fields for patterns
const REQUIRED_PATTERN_FRONTMATTER = [
  'title',
  'status',
  'maturity'
];

// New frontmatter fields (warn only for now)
const RECOMMENDED_PATTERN_FRONTMATTER = [
  'layer',
  'privacy_goal',
  'assumptions',
  'last_reviewed'
];

// Required sections in pattern documents
const REQUIRED_PATTERN_SECTIONS = [
  '## Intent',
  '## Ingredients',
  '## Protocol',
  '## Guarantees',
  '## Trade-offs',
  '## Example',
  '## See also'
];

// Validation results
let errors = [];
let warnings = [];

/**
 * Parse markdown file and extract frontmatter and content
 */
function parseMarkdown(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  let frontmatter = {};
  let markdownContent = '';
  let inFrontmatter = false;
  let frontmatterLines = [];

  for (let i = 0; i < lines.length; i++) {
    if (i === 0 && lines[i] === '---') {
      inFrontmatter = true;
      continue;
    }

    if (inFrontmatter && lines[i] === '---') {
      inFrontmatter = false;
      try {
        frontmatter = yaml.load(frontmatterLines.join('\n')) || {};
      } catch (e) {
        errors.push(`${filePath}: Invalid YAML frontmatter - ${e.message}`);
      }
      continue;
    }

    if (inFrontmatter) {
      frontmatterLines.push(lines[i]);
    } else if (!inFrontmatter && lines[i] !== '---') {
      markdownContent += lines[i] + '\n';
    }
  }

  return { frontmatter, content: markdownContent };
}

/**
 * Extract and validate internal markdown links
 */
function validateInternalLinks(filePath, content) {
  const linkErrors = [];
  const dir = path.dirname(filePath);

  // Match markdown links: [text](path)
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const linkPath = match[2];

    // Skip external links, anchors, and special protocols
    if (linkPath.startsWith('http://') ||
        linkPath.startsWith('https://') ||
        linkPath.startsWith('#') ||
        linkPath.startsWith('mailto:')) {
      continue;
    }

    // Handle relative .md links
    if (linkPath.endsWith('.md') || linkPath.includes('.md#')) {
      const mdPath = linkPath.split('#')[0]; // Remove anchor
      const resolvedPath = path.resolve(dir, mdPath);

      if (!fs.existsSync(resolvedPath)) {
        linkErrors.push(`Broken internal link: ${linkPath}`);
      }
    }
  }

  return linkErrors;
}

/**
 * Count words in content (excluding frontmatter and code blocks)
 */
function countWords(content) {
  // Remove code blocks
  let text = content.replace(/```[\s\S]*?```/g, '');
  // Remove inline code
  text = text.replace(/`[^`]+`/g, '');
  // Remove links but keep text
  text = text.replace(/\[([^\]]*)\]\([^)]+\)/g, '$1');
  // Remove markdown formatting
  text = text.replace(/[#*_\[\]]/g, ' ');
  // Split and count
  const words = text.split(/\s+/).filter(w => w.length > 0);
  return words.length;
}

/**
 * Validate pattern file naming convention
 */
function validatePatternFileName(fileName) {
  if (!fileName.startsWith('pattern-')) {
    return 'Pattern files must start with "pattern-"';
  }

  if (!fileName.endsWith('.md')) {
    return 'Pattern files must end with ".md"';
  }

  const nameWithoutExtension = fileName.slice(0, -3);
  if (!/^pattern-[a-z0-9-]+$/.test(nameWithoutExtension)) {
    return 'Pattern names must use kebab-case (lowercase letters, numbers, and hyphens only)';
  }

  // Check for vendor-specific names
  const vendorSpecificPatterns = ['flashbots', 'shutter', 'suave', 'aztec', 'polygon'];
  for (const vendor of vendorSpecificPatterns) {
    if (fileName.includes(vendor)) {
      return `Pattern name contains vendor-specific term "${vendor}" - use generic names instead`;
    }
  }

  return null;
}

/**
 * Validate a single pattern file
 */
function validatePattern(filePath) {
  const fileName = path.basename(filePath);
  const { frontmatter, content } = parseMarkdown(filePath);
  const fileErrors = [];
  const fileWarnings = [];

  // Skip template and README files
  if (fileName === '_template.md' || fileName === 'README.md') {
    return;
  }

  // Validate file naming
  const namingError = validatePatternFileName(fileName);
  if (namingError) {
    fileErrors.push(namingError);
  }

  // Validate required frontmatter
  for (const field of REQUIRED_PATTERN_FRONTMATTER) {
    if (!frontmatter[field]) {
      fileErrors.push(`Missing required frontmatter field: ${field}`);
    }
  }

  // Check recommended frontmatter (warnings only)
  for (const field of RECOMMENDED_PATTERN_FRONTMATTER) {
    if (!frontmatter[field]) {
      fileWarnings.push(`Missing recommended frontmatter field: ${field}`);
    }
  }

  // Validate frontmatter values
  if (frontmatter.status && !['draft', 'ready'].includes(frontmatter.status)) {
    fileErrors.push(`Invalid status value: ${frontmatter.status} (must be 'draft' or 'ready')`);
  }

  if (frontmatter.maturity && !['experimental', 'PoC', 'pilot', 'production', 'prod'].includes(frontmatter.maturity)) {
    fileWarnings.push(`Unexpected maturity value: ${frontmatter.maturity}`);
  }

  // Validate required sections
  for (const section of REQUIRED_PATTERN_SECTIONS) {
    if (!content.includes(section)) {
      // For existing patterns, only warn about missing sections
      const isNewPattern = !fs.existsSync(filePath.replace('feature/ci-infrastructure', 'master'));
      if (IS_CI && isNewPattern) {
        fileErrors.push(`Missing required section: ${section}`);
      } else {
        fileWarnings.push(`Missing required section: ${section}`);
      }
    }
  }

  // Validate internal links (blocking in CI)
  const linkErrors = validateInternalLinks(filePath, content);
  if (linkErrors.length > 0) {
    if (IS_CI) {
      fileErrors.push(...linkErrors);
    } else {
      fileWarnings.push(...linkErrors);
    }
  }

  // Check word count for conciseness
  const wordCount = countWords(content);
  const limits = WORD_LIMITS.patterns;
  if (wordCount > limits.error) {
    fileErrors.push(`Content too long: ${wordCount} words (max ${limits.error})`);
  } else if (wordCount > limits.warn) {
    fileWarnings.push(`Content length: ${wordCount} words (recommended max ${limits.warn})`);
  }

  // Report errors and warnings
  if (fileErrors.length > 0) {
    errors.push(`\n❌ ${fileName}:\n  ${fileErrors.join('\n  ')}`);
  }

  if (fileWarnings.length > 0) {
    warnings.push(`\n⚠️  ${fileName}:\n  ${fileWarnings.join('\n  ')}`);
  }
}

/**
 * Validate all patterns in the patterns directory
 */
function validateAllPatterns() {
  console.log('🔍 Validating pattern documents...\n');

  const files = fs.readdirSync(PATTERNS_DIR);
  const patternFiles = files.filter(f => f.endsWith('.md'));

  for (const file of patternFiles) {
    const filePath = path.join(PATTERNS_DIR, file);
    validatePattern(filePath);
  }
}

/**
 * Generate validation report
 */
function generateReport() {
  const report = [];

  report.push('### Pattern Validation Report\n');

  if (errors.length === 0 && warnings.length === 0) {
    report.push('✅ All patterns pass validation!\n');
  } else {
    if (errors.length > 0) {
      report.push(`#### Errors (${errors.length})`);
      report.push(...errors);
      report.push('');
    }

    if (warnings.length > 0) {
      report.push(`#### Warnings (${warnings.length})`);
      report.push(...warnings);
      report.push('');
    }
  }

  // Write report for GitHub Actions summary
  fs.writeFileSync('validation-report.md', report.join('\n'));

  // Console output
  console.log(report.join('\n'));
}

/**
 * Main execution
 */
function main() {
  try {
    validateAllPatterns();
    generateReport();

    // Exit with error if there are validation errors in CI mode
    if (IS_CI && errors.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Validation script error:', error);
    process.exit(1);
  }
}

// Run validation
main();