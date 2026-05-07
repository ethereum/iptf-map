---
title: "Pattern: User-controlled viewing keys"
status: draft
maturity: testnet
type: standard
layer: hybrid
last_reviewed: 2026-04-22

works-best-when:
  - End users need to control who can see their transaction history and for how long.
  - Regulatory disclosure should be user-initiated rather than institution-imposed.
  - Multiple competing service providers exist so users can exit if key custody is compromised.
avoid-when:
  - Regulation mandates always-on institutional access to all user transactions.
  - Users cannot manage their own key material and no compatible wallet tooling is available.
  - The anonymity set is so small that viewing-key control is moot.

context: i2u

crops_profile:
  cr: none
  o: partial
  p: full
  s: medium

crops_context:
  cr: "Censorship resistance is `none` because this pattern addresses coerced disclosure and surveillance on the read axis, which is orthogonal to write-axis censorship resistance. It does not prevent an institution from blocking transactions or denying service; pair with [Forced Withdrawal](pattern-forced-withdrawal.md) for CR."
  o: "Key-derivation schemes are documented and implemented in open-source libraries, but specific wallet UIs and key-management tooling may be proprietary."
  p: "Privacy is `full` because the user controls all disclosure: no party learns more than the user explicitly reveals, and scoped sub-keys prevent over-disclosure by cryptographic construction."
  s: "Security is `medium`: depends on the user's key-management practices, the underlying elliptic-curve assumptions (for example Baby Jubjub for current privacy L2s), and the soundness of the derivation scheme. Hardware-wallet integration and audited key-management tooling can raise it to `high`."

post_quantum:
  risk: high
  vector: "Current viewing-key derivations use elliptic-curve primitives (Baby Jubjub or secp256k1) broken by a CRQC. Encrypted transaction histories disclosed today face Harvest-Now-Decrypt-Later risk if the keys are retained."
  mitigation: "Migrate key-derivation and the encryption of transaction notes to post-quantum primitives (for example lattice-based key-encapsulation mechanisms). See [Post-Quantum Threats](../domains/post-quantum.md)."

standards: [EIP-5564, EIP-6538]

related_patterns:
  requires: [pattern-shielding]
  composes_with: [pattern-stealth-addresses, pattern-privacy-l2s, pattern-regulatory-disclosure-keys-proofs]
  see_also: [pattern-forced-withdrawal, pattern-network-anonymity, pattern-modular-privacy-stack]

open_source_implementations:
  - url: https://github.com/AztecProtocol/aztec-packages
    description: "Aztec Network incoming-viewing-key (IVK) implementation in the privacy L2 stack"
    language: "Noir"
  - url: https://github.com/Railgun-Privacy/contract
    description: "Railgun wallet key hierarchy (spending, viewing, nullifier keys)"
    language: "Solidity, Circom"
---

## Intent

In many privacy-preserving systems the institution operating the service holds viewing keys or equivalent decryption capabilities for all user transactions, which gives it surveillance power over users even when on-chain data is encrypted. User-controlled viewing keys invert that model: the user holds the private viewing key and selectively shares derived sub-keys with specific parties (regulators, auditors, counterparties) for scoped, time-limited access. This pattern is the institution-to-user complement to selective disclosure, which covers the workflow once a scoped key has been shared.

## Components

- Dual-key cryptography: a spending key authorises transfers and a separate viewing key grants read access. The split must be enforced at the protocol level so the institution cannot reconstruct one from the other.
- Key-derivation functions: produce scoped sub-keys per note, per account, or per time window. The derivation hierarchy determines how fine-grained disclosure can be.
- Wallet-side key management: holds the master viewing key, produces scoped sub-keys on demand, and never exposes the master key to the service operator.
- Selective-disclosure interface: an authenticated channel for delivering scoped keys to the requesting party along with the scope metadata (time range, account, transaction set).
- Optional threshold splitting or social recovery: backs up the master viewing key across user-controlled devices or custodians without granting the service operator access.

## Protocol

1. [user] Generate a spending key and a separate viewing key pair during wallet setup; the institution never receives the viewing key.
2. [contract] On-chain state associated with the user is encrypted under the user's viewing key so the service operator cannot decrypt without a key the user explicitly shared.
3. [user] When disclosure is required, derive a scoped sub-key bounded by time window, account, or transaction set.
4. [user] Deliver the scoped key to the requesting party through an authenticated channel.
5. [auditor] The requesting party decrypts the scoped data and verifies it against the on-chain commitments; access beyond the scope is cryptographically impossible.
6. [user] Rotate or revoke scoped keys as needed without affecting the master viewing key.

## Guarantees & threat model

Guarantees:

- User sovereignty: no party can read the user's transaction history without a key the user explicitly provided.
- Scope limitation: derived keys grant access only within the specified scope; over-disclosure is prevented by the derivation scheme, not by policy.
- Auditability without surveillance: regulators can audit when the user cooperates, but cannot conduct ongoing surveillance.
- Damage containment: compromise of a scoped key does not compromise the master key or other scopes.

Threat model:

- Soundness of the underlying cryptographic assumptions (elliptic-curve discrete log for current deployments).
- Correct protocol-level enforcement of the view-spend split inside the privacy-layer circuit, so a malicious operator cannot recover the viewing key from spending operations.
- User-side key-management hygiene: device compromise, poor backup, or coerced disclosure of the master key all defeat the guarantee.
- Out of scope: the pattern does not hide metadata from the service operator outside the encrypted fields, and it does not prevent service denial or censorship at the institution.

## Trade-offs

- Regulatory tension: some jurisdictions may require always-on institutional access (for example travel-rule implementations or continuous suspicious-activity monitoring). Hybrid models exist where the user holds the master key but pre-commits to granting scoped access under defined conditions.
- Key loss is terminal on the read side: if the master viewing key is lost, historical transaction data is permanently undecryptable. Encrypted backup, social recovery, or threshold splitting across user-controlled devices are the standard mitigations.
- UX burden: users must manage additional key material and make disclosure decisions; wallet UX can simplify this but the user has to understand the consequences of sharing keys.
- Granularity varies by implementation: some privacy stacks expose account-level viewing, others support per-note disclosure, and full viewing keys may reveal both incoming and outgoing flows. The choice of derivation hierarchy determines the privacy-versus-usability trade-off.
- Scope enforcement depends on the circuit design: if the derivation scheme is misspecified, a scoped key may leak data beyond its intended range.

## Example

A fund manager executes trades on a privacy L2 where balances remain encrypted to the operator. For quarterly reporting, the manager derives a Q1-scoped viewing sub-key and shares it with compliance through an authenticated channel; compliance verifies Q1 transactions against the on-chain commitments without access to earlier or later periods. When a regulator requests an audit of specific asset holdings, the manager derives an asset-scoped key that reveals positions in a single instrument across all time, again without granting access to the rest of the portfolio. Scoped keys are rotated after each engagement so a later audit cannot piggyback on an earlier disclosure.

## See also

- [EIP-5564 stealth-address standard](https://eips.ethereum.org/EIPS/eip-5564)
- [EIP-6538 stealth meta-address registry](https://eips.ethereum.org/EIPS/eip-6538)
- [Aztec](../vendors/aztec.md)
- [Railgun](../vendors/railgun.md)
