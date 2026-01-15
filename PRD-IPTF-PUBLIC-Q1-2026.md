# Product Requirements Document: IPTF Q1 2026 Documentation Initiative
**Version:** 2.0 (Revised based on adversarial review)
**Date:** January 2026
**Status:** For Implementation
**Scope:** Documentation, Patterns, Vendor Evaluation
**License:** CC0

---

## Executive Summary

This PRD outlines verifiable, PR-sized documentation tasks for the Institutional Privacy Task Force Q1 2026. The focus is on creating machine-checkable, production-ready documentation for privacy-preserving patterns on Ethereum.

### Key Changes from v1.0
- **CI-first approach** with automated quality gates
- **Generic pattern names** with vendor examples in separate files
- **PR-sized atomic tickets** for ralph-loop execution
- **Existing folder structure** (no new top-level directories)
- **Objective prioritization metrics** replacing subjective HIGH/MEDIUM/LOW

### Success Criteria
- All patterns pass automated Definition of Done checks
- Zero broken cross-references
- No confidential business information
- Each PR is independently mergeable and valuable

---

## 1. Definition of Done & CI Gates [P0 - IMPLEMENT FIRST]

### Pattern Document Requirements

**Required Frontmatter:**
```yaml
---
title: "Pattern: <descriptive name>"
status: draft|ready
maturity: experimental|pilot|production
layer: L1|L2|offchain|hybrid
privacy_goal: <one line description>
assumptions: <key trust/infrastructure assumptions>
last_reviewed: YYYY-MM-DD
---
```

**Required Sections (enforced by CI):**
1. **Intent** - Problem this pattern solves (1 paragraph)
2. **Ingredients** - Standards, infrastructure, services needed
3. **Protocol** - 5-8 numbered steps maximum
4. **Guarantees** - What is hidden/proven, atomicity, finality
5. **Trade-offs** - Performance, cost, failure modes
6. **Example** - Concrete scenario with generic institutions
7. **See also** - Cross-links to related patterns/vendors

**CI Validation Checks:**
- [ ] Markdown lint (consistent formatting)
- [ ] Required sections present
- [ ] Valid frontmatter fields
- [ ] No broken internal links
- [ ] No vendor-specific pattern names
- [ ] No confidential information patterns
- [ ] File naming convention: `pattern-<kebab-case>.md`

### Vendor Document Requirements

**Required Sections:**
- Overview (neutral, factual)
- Supported Patterns (links to generic patterns)
- Integration Notes
- Performance Claims (with sources)
- Regulatory Alignment

### Confidentiality Checklist
- [ ] No real institution names in examples
- [ ] No actual transaction volumes or values
- [ ] No proprietary implementation details
- [ ] Generic examples only (Bank A, Bank B)
- [ ] No business-sensitive information

---

## 2. Objective Prioritization Framework

Each deliverable scored on:

| Metric | Weight | Measurement |
|--------|--------|-------------|
| **Request Frequency** | 40% | Times asked in IPTF discussions |
| **Dependency Count** | 30% | Number of other docs that reference it |
| **Tech Change Rate** | 20% | Monthly updates needed (inverse score) |
| **Verifiability** | 10% | Can cite sources and bound claims |

**Current Top 10 by Score:**
1. CI Infrastructure (blocks everything else)
2. Private Transaction Broadcasting (high request frequency)
3. TEE Privacy Patterns (high dependency count)
4. Hybrid Privacy Architecture (high request frequency)
5. DvP Atomic Settlement (high dependency count)
6. L2 Privacy Comparison (high verifiability)
7. Identity Attestation Survey (stable tech)
8. Vendor Capability Matrix (high request frequency)
9. Cross-chain Privacy (emerging need)
10. Migration Guides (stable content)

---

## 3. PR-Sized Deliverables (Ralph-Loopable)

### Sprint 0: Infrastructure [Week 1, Days 1-2]

