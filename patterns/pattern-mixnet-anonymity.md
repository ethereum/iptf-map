---
title: "Pattern: Mixnet Anonymity"
status: draft
maturity: PoC
layer: offchain
privacy_goal: Hide sender identity by batching, delaying, reordering, and padding messages with cover traffic
assumptions: Threshold trust across mix nodes; cover traffic defeats timing analysis
last_reviewed: 2026-04-14
works-best-when:
  - The threat model includes a global passive adversary capable of traffic correlation
  - Strongest possible anonymity guarantees are required
  - Higher latency (seconds to minutes) is acceptable
avoid-when:
  - Low latency is critical (real-time DeFi, intraday trading)
  - Bandwidth overhead from cover traffic is prohibitive
  - Simpler approaches (onion routing, TEE-assisted) meet the threat model
dependencies: []
context: both
crops_profile:
  cr: medium
  os: partial
  privacy: partial
  security: medium
---

## Intent

Hide *who* is sending transactions or querying state by routing messages through a network of mix nodes that batch, delay, reorder, and pad traffic with cover messages. Mixnets provide stronger anonymity than onion routing against global passive adversaries because timing correlation is defeated by design. This comes at the cost of higher latency and bandwidth overhead.

## Ingredients

- Cryptographic: Sphinx packet format, cover traffic generation, mix-and-shuffle
- Infra: mix node network (Nym, HOPR), SOCKS5 proxy or SDK integration
- Standards: Loopix architecture, Sphinx packet specification

## Protocol (concise)

1. Client wraps the message (RPC query or transaction) in a Sphinx packet with layered encryption.
2. Client sends the packet to the entry mix node in a randomly selected route.
3. Each mix node collects incoming packets, adds random delay, reorders the batch, and strips one encryption layer before forwarding.
4. Cover traffic (dummy packets) is injected at each hop to maintain constant traffic volume.
5. Final mix node delivers the message to the destination (RPC node, mempool).
6. Response returns through a separate mixnet route.

## Guarantees

- Under sufficient cover-traffic volume and wide adoption, mixnets substantially raise the cost of timing correlation and can resist global passive adversaries, threats that onion routing is vulnerable to. Guarantees degrade as cover traffic and anonymity-set size shrink.
- Anonymity set includes all clients active during the mixing window.
- Does not hide message content; pair with content-privacy patterns for full-stack privacy.
- **I2U**: the anonymity set is external to the institution. Even if the institution operates the RPC endpoint, it cannot correlate incoming queries with specific users because the mixnet destroys timing and ordering information.
- **I2I**: institutions can hide query patterns and transaction timing from counterparty infrastructure and from network-level observers.

## Trade-offs

- Very high latency (seconds to minutes by design) makes mixnets unsuitable for real-time use cases.
- Cover traffic adds bandwidth cost proportional to the desired anonymity level.
- Anonymity set size depends on actual usage volume; low adoption creates a chicken-and-egg problem.
- No production Ethereum-specific deployment as of 2026. Nym mainnet is live as a general-purpose mixnet; blockchain integrations are in development.
- HOPR's RPCh (private RPC via mixnet) had a working prototype but [development is paused](https://github.com/Rpc-h/RPCh) as of 2026 (team redirected to [Gnosis VPN](https://gnosisvpn.com/)).
- CROPS: CR is `medium` because mix node participation requires staking. OS is `partial` (Nym and HOPR are open-source but the live networks have governance constraints). Privacy is `partial` because on-chain side channels persist. Security is `medium` because resistance to correlation depends on sustained cover traffic volume, adoption, and correct network operation.

## Example

1. Compliance team at a custodian needs to query transaction histories for regulatory reporting without revealing which accounts they monitor.
2. Queries are routed through a 5-hop mixnet: each hop batches, delays, and reorders traffic.
3. Cover traffic ensures the RPC provider sees constant query volume regardless of actual activity.
4. RPC provider cannot determine when the custodian queried, which queries came from the same source, or how many real queries were made.
5. Latency (several seconds per query) is acceptable for batch compliance reporting.

## See also

- [Network-Level Anonymity](pattern-network-anonymity.md) - umbrella pattern and approach comparison
- [Onion Routing](pattern-onion-routing.md) - lower latency but weaker against global adversaries
- [TEE-Assisted Network Anonymity](pattern-tee-network-anonymity.md) - low-latency alternative using hardware trust
- [Private Transaction Broadcasting](pattern-private-transaction-broadcasting.md) - complementary content-privacy pattern for mempool-level protection
- [Threshold Encrypted Mempool](pattern-threshold-encrypted-mempool.md) - complementary content-privacy pattern for pre-inclusion encryption
- [Modular Privacy Stack](pattern-modular-privacy-stack.md) - where network anonymity fits in the four-layer architecture

## See also (external)

- Nym Network: https://nym.com/network
- Nym + Aztec partnership: https://nym.com/blog/nym-partners-with-aztec-to-provide-integral-infrastructure-privacy-in-ethereum-chains
- NymVPN dApp mode (wallet RPC routing): https://nym.com/blog/nymvpn-dapp-mode
- HOPR protocol: https://hoprnet.org/
