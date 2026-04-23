---
title: "Pattern: Stealth Addresses"
status: draft
maturity: production
type: standard
layer: L1
last_reviewed: 2026-04-22

works-best-when:
  - Sender and receiver want to hide the link between their public identities on a transparent chain.
  - Counterparty unlinkability matters more than amount confidentiality.
  - Wallets or directory services can publish and manage view-key material for recipients.
avoid-when:
  - Strong amount confidentiality is required; use a shielded pool or confidential token instead.
  - The deployment requires scoped regulator access by default; stealth addresses only support voluntary disclosure.

context: both
context_differentiation:
  i2i: "Between institutions, recipients can maintain directory entries that publish view keys. Disclosure to regulators happens by the recipient voluntarily sharing the private view key for a time window or a specific stealth address."
  i2u: "For end users, self-relaying from the stealth address is necessary to preserve unlinkability; otherwise the gas-paying address re-links the stealth address to a known identity. CR drops to `low` when relayers are mandatory and centralised, which is often the case before account-abstraction paymasters are routinely available."

crops_profile:
  cr: medium
  o: yes
  p: partial
  s: high

crops_context:
  cr: "Reaches `high` when the user can self-relay and pay gas from the stealth address without a shared paymaster; in practice this requires account-abstraction support for fresh addresses. Drops to `low` when a central relayer is unavoidable."
  o: "The stealth-address derivation is open and standardised; wallets implementing EIP-5564 can interoperate. Registry components may be open-source or proprietary depending on the deployment."
  p: "Counterparty linkage on-chain is hidden; amounts and token type remain visible, and network-layer metadata (IP, timing, relayer identity) is out of scope."
  s: "Rides on the hardness of the Diffie-Hellman problem used to derive shared secrets and on correct implementation of view and spend keys in wallets."

post_quantum:
  risk: high
  vector: "Elliptic-curve Diffie-Hellman underpins the shared-secret derivation and is broken by a CRQC. HNDL risk is acute: address linkages recorded now are retroactively compromised once a quantum adversary can recover view keys."
  mitigation: "Post-quantum key-encapsulation such as ML-KEM for the shared-secret step, combined with oblivious message retrieval as an off-chain scanning aid. See [Post-Quantum Threats](../domains/post-quantum.md)."

standards: [ERC-20, EIP-5564, ERC-4337]

related_patterns:
  composes_with: [pattern-shielding, pattern-erc3643-rwa, pattern-user-controlled-viewing-keys]
  see_also: [pattern-private-iso20022, pattern-network-anonymity]

open_source_implementations:
  - url: https://github.com/nerolation/eip-stealth-address-erc-5564
    description: "Reference implementation of EIP-5564 stealth-address scheme"
    language: "Solidity"
---

## Intent

Enable unlinkable transfers on a transparent chain by deriving a one-time destination address per transaction using a Diffie-Hellman shared secret between sender and receiver keys. Observers see a transfer to a fresh address; only the recipient can detect and spend the funds.

## Components

- Stealth keypair held by the recipient: a view key used to scan the chain and a spend key used to control funds.
- Ephemeral sender key generated per transaction; combined with the recipient view key to produce a shared secret.
- Derivation function that converts the shared secret into a stealth address and an optional view tag for fast scanning.
- Optional registry or directory that publishes recipient view keys so senders can discover them.
- Wallet or account-abstraction stack that can fund and operate the stealth address without re-linking it to the recipient's primary address.

## Protocol

1. [user] The recipient publishes a public view key via a directory or shares it with the sender directly.
2. [user] The sender generates an ephemeral key and computes the Diffie-Hellman shared secret with the recipient view key.
3. [user] The sender derives the one-time stealth address from the shared secret and transfers tokens to it.
4. [user] The recipient scans new transactions using the private view key and detects transfers destined to their stealth addresses.
5. [user] The recipient uses the spend key to authorise spending from the stealth address when needed.
6. [auditor] The recipient can optionally share the private view key with an auditor for a specific scope or time window.

## Guarantees & threat model

Guarantees:

- On-chain observers do not see a direct link between sender and recipient identities.
- The recipient can scan and spend without the sender needing further interaction.
- Retrospective disclosure is possible by voluntarily sharing the view key with a specific auditor.

Threat model:

- The hardness of elliptic-curve Diffie-Hellman; key compromise reveals all past and future stealth addresses derived from the same view key.
- Wallet implementation correctness in handling view and spend keys and in funding the stealth address without re-linking it.
- Metadata at the network layer (RPC provider logs, relayer identity, IP addresses) and repeated address reuse by the recipient are out of scope.
- Amount and token type are visible on-chain by design.

## Trade-offs

- Amount leakage: transfer values remain visible and can expose competitive information.
- Scanning cost: recipients must scan all transactions, or use view tags and prefiltering to reduce load.
- Funding the stealth address to cover gas can re-link the stealth address to a known source unless account abstraction or dedicated gas-payer flows are in place.
- Interoperability depends on EIP-5564 adoption across wallets and on registry availability.
- Regulator workflows require voluntary view-key sharing; there is no scoped access path by default.

## Example

An institution owes a counterparty tokenised stablecoin. The recipient publishes a public view key in its directory entry. The sender derives a stealth address using the shared secret and transfers the stablecoin to that address. On-chain, the transfer looks like a payment to a fresh address. The recipient's wallet detects the funds via the private view key, then moves them to a custodian wallet. For audit, the recipient can later disclose the view key to a regulator for the relevant window.

## See also

- [EIP-5564 specification](https://eips.ethereum.org/EIPS/eip-5564)
- [Vitalik on stealth addresses](https://vitalik.eth.limo/general/2023/01/20/stealth.html)
- [Curvy](../vendors/curvy.md)
