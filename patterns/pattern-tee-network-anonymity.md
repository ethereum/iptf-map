---
title: "Pattern: TEE-Assisted Network Anonymity"
status: draft
maturity: PoC
layer: offchain
privacy_goal: Hide sender identity (IP, timing) for both reads and writes at the transport layer
assumptions: TEE availability on client side, semi-honest server majority
last_reviewed: 2026-02-18
works-best-when:
  - Metadata leakage (IP, timing, query patterns) is a threat
  - Low latency is required (rules out Tor/mixnets)
  - Both read and write privacy are needed from the same infrastructure
avoid-when:
  - Threat model does not include network observers
  - Running own node eliminates RPC provider trust
  - High-latency anonymity networks (Tor, Nym) are acceptable
dependencies: [TEE (client-side), Secret sharing, Additive homomorphic commitments]
---

## Intent

Hide *who* is sending transactions or querying state at the network layer. Existing privacy patterns hide *what* (transaction content, balances) but not *who* — IP addresses, timing, and query patterns still leak sender identity. This pattern provides sender anonymity for both writes (transaction submission) and reads (RPC queries) with latency suitable for DeFi.

## Ingredients

- Cryptographic: secret sharing, additive homomorphic commitments
- Hardware: client-side TEE (ensures correct secret sharing without revealing message)
- Infra: server network (semi-honest majority), leader node for output reconstruction

## Protocol (concise)

1. Client positions message (transaction or query) in a random slot of a fixed-size array.
2. Client TEE secret-shares the array across servers, verifying correct construction.
3. Servers receive encrypted shares; no single server sees the original message.
4. Servers compute homomorphic sums over all client shares.
5. Leader reconstructs aggregated output from server contributions.
6. Output reveals messages but not which client sent which message.

## Guarantees

- Hides sender IP, timing correlation, and query-to-identity mapping.
- TEE compromise loses liveness (system stalls), never anonymity (crypto layer preserves it).
- Same infrastructure anonymizes both transaction submission and state queries.
- Does not hide message content — pair with content-privacy patterns for full stack.

## Trade-offs

- Anonymity trilemma: anonymity set size, latency, and bandwidth (cover traffic) are in tension. Pure-crypto approaches (Tor, Nym, DC-Nets) must sacrifice at least one. TEE-assisted designs like Flashnet relax the trilemma by offloading verification to hardware, but introduce a hardware trust assumption for liveness.
- Client TEEs required for liveness; hardware trust for availability only, not privacy.
- Requires semi-honest majority among servers; colluding majority can break liveness.
- Research-stage (Flashbots Flashnet); no production deployment yet.

## Example

1. Fund manager queries 50 token balances across DeFi protocols to value portfolio.
2. Without network anonymity, RPC provider sees all queried addresses — revealing holdings and strategy.
3. Queries are secret-shared via client TEE across anonymity server network.
4. Servers process shares; RPC provider sees aggregated queries from many clients, cannot attribute any query to the fund manager.
5. Result: Portfolio valued without leaking positions or identity to any infrastructure provider.

## See also

- [Network-Level Anonymity](pattern-network-anonymity.md) — general problem and alternative approaches (Tor, mixnets, VPNs)
- [Private Transaction Broadcasting](pattern-private-transaction-broadcasting.md) — content privacy for writes (complementary)
- [Threshold Encrypted Mempool](pattern-threshold-encrypted-mempool.md) — content privacy via threshold encryption
- [TEE-Based Privacy](pattern-tee-based-privacy.md) — broader TEE trust model analysis
- [RFP: Private Reads](../rfps/rfp-private-reads.md) — read-side privacy gap this pattern addresses
- [Vendor: Flashbots](../vendors/flashbots.md) — Flashnet development

## See also (external)

- Flashbots Flashnet: https://writings.flashbots.net/network-anonymized-mempools
