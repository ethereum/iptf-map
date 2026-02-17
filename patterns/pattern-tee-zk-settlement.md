---
title: "Pattern: Hybrid TEE + ZK Settlement"
status: draft
maturity: PoC
layer: hybrid
privacy_goal: Private settlement coordination inside TEEs with zero-knowledge proofs for on-chain verifiability
assumptions: Attested TEE infrastructure, ZK prover backend, attestation registry, participants accept hardware trust
last_reviewed: 2026-02-13
works-best-when:
  - Counterparty risk is the primary concern and atomicity of settlement is the goal
  - Privacy breach (operator/manufacturer sees trade details) is an acceptable residual risk manageable through contractual controls
  - Settlement coordination requires low latency that client-side ZK cannot meet
avoid-when:
  - Trustless guarantees are required (client-side ZK is preferable)
  - Regulators reject opaque enclaves without additional compliance layers
  - Simple same-chain transfers where shielded pools suffice without coordination overhead
dependencies:
  - Attested TEEs (Intel SGX, AMD SEV, AWS Nitro)
  - zero-knowledge proof system (Groth16/PLONK)
  - Stealth address support (EIP-5564)
---

## Intent

Coordinate private settlement inside TEEs, with zero-knowledge proofs attesting correct execution to smart contracts on-chain. The TEE acts as a neutral synchronization layer between parties who do not trust each other — matching orders, managing escrow state, and producing verifiable proofs — while hiding counterparties, amounts, and matching logic from all external observers.

The key property of this construction is the separation of financial risk from privacy risk. The ZK proof guarantees correct, atomic settlement on-chain regardless of TEE integrity: counterparty risk is eliminated by the protocol, not by trusting the hardware. If the TEE is compromised (operator or manufacturer observes plaintext), the worst case is a privacy breach — trade details are exposed — but no funds are lost and settlement correctness is unaffected. In institutional settings, this residual privacy risk is manageable through contractual controls (NDA, audit rights, penalties) with TEE operators, making it a legal/commercial matter rather than a protocol failure.

## Ingredients

- **Standards**: EIP-5564 (stealth addresses), ERC-20/3643 assets, EAS (attestations)
- **TEE platforms**: Intel SGX (90–128 MB EPC), AMD SEV (full VM memory), AWS Nitro Enclaves
- **On-chain**: State commitment contract, zero-knowledge proof verifier, attestation registry, announcement contract (for stealth key revelation)
- **Off-chain**: Encrypted state blobs (replicated), KMS for sealed storage, multiple TEE nodes for availability

## TEE API Surface

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| `key_gen()` | Entropy source | `(pubkey, attestation_report)` | Generate enclave keypair; report contains code hash + pubkey + hardware signature |
| `attest(measurement)` | Code measurement | `signed_report` | Prove specific code runs unmodified in genuine TEE |
| `process(encrypted_orders[], state)` | User-encrypted orders, current state | `{new_state, encrypted_results[], log}` | Decrypt orders, validate nonces, match counterparties, update state |
| `prove(execution_log)` | Internal execution trace | `zk_proof` | Generate succinct proof of correct matching and state transition |
| `settle(commitment, proof, blobs)` | State root, proof, encrypted outputs | `tx_hash` | Submit proof on-chain, reveal stealth keys via announcement contract |

Attestation verification: check hardware signature is from known manufacturer, code hash matches expected binary, TEE model is not revoked.

## Protocol

1. **Setup**: TEE generates keypair inside enclave, publishes attestation report and public key. Verifiers check report against manufacturer root of trust.
2. **Order submission**: Each party encrypts their order (asset, amount, conditions, nonce) to the TEE public key and submits on-chain or via direct channel.
3. **Matching**: TEE decrypts orders, validates nonces against state (rollback protection), matches counterparties according to settlement rules.
4. **Escrow via stealth addresses**: Notes are locked to stealth addresses derived per-settlement. Each note has dual spending conditions in the zero-knowledge circuit: spendable by the stealth-derived key OR by the original owner after a timeout period.
5. **Proof generation**: TEE generates a zero-knowledge proof attesting: orders were valid, matching followed protocol rules, state transition is monotonic (no rollback), output commitments are correct.
6. **On-chain settlement**: Proof is verified on-chain. On success, the TEE atomically publishes both ephemeral keys to the announcement contract, allowing recipients to derive their spending keys.
7. **Completion or timeout**: Recipients scan the announcement contract, derive spending keys, and claim their notes. If the TEE fails before revealing keys, original owners reclaim notes after the timeout period.

## Trust Framework

> For the general TEE threat model, failure modes, and defense layers, see [TEE-Based Privacy](pattern-tee-based-privacy.md). This section covers only what is specific to the settlement protocol.

**Who sees what:**

| Actor | Sees | Does not see |
|-------|------|-------------|
| Users | Own order details, own settlement outcome | Other parties' orders, matching logic |
| TEE operator | Communication metadata (packet sizes, timing, connection patterns), I/O channel control (can reorder, delay, drop messages) | Enclave memory contents (isolated by hardware) |
| Hardware vendor | Everything during execution (master keys) | Nothing after enclave destroyed |
| Network observers | Commitments, proofs, stealth address outputs | Amounts, counterparties, order flow |
| Auditors | Selectively disclosed data via viewing keys | Full state unless explicitly granted |

