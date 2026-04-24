---
title: "Pattern: TEE-Assisted Network Anonymity"
status: draft
maturity: research
type: standard
layer: offchain
last_reviewed: 2026-04-22

works-best-when:
  - Metadata leakage (IP, timing, query patterns) is a threat.
  - Low latency is required so higher-latency anonymity networks are not viable.
  - Both read and write privacy must come from the same infrastructure.
avoid-when:
  - The threat model does not include network-level observers.
  - Running a local full node already removes RPC-provider exposure.
  - Higher-latency anonymity networks such as onion routing or mixnets are acceptable.

context: both
context_differentiation:
  i2i: "Institutions often run dedicated nodes or relays, so metadata exposure is between institutions rather than from user to institution. The TEE-assisted layer hides query patterns and transaction timing from counterparty infrastructure at latencies compatible with trading desks."
  i2u: "End users typically route through institution-operated RPC endpoints that can correlate queries and transactions. The client-side TEE lets users split their payload so no single server sees the cleartext, giving institutional-grade metadata protection without the high latency of mixnets."

crops_profile:
  cr: medium
  o: partial
  p: partial
  s: medium

crops_context:
  cr: "Censorship resistance reaches `medium` because submission does not depend on any one server, but the server set is still permissioned and can be pressured by jurisdiction."
  o: "Core designs are published in research papers and prototypes are open, yet production-grade deployments and the server operator set may be governed by a single vendor."
  p: "Sender anonymity is `partial`: the cryptographic layer preserves unlinkability even if the TEE is compromised, but metadata protection depends on a semi-honest server majority and a sufficient anonymity set during the round."
  s: "Security rides on TEE attestation integrity, correct secret-sharing implementation, and an honest majority among anonymity servers. Side-channel attacks on the client TEE can degrade guarantees."

post_quantum:
  risk: medium
  vector: "Additive homomorphic commitments and key exchange between client and servers rely on elliptic-curve primitives broken by a CRQC; Harvest-Now-Decrypt-Later risk applies to anyone recording the traffic."
  mitigation: "Migrate the key-encapsulation and commitment layers to post-quantum primitives (ML-KEM for key exchange, lattice-based commitments). See [Post-Quantum Threats](../domains/post-quantum.md)."

standards: []

related_patterns:
  composes_with: [pattern-private-transaction-broadcasting, pattern-threshold-encrypted-mempool, pattern-shielding]
  alternative_to: [pattern-onion-routing, pattern-mixnet-anonymity]
  see_also: [pattern-network-anonymity, pattern-tee-based-privacy, pattern-modular-privacy-stack]

open_source_implementations:
  - url: https://writings.flashbots.net/network-anonymized-mempools
    description: "Flashnet writeup of a TEE-assisted anonymous mempool design (research)"
    language: "N/A (design spec)"
---

## Intent

Hide who is sending transactions or querying state at the network layer with latency low enough for interactive workloads. Content-privacy patterns hide what is in a transaction but not who submitted it; IP addresses, timing, and query patterns still leak sender identity. A client-side Trusted Execution Environment secret-shares the outbound payload across a set of servers so that no single server sees the cleartext, and the anonymity guarantee survives a compromise of the TEE at the cost of liveness.

## Components

- Client-side Trusted Execution Environment: generates and verifies the secret-sharing of the outbound message, and attests to correct construction.
- Secret-sharing layer: splits each message into shares that can only be reconstructed by the aggregate of server contributions.
- Additive homomorphic commitments: allow servers to compute aggregate outputs over encrypted shares without decrypting any individual share.
- Anonymity server set: a semi-honest majority that processes shares, computes homomorphic sums, and forwards aggregated traffic.
- Leader node: reconstructs aggregated output from server contributions and delivers it to the destination (RPC endpoint or mempool).

## Protocol

1. [user] Place the outbound message, a transaction or an RPC query, into a random slot of a fixed-size array.
2. [user] The client-side Trusted Execution Environment secret-shares the array across the anonymity servers and attests that the shares were built correctly.
3. [operator] Each server receives one share and, because no single server sees the full array, cannot recover the message on its own.
4. [operator] Servers compute additive homomorphic sums over the incoming shares from all clients in the round.
5. [operator] The leader reconstructs the aggregated output by combining the server contributions.
6. [operator] The aggregated output is delivered to the destination; the real messages appear without any binding to the clients that submitted them.

## Guarantees & threat model

Guarantees:

- Sender IP, timing correlation, and query-to-identity mapping are hidden from any single server and from downstream RPC or mempool infrastructure.
- The same infrastructure anonymizes transaction submission and state queries, so read-side and write-side metadata protection share a single deployment.
- A client Trusted Execution Environment compromise costs liveness, not anonymity: the cryptographic layer still prevents reconstruction of individual messages.

Threat model:

- Semi-honest majority among anonymity servers; a colluding majority can halt the round but still cannot reconstruct individual messages unless the TEE has also been compromised.
- Client Trusted Execution Environment integrity for liveness and for correct share construction. A compromised TEE can submit malformed shares that stall the round.
- Network-layer cover: the anonymity set is all clients active in the same round. In a low-adoption deployment, the effective guarantee degrades.
- Message content is out of scope; pair with a content-privacy pattern such as shielding or threshold encryption for a full stack.

## Trade-offs

- The anonymity trilemma of anonymity-set size, latency, and bandwidth still applies. Hardware assistance relaxes it compared to pure-cryptographic designs but does not eliminate it.
- Client Trusted Execution Environments are required on the submission path, which constrains device support and adds attestation infrastructure.
- Live deployments are research-stage; there is no production service targeting Ethereum as of 2026-04, and server-operator governance is still being defined.
- Defence in depth can pair this layer with onion routing or a mixnet when the hardware trust assumption is considered weaker than the cryptographic layer.

## Example

A fund manager needs to query balances for fifty tokens across decentralized-finance protocols to value a portfolio. Without network anonymity, the RPC provider sees all queried addresses and can infer holdings and strategy. Each query is placed into a random slot of a fixed-size array, secret-shared by the manager's client Trusted Execution Environment across the server set, and aggregated homomorphically. The RPC provider sees a batch of queries from many clients in the round and cannot attribute any single query to the manager. Latency is under a second per round, so the workflow remains interactive.

## See also

- [Flashbots Flashnet writeup](https://writings.flashbots.net/network-anonymized-mempools)
- [Flashbots](../vendors/flashbots.md)
- [RFP: Private Reads](../rfps/rfp-private-reads.md)
