---
title: "Approach: White-Label Infrastructure Deployment"
status: draft
last_reviewed: 2026-05-05

use_case: private-stablecoins
related_use_cases: [private-bonds, private-derivatives, private-rwa-tokenization, private-treasuries, private-trade-settlement]

primary_patterns:
  - pattern-modular-privacy-stack
supporting_patterns:
  - pattern-tee-based-privacy
  - pattern-privacy-l2s
  - pattern-l2-encrypted-offchain-audit
  - pattern-dvp-erc7573
  - pattern-regulatory-disclosure-keys-proofs
  - pattern-user-controlled-viewing-keys
  - pattern-hybrid-public-private-modes
  - pattern-forced-withdrawal

iptf_pocs:
  folder: pocs/diy-validium
  requirements: pocs/diy-validium/REQUIREMENTS.md
  pocs:
    - name: "DIY Validium"
      sub_approach: "Institution-Controlled Deployment"
      spec: pocs/diy-validium/SPEC.md
      status: implemented

open_source_implementations:
  - url: https://github.com/AztecProtocol/aztec-packages
    description: "Aztec privacy-native L2 (executable layer for white-label)"
    language: TypeScript / Noir
  - url: https://github.com/0xMiden/miden-base
    description: "Miden client-side ZK rollup (executable layer for white-label)"
    language: Rust
---

# Approach: White-Label Infrastructure Deployment

## Problem framing

### Scenario

A bank wants to launch a private-stablecoin service under its own brand within 12 months. Building privacy infrastructure from scratch would take years of R&D; the bank wants to license vendor technology and operate the resulting stack under controlled governance, on dedicated infrastructure, with regulatory-aligned change control.

### Requirements

- Production-grade privacy infrastructure within a 6-12 month deployment window
- Brand identity preserved; customer relationship owned by the institution
- Regulator-aligned change management (institutional or consortium control)
- Exit and migration path defined per layer of the stack
- Composable layers (Data, Execution, Settlement, Disclosure) so each can be upgraded independently

### Constraints

- Vendor licensing relationship for base technology and support
- 24/7 operations team for infrastructure management
- Ethereum mainnet connectivity for settlement and bridging
- Source-code escrow and exit rights negotiated up front

## Approaches

### Vendor-Managed Deployment

```yaml
maturity: production
context: i2i
crops: { cr: low, o: partial, p: full, s: medium }
uses_patterns: [pattern-modular-privacy-stack, pattern-privacy-l2s, pattern-tee-based-privacy, pattern-regulatory-disclosure-keys-proofs]
example_vendors: [aztec, miden, fhenix]
```

**Summary:** Vendor proposes and executes upgrades; institution approves the maintenance window and retains brand and data control but not the upgrade lifecycle.

**How it works:** The institution licenses a vendor stack (Privacy L2, FHE coprocessor, or TEE cluster) and operates it under the institution's brand, with the vendor responsible for code-level upgrades, security patches, and roadmap. Institution holds custody keys, controls bridge admin, and owns the disclosure interface; vendor owns the execution-layer codebase and operations runbook.

**Trust assumptions:**
- Vendor product roadmap remains aligned with institution's needs
- Vendor security and operations practices are auditable
- Source-code escrow is in place for vendor-discontinuation scenarios

**Threat model:**
- Vendor compromise propagates to all white-label deployments
- Vendor product discontinuation forces migration; escrow mitigates but does not eliminate the operational lift
- Upgrade-window constraints may conflict with regulatory change control if the vendor sets the cadence

**Works best when:**
- Time-to-market is the dominant constraint
- Vendor product is mature and the institution accepts the vendor's upgrade cadence
- Regulatory change control can accommodate vendor-driven schedules

**Avoid when:**
- Regulator requires institution to own the full upgrade lifecycle
- Vendor concentration risk is unacceptable; consider Consortium or Institution-Controlled instead