**Threat model:**

| Threat | Impact | Mitigation |
|--------|--------|------------|
| Hardware vendor compromise | Full plaintext access during execution | Multi-vendor TEE diversity, zero-knowledge proofs limit damage to current session |
| Side-channel attacks (Spectre, cache timing) | Partial data leakage | ORAM inside enclave, constant-time algorithms, firmware patching |
| Rollback / replay attacks | Double-spend, stale state processing | Nonce monotonicity enforced in zero-knowledge proof, on-chain state root anchoring |
| Single TEE failure | Service unavailability, locked funds | Multiple TEE nodes, timeout refund escape hatch in stealth note circuits |
| Fake TEE (no attestation verification) | Operator steals all data | Mandatory attestation verification before encrypting orders |
| Operator metadata leakage | Communication metadata (packet sizes, timing) can reveal trade magnitudes and enable front-running, even though the ZK proof guarantees correct execution | Constant-size message padding, constant-time processing, multi-operator coordination |
| Operator selective delay | Operator stalls settlement to lock counterparty capital while market conditions change (timeout griefing) | Appropriate timeout calibration, operator reputation/staking, multi-operator threshold |
| Supply chain tampering | Compromised hardware from manufacturing | Attestation checks, multi-vendor sourcing |

## Guarantees

- **Privacy**: Counterparties, amounts, and matching logic hidden from all observers including TEE operator
- **Verifiability**: zero-knowledge proof provides on-chain verification of correct execution without TEE attestation infrastructure dependency
- **Rollback safety**: Nonce monotonicity in proofs prevents replay of old state
- **Availability**: Timeout refund ensures funds are never permanently locked, even if TEE goes offline
- **Auditability**: Selective disclosure via viewing keys for regulatory compliance

## Trade-offs

**Failure modes and correct approach:**

| Anti-pattern | Consequence | Correct approach |
|-------------|-------------|-----------------|
| Plaintext inputs/outputs | Network sees all data | Encrypt all I/O to TEE pubkey, per-user encryption keys |
| No rollback protection | Double-spend via old state | Nonce in state, zero-knowledge proof verifies monotonicity |
| Single TEE instance | Total unavailability on failure | Multiple TEE nodes with replicated encrypted state |
| TEE without zero-knowledge proofs | No public verifiability, must trust attestation | zero-knowledge proof of execution verified on-chain |
| Shared encryption key | One compromise leaks all data | Per-user encryption, key isolation |
| In-memory state only | Crash loses all funds | Persist encrypted state blobs + on-chain commitments |

**Core limitations:**

- **Privacy depends on TEE integrity, financial correctness does not**: The ZK proof guarantees settlement correctness on-chain regardless of TEE compromise. However, the TEE hardware vendor can observe plaintext during execution — a privacy breach, not a financial one. This separation is the core design tradeoff versus client-side ZK (which provides both).
- **Cross-chain atomicity is timeout-based, not cryptographic**: When coordinating across independent networks, one leg can succeed while the other fails. The timeout refund mechanism provides safety but not true atomicity. Same-network settlement remains the most practical path to atomic DvP.
- **Performance**: 10–50% overhead versus native execution. Enclave memory limits constrain batch sizes on SGX.

**When to use this pattern vs alternatives:**

| Scenario | TEE+ZK | Client-side ZK | Pure TEE |
|----------|--------|---------------|----------|
| Simple private transfers | Overkill | Preferred | Insufficient |
| Cross-chain coordination | Good fit | Cannot coordinate | No verifiability |
| High-frequency matching | Good fit | Too slow | No auditability |
| Institutional coordination (contractual trust) | Good fit | May suffice | Acceptable with audit layers |

## Example

**Cross-border bond DvP with stealth address settlement:**

1. Bank A (Frankfurt) wants to sell EUR-denominated corporate bonds to Bank B (Singapore) for USDC. Both assets exist on shielded pools on the same L1.
2. Both banks verify the TEE's attestation report and encrypt their orders (Bank A: sell 500 bond notes at par; Bank B: buy with 500K USDC) to the TEE public key.
3. TEE decrypts, validates nonces, confirms KYC attestations, matches the orders. Notes are locked to stealth addresses with 24-hour timeout refund.
4. TEE generates zero-knowledge proof of correct matching and submits on-chain. Proof verifies, TEE publishes both ephemeral keys to announcement contract.
5. Bank B derives the spending key for the bond notes, Bank A derives the key for the USDC notes. Settlement complete.
6. **Failure path**: If the TEE crashes after step 3 but before step 4, both banks reclaim their original notes via the timeout circuit after 24 hours.

## See also

- [TEE-Based Privacy](pattern-tee-based-privacy.md) — general TEE trust model, failure modes, upgrade paths
- [TEE Key Manager](pattern-tee-key-manager.md) — key generation, entropy, lifecycle in TEEs
- [DvP ERC-7573](pattern-dvp-erc7573.md) — cross-network DvP coordination standard
- [ZK-SPV Cross-Chain Verification](pattern-zk-spv.md) — trustless cross-chain proof verification
- [Cross-Chain Privacy Bridge](pattern-cross-chain-privacy-bridge.md) — bridging assets between chains with privacy
