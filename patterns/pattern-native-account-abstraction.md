---
title: "Pattern: Native Account Abstraction (EIP-8141)"
status: draft
maturity: draft
layer: L1 | L2
privacy_goal: Programmable account validation enabling auth agility, gas sponsorship, and privacy-preserving transaction submission
assumptions: EIP-8141 adoption, wallet ecosystem support, transaction frame model
last_reviewed: 2026-03-18
works-best-when:
  - Multiple signature schemes must coexist (ECDSA, PQ, passkeys)
  - Stealth address or shielded pool recipients need gas without pre-funding
  - Protocol must support future cryptographic migrations without address changes
avoid-when:
  - Current EOA + ECDSA model is sufficient
  - No PQ or auth agility requirements
dependencies: [EIP-8141]
context: both
crops_profile:
  cr: high
  os: yes
  privacy: partial
  security: high
---

## Intent

Make every Ethereum account natively programmable: replace the hardcoded ECDSA `ecrecover` check with user-defined validation logic at the protocol level. Unlike ERC-4337 (which routes transactions through bundlers and a separate mempool), EIP-8141 processes transactions through the regular mempool using transaction frames that separate validation from execution. This eliminates bundler dependency, enables native gas sponsorship, and unlocks privacy patterns that today require trusted relayers.

## Ingredients

- **Standards**: EIP-8141 (native account abstraction via Frame Transactions)
- **Account validation code**: per-account logic executed in VERIFY frames; can verify any signature scheme (ECDSA, ML-DSA, SLH-DSA, passkeys, multisig) or ZK proofs, and must call the `APPROVE` opcode to authorize the transaction
- **Frame model**: ordered list of frames per transaction, each with a mode (VERIFY, SENDER, DEFAULT), target, gas limit, and data. Frames execute sequentially with independent gas metering
- **APPROVE opcode**: called within VERIFY frames to authorize execution (`0x0`), payment (`0x1`), or both (`0x2`). Payment approval determines who pays gas at runtime, enabling separation in authorising execution of the transaction and gas payment.

## Protocol

1. **Frame transaction.** User submits `Frame` Transaction containing an ordered list of frames. Each frame specifies a mode (`VERIFY`, `SENDER`, or `DEFAULT`), a target address, a gas limit, and data. The transaction goes to the regular mempool, no bundler or separate mempool needed.
2. **Validation (VERIFY frame).** One or more VERIFY frames execute the account's validation logic as static calls. Each VERIFY frame must call the `APPROVE` opcode with a scope: `0x0` (authorize execution), `0x1` (authorize payment), or `0x2` (both). If no frame approves payment, the transaction is invalid.
3. **Execution (SENDER / DEFAULT frames).** After validation, SENDER-mode frames execute with the transaction sender as caller (requires prior execution approval). DEFAULT-mode frames execute with the protocol entry point as caller.

## Guarantees

- **Auth agility**: accounts migrate between signature schemes without changing addresses or moving assets. Allows key rotation, makes Ethereum execution more resilient.
- **No bundler dependency**: transactions use the regular mempool, preserving censorship resistance.
- **Native gas sponsorship**: stealth address recipients and shielded pool withdrawals can transact immediately without ETH pre-funding or trusted relayers.
- **Privacy/CR improvement**: eliminates the relayer/paymaster centralization vector. Fresh addresses are not linkable via gas funding transactions.
- **I2I**: institutions can mandate PQ-only validation for their accounts, as well as customise acces/authorisation level of accounts within an organisation, with granular rules on managing gas spending.
- **I2U**: end users choose their own security model (passkeys, multisig, PQ sigs) without institutional lock-in.

## Trade-offs

- **Draft status**: the EIP is being discussed as a potential headliner for a future fork but is not yet finalized.
- **Migration plan**: still needs a clear migration path for existing EOAs and broader ecosystem adoption (wallets, dApps, tooling).
- **Validation code risk**: bugs in custom validation logic can lock or drain accounts. Auditing burden shifts to account owners (or to standardized validation code libraries).

## Example

- Alice receives funds to a stealth address. With native AA, a sponsor (or Alice's main account) pays gas for the stealth address's first transaction, no relayer, no paymaster, no on-chain link between Alice's main account and the stealth address. Alice's stealth account uses passkey validation. Later, she upgrades to ML-DSA validation for PQ safety, same address, same funds.

## See also

- [Stealth Addresses](pattern-stealth-addresses.md) — native AA eliminates relayer dependency for stealth address gas
- [Permissionless Spend Auth](pattern-permissionless-spend-auth.md) — application-layer auth agility for shielded pools
- [Lean Ethereum](pattern-lean-ethereum.md) — consensus-layer PQ migration
- [Post-Quantum Threats](../domains/post-quantum.md) — execution-layer migration path
