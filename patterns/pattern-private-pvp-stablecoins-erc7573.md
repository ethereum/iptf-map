---
title: "Pattern: Private PvP (cash to cash) Settlement via ERC-7573"
status: draft
maturity: concept
type: standard
layer: hybrid
last_reviewed: 2026-04-22

works-best-when:
  - Two permissioned or regulated stablecoins (same L2 or cross-L2) must settle atomically with amount privacy.
  - Finality sensing and pricing for FX or cross-issuer settlement can be served by an oracle feed both parties accept.
avoid-when:
  - Bilateral netting or off-chain wires already satisfy the settlement requirement.
  - HTLC timeouts with public amounts are acceptable and operational simplicity outweighs privacy.

context: i2i

crops_profile:
  cr: medium
  o: partial
  p: partial
  s: medium

crops_context:
  cr: "Censorship resistance depends on the oracle feed and the finality-relayer path. If the oracle or the cross-domain relayer censors, settlement can stall even though the escrow contracts are non-custodial."
  o: "The ERC-7573 escrow standard is open; oracle feeds and cross-chain messaging infrastructure are typically proprietary. Parties can substitute alternative oracles and relayers at deployment time."
  p: "Amounts and counterparties are hidden from the public chain, but the escrow contracts, oracle verdicts, and minimal settlement anchors remain visible. Metadata about when settlement happened and which assets are involved is not hidden."
  s: "Rides on the correctness of the escrow contracts, oracle honesty, and finality-sensing correctness on the paying leg. Ops procedures must cover oracle outages and cross-domain message delays."

post_quantum:
  risk: medium
  vector: "Signatures over oracle reports, cross-domain proofs, and shielded-layer zero-knowledge proofs use elliptic-curve primitives that are broken by a CRQC."
  mitigation: "Migrate oracle attestations and cross-domain proofs to post-quantum signature schemes; compose with a post-quantum shielding layer on each leg. See [Post-Quantum Threats](../domains/post-quantum.md)."

standards: [ERC-7573, ERC-20]

related_patterns:
  requires: [pattern-private-stablecoin-shielded-payments]
  composes_with: [pattern-dvp-erc7573, pattern-shielding, pattern-l2-encrypted-offchain-audit, pattern-regulatory-disclosure-keys-proofs]
  see_also: [pattern-cross-chain-privacy-bridge, pattern-pretrade-privacy-encryption]

open_source_implementations:
  - url: https://github.com/ercs-eth/erc-7573
    description: "ERC-7573 reference escrow contracts for atomic asset transfer"
    language: Solidity
---

## Intent

Settle two stablecoin legs against each other atomically while keeping amounts and counterparties visible only to the transacting parties and their auditors. Each leg uses a shielded transfer layer for privacy; the ERC-7573 escrow pattern on both chains conditions release on verified finality of the opposite leg, so neither side settles without the other. The construction avoids the public amounts and timing leakage of plain HTLCs and avoids relying on time-locks for safety.

## Components

- ERC-7573 conditional-escrow contract on each chain, parameterised with the release condition for the opposite leg.
- Shielded transfer layer on each chain that hides amounts and counterparties on the transacting side.
- Price or FX oracle feed, referenced by feed identifier, used to check the rate condition at settlement time when the legs are in different units.
- Finality-sensing component that produces an attestation (or cross-domain message) proving the paying leg finalised at or above the agreed terms.
- Optional cross-domain messaging layer when the two legs live on different L2s or app-chains.
- Attestation layer for scoped disclosure to auditors, recording which parties settled, at what rate, and when, without exposing amounts publicly.

## Protocol

1. [counterparty] Agree bilaterally on notional, FX rate (if cross-currency), oracle feed identifier, and tolerance band.
2. [counterparty] Each side deposits the shielded stablecoin into the ERC-7573 escrow on its chain, encoding the release condition that references the opposite leg and the oracle feed.
3. [counterparty] The first leg executes: shielded payment settles and finality is reached on the originating chain.
4. [relayer] Produce a finality attestation or cross-domain message proving the first leg finalised within the agreed terms.
5. [contract] The second-leg escrow verifies the attestation and the oracle rate, then releases the shielded payment to the counterparty.
6. [counterparty] On failure (missed finality window, oracle outside tolerance), both escrows revert and operational runbooks handle retry or cancel.
7. [auditor] Use the attestation record and viewing keys on each leg to reconstruct the full settlement for compliance review.

## Guarantees & threat model

Guarantees:

- Atomic settlement across two chains or two assets: both legs settle or both revert, without relying on time-locks for safety.
- Amount privacy: amounts are hidden on the chains themselves; only stakeholders and auditors with the viewing keys see the full trade.
- Scoped disclosure: attestations log regulator access without exposing amounts publicly.

Threat model:

- Oracle honesty and update cadence. A compromised or stale feed lets an attacker settle outside the agreed tolerance band.
- Finality-sensing correctness on the paying leg. A fake or premature finality attestation can trigger a one-sided release.
- Non-censoring cross-domain relayer. A relayer that withholds messages stalls settlement; escrows must fail safe back to the originator.
- Upgrade governance on both escrow contracts. A unilateral upgrade on one leg can freeze settled funds.
- Out of scope: correlation of settlement windows across the two chains by a global network observer.

## Trade-offs

- Oracle dependence is the main operational risk: outage, stale data, or price manipulation can each block settlement or produce an unfair release.
- Cross-L2 finality sensing and the failure-recovery path add operational overhead relative to a single-chain DvP.
- Fragmentation across issuers and L2s may require market-making facilities to source liquidity on both sides.
- Debuggability: amounts and counterparties are hidden on-chain, so post-mortems require coordinated viewing-key access with the counterparty.

## Example

Two regulated banks settle a shielded USD-stablecoin leg against a shielded EUR-stablecoin leg on separate L2s. Each bank deposits its shielded leg into an ERC-7573 escrow that references an EUR/USD price feed and the opposite escrow's finality proof. When the USD leg finalises within tolerance, a cross-domain attestation releases the EUR escrow to the USD-paying bank. Chain observers see that two escrow contracts settled but not the amounts or identities. The banks' auditors reconstruct the full trade via the shielded viewing keys and the attestation log.

## See also

- [ERC-7573: Conditional-upon-Event Asset Transfer](https://eips.ethereum.org/EIPS/eip-7573)
- [Delivery versus Payment via ERC-7573](pattern-dvp-erc7573.md)
