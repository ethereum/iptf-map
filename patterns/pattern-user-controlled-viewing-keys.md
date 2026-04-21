---
title: "Pattern: User-Controlled Viewing Keys"
status: draft
maturity: PoC
layer: hybrid
privacy_goal: Ensure end users retain sole custody of viewing keys, disclosing transaction history to parties they choose
assumptions: Dual-key architecture (spend + view), wallet-side key management, no mandatory key escrow
last_reviewed: 2026-04-14
works-best-when:
  - End users need to control who can see their transaction history
  - Regulatory disclosure should be user-initiated, not institution-imposed
  - Multiple competing service providers exist so users can exit if key custody is compromised
avoid-when:
  - Regulation mandates always-on institutional access to all user transactions
  - Users cannot manage their own key material (no compatible wallet available)
  - Anonymity set is so small that viewing key control is moot
dependencies:
  - Dual-key cryptography (spend + view)
  - Wallet infrastructure with key derivation
  - Selective disclosure framework
context: i2u
crops_profile:
  cr: none
  os: partial
  privacy: full
  security: medium
---

## Intent

In many privacy-preserving systems, the institution operating the service holds the viewing keys (or equivalent decryption capabilities) for all user transactions. This gives the institution surveillance power over users even when on-chain data is encrypted. User-controlled viewing keys invert this: the user holds the private viewing key and selectively shares derived sub-keys with specific parties (regulators, auditors, counterparties) for scoped, time-limited access. The pattern is the I2U complement to [Selective Disclosure](pattern-regulatory-disclosure-keys-proofs.md), which covers institution-to-regulator flows once keys have been shared.

## Ingredients

- **Cryptographic**: dual-key architecture separating spending authority from read access. Key derivation functions for scoped sub-keys (per-note, per-account, per-time-window). Optional threshold splitting for backup and recovery.
- **Standards and protocols**: EIP-5564 + EIP-6538 (stealth-address generation and meta-address registry with view/spend split), Aztec incoming viewing keys (IVK; OVK is reserved in the protocol but not currently used), Railgun wallet key hierarchy (spending key, viewing key, nullifier key), Zcash incoming/outgoing viewing keys.
- **Infrastructure**: user-side wallet with key management, optional encrypted backup (user-controlled), selective disclosure interface for generating and delivering scoped keys.

## Protocol (concise)

1. User generates a spending key and a viewing key pair during wallet setup. The spending key authorizes transfers; the viewing key allows reading encrypted transaction history.
2. The institution (L2 operator, service provider) never receives or stores the user's viewing key. On-chain state is encrypted under the user's key.
3. When disclosure is required (regulator audit, counterparty verification), the user derives a scoped sub-key limited by time window, account, or transaction set.
4. User delivers the scoped key to the requesting party through an authenticated channel.
5. The requesting party decrypts the scoped data and verifies it against on-chain commitments. Access beyond the scope is cryptographically impossible.
6. User can rotate or revoke scoped keys without affecting the master viewing key.

## Guarantees

- **User sovereignty**: no party can read the user's transaction history without a key the user explicitly provided.
- **Scope limitation**: derived keys grant access limited to the specified scope (time range, account, transaction set). Over-disclosure is prevented by the key derivation scheme, not by policy.
- **Auditability without surveillance**: regulators can audit when the user cooperates, but cannot conduct ongoing surveillance.
- **I2U**: the institution is not able to unilaterally inspect user balances or transaction patterns. This is the defining property and the key difference from institution-held viewing keys.
- **I2I**: between institutions, viewing keys are exchanged bilaterally under contractual terms. The power dynamic is symmetric, so user-controlled keys are less critical but still useful for damage containment (each counterparty sees what was shared).

## Trade-offs

- **Regulatory tension**: some jurisdictions may require always-on institutional access (travel rule implementations, mandatory suspicious activity monitoring). In such contexts, user-controlled keys conflict with regulatory requirements. Hybrid models exist: the user holds the master key but pre-commits to granting scoped access under defined conditions (court order, regulatory mandate) via smart contract logic or social recovery mechanisms.
- **Key loss**: if the user loses the viewing key, historical transaction data becomes permanently inaccessible. Mitigation: encrypted backup with social recovery, threshold splitting across user-controlled devices.
- **UX burden**: users must manage additional key material and make disclosure decisions. Institutional services can simplify this with wallet UX, but the user must understand the consequences of sharing keys.
- **Granularity varies by implementation**: Aztec's IVK provides account-level viewing. Railgun's per-note approach allows finer granularity. Zcash's full viewing key (FVK) reveals both incoming and outgoing transactions; the incoming viewing key (IVK) is a narrower variant. The privacy/usability trade-off depends on the key derivation hierarchy.
- **CROPS context (I2U)**: CR is `none` because this pattern addresses coerced disclosure and surveillance (read-axis), which is orthogonal to classic censorship resistance (write-axis: transaction submission, service access). Viewing-key control does not prevent an institution from blocking transactions or denying service; pair with [Forced Withdrawal](pattern-forced-withdrawal.md) for CR. OS is `partial` because key derivation schemes are well-documented and open source (Aztec, Zcash, Railgun), but specific wallet implementations may be proprietary. Privacy is `full` because the user controls all disclosure; no party learns more than the user explicitly reveals. Security is `medium` because it depends on the user's key management practices and the underlying cryptographic assumptions (ECDH/BabyJubJub for Aztec, BabyJubJub for Railgun derived from an Ethereum wallet signature). Security could reach `high` with audited key management tooling and hardware wallet integration.

## Example

- Fund manager executes trades on a privacy L2 where balances remain encrypted to the operator.
- For quarterly reporting, the manager derives a Q1-scoped viewing sub-key and shares it with compliance.
- Compliance verifies Q1 transactions against on-chain commitments without access to other periods.
- For a BaFin ISIN audit, the manager derives an asset-scoped key and shares it via an authenticated channel.
- Auditor verifies requested positions without receiving full-portfolio visibility.

## See also

- [Selective Disclosure (viewing keys + ZK proofs)](pattern-regulatory-disclosure-keys-proofs.md): the institution-to-regulator complement; covers the workflow once keys are shared
- [Shielded ERC-20 Transfers](pattern-shielding.md): the underlying privacy mechanism that viewing keys complement
- [Privacy L2s](pattern-privacy-l2s.md): L2 architectures with built-in viewing key infrastructure
- [Stealth Addresses](pattern-stealth-addresses.md): per-transaction unlinkability using the same view/spend key split
- [Forced Withdrawal](pattern-forced-withdrawal.md): complementary I2U protection for asset recovery
- [Network-Level Anonymity](pattern-network-anonymity.md): complementary I2U protection at the transport layer
