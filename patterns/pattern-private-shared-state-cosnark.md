---
title: "Pattern: Private Shared State (MPC + ZK / co-SNARKs)"
status: draft
maturity: testnet
type: standard
layer: hybrid
last_reviewed: 2026-04-22

works-best-when:
  - Multiple institutions share a ledger, pool, or order book and must hide individual positions from each other.
  - Cryptographic privacy guarantees are required (no hardware trust acceptable).
  - Regulatory audit must be possible without exposing raw data to all participants.
avoid-when:
  - Single-party privacy is sufficient (use shielding instead).
  - Sub-second latency is critical (MPC rounds plus proving add batch latency).
  - Fully trustless client-side proving with no external infrastructure dependency is required.

context: both
context_differentiation:
  i2i: "Between institutions, the MPC node set is typically operated by the consortium members themselves or by a neutral third party under SLA. Honest-majority risk is bounded by bilateral agreements and audit logs; legal recourse backs any collusion claim."
  i2u: "For user-facing deployments the prover and MPC node set must be operator-diverse and ideally permissionless. A user has no recourse if a coalition silently reconstructs their witness. Economic bonding with slashing and publicly auditable proving logs are required to make the guarantee meaningful."

crops_profile:
  cr: medium
  o: yes
  p: full
  s: medium

crops_context:
  cr: "Reaches `high` when the MPC prover network is permissionless and bond-backed. Drops to `low` when a single proving service controls the pipeline or when participation requires consortium membership."
  o: "Core co-SNARK proving frameworks are published under permissive licenses. Production deployments may bundle proprietary orchestration and share-routing."
  p: "No single MPC node or the verifier sees any party's plaintext inputs under the honest-majority assumption. Metadata about who participated, timing, and which circuit was proven can still leak."
  s: "Rides on the soundness of the underlying SNARK (including any trusted-setup ceremony) and on the honest-majority assumption across MPC nodes. Dishonest majority leads to witness exposure and, in some constructions, forged proofs."

post_quantum:
  risk: high
  vector: "Pairing-based SNARKs (Groth16, PLONK/KZG) broken by CRQC. MPC communication inherits the underlying key-exchange assumptions; HNDL risk applies to recorded MPC transcripts."
  mitigation: "co-STARK alternatives with hash-based commitments. See [Post-Quantum Threats](../domains/post-quantum.md)."

standards: []

related_patterns:
  requires: [pattern-co-snark, pattern-zk-proof-systems]
  composes_with: [pattern-stealth-addresses, pattern-regulatory-disclosure-keys-proofs, pattern-threshold-encrypted-mempool]
  alternative_to: [pattern-private-shared-state-fhe, pattern-private-shared-state-tee]
  see_also: [pattern-shielding, pattern-co-snark]

open_source_implementations:
  - url: https://github.com/TaceoLabs/co-snarks
    description: "co-SNARK proving framework supporting Groth16 and PLONK (research/testnet)"
    language: Rust
---

## Intent

Enable N parties to jointly read and write shared on-chain state (balances, positions, order books, collateral pools) while keeping each party's individual data private from the others and from the infrastructure operator. This variant secret-shares each party's inputs across a distributed prover network; the nodes jointly run an MPC protocol to compute a single zero-knowledge proof of a correct state transition; the proof is posted on-chain for verification.

Unlike single-party shielding, private shared state requires computation across multiple parties' secrets.

## Components

- Secret-sharing layer splits each party's inputs (additive or Shamir) and routes shares to the proving network.
- Distributed prover network jointly runs the MPC protocol to compute a zero-knowledge proof without any node reconstructing the full witness.
- Coordinator sequences MPC rounds and assembles the final proof.
- Commitment scheme (Pedersen, Poseidon) represents the shared state as commitments anchored on-chain.
- On-chain verifier contract checks the proof and advances the state root on L1 or a settlement L2.
- Regulatory disclosure path produces selective zero-knowledge proofs or scoped viewing material for auditors without revealing other participants' data.

## Protocol

1. [user] Each participating institution secret-shares its inputs across the MPC prover network.
2. [user] A party submits a secret-shared state transition request (transfer, trade, margin call).
3. [prover] MPC nodes jointly execute the co-SNARK protocol, exchanging shares across rounds to compute witness polynomials and commitments without reconstructing any plaintext.
4. [prover] The coordinator assembles the final zero-knowledge proof and the new state commitment.
5. [contract] The on-chain verifier checks the proof and advances the state root.
6. [auditor] Regulator obtains scoped disclosure via a selective zero-knowledge proof or viewing key bound to a specific position.

## Guarantees & threat model

Guarantees:

- Input privacy: no party or MPC node learns another party's balances, positions, or trade intent under the honest-majority assumption.
- State correctness: the on-chain zero-knowledge proof enforces that every transition follows protocol rules.
- Settlement finality anchored to Ethereum L1 or an L2 for irreversibility.
- Scoped auditability through selective zero-knowledge proofs or disclosure keys.

Threat model:

- Soundness of the underlying SNARK and any trusted-setup ceremony.
- Honest-majority assumption across MPC nodes. A colluding majority can recover witnesses and, in some constructions, forge proofs.
- Non-censoring coordinator. A malicious coordinator can refuse to finalize or selectively drop requests; liveness fails, not privacy.
- Authenticated and confidential channels between nodes. Metadata about participation and timing is out of scope.
- Sender and receiver addresses are not hidden by default; address unlinkability requires composition with stealth addresses.

## Trade-offs

- Heavy communication overhead. Round count and bandwidth scale with both the number of provers and circuit size.
- Batch latency of several hundred milliseconds to seconds per transition; batched throughput in the low hundreds of TPS in current research stacks.
- Liveness depends on all designated nodes remaining online through the proving session. Dropouts force a restart.
- New infrastructure requirements: MPC nodes, share routing, key management, and slashing if bond-backed.
- Not a fit when sub-second latency is required or when a fully client-side proof is possible.

## Example

- Three banks share a tokenised-bond collateral pool on an Ethereum settlement L2. Each bank's deposit is secret-shared across the MPC prover network. A margin call triggers a joint co-SNARK run: the network produces one zero-knowledge proof attesting that aggregate collateral covers the exposure without revealing any individual position. The proof and the new state commitment are posted on-chain. A regulator later audits one bank's position via a scoped selective proof without learning the others.

## See also

- [TACEO Merces](../vendors/taceo-merces.md)
- [Collaborative zk-SNARKs (Ozdemir & Boneh, 2021)](https://eprint.iacr.org/2021/1530.pdf)
- [TACEO private proof delegation](https://core.taceo.io/articles/private-proof-delegation/)
