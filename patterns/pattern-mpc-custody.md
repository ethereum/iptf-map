---
title: "Pattern: MPC Custody and Transaction Control"
status: draft
maturity: production
type: standard
layer: offchain
last_reviewed: 2026-04-22

works-best-when:
  - An institution needs regulated-grade custody for digital assets.
  - Key material must never exist in one place while signing must still be quick.
  - Policy-based approvals (role, limit, allowlist) are required before signing.
avoid-when:
  - The workflow requires non-custodial self-sovereign key management.
  - Transaction-metadata privacy is required; threshold signing does not shield ledger data.
  - A single hardware security module already satisfies the threat model at lower cost.

context: both
context_differentiation:
  i2i: "Between institutions the threshold-signing quorum typically maps to internal roles (operations, compliance, treasury) and to counterparty approvals. Forced L1 exit paths matter so that assets remain recoverable if the custody operator is adversarial or insolvent."
  i2u: "For user-facing custody the operator is asymmetric to the user: the operator can refuse to co-sign. The user needs an independent exit path, typically an L1 timelock or a pre-signed transaction, and should be able to verify that the signing protocol is faithfully open source."

crops_profile:
  cr: low
  o: partial
  p: none
  s: medium

crops_context:
  cr: "A quorum of signers can refuse to co-sign, so censorship resistance is low by default. Reaches `high` only with a forced L1 exit path (timelocked withdrawal or consensus-backed fallback multisig) alongside threshold key refresh."
  o: "Core threshold-signing libraries exist in open source, but production custody stacks bundle proprietary policy engines, orchestration, and monitoring. Improves when the signing protocol and policy evaluator are published and independently auditable."
  p: "The pattern does not add on-chain privacy; signed transactions carry full metadata. Pair with transaction-privacy patterns (shielding, private broadcast) when confidentiality matters."
  s: "Depends on the soundness of the threshold scheme, the quality of the TEE or HSM that protects each share, and proactive key refresh. Verifiable threshold signing and periodic share rotation move this toward `high`."

post_quantum:
  risk: high
  vector: "Threshold ECDSA and EdDSA are broken by a cryptographically relevant quantum computer. HNDL pressure is limited because signatures are public, but long-lived custody keys are exposed on migration day."
  mitigation: "Adopt post-quantum threshold signatures (ML-DSA variants or hash-based schemes) and plan a migration with proactive share refresh. See [Post-Quantum Threats](../domains/post-quantum.md)."

standards: []

related_patterns:
  alternative_to: [pattern-tee-key-manager]
  composes_with: [pattern-safe-proof-delegation, pattern-dvp-erc7573, pattern-private-iso20022]
  see_also: [pattern-tee-zk-settlement, pattern-forced-withdrawal]

open_source_implementations:
  - url: https://github.com/ZenGo-X/multi-party-ecdsa
    description: "Threshold ECDSA reference implementation (Gennaro-Goldfeder family)"
    language: Rust
  - url: https://github.com/taurusgroup/multi-party-sig
    description: "Threshold signing library covering CMP, FROST, and related protocols"
    language: Go
  - url: https://github.com/LFDT-Lockness/cggmp21
    description: "CGGMP21 threshold ECDSA implementation"
    language: Rust
---

## Intent

Provide custody and controlled execution of digital-asset transactions by distributing key shares across a set of signers that jointly produce a valid signature without ever reconstructing the private key. The pattern eliminates single points of key compromise and enforces policy-based approvals before any signature is released.

## Components

- **Threshold signature scheme** such as threshold ECDSA or threshold EdDSA; an `m`-of-`n` quorum produces a signature indistinguishable from a single-key signature.
- **Signing nodes** run inside hardened environments (trusted execution environments or hardware security modules) and hold one key share each.
- **Policy engine** validates each signing request against transaction limits, destination allowlists, and role-based approvals before releasing the signing request to the nodes.
- **Orchestration API** exposes request submission, approval workflow, audit events, and status queries to client applications.
- **Key-generation ceremony** creates the shares without ever materializing the full key; proactive key refresh rotates shares while keeping the public key stable.
- **Audit log** records signing attempts, approvals, denials, and share-refresh events for compliance review.
- **Target chain** (L1 or L2) that ultimately receives the signed transaction.

## Protocol

1. [institution] Define the custody policy: quorum `m`-of-`n`, role approvals, allowlists, and transaction limits.
2. [operator] Run a distributed key generation so that each signing node receives a share; no node ever holds the full private key.
3. [user] Submit a signing request through the orchestration API.
4. [policy-engine] Validate the request against the policy (limits, allowlists, required approvals) and either release it to the signing nodes or reject it.
5. [signing-node] Participate in the threshold-signing protocol with the other nodes; each node contributes a partial signature using its share.
6. [orchestrator] Combine partial signatures into a valid signature and broadcast the signed transaction to the target chain.
7. [auditor] Consult the audit log to verify policy evaluation, the quorum that signed, and any refused requests.

## Guarantees & threat model

Guarantees:

- Key privacy: the private key is never reconstructed at a single location.
- Access control: a signature is released only when the quorum approves and the policy evaluates to true.
- Auditability: an end-to-end operations trail records approvals, denials, and signing events.
- Signature validity: if the quorum threshold is met, the resulting signature is verifiable by any chain that accepts the underlying scheme.

Threat model:

- Quorum compromise: if `m` nodes collude, the key is compromised; choose `m` and `n` accordingly and isolate nodes across operational domains.
- Policy-engine trust: a compromised or misconfigured policy engine can release signatures that violate the intended rules; combine with offline approvals for high-value flows.
- Operator censorship: a malicious or unresponsive operator can refuse to co-sign and freeze assets; an L1 exit path is required to mitigate this.
- Side channels: nodes that run in shared hardware or leaky TEEs can leak share material; rotate shares proactively and use attested enclaves.
- Out of scope: transaction-graph privacy and on-chain metadata protection. Signed transactions carry their usual public footprint.

## Trade-offs

- Performance: threshold signing adds latency relative to a single HSM; interactive protocols require several network rounds among the signing nodes.
- Cost: distributed infrastructure and continuous monitoring cost more than a single HSM deployment.
- Failure modes: if fewer than `m` nodes are reachable, no signature can be produced; geographic and operational diversity trade availability against quorum safety.
- Vendor trust: many production deployments rely on a vendor's signing protocol, policy engine, and attested hardware; open-source alternatives exist but often lack equivalent operational tooling.
- Operator censorship remains the core residual risk: without a forced exit path the custody operator can refuse to co-sign and freeze assets.

## Example

A bank issues a tokenized bond on Ethereum under a 2-of-3 custody policy across compliance, operations, and treasury.

- The operations desk initiates a transfer through the orchestration API.
- The policy engine checks the destination allowlist and the transaction limit, then notifies compliance for approval.
- Compliance approves via the dashboard; the two signing nodes run the threshold-signing protocol and emit a combined signature.
- The signed transaction is broadcast; bond tokens move to the investor address.
- The audit log records the approval path, the quorum members that signed, and the resulting transaction hash.

## See also

- [Fireblocks](../vendors/fireblocks.md)
- [FROST specification](https://datatracker.ietf.org/doc/draft-irtf-cfrg-frost/)
- [CGGMP21 paper](https://eprint.iacr.org/2021/060)
- [Post-Quantum Threats](../domains/post-quantum.md)
