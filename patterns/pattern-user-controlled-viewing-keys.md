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
  cr: high
  os: partial
  privacy: full
  security: medium
---

## Intent

In many privacy-preserving systems, the institution operating the service holds the viewing keys (or equivalent decryption capabilities) for all user transactions. This gives the institution surveillance power over users even when on-chain data is encrypted. User-controlled viewing keys invert this: the user holds the private viewing key and selectively shares derived sub-keys with specific parties (regulators, auditors, counterparties) for scoped, time-limited access. The pattern is the I2U complement to [Selective Disclosure](pattern-regulatory-disclosure-keys-proofs.md), which covers institution-to-regulator flows once keys have been shared.

## Ingredients

- **Cryptographic**: dual-key architecture separating spending authority from read access. Key derivation functions for scoped sub-keys (per-note, per-account, per-time-window). Optional threshold splitting for backup and recovery.
- **Standards and protocols**: EIP-5564 (stealth addresses with view/spend split), Aztec incoming/outgoing viewing keys (IVK/OVK), Railgun wallet key hierarchy (spending key, viewing key, nullifier key), Zcash incoming/outgoing viewing keys.
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
- **Granularity varies by implementation**: Aztec IVK/OVK provides account-level viewing. Railgun's per-note approach allows finer granularity. Zcash's full viewing key reveals all incoming transactions. The privacy/usability trade-off depends on the key derivation hierarchy.
- **CROPS context (I2U)**: CR is `high` because the user retains key custody; the institution cannot selectively deny visibility or enforce unwanted transparency. CR drops to `medium` if the platform requires key escrow as a condition of service (effectively institution-held with extra steps). OS is `partial` because key derivation schemes are well-documented and open source (Aztec, Zcash, Railgun), but specific wallet implementations may be proprietary. Privacy is `full` because the user controls all disclosure; no party learns more than the user explicitly reveals. Security is `medium` because it depends on the user's key management practices and the underlying cryptographic assumptions (ECDH/BabyJubjub for Aztec, secp256k1 for Railgun). Security could reach `high` with audited key management tooling and hardware wallet integration.

## Example

A fund manager uses a privacy L2 to execute trades. The L2 operator processes encrypted transactions but cannot read balances or counterparties. When the fund's compliance team needs a quarterly report, the manager derives a time-scoped viewing key covering Q1 and shares it with the compliance officer. The officer decrypts Q1 transactions and verifies them against on-chain commitments. The officer cannot see Q2 data or later. When BaFin requests an audit of a specific ISIN, the manager derives a per-asset viewing key and shares it through a secure channel. BaFin verifies the relevant positions without learning the full portfolio.

## See also

- [Selective Disclosure (viewing keys + ZK proofs)](pattern-regulatory-disclosure-keys-proofs.md): the institution-to-regulator complement; covers the workflow once keys are shared
- [Shielded ERC-20 Transfers](pattern-shielding.md): the underlying privacy mechanism that viewing keys complement
- [Privacy L2s](pattern-privacy-l2s.md): L2 architectures with built-in viewing key infrastructure
- [Stealth Addresses](pattern-stealth-addresses.md): per-transaction unlinkability using the same view/spend key split
- [Forced Withdrawal](pattern-forced-withdrawal.md): complementary I2U protection for asset recovery
- [Network-Level Anonymity](pattern-network-anonymity.md): complementary I2U protection at the transport layer
