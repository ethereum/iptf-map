---
title: "Pattern: Native Account Abstraction (EIP-8141)"
status: draft
maturity: concept
type: standard
layer: L1
last_reviewed: 2026-04-22

works-best-when:
  - Multiple signature schemes must coexist (ECDSA, post-quantum, passkeys).
  - Stealth address or shielded pool recipients need gas without pre-funding.
  - Protocol must support future cryptographic migrations without address changes.
avoid-when:
  - Current EOA and ECDSA model is sufficient.
  - No post-quantum or auth agility requirements.

context: both
context_differentiation:
  i2i: "Institutions can mandate organisation-wide validation policies (for example, post-quantum-only signatures, multi-party approvals, per-role gas budgets) on accounts they control. Both parties retain legal recourse for operational failures and counterparties can audit validation code."
  i2u: "End users choose their own validation logic (passkeys, multisig, post-quantum signatures) without institutional lock-in. Crucially, native gas sponsorship removes the trusted relayer that today links stealth-address recipients to a funding account, so users are not forced to trust an operator to transact."

crops_profile:
  cr: high
  o: yes
  p: partial
  s: high

crops_context:
  cr: "High on L1 because transactions flow through the regular mempool. Eliminates the ERC-4337 bundler bottleneck and the relayer dependency that today gates stealth-address and shielded-pool withdrawals."
  o: "EIP process is open; reference implementations will be open-source. Validation code is per-account and forkable."
  p: "Does not itself hide transaction content. Privacy gains come indirectly by removing relayer centralisation, enabling gas sponsorship without linking entry and exit addresses, and letting accounts rotate to post-quantum signatures without moving funds."
  s: "Strong when validation code is audited or drawn from standardised libraries. Shifts auditing burden from protocol developers to account owners; bugs in custom validation can lock or drain accounts."

post_quantum:
  risk: low
  vector: "Per-account validation decouples the signature scheme from the address. Accounts can rotate ECDSA to ML-DSA or SLH-DSA without redeploying or moving funds."
  mitigation: "Direct enabler of post-quantum migration on the execution layer. See [Post-Quantum Threats](../domains/post-quantum.md)."

standards: [EIP-8141]

related_patterns:
  composes_with: [pattern-stealth-addresses, pattern-shielding]
  see_also: [pattern-permissionless-spend-auth, pattern-lean-ethereum]

open_source_implementations:
  - url: https://eips.ethereum.org/EIPS/eip-8141
    description: "EIP-8141 specification (draft)"
    language: "Specification"
---

## Intent

Make every Ethereum account natively programmable by replacing the hardcoded ECDSA `ecrecover` check with user-defined validation logic at the protocol level. Transactions are processed through the regular mempool using transaction frames that separate validation from execution. The design removes bundler and relayer dependencies, enables native gas sponsorship, and unlocks privacy patterns that currently require trusted off-protocol infrastructure.

## Components

- Frame transaction: ordered list of frames per transaction. Each frame specifies a mode (`VERIFY`, `SENDER`, `DEFAULT`), target address, gas limit, and data. Frames execute sequentially with independent gas metering.
- Account validation code: per-account logic executed inside `VERIFY` frames. It can validate any signature scheme (ECDSA, ML-DSA, SLH-DSA, passkeys, multisig) or any zero-knowledge proof.
- `APPROVE` opcode: called inside `VERIFY` frames to authorise execution (`0x0`), payment (`0x1`), or both (`0x2`). Payment approval decides who pays gas at runtime, decoupling authorisation of execution from gas payment.
- Regular mempool: carries frame transactions alongside legacy transactions. No separate mempool or bundler network.

## Protocol

1. [user] Sign and submit a frame transaction containing an ordered list of frames to the regular mempool.
2. [contract] Execute `VERIFY` frames as static calls. Each must call `APPROVE` with a scope (`0x0` execution, `0x1` payment, `0x2` both). If no frame approves payment, the transaction is invalid.
3. [contract] After validation passes, execute `SENDER`-mode frames with the sender as caller, and `DEFAULT`-mode frames with the protocol entry point as caller.
4. [contract] Charge gas to whichever account approved payment, which may differ from the sender.

## Guarantees & threat model

Guarantees:

- Auth agility: accounts migrate between signature schemes without changing address or moving assets.
- No bundler dependency: transactions use the regular mempool, preserving censorship resistance.
- Native gas sponsorship: stealth-address recipients and shielded-pool withdrawals can transact immediately without pre-funded ETH and without a trusted relayer. Fresh addresses are not linkable via gas-funding transactions.
- Privacy improvement: removes the relayer and paymaster centralisation vector that exists with ERC-4337 and out-of-protocol gas sponsorship.

Threat model:

- Bugs in per-account validation code can lock funds or allow unauthorised spends. Auditing burden shifts to account owners or standardised library authors.
- A malicious sponsor approving payment for a transaction they did not submit is still constrained by the `APPROVE` semantics; however, gas griefing through failed validation needs careful fee handling at the protocol level.
- Does not hide transaction content. Network-level metadata (IP, timing) remains a separate concern.

## Trade-offs

- Draft status: EIP-8141 is being discussed as a potential headliner for a future fork but is not finalised. Production use is not available.
- Migration path: wallets, dApps, indexers, and tooling must be updated. Existing EOAs need an upgrade path.
- Validation code risk: custom validation logic introduces a new class of account-level vulnerabilities. Standardised, audited libraries mitigate this.
- Mempool propagation: nodes need to validate frame transactions before relaying, which slightly increases propagation cost compared to legacy transactions.

## Example

- A user receives funds at a stealth address. A sponsor (or the user's main account) approves payment for the stealth account's first transaction. No relayer, no paymaster, and no on-chain link between the stealth address and the funding account. The stealth account uses passkey validation initially. Later, the user rotates validation logic to ML-DSA for post-quantum safety: same address, same funds, new signature scheme.

## See also

- [EIP-8141 draft](https://eips.ethereum.org/EIPS/eip-8141)
- [Post-Quantum Threats](../domains/post-quantum.md)
