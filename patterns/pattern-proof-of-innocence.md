---
title: "Pattern: Proof of Innocence (Association Set Proofs)"
status: draft
maturity: production
type: standard
layer: L1
last_reviewed: 2026-04-22

works-best-when:
  - Users need to prove compliance (clean funds) to an institution or exchange.
  - Privacy within a compliant population is acceptable.
  - Association sets can be maintained by credible, independent providers.
avoid-when:
  - Full transaction transparency is required by regulation.
  - The anonymity set is too small for meaningful privacy.
  - No credible association-set provider exists for the relevant jurisdiction.

context: both
context_differentiation:
  i2i: "Between institutions, the compliance signal is an artefact of bilateral reporting obligations. Counterparties typically agree on a shared set of providers whose jurisdictional coverage matches their obligations, and disagreements are resolved through contract. Opinionated curation is tolerated as long as the selection criteria are disclosed."
  i2u: "For end users, provider neutrality and plurality are non-negotiable. A single institution mandating one provider collapses CR to `low` because that provider can exclude a user from settlement. User-side privacy requires that the chosen set does not itself become a de facto allowlist."

crops_profile:
  cr: medium
  o: partial
  p: partial
  s: medium

crops_context:
  cr: "L1 deposit and withdrawal remain permissionless, but set providers can effectively exclude users by refusing to include their deposits in a set. Reaches `high` when multiple competing providers are routinely accepted by relying parties. Drops to `low` when an institution mandates a single provider."
  o: "Shielded-pool contracts and proof circuits are typically open source. Set-curation logic and blocklist-provider data pipelines are often proprietary, which limits independent reproduction of the compliance signal."
  p: "The compliance signal is a structured disclosure; the verifier learns `clean` or `not proven clean` against a specific set but not the deposit, the transaction history, or counterparties. Set choice itself leaks coarse information about the user's jurisdictional context."
  s: "Rides on the soundness of the zero-knowledge proof system and on the integrity of the set root commitment. Stale or adversarial set updates can cause false positives or false negatives."

post_quantum:
  risk: high
  vector: "Groth16 and PLONK/KZG Merkle-branch proofs rely on elliptic-curve pairings broken by a CRQC. HNDL risk applies if historical proofs are later reused to infer deposit-withdrawal linkages."
  mitigation: "Migrate proof systems to STARKs with hash-based commitments. See [Post-Quantum Threats](../domains/post-quantum.md)."

standards: []

related_patterns:
  requires: [pattern-shielding, pattern-zk-proof-systems]
  composes_with: [pattern-compliance-monitoring, pattern-regulatory-disclosure-keys-proofs]
  alternative_to: [pattern-zk-promises]
  see_also: [pattern-user-controlled-viewing-keys]

open_source_implementations:
  - url: https://github.com/ameensol/privacy-pools
    description: "Privacy Pools reference implementation with association-set proofs at withdrawal"
    language: "Solidity, Circom"
  - url: https://github.com/Railgun-Privacy/contract
    description: "Railgun shielded pool with PPOI exclusion proofs at deposit and proof inheritance"
    language: "Solidity, Circom"
---

## Intent

Let users prove their funds are not associated with illicit activity without revealing the deposit, transaction history, or counterparties. Two protocol variants exist: prove at withdrawal against a curated set root, or prove at deposit with proof propagation through subsequent transfers. Both rely on Merkle tree membership or exclusion proofs with zero-knowledge proofs and differ in timing, proof direction, and set management.

## Components

- Shielded pool contract that stores deposit commitments and nullifier sets.
- Zero-knowledge proof verifier that checks Merkle-branch statements against set roots.
- Set providers that publish curated set roots. Two models:
  - Association-set providers publish flexible, jurisdiction-specific sets. Sets can be inclusion-based ("low-risk deposits permitted"), exclusion-based ("all except sanctioned"), or hybrid.
  - Blocklist providers publish exclusion-based lists of flagged addresses and transactions (for example, sanctions-oracle feeds).
- Data-availability path for the full set data (IPFS or off-chain storage with on-chain integrity anchors).
- Proof-inheritance tracker (deposit-side variant) that carries forward the proof status of a commitment through intermediate transfers.

## Protocol

Two variants share the same primitive but differ in flow.

Variant A, prove at withdrawal:

1. [user] Deposit tokens into a shielded pool; the contract stores a commitment in the global Merkle tree.
2. [operator] Set providers publish curated association sets, each defined by a Merkle root over a subset of deposits.
3. [user] Select a set and generate a zero-knowledge proof that the deposit is in the global tree and is a member of the chosen set root, or that the deposit is not in an exclusion set.
4. [contract] Verify the proof against the pool root and the set root; the verifier learns neither which deposit nor when it was made.
5. [user] Complete the withdrawal carrying a clean compliance signal.

Variant B, prove at deposit with proof inheritance:

1. [user] Shield tokens into the pool contract.
2. [prover] Auto-generate an exclusion proof that the deposited tokens are not present in any blocklist provider's dataset.
3. [contract] Enforce a standby window during which the deposit may only be unshielded back to the original address; this gives list providers time to update.
4. [user] Subsequent shielded transfers inherit the proof status of their inputs; the tracking service records which commitments have been checked.
5. [user] On unshield, any external verifier can reconstruct the proof chain from initial deposit through intermediate transfers.

## Guarantees & threat model

Guarantees:

- Compliance signal without surveillance: the verifier learns `clean` or `not proven clean` for a specified set, never the transaction graph.
- Deposit unlinkability: the proof does not reveal which deposit belongs to the user.
- Voluntary disclosure: the user chooses which set to prove against, avoiding a single mandatory global allowlist.
- Separating equilibrium: honest users benefit from proving; users excluded from credible sets cannot produce valid proofs against them.

Threat model:

- Set-provider integrity. A malicious or compromised provider can include or exclude specific deposits, effectively censoring users or diluting the compliance signal.
- Soundness of the zero-knowledge proof system and its trusted setup if applicable.
- Stale sets. Between set updates, newly flagged deposits still produce valid proofs.
- Small anonymity sets. Even a valid proof conveys little privacy when the set is tiny.
- Metadata such as relayer IPs, timing, and gas payer is out of scope for this pattern.

## Trade-offs

- Multiple providers introduce governance and coordination overhead for relying parties that accept proofs.
- Non-provers may be treated as non-compliant, penalising users with limited compute or connectivity.
- Regulatory acceptance of exclusion proofs as equivalent to traditional screening varies by jurisdiction and is still evolving.
- Set-update cadence trades off freshness against availability: standby windows delay usable funds, while long refresh intervals widen the window in which newly flagged deposits remain provable as clean.

## Example

A user withdraws from a shielded pool to an institutional exchange. The exchange requires proof of non-association with sanctioned addresses. The user generates a zero-knowledge exclusion proof against the relevant set and submits it with the withdrawal. The exchange verifies the proof, accepts the deposit, and never learns which deposit the user made or when.

## See also

- [Privacy Pools paper (Buterin et al. 2023)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4563364)
- [Vitalik on Privacy Pools](https://vitalik.eth.limo/general/2023/09/06/privacy.html)
