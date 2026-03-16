---
title: "Pattern: Permissionless Spend Auth"
status: draft
maturity: PoC
layer: L1
privacy_goal: Extensible authentication without fragmenting anonymity sets
assumptions: Ownership/auth split, outer/inner circuit model, Merkleized auth policy registry, ZK proof system
last_reviewed: 2026-03-16
context: both
crops_profile:
  cr: high
  os: yes
  privacy: full
  security: high
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

This pattern has two layers. The first is a security-model decision: separate note ownership from spend authorization. The second is an implementation choice: use a recursive inner/outer circuit architecture so that multiple auth methods can coexist without fragmenting the anonymity set.

## Layer 1: Ownership / auth split

In most shielded pool designs, a note's owner field is the auth credential itself — typically a public key. Ownership and authentication are the same thing. Changing your key changes your identity, and existing notes are stranded.

This pattern separates the two. Notes commit to an ownership secret (e.g., a hash of a private key) that is independent of any particular auth credential. To spend a note, you must prove two things: that you own it (knowledge of the ownership secret) and that you authorized this specific transaction (a valid credential). These are checked independently.

**Why separate them:**

- **Privacy loss ≠ fund loss.** Ownership and authorization are different capabilities. A leaked ownership secret reveals what you own and lets an attacker track your spending, but it doesn't let them take your money — they still need to pass auth. In a monolithic design where ownership = auth, one leaked key loses everything.
- **Privacy loss can be bounded; fund loss can't.** Because privacy and spending are controlled by different secrets, systems can be designed to limit privacy exposure to past transactions (e.g., by rotating secrets that control future derivations). Fund theft is instant and total. Separating the two means the recoverable failure mode (privacy) and the catastrophic one (funds) don't share a single point of failure.
- **Richer auth policies.** Auth can be a simple signature, a multisig threshold, a time-locked policy, or a spending limit. The ownership layer stays a simple secret. Authorization logic can be arbitrarily complex without changing the note format.
- **Non-custodial delegation.** A third-party prover needs the ownership secret to build the witness, but can't spend without passing auth. This is what makes safe proof delegation possible (see [Safe Proof Delegation](pattern-safe-proof-delegation.md)).

## Layer 2: Recursive permissionless auth architecture

Given that ownership and auth are separate, the question is how to support multiple auth methods without fragmenting the pool.

One approach: deploy a separate circuit for each auth method. Each circuit handles both ownership and its specific auth scheme. This works, but every new auth method means a new verification key, which means transactions are distinguishable by auth method on-chain (anonymity set fragmentation), and adding a method requires a protocol upgrade or governance action to register the new circuit.

The recursive approach avoids both problems:

- A stable **outer circuit** (protocol-managed) proves ownership and enforces pool invariants.
- A permissionless **inner circuit** (anyone can write and deploy) proves authorization and outputs a fixed public vector: a fixed public vector identifying who authorized, what credentials were used, and what was authorized.
- The outer circuit recursively verifies the inner circuit's proof. On-chain, the result is a single proof — observers cannot tell which inner circuit was used.

**What the recursive model gives you:**

- **One note tree, one nullifier set.** All auth methods share the same pool state.
- **Auth-method privacy at transaction time.** `innerVkHash` is a private witness. Transactions look identical regardless of auth method.
- **No fund migration when switching auth.** Because ownership and auth are separate and all auth methods share the same pool, switching methods is just a registry update — no need to transfer notes to a new identity.
- **No protocol upgrade per auth method.** New inner circuits are deployed permissionlessly. Users register an auth policy and start using it.
- **No per-auth-method pools or circuit IDs.** The base protocol has one outer circuit. Auth diversity lives in the registry.

## Ingredients

- **Ownership secret**: a per-user secret (e.g., `nullifierKey`) committed in each note via its hash. Not derived from any auth credential.
- **Auth policy registry**: on-chain Merkleized registry binding `(userIdentifier, innerVkHash)` to credentials. Separate from the note tree.
- **Outer circuit** (stable): proves ownership and enforces pool invariants.
- **Inner circuit** (permissionless): proves authorization for a registered auth policy.
- **Recursive verifier**: outer circuit verifies the inner circuit's proof inline.

## Protocol

1. **Register auth policy.** User writes `(userIdentifier, innerVkHash)` to the on-chain registry. Multiple entries per owner allowed (e.g., ECDSA + passkey).
2. **Inner circuit proves authorization.** The inner circuit takes private witness data (signature, key material) and outputs a fixed public vector identifying who authorized, what credentials were used, and what was authorized.
3. **Outer circuit proves ownership and verifies auth.** The outer circuit proves the spender knows the ownership secret committed in the note, recursively verifies the inner proof, and checks that the inner outputs match the registry and the transaction data.
4. **Auth method stays hidden.** `innerVkHash` is a private witness inside the outer proof. On-chain observers see one uniform proof format.
5. **Switch without migration.** To change auth methods, the user adds a new registry entry. Existing notes remain spendable.

## Guarantees

- **Unified anonymity set.** All auth methods share one note tree — ECDSA spends are indistinguishable from passkey spends on-chain.
- **Auth method privacy.** Observers cannot determine which inner circuit was used.
- **No fund migration.** Changing or adding auth methods does not require moving notes.
- **Ownership isolation.** A bug in an inner circuit cannot forge ownership — it can only produce false authorization claims. The outer circuit independently enforces ownership, value conservation, and nullifier correctness.

## Trade-offs

- **Recursive proof cost.** Inner proof verification inside the outer circuit increases proving time and circuit complexity.
- **Outer circuit rigidity.** Adding new inner circuit types is permissionless, but the outer circuit interface is fixed. Changing it requires a protocol upgrade.
- **Inner circuit trust.** A faulty inner circuit could let an unauthorized party prove "auth" — funds at risk for users of that specific method, though other methods and the ownership layer are unaffected.
- **Separate ownership secret.** Users must manage an ownership secret that is independent of their auth credentials. Loss of this secret is permanent fund loss, regardless of which auth methods are registered.

## Example

- Alice registers ECDSA auth. Later she adds a P-256 passkey as a second method. She spends a note using her passkey; on-chain, the transaction looks identical to any ECDSA spend. When she later rotates to a post-quantum scheme, her existing notes remain spendable — no withdrawal and re-deposit needed.

## Implementation note

EIP-8182 implements this pattern using Ethereum addresses as the owner identifier and `nullifierKeyHash` as the ownership commitment in each note. The auth policy registry maps `(address, innerVkHash)` to credentials. Other implementations could use different owner identifier schemes while preserving the same ownership/auth split.

## See also

- [L1 ZK Commitment Pool](pattern-l1-zk-commitment-pool.md) - the shielded pool this auth pattern plugs into
- [Shielded ERC-20 Transfers](pattern-shielding.md) - general shielded transfer pattern
- [Safe Proof Delegation](pattern-safe-proof-delegation.md) - intent-based delegation that composes with this circuit model
- [EIP-8182 (draft)](https://github.com/ethereum/EIPs/pull/11373)
