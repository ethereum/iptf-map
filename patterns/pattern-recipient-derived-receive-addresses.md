---
title: "Pattern: Recipient-Derived Receive Addresses"
status: draft
maturity: concept
layer: L1
last_reviewed: 2026-04-27

works-best-when:
  - Recipient is a constrained signer that cannot evaluate ECDH over the curve in real time
  - Sender does not need to know the recipient's identity (settlement contract just transfers to a supplied destination)
  - Recipient generates destinations rarely enough that re-derivation cost is acceptable
avoid-when:
  - Auditor needs view-only access to incoming transfers (no view-key split; use EIP-5564)
  - Sender wants to push to a recipient who has not pre-derived a destination (use stealth addresses)
  - Long-lived recipient secret cannot be tolerated under the threat model

context: both
context_differentiation:
  i2i: "Counterparty payment account derives a fresh destination per settlement event under a long-lived treasury secret."
  i2u: "User wallet derives a fresh receive destination per receive context under a long-lived recipient secret."

crops_profile:
  cr: medium
  o: yes
  p: partial
  s: medium

crops_context:
  cr: "Pattern itself does not gate access. Reach depends on the on-chain deposit path."
  o: "HMAC, secp256k1, keccak256 are open standards with multiple implementations."
  p: "Destinations look uniformly random to observers without the secret. No view-key audit channel; no chain-scanning detection of unsolicited inbound."
  s: "Long-lived recipient secret bounds compromise to the lifetime of one device. Pair with [Forward-Secure Signatures](pattern-forward-secure-signatures.md) when post-seizure unlinkability matters."

post_quantum:
  risk: high
  vector: "secp256k1 keys broken by Shor. HNDL is high: address-to-recipient mapping is preserved on-chain forever."
  mitigation: "Migrate the curve and the recipient-side derivation to a post-quantum primitive"

standards: [RFC 2104, FIPS 180-4, EIP-55]

related_patterns:
  composes_with: [pattern-relay-mediated-proving, pattern-forward-secure-signatures]
  alternative_to: [pattern-stealth-addresses]

open_source_implementations:
  - url: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
    description: "BIP-32 hierarchical deterministic wallets (related deterministic-derivation construction, no privacy property by itself)"
    language: spec
---

## Intent

Generate Ethereum receive addresses deterministically from a long-lived recipient secret plus per-event context (e.g., event identifier, contract address, sequence number), such that an observer without the secret cannot predict, recognize, or link the addresses, while the recipient (with their secret) can re-derive the corresponding private key and spend the funds.

This is **not** EIP-5564 stealth addressing. EIP-5564 derives destinations through ECDH between sender ephemeral and recipient view keys; recipients scan the chain to detect inbound funds; senders need the recipient's published view pubkey. The recipient-derived pattern is the recipient's own deterministic key-derivation scheme, optimized for constrained recipient devices that cannot evaluate ECDH in-the-loop and that have no published view-pubkey infrastructure.

## Components

- **Long-lived recipient secret**: 32 bytes provisioned at enrollment; held on a constrained device.
- **PRF**: HMAC-SHA256 (universal in conservative crypto APIs). Any PRF with 256-bit output suffices.
- **Curve operation**: secp256k1 scalar multiplication. Performed by the recipient or by an auxiliary device that learns nothing else; need not happen on the constrained device itself if it lacks the cycles.
- **Address hash**: keccak256, producing the 20-byte Ethereum address from the public key.

## Protocol

The construction is a PRF-derived deterministic key per `(recipientSecret, context)` pair:

1. [recipient] `derivedScalar = HMAC-SHA256(recipientSecret, DOMAIN_TAG || context...)`.
2. [recipient] `derivedPrivkey = derivedScalar` used as a secp256k1 scalar in `[1, n-1]`; on rare `>= n` outputs, RFC 6979-style reject-and-rehash.
3. [recipient] `derivedPubkey = derivedPrivkey * G` (secp256k1 scalar multiplication).
4. [recipient] `destination = keccak256(derivedPubkey)[-20:]`.
5. [sender] Transfer funds to `destination` (recipient supplied it under their authority).
6. [recipient] Spend from `destination` later by re-deriving `derivedPrivkey` from the same `(recipientSecret, context)`.

`DOMAIN_TAG` MUST be a domain-separated, application-specific constant. `context` MUST include all parameters that distinguish destinations within the recipient's lifetime (e.g., event identifier, contract address, sequence number).

## Guarantees & threat model

- **Unlinkability against external observers**: HMAC-SHA256 is a PRF. Without the recipient secret, two destinations look uniformly random and uncorrelated. Address-space collisions are bounded by birthday probability over 160-bit addresses (about 2^-80 per pair).
- **Spendability**: the recipient (with the secret and the public context) re-derives `derivedPrivkey` exactly. No chain scanning, no published view key.
- **Non-interactivity**: the sender does not need a view pubkey, ephemeral keypair, or per-recipient state.
- **Threat model**: adversary observes the chain and may compromise non-recipient parties. Out of scope: device seizure (long-lived secret residual); post-quantum adversary (recoverable curve).

## Trade-offs

- No view / spend split. Whoever holds the recipient secret both generates and spends. EIP-5564 supports a view-only auditor; this pattern does not. Audit access requires sharing the secret (full spend authority) or a separate disclosure mechanism.
- Long-lived recipient secret. Held on the device for its full lifetime. Device seizure exposes all past and future destinations. Mitigations are operational (frequent re-enrollment).
- No detection of unsolicited inbound transfers. Unlike EIP-5564 chain-scanning, the recipient knows about transfers only to destinations they themselves derived.
- Constrained-device limitations. The curve operation and keccak256 are not always available on conservative crypto APIs. Some deployments offload steps 3 and 4 to a companion device.
- Sloppy notation in spec writeups. The shorthand `destination = truncate(HMAC(secret, context))` is broken if read literally: a 20-byte truncation produces an unspendable address. The four-step construction above is required for spendability. Audit production code for the full path.

## Example

A privacy-preserving payroll system. Each employee's wallet holds a long-lived recipient secret. For each monthly payroll cycle, the wallet derives a fresh receive address via HMAC-SHA256 over `(recipientSecret, monthIdentifier, employerId)`, then computes the secp256k1 public key and the keccak256 address. The employee provides this address to the employer's payroll system; the employer disburses salary to the address. Observers see a fresh address each month with no public linkage between an employee's monthly receipts. The wallet later re-derives the private key from the same secret and month identifier to spend.

## See also

- [EIP-5564: Stealth Addresses](https://eips.ethereum.org/EIPS/eip-5564).
- [BIP-32: Hierarchical Deterministic Wallets](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki).
- [RFC 2104: HMAC](https://www.rfc-editor.org/rfc/rfc2104).
- [SEC 2: Recommended Elliptic Curve Domain Parameters](https://www.secg.org/sec2-v2.pdf).
