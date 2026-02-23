---
title: "Pattern: Network-Level Anonymity"
status: draft
maturity: PoC
layer: offchain
privacy_goal: Hide sender identity (IP, timing, query patterns) at the transport layer
assumptions: Network observer is a threat; content-layer privacy is handled separately
last_reviewed: 2026-02-20
works-best-when:
  - Metadata leakage (IP, timing, query patterns) is a threat model concern
  - Content privacy alone is insufficient — "who" matters as much as "what"
  - Both read privacy (RPC queries) and write privacy (transaction submission) are needed
avoid-when:
  - Threat model does not include network-level observers
  - Institution runs its own full node (eliminates RPC provider trust)
  - On-chain content privacy is the only requirement
dependencies: []
---

## Intent

Hide *who* is sending transactions or querying state at the network layer. Content-privacy patterns (ZK, FHE, MPC) hide *what* is in a transaction but not *who* submitted it — IP addresses, timing, and query patterns still leak sender identity. Network-level anonymity complements content privacy to close the metadata gap.

This is an umbrella pattern. Multiple approaches exist, each with different trade-offs along the **anonymity trilemma**: anonymity set size, latency, and bandwidth overhead. No single approach dominates; the right choice depends on the institution's latency tolerance, threat model, and infrastructure constraints.

## Ingredients

- Cryptographic: onion encryption, mix-and-shuffle, secret sharing, cover traffic
- Hardware: client-side TEE (for TEE-assisted approach only)
- Infra: relay/mix network or anonymity server cluster, private RPC endpoint

## Protocol (concise)

1. Client prepares transaction or RPC query for submission.
2. Client routes message through chosen anonymity layer (relay network, mixnet, TEE cluster, or proxy).
3. Anonymity layer strips or obscures sender metadata (IP, timing, query pattern).
4. Message reaches destination (RPC node, mempool) without attribution to sender.
5. Response returns through the same or separate anonymous channel.

## Anonymity Trilemma

Any network anonymity system must trade off between three properties:

- **Anonymity set size** — how many users your traffic blends with
- **Latency** — delay introduced by the anonymity mechanism
- **Bandwidth overhead** — cover traffic or padding required

Pure-cryptographic approaches (Tor, mixnets, DC-Nets) must sacrifice at least one. Hardware-assisted approaches (TEE) relax the trilemma by offloading verification to hardware but introduce a hardware trust assumption.

## Approaches

### 1. Onion routing (Tor)

Route traffic through multiple relay nodes; each relay peels one encryption layer. No single relay sees both sender and destination.

| Property | Value |
|----------|-------|
| Anonymity set | Large (global Tor network) |
| Latency | High (3+ hops, ~200-500ms added) |
| Trust model | No single relay sees full path; vulnerable to global passive adversary |
| Maturity | Production (general-purpose); limited blockchain-specific deployment |

**Trade-offs:** High latency makes it unsuitable for latency-sensitive DeFi. Exit nodes can observe unencrypted traffic. Well-resourced adversaries can perform traffic correlation attacks.

### 2. Mixnets (Nym, Loopix)

Messages are batched, delayed, reordered, and padded with cover traffic before forwarding. Provides stronger anonymity than onion routing against global adversaries.

| Property | Value |
|----------|-------|
| Anonymity set | Medium-large (depends on cover traffic volume) |
| Latency | Very high (seconds to minutes, by design) |
| Trust model | Threshold trust across mix nodes; cover traffic defeats timing analysis |
| Maturity | Pilot (Nym network live but limited blockchain integration) |

**Trade-offs:** Highest anonymity guarantees but latency is prohibitive for real-time use cases. Cover traffic adds bandwidth cost.

### 3. Private RPC / trusted proxy

Route queries through a trusted intermediary that strips identifying metadata before forwarding to the RPC provider.

| Property | Value |
|----------|-------|
| Anonymity set | Small (trust boundary is the proxy operator) |
| Latency | Low (single hop) |
| Trust model | Full trust in proxy operator not to log or leak |
| Maturity | Production (multiple vendors offer private RPC endpoints) |

