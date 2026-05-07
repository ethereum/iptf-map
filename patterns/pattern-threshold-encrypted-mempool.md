---
title: "Pattern: Threshold-encrypted mempool"
status: draft
maturity: testnet
type: standard
layer: L1

works-best-when:
  - Miner Extractable Value protection is needed at the protocol level rather than through a trusted relay.
  - Users cannot or do not want to trust a private relay as a single point of trust.
  - Censorship resistance must be combined with pre-inclusion content privacy.
avoid-when:
  - The committee liveness dependency is unacceptable for the target use case.
  - Decryption latency is incompatible with the workload.
  - A single trusted operator is acceptable, in which case a private relay is simpler.

last_reviewed: 2026-04-22

context: both
context_differentiation:
  i2i: "The protocol-level design treats every participant identically, so institutional submitters get the same guarantee as anyone else. Institutions may still prefer bilateral private-relay integrations where contractual recourse is available, but the threshold scheme removes any single-operator trust."
  i2u: "End users are protected by the same k-of-n threshold as institutions, which is the main user-facing benefit: MEV protection does not require trusting a sequencer or a private-order-flow relay. The guarantee is only as strong as the committee's independence, so a committee captured by institutional interests degrades the user-side protection."

crops_profile:
  cr: high
  o: partial
  p: partial
  s: medium

crops_context:
  cr: "Censorship resistance is `high` because encrypted transactions can be included by any block builder without inspecting content, and no single relay can suppress them."
  o: "Reference implementations are open source; keyper-network governance and participation criteria vary by deployment and may be gated."
  p: "Content privacy is `partial`: the payload is hidden until decryption, but sender address, gas limit, and transaction size remain visible pre-inclusion, and post-decryption MEV on the resulting state is still possible."
  s: "Security rides on the k-of-n honest-committee assumption, correct distributed key generation, and timely key release after block commitment. Premature decryption reduces the guarantee to that of a transparent mempool."

post_quantum:
  risk: high
  vector: "Pairing-based threshold encryption schemes rely on elliptic-curve primitives broken by a CRQC; pre-inclusion ciphertext collected today has Harvest-Now-Decrypt-Later exposure."
  mitigation: "Lattice-based threshold encryption schemes. See [Post-Quantum Threats](../domains/post-quantum.md)."

standards: [ERC-20, EIP-7573]

related_patterns:
  requires: [pattern-private-transaction-broadcasting]
  composes_with: [pattern-focil-eip7805, pattern-pretrade-privacy-encryption, pattern-shielding]
  alternative_to: [pattern-tee-based-privacy]
  see_also: [pattern-network-anonymity, pattern-modular-privacy-stack]

open_source_implementations:
  - url: https://github.com/shutter-network/shutter
    description: "Shutter threshold-encryption toolkit for Ethereum-compatible chains"
    language: "Go"
---

## Intent

Prevent miner-extractable-value extraction by encrypting transaction content before mempool submission and releasing the decryption key only after block ordering is committed. A distributed committee holds threshold key shares, so no single party can decrypt prematurely. The result is cryptographic protection against front-running, back-running, and sandwich attacks, without handing trust to any one relay.

This pattern is the cryptographic sub-pattern of [Private Transaction Broadcasting](pattern-private-transaction-broadcasting.md). See that pattern for alternative approaches (trust-based private relays, hardware-assisted builders).

## Components

- Threshold encryption scheme: a k-of-n construction so that k committee members must cooperate to decrypt.
- Distributed key generation: the committee jointly produces the threshold public key without any party ever holding the full private key.
- Keyper committee: a distributed set of key holders drawn from validators, independent operators, or a delegated governance process.
- Block builder integration: the builder accepts encrypted payloads and includes them without inspecting contents.
- Decryption oracle: publishes decryption key shares after block commitment so execution can proceed.
- Identity-based encryption or timelock-encryption variants are optional when slot-based decryption is required without a committee round trip.

## Protocol

1. [operator] Keypers run distributed key generation to produce a threshold public key and individual key shares.
2. [operator] The threshold public key is published so users can encrypt transactions to it.
3. [user] The user encrypts a transaction under the threshold public key and submits the ciphertext to the mempool.
4. [operator] The block builder includes the ciphertext in a block without seeing its contents.
5. [contract] The block is proposed and finalized; slot commitment is now immutable.
6. [operator] At least k keypers release their decryption key shares for the slot.
7. [operator] Shares are aggregated into the slot decryption key, which reveals the transactions, and execution proceeds on the decrypted payloads.

## Guarantees & threat model

Guarantees:

- Pre-inclusion content privacy: transaction contents are hidden from block builders, searchers, and validators until after block commitment.
- Cryptographic enforcement: no single party can decrypt, so front-running and sandwiching at the mempool stage are prevented without trusting a relay.
- Censorship resistance: encrypted payloads carry no application-layer signal, so content-based censorship is not possible at the builder.
- Post-decryption auditability: once the slot key is released, transaction history becomes public and fully verifiable.

Threat model:

- Honest-threshold assumption: fewer than k honest keypers allows premature decryption and restores mempool-stage MEV.
- Liveness: fewer than k online keypers leaves encrypted transactions stuck; operators must decide between a longer liveness timeout and forfeiting the transactions.
- Collusion: keypers colluding with block builders can front-run after decryption, so economic penalties and reputation controls are required.
- Metadata leakage: size, gas limit, and sender address remain visible before decryption and can still enable inference attacks on large or identifiable trades.
- Coverage gap: only the mempool phase is protected; ordering-based extraction that happens after decryption on the public state is out of scope.

## Trade-offs

- Decryption adds latency after block inclusion, typically sub-second, which can be acceptable for settlement but borderline for latency-sensitive trading.
- Infrastructure complexity is significant: distributed key generation, keyper-network operation, and decryption oracle must all be built and kept live.
- Committee capture is the primary attack surface; diverse keyper sets, time-bounded rotations, and economic bonding mitigate but do not remove the k-of-n trust assumption.
- Common failure modes, such as a compromised share, a distributed key generation ceremony flaw, or an offline committee, must be addressed with key rotation, verifiable distributed key generation, and redundancy with timeout fallbacks.
- Cryptographic protection stops at the mempool boundary; integration with shielding or stealth-address patterns is needed to close the post-decryption visibility gap.

## Example

A trading desk submits a large stablecoin trade on a chain that runs a threshold-encryption layer. The desk encrypts the transaction under the current-epoch threshold public key and submits it to the public mempool. Validators include the ciphertext in the next block without seeing the destination or amount. After finalization, the keyper committee releases its shares and the trade is decrypted and executed; competing searchers have no opportunity to front-run or sandwich the trade during the mempool phase. On the same chain, a retail swap user encrypts a token swap to the same public key and obtains the same pre-inclusion privacy without having to trust a specialised private relay.

## See also

- [Shutter Network overview](https://shutter.network/)
- [Shutter documentation](https://docs.shutter.network/)
- [Gnosis Chain Shutter integration](https://docs.gnosischain.com/about/specs/shutter/)
- [Shutter](../vendors/shutter.md)
- [Fairblock](../vendors/fairblock.md)
