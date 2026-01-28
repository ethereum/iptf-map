# Product Requirements Document: IPTF Q1 2026 Documentation Initiative
**Version:** 3.0 (Restructured based on LLM-Council feedback)
**Date:** January 23, 2026
**Status:** For Implementation
**Scope:** Documentation, Patterns, Vendor Evaluation
**License:** CC0

---

## Executive Summary

This PRD outlines verifiable, PR-sized documentation tasks for the Institutional Privacy Task Force Q1 2026. The focus is on creating machine-checkable, production-ready documentation for privacy-preserving patterns on Ethereum.

### Key Changes from v2.0
- **Stream-based organization** replacing fixed-week sprints
- **External Dependency Policy** with 14-day timeouts and provisional publication
- **Regulatory Criticality metric** (1.2x multiplier for compliance patterns)
- **Split DoD** into [MUST] (CI-verifiable) and [SHOULD] (human-reviewable)
- **Progress Dashboard** with real-time completion tracking
- **Structured task metadata** for AI agent execution

### Key Changes from v1.0 (retained)
- CI-first approach with automated quality gates
- Generic pattern names with vendor examples in separate files
- PR-sized atomic tickets for ralph-loop execution
- Existing folder structure (no new top-level directories)

### Success Criteria
- All patterns pass automated Definition of Done checks
- Zero broken cross-references
- No confidential business information
- Each PR is independently mergeable and valuable

### Progress Dashboard (Updated January 23, 2026)

#### Baseline Scope (v1.0 Goals)

| Stream | Total PRs | Done | In Review | Blocked | Pending | Completion |
|--------|-----------|------|-----------|---------|---------|------------|
| **A: Core Patterns** | 9 | 9 | 0 | 0 | 0 | **100%** |
| **B: Compliance & CSP** | 5 | 0 | 0 | 0 | 5 | **0%** |
| **C: Analysis** | 8 | 0 | 5 | 0 | 3 | **0%** |
| **D: Use Cases** | 11 | 0 | 0 | 0 | 11 | **0%** |
| **Total Baseline** | **33** | **9** | **5** | **0** | **19** | **27%** |

#### Open Pull Requests
- **#65**: feat(use-cases): add 12 use case stubs *(Extended Scope - Deferred)*
- **#64**: feat(approach): Privacy Standards Survey (PR-012)
- **#63**: Update StateLabs.md *(External Contribution)*
- **#61**: feat(pattern): vOPRF Nullifiers (PR-010b)
- **#60**: feat(pattern): Cross-chain Privacy Bridge (PR-010)