**Trade-offs:** Simplest to deploy but weakest anonymity — shifts trust from RPC provider to proxy. Acceptable when the proxy is the institution itself or a contractually bound party.

### 4. TEE-assisted anonymity (Flashnet)

Client-side TEE secret-shares messages across a server network; homomorphic aggregation reveals messages but not which client sent which. See [TEE-Assisted Network Anonymity](pattern-tee-network-anonymity.md) for full protocol.

| Property | Value |
|----------|-------|
| Anonymity set | Medium (all clients in the epoch) |
| Latency | Low (suitable for DeFi) |
| Trust model | Client TEE for liveness; semi-honest server majority; crypto preserves anonymity even if TEE is compromised |
| Maturity | PoC (Flashbots Flashnet, research stage) |

**Trade-offs:** Relaxes the anonymity trilemma via hardware but introduces client-side TEE dependency. TEE compromise loses liveness, not anonymity.

### 5. VPN / encrypted tunnel

Route all blockchain traffic through a VPN. Hides IP from the RPC provider but the VPN operator sees everything.

| Property | Value |
|----------|-------|
| Anonymity set | None (VPN operator sees all traffic) |
| Latency | Low |
| Trust model | Full trust in VPN provider |
| Maturity | Production |

**Trade-offs:** Hides IP from destination but does not provide anonymity — merely shifts the observer from RPC provider to VPN provider. Insufficient as a standalone solution but may be part of defense in depth.

## Comparison Matrix

| Approach | Latency | Anonymity strength | Trust assumption | Read + Write | Maturity |
|----------|---------|-------------------|------------------|--------------|----------|
| Tor | High | Strong | No single relay | Both | Prod |
| Mixnet | Very high | Strongest | Threshold mix nodes | Both | Pilot |
| Private RPC | Low | Weak | Proxy operator | Reads mainly | Prod |
| TEE-assisted | Low | Medium | Client TEE + server majority | Both | PoC |
| VPN | Low | Minimal | VPN provider | Both | Prod |

## Guarantees

- Hides sender IP, timing correlation, and query-to-identity mapping (strength varies by approach).
- Complements content-privacy patterns — together they hide both *what* and *who*.
- Does not hide message content; pair with ZK, FHE, or MPC patterns for full-stack privacy.

## Trade-offs

- No approach simultaneously achieves strong anonymity, low latency, and low bandwidth (anonymity trilemma).
- Stronger anonymity generally means higher latency — institutional latency requirements constrain the choice.
- All approaches except mixnets are vulnerable to a sufficiently powerful global passive adversary.
- Operational complexity varies significantly: VPN is trivial; mixnet integration is non-trivial.

## Example

1. Fund manager needs to query 50 token balances to value a portfolio.
2. Without network anonymity, the RPC provider sees all queried addresses — revealing holdings and strategy.
3. **Tor**: queries routed through 3 relays; RPC provider cannot trace back to the fund. Added latency (~300ms/query) acceptable for end-of-day valuation.
4. **TEE-assisted**: queries secret-shared across anonymity servers; RPC provider sees aggregated queries from many clients. Low latency suitable for intraday checks.
5. **Private RPC**: queries proxied through institution's own relay; RPC provider sees relay IP only. Simplest but trusts the relay operator.

## See also

- [TEE-Assisted Network Anonymity](pattern-tee-network-anonymity.md) — TEE+secret-sharing approach (Flashnet)
- [Private Transaction Broadcasting](pattern-private-transaction-broadcasting.md) — content privacy for writes (complementary)
- [Threshold Encrypted Mempool](pattern-threshold-encrypted-mempool.md) — content privacy via threshold encryption
- [RFP: Private Reads](../rfps/rfp-private-reads.md) — read-side privacy gap
- [Modular Privacy Stack](pattern-modular-privacy-stack.md) — where network anonymity fits in the four-layer architecture
