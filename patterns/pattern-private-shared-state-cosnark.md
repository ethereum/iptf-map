---
title: "Pattern: Private Shared State (MPC + ZK / co-SNARKs)"
status: draft
maturity: PoC
layer: hybrid
privacy_goal: Multiple parties jointly maintain shared state via collaborative ZK proving over secret-shared inputs
assumptions: co-SNARK protocol infrastructure, MPC network with honest majority, Ethereum L1/L2 for state-root anchoring
last_reviewed: 2026-03-11
works-best-when:
  - Multiple institutions share a ledger, pool, or order book and must hide individual positions from each other
  - Cryptographic privacy guarantees are required (no hardware trust acceptable)
  - Regulatory audit must be possible without exposing raw data to all participants
avoid-when:
  - Single-party privacy is sufficient (use shielding instead)
  - Sub-second latency is critical (MPC rounds + proving add batch latency)
  - Fully trustless client-side proving with no external infrastructure dependency is required
dependencies: [co-SNARK protocols (e.g. TACEO), threshold cryptography, Groth16/STARK verifier]
crops_profile:
  cr: medium
  os: yes
  privacy: full
  security: medium
---

## Intent

Enable **N parties to jointly read and write shared on-chain state** (balances, positions, order books, collateral pools) while keeping each party's individual data private from the others **and** from the infrastructure operator. This variant uses **MPC + collaborative ZK proving (co-SNARKs)**: parties secret-share their inputs, jointly produce a ZK proof of correct state transition, and post the proof on-chain for verification.

Unlike single-party privacy (shielding), private shared state requires computation *across* multiple parties' secrets.

## Ingredients

- **Cryptography**: co-SNARK protocols (e.g. [TACEO](https://core.taceo.io/)), secret sharing, Groth16/STARK proof systems
- **Infra**: MPC network for collaborative proving; Ethereum L1/L2 for state-root anchoring and settlement finality
- **On-chain**: Commitment schemes (Pedersen, Poseidon) for state representation; ZK verifier contract
- **Off-chain**: Secret-shared state storage; regulatory disclosure mechanism (selective ZK proofs or viewing keys)

## Protocol

1. **Setup**: Parties establish MPC key shares and agree on proving circuit.
2. **Deposit**: Parties deposit assets into PSS contract; balances converted to secret-shared representation.
3. **Request**: A party submits a secret-shared state transition (transfer, trade, margin call).
4. **Compute**: MPC nodes jointly evaluate the transition and produce a collaborative ZK proof without any single node seeing plaintext inputs.
5. **Commit**: ZK proof and new state commitment posted on-chain; verifier contract checks correctness.
6. **Audit**: Regulators access scoped disclosure via selective ZK proofs without seeing all participants' data.

## Guarantees

- **Input privacy**: No party or MPC node learns another's balances, positions, or trade intent (honest-majority assumption).
- **State correctness**: On-chain ZK proof ensures transitions follow protocol rules.
- **Settlement finality**: Anchored to Ethereum L1/L2 for irreversibility.
- **Auditability**: Scoped disclosure path for regulators without full-state exposure.

## Trade-offs

- Requires MPC network infrastructure with honest-majority assumption; dishonest majority leads to state corruption, not privacy loss.
- Batch latency from MPC rounds + proving (~200 TPS batched).
- Does not hide sender/receiver addresses by default; combine with [stealth addresses](pattern-stealth-addresses.md) for address unlinkability.
- Testnet maturity as of March 2026; UTXO shielding is production-ready but covers single-party privacy only.
- **Liveness**: MPC halts if fewer than the required quorum of nodes respond. Degrades to unavailability, not privacy loss.
- **CROPS context**: Applies to I2I (multi-party institutional computation). CR is `medium` because participation requires MPC network access but protocol-level guarantees exist. In I2I, institutions negotiate MPC node operation among themselves. If extended to I2U, end-users would depend on institutional MPC nodes with no independent fallback.

## Example

**Consortium Collateral Pool**

- Three banks deposit tokenised bonds into a shared collateral pool on an Ethereum L2.
- Each bank's deposit amount is secret-shared across MPC nodes.
- A margin call triggers collaborative ZK proving: the MPC network verifies sufficient aggregate collateral without revealing individual positions.
- A ZK proof and new state commitment root are posted on-chain.
- The regulator uses a selective ZK proof to audit one bank's position without learning the others'.

## See also

- [co-SNARKs (Collaborative Proving)](pattern-co-snark.md): The underlying collaborative proving primitive
- [Private Shared State (FHE)](pattern-private-shared-state-fhe.md): FHE-based alternative
- [Private Shared State (TEE)](pattern-private-shared-state-tee.md): TEE-based alternative
- [Shielding](pattern-shielding.md): Single-party UTXO privacy (not shared state)
- [Threshold Encrypted Mempool](pattern-threshold-encrypted-mempool.md): Threshold encryption for transaction privacy
- Vendor: [TACEO Merces](../vendors/taceo-merces.md): PSS reference implementation (co-SNARKs)
