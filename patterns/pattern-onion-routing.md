---
title: "Pattern: Onion Routing"
status: draft
maturity: PoC
layer: offchain
privacy_goal: Hide sender IP by routing traffic through multiple relay nodes, each peeling one encryption layer
assumptions: No single relay sees both sender and destination; vulnerable to global passive adversary
last_reviewed: 2026-04-14
works-best-when:
  - Metadata leakage (IP, timing) is a threat model concern
  - Higher latency is acceptable (batch queries, end-of-day valuations)
  - A large external anonymity set is desirable (Tor's global relay network)
avoid-when:
  - Sub-second latency is required (DeFi trading, real-time pricing)
  - The threat model includes a global passive adversary with traffic correlation capability
  - Users cannot run additional software or route through external networks
dependencies: []
context: both
crops_profile:
  cr: medium
  os: yes
  privacy: partial
  security: medium
---

## Intent

Hide *who* is sending transactions or querying state by routing traffic through a chain of relay nodes. Each relay peels one layer of encryption, so no single relay sees both the sender's IP and the destination. Onion routing closes the metadata gap left by content-privacy patterns (ZK, FHE, MPC), which hide *what* is in a transaction but not *who* submitted it.

## Ingredients

- Cryptographic: layered (onion) encryption, circuit establishment
- Infra: relay network (Tor), SOCKS5 proxy or WASM-embedded client
- Standards: Tor protocol specification, Arti (Rust implementation)

## Protocol (concise)

1. Client selects a circuit of 3+ relay nodes from the Tor directory.
2. Client wraps the message (RPC query or transaction) in multiple encryption layers, one per relay.
3. Each relay decrypts its layer, learns the next hop, and forwards the message.
4. Exit relay delivers the message to the destination (RPC node, mempool).
5. Response returns through the same circuit in reverse.

## Guarantees

- Hides sender IP from the destination (RPC provider, block builder).
- No single relay sees both sender identity and message content.
- Draws from a large, external anonymity set (global Tor network) that neither the institution nor RPC provider controls.
- Does not hide message content; pair with content-privacy patterns for full-stack privacy.
- **I2U**: prevents the institution (when it operates the RPC endpoint) from correlating user IPs with on-chain activity. The anonymity set is external to the institution, so the institution cannot shrink it.
- **I2I**: institutions querying counterparty state or submitting settlement transactions can hide their IP from the counterparty's infrastructure.

## Trade-offs

- High latency (3+ hops, ~200-500ms added per request) makes it unsuitable for latency-sensitive DeFi.
- Exit relays can observe unencrypted traffic; HTTPS to the RPC endpoint mitigates this.
- Vulnerable to traffic correlation attacks by a well-resourced adversary who can observe both ends of the circuit.
- No native Tor support in any Ethereum execution client (Geth, Erigon, Reth) as of 2026, unlike Bitcoin Core which has had built-in Tor since 2016. Integration requires external tooling.
- CROPS: CR is `medium` overall: when paired with direct P2P or decentralized RPC access, censorship resistance is strong (no single entity gates requests). When routed through a centralized RPC provider, CR drops because the provider can block Tor exit node IPs. OS is `yes` (Tor and Arti are open-source). Privacy is `partial` because on-chain side channels (transaction timing, gas patterns) persist even when IP is hidden. Security is `medium` due to vulnerability to global passive adversaries performing traffic correlation.

## Example

1. Fund manager needs to query 50 token balances to value a portfolio at end of day.
2. Without network anonymity, the RPC provider sees all queried addresses, revealing holdings and strategy.
3. Fund manager routes queries through Tor: each query traverses 3 relays before reaching the RPC endpoint.
4. RPC provider sees requests arriving from a Tor exit relay, not the fund manager's IP.
5. Added latency (~300ms per query) is acceptable for end-of-day valuation.

## See also

- [Network-Level Anonymity](pattern-network-anonymity.md) - umbrella pattern and approach comparison
- [Mixnet Anonymity](pattern-mixnet-anonymity.md) - stronger anonymity guarantees but higher latency
- [TEE-Assisted Network Anonymity](pattern-tee-network-anonymity.md) - low-latency alternative using hardware trust
- [Modular Privacy Stack](pattern-modular-privacy-stack.md) - where network anonymity fits in the four-layer architecture

## See also (external)

- PSE tor-js: https://pse.dev/projects/tor-js (Tor-in-WASM for Ethereum dApps, EF team)
- Flashbots Protect .onion endpoint: https://docs.flashbots.net/flashbots-protect/quick-start
- Arti (Tor Project Rust implementation): https://gitlab.torproject.org/tpo/core/arti
