---
title: "Pattern: TLS payment bridge"
status: draft
maturity: testnet
type: standard
layer: hybrid
last_reviewed: 2026-04-22

works-best-when:
  - Instant payment rails (for example PIX, UPI, mobile money apps) are available in the target geography.
  - Peer-to-peer fiat-to-crypto swaps are needed without a custodial intermediary.
  - Onramping fiat to stablecoins or other on-chain assets is the workflow, rather than large institutional clearing.
avoid-when:
  - The payment rail has no TLS-accessible confirmation endpoint.
  - High-value institutional settlement requiring formal clearing and dispute rails.
  - Regulators in the target jurisdiction reject non-custodial fiat on-ramps.

context: i2u

crops_profile:
  cr: medium
  o: partial
  p: partial
  s: medium

crops_context:
  cr: "Censorship resistance is `medium` because settlement is anchored on-chain, but a notary or attestation service sits on the critical path and can delay or refuse proof generation."
  o: "Core primitives such as TLSNotary are open source, and the escrow contracts are verifiable. Notary infrastructure and attestation services may be operated by a single vendor and are not always forkable without operational cost."
  p: "Payment-attribute disclosure is scoped to what the zero-knowledge proof exposes (amount, payment status, counterparty identifier), but metadata about the payment rail, timing, and proof generation can still leak."
  s: "Security depends on the notary assumption in the zero-knowledge TLS protocol, correct circuit binding to the payment-rail response format, and attestation integrity if a Trusted Execution Environment is used as an off-chain verifier."

post_quantum:
  risk: high
  vector: "Zero-knowledge TLS constructions rely on multi-party computation or two-party computation over elliptic-curve Diffie-Hellman handshakes, all broken by a CRQC; a post-quantum key-exchange inside the same multi-party primitives is an open research problem."
  mitigation: "Migrate to post-quantum-friendly zero-knowledge TLS constructions once the handshake inside multi-party computation is solved. See [Post-Quantum Threats](../domains/post-quantum.md)."

standards: [ERC-20, EIP-712, ERC-7573]

related_patterns:
  requires: [pattern-zk-tls]
  composes_with: [pattern-shielding, pattern-tee-based-privacy]
  see_also: [pattern-stealth-addresses, pattern-private-transaction-broadcasting]

open_source_implementations:
  - url: https://github.com/tlsnotary/tlsn
    description: "TLSNotary reference implementation of zero-knowledge TLS"
    language: "Rust"
---

## Intent

Enable trust-minimized fiat-to-on-chain swaps by combining instant payment rails with zero-knowledge TLS proofs. A taker pays fiat to a liquidity provider through a standard bank or payment-app rail, runs a zero-knowledge TLS session against the provider's confirmation page, and submits a proof to an on-chain escrow contract. The contract verifies that the payment occurred and releases crypto to the taker. No party custodies funds on behalf of the other, and full bank or account details are never revealed on-chain.

## Components

- Zero-knowledge TLS stack: a multi-party or two-party computation protocol, for example a TLSNotary-style construction, that proves statements about a TLS session transcript without revealing the transcript.
- Instant payment rail: a retail payment system with a TLS-accessible confirmation endpoint (for example PIX, UPI, or a mobile money app).
- On-chain escrow contract: locks the liquidity provider's crypto, publishes the accepted rails and rate, and releases funds on successful proof verification.
- Order-matching layer: a peer-to-peer order book or matching service that pairs liquidity providers with takers.
- Verification path: either direct on-chain proof verification with a verifier contract, or an off-chain Trusted Execution Environment attestation service that emits an EIP-712 signed payment attestation consumed by an on-chain verifier.

## Protocol

1. [user] A liquidity provider deposits stablecoins into the escrow contract and publishes an order with accepted rails and rate.
2. [user] A taker selects the order and locks intent on-chain, committing to the swap parameters.
3. [user] The taker sends fiat to the provider through the specified payment rail.
4. [user] The taker runs a zero-knowledge TLS session against the payment-rail confirmation endpoint, jointly with the notary, and generates a proof attesting that the expected payment confirmation was received.
5. [contract] The verifier path validates the proof either directly on-chain or through a TEE attestation service that emits a signed attestation for an on-chain checker.
6. [contract] The escrow releases the stablecoins to the taker on successful verification; if no valid proof is submitted within the timeout, funds return to the liquidity provider.

## Guarantees & threat model

Guarantees:

- No custodial intermediary: the escrow contract is the only trusted on-chain component, and settlement is peer-to-peer.
- Scoped payment disclosure: only the attributes the zero-knowledge circuit exposes (amount, counterparty identifier, payment status) are revealed. Bank details, account numbers, and other transaction metadata stay hidden.
- Conditional release: the crypto is locked before fiat payment, and release is conditional on a valid proof within the timeout window, so liveness failures revert cleanly.
- Audit artefacts: proof artefacts can be stored off-chain for dispute resolution without exposing user data.

Threat model:

- Notary trust: TLSNotary-style protocols assume a non-colluding notary, so a malicious or unavailable notary can block proof generation or cause the proof to falsely validate under collusion.
- Trusted Execution Environment exposure if used: attestation integrity, side-channel attacks on the underlying hardware, and firmware vulnerabilities affect proof verification.
- Payment-rail dependency: downtime, API changes, or transport-layer upgrades at the payment provider can break proof generation without warning.
- Circuit-binding correctness: the zero-knowledge circuit must match the exact response format and transport configuration of the payment rail; silent mismatches break soundness.
- Out of scope: attacks on the fiat rail itself (for example reversing a payment after the proof is issued) are handled by timeouts and commercial remedies rather than the protocol.

## Trade-offs

- Proof generation is computationally heavy and can add seconds to minutes of latency, which affects retail UX for time-sensitive swaps.
- Notary selection and availability vary by geography and payment rail, so coverage depends on operational support rather than purely on the cryptography.
- TLS specification drift at the payment provider can break existing circuits; versioning and observability of the circuit are required to keep deployments stable.
- Using a Trusted Execution Environment as an off-chain verifier reduces on-chain gas costs but introduces an additional hardware trust boundary and attestation lifecycle.
- Post-quantum migration is blocked on an open research problem: running a post-quantum key exchange inside the multi-party computation handshake is not yet practical.

## Example

A user wants to buy stablecoins without going through a custodial exchange. A liquidity provider lists stablecoins in the escrow at a fixed rate and accepts payments through a consumer payment app. The user locks their intent on-chain, then pays the provider through the payment app. Using a browser extension, the user opens the payment confirmation page over a zero-knowledge TLS session jointly with the notary and generates a proof that the expected amount was received by the specified recipient. The user submits the proof to the escrow, which verifies the amount and recipient against the order and releases the stablecoins to the user's wallet. The provider has already received fiat through the app and has no further obligation.

## See also

- [TLSNotary project](https://github.com/tlsnotary/tlsn)
- [Post-Quantum Threats](../domains/post-quantum.md)
