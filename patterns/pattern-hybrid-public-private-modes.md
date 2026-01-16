---
title: "Pattern: Hybrid Public-Private Modes"
status: draft
maturity: PoC
layer: hybrid
privacy_goal: Enable per-transaction and per-counterparty selection between public and private execution
assumptions: Volition-style architecture or dual-chain setup, policy engine for mode routing, compliant token standards
last_reviewed: 2026-01-16
works-best-when:
  - Different legs of a trade have different privacy requirements (e.g., private cash, public asset).
  - Counterparties have heterogeneous compliance regimes requiring flexible disclosure.
  - Cost optimization is needed—public mode for low-value, private mode for sensitive flows.
avoid-when:
  - Uniform privacy is mandatory across all transactions (use a fully private L2 instead).
  - Complexity overhead outweighs benefits for simple, single-mode use cases.
dependencies:
  - ERC-7573 (DvP settlement)
  - ERC-3643 (compliant tokens with transfer rules)
  - Volition or dual-chain architecture (public/private execution environments)
---

## Intent

Allow institutions to select **public or private execution mode** on a per-transaction or per-counterparty basis, optimizing for cost, latency, and confidentiality requirements. This enables hybrid workflows where some legs execute transparently on public infrastructure while others use privacy-preserving mechanisms.

## Ingredients

- **Standards**
  - ERC-7573 for atomic cross-leg settlement
  - ERC-3643 for compliant token transfers with eligibility checks
  - ERC-5564 (optional) for stealth addresses in private mode

- **Infrastructure**
  - **Public execution**: L1 or transparent L2 (e.g., Arbitrum, Optimism)
  - **Private execution**: Privacy L2 (Aztec, Miden) or shielded pool (Railgun)
  - **Mode-routing layer**: Smart contract or middleware that directs transactions based on policy

- **Off-chain**
  - **Policy engine**: Rules defining when to use public vs. private mode per counterparty, asset class, or threshold
  - **View key infrastructure**: For selective disclosure from private legs to auditors
  - **Coordination service**: Manages cross-mode settlement timing

## Protocol (concise)

1. **Configure policy rules**
   Institution defines mode-selection criteria: counterparty whitelist, asset thresholds, jurisdiction-based rules.

2. **Evaluate mode per transaction**
   When initiating a trade, the policy engine evaluates rules and assigns each leg to public or private execution.

3. **Prepare assets in appropriate environment**
   Public leg: assets remain on transparent chain. Private leg: assets are shielded (deposited to private pool or bridged to privacy L2).

4. **Execute legs in parallel or sequence**
   Each leg executes in its assigned environment. Private legs generate ZK proofs or use FHE; public legs execute standard transfers.

5. **Coordinate cross-mode settlement**
   ERC-7573 or commit-and-prove mechanism ensures atomicity across modes. Outcome keys or shared commitments link the legs.

6. **Generate disclosure artifacts**
   Private legs produce view keys or ZK attestations for counterparties and regulators as defined by policy.

7. **Finalize and reconcile**
   Both legs settle. Internal systems reconcile public chain events with private proofs for audit trail.

## Guarantees

- **Mode-specific privacy**
  - Public mode: Full transparency of amounts, counterparties, timing.
  - Private mode: Amounts and/or counterparties hidden; disclosed only via view keys.

- **Atomic settlement**
  Cross-mode DvP achieves conditional atomicity—both legs settle or both fail—via ERC-7573 outcome keys or shared commitments.

- **Auditability**
  Regulators can verify private legs through selective disclosure without accessing the privacy pool's full state.

- **Compliance continuity**
  ERC-3643 transfer rules apply regardless of mode, ensuring eligibility checks on both public and private legs.

## Trade-offs

- **Metadata leakage**
  Mode selection itself reveals information (choosing private signals sensitivity). Timing correlation between legs may link transactions.

- **Operational complexity**
  Dual infrastructure requires expertise in both transparent and privacy systems. Failure modes multiply.

- **Cost asymmetry**
  Private execution incurs ZK proof generation costs; public execution is cheaper but exposes data. Mixed-mode trades pay both overheads.

- **Tooling maturity**
  Cross-mode settlement is less battle-tested than single-environment flows. Limited production deployments exist.

- **Policy drift risk**
  Rules must stay synchronized across systems; misconfigurations can route sensitive transactions to public mode.

## Example

- Bank A sells a tokenized bond (public asset leg on L1) to Bank B for EURC (private cash leg on privacy L2).
- Policy engine assigns: bond transfer = public (asset is already public, no sensitivity); cash payment = private (amount confidentiality required).
- Bank A locks bond in ERC-7573 contract on L1.
- Bank B shields EURC on privacy L2 and executes private payment referencing trade ID `T`.
- Oracle confirms private payment success, releases outcome key.
- L1 contract delivers bond to Bank B. Regulator receives Bank B's view key for the cash leg.

## See also

- [Shielded ERC-20 Transfers](pattern-shielding.md)
- [Private L2s](pattern-privacy-l2s.md)
- [Atomic DvP via ERC-7573](pattern-dvp-erc7573.md)
- [Commit-and-Prove Fallback](pattern-commit-and-prove.md)
- [Regulatory Disclosure Keys](pattern-regulatory-disclosure-keys-proofs.md)
