---
title: "Pattern: Private Shared State"
status: draft
maturity: PoC
layer: hybrid
privacy_goal: Multiple parties jointly maintain shared state (balances, positions, orders) while each party's data remains private from the others
assumptions: Specialised privacy infrastructure (FHE coprocessor, MPC network, or TEE cluster), Ethereum L1/L2 for settlement and state-root anchoring
last_reviewed: 2026-02-17
works-best-when:
  - Multiple institutions share a ledger, pool, or order book and must hide individual positions from each other
  - State updates require multi-party input (e.g. bilateral settlement, joint compliance checks)
  - Regulatory audit must be possible without exposing raw data to all participants
avoid-when:
  - Single-party privacy is sufficient (use shielding or confidential transfers instead)
  - Fully trustless client-side proving is required with no external infrastructure dependency
  - Sub-second latency is critical and no hardware trust is acceptable
dependencies: [co-SNARK protocols, FHE schemes (TFHE/BFV), TEE platforms (SGX/SEV-SNP/Nitro), threshold cryptography]
---

## Intent

Enable **N parties to jointly read and write shared on-chain state**; balances, positions, order books, collateral pools, while keeping each party's individual data private from the others **and** from the infrastructure operator. Unlike single-party privacy (shielding, where one owner hides their own data), private shared state requires computation *across* multiple parties' secrets. 

## Ingredients

- **FHE-based**: Encrypted state on-chain; homomorphic computation on ciphertexts; threshold decryption network
- **MPC + ZK (co-SNARKs)**: Secret-shared state off-chain; collaborative ZK proving; on-chain Groth16/STARK verification
- **TEE-based**: Encrypted state decrypted inside hardware enclave; attestation-verified execution
- **Common**: Ethereum L1/L2 for state-root anchoring and settlement finality; commitment schemes (Pedersen, Poseidon) for on-chain state representation; regulatory disclosure mechanism (viewing keys, selective ZK proofs, or enclave-mediated access)

## Protocol

1. **Setup**: Parties establish shared cryptographic infrastructure (threshold FHE key, MPC key shares, or attested TEE cluster).
2. **Deposit**: Parties deposit assets into PSS contract; balances converted to private representation.
3. **Request**: A party submits an encrypted or secret-shared state transition (transfer, trade, margin call).
4. **Compute**: Privacy layer processes the transition without revealing inputs to any single party.
5. **Commit**: Correctness proof and new state commitment posted on-chain.
6. **Audit**: Regulators access scoped disclosure without seeing all participants' data.

## Approach Comparison

| Dimension | FHE | MPC + ZK (co-SNARKs) | TEE |
|---|---|---|---|
| **Trust model** | Cryptographic (threshold decryption) | Honest majority among MPC nodes | Hardware vendor + operator |
| **Latency** | High (FHE computation overhead) | Medium (MPC rounds + proving) | Low (hardware speed) |
| **Throughput** | 500–1000 TPS (shared across apps) | ~200 TPS (batched) | Chain-limited |
| **Maturity ** | Testnet | Testnet | Pilot |
| **Key failure mode** | Threshold breach leads to bulk decryption | Dishonest majority leads to state corruption | Side-channel attacks lead to secret leakage |
| **Addresses hidden?** | No | No | Partially (enclave-mediated) |

## Guarantees

- **Input privacy**: No party learns another's balances, positions, or trade intent.
- **State correctness**: On-chain proof ensures transitions follow protocol rules.
- **Settlement finality**: Anchored to Ethereum L1/L2 for irreversibility.
- **Auditability**: Scoped disclosure path for regulators without full-state exposure.

## Trade-offs

- All approaches require specialised off-chain infrastructure (FHE coprocessor, MPC network, or TEE cluster).
- No approach hides sender/receiver addresses by default; combine with stealth addresses ([EIP-5564](https://eips.ethereum.org/EIPS/eip-5564)), and other primitives listed in [patterns](./patterns) to improve privacy guarantees.
- FHE and MPC introduce batch latency; TEE trades latency for hardware trust.
- All approaches are PoC/testnet as of Feb 2026; UTXO shielding is production-ready but covers single-party privacy, not shared state.
- **Liveness**: FHE requires the threshold decryption committee to be online for any state read; MPC halts if fewer than the required quorum of nodes respond; TEE depends on the host continuing to schedule the enclave. All three degrade to unavailability, not to privacy loss, on liveness failure.

## Example

**Consortium Collateral Pool**

- Three banks deposit tokenised bonds into a shared collateral pool on an Ethereum L2.
- Each bank's deposit amount is hidden from the others via the PSS privacy layer.
- A margin call triggers private computation: the pool contract verifies sufficient aggregate collateral without revealing individual positions.
- A correctness proof and new state commitment root are posted on-chain.
- The regulator uses a scoped viewing key to audit one bank's position without learning the others'.

## See also

- [co-SNARKs (Collaborative Proving)](pattern-co-snark.md): MPC+ZK instantiation of PSS
- [TEE-Based Privacy](pattern-tee-based-privacy.md): Hardware-based privacy foundation
- [MPC Custody](pattern-mpc-custody.md): MPC for key management (distinct from shared state)
- [ZK Shielded Balances](pattern-zk-shielded-balances.md): Single-party private balances (not shared state)
- [Shielding](pattern-shielding.md): Single-party UTXO privacy
- [Threshold Encrypted Mempool](pattern-threshold-encrypted-mempool.md): Threshold encryption for transaction privacy
- Vendor: [TACEO Merces](../vendors/taceo-merces.md): PSS reference implementation (co-SNARKs)