**PR-001: CI Quality Gates** ✅ DONE ([PR #40](https://github.com/ethereum/iptf-map/pull/40))
```
Files: .github/workflows/ci.yml, scripts/validate-patterns.js
DoD: Runs on every PR, blocks merge if checks fail
Size: ~200 lines
```

**PR-002: Pattern Validation Script** ✅ DONE ([PR #40](https://github.com/ethereum/iptf-map/pull/40))
```
Files: scripts/check-frontmatter.py, scripts/check-sections.py
DoD: Validates all required fields and sections
Size: ~150 lines
```

**PR-002b: Remediate Existing Pattern Warnings** ✅ DONE ([PR #42](https://github.com/ethereum/iptf-map/pull/42))
```
Files: 34 pattern files with CI warnings (see GitHub Issue #41)
DoD: All patterns have required frontmatter fields, missing sections added, maturity values standardized
Size: ~10-20 lines per file
Fixes:
- Add `layer`, `privacy_goal`, `assumptions`, `last_reviewed` fields to all patterns
- Add missing sections to: pattern-focil-eip7805.md, pattern-privacy-l2s.md, pattern-shielding.md, pattern-zk-derivative-delta.md
- Standardize maturity values in: pattern-eil.md, pattern-focil-eip7805.md, pattern-lean-ethereum.md, pattern-oif.md, pattern-private-iso20022.md, pattern-zk-spv.md
References: GitHub Issue #41
```

### Sprint 1: Core Patterns [Week 1, Days 3-5]

**PR-003: Private Transaction Broadcasting Pattern** ✅ DONE ([PR #43](https://github.com/ethereum/iptf-map/pull/43))
```
File: patterns/pattern-private-transaction-broadcasting.md
DoD: All sections complete, 3+ vendor examples in See Also
Size: ~150 lines
Related vendors: Flashbots, Shutter, SUAVE
```

**PR-004: TEE Privacy Pattern** ✅ DONE ([PR #44](https://github.com/ethereum/iptf-map/pull/44))
```
File: patterns/pattern-tee-based-privacy.md
DoD: Trust model explicit, failure modes documented
Size: ~150 lines
Covers: Intel SGX, AMD SEV, AWS Nitro approaches
```

**PR-005: Threshold Encrypted Mempool Pattern** ✅ DONE ([PR #45](https://github.com/ethereum/iptf-map/pull/45))
```
File: patterns/pattern-threshold-encrypted-mempool.md
DoD: Protocol steps clear, committee assumptions stated
Size: ~150 lines
```

### Sprint 2: Architectural Patterns [Week 2]

**PR-006: Hybrid Privacy Architecture**
```
File: patterns/pattern-hybrid-public-private-modes.md
DoD: Mode switching mechanics, compliance hooks documented
Size: ~175 lines
```

**PR-007: Modular Privacy Layers Pattern**
```
File: patterns/pattern-modular-privacy-stack.md
DoD: Layer boundaries defined, composability explained
Size: ~150 lines
```

**PR-008: White-label Infrastructure Pattern**
```
File: patterns/pattern-white-label-deployment.md
DoD: Governance model, upgrade paths documented
Size: ~150 lines
```

**PR-009: Enhanced DvP Pattern**
```
File: patterns/pattern-delivery-vs-payment-atomic.md
DoD: Payment locking mechanics, escrow conditions clear
Size: ~175 lines
References: ERC-7573, EIP-6123
```

**PR-010: Cross-chain Privacy Bridge Pattern**
```
File: patterns/pattern-cross-chain-privacy-bridge.md
DoD: Trust assumptions explicit, verification steps detailed
Size: ~150 lines
```

**PR-010b: vOPRF Privacy Pattern**
```
File: patterns/pattern-voprf-nullifiers.md
DoD: Pattern card with intent, ingredients, protocol steps; maps to credential/signal mechanisms; vendor examples in See Also if applicable
Size: ~150 lines
References: GitHub Issue #24
```

### Sprint 3: Documentation & Analysis [Week 3]

**PR-011: L2 Privacy Comparison**
```
File: domains/layer2-privacy-comparison.md
DoD: Tabular comparison, performance ranges with sources
Size: ~300 lines
Covers: Aztec, Polygon Miden, Scroll, Taiko, Linea
```

**PR-012: Standards Survey**
```
File: approaches/approach-privacy-standards-survey.md
DoD: Existing EIPs mapped, gaps identified, no new standards created
Size: ~250 lines
Covers: ERC-3643, ERC-7573, EIP-5564, EIP-6123, EIP-78
```

**PR-013: Vendor Capability Matrix**
```
File: vendors/README.md (enhancement)
DoD: 15+ vendors evaluated, capabilities mapped to patterns
Size: ~400 lines
```

**PR-014: MEV Protection Guide**
```
File: approaches/approach-mev-protection-institutional.md
DoD: Multiple strategies compared, integration steps provided
Size: ~200 lines
```

**PR-015: Migration from Enterprise Chains**
```
File: approaches/approach-enterprise-to-ethereum-migration.md
DoD: Decision tree, common pitfalls, case studies (anonymized)
Size: ~250 lines
```

### Sprint 4: Pattern Completion [Week 4]

**PR-016 through PR-021: Complete Stub Patterns**
```
Files:
- patterns/pattern-secondary-market-rfq-batching.md
- patterns/pattern-key-management-threshold.md
- patterns/pattern-cash-leg-tokenization.md
- patterns/pattern-derivative-settlement.md
- patterns/pattern-performance-optimization.md
- patterns/pattern-eligibility-attestation.md
DoD: Each passes CI checks
Size: ~150 lines each
```

### Sprint 5: Use Cases [Week 4-5]

**PR-022 through PR-026: Core Use Cases**
```
Files:
- use-cases/private-payments.md
- use-cases/tokenized-deposits.md
- use-cases/private-lending.md
- use-cases/liquidity-management.md
- use-cases/money-market-funds.md
DoD: References 2+ patterns each, includes recommended approach
Size: ~200 lines each
```

### Sprint 6: Client-Side Proving & Compliance [Week 5-6]

> **Problem Context:** Private payments require both (1) efficient ZK proving on user devices for maximum privacy, and (2) compliance infrastructure for institutional adoption. Current gaps identified via IPTF discussions and PSE roadmap alignment.

**PR-027: Client-Side Proving Pattern**
```
File: patterns/pattern-client-side-proving.md
Problem: Users need to generate ZK proofs locally (mobile, browser) to avoid trusting servers with private data, but device constraints (RAM, CPU, battery) limit proving feasibility.
DoD: Mobile/browser proving strategies, device constraints table, delegation fallback options
Size: ~175 lines
References: PSE Roadmap (Mopro, Noir acceleration), Aztec PXE, Miden edge execution
```

**PR-028: Proof Delegation Pattern**
```
File: patterns/pattern-proof-delegation.md
Problem: When client-side proving exceeds device capabilities, users need privacy-preserving delegation options with clear trust trade-offs.
DoD: Delegation approaches (trusted, TEE, MPC), trust model comparison, when to delegate vs prove locally
Size: ~150 lines
Cross-refs: pattern-client-side-proving.md, pattern-tee-key-manager.md
```

**PR-029: Proving Infrastructure Comparison**
```
File: domains/proving-infrastructure-comparison.md
Problem: No centralized comparison of ZK proving systems (Barretenberg, Winterfell, Halo2, etc.) with benchmarks for institutional decision-making.
DoD: Prover comparison matrix, resource requirements, proving time benchmarks with sources
Size: ~250 lines
Covers: Barretenberg, Winterfell, Halo2, SnarkJS, RISC Zero
```

**PR-030: Compliance Monitoring Pattern**
```
File: patterns/pattern-compliance-monitoring.md
Problem: Institutions need transaction monitoring and alerting for AML/CFT compliance, but this conflicts with privacy goals. No pattern documents the trade-offs.
DoD: Transaction screening approaches, alert thresholds, escalation procedures, privacy vs auditability trade-offs
Size: ~175 lines
Cross-refs: pattern-regulatory-disclosure-keys-proofs.md, pattern-verifiable-attestation.md
```

**PR-031: Payment Policy Enforcement Pattern**
```
File: patterns/pattern-payment-policy-enforcement.md
Problem: Private payments need policy controls (who can pay whom, limits, approval workflows) but existing patterns (MPC, TEE) mention this only tangentially.
DoD: Policy specification templates, approval workflows, limit escalation, cross-border restrictions
Size: ~150 lines
Cross-refs: pattern-mpc-custody.md, pattern-erc3643-rwa.md
```

**PR-032: Private Payments Approach Enhancement**
```
File: approaches/approach-private-payments.md (enhancement)
Problem: Current approach lacks CSP considerations and compliance requirements matrix.
DoD: Add client-side proving section, compliance requirements matrix linking to new patterns
Size: +100 lines enhancement
```

---

## 4. Documentation Requirements (Replacing Performance Targets)

### Required Performance Documentation

Each pattern MUST document:
- **Assumptions**: Network (L1/L2), load conditions, hardware
- **Measured/Claimed Ranges**: With sources and dates
- **Cost Estimates**: Gas usage, proof generation, storage
- **Latency Characteristics**: Best/typical/worst case
- **Scalability Limits**: When pattern breaks down
- **Unknown/Variable**: Explicitly marked as "TBD" or "network-dependent"

Example format:
```markdown
## Performance Characteristics
- **Network**: Ethereum L2 (Arbitrum)
- **Throughput**: 100-500 TPS (source: Arbitrum docs, Jan 2025)
- **Cost**: $0.05-0.20 per transaction (measured Dec 2024)
- **Finality**: 1-2 seconds typical, 15 seconds worst-case
- **Assumptions**: 100 gwei L1 gas price, standard ERC20 transfer
- **Unknowns**: Cross-L2 bridge latency (network-dependent)
```

---

## 5. Realistic Timeline

### Week 1: Foundation & Infrastructure
- **Days 1-2**: CI infrastructure (PR-001, PR-002)
- **Days 3-5**: Core privacy patterns (PR-003 through PR-005)
- **Review checkpoint**: All patterns pass CI

### Week 2: Architecture & Standards
- **Days 1-3**: Architectural patterns (PR-006 through PR-008)
- **Days 4-5**: DvP and cross-chain patterns (PR-009, PR-010)
- **Review checkpoint**: Cross-references validated

### Week 3: Analysis & Documentation
- **Days 1-2**: L2 comparison and standards survey (PR-011, PR-012)
- **Days 3-4**: Vendor matrix and guides (PR-013, PR-014)
- **Day 5**: Migration documentation (PR-015)
- **Review checkpoint**: External sources verified

### Week 4: Completion & Use Cases
- **Days 1-3**: Complete stub patterns (PR-016 through PR-021)
- **Days 4-5**: Begin use cases (PR-022, PR-023)
- **Review checkpoint**: All patterns complete

### Week 5: Finalization
- **Days 1-3**: Remaining use cases (PR-024 through PR-026)
- **Days 4-5**: Cross-reference validation, final review
- **Review checkpoint**: All CI checks green

### Week 6: Client-Side Proving & Compliance
- **Days 1-2**: CSP patterns (PR-027, PR-028)
- **Days 3-4**: Proving comparison and compliance monitoring (PR-029, PR-030)
- **Day 5**: Policy enforcement and approach enhancement (PR-031, PR-032)
- **Final checkpoint**: All Sprint 6 patterns pass CI, cross-refs validated

---

## 6. Risk Mitigation

| Risk | Impact | Mitigation | Owner |
|------|--------|------------|-------|
| CI complexity | Delays all work | Implement minimal viable checks first | DevOps |
| Pattern scope creep | PRs too large | Enforce 150-200 line limit | Reviewers |
| Vendor bias | Credibility loss | Mandatory neutrality review | Legal |
| Missing dependencies | Broken links | Daily link checker runs | CI |
| Confidential info leak | Legal risk | Pre-commit hooks, review checklist | All |

---

## 7. Success Metrics

### Quantitative (Automated)
- [ ] 100% patterns pass CI validation
- [ ] Zero broken cross-references
- [ ] All PRs under 400 lines
- [ ] 15+ vendors documented
- [ ] 90% PRs merged within 2 days

### Qualitative (Review-based)
- [ ] Clear implementation guidance
- [ ] Vendor-neutral tone verified
- [ ] No confidential information
- [ ] Patterns referenced by external teams
- [ ] Positive developer feedback

---

## 8. Repository Structure (Using Existing Folders)

```
iptf-map/
├── .github/
│   └── workflows/
│       └── ci.yml                    # NEW: CI checks
├── patterns/
│   ├── _template.md                  # EXISTING: Pattern template
│   ├── pattern-*.md                  # Generic pattern names only
│   └── README.md                     # UPDATE: Remove TODO, add index
├── approaches/
│   ├── approach-*.md                 # Combines patterns for use cases
│   └── approach-privacy-standards-survey.md  # NEW: Standards survey
├── use-cases/
│   ├── _template.md                  # EXISTING: Use case template
│   └── *.md                          # Business problems
├── vendors/
│   ├── _template.md                  # EXISTING: Vendor template
│   ├── *.md                          # Vendor-specific details
│   └── README.md                     # UPDATE: Add capability matrix
├── domains/
│   ├── layer2-privacy-comparison.md  # NEW: L2 comparison table
│   └── *.md                          # Domain overviews
├── jurisdictions/
│   └── *.md                          # Regulatory frameworks
├── scripts/                          # NEW: Validation scripts
│   ├── validate-patterns.js
│   └── check-frontmatter.py
├── GLOSSARY.md                       # EXISTING: Term definitions
├── README.md                          # EXISTING: Navigation guide
└── CONTRIBUTING.md                    # UPDATE: Add DoD requirements
```

---

## 9. Top 5 Initial PRs (Start Immediately)

> **GitHub Issue Traceability:**
> - PR-002b → Issue #41 (frontmatter remediation)
> - PR-004 → Issue #28 (TEE patterns)
> - PR-010b → Issue #24 (vOPRF solutions)
> - PR-011 → Issue #27 (L2 privacy comparison)

### PR-001: CI Quality Gates [DAY 1]
**Objective**: Block all future PRs that don't meet quality standards
**Files**: `.github/workflows/ci.yml`
**Validation**: Run on this PR itself, must pass

### PR-002: Pattern Validation Script [DAY 1]
**Objective**: Automated checking of required sections
**Files**: `scripts/validate-patterns.js`
**Success**: Validates existing patterns, reports issues

### PR-003: Private Transaction Broadcasting Pattern [DAY 2]
**Objective**: Document MEV protection approaches
**File**: `patterns/pattern-private-transaction-broadcasting.md`
**Success**: First pattern passing all CI checks

### PR-004: TEE Privacy Pattern [DAY 3]
**Objective**: Trust models and failure modes for TEE approaches
**File**: `patterns/pattern-tee-based-privacy.md`
**Success**: Explicit trust assumptions, vendor-neutral

### PR-005: Threshold Encrypted Mempool Pattern [DAY 3]
**Objective**: Document k-of-n threshold encryption for MEV protection
**File**: `patterns/pattern-threshold-encrypted-mempool.md`
**Success**: Protocol steps clear, committee assumptions stated

---

## Appendix A: Pattern File Renaming

| Old (Vendor-Specific) | New (Generic) |
|-----------------------|---------------|
| pattern-private-mempool-flashbots.md | pattern-private-transaction-broadcasting.md |
| pattern-encrypted-broadcasting-shutter.md | pattern-threshold-encrypted-mempool.md |
| pattern-pretrade-privacy-suave.md | pattern-confidential-compute-orderflow.md |
| pattern-tee-privacy.md | pattern-tee-based-privacy.md |

Vendor-specific implementations should be documented in:
- `vendors/flashbots.md`
- `vendors/shutter-network.md`
- `vendors/suave.md`

With cross-references from patterns using "See also" section.

---

## Appendix B: Confidentiality Review Checklist

Before EVERY commit:
- [ ] No real institution names (use Bank A, Bank B, Institution X)
- [ ] No actual transaction amounts (use examples like €5M, $100K)
- [ ] No specific dates of real transactions
- [ ] No internal system names or APIs
- [ ] No performance metrics without public sources
- [ ] No competitive intelligence
- [ ] No regulatory findings not publicly disclosed
- [ ] No individual names or contact information
- [ ] Examples use generic scenarios only

---

## Appendix C: Accuracy Verification Findings (January 2026)

External research conducted via web search to verify claims in repository documentation.

### EIP/ERC Status Updates

| Standard | Status | Notes | Source |
|----------|--------|-------|--------|
| ERC-3643 (T-REX) | **Final** | Production on mainnet, first tokenization standard to achieve Final | [erc3643.org](https://www.erc3643.org/news/ethereum-community-approves-erc3643-as-the-first-tokenization-standard) |
| ERC-4337 (Account Abstraction) | Review | Major bundlers operational | [eips.ethereum.org](https://eips.ethereum.org/EIPS/eip-4337) |
| EIP-5564 (Stealth Addresses) | Draft | Wallet implementations emerging | [eips.ethereum.org](https://eips.ethereum.org/EIPS/eip-5564) |
| EIP-6123 (SDC) | Draft | No major implementations yet | [eips.ethereum.org](https://eips.ethereum.org/EIPS/eip-6123) |
| EIP-7573 (DvP) | Draft | Limited adoption | [eips.ethereum.org](https://eips.ethereum.org/EIPS/eip-7573) |
| EIP-7805 (FOCIL) | Draft | Testnet exploration ongoing | [eips.ethereum.org](https://eips.ethereum.org/EIPS/eip-7805) |

### Vendor Status Updates

| Vendor | Status | Action Needed | Source |
|--------|--------|---------------|--------|
| **MEV-Boost** | ~90% of blocks | Accurate (MEV-Boost overall, not just Flashbots relay) | [rated.network](https://blog.rated.network/blog/merge-mev) |
| **Flashbots relay** | ~70% of MEV-Boost blocks | Flashbots relay dominates within MEV-Boost ecosystem | [relayscan.io](https://www.relayscan.io/) |
| **SUAVE** | Testnet only | Not mainnet yet | Flashbots docs |
| **Shutter** | Gnosis Chain only | Accurate as documented | [shutter.network](https://shutter.network/) |
| **Aztec Connect** | Shutdown March 2023 | Document as historical | [cointelegraph](https://cointelegraph.com/news/privacy-focused-blockchain-network-closes-aztec-connect-tool) |
| **Aztec Noir** | Stable release | Mainnet expected 2025 | Aztec docs |
| **Zama fhEVM** | Testnet | coFHE with Fhenix in development | Zama docs |

### TEE Security Updates

| Platform | Status | Recommendation | Source |
|----------|--------|----------------|--------|
| **Intel SGX** | Deprecated on consumer | Removed from 11th/12th gen+; server Xeon continues | [Intel](https://www.intel.com/content/www/us/en/support/articles/000089326/software/intel-security-products.html), [Wikipedia](https://en.wikipedia.org/wiki/Software_Guard_Extensions) |
| **Intel IAS** | EOL April 2025 | Migrate to DCAP attestation | [Intel Community](https://community.intel.com/t5/Intel-Software-Guard-Extensions/IAS-End-of-Life-Announcement/m-p/1545831) |
| **AMD SEV-SNP** | Current | Recommended alternative for confidential VMs | AMD docs |
| **AWS Nitro** | Stable | No major incidents | AWS docs |

**Key finding**: Intel SGX deprecated on consumer platforms since 2021 (11th gen). Server Xeon continues support. Migration guidance needed in TEE patterns.

### Regulatory Status

| Framework | Status | Effective | Source |
|-----------|--------|-----------|--------|
| **MiCA** | Fully in force | December 30, 2024 | [ESMA](https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica) |
| **DORA** | Applied | January 17, 2025 | [EIOPA](https://www.eiopa.europa.eu/digital-operational-resilience-act-dora_en) |
| **eIDAS 2.0** | In development | TBD | EU Commission |

### Action Items for Repository

- [ ] `pattern-private-transaction-broadcasting.md`: Clarify MEV-Boost vs Flashbots relay coverage
- [ ] `pattern-tee-based-privacy.md`: Add SGX consumer deprecation warning; note server Xeon continues
- [ ] Add Aztec Connect shutdown note (March 2023, not 2024)
- [ ] Verify ERC-3643 references reflect Final status

---

**Document Status**: Ready for Implementation (Sprint 6 added January 2026)
**Next Action**: Continue Sprint 2 (PR-006: Hybrid Privacy Architecture), then proceed through Sprint 6
**Success Criteria**: All PRs pass automated checks, ralph-loop operational
**Sprint 6 Context**: CSP (Client-Side Proving) and compliance patterns added per IPTF discussions and PSE roadmap alignment