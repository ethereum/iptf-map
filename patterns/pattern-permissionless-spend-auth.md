---
title: "Pattern: Permissionless Spend Auth"
status: draft
maturity: concept
type: standard
layer: L1
last_reviewed: 2026-04-22

works-best-when:
  - Multiple auth methods must coexist in one shielded pool (ECDSA, P-256, post-quantum schemes).
  - Switching auth methods should not require migrating funds.
  - Auth method choice itself must remain private.

avoid-when:
  - A single auth scheme is sufficient and will not change.
  - The pool is app-level and already hardcodes one verification key.

context: both
context_differentiation:
  i2i: "Institutions rotate credentials over multi-year timelines (signing key compromise, HSM migration, post-quantum readiness). Separating ownership from auth lets one counterparty rotate signers without moving shielded positions, which would signal portfolio changes to the other side. Both counterparties still have legal recourse if an auth bug strands funds."
  i2u: "End users depend on auth method privacy to avoid being de-anonymized by their wallet choice. A user-held ownership secret protects against operator coercion: even if the wallet provider is compelled to rotate or revoke auth credentials, the user retains the ability to spend as long as they hold the ownership secret. Forced withdrawal guarantees must not depend on any specific auth method."

crops_profile:
  cr: high
  o: yes
  p: full
  s: high

crops_context:
  cr: "On L1 permissionless pools with open submission paths. Drops to `medium` if only whitelisted inner circuits are accepted, since auth method diversity would then require protocol-level approval."
  o: "Outer circuit is a fixed protocol artifact. Inner circuits can be authored and deployed permissionlessly, so the auth layer is natively open and forkable. Reaches `partial` only if the registry itself is gated."
  p: "`innerVkHash` is a private witness in the outer proof, so on-chain observers cannot tell which auth method was used. Unifies the anonymity set across all supported methods. Metadata leakage at the network and registry layers is out of scope for this pattern."
  s: "Outer circuit independently enforces ownership and value conservation, so a bug in an inner circuit can only affect users of that specific method, not the whole pool. Rides on the soundness of the recursive proof system."

post_quantum:
  risk: medium
  vector: "Outer circuit uses EC-based proof systems (Groth16, PLONK/KZG) vulnerable to CRQC. Classical auth inner circuits (ECDSA, EdDSA) are equally exposed."
  mitigation: "Hash-based outer circuit (STARK-style) plus lattice-based inner circuits. The recursive architecture makes it possible to add a post-quantum inner circuit alongside classical ones without migrating existing notes."

standards: [EIP-8182]

related_patterns:
  requires: [pattern-shielding]
  composes_with: [pattern-safe-proof-delegation, pattern-stealth-addresses]
  see_also: [pattern-user-controlled-viewing-keys, pattern-forced-withdrawal]

open_source_implementations: []
---

## Intent

Separate note ownership from spend authorization in a shielded pool, and use a recursive inner-outer circuit architecture so that multiple auth methods can coexist without fragmenting the anonymity set. Users can rotate or add auth methods without moving funds, and observers cannot tell which method authorized a given spend.

## Components

- Ownership secret: a per-user secret (e.g., a nullifier key) committed in each note via its hash. Not derived from any auth credential.
- Auth policy registry: on-chain Merkleized registry binding `(userIdentifier, innerVkHash)` to credentials. Separate from the note tree so auth updates do not touch note state.
- Outer circuit (stable): proves ownership, enforces pool invariants (value conservation, nullifier correctness), and recursively verifies the inner proof.
- Inner circuit (permissionless): proves authorization for a registered auth policy. Anyone can author and deploy a new inner circuit type.
- Recursive verifier: the outer circuit verifies the inner circuit's proof inline, producing a single on-chain proof format.

The shielded pool this plugs into is described in `pattern-shielding`.

## Protocol

1. [user] Register an auth policy by writing `(userIdentifier, innerVkHash)` to the on-chain registry. Multiple entries per owner are allowed (e.g., ECDSA plus passkey).
2. [prover] The inner circuit takes private witness data (signature, key material) and outputs a fixed public vector identifying who authorized, what credentials were used, and what was authorized.
3. [prover] The outer circuit proves the spender knows the ownership secret committed in the note, recursively verifies the inner proof, and checks that the inner outputs match the registry and the transaction data.
4. [contract] The outer proof is submitted to the shielded pool contract, which verifies it and updates the commitment and nullifier sets.
5. [user] Observers see one uniform proof format. `innerVkHash` remains a private witness inside the outer proof, so the auth method stays hidden.
6. [user] To change auth methods, add a new registry entry. Existing notes remain spendable with any registered method.

## Guarantees & threat model

Guarantees:

- Unified anonymity set. All auth methods share one note tree; spends using different methods are indistinguishable on-chain.
- Auth method privacy. Observers cannot determine which inner circuit was used.
- No fund migration. Changing or adding auth methods does not require moving notes.
- Ownership isolation. A bug in an inner circuit cannot forge ownership; it can produce false authorization claims but nothing else. The outer circuit independently enforces ownership, value conservation, and nullifier correctness.

Threat model:

- Soundness of the recursive proof system.
- Soundness of each deployed inner circuit. A faulty inner circuit puts users of that specific method at risk but does not affect other methods or the ownership layer.
- Registry integrity. If the registry can be rewritten without user consent, auth policies can be stolen; the registry must be append-only or governed by the user's ownership secret.
- Ownership secret custody. Loss of the ownership secret is permanent fund loss regardless of registered auth methods.

## Trade-offs

- Recursive proof cost. Inner proof verification inside the outer circuit increases proving time and circuit complexity.
- Outer circuit rigidity. Adding new inner circuit types is permissionless, but the outer circuit interface is fixed. Changing it requires a protocol upgrade.
- Separate ownership secret. Users must manage an ownership secret independent of their auth credentials. This is a new key-management burden.
- Registry gas costs. Registering or rotating auth policies is an on-chain write.

## Example

- A user registers ECDSA auth. Later they add a P-256 passkey as a second method. They spend a note using the passkey; on-chain, the transaction looks identical to any ECDSA spend. When they later rotate to a post-quantum scheme, existing notes remain spendable with no withdrawal and re-deposit required.

## See also

- [EIP-8182 draft](https://github.com/ethereum/EIPs/pull/11373)
