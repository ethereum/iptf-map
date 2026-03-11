---
title: "Pattern: Private Shared State (FHE)"
status: draft
maturity: PoC
layer: hybrid
privacy_goal: Multiple parties jointly maintain shared state via fully homomorphic encryption over encrypted on-chain data
assumptions: FHE coprocessor infrastructure, threshold decryption network, Ethereum L1/L2 for state-root anchoring
last_reviewed: 2026-03-11
works-best-when:
  - Multiple institutions share a ledger, pool, or order book and must hide individual positions from each other
  - Computation on encrypted state must happen without decrypting (homomorphic operations)
  - Higher throughput is needed compared to MPC+ZK (500-1000 TPS shared across apps)
avoid-when:
  - Single-party privacy is sufficient (use shielding instead)
  - Sub-second latency is critical (FHE computation overhead is high)
  - No tolerance for threshold decryption committee trust
dependencies: [FHE schemes (TFHE/BFV), threshold decryption network, Ethereum L1/L2]
crops_profile:
  cr: medium
  os: partial
  privacy: full
  security: medium
---

## Intent

Enable **N parties to jointly read and write shared on-chain state** (balances, positions, order books, collateral pools) while keeping each party's individual data private from the others **and** from the infrastructure operator. This variant uses **fully homomorphic encryption (FHE)**: state is stored encrypted on-chain, computation happens directly on ciphertexts via an FHE coprocessor, and a threshold decryption network controls read access.

Unlike single-party privacy (shielding), private shared state requires computation *across* multiple parties' secrets.

## Ingredients

- **Cryptography**: FHE schemes (TFHE, BFV); threshold decryption network for controlled reads
- **Infra**: FHE coprocessor (e.g. [Zama fhEVM](https://www.zama.ai/), [Fhenix](https://www.fhenix.io/)); Ethereum L1/L2 for state-root anchoring and settlement finality
- **On-chain**: Encrypted state representation; FHE computation contracts
- **Off-chain**: Threshold decryption committee; regulatory disclosure mechanism (decryption keys scoped to regulator)

## Protocol

1. **Setup**: Parties establish shared threshold FHE key via distributed key generation (DKG).
2. **Deposit**: Parties deposit assets into PSS contract; balances encrypted under the shared FHE key.
3. **Request**: A party submits an encrypted state transition (transfer, trade, margin call).
4. **Compute**: FHE coprocessor processes the transition homomorphically on ciphertexts without decrypting.
5. **Commit**: Updated encrypted state and correctness proof posted on-chain.
6. **Audit**: Regulators access scoped disclosure via threshold-controlled decryption keys.

## Guarantees

- **Input privacy**: Computations happen on encrypted data; no party or coprocessor sees plaintext.
- **State correctness**: FHE computation preserves correctness; results verifiable on-chain.
- **Settlement finality**: Anchored to Ethereum L1/L2 for irreversibility.
- **Auditability**: Threshold-controlled decryption provides scoped regulator access.

## Trade-offs

- FHE computation overhead is high (latency); batching helps throughput (500-1000 TPS shared across apps).
- Threshold decryption committee must be online for any state read; breach leads to bulk decryption of all encrypted state.
- Zama fhEVM is partially open source; FHE coprocessors have proprietary components (OS: `partial`).
- Does not hide sender/receiver addresses by default; combine with [stealth addresses](pattern-stealth-addresses.md) for address unlinkability.
- Testnet maturity as of March 2026.
- **Liveness**: FHE requires the threshold decryption committee to be online for any state read. Degrades to unavailability, not privacy loss, on liveness failure.
- **CROPS context**: Applies to I2I (multi-party institutional computation). CR is `medium` because protocol-level participation is open but requires FHE coprocessor access. In I2I, institutions negotiate coprocessor operation. If extended to I2U, end-users would depend on institutional FHE infrastructure with no independent verification of computation correctness.

## Example

**Consortium Collateral Pool**

- Three banks deposit tokenised bonds into a shared collateral pool on an Ethereum L2 with FHE support.
- Each bank's deposit amount is encrypted under the shared FHE key.
- A margin call triggers homomorphic computation: the FHE coprocessor verifies sufficient aggregate collateral on encrypted balances.
- Updated encrypted state is posted on-chain.
- The regulator uses a threshold-controlled decryption key to audit one bank's position without learning the others'.

## See also

- [Private Shared State (co-SNARKs)](pattern-private-shared-state-cosnark.md): MPC+ZK alternative
- [Private Shared State (TEE)](pattern-private-shared-state-tee.md): TEE-based alternative
- [Shielding](pattern-shielding.md): Single-party UTXO privacy (not shared state)
- [Threshold Encrypted Mempool](pattern-threshold-encrypted-mempool.md): Threshold encryption for transaction privacy
- Vendor: [Zama](../vendors/zama.md): FHE infrastructure provider
