---
title: "Pattern: Hybrid Public-Private Modes"
status: draft
maturity: concept
type: standard
layer: hybrid
last_reviewed: 2026-04-22

works-best-when:
  - Different legs of a trade have different privacy requirements (for example, private cash, public asset).
  - Counterparties have heterogeneous compliance regimes requiring flexible disclosure.
  - "Cost optimization is needed: public mode for low-value, private mode for sensitive flows."
avoid-when:
  - Uniform privacy is mandatory across all transactions (use a fully private L2 instead).
  - Complexity overhead outweighs benefits for simple, single-mode use cases.

context: both
context_differentiation:
  i2i: "Between institutions, mode selection is a bilateral decision backed by contractual agreements on disclosure. Decentralized policy governance prevents any single counterparty from unilaterally forcing mode changes for bilateral trades. Both parties have legal recourse against policy drift or misconfiguration."
  i2u: "For end users, policy routing must be verifiable. Open-source routing logic lets users confirm their transactions are correctly assigned to private mode when required. Any operator-only override creates a pathway for forced disclosure, so the policy engine should be implemented as a permissionless smart contract rather than an operator service."

crops_profile:
  cr: medium
  o: partial
  p: partial
  s: medium

crops_context:
  cr: "Reaches `high` if the policy engine is decentralized as a permissionless smart contract with no unilateral override. Drops if the routing layer is operator-controlled, since a single party can force public-mode execution."
  o: "Could reach `yes` by mandating open-source mode-routing logic and requiring privacy L2 provers to remain forkable. Today's deployments mix open public chains with partially-closed privacy environments."
  p: "Public-mode legs are fully transparent; private-mode legs hide amounts and counterparties with selective disclosure via view keys. Mode selection itself leaks information: choosing private signals sensitivity."
  s: "Could reach `high` with multi-operator settlement oracles using threshold cryptography. Current deployments rely on single oracle services or coordinated off-chain timing, which expands the trust surface."

post_quantum:
  risk: high
  vector: "Any private leg using EC-based zero-knowledge proofs (Groth16, PLONK over BN254) is broken by a CRQC. HNDL risk is high for encrypted view-key material shared between counterparties."
  mitigation: "Route private legs through STARK-based shielded pools with hash commitments. Rotate long-lived view keys and prefer post-quantum signatures for cross-mode settlement oracles."

standards: [ERC-7573, ERC-3643, ERC-5564]

related_patterns:
  composes_with: [pattern-shielding, pattern-privacy-l2s, pattern-dvp-erc7573, pattern-commit-and-prove, pattern-regulatory-disclosure-keys-proofs, pattern-stealth-addresses]
  alternative_to: [pattern-private-pvp-stablecoins-erc7573]
  see_also: [pattern-modular-privacy-stack, pattern-forced-withdrawal]
---

## Intent

Allow institutions to select public or private execution mode on a per-transaction or per-counterparty basis, optimizing for cost, latency, and confidentiality requirements. This enables hybrid workflows where some legs execute transparently on public infrastructure while others use privacy-preserving mechanisms, with atomic cross-mode settlement.

## Components

- **Public execution environment** is an L1 or transparent L2 chain where amounts, counterparties, and timing are visible.
- **Private execution environment** is a privacy L2 or shielded pool where amounts and counterparties are hidden behind ZK commitments or FHE ciphertexts.
- **Mode-routing layer** is a smart contract or middleware that directs each transaction leg based on policy rules.
- **Policy engine** defines mode-selection criteria: counterparty whitelist, asset thresholds, jurisdiction-based rules.
- **Cross-mode settlement coordinator** uses ERC-7573 outcome keys or shared commitments to link a public leg and a private leg into one atomic trade.
- **View-key infrastructure** issues selective-disclosure artifacts from private legs to counterparties and regulators.

## Protocol

1. [operator] Configure policy rules covering counterparty whitelist, asset thresholds, and jurisdictional routing.
2. [operator] When a trade arrives, the policy engine evaluates rules and assigns each leg to public or private execution.
3. [user] Prepare assets in the appropriate environment. Public legs stay on the transparent chain; private legs are shielded into a private pool or bridged to a privacy L2.
4. [contract] Execute legs in parallel or sequence. Each leg runs in its assigned environment; private legs generate zero-knowledge proofs or use FHE, public legs execute standard transfers.
5. [contract] Coordinate cross-mode settlement via ERC-7573 outcome keys or commit-and-prove so both legs settle atomically or both fail.
6. [regulator] Receive disclosure artifacts from private legs: view keys or ZK attestations delivered per policy.
7. [operator] Finalize and reconcile. Internal systems map public chain events to private proofs for the audit trail.

## Guarantees & threat model

Guarantees:

- Mode-specific privacy. Public-mode legs reveal amounts, counterparties, and timing; private-mode legs hide amounts or counterparties and disclose selectively via view keys.
- Atomic cross-mode settlement. ERC-7573 outcome keys or shared commitments ensure either both legs succeed or both fail.
- Selective auditability. Regulators verify private legs through view keys without accessing the privacy pool's full state.
- Compliance continuity. Permissioned-token transfer rules apply regardless of execution mode, so eligibility checks hold on both public and private legs.

Threat model:

- Non-compromised policy engine. A tampered engine can route sensitive transactions to public mode.
- Honest cross-mode settlement oracle. A compromised oracle can withhold outcome keys to grief one of the legs.
- Non-censoring sequencer set on the privacy L2 (or forced-withdrawal fallback on the shielded pool).
- Out of scope: metadata correlation across modes. Timing and transaction-size correlation between the public and private legs can re-link counterparties even without direct leakage.

## Trade-offs

- Metadata leakage. Mode selection itself reveals information: choosing private signals sensitivity. Timing correlation between legs may link transactions.
- Operational complexity. Dual infrastructure requires expertise in both transparent and privacy systems; failure modes multiply.
- Cost asymmetry. Private execution incurs zero-knowledge proof generation costs; public execution is cheaper but exposes data. Mixed-mode trades pay both overheads.
- Tooling maturity. Cross-mode settlement is less battle-tested than single-environment flows. Limited production deployments exist.
- Policy drift risk. Rules must stay synchronized across systems; misconfigurations can route sensitive transactions to public mode.

## Example

A bank sells a tokenized bond (public asset leg on L1) to a counterparty for a stablecoin payment (private cash leg on a privacy L2). The policy engine assigns the bond transfer to public execution (the asset is already public, no sensitivity) and the cash payment to private execution (amount confidentiality required). The seller locks the bond in an ERC-7573 contract on L1. The buyer shields the stablecoin on the privacy L2 and executes the private payment referencing trade ID T. An oracle confirms private payment success and releases the outcome key. The L1 contract delivers the bond to the buyer. The regulator receives the buyer's view key for the cash leg.

## See also

- [Private Bonds Approach](../approaches/approach-private-bonds.md)
- [ERC-7573 specification](https://eips.ethereum.org/EIPS/eip-7573)
