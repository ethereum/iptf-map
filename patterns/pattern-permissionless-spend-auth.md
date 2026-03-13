---
title: "Pattern: Permissionless Spend Auth"
status: draft
maturity: PoC
layer: L1
privacy_goal: Extensible authentication without fragmenting anonymity sets
assumptions: Outer/inner circuit split, Merkleized auth policy registry, ZK proof system
last_reviewed: 2026-03-13
works-best-when:
  - Multiple auth methods must coexist in one shielded pool (ECDSA, P-256, post-quantum).
  - Switching auth methods should not require migrating funds.
  - Auth method choice itself must remain private.
avoid-when:
  - Single auth scheme is sufficient and will not change.
  - Pool is app-level and already hardcodes one verification key.
dependencies:
  - ZK proof system (recursive verification)
  - Merkle tree (auth policy registry)
  - EIP-8182 (draft)
---

## Intent

Separate **protocol invariants** (value conservation, nullifier uniqueness, Merkle membership) from **authentication logic** (how a user proves they authorized a spend) using a recursive outer/inner circuit split. This lets the pool support multiple auth methods — ECDSA, passkeys, multisig, post-quantum — without fragmenting the anonymity set or requiring fund migration when switching methods.

## Ingredients

- **Outer circuit** (stable): enforces protocol invariants shared by all spends
- **Inner circuit** (permissionless): user-chosen authentication logic
- **Auth policy registry**: on-chain Merkleized registry binding `(address, innerVkHash)` to credentials
- **Recursive verifier**: outer circuit verifies the inner circuit's proof inline

## Protocol (concise)

1. **Register auth policy.** User writes `(address, innerVkHash)` to the on-chain registry. Multiple entries per address allowed (e.g., ECDSA + passkey).
2. **Inner circuit proves auth.** The inner circuit takes private witness data (signature, key material) and outputs a fixed public vector: `[authorizingAddress, authDataCommitment, policyVersion, intentDigest]`.
3. **Outer circuit verifies recursively.** The outer circuit takes the inner proof as a private witness, verifies it, then checks protocol invariants: value conservation, nullifier derivation, Merkle membership of the spent notes, and encryption correctness of output note memos.
4. **Auth method stays hidden.** `innerVkHash` is a private witness inside the outer proof. On-chain observers see one uniform proof format regardless of which auth method was used.
5. **Switch without migration.** To change auth methods, the user adds a new registry entry. Existing notes remain spendable — notes are auth-method-agnostic, tied to the address rather than a specific verification key.

## Guarantees

- **Unified anonymity set.** All auth methods share one note tree — ECDSA spends are indistinguishable from passkey spends on-chain.
- **Auth method privacy.** Observers cannot determine which inner circuit was used.
- **No fund migration.** Changing or adding auth methods does not require moving notes.
- **Protocol invariant isolation.** A bug in an inner circuit cannot violate value conservation or mint tokens — the outer circuit independently enforces these.

## Trade-offs

- **Recursive proof cost.** Inner proof verification inside the outer circuit increases proving time and circuit complexity.
- **Outer circuit rigidity.** Adding new inner circuit types is permissionless, but the outer circuit (which defines the interface the inner circuit must satisfy) is fixed. Changing it requires redeploying the pool.
- **Inner circuit trust.** A faulty inner circuit could let an unauthorized party prove "auth" — funds at risk for users of that specific method, though other methods are unaffected.

## Example

- Alice registers ECDSA auth. Later she adds a P-256 passkey as a second method. She spends a note using her passkey; on-chain, the transaction looks identical to any ECDSA spend. When she later rotates to a post-quantum scheme, her existing notes remain spendable — no withdrawal and re-deposit needed.

## See also

- [L1 ZK Commitment Pool](pattern-l1-zk-commitment-pool.md) - the shielded pool this auth pattern plugs into
- [Shielded ERC-20 Transfers](pattern-shielding.md) - general shielded transfer pattern
- [Safe Proof Delegation](pattern-safe-proof-delegation.md) - intent-based delegation that composes with this circuit model
- [EIP-8182 (draft)](https://github.com/ethereum/EIPs/pull/11373)
