#!/usr/bin/env node
/**
 * LLM-Based Content Review Tool for IPTF Map
 *
 * On-demand review of markdown files using Claude API to:
 * - Verify ERC/EIP numbers against ethereum.org
 * - Check claims against GLOSSARY.md definitions
 * - Flag potential hallucinations or inconsistencies
 * - Verify cross-document consistency
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... node scripts/llm-review.js <file.md>
 *   ANTHROPIC_API_KEY=sk-... node scripts/llm-review.js patterns/pattern-*.md
 *
 * Environment variables:
 *   ANTHROPIC_API_KEY - Required: Your Anthropic API key
 *   LLM_MODEL - Optional: Model to use (default: claude-sonnet-4-20250514)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const GLOSSARY_PATH = path.join(ROOT_DIR, 'GLOSSARY.md');
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

/**
 * Make an API request to Claude
 */
async function callClaude(prompt, systemPrompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  const model = process.env.LLM_MODEL || DEFAULT_MODEL;

  const requestBody = JSON.stringify({
    model: model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }]
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`API error ${res.statusCode}: ${data}`));
          return;
        }
        try {
          const response = JSON.parse(data);
          resolve(response.content[0].text);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

/**
 * Load and parse GLOSSARY.md for reference
 */
function loadGlossary() {
  const content = fs.readFileSync(GLOSSARY_PATH, 'utf8');
  return content;
}

/**
 * Extract ERC/EIP references from content
 */
function extractStandardRefs(content) {
  const refs = new Set();
  const patterns = [
    /ERC-?(\d+)/gi,
    /EIP-?(\d+)/gi
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const num = match[1];
      const prefix = match[0].toUpperCase().startsWith('ERC') ? 'ERC' : 'EIP';
      refs.add(`${prefix}-${num}`);
    }
  }

  return Array.from(refs);
}

/**
 * Review a single file with Claude
 */
async function reviewFile(filePath) {
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const glossary = loadGlossary();
  const standardRefs = extractStandardRefs(content);

  console.log(`${colors.cyan}Reviewing: ${fileName}${colors.reset}`);
  console.log(`  Found ${standardRefs.length} standard references: ${standardRefs.join(', ') || 'none'}`);

  const systemPrompt = `You are a technical documentation reviewer for the Institutional Privacy Task Force (IPTF) Map, a public reference repository for privacy-preserving solutions in enterprise Ethereum.

Your task is to review documentation for:
1. Technical accuracy and consistency
2. Hallucinated or incorrect claims
3. Inconsistent terminology compared to the GLOSSARY
4. Invalid ERC/EIP references
5. Marketing language that should be neutral

GLOSSARY.md contents for reference:
${glossary}

Output your review as a structured report with these sections:
## Summary
Brief overall assessment (1-2 sentences)

## Standard References Check
List each ERC/EIP number found and verify if it appears legitimate based on your knowledge. Flag any that seem incorrect or non-existent.

## Terminology Consistency
Note any terms that don't match the GLOSSARY definitions or use inconsistent spellings.

## Potential Issues
List any claims that seem inaccurate, exaggerated, or potentially hallucinated.

## Suggestions
Concrete improvements to make the content more accurate and trustworthy.

Be direct and specific. Only flag actual issues, not stylistic preferences.`;

  const prompt = `Please review this documentation file for the IPTF Map repository:

File: ${fileName}

Content:
${content}

Standard references found: ${standardRefs.join(', ') || 'none'}

Please provide your review following the structured format.`;

  try {
    console.log(`  ${colors.yellow}Calling Claude API...${colors.reset}`);
    const review = await callClaude(prompt, systemPrompt);
    return { file: fileName, success: true, review };
  } catch (error) {
    return { file: fileName, success: false, error: error.message };
  }
}

/**
 * Print review results
 */
function printReview(result) {
  console.log('');
  console.log(`${colors.bold}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bold}Review: ${result.file}${colors.reset}`);
  console.log('='.repeat(60));

  if (!result.success) {
    console.log(`${colors.red}Error: ${result.error}${colors.reset}`);
    return;
  }

  console.log(result.review);
  console.log('');
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.bold}LLM Content Review Tool for IPTF Map${colors.reset}

Usage:
  ANTHROPIC_API_KEY=sk-... node scripts/llm-review.js <file.md> [file2.md ...]

Examples:
  node scripts/llm-review.js patterns/pattern-dvp-erc7573.md
  node scripts/llm-review.js patterns/pattern-*.md
  node scripts/llm-review.js vendors/aztec.md

Environment variables:
  ANTHROPIC_API_KEY - Required: Your Anthropic API key
  LLM_MODEL        - Optional: Model to use (default: ${DEFAULT_MODEL})

This tool uses Claude to review documentation for:
  - Technical accuracy and hallucinations
  - ERC/EIP reference validity
  - Terminology consistency with GLOSSARY.md
  - Marketing language that should be neutral
`);
    process.exit(0);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(`${colors.red}Error: ANTHROPIC_API_KEY environment variable is required${colors.reset}`);
    console.error('Get your API key at: https://console.anthropic.com/');
    process.exit(1);
  }

  // Resolve file paths
  const files = args
    .filter(arg => !arg.startsWith('-'))
    .map(f => path.resolve(f))
    .filter(f => {
      if (!fs.existsSync(f)) {
        console.warn(`${colors.yellow}Warning: File not found: ${f}${colors.reset}`);
        return false;
      }
      return true;
    });

  if (files.length === 0) {
    console.error(`${colors.red}No valid files to review${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.bold}IPTF Map LLM Content Review${colors.reset}`);
  console.log(`Reviewing ${files.length} file(s)...`);
  console.log('');

  // Review each file
  for (const file of files) {
    const result = await reviewFile(file);
    printReview(result);
  }

  console.log(`${colors.green}Review complete!${colors.reset}`);
}

// Run
main().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
