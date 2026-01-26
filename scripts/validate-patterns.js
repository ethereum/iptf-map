#!/usr/bin/env node
/**
 * Pattern Validation Script for IPTF Map
 * Validates pattern and vendor documents against PRD requirements
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Initialize JSON Schema validator
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Load schemas
const SCHEMAS_DIR = path.join(__dirname, 'schemas');
let patternSchema, vendorSchema, useCaseSchema, jurisdictionSchema;

try {
  patternSchema = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'pattern.json'), 'utf8'));
  vendorSchema = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'vendor.json'), 'utf8'));
  useCaseSchema = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'use-case.json'), 'utf8'));
  jurisdictionSchema = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'jurisdiction.json'), 'utf8'));
} catch (e) {
  console.warn('Warning: Could not load JSON schemas:', e.message);
}

// Compile validators
const validatePatternSchema = patternSchema ? ajv.compile(patternSchema) : null;
const validateVendorSchema = vendorSchema ? ajv.compile(vendorSchema) : null;
const validateUseCaseSchema = useCaseSchema ? ajv.compile(useCaseSchema) : null;
const validateJurisdictionSchema = jurisdictionSchema ? ajv.compile(jurisdictionSchema) : null;

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

// Required sections for vendor documents
const REQUIRED_VENDOR_SECTIONS = [
  '## What it is',
  '## Fits with patterns',
  '## Architecture',
  '## Links'
];

// Recommended sections for vendor documents (warnings only)
const RECOMMENDED_VENDOR_SECTIONS = [
  '## Not a substitute for',
  '## Privacy domains',
  '## Enterprise demand',
  '## Technical details',
  '## Strengths',
  '## Risks'
];

// Required sections for use case documents
const REQUIRED_USE_CASE_SECTIONS = [
  '## 1) Use Case',
  '## 3) Actors',
  '## 4) Problems',
  '## 5) Recommended Approaches'
];

// Recommended sections for use case documents
const RECOMMENDED_USE_CASE_SECTIONS = [
  '## 6) Open Questions',
  '## 7) Notes'
];

// Required sections for approach documents
const REQUIRED_APPROACH_SECTIONS = [
  '## Overview',
  '## Architecture'
];

// Recommended sections for approach documents
const RECOMMENDED_APPROACH_SECTIONS = [
  '## More details',
  '## Links'
];

// Required sections for jurisdiction documents
const REQUIRED_JURISDICTION_SECTIONS = [
  '## At a Glance',
  '## Core Compliance Expectations',
  '## Actionable Best Practices'
];

// Recommended sections for jurisdiction documents
const RECOMMENDED_JURISDICTION_SECTIONS = [
  '## Key Risks to Watch',
  '## Enterprise Opportunities',
  '## See also'
];

// Required frontmatter for vendors
const REQUIRED_VENDOR_FRONTMATTER = ['title', 'status'];

// Required frontmatter for use cases
const REQUIRED_USE_CASE_FRONTMATTER = ['title', 'primary_domain'];

// Required frontmatter for jurisdictions
const REQUIRED_JURISDICTION_FRONTMATTER = ['title', 'status', 'region'];

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
        // Convert Date objects to strings for schema validation
        for (const key of Object.keys(frontmatter)) {
          if (frontmatter[key] instanceof Date) {
            frontmatter[key] = frontmatter[key].toISOString().split('T')[0];
          }
        }
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

  // JSON Schema validation (if available)
  if (validatePatternSchema && Object.keys(frontmatter).length > 0) {
    const valid = validatePatternSchema(frontmatter);
    if (!valid) {
      for (const error of validatePatternSchema.errors) {
        const path = error.instancePath || 'frontmatter';
        const msg = error.message;
        if (error.keyword === 'additionalProperties') {
          fileWarnings.push(`Schema: unexpected field '${error.params.additionalProperty}' in frontmatter`);
        } else if (error.keyword === 'enum') {
          fileWarnings.push(`Schema: ${path} ${msg}. Allowed: ${error.params.allowedValues.join(', ')}`);
        } else {
          fileWarnings.push(`Schema: ${path} ${msg}`);
        }
      }
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

  // Validate internal links (warning only - enable blocking after fixing existing issues)
  const linkErrors = validateInternalLinks(filePath, content);
  if (linkErrors.length > 0) {
    fileWarnings.push(...linkErrors);
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
 * Validate a single vendor file
 */
