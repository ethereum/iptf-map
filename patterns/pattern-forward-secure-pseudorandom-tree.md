---
title: "Pattern: Forward-Secure Pseudorandom Tree"
status: ready
maturity: concept
layer: offchain
last_reviewed: 2026-06-18

works-best-when:
  - The credential holder must produce one unlinkable per-event value across a bounded event horizon (anonymous ballots, periodic claim issuance)
  - The host application uses a ZK-friendly hash (Poseidon, Rescue) so the tree is verifiable inside a SNARK
  - Post-seizure unlinkability of past events is a goal and the device can honour overwrite-in-place
avoid-when:
  - The event horizon is unbounded or unknown (no fixed `N` to pre-commit)
  - The signer can rotate identities (fresh credential per event) instead of evolving a single chain
  - Storage erase is best-effort (copy-on-write filesystems, SSDs without [TRIM](https://en.wikipedia.org/wiki/Trim_(computing))) and forensic recovery is in the threat model

context: both
context_differentiation:
  i2i: "Institutional signers (HSM-held credentials, custodian keys) commit a per-credential chain root inside an attribute commitment; the audit interface is the chain root, not the per-slot values."
  i2u: "End-user devices ratchet the chain past each used slot and erase the consumed seed, so a future device seizure does not retroactively link past anonymous events to the device."

crops_profile:
  cr: medium
  o: yes
  p: full
  s: high

crops_context:
  cr: "The chain itself does not gate access. Slot assignment lives in a separate registry; that registry's gating model determines censorship resistance for the composing application."
  o: "Constructions over Poseidon, Rescue, or Bellare-Yee composition with any one-way function are publishable as open standards; implementations exist in Noir and Circom."
  p: "Past per-slot values become unrecoverable from current state under one-way PRG security. The composing application's nullifier or scope-tag derivation determines whether the public output reveals participation."
  s: "Strong with audited overwrite-in-place plus a depth-bounded chain. Degrades when the signer backs up the seed (any past snapshot recomputes the future chain) or when storage is non-erasing."

post_quantum:
  risk: medium
  vector: "Hash-based PRG and Merkle tree are Grover-resistant. Pairing-based zero-knowledge proof systems over the tree (KZG-PLONK, Groth16) are CRQC-broken; HNDL exposure on retained proofs follows the proof system."
  mitigation: "STARK or hash-based SNARK over the same tree construction preserves forward secrecy under CRQC."

standards: [NIST SP 800-88]

related_patterns:
  composes_with: [pattern-private-mtp-auth, pattern-voprf-nullifiers, pattern-zk-proof-systems]
  alternative_to: [pattern-forward-secure-signatures]
  see_also: [pattern-stealth-addresses, pattern-recipient-derived-receive-addresses]

open_source_implementations:
  - url: https://eprint.iacr.org/2001/035
    description: "Bellare and Yee, Forward-Security in Private-Key Cryptography (length-expanding PRG construction; Theorem 2.3 gives the forward-secrecy reduction this pattern instantiates)"
    language: paper
  - url: https://iacr.org/archive/eurocrypt2004/30270536/szydlo-loglog.pdf
    description: "Szydlo, Merkle Tree Traversal in Log Space and Time (log-space tail-stack traversal, 2 log_2(N) hashes per advance and O(log N) storage)"
    language: paper
---

## Intent

Pre-commit a depth-`d` Merkle tree of `N = 2^d` pseudorandom leaves under a single root at enrollment, then reveal one leaf per application event by opening the corresponding auth path inside a ZK circuit. After each opening, ratchet the seed forward and overwrite the consumed seed material in place, so an adversary holding the signer's state at any later time cannot recompute the past leaf preimages.

The pattern supplies per-event values for anonymous one-per-event signaling under credential systems: each leaf becomes the per-slot input to a Poseidon-derived nullifier or application-specific scope tag, and the chain root binds into a credential commitment so the application can prove eligibility-plus-slot in a single SNARK.

## Components

- Seed-evolving PRG: a one-way pseudorandom generator instantiated by a ZK-friendly sponge. Each step produces a per-slot value `v_i` and the next seed `s_{i+1}` from a single permutation call.
- Merkle commitment: a depth-`d` Poseidon tree over `(v_0, ..., v_{N-1})` with root `chain_root` published into the credential's attribute commitment. Depth-24 (`N = 2^24`) is the reference choice for a per-credential lifetime budget of ~16M events.
- Log-space Merkle traversal: Szydlo's tail-stack structure holds the right-sibling hashes along the path to the current leaf and updates in `2 log_2(N)` hashes per advance with `O(log N)` storage.
- Runtime state: `(s_curr, t, traversal, chain_root)`. `s_curr` is the head seed and `t` is the next slot the chain will produce; the traversal yields auth paths without recomputing past subtrees.
- Erase-capable storage: overwrite-in-place semantics for `s_curr` at each ratchet step. NIST SP 800-88 purge procedures apply per media class.

## Protocol

1. [signer] Sample `s_0` from a CSPRNG and derive the chain `(v_i, s_{i+1}) = PRG(s_i)` for `i in [0, N)`, building the depth-`d` Merkle root `chain_root`.
2. [signer] Bind `chain_root` into the credential commitment so the application's SNARK can verify credential membership and chain-root binding in one circuit. Initialise the runtime state (head seed, chain index, traversal state) and erase intermediate seeds and tree nodes.
3. [signer] On application event at slot `k`, advance the chain to `k`, compute `v_k` and the auth path, and consume `v_k` as a private input to the application SNARK.
4. [signer] After the event is recorded with finality, ratchet forward and overwrite the head seed in place.
5. [verifier] In-circuit, recompute `v_k` from the witnessed seed, verify the auth path against the credential-bound `chain_root`, and consume `v_k` in the application's nullifier or scope-tag derivation.

## Guarantees & threat model

- Per-slot forward secrecy: an adversary holding `s_curr` at audit time `T_audit` (with chain index `t`) recovers `v_{k'}` or `s_{k'}` for `k' < t` with advantage at most `2N * eps_PRG`, where `eps_PRG` bounds the PRG-distinguishing advantage of the underlying length-expanding generator and `N` is the chain length. The reduction is Bellare-Yee Theorem 2.3 applied to the seed chain.
- Slot non-reuse: an honest signer's chain index `t` is monotone; revisiting a past slot requires the consumed seed, which the ratchet step has erased. Application-layer per-event nullifier sets remain necessary; this pattern enforces the *signer-side* erasure they depend on under seizure.
- In-circuit verifiability: `chain_root` is a single field element and the auth path is `d` Poseidon hashes; the per-slot value comes from one PRG call. Total in-circuit cost is `d + 1` Poseidon permutations, independent of `N` and chain advance.
- Threat model: post-event device seizure and any non-signer party. Out of scope: live (pre-event) device compromise that captures `s_k` before erase; non-erasing storage that retains overwritten bytes; signer-side backups of `s_curr` or `s_0` (any backup constitutes a forward-secrecy capability against the future).

## Trade-offs

- Fixed event horizon. `N` is committed at enrollment. Exhausting the chain requires re-enrollment with a fresh `chain_root` bound through a new credential commitment. Choose `d` against the credential lifetime and event cadence; depth-24 yields ~16M events at one-per-slot.
- Off-circuit advance cost. A late signer with `t` far below the target slot performs up to `slot - t` PRG calls before proving. Pre-advancing in background amortises latency.
- Backup defeats forward secrecy. A holder of any past `s_k` snapshot recomputes the chain forward from `s_k` until the signer re-enrols. Backup of `s_0` defeats forward secrecy entirely; backup of `s_curr` defeats it relative to the snapshot.
- Storage semantics. Forward secrecy assumes ideal overwrite-in-place. Copy-on-write filesystems and SSDs without [TRIM](https://en.wikipedia.org/wiki/Trim_(computing)) leave recoverable byte traces.
- Slot vs. event coupling. One `v_k` per slot. Multiple events per slot reuse the value and collide the nullifier; the application enforces one-event-per-slot or extends the PRG output domain.

## Example

A standards consortium issues each accredited member a credential committing a depth-24 Poseidon tree over `N = 2^24` per-slot pseudorandom values, with the chain root bound through a credential attribute slot. The consortium's voting contract assigns each ballot an integer slot. To vote on ballot `X` at slot `k`, the member device advances the chain to `k`, opens the auth path inside a SNARK that verifies credential membership and the eligibility predicate, emits `nullifier = Poseidon(domain, v_k, ballot_id)`, and ratchets past `s_k` on finality. A future adversary seizing the device cannot recompute past `v_{k'}` values; the ballot record retains the nullifier, whose preimage is hidden by PRG security.

## See also

- [Bellare and Yee, "Forward-Security in Private-Key Cryptography" (CT-RSA 2003)](https://eprint.iacr.org/2001/035).
- [Szydlo, "Merkle Tree Traversal in Log Space and Time" (EUROCRYPT 2004)](https://iacr.org/archive/eurocrypt2004/30270536/szydlo-loglog.pdf).
- [Poseidon hash for zero-knowledge proof systems](https://eprint.iacr.org/2019/458).
- [NIST SP 800-88 Rev. 1: Guidelines for Media Sanitization](https://csrc.nist.gov/publications/detail/sp/800-88/rev-1/final).
