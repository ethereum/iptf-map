---
title: "Pattern: Forward-Secure Signatures"
status: draft
maturity: concept
layer: offchain
last_reviewed: 2026-04-27

works-best-when:
  - Signer is physically seizable and erase-capable
  - Past unlinkability against post-seizure forensics is a goal
  - Signer is constrained to SHA-2 / HMAC primitives, not ZK-friendly hashes
avoid-when:
  - Signer can rotate identity (fresh keypair) instead of evolving keys
  - Erase semantics are not auditable (no transactional or NIST 800-88 Purge guarantee)
  - The scheme adds latency that breaks signer real-time requirements

context: both
context_differentiation:
  i2i: "Institutional signers (HSMs, custodian keys) gain bounded post-breach exposure for audit-trail privacy"
  i2u: "User devices (hardware wallets, embedded signers) gain past unlinkability under seizure"

crops_profile:
  cr: medium
  o: yes
  p: partial
  s: high

crops_context:
  cr: "No native gating; the epoch boundary signal is a censorship vector if controlled by a single beacon."
  o: "Hash chains over standard signature primitives. Open standards, multiple implementations possible."
  p: "Past keys protected; current and future epochs leak under compromise. Forward secrecy, not full privacy."
  s: "Strong with audited transactional erase plus RFC 6979 plus canonical-s. Degrades when device-side erase is best-effort."

post_quantum:
  risk: high
  vector: "Underlying ECDSA / EdDSA broken by CRQC. The hash-chain derivation is Grover-resistant at 128-bit security."
  mitigation: "Post-quantum signature primitive (Falcon, Dilithium) wrapped by the same hash-chain key evolution"

standards: [RFC 6979, FIPS 180-4, FIPS 186-5, NIST SP 800-88]

related_patterns:
  composes_with: [pattern-relay-mediated-proving, pattern-recipient-derived-receive-addresses, pattern-private-mtp-auth]
  alternative_to: [pattern-social-recovery]
  see_also: [pattern-mpc-custody]

open_source_implementations:
  - url: https://cseweb.ucsd.edu/~mihir/papers/fsig.html
    description: "Bellare and Miner forward-secure signature scheme (1999, reference paper)"
    language: paper
---

## Intent

Evolve a signing key over time so a signature produced under epoch `i`'s key remains verifiable later, but compromise at epoch `i+k` reveals only `epochSecret_{i+k}` and future epoch secrets. Past epoch secrets, and the privacy properties of past signatures (unlinkable nullifiers, addresses), remain protected.

The deployable instantiation on constrained signers is a hash-chain key-evolution wrapper around a standard signature primitive (ECDSA, EdDSA, RSA), trading the elegance of identity-based forward-secure schemes for primitives that already exist in shipping crypto APIs.

## Components

- **One-way derivation primitive**: SHA-2, or HMAC-SHA256 when per-epoch domain separation is needed.
- **Underlying signature scheme**: ECDSA-secp256k1 with RFC 6979 deterministic nonces and canonical-s, EdDSA, or RSA-PSS. The forward-secure wrapper does not replace the signature scheme.
- **Erase-capable storage**: per-epoch state securely erased at transition. Transactional erase prevents failure modes that leave both `epochSecret_{i-1}` and `epochSecret_i` resident.
- **Epoch boundary signal**: external clock, on-chain event, or beacon. Signer and verifier must agree on the current epoch.

## Protocol

1. [issuer] Provision signer with random `epochSecret_0`; register `epochPubkey_0` (or its commitment in a tree) with the verifier.
2. [signer] At epoch `i`, derive `epochSecret_i = SHA-256(epochSecret_{i-1})` and sign under the chosen scheme.
3. [signer] Transactionally erase `epochSecret_{i-1}` at epoch transition.
4. [signer] Refuse far-future epoch inputs to close the skip-ahead denial path.
5. [verifier] Check the signature against the published per-epoch public key.
6. [issuer] On loss or compromise, provision a fresh signer with a new `epochSecret_0`. The retired identity is not re-admitted.

## Guarantees & threat model

- **Forward secrecy**: an adversary holding `epochSecret_i` cannot recover `epochSecret_j` for `j < i` because SHA-256 is one-way. Past signatures retain their privacy properties up to public-channel disclosure.
- **Unforgeability of past signatures**: compromise at epoch `i` does not retroactively forge epoch `j < i` signatures.
- **Bounded compromise window**: damage scope is the current and future epochs, not the device lifetime.
- **Threat model**: adversary reads post-compromise device state. Out of scope: covert pre-compromise observation that captures `epochSecret_j` live; side-channel leakage that reveals stored secrets before erase.

## Trade-offs

- Long-lived secrets are a separate erase boundary. Forward secrecy applies only to per-epoch state. Designs that hold long-lived secrets alongside per-epoch state treat those secrets as a residual under seizure.
- Epoch length is a deployment knob. Shorter epochs reduce post-seizure exposure; more transitions mean more chances for a failed transactional erase.
- Verifier rotation. Verifiers accept a per-epoch public key. Compatible with membership-tree designs where each leaf commits to a per-epoch public key; complicates direct verification flows.
- Audit surface. The hash-chain step, transactional erase, and refusal-to-skip have shipped broken in HSM and signer firmware historically. Audit each explicitly.

## Example

A document timestamping authority signs proof-of-existence statements weekly. The authority is provisioned with `epochSecret_0`, derives `epochSecret_i = SHA-256(epochSecret_{i-1})` at each weekly transition, and transactionally erases prior epoch state. A breach during week 12 reveals `epochSecret_12` only; an attacker can issue week-12 timestamps but cannot forge weeks 0 through 11, and any per-epoch unlinkability properties of those past signatures hold against the breach attacker.

## See also

- [Bellare and Miner, "A Forward-Secure Digital Signature Scheme" (CRYPTO 1999)](https://cseweb.ucsd.edu/~mihir/papers/fsig.html).
- [NIST SP 800-88 Rev. 1: Guidelines for Media Sanitization](https://csrc.nist.gov/publications/detail/sp/800-88/rev-1/final).
- [RFC 6979: Deterministic Usage of DSA and ECDSA](https://www.rfc-editor.org/rfc/rfc6979).
- [FIPS 186-5: Digital Signature Standard](https://csrc.nist.gov/publications/detail/fips/186/5/final).
