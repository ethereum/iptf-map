---
title: "Origin-Locked Cross-Chain Confidential Layer"
status: draft
maturity: PoC
layer: hybrid privacy
privacy_goal: Amount/balance confidentiality for origin-chain assets (no fund bridge), with selective disclosure
assumptions: Origin-chain locking contract + confidentiality execution layer (encrypted ledger + ZK verification) + verifiable cross-chain messaging (light client/ IBC-style) + wallet/KMS integration
last_reviewed: 2026-03-06
works-best-when:
  - Need amount and balance confidentiality for existing ERC-20 assets without changing token contracts or migrating liquidity.
  - Counterparties are known by default (not anonymous) and selective disclosure is required.
  - Want to avoid single-TEE trust models, MPC honest-majority assumptions, or off-chain coprocessor dependency.
avoid-when:
  - Need default anonymity/identity encryption or large anonymity sets.
  - Need single-domain only designs where all logic and settlement must occur on Ethereum L1/L2.
dependencies: ERC-20, Verifiable cross-chain messaging, Selective disclosure (view keys / proofs)
---

## Intent

Provide **confidential balances and transfers for an existing ERC-20 on an origin EVM chain**, while keeping the asset **locked and settled on the origin chain**, and executing confidentiality logic on a separate confidentiality execution layer that maintains an encrypted ledger and verifies ZK-proven state transitions.

This differs from a privacy bridge and from privacy L2s. Here, the “confidential layer” is **cross-chain**, but **funds never bridge**.

## Ingredients

- **Origin chain (EVM):**
  - Minimal locking contract for deposits/withdrawals
  - User-facing entrypoint for “deposit/private transfer/withdraw”
- **Confidential execution layer:**
  - Encrypted ledger (per-account balances as ciphertext)
  - ZK verification for valid state transitions (no overspend, conservation, etc.)
  - Lightweight homomorphic add/sub for balance updates (ciphertext domain)
- **Cross-chain messaging (verifiable):**
  - IBC-style / light-client verification to transport packets
  - Relayers move packets but are not trusted for correctness
- **Disclosure layer (optional but typical):**
  - Scoped viewing keys / selective disclosure
  - Optional attestations/audit log of disclosure events

## Protocol

1. **Deposit (lock → credit):** User deposits ERC-20 into the origin locking contract; contract emits a message to the confidentiality layer; confidentiality layer verifies and **credits an encrypted balance**.
2. **Confidential transfer (prove → update):** User submits `(ciphertext amount, ZK proof, recipient)` to the origin contract; message relayed to confidentiality layer; confidentiality layer verifies proof and **updates encrypted balances** (homomorphic +/-), then returns an ack.
3. **Withdraw (debit → unlock):** User submits a withdrawal request plus ZK proof; confidentiality layer debits encrypted balance and acks; origin contract **unlocks** the corresponding ERC-20 back to the user.
4. **Selective disclosure (optional):** Under a deployment defined policy, authorized parties receive scoped decryption rights or proofs for specific accounts/transactions; log access events if required.

## Guarantees

- **Encrypts:** Amounts and balances from the public.
- **Preserves asset reality:** Underlying ERC-20 issuance and liquidity stay on the origin chain (no wrapped token required; no fund bridge).
- **Limits failure blast radius:** Cross-chain messaging issues primarily impact **availability/UX** (e.g. delayed withdrawals), while custody remains governed by the origin locking contract.
- **Supports auditability:** Selective disclosure can reveal only what’s required, when required.

## Trade-offs

- **Identity privacy is not default:** Sender/receiver addresses can remain transparent unless combined with separate identity/relationship-obfuscation patterns.
- **Operational overhead:** Requires monitoring relayers/messaging, retries, and clear failure-handling for delayed acks.

## Example

- A corporate treasury uses USDC on an EVM chain:
  - Locks USDC into the origin contract, receives an encrypted balance.
  - Executes private vendor payouts (amounts encrypted; counterparties known).
  - When a vendor wants liquidity, they withdraw back to underlying transparent USDC on the origin chain.
  - If audited, the treasury discloses the relevant invoices or transactions.

## References

- Fairblock docs: [Technical Overview](https://docs.fairblock.network/docs/confidential_transfers/technical_overview)
- IBC overview: [light-client-based messaging](https://ibcprotocol.org/)