**Implementation notes:** Upgrade cadence runs through the vendor under three risk classes: patch (apply after staging test, low risk); minor (scheduled maintenance window, medium risk); major (full regression, user communication, possible data migration, high risk). Technology migration when a vendor stack becomes obsolete: dual-run period with old and new systems, state migration (export/import balances and contract state), bridge transition, sunset of the old infrastructure.

### Institution-Controlled Deployment

```yaml
maturity: production
context: both
crops: { cr: medium, o: partial, p: full, s: high }
uses_patterns: [pattern-modular-privacy-stack, pattern-privacy-l2s, pattern-l2-encrypted-offchain-audit, pattern-regulatory-disclosure-keys-proofs, pattern-user-controlled-viewing-keys, pattern-forced-withdrawal]
example_vendors: [aztec, miden, fhenix]
```

**Summary:** Institution owns the full upgrade lifecycle; vendor is a technology supplier with a defined support contract; change control runs through the institution's regulated process. End-user privacy is preserved against the institution itself through user-held viewing keys and forced-exit primitives, not just against external observers.

**How it works:** Institution licenses vendor source under terms that allow institution-side audit, build, and deploy. Upgrades run through the institution's standard change-management gate (security review, regression testing, regulator notification where required). Vendor is contracted for L3 support and roadmap consultation; the production deployment, monitoring, and incident response sit with the institution's team. Critically, the institution as operator does not hold master viewing keys for user state: end users custody their own viewing keys ([User-Controlled Viewing Keys](../patterns/pattern-user-controlled-viewing-keys.md)), regulator disclosure is scoped per request via [Regulatory Disclosure Keys & Proofs](../patterns/pattern-regulatory-disclosure-keys-proofs.md), and any user can self-exit to L1 via [Forced Withdrawal](../patterns/pattern-forced-withdrawal.md).

**Trust assumptions:**
- Institution has the engineering capacity to own the codebase and operations
- Vendor support contract covers escalation paths
- Source escrow and audit rights are in place
- User-privacy primitives (user-controlled viewing keys, forced exit) are deployed and not under institutional admin keys

**Threat model:**
- Institution operations error or security gap is the dominant risk; mitigated by mature SRE practices
- Vendor coordination on critical patches must remain timely
- Forced-exit primitive (L1 escape hatch) is required for users to recover when the institution's operator path fails
- Institution-as-operator turning into a panopticon (master viewing keys, blanket disclosure) is the structural risk this governance model creates; mitigated only if user-controlled viewing keys and per-request regulator disclosure are load-bearing in the deployment, not optional

**Works best when:**
- Regulatory change control demands institution ownership of the upgrade path
- Engineering capacity to own the stack exists or can be acquired
- Long-term strategic commitment to the privacy product is in place

**Avoid when:**
- Time-to-market dominates and engineering capacity is unavailable
- Institution does not have the operational maturity to run privacy-critical infrastructure

