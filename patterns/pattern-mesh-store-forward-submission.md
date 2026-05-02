---
title: "Pattern: Mesh Store-and-Forward Submission"
status: draft
maturity: production
layer: offchain
last_reviewed: 2026-04-27

works-best-when:
  - Senders lack persistent internet connectivity
  - Adversary observes physical interaction points or radio spectrum
  - End-to-end (sender-to-relay) confidentiality is required
avoid-when:
  - Online IP transport is available and the threat model only requires IP-layer anonymity (use Tor or Nym)
  - Real-time delivery is required
  - Source-fingerprinting is not part of the threat model

context: i2u

crops_profile:
  cr: high
  o: yes
  p: partial
  s: medium

crops_context:
  cr: "Routes around internet shutdowns and IP-layer blocking by design. Reach is bounded by physical network density."
  o: "Briar, Meshtastic, Bridgefy ship as open source. AEAD primitives are open standards."
  p: "End-to-end ciphertext between sender and relay; intermediate peers see only routing metadata. RF fingerprinting is a residual against signals-intelligence adversaries."
  s: "Strong against passive observers; degrades against well-resourced RF-fingerprinting and against companion-device compromise."

post_quantum:
  risk: high
  vector: "X25519 key exchange broken by CRQC; HNDL exposure on retained ciphertext"
  mitigation: "ML-KEM (Kyber) or hybrid X25519 plus ML-KEM"

standards: [RFC 8439, RFC 7748, NIST SP 800-38D]

related_patterns:
  composes_with: [pattern-network-anonymity, pattern-relay-mediated-proving]
  see_also: [pattern-onion-routing, pattern-mixnet-anonymity]

open_source_implementations:
  - url: https://briarproject.org/
    description: "Briar: peer-to-peer messenger over Bluetooth LE, Wi-Fi LAN, and Tor"
    language: Java/Kotlin
  - url: https://meshtastic.org/
    description: "Meshtastic: LoRa mesh messaging firmware"
    language: C++
  - url: https://bridgefy.me/
    description: "Bridgefy: commercial Bluetooth mesh SDK"
    language: Swift/Kotlin
---

## Intent

Carry encrypted application payloads from an offline or intermittently-connected sender to an online relay over a delay-tolerant mesh network, with end-to-end confidentiality (intermediate peers see only ciphertext) and source-fingerprinting resistance at the radio and network layers.

The pattern is the recipient-side dual of `pattern-network-anonymity.md`. The umbrella pattern covers IP-layer transport (Tor, Nym, TEE-assisted); mesh store-and-forward covers the case where the sender has no persistent IP transport at all.

## Components

- **Mesh transport**: Bluetooth LE for short-range device-to-device, LoRa for kilometer-range, Wi-Fi Direct or local AP for higher-bandwidth corridors. Peer-to-peer or multi-hop store-and-forward.
- **End-to-end encryption**: IND-CCA2 authenticated encryption with ephemeral sender keying. X25519 plus ChaCha20-Poly1305 or AES-256-GCM are conventional.
- **Relay decryption keypair**: rotated by the relay at least every 24 hours; retired private keys securely erased.
- **Source-fingerprinting mitigations**: at least two orthogonal mechanisms. Physical-layer options: randomized Bluetooth LE MACs, rotated LoRa node identifiers. Network-layer: onion-routed propagation (Sphinx-style), Poisson-distributed cover traffic.
- **Out-of-band relay-key distribution**: relay identity public keys pre-loaded onto sender devices through trusted channels (printed cards, signed bundle, in-person handoff).

## Protocol

1. [sender] Receive, out-of-band, the relay set's identity keys, current ephemeral decryption keys, and rotation schedule.
2. [sender] Encrypt the payload to the relay's current ephemeral public key under IND-CCA2 AEAD with ephemeral sender keying.
3. [sender] Inject ciphertext into the mesh transport.
4. [peers] Store-and-forward toward the relay set; intermediate peers see ciphertext only. Onion routing across hops, when present, hides per-hop next-peer identity.
5. [peers] Emit Poisson-scheduled cover traffic so a real submission is not distinguishable from idle behavior.
6. [exit-peer] A peer with online connectivity forwards the ciphertext to the relay's online endpoint.
7. [relay] Decrypt, process, optionally return an acknowledgement through the same transport.
8. [relay] Rotate the ephemeral decryption keypair at the published cadence; securely erase retired keys.

## Guarantees & threat model

- **End-to-end confidentiality**: intermediate peers cannot recover the cleartext payload.
- **Source unlinkability across encounters**: physical-layer rotation plus network-layer cover traffic together prevent an adversary observing one mesh encounter from linking it to the same sender's prior or subsequent activity. Single-mitigation deployments do not satisfy this.
- **Tolerance to high latency**: delivery is eventual, bounded only by mesh path connectivity.
- **Threat model**: adversary observes radio spectrum and IP traffic, may control some peers, and may compromise individual companion devices. Out of scope: SIGINT-level RF fingerprinting that distinguishes individual transmitters by hardware characteristics.

## Trade-offs

- Latency. Delivery adds seconds to days, depending on path connectivity and cover-traffic schedule. Applications must tolerate this.
- Companion-device hygiene. A shared or compromised companion sees plaintext for the senders it serves. Treat companions as compromisable; rotate when practical.
- Relay-set diversity required. Senders SHOULD fan out across multiple relays with size and jurisdictional-diversity floors as deployment requirements.
- No real-time error feedback. A failed delivery may be invisible for hours. Acknowledgement tokens propagated back through the same transport cover the happy path only.
- Cover-traffic budget. Poisson cover increases sender energy cost and mesh bandwidth use; deployment tunes the rate against the threat model.

## Example

Reporters and human-rights observers in a region with periodic internet shutdowns submit encrypted reports to a journalism organization's relay using Briar over Bluetooth LE. Phones in physical proximity sync ciphertext peer-to-peer; messages traverse multiple hops until reaching a phone with online connectivity, which forwards the ciphertext to the relay over Tor. Bluetooth LE MAC randomization combined with Poisson cover-traffic intervals prevents an adversary scanning the local Bluetooth spectrum from correlating which reporter submitted what at which time.

## See also

- [Briar Project](https://briarproject.org/): peer-to-peer messenger over Bluetooth LE, Wi-Fi LAN, and Tor.
- [Meshtastic](https://meshtastic.org/): LoRa mesh messaging firmware.
- [Bridgefy](https://bridgefy.me/): commercial Bluetooth mesh SDK.
- [Sphinx mix format (Danezis & Goldberg, IEEE S&P 2009)](https://cypherpunks.ca/~iang/pubs/Sphinx_Oakland09.pdf).
- [RFC 8439: ChaCha20 and Poly1305 for IETF Protocols](https://www.rfc-editor.org/rfc/rfc8439).