#### Extended Scope (Backlog)
| Item | Status | Notes |
|------|--------|-------|
| Nullifier Set Scalability (PR-033) | Backlog | Unprioritized |
| 12 Additional Use Case Stubs (PR #65) | Deferred | Review after baseline use cases complete |

#### Known Technical Debt
- 7 patterns exceed 800-word recommendation (need trimming)
- 2 broken internal links pending fix
- Intel SGX deprecation warning needed in TEE pattern

---

## 1. Definition of Done & CI Gates [P0 - IMPLEMENT FIRST]

### Task Schema for AI Agents

Each task in Section 3 uses structured YAML metadata for machine-readability:

```yaml
task_id: PR-XXX
file: <path/to/file.md>
status: pending|in_progress|in_review|blocked|done
dod:
  must: [CI-verifiable requirements]    # Blocks merge if unmet
  should: [Human-reviewable quality]    # Best effort, reviewer discretion
blocked_by: [PR-XXX, PR-YYY]            # Cannot start until these complete
blocks: [PR-ZZZ]                        # These wait on this task
external_dependency: "<description>"     # If blocked on non-PR work
timeout_date: YYYY-MM-DD                # For external dependencies
regulatory_critical: true|false         # 1.2x priority multiplier
```

**DoD Categories:**
- **[MUST]**: CI-verifiable. Automated checks block merge. Examples: required sections present, no broken links, passes markdown lint.
- **[SHOULD]**: Human-reviewable. Improves quality but not enforced automatically. Examples: clear examples, good cross-references, appropriate detail level.

### Pattern Document Requirements

**Required Frontmatter:**
```yaml
---
title: "Pattern: <descriptive name>"
status: draft|ready|provisional
maturity: experimental|pilot|production
layer: L1|L2|offchain|hybrid
privacy_goal: <one line description>
assumptions: <key trust/infrastructure assumptions>
last_reviewed: YYYY-MM-DD
# Optional for provisional documents:
provisional_reason: "<what is pending>"
provisional_since: YYYY-MM-DD
follow_up_issue: "#XX"
---
```

**Required Sections (enforced by CI) [MUST]:**
1. **Intent** - Problem this pattern solves (1 paragraph)
2. **Ingredients** - Standards, infrastructure, services needed
3. **Protocol** - 5-8 numbered steps maximum
4. **Guarantees** - What is hidden/proven, atomicity, finality
5. **Trade-offs** - Performance, cost, failure modes
6. **Example** - Concrete scenario with generic institutions
7. **See also** - Cross-links to related patterns/vendors

**Quality Guidelines [SHOULD]:**
- Under 800 words (1-2 screens)
- 3+ cross-references in See Also
- Concrete, actionable protocol steps
- Sources cited for performance claims

**CI Validation Checks [MUST]:**
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

## 1.5 External Dependency & Timeout Policy

Tasks requiring external input (vendor feedback, regulatory clarification, third-party review) follow a structured timeout protocol to prevent indefinite blocking.

### Timeout Rules

| Dependency Type | Default Timeout | Extension Policy |
|----------------|-----------------|------------------|
| Vendor feedback | 14 days | +7 days if vendor confirms engagement |
| Regulatory clarification | 21 days | Case-by-case based on agency |
| External review | 14 days | +7 days with documented progress |
| Third-party data | 14 days | Proceed without if unavailable |

### State Transitions

```
Planning → Active → [Timeout OR Complete]
              ↓
         Provisional
              ↓
     [Input Received → Complete]
     [No Input → Finalize as-is]
```

### Provisional Publication Protocol

When a task times out awaiting external input:

1. **Mark as Provisional**: Add `⚠️ Provisional` badge to document frontmatter
2. **Document Gap**: Clearly state what information is pending
3. **Publish**: Merge with provisional status
4. **Track**: Create follow-up issue for when input arrives
5. **Update**: Remove provisional badge once input incorporated

**Frontmatter for Provisional Documents:**
```yaml
---
status: provisional
provisional_reason: "Awaiting L2 vendor performance benchmarks"
provisional_since: 2026-01-23
follow_up_issue: "#62"
---
```

### Current Blocked Tasks

| Task | Blocked On | Timeout Date | Fallback |
|------|-----------|--------------|----------|
| *(none)* | - | - | - |

---

## 2. Objective Prioritization Framework

Each deliverable scored on:

| Metric | Weight | Measurement |
|--------|--------|-------------|
| **Request Frequency** | 35% | Times asked in IPTF discussions |
| **Dependency Count** | 25% | Number of other docs that reference it |
| **Tech Change Rate** | 20% | Monthly updates needed (inverse score) |
| **Verifiability** | 10% | Can cite sources and bound claims |
| **Regulatory Criticality** | 10% | Required for institutional compliance (1.2x multiplier) |

> **Regulatory Criticality Multiplier:** Tasks marked `regulatory_critical: true` receive a 1.2x score multiplier. This reflects institutional adoption requirements where compliance patterns are prerequisites for production deployment.

**Current Top 10 by Score (Updated January 2026):**

| Rank | Task | Stream | Rationale | Status |
|------|------|--------|-----------|--------|
| 1 | Compliance Monitoring Pattern (PR-030) | B | High regulatory criticality (1.2x), blocks adoption | Pending |
| 2 | Payment Policy Enforcement (PR-031) | B | High regulatory criticality (1.2x), institution requirement | Pending |
| 3 | Client-Side Proving Pattern (PR-027) | B | High dependency count (blocks PR-028, PR-032) | Pending |
| 4 | L2 Privacy Comparison (PR-011) | C | High verifiability, frequently requested | In Review |
| 5 | Cross-chain Privacy Bridge (PR-010) | C | Emerging need, in review | In Review |
| 6 | Standards Survey (PR-012) | C | Stable tech, high verifiability | In Review |
| 7 | vOPRF Nullifiers (PR-010b) | C | Research request (Issue #24) | In Review |
| 8 | Vendor Capability Matrix (PR-013) | C | High request frequency | Pending |
| 9 | Proof Delegation Pattern (PR-028) | B | Dependency of CSP, trust decisions | Pending |
| 10 | Stub Pattern Completion (PR-016-021) | D | Blocks use cases | Pending |

*Note: Stream A (Core Patterns) items removed from Top 10 as all are complete.*

---

## 3. Work Streams & Deliverables

Tasks are organized into parallel work streams based on logical dependencies rather than fixed timelines. Each stream can progress independently once its blockers are resolved.

### Stream A: Core Patterns [Priority 1] ✅ COMPLETE

Foundation patterns that other streams depend on. All completed.

---

**PR-001: CI Quality Gates** ✅ DONE
```yaml
file: .github/workflows/ci.yml, scripts/validate-patterns.js
pr: "#40"
dod:
  must: [CI runs on every PR, blocks merge if checks fail]
  should: [Clear error messages for failures]
blocks: [PR-002, PR-003, PR-004, PR-005]
```

**PR-002: Pattern Validation Script** ✅ DONE
```yaml
file: scripts/check-frontmatter.py, scripts/check-sections.py
pr: "#40"
dod:
  must: [Validates all required fields and sections]
  should: [Reports line numbers for issues]
blocked_by: [PR-001]
blocks: [PR-002b]
```

**PR-002b: Remediate Existing Pattern Warnings** ✅ DONE
```yaml
files: 34 pattern files (see Issue #41)
pr: "#42"
dod:
  must: [All patterns have required frontmatter, missing sections added]
  should: [Maturity values standardized]
blocked_by: [PR-002]
```

**PR-003: Private Transaction Broadcasting Pattern** ✅ DONE
```yaml
file: patterns/pattern-private-transaction-broadcasting.md
pr: "#43"
dod:
  must: [All sections complete, passes CI]
  should: [3+ vendor examples in See Also]
blocked_by: [PR-001]
```

**PR-004: TEE Privacy Pattern** ✅ DONE
```yaml
file: patterns/pattern-tee-based-privacy.md
pr: "#44"
dod:
  must: [Trust model explicit, failure modes documented]
  should: [SGX deprecation warning included]
blocked_by: [PR-001]
```

**PR-005: Threshold Encrypted Mempool Pattern** ✅ DONE
```yaml
file: patterns/pattern-threshold-encrypted-mempool.md
pr: "#45"
dod:
  must: [Protocol steps clear, committee assumptions stated]
  should: [References Shutter implementation]
blocked_by: [PR-001]
```

**PR-006: Hybrid Privacy Architecture** ✅ DONE
```yaml
file: patterns/pattern-hybrid-public-private-modes.md
pr: "#51"
dod:
  must: [Mode switching mechanics documented, passes CI]
  should: [Compliance hooks documented]
blocked_by: [PR-003, PR-004, PR-005]
```

**PR-007: Modular Privacy Layers Pattern** ✅ DONE
```yaml
file: patterns/pattern-modular-privacy-stack.md
pr: "#54"
dod:
  must: [Layer boundaries defined, passes CI]
  should: [Composability explained with examples]
blocked_by: [PR-006]
```

**PR-008: White-label Infrastructure Pattern** ✅ DONE
```yaml
file: patterns/pattern-white-label-deployment.md
pr: "#55"
dod:
  must: [Governance model documented, passes CI]
  should: [Upgrade paths documented]
blocked_by: [PR-007]
```

**PR-009: Enhanced DvP Approach** ✅ DONE
```yaml
file: approaches/approach-dvp-atomic-settlement.md
pr: "#56"
dod:
  must: [Payment locking mechanics clear, escrow conditions documented]
  should: [References ERC-7573, EIP-6123]
blocked_by: [PR-006]
```

---

### Stream B: Compliance & Client-Side Proving [Priority 1]

Critical for institutional adoption. Can proceed in parallel with Stream C.

> **Problem Context:** Private payments require both (1) efficient ZK proving on user devices for maximum privacy, and (2) compliance infrastructure for institutional adoption.

---

**PR-027: Client-Side Proving Pattern**
```yaml
file: patterns/pattern-client-side-proving.md
status: pending
dod:
  must: [Mobile/browser proving strategies, device constraints table]
  should: [Delegation fallback options, PSE roadmap alignment]
blocked_by: []
blocks: [PR-028, PR-032]
size: ~175 lines
references: [PSE Roadmap (Mopro, Noir acceleration), Aztec PXE, Miden edge execution]
```

**PR-028: Proof Delegation Pattern**
```yaml
file: patterns/pattern-proof-delegation.md
status: pending
dod:
  must: [Delegation approaches (trusted, TEE, MPC), trust model comparison]
  should: [When to delegate vs prove locally decision tree]
blocked_by: [PR-027]
blocks: [PR-032]
size: ~150 lines
cross_refs: [pattern-client-side-proving.md, pattern-tee-key-manager.md]
```

**PR-030: Compliance Monitoring Pattern**
```yaml
file: patterns/pattern-compliance-monitoring.md
status: pending
regulatory_critical: true
dod:
  must: [Transaction screening approaches, privacy vs auditability trade-offs]
  should: [Alert thresholds, escalation procedures]
blocked_by: []
blocks: [PR-031, PR-032]
size: ~175 lines
cross_refs: [pattern-regulatory-disclosure-keys-proofs.md, pattern-verifiable-attestation.md]
```

**PR-031: Payment Policy Enforcement Pattern**
```yaml
file: patterns/pattern-payment-policy-enforcement.md
status: pending
regulatory_critical: true
dod:
  must: [Policy specification templates, approval workflows]
  should: [Limit escalation, cross-border restrictions]
blocked_by: [PR-030]
blocks: [PR-032]
size: ~150 lines
cross_refs: [pattern-mpc-custody.md, pattern-erc3643-rwa.md]
```

**PR-032: Private Payments Approach Enhancement**
```yaml
file: approaches/approach-private-payments.md
status: pending
type: enhancement
dod:
  must: [Client-side proving section added, compliance requirements matrix]
  should: [Links to all new patterns in this stream]
blocked_by: [PR-027, PR-028, PR-030, PR-031]
blocks: []
size: +100 lines
```

---

### Stream C: Analysis & Comparisons [Priority 2]

Research and documentation deliverables. Some have external dependencies.

---

**PR-010: Cross-chain Privacy Bridge Pattern**
```yaml
file: patterns/pattern-cross-chain-privacy-bridge.md
status: in_review
pr: "#60"
dod:
  must: [Trust assumptions explicit, verification steps detailed]
  should: [Multi-chain examples]
blocked_by: []
blocks: []
size: ~150 lines
```

**PR-010b: vOPRF Privacy Pattern**
```yaml
file: patterns/pattern-voprf-nullifiers.md
status: in_review
pr: "#61"
dod:
  must: [Intent, ingredients, protocol steps complete]
  should: [Maps to credential/signal mechanisms, vendor examples]
blocked_by: []
blocks: []
size: ~150 lines
references: [Issue #24]
```

**PR-011: L2 Privacy Evaluation Framework** 📝 IN REVIEW
```yaml
file: patterns/pattern-l2-privacy-evaluation.md
status: in_review
note: "Published as provisional - awaiting L2 vendor self-reported metrics"
dod:
  must: [Tabular comparison criteria, evaluation methodology]
  should: [Aztec, Miden, Intmax, Prividium, Scroll Cloak, EY Nightfall]
blocked_by: []
blocks: []
size: ~300 lines
references: [Issue #27 (research), rfps/rfp-benchmark-dashboard.md]
```

**PR-012: Standards Survey**
```yaml
file: approaches/approach-privacy-standards-survey.md
status: in_review
pr: "#64"
dod:
  must: [Existing EIPs mapped, gaps identified]
  should: [No new standards created, clear status for each]
blocked_by: []
blocks: []
size: ~250 lines
covers: [ERC-3643, ERC-7573, EIP-5564, EIP-6123, ERC-7945, ERC-8065]
```

**PR-013: Vendor Capability Matrix**
```yaml
file: vendors/README.md
status: pending
type: enhancement
dod:
  must: [15+ vendors evaluated, capabilities mapped to patterns]
  should: [Sortable/filterable format]
blocked_by: [PR-010, PR-010b]
blocks: []
size: ~400 lines
```

**PR-014: MEV Protection Guide**
```yaml
file: approaches/approach-mev-protection-institutional.md
status: pending
dod:
  must: [Multiple strategies compared, integration steps]
  should: [Cost/benefit analysis per strategy]
blocked_by: [PR-003]
blocks: []
size: ~200 lines
```

**PR-015: Migration from Enterprise Chains**
```yaml
file: approaches/approach-enterprise-to-ethereum-migration.md
status: pending
dod:
  must: [Decision tree, common pitfalls documented]
  should: [Anonymized case studies]
blocked_by: []
blocks: []
size: ~250 lines
```

**PR-029: Proving Infrastructure Comparison**
```yaml
file: domains/proving-infrastructure-comparison.md
status: pending
dod:
  must: [Prover comparison matrix, resource requirements]
  should: [Proving time benchmarks with sources]
blocked_by: [PR-027]
blocks: []
size: ~250 lines
covers: [Barretenberg, Winterfell, Halo2, SnarkJS, RISC Zero]
```

---

### Stream D: Use Case Synthesis [Priority 3]

Depends on patterns being complete. Can begin once core patterns are done.

---

**PR-016 through PR-021: Complete Stub Patterns**
```yaml
files:
  - patterns/pattern-secondary-market-rfq-batching.md
  - patterns/pattern-key-management-threshold.md
  - patterns/pattern-cash-leg-tokenization.md
  - patterns/pattern-derivative-settlement.md
  - patterns/pattern-performance-optimization.md
  - patterns/pattern-eligibility-attestation.md
status: pending
dod:
  must: [Each passes CI checks, all required sections present]
  should: [Cross-references to related patterns]
blocked_by: [PR-002b]
blocks: [PR-022 through PR-026]
size: ~150 lines each
```

**PR-022 through PR-026: Core Use Cases**
```yaml
files:
  - use-cases/private-payments.md
  - use-cases/tokenized-deposits.md
  - use-cases/private-lending.md
  - use-cases/liquidity-management.md
  - use-cases/money-market-funds.md
status: pending
dod:
  must: [References 2+ patterns each, includes recommended approach]
  should: [Clear actor definitions, problem statements]
blocked_by: [PR-016 through PR-021]
blocks: []
size: ~200 lines each
```

---

### Backlog [Unprioritized]

Items not scheduled for current scope. May be promoted based on demand.

---

**PR-033: Nullifier Set Scalability Pattern**
```yaml
file: patterns/pattern-nullifier-set-scalability.md
status: backlog
dod:
  must: [Nullifier bloat problem documented, sync approaches compared]
  should: [Institutional deployment trade-offs]
blocked_by: []
blocks: []
size: ~150 lines
references: [Zcash Tachyon project, oblivious message retrieval research]
```

**Extended Scope: Use Case Stubs (PR #65)**
```yaml
status: deferred
pr: "#65"
note: "12 additional use case stubs beyond baseline scope. Review after core use cases complete."
files: [See PR #65 for full list]
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

## 5. Stream Execution Order

Work proceeds by stream priority, with parallel execution where dependencies allow.

### Phase 1: Foundation ✅ COMPLETE
- **Stream A**: All core patterns complete (PR-001 through PR-009)
- **Checkpoint**: CI infrastructure operational, core patterns pass validation

### Phase 2: Parallel Execution (Current)

| Stream | Focus | Parallelizable? | Blockers |
|--------|-------|-----------------|----------|
| **B** | Compliance & Client-Side | Yes | None |
| **C** | Analysis & Comparisons | Yes | None |
| **D** | Use Case Synthesis | Partial | Blocked on stub completion (PR-016-021) |

**Current Priorities:**
1. Merge open PRs (#60, #61, #64) to unblock Stream C
2. Begin Stream B compliance patterns (PR-030, PR-031) - regulatory critical
3. Begin Stream B client-side proving (PR-027) - high dependency count
4. Complete Stream D stub patterns once bandwidth available

### Phase 3: Synthesis
- Complete use cases (PR-022 through PR-026)
- Finalize approach enhancements (PR-032)
- Cross-reference validation across all streams
- **Checkpoint**: All baseline scope complete

### External Dependency Checkpoints
| Task | Timeout | Fallback Action |
|------|---------|-----------------|
| *(none active)* | - | - |

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

## 9. Current Priority Actions

> **GitHub Issue Traceability:**
> - PR-010b → Issue #24 (vOPRF solutions)
> - PR-011 → Issue #27 (research), Issue #62 (deliverable tracking)

### Immediate: Merge Open PRs
Review and merge pending PRs to unblock downstream work:
- **#60** (PR-010): Cross-chain Privacy Bridge
- **#61** (PR-010b): vOPRF Nullifiers
- **#64** (PR-012): Standards Survey

### Next: Stream B - Regulatory Critical
Start compliance patterns (1.2x priority multiplier):

**PR-030: Compliance Monitoring Pattern**
- **Objective**: Document transaction screening vs privacy trade-offs
- **File**: `patterns/pattern-compliance-monitoring.md`
- **Why Now**: Blocks institutional adoption, regulatory requirement

**PR-031: Payment Policy Enforcement Pattern**
- **Objective**: Policy controls for private payments
- **File**: `patterns/pattern-payment-policy-enforcement.md`
- **Blocked By**: PR-030

### Next: Stream B - Client-Side Proving
High dependency count patterns:

**PR-027: Client-Side Proving Pattern**
- **Objective**: Mobile/browser ZK proving strategies
- **File**: `patterns/pattern-client-side-proving.md`
- **Blocks**: PR-028, PR-029, PR-032

### Parallel: Stream D Prep
Begin stub pattern completion to unblock use cases:

**PR-016-021: Complete 6 Stub Patterns**
- **Files**: See Stream D in Section 3
- **Blocks**: All use cases (PR-022 through PR-026)

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
| ERC-7945 (CT Token) | Draft | Standard for confidential token transfers | [ethereum-magicians](https://ethereum-magicians.org/t/eip-7945-confidential-transactions-supported-token/23586) |
| ERC-8065 (ZK Wrapper) | Draft | Standard for ZK-wrapping existing tokens | [ethereum-magicians](https://ethereum-magicians.org/t/erc-8065-zero-knowledge-token-wrapper/26006) |

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

**Document Status**: v3.0 - Restructured based on LLM-Council feedback (January 23, 2026)
**Key Changes in v3.0**:
- Replaced sprint-based timeline with parallel work streams (A, B, C, D)
- Added External Dependency & Timeout Policy (Section 1.5)
- Added Regulatory Criticality metric (1.2x priority multiplier)
- Split DoD into [MUST] (CI-verifiable) and [SHOULD] (human-reviewable)
- Added Progress Dashboard to Executive Summary
- Updated prioritization to reflect completed work and compliance priorities

**Next Actions**:
1. Merge open PRs (#60, #61, #64)
2. Begin Stream B regulatory-critical patterns (PR-030, PR-031)
3. Begin Stream B client-side proving (PR-027)

**Success Criteria**: All baseline scope PRs pass automated checks, AI agent execution operational