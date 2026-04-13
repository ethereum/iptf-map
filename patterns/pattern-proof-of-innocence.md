---
title: "Pattern: Proof of Innocence (Association Set Proofs)"
status: draft
maturity: PoC
layer: L1
privacy_goal: Prove funds are not associated with illicit activity without revealing transaction history
assumptions: Shielded pool with commitment/nullifier model, Association Set Providers, zk-SNARKs
last_reviewed: 2026-04-08
works-best-when:
  - Users need to prove compliance (clean funds) to an institution or exchange
  - Privacy within a compliant population is acceptable
  - Association sets can be maintained by credible, independent providers
avoid-when:
  - Full transaction transparency is required by regulation
  - The anonymity set is too small for meaningful privacy
  - No credible ASP exists for the relevant jurisdiction
dependencies:
  - zk-SNARKs (Groth16 or equivalent)
  - Shielded pool contract (commitment/nullifier model)
  - Association Set Providers (ASPs)
context: both
crops_profile:
  cr: medium
  os: partial
  privacy: partial
  security: medium
---

## Intent

Allow users to prove their funds are not associated with illicit activity, without revealing their deposit, transaction history, or counterparties. Two protocol variants exist: prove at withdrawal (Privacy Pools) or prove at deposit with proof propagation (Railgun PPOI). Both use Merkle tree membership/exclusion proofs with zk-SNARKs; they differ in timing, proof direction, and set management.

Introduced in [Buterin et al. (2023)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4563364) and deployed in [Privacy Pools](../vendors/privacypools.md). [Railgun](../vendors/railgun.md) implements a separate proof-of-innocence mechanism (PPOI) with a different set-management model.

## Ingredients

- **Cryptography**: zk-SNARKs (Groth16) for Merkle-branch proofs; commitments + nullifiers for deposit unlinkability; proof inheritance tracking for intermediate transfers (Railgun variant)
- **On-chain**: shielded pool contract storing deposit commitments and nullifier sets; proof verifier contract
- **Off-chain**: set providers that define and publish curated lists. Two models:
  - **Association Set Providers (ASPs)** (Privacy Pools): flexible, jurisdiction-specific sets. Sets can be inclusion-based ("low-risk deposits permitted"), exclusion-based ("all except sanctioned"), or hybrid.
  - **Blocklist providers** (Railgun PPOI): Chainalysis Sanctions Oracle, Elliptic, SlowMist, ScamSniffer, PureFi. Exclusion-based lists of flagged addresses/transactions.
- **Data availability**: commitments and proofs on-chain; full set data on IPFS or off-chain with integrity anchoring

## Protocol

Two variants share the same primitive but differ in protocol flow:

**Variant A: prove at withdrawal (Privacy Pools)**

1. User deposits tokens into a shielded pool. The contract stores a commitment in a global Merkle tree.
2. ASPs publish curated association sets, each defined by a Merkle root `R_A` over a subset of deposits. Different ASPs may serve different jurisdictions or risk models.
3. On withdrawal, the user selects an ASP set and generates a zk-SNARK proof: "my deposit is in the global tree AND is a member of set `R_A`" (membership) or "my deposit is NOT in illicit set `R_B`" (exclusion).
4. The verifier checks the proof against the on-chain pool root and the ASP's set root. The verifier does not learn which deposit, when it was made, or any linked transaction.
5. User completes the withdrawal with a clean compliance signal.

**Variant B: prove at deposit with proof inheritance (Railgun PPOI)**

1. User shields (deposits) tokens into the Railgun contract.
2. A Groth16 exclusion proof is auto-generated: "these tokens are not part of any blocklist provider's dataset."
3. A 1-hour standby period follows, during which tokens can be unshielded exclusively back to the original wallet. This gives list providers time to update their datasets.
4. After standby, the proof status carries forward through intermediate 0zk transfers. Recipients inherit valid proof status without regenerating proofs; the PPOI node tracks which UTXOs have been checked.
5. On unshield (withdrawal), the proof chain from initial deposit through intermediate transfers is verifiable by any external party.

## Guarantees

- **Compliance signal without surveillance**: the verifier gets "clean" or "not proven clean," never the transaction graph.
- **Deposit unlinkability**: the proof does not reveal which deposit belongs to the user.
- **Voluntary disclosure**: the user chooses which set to prove against. No mandatory global allowlist.
- **Separating equilibrium**: honest users benefit from proving (lower friction at exchanges). Dishonest users cannot produce valid proofs against well-curated sets.

## Trade-offs

- **Set provider trust**: whoever curates the sets controls who is "clean." Mitigation: multiple competing providers; user choice; on-chain governance.
- **Set freshness**: stale sets miss recent sanctions. Railgun's 1-hour standby mitigates this at deposit time; Privacy Pools depend on ASP update cadence.
- **Assumed guilty by default**: non-provers are treated as non-compliant, penalizing users with limited compute or connectivity.
- **Anonymity set size**: small sets provide weak privacy even with valid proofs.
- **Regulatory acceptance**: ZK exclusion proofs are not yet universally accepted as equivalent to traditional KYC/AML. Varies by jurisdiction.
- **CROPS context (both)**: CR `medium` because L1 deposit/withdrawal is permissionless, but set providers can effectively exclude users. In I2U, CR drops if the institution mandates a single provider. Privacy `partial`: compliance signal is structured disclosure. OS `partial`: pool contracts are open source; set curation logic may be proprietary.
- **Post-quantum exposure**: Groth16 relies on EC pairings broken by CRQC. Mitigation: STARK-based pool. See [Post-Quantum Threats](../domains/post-quantum.md).

## Example

A user withdraws from a shielded pool to an institutional exchange. The exchange requires proof of non-association with OFAC-sanctioned addresses. The user generates a ZK exclusion proof against the relevant set and submits it with the withdrawal. The exchange verifies the proof, accepts the deposit, and never learns which deposit the user made or when.

## See also

- [Shielded ERC-20 Transfers](pattern-shielding.md): the underlying shielded pool mechanism
- [Compliance Monitoring](pattern-compliance-monitoring.md): institutional screening logic (this pattern provides the user-side compliance signal)
- [zk-promises](pattern-zk-promises.md): stateful anonymous credentials with async enforcement
- [Selective Disclosure](pattern-regulatory-disclosure-keys-proofs.md): viewing-key-based disclosure for regulators
- [Vendor: Privacy Pools](../vendors/privacypools.md)
- [Vendor: Railgun](../vendors/railgun.md)

## See also (external)

- [Privacy Pools paper (Buterin et al. 2023)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4563364)
- [Vitalik on Privacy Pools](https://vitalik.eth.limo/general/2023/09/06/privacy.html)
- [Privacy Pools GitHub](https://github.com/ameensol/privacy-pools)
