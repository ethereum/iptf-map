---
title: "Pattern: Network-Level Anonymity"
status: draft
maturity: PoC
layer: offchain
privacy_goal: Hide sender identity (IP, timing, query patterns) at the transport layer
assumptions: Network observer is a threat; content-layer privacy is handled separately
last_reviewed: 2026-04-14
works-best-when:
  - Metadata leakage (IP, timing, query patterns) is a threat model concern
  - Content privacy alone is insufficient -- "who" matters as much as "what"
  - Both read privacy (RPC queries) and write privacy (transaction submission) are needed
avoid-when:
  - Threat model does not include network-level observers
  - On-chain content privacy is the only requirement
dependencies:
  - Transport-layer tooling (Tor, Nym, or TEE-assisted stack)
  - External relay or mix-node infrastructure
context: both
crops_profile:
  cr: medium
  os: partial
  privacy: partial
  security: medium
---

## Intent

Hide _who_ is sending transactions or querying state at the network layer. Content-privacy patterns (ZK, FHE, MPC) hide _what_ is in a transaction but not _who_ submitted it -- IP addresses, timing, and query patterns still leak sender identity. Network-level anonymity complements content privacy to close the metadata gap.

In I2U contexts, the institution itself is often the network observer: it operates the RPC endpoint, sequencer, or relay through which users submit transactions and query state. Transport-layer protection is therefore a precondition for meaningful user privacy, even when content-layer privacy (encrypted balances, shielded transfers) is present.

This is an umbrella pattern. Multiple approaches exist, each with different trade-offs along the **anonymity trilemma**: anonymity set size, latency, and bandwidth overhead. No single approach dominates; the right choice depends on the institution's latency tolerance, threat model, and infrastructure constraints.

## Ingredients

- Cryptographic: onion encryption, mix-and-shuffle, secret sharing, cover traffic (varies by approach)
- Hardware: client-side TEE (TEE-assisted approach)
- Infra: relay or mix node network, or anonymity server cluster; private RPC endpoint

## Protocol (concise)

1. Client prepares transaction or RPC query for submission.
2. Client routes message through chosen anonymity layer (relay network, mixnet, or TEE cluster).
3. Anonymity layer strips or obscures sender metadata (IP, timing, query pattern).
4. Message reaches destination (RPC node, mempool) without attribution to sender.
5. Response returns through the same or separate anonymous channel.

See sub-patterns for approach-specific protocols: [Onion Routing](pattern-onion-routing.md), [Mixnet Anonymity](pattern-mixnet-anonymity.md), [TEE-Assisted](pattern-tee-network-anonymity.md).

## Anonymity Trilemma

Any network anonymity system must trade off between three properties:

- **Anonymity set size**: how many users your traffic blends with
- **Latency**: delay introduced by the anonymity mechanism
- **Bandwidth overhead**: cover traffic or padding required

Pure-cryptographic approaches (onion routing, mixnets) must sacrifice at least one. Hardware-assisted approaches (TEE) relax the trilemma by offloading verification to hardware but introduce a hardware trust assumption.

## Approaches

| Approach                                         | Latency                     | Anonymity strength | Trust assumption                    | Maturity | Pattern                       |
| ------------------------------------------------ | --------------------------- | ------------------ | ----------------------------------- | -------- | ----------------------------- |
| [Onion Routing](pattern-onion-routing.md)        | Moderate (~100-300ms typical, up to 500ms)     | Strong             | No single relay sees full path      | PoC      | Tor relay network, PSE tor-js |
| [Mixnet Anonymity](pattern-mixnet-anonymity.md)  | Very high (seconds-minutes) | Strongest          | Threshold mix nodes + cover traffic | PoC      | Nym, HOPR                     |
| [TEE-Assisted](pattern-tee-network-anonymity.md) | Low                         | Medium             | Client TEE + server majority        | PoC      | Flashbots Flashnet            |

## Guarantees

- Hides sender IP, timing correlation, and query-to-identity mapping (strength varies by approach).
- Complements content-privacy patterns -- together they hide both _what_ and _who_.
- Does not hide message content; pair with ZK, FHE, or MPC patterns for full-stack privacy.
- **I2U**: prevents the institution from correlating user IP addresses with on-chain activity, even when the institution operates the RPC endpoint or sequencer.
- **I2I**: institutions typically run dedicated nodes or relays, reducing the metadata threat surface to inter-institutional network observers.

## Trade-offs

- No approach simultaneously achieves strong anonymity, low latency, and low bandwidth (anonymity trilemma).
- Stronger anonymity generally means higher latency -- institutional latency requirements constrain the choice.
- All pure-cryptographic approaches are vulnerable to a sufficiently powerful global passive adversary (mixnets mitigate this best via cover traffic).
- Operational complexity varies: onion routing has mature tooling (Tor); mixnet integration remains non-trivial; TEE-assisted is research-stage.
- No Ethereum execution client natively supports any network anonymity layer as of 2026-04.

## Example

- Fund manager needs to query 50 token balances to value a portfolio. The RPC provider sees all queried addresses, revealing holdings and strategy.
- Onion routing: queries traverse 3 relays before reaching the RPC endpoint (~300ms added, acceptable for end-of-day valuation).
- Mixnet: queries are batched and reordered (seconds of delay, strongest anonymity guarantee).
- TEE-assisted: queries are secret-shared across servers (low latency, suitable for intraday checks).
- See sub-patterns for detailed examples.

## See also

- [Onion Routing](pattern-onion-routing.md) -- Tor-based multi-hop relay approach
- [Mixnet Anonymity](pattern-mixnet-anonymity.md) -- batching, reordering, and cover traffic approach
- [TEE-Assisted Network Anonymity](pattern-tee-network-anonymity.md) -- low-latency hardware-assisted approach
- [Private Transaction Broadcasting](pattern-private-transaction-broadcasting.md) -- content privacy for writes (complementary)
- [Threshold Encrypted Mempool](pattern-threshold-encrypted-mempool.md) -- content privacy via threshold encryption
- [User-Controlled Viewing Keys](pattern-user-controlled-viewing-keys.md) -- complementary I2U protection at the data access layer
- [Forced Withdrawal](pattern-forced-withdrawal.md) -- complementary I2U protection for asset recovery
- [RFP: Private Reads](../rfps/rfp-private-reads.md) -- read-side privacy gap
- [Modular Privacy Stack](pattern-modular-privacy-stack.md) -- where network anonymity fits in the four-layer architecture
