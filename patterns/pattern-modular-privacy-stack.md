---
title: "Pattern: Modular Privacy Stack"
status: draft
maturity: PoC
layer: hybrid
privacy_goal: Enable flexible privacy architecture where each layer can be independently selected and upgraded
assumptions: Clear layer boundaries, standardized interfaces between layers, institutional compliance requirements
last_reviewed: 2026-01-16
works-best-when:
  - Different privacy requirements exist for different transaction phases
  - Organization needs flexibility to swap components without full redesign
  - Hybrid deployments span multiple environments (L1, L2, off-chain)
avoid-when:
  - Uniform end-to-end privacy is mandatory with single-vendor solution
  - Simple single-domain use cases with minimal privacy needs
  - Tight latency requirements preclude layer coordination overhead
dependencies:
  - ERC-7573
  - ERC-3643
  - EAS
  - EIP-4844
---

## Intent

Define a four-layer privacy architecture where **Data**, **Execution**, **Settlement**, and **Disclosure** are distinct concerns, each addressable by different technologies. This enables institutions to select best-fit components per layer while maintaining interoperability and upgrade paths.

## Ingredients

### Standards
- **ERC-7573**: Atomic DvP settlement across networks
- **ERC-3643**: Compliant security tokens with identity hooks
- **EAS**: Ethereum Attestation Service for disclosure proofs
- **EIP-4844**: Blob transactions for data availability

### Infrastructure by Layer

| Layer | Responsibility | Options |
|-------|----------------|---------|
| **Data** | Store/retrieve encrypted data | Off-chain encrypted storage, DA layers (EigenDA, Celestia), L2 blobs, IPFS+encryption |
| **Execution** | Private computation | ZK (Aztec, Miden), FHE (Zama, Fhenix), TEE enclaves |
| **Settlement** | Finality, atomicity | Ethereum L1, Arbitrum, Optimism, ZKsync |
| **Disclosure** | Regulatory access | View keys, ZK proofs, threshold KMS, EAS attestations |

### Off-chain Services
- Key management systems per layer
- Cross-layer routing and orchestration
- Audit log aggregation

## Protocol (concise)

1. **Define layer boundaries**
   Map each transaction phase to a layer. Identify which data stays in Data layer, what computation runs in Execution, where finality occurs (Settlement), and who needs access (Disclosure).

2. **Configure layer interfaces**
   Establish standardized APIs between layers: Data layer exposes encrypted reads/writes, Execution layer consumes data references and produces state transitions, Settlement layer accepts proofs or signed transactions.

3. **Route data to storage**
   Encrypt sensitive transaction data and store via the Data layer. Return content-addressed references (hashes, blob IDs) for downstream layers to consume.

4. **Execute private computation**
   The Execution layer retrieves encrypted data references, performs computation (ZK proof generation, FHE operations, or TEE execution), and outputs a verifiable state transition or proof.

5. **Settle on target chain**
   Submit the execution proof or transaction to the Settlement layer. Settlement may be on L1 for maximum security or L2 for lower cost. ERC-7573 enables atomic multi-leg settlement.

6. **Generate disclosure artifacts**
   Produce disclosure proofs, view keys, or attestations as required by the Disclosure layer. These enable authorized parties (regulators, auditors, counterparties) to verify or inspect specific data.

7. **Log cross-layer audit trail**
   Record layer transitions and references in an audit log. Each layer contributes its own audit data (data hashes, execution proofs, settlement txids, disclosure events).

## Guarantees

- **Layer isolation**: Compromise or failure in one layer does not expose data in others. Data layer encryption persists regardless of execution layer state.
- **Composability**: Layers can be independently upgraded or swapped (e.g., migrate from TEE execution to ZK without changing settlement).
- **Auditability**: Cross-layer audit trail enables reconstruction of transaction flow for compliance.
- **Failure containment**: Settlement layer defines atomicity; if execution fails, settlement reverts without affecting stored data.

## Trade-offs

- **Coordination complexity**: Multiple layers require orchestration logic, increasing system complexity and operational overhead.
- **Latency accumulation**: Each layer adds processing time; four layers compound delays compared to monolithic solutions.
- **Interface rigidity**: Standardized interfaces may constrain layer-specific optimizations or require adaptation layers.
- **Tooling fragmentation**: Different vendors per layer means multiple SDKs, monitoring tools, and support relationships.
- **Metadata leakage**: Even with encrypted data, cross-layer routing can reveal timing, access patterns, and transaction graph information.

## Example

**Institutional bond settlement with modular stack:**

- **Data layer**: Bond terms and investor details encrypted with AES-256, stored in off-chain encrypted storage. Content hash published to DA layer for availability guarantees.
- **Execution layer**: Aztec private contracts compute allocation and verify investor eligibility via ZK proofs. Execution produces a settlement instruction with proof of valid state transition.
- **Settlement layer**: ERC-7573 atomic DvP on Ethereum L1. Bond tokens transfer to buyer, payment token transfers to seller, or both revert.
- **Disclosure layer**: Issuer provides view keys to the regulator via EAS attestation. Regulator can decrypt bond terms and verify investor eligibility proofs without accessing the full transaction graph.

This configuration allows the issuer to:
- Upgrade from Aztec to Miden for execution without changing settlement
- Add a new regulator by issuing additional view keys
- Move settlement to an L2 for cost reduction while maintaining the same privacy guarantees

## See also

- [Private L2s](pattern-privacy-l2s.md) - Execution layer option
- [Commit and Prove](pattern-commit-and-prove.md) - Cross-layer coordination pattern
- [Atomic DvP via ERC-7573](pattern-dvp-erc7573.md) - Settlement layer standard
- [Selective Disclosure](pattern-regulatory-disclosure-keys-proofs.md) - Disclosure layer mechanisms
- [L2 Encrypted Off-chain Audit](pattern-l2-encrypted-offchain-audit.md) - Data + disclosure combination
- [TEE-based Privacy](pattern-tee-based-privacy.md) - Execution layer option
- [Aztec](../vendors/aztec.md) - ZK execution vendor
- [Zama](../vendors/zama.md) - FHE execution vendor
- [Miden](../vendors/miden.md) - ZK VM execution vendor
- [Railgun](../vendors/railgun.md) - Privacy infrastructure