**Implementation notes:** Reference build at [DIY Validium](https://github.com/ethereum/iptf-pocs/tree/master/pocs/diy-validium), an institution-controlled validium PoC (account-based validium with off-chain state, on-chain roots, ZK validity proofs via RISC Zero) demonstrating the same architecture as ZKsync Prividium with compliance logic expressed as Rust guest programs. Exit strategies must be documented at deployment for each scenario class:

| Scenario | Approach |
|---|---|
| Vendor discontinues product | Source-code escrow; plan migration |
| Better technology emerges | Evaluate migration cost vs benefit |
| Regulatory change | Assess compliance gap; remediate or migrate |
| Strategy shift | Graceful wind-down with user notification |
| Operator or sequencer offline | [Forced Withdrawal](../patterns/pattern-forced-withdrawal.md) via L1 escape hatch; users self-exit within bounded time |

### Consortium Deployment

```yaml
maturity: prototyped
context: i2i
crops: { cr: high, o: partial, p: full, s: high }
uses_patterns: [pattern-modular-privacy-stack, pattern-privacy-l2s, pattern-dvp-erc7573, pattern-regulatory-disclosure-keys-proofs, pattern-hybrid-public-private-modes]
example_vendors: [aztec, miden, fhenix, ey]
```

**Summary:** Multiple institutions jointly govern a shared private infrastructure; upgrade decisions, operator rotation, and disclosure policy run through a consortium charter.

**How it works:** A consortium of institutions establishes a shared private rollup or privacy network with a multi-operator sequencer set, joint governance, and a common disclosure framework. Each member operates one or more nodes; upgrades require consortium quorum; bridge admin is multi-sig across members. Vendor is the technology supplier; consortium is the governance authority.

**Trust assumptions:**
- Consortium governance charter is enforceable across members
- Multi-operator set is operationally diverse (jurisdictions, vendors, infrastructure)
- Joint disclosure framework is agreed and audited

**Threat model:**
- Consortium capture (majority collusion) corrupts the shared network
- Inter-member governance disputes stall upgrades or force fork
- Cross-member liquidity and disclosure flows must respect each member's home regulator

**Works best when:**
- Shared market infrastructure is the goal (interbank settlement, industry consortium, central-bank pilot)
- Member set is administratively committed to long-term joint governance
- Multi-jurisdictional operator diversity satisfies regulators across members

**Avoid when:**
- Inter-member governance overhead exceeds the value of joint infrastructure
- A single member's regulator does not accept the consortium's disclosure framework

## Comparison

| Axis | Vendor-Managed | Institution-Controlled | Consortium |
|---|---|---|---|
| **Maturity** | production | production | prototyped |
| **Context** | i2i | both | both |
| **CROPS** | CR:lo O:part P:full S:med | CR:med O:part P:full S:hi | CR:hi O:part P:full S:hi |
| **Trust model** | Vendor governance | Institution change-control | Consortium charter |
| **Privacy scope** | Full (per stack) | Full (per stack) | Full (per stack); inter-member disclosure framework |
| **Performance** | Vendor-managed ops | Institution-managed ops | Multi-operator coordination |
| **Operator req.** | Vendor + institution | Institution | Multi-operator consortium |
| **Cost class** | Subscription + ops | Engineering + ops | Member fees + joint ops |
| **Regulatory fit** | Conditional (vendor cadence) | Strong (institution-led) | Strong (multi-jurisdiction) |
| **Failure modes** | Vendor compromise; product discontinuation | Institution operations gap; vendor support latency | Consortium capture; governance dispute |

## Persona perspectives

### Business perspective

For institutions whose dominant constraint is time-to-market, **Vendor-Managed Deployment** is the right default: production-grade privacy infrastructure under the institution's brand within months, with the vendor retaining the engineering lift. **Institution-Controlled** is the right call for long-term strategic commitments where the institution intends to own the stack and the regulator demands change-control sovereignty. **Consortium** is the choice for shared market infrastructure (interbank settlement, central-bank pilots, industry utilities) where multi-party governance is itself the requirement.

### Technical perspective

The technical work is the same across all three governance models, deploy the [Modular Privacy Stack](../patterns/pattern-modular-privacy-stack.md) layers (Data, Execution, Settlement, Disclosure) and select vendor components per layer. The difference is who carries the engineering lift. Vendor-Managed minimizes institution-side engineering but creates vendor dependency at the operations level. Institution-Controlled requires building or acquiring an SRE team that can operate privacy-critical infrastructure under regulated change control. Consortium adds the inter-operator coordination overhead (testing across nodes, joint upgrade cadence, multi-sig admin). Forced-withdrawal primitives are mandatory across all three so that user-level recovery does not depend on any single operator.

### Legal & risk perspective

Each governance model implies a distinct legal posture. **Vendor-Managed** treats the vendor as a critical third party under outsourcing rules; the regulator review centers on vendor due diligence, source escrow, exit rights, and the change-control delegation. **Institution-Controlled** is the cleanest under regulated change control: the institution is the licensee and the operator, and the regulator review is the standard infrastructure review. The institution-as-operator must explicitly bind itself out of master-key custody for end-user state: deployment documentation should record that user viewing keys are user-held, regulator disclosure is per-request and scope-bound, and forced exit is reachable without operator cooperation. Without that binding, the deployment loses its end-user privacy posture even if the chain-observer view is hidden. **Consortium** requires joint governance documentation: charter enforceability, member-fee structure, dispute resolution, and the disclosure framework that satisfies each member's home regulator. Cross-border consortium deployments must address the jurisdictional diversity of member operators and the supervisory-coordination implications.

## Recommendation

### Default

For institutions launching a privacy product on a 6-12 month horizon with regulator-led change control, default to **Institution-Controlled Deployment** with [Aztec](../vendors/aztec.md) or [Miden](../vendors/miden.md) as the Execution-layer vendor, off-chain encrypted Data, Ethereum L1 Settlement, and view-key Disclosure. Source escrow and audit rights are negotiated up front; quarterly upgrade cadence runs through the institution's change-control gate. The default is conditional on user-privacy guardrails being load-bearing, not optional: end users custody their own [viewing keys](../patterns/pattern-user-controlled-viewing-keys.md), regulator disclosure is scoped per request via [Regulatory Disclosure Keys & Proofs](../patterns/pattern-regulatory-disclosure-keys-proofs.md), and any user can self-exit via [Forced Withdrawal](../patterns/pattern-forced-withdrawal.md). Without these primitives, Institution-Controlled collapses into a panopticon and the deployment should not be classified as private.

### Decision factors

- If time-to-market dominates and engineering capacity is unavailable, choose **Vendor-Managed Deployment** and accept the vendor cadence.
- If the goal is shared market infrastructure across multiple institutions, choose **Consortium Deployment** and invest in the governance charter.
- If regulator demands institutional ownership of the full upgrade lifecycle, **Institution-Controlled** is the only viable option.

### Hybrid

Begin with **Vendor-Managed** to compress time-to-market, with a contractual transition path to **Institution-Controlled** at month 18-24 once the institution's engineering team is staffed and the operational runbook is mature. **Consortium** can layer over an Institution-Controlled deployment when peer institutions join and joint governance becomes the new operating model.

## Open questions

1. **Vendor concentration.** As the privacy-vendor market consolidates, single-vendor dependency becomes a sector-wide risk; multi-vendor strategies per layer mitigate but do not eliminate it.
2. **Regulator acceptance per governance model.** Whether vendor-led upgrade cadences satisfy specific regulators (Fed, ECB, BaFin, MAS) is unsettled and must be validated per jurisdiction.
3. **Source-escrow practicality.** Whether escrow agreements can be executed quickly enough during vendor-failure scenarios to maintain operational continuity.
4. **Cross-vendor migration.** State migration between privacy stacks (e.g., Aztec → Miden Execution layer) lacks tooling; today this is a manual lift.
5. **Forced-withdrawal coverage.** Whether L1 escape-hatch primitives cover all user-level recovery scenarios, including state stuck behind a discontinued vendor.

## See also

- **Patterns:** [Modular Privacy Stack](../patterns/pattern-modular-privacy-stack.md), [TEE-Based Privacy](../patterns/pattern-tee-based-privacy.md), [Privacy L2s](../patterns/pattern-privacy-l2s.md), [Hybrid Public-Private Modes](../patterns/pattern-hybrid-public-private-modes.md), [L2 Encrypted Off-chain Audit](../patterns/pattern-l2-encrypted-offchain-audit.md), [DvP via ERC-7573](../patterns/pattern-dvp-erc7573.md), [Regulatory Disclosure Keys & Proofs](../patterns/pattern-regulatory-disclosure-keys-proofs.md), [Forced Withdrawal](../patterns/pattern-forced-withdrawal.md)
- **Vendors:** [Aztec](../vendors/aztec.md), [Miden](../vendors/miden.md), [Fhenix](../vendors/fhenix.md), [EY (Nightfall)](../vendors/ey.md)
- **Related approaches:** [Private Payments](approach-private-payments.md), [Private Bonds](approach-private-bonds.md), [Private Trade Settlement](approach-private-trade-settlement.md)
