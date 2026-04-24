---
title: "Pattern: Onion Routing"
status: draft
maturity: testnet
type: standard
layer: offchain
last_reviewed: 2026-04-22

works-best-when:
  - Metadata leakage (IP, timing) is a threat model concern.
  - Higher latency is acceptable (batch queries, end-of-day valuations, non-real-time flows).
  - A large external anonymity set is desirable.
avoid-when:
  - Sub-second latency is required (DeFi trading, real-time pricing).
  - The threat model includes a global passive adversary capable of traffic correlation.
  - Users cannot run additional software or route through external networks.

context: both
context_differentiation:
  i2i: "Institutions querying counterparty state or submitting settlement transactions can hide their IP from counterparty infrastructure. Both sides typically run their own relays or nodes, and the external anonymity set is not under either party's control."
  i2u: "When the institution operates the RPC endpoint or sequencer, onion routing prevents it from correlating user IPs with on-chain activity. The anonymity set is external, so the institution cannot shrink it. Does not address censorship at the RPC or sequencer layer; see forced-withdrawal."

crops_profile:
  cr: medium
  o: yes
  p: partial
  s: medium

crops_context:
  cr: "Medium overall. Reaches `high` when paired with direct P2P or decentralised RPC access because no single entity gates requests. Drops to `low` when routed through a centralised RPC provider that can block exit-node IPs."
  o: "Both the Tor protocol and Rust reimplementations are open-source. Clients and relays are forkable."
  p: "Hides sender IP and which RPC endpoint was queried. On-chain side channels (transaction timing, gas patterns, address reuse) persist even when IP is hidden."
  s: "Vulnerable to a global passive adversary performing end-to-end traffic correlation. Strong against single relay observers and local network adversaries."

post_quantum:
  risk: medium
  vector: "Circuit establishment uses ECDH-based key exchange that a CRQC can break. HNDL risk exists for recorded circuit handshakes, allowing retrospective deanonymisation."
  mitigation: "Tor is adopting hybrid post-quantum key exchange; deployments should track and enable it as it becomes available."

standards: []

related_patterns:
  alternative_to: [pattern-mixnet-anonymity, pattern-tee-network-anonymity]
  composes_with: [pattern-private-transaction-broadcasting, pattern-threshold-encrypted-mempool]
  see_also: [pattern-network-anonymity, pattern-modular-privacy-stack]

open_source_implementations:
  - url: https://gitlab.torproject.org/tpo/core/arti
    description: "Rust reimplementation of the Tor protocol"
    language: "Rust"
  - url: https://pse.dev/projects/tor-js
    description: "Tor-in-WASM library for browser-side onion routing from dApps (EF PSE)"
    language: "TypeScript, WASM"
  - url: https://docs.flashbots.net/flashbots-protect/quick-start
    description: "Public .onion endpoint for private transaction submission"
    language: "Service"
---

## Intent

Hide who is sending transactions or querying state by routing traffic through a chain of relay nodes. Each relay peels one layer of encryption, so no single relay sees both the sender's IP and the destination. Onion routing closes the metadata gap left by content-privacy patterns, which hide what is in a transaction but not who submitted it.

## Components

- Circuit of relays: three or more nodes selected from a relay directory, each holding one encryption layer.
- Layered (onion) encryption: the client wraps the message once per relay; each hop decrypts its own layer, starting with the entry hop.
- Client routing library: negotiates the circuit, applies the encryption layers, and exposes a local proxy (SOCKS5 or WASM) to the dApp or wallet.
- Exit relay: decrypts the last layer and forwards the message to the destination (RPC node, mempool, .onion service).

## Protocol

1. [user] Select a circuit of three or more relay nodes from the relay directory.
2. [user] Wrap the message (RPC query or signed transaction) in one encryption layer per relay.
3. [relayer] Each relay decrypts its layer, learns the next hop, and forwards the message. No relay sees both the sender and the destination.
4. [relayer] The exit relay decrypts the final layer and delivers the message to the destination.
5. [user] The response returns through the same circuit in reverse.

## Guarantees & threat model

Guarantees:

- Hides the sender's IP from the destination (RPC provider, block builder, mempool peer).
- No single relay sees both sender identity and message content.
- Draws from a large external anonymity set that neither the institution nor the RPC provider controls.

Threat model:

- A global passive adversary able to observe both ends of a circuit can correlate traffic and deanonymise sessions.
- Exit relays see the final unencrypted payload unless transport-layer encryption (HTTPS, .onion service) is used.
- RPC providers that block exit-node IPs degrade the guarantee; pair with decentralised or P2P RPC access.
- Does not hide message content. Pair with content-privacy patterns for full-stack privacy.
- No Ethereum execution client natively supports onion routing as of 2026-04, unlike Bitcoin Core. Integration requires external tooling.

## Trade-offs

- High latency: three or more hops add ~100-500 ms per request, making it unsuitable for latency-sensitive DeFi.
- Exit-relay visibility: plaintext traffic is observable at the exit. HTTPS to the RPC endpoint or .onion services mitigate this.
- Operational complexity: running a reliable circuit requires relay discovery, retry logic, and health checks.
- On-chain side channels (timing, gas patterns, address reuse) persist and must be addressed separately.

## Example

- A fund manager needs to query 50 token balances to value a portfolio at end of day.
- Without network anonymity, the RPC provider sees all queried addresses, revealing holdings and strategy.
- With onion routing, each query traverses three relays before reaching the RPC endpoint.
- The RPC provider sees requests arriving from an exit relay, not the fund manager's IP.
- The added latency (~300 ms per query) is acceptable for end-of-day valuation.

## See also

- [Tor Project Arti](https://gitlab.torproject.org/tpo/core/arti)
- [Tor specification](https://spec.torproject.org/)