function validateVendor(filePath) {
  const fileName = path.basename(filePath);
  const { frontmatter, content } = parseMarkdown(filePath);
  const fileErrors = [];
  const fileWarnings = [];

  // Skip template and README
  if (fileName === '_template.md' || fileName === 'README.md') {
    return;
  }

  // Validate required frontmatter
  for (const field of REQUIRED_VENDOR_FRONTMATTER) {
    if (!frontmatter[field]) {
      fileErrors.push(`Missing required frontmatter field: ${field}`);
    }
  }

  // JSON Schema validation (if available)
  if (validateVendorSchema && Object.keys(frontmatter).length > 0) {
    const valid = validateVendorSchema(frontmatter);
    if (!valid) {
      for (const error of validateVendorSchema.errors) {
        const path = error.instancePath || 'frontmatter';
        if (error.keyword === 'additionalProperties') {
          fileWarnings.push(`Schema: unexpected field '${error.params.additionalProperty}'`);
        } else if (error.keyword === 'enum') {
          fileWarnings.push(`Schema: ${path} ${error.message}. Allowed: ${error.params.allowedValues.join(', ')}`);
        } else {
          fileWarnings.push(`Schema: ${path} ${error.message}`);
        }
      }
    }
  }

  // Validate required sections
  for (const section of REQUIRED_VENDOR_SECTIONS) {
    if (!content.includes(section)) {
      fileWarnings.push(`Missing required section: ${section}`);
    }
  }

  // Check recommended sections
  for (const section of RECOMMENDED_VENDOR_SECTIONS) {
    // Match partial section names (e.g., "## Risks" matches "## Risks and open questions")
    const sectionStart = section.replace('##', '').trim();
    const hasSection = content.split('\n').some(line =>
      line.startsWith('## ') && line.toLowerCase().includes(sectionStart.toLowerCase())
    );
    if (!hasSection) {
      fileWarnings.push(`Consider adding section: ${section}`);
    }
  }

  // Check word count
  const wordCount = countWords(content);
  const limits = WORD_LIMITS.vendors;
  if (wordCount > limits.error) {
    fileErrors.push(`Content too long: ${wordCount} words (max ${limits.error})`);
  } else if (wordCount > limits.warn) {
    fileWarnings.push(`Content length: ${wordCount} words (recommended max ${limits.warn})`);
  }

  // Validate internal links
  const linkErrors = validateInternalLinks(filePath, content);
  if (linkErrors.length > 0) {
    fileWarnings.push(...linkErrors);
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
 * Validate a single use case file
 */
function validateUseCase(filePath) {
  const fileName = path.basename(filePath);
  const { frontmatter, content } = parseMarkdown(filePath);
  const fileErrors = [];
  const fileWarnings = [];

  // Skip template and README
  if (fileName === '_template.md' || fileName === 'README.md') {
    return;
  }

  // Validate required frontmatter
  for (const field of REQUIRED_USE_CASE_FRONTMATTER) {
    if (!frontmatter[field]) {
      fileWarnings.push(`Missing recommended frontmatter field: ${field}`);
    }
  }

  // JSON Schema validation (if available)
  if (validateUseCaseSchema && Object.keys(frontmatter).length > 0) {
    const valid = validateUseCaseSchema(frontmatter);
    if (!valid) {
      for (const error of validateUseCaseSchema.errors) {
        const path = error.instancePath || 'frontmatter';
        if (error.keyword === 'additionalProperties') {
          fileWarnings.push(`Schema: unexpected field '${error.params.additionalProperty}'`);
        } else if (error.keyword === 'enum') {
          fileWarnings.push(`Schema: ${path} ${error.message}. Allowed: ${error.params.allowedValues.join(', ')}`);
        } else {
          fileWarnings.push(`Schema: ${path} ${error.message}`);
        }
      }
    }
  }

  // Validate required sections
  for (const section of REQUIRED_USE_CASE_SECTIONS) {
    if (!content.includes(section)) {
      fileWarnings.push(`Missing required section: ${section}`);
    }
  }

  // Check recommended sections
  for (const section of RECOMMENDED_USE_CASE_SECTIONS) {
    const sectionStart = section.replace('##', '').trim();
    const hasSection = content.split('\n').some(line =>
      line.startsWith('## ') && line.toLowerCase().includes(sectionStart.toLowerCase())
    );
    if (!hasSection) {
      fileWarnings.push(`Consider adding section: ${section}`);
    }
  }

  // Validate internal links
  const linkErrors = validateInternalLinks(filePath, content);
  if (linkErrors.length > 0) {
    fileWarnings.push(...linkErrors);
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
 * Validate a single approach file
 */
function validateApproach(filePath) {
  const fileName = path.basename(filePath);
  const { frontmatter, content } = parseMarkdown(filePath);
  const fileErrors = [];
  const fileWarnings = [];

  // Skip template and README
  if (fileName === '_template.md' || fileName === 'README.md') {
    return;
  }

  // Validate approach file naming
  if (!fileName.startsWith('approach-')) {
    fileWarnings.push('Approach files should start with "approach-"');
  }

  // Validate required sections
  for (const section of REQUIRED_APPROACH_SECTIONS) {
    if (!content.includes(section)) {
      fileWarnings.push(`Missing required section: ${section}`);
    }
  }

  // Check recommended sections
  for (const section of RECOMMENDED_APPROACH_SECTIONS) {
    const sectionStart = section.replace('##', '').trim();
    const hasSection = content.split('\n').some(line =>
      line.startsWith('## ') && line.toLowerCase().includes(sectionStart.toLowerCase())
    );
    if (!hasSection) {
      fileWarnings.push(`Consider adding section: ${section}`);
    }
  }

  // Check word count
  const wordCount = countWords(content);
  const limits = WORD_LIMITS.approaches;
  if (wordCount > limits.error) {
    fileErrors.push(`Content too long: ${wordCount} words (max ${limits.error})`);
  } else if (wordCount > limits.warn) {
    fileWarnings.push(`Content length: ${wordCount} words (recommended max ${limits.warn})`);
  }

  // Validate internal links
  const linkErrors = validateInternalLinks(filePath, content);
  if (linkErrors.length > 0) {
    fileWarnings.push(...linkErrors);
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
 * Validate a single jurisdiction file
 */
function validateJurisdiction(filePath) {
  const fileName = path.basename(filePath);
  const { frontmatter, content } = parseMarkdown(filePath);
  const fileErrors = [];
  const fileWarnings = [];

  // Skip template and README
  if (fileName === '_template.md' || fileName === 'README.md') {
    return;
  }

  // Validate required frontmatter
  for (const field of REQUIRED_JURISDICTION_FRONTMATTER) {
    if (!frontmatter[field]) {
      fileWarnings.push(`Missing recommended frontmatter field: ${field}`);
    }
  }

  // JSON Schema validation (if available)
  if (validateJurisdictionSchema && Object.keys(frontmatter).length > 0) {
    const valid = validateJurisdictionSchema(frontmatter);
    if (!valid) {
      for (const error of validateJurisdictionSchema.errors) {
        const path = error.instancePath || 'frontmatter';
        if (error.keyword === 'additionalProperties') {
          fileWarnings.push(`Schema: unexpected field '${error.params.additionalProperty}'`);
        } else if (error.keyword === 'enum') {
          fileWarnings.push(`Schema: ${path} ${error.message}. Allowed: ${error.params.allowedValues.join(', ')}`);
        } else {
          fileWarnings.push(`Schema: ${path} ${error.message}`);
        }
      }
    }
  }

  // Validate required sections
  for (const section of REQUIRED_JURISDICTION_SECTIONS) {
    if (!content.includes(section)) {
      fileWarnings.push(`Missing required section: ${section}`);
    }
  }

  // Check recommended sections
  for (const section of RECOMMENDED_JURISDICTION_SECTIONS) {
    const sectionStart = section.replace('##', '').trim();
    const hasSection = content.split('\n').some(line =>
      line.startsWith('## ') && line.toLowerCase().includes(sectionStart.toLowerCase())
    );
    if (!hasSection) {
      fileWarnings.push(`Consider adding section: ${section}`);
    }
  }

  // Validate internal links
  const linkErrors = validateInternalLinks(filePath, content);
  if (linkErrors.length > 0) {
    fileWarnings.push(...linkErrors);
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
 * Validate all vendors
 */
function validateAllVendors() {
  console.log('🔍 Validating vendor documents...\n');

  if (!fs.existsSync(VENDORS_DIR)) return;

  const files = fs.readdirSync(VENDORS_DIR);
  const vendorFiles = files.filter(f => f.endsWith('.md'));

  for (const file of vendorFiles) {
    const filePath = path.join(VENDORS_DIR, file);
    validateVendor(filePath);
  }
}

/**
 * Validate all use cases
 */
function validateAllUseCases() {
  console.log('🔍 Validating use case documents...\n');

  if (!fs.existsSync(USE_CASES_DIR)) return;

  const files = fs.readdirSync(USE_CASES_DIR);
  const useCaseFiles = files.filter(f => f.endsWith('.md'));

  for (const file of useCaseFiles) {
    const filePath = path.join(USE_CASES_DIR, file);
    validateUseCase(filePath);
  }
}

/**
 * Validate all approaches
 */
function validateAllApproaches() {
  console.log('🔍 Validating approach documents...\n');

  if (!fs.existsSync(APPROACHES_DIR)) return;

  const files = fs.readdirSync(APPROACHES_DIR);
  const approachFiles = files.filter(f => f.endsWith('.md'));

  for (const file of approachFiles) {
    const filePath = path.join(APPROACHES_DIR, file);
    validateApproach(filePath);
  }
}

/**
 * Validate all jurisdictions
 */
function validateAllJurisdictions() {
  console.log('🔍 Validating jurisdiction documents...\n');

  const jurisdictionsDir = path.join(ROOT_DIR, 'jurisdictions');
  if (!fs.existsSync(jurisdictionsDir)) return;

  const files = fs.readdirSync(jurisdictionsDir);
  const jurisdictionFiles = files.filter(f => f.endsWith('.md'));

  for (const file of jurisdictionFiles) {
    const filePath = path.join(jurisdictionsDir, file);
    validateJurisdiction(filePath);
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
 * Validate specific files passed as arguments
 */
function validateSpecificFiles(files) {
  for (const filePath of files) {
    const absPath = path.resolve(filePath);
    if (!fs.existsSync(absPath)) {
      console.warn(`Warning: File not found: ${filePath}`);
      continue;
    }

    // Determine file type by directory
    if (absPath.includes('/patterns/')) {
      validatePattern(absPath);
    } else if (absPath.includes('/vendors/')) {
      validateVendor(absPath);
    } else if (absPath.includes('/use-cases/')) {
      validateUseCase(absPath);
    } else if (absPath.includes('/approaches/')) {
      validateApproach(absPath);
    } else if (absPath.includes('/jurisdictions/')) {
      validateJurisdiction(absPath);
    } else {
      console.log(`Skipping ${filePath} (not in a content directory)`);
    }
  }
}

/**
 * Main execution
 */
function main() {
  try {
    // Check for file arguments (used by lint-staged)
    const args = process.argv.slice(2);
    const fileArgs = args.filter(arg => arg.endsWith('.md') && !arg.startsWith('--'));
    const hasFileFlag = args.includes('--file') || args.includes('-f');

    if (fileArgs.length > 0 || hasFileFlag) {
      // Validate only specified files
      console.log(`🔍 Validating ${fileArgs.length} file(s)...\n`);
      validateSpecificFiles(fileArgs);
    } else {
      // Validate all files in all directories
      validateAllPatterns();
      validateAllVendors();
      validateAllUseCases();
      validateAllApproaches();
      validateAllJurisdictions();
    }

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