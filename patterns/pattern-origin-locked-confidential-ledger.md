---
title: "Pattern: Origin-Locked Cross-Chain Confidential Ledger"
status: draft
maturity: testnet
type: standard
layer: hybrid
last_reviewed: 2026-04-22

works-best-when:
  - Amount and balance confidentiality is needed for existing ERC-20 assets, without changing token contracts or migrating liquidity.
  - Counterparties are known by default (not anonymous) and selective disclosure is required.
  - The design must avoid single-TEE trust models, MPC honest-majority assumptions, or off-chain coprocessor dependency.
avoid-when:
  - Default anonymity or large anonymity sets are required.
  - A single-domain design is preferred, with all logic and settlement on Ethereum L1 or a single L2.

context: both
context_differentiation:
  i2i: "Between known counterparties, amount privacy is the primary goal. Both sides participate in selective disclosure for audit and KYC. Custody remains on the origin chain, which preserves existing regulatory treatment of the underlying ERC-20."
  i2u: "When institutions hold encrypted balances on behalf of users, the user must retain their own ElGamal private key and have a guaranteed withdrawal path on the origin chain. Without user-held keys and forced withdrawal, the confidentiality layer becomes an operator-controlled ledger over user funds."

crops_profile:
  cr: medium
  o: partial
  p: partial
  s: high

crops_context:
  cr: "Medium. Origin-chain withdrawal is enforceable through the locking contract, which bounds operator power. Availability still depends on the confidentiality layer and messaging relayers."
  o: "Partial. Contract designs are open, but specific confidentiality-layer implementations vary in openness and reproducibility of the encrypted state."
  p: "Partial. Amounts and balances are encrypted, but sender and receiver addresses can remain visible unless combined with an identity-obfuscation pattern."
  s: "High for custody: funds stay on the origin chain under a minimal locking contract, so cross-chain messaging issues affect availability rather than custody."

post_quantum:
  risk: high
  vector: "ElGamal homomorphic encryption over elliptic curves is broken by CRQC. HNDL risk is high for on-chain encrypted balances and transfer ciphertexts."
  mitigation: "Lattice-based additively homomorphic PKE or hybrid schemes. See [Post-Quantum Threats](../domains/post-quantum.md)."

standards: [ERC-20]

related_patterns:
  composes_with: [pattern-regulatory-disclosure-keys-proofs, pattern-user-controlled-viewing-keys, pattern-forced-withdrawal]
  alternative_to: [pattern-cross-chain-privacy-bridge, pattern-privacy-l2s]
  see_also: [pattern-shielding]

open_source_implementations:
  - url: https://docs.fairblock.network/docs/confidential_transfers/technical_overview
    description: "Technical overview of a confidential-transfer design with IBC-style messaging"
    language: "Documentation"
  - url: https://ibcprotocol.org/
    description: "Light-client-based cross-chain messaging specification"
    language: "Specification"
---

## Intent

Provide confidential balances and transfers for an existing ERC-20 on an origin EVM chain, while keeping the asset locked and settled on the origin chain. Confidentiality logic runs on a separate execution layer that maintains an encrypted ledger and verifies ZK-proven state transitions. Unlike a privacy bridge or a privacy rollup, funds never leave the origin chain.

## Components

- **Origin locking contract**: minimal contract on the origin EVM chain that escrows deposits and releases withdrawals. It is the only place user funds live.
- **Encrypted ledger**: per-account balances stored as ElGamal ciphertext under the account holder's key on a separate confidentiality execution layer.
- **ZK verifier**: validates state transitions on the encrypted ledger (no overspend, conservation of value, correct key usage) without decrypting balances.
- **Homomorphic update logic**: encrypted balances update via ElGamal additive homomorphism; plaintext balances are never reconstructed by any component.
- **Verifiable cross-chain messaging**: light-client or IBC-style messaging between the origin chain and the confidentiality layer. Relayers move packets but are not trusted for correctness.
- **Disclosure layer** (optional): scoped viewing keys or per-transaction audit keys generated via MPC, so a designated auditor can decrypt specific transactions under review.

## Protocol

1. [user] Deposit ERC-20 into the origin locking contract.
2. [contract] Emit a cross-chain message crediting the user's encrypted balance on the confidentiality layer.
3. [user] Submit a confidential transfer: ciphertext amount, zero-knowledge proof of correctness, and recipient identifier.
4. [relayer] Carry the transfer packet to the confidentiality layer.
5. [operator] The confidentiality layer verifies the proof and homomorphically updates encrypted balances of sender and receiver.
6. [user] Submit a withdrawal request with a zero-knowledge proof of sufficient encrypted balance.
7. [contract] On receipt of the debit acknowledgement, unlock the corresponding ERC-20 to the user on the origin chain.
8. [auditor] Under a deployment-defined policy, receive a scoped decryption key or proof for a specific account or transaction; access events are logged if required.

## Guarantees & threat model

Guarantees:

- Amounts and balances are encrypted from the public. ElGamal private keys stay with the account holder; no protocol component stores them.
- Underlying ERC-20 issuance and liquidity remain on the origin chain. No wrapped token, no fund bridge, no mirror supply.
- Custody is governed by the origin locking contract. Cross-chain messaging failures affect availability and withdrawal latency, not custody.
- Selective disclosure is controlled: audit keys are generated per transaction through an MPC network, and a verified auditor can decrypt only the specific transaction under review.

Threat model:

- Sender and receiver addresses can remain transparent unless combined with identity-obfuscation patterns. This pattern alone does not deliver counterparty privacy.
- Relayers and the messaging layer can delay or drop packets, stalling transfers and withdrawals. Contract-level timeouts and retries bound the impact.
- Soundness of the ZK verifier and correctness of the homomorphic update logic are critical; a bug can mint or burn encrypted balances.
- MPC-based audit key generation relies on its participant honesty threshold; a compromised threshold can leak arbitrary transactions to the auditor.

## Trade-offs

- Operational overhead: deployments must monitor relayers and messaging, implement retry logic, and expose clear failure handling for delayed acknowledgements.
- Identity privacy is not default: pair with stealth addresses or a shielding layer for counterparty privacy.
- Two-chain design adds latency: every transfer involves at least one cross-chain round trip before completion.
- Upgrade coordination: changes to the confidentiality layer's circuits or messaging format must be coordinated with the origin contract to avoid locking funds.

## Example

- A corporate treasury uses USDC on an origin EVM chain.
- It locks USDC into the origin contract and receives an encrypted balance on the confidentiality layer.
- It executes private vendor payouts: amounts are encrypted, counterparties are known.
- When a vendor wants liquidity, they withdraw, which unlocks transparent USDC back on the origin chain.
- If audited, the treasury discloses the relevant invoices or transactions through the audit-key mechanism.

## See also

- [IBC: light-client-based messaging](https://ibcprotocol.org/)
- [Fairblock technical overview](https://docs.fairblock.network/docs/confidential_transfers/technical_overview)
- [Fairblock](../vendors/fairblock.md)
