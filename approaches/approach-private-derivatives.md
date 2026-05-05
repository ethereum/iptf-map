---
title: "Approach: Private Smart Derivatives"
status: draft
last_reviewed: 2026-05-05

use_case: private-derivatives
related_use_cases: [private-bonds, private-stablecoins]

primary_patterns:
  - pattern-shielding
  - pattern-regulatory-disclosure-keys-proofs
supporting_patterns:
  - pattern-private-stablecoin-shielded-payments
  - pattern-private-shared-state-fhe
  - pattern-co-snark
  - pattern-icma-bdt-data-model
  - pattern-dvp-erc7573

open_source_implementations:
  - url: https://github.com/Railgun-Privacy/contract
    description: "Railgun shielded pool"
    language: Solidity
  - url: https://github.com/AztecProtocol/aztec-packages
    description: "Aztec privacy-native L2"
    language: TypeScript / Noir
---

# Approach: Private Smart Derivatives

## Problem framing

### Scenario

A bank trades ERC-6123 derivatives (interest-rate swaps, FX forwards, simple options) with named counterparties. Margin balances and daily settlement deltas must remain hidden from competitors; settlement must run automatically on the daily cadence; regulators must retain audit access on demand. Trade size, direction, and notional are competitively sensitive.

### Requirements

- Hide margin balances, deltas, notional, and trade direction
- Preserve ERC-6123 lifecycle automation (confirmation, valuation, margin, termination)
- Selective disclosure for regulators (per-jurisdiction, time-bound)
- Daily settlement cadence with atomic transfers

### Constraints

- ERC-6123 capped-deal semantics must hold under privacy
- Daily settlement window dictates a proving budget per counterparty
- Cross-network settlement relies on ERC-7573 coordination (conditional atomicity)
- Multi-collateral margin (USDC, EURC, tokenized deposit) requires per-asset circuit constraints

## Approaches

### ZK + Shielded Pool

```yaml
maturity: documented
context: i2i
crops: { cr: high, o: yes, p: full, s: high }
uses_patterns: [pattern-shielding, pattern-regulatory-disclosure-keys-proofs, pattern-private-stablecoin-shielded-payments, pattern-dvp-erc7573]
example_vendors: [railgun, aztec]
```

**Summary:** Margin balances live as shielded notes; daily settlement deltas are computed under ZK circuits that enforce ERC-6123 semantics on encrypted state.

**How it works:** Margin deposits are shielded into commitments. Each day, a signed oracle price feed is consumed; either counterparty submits a ZK proof of `delta = f(notional, price, direction, caps)` that consumes the loser's margin note and produces winner-aligned notes. Privacy-aware wrapper contracts enforce ERC-6123 capped-deal logic. Selective disclosure runs through regulator viewing keys. Cross-network settlement integrates ERC-7573 for the coordinated case.

**Trust assumptions:**
- L1 / L2 consensus and verifier contract correctness
- Oracle integrity for price feeds (single oracle or quorum)
- Shielded-pool issuer for KYC-gated entry, where applicable

**Threat model:**
- Adversary observes L1 / L2; cannot break ZK soundness
- Oracle compromise corrupts settlement directionality; mitigated by quorum and dispute paths
- Anonymity-set economics: small institutional pools weaken anonymity for trade-size correlation

**Works best when:**
- Counterparties are bilateral or known and accept shielded-pool entry conditions
- Daily settlement cadence matches the proving budget
- ZK toolchain is available in-house or via a vendor

**Avoid when:**
- Derivative semantics require complex computation that is awkward in circuits (path-dependent multi-underlying products)
- Real-time settlement is required and proving cost is prohibitive

### FHE Coprocessor

```yaml
maturity: documented
context: i2i
crops: { cr: medium, o: partial, p: partial, s: medium }
uses_patterns: [pattern-private-shared-state-fhe]
example_vendors: [zama, fhenix]
```

**Summary:** Margin balances are FHE ciphertexts; settlement arithmetic runs homomorphically; threshold decryption gates regulator access.

**How it works:** Margin deposits are encrypted under the FHE network's keys. Daily settlement runs as homomorphic computation: oracle price is encoded, delta is computed under encryption, balances are updated in place. A threshold decryption network gates ACL-based reads for regulator access.

**Trust assumptions:**
- t-of-n threshold network for decryption keys
- FHE library implementation correctness
- ACL adoption by all derivative participants

**Threat model:**
- Threshold compromise reveals all balances
- No revocation per ciphertext; revocation requires re-encryption on balance update
- Shared throughput across all FHE applications on the network is a bottleneck

**Works best when:**
- Derivative logic involves complex calculations (Asian options, structured products) that map naturally to FHE
- Per-balance ACL granularity is required by the disclosure model
- Threshold-network trust is acceptable

**Avoid when:**
- High throughput is required and shared-network bottlenecks are unacceptable
- Revocation per disclosure is a hard requirement

### co-SNARK (Complex Products)

```yaml
maturity: documented
context: i2i
crops: { cr: medium, o: partial, p: partial, s: medium }
uses_patterns: [pattern-co-snark]
example_vendors: [taceo-merces]
```

**Summary:** Multi-party computation under collaborative SNARKs; secret-shared margin balances; suitable for multi-asset baskets and structured products.

**How it works:** A 3-party MPC committee holds secret-shared margin balances offchain. Daily settlement runs under MPC, producing a co-SNARK that proves correct computation. The chain verifies the SNARK; counterparty addresses remain visible. Multi-asset basket logic and path-dependent payoffs are easier to express under MPC than in pure ZK circuits.

**Trust assumptions:**
- 3-of-3 honest nodes (no threshold tolerance in current TACEO design)
- Co-SNARK soundness
- Liveness of the MPC committee on the daily settlement window

**Threat model:**
- Single-node compromise breaks confidentiality
- Counterparty addresses leak; only amount and payoff confidentiality is provided
- Batch latency creates a settlement window

**Works best when:**
- Derivatives are structured products or multi-asset baskets
- Counterparties are bilateral or named and accept committee-mediated settlement
- Throughput target matches batched proving (~200 TPS)

**Avoid when:**
- Address-level privacy is required
- Threshold-honest assumption is incompatible with the threat model

## Comparison

| Axis | ZK + Shielded Pool | FHE Coprocessor | co-SNARK |
|---|---|---|---|
| **Maturity** | documented | documented | documented |
| **Context** | i2i | i2i | i2i |
| **CROPS** | CR:hi O:y P:full S:hi | CR:med O:part P:part S:med | CR:med O:part P:part S:med |
| **Trust model** | L1/L2 + oracle | t-of-n threshold network | 3-of-3 MPC honest |
| **Privacy scope** | Margin, delta, notional, addresses | Margin, delta; addresses public | Margin, delta, payoff; addresses public |
| **Performance** | ZK proving budget per settlement | Shared FHE network throughput | ~200 TPS batched |
| **Operator req.** | None (relayer optional) | Yes (threshold network) | Yes (MPC committee) |
| **Cost class** | Medium-high (verification gas) | Medium | Low (batched) |
| **Regulatory fit** | Strong (per-note view keys) | Strong (per-balance ACL, no revocation) | Strong (committee disclosure) |
| **Failure modes** | Oracle compromise; circuit complexity ceiling | Threshold compromise; no revocation | Single-node compromise; batch latency |

## Persona perspectives

### Business perspective

For institutional derivatives at the daily settlement cadence, **ZK + Shielded Pool** is the right default: it provides the strongest privacy (margin, delta, notional, and addresses through gas relayer), maps onto existing shielded-pool infrastructure, and offers a clean disclosure interface for regulators. **FHE** is the natural choice when the derivative logic involves complex arithmetic (Asian options, basket structured notes) where homomorphic computation removes the awkwardness of expressing path-dependent payoffs in circuits. **co-SNARK** wins for multi-asset baskets where bilateral settlement among named counterparties is acceptable and the MPC committee is operationally feasible.

### Technical perspective

ZK + Shielded Pool reuses production shielded-pool infrastructure but requires bespoke circuits for ERC-6123 wrapper logic; circuit complexity is the dominant constraint, especially for path-dependent products. FHE simplifies the programming model, settlement arithmetic looks like ordinary code under FHE, but inherits shared-network throughput limits and no per-ciphertext revocation. co-SNARK requires running or contracting an MPC committee; throughput is bounded by batch cadence, but the programming model is closest to standard account-based smart contracts. The proving frequency choice (daily vs intraday vs weekly) is the second-order parameter that drives cost across all three.

### Legal & risk perspective

ZK + Shielded Pool carries the cleanest disclosure story: per-note viewing keys, scoped regulator access, and a verifiable audit fingerprint via nullifier publication. FHE provides per-balance ACL granularity but cannot revoke a ciphertext after grant; the audit-trail story relies on regular balance updates triggering re-grants. co-SNARK ties disclosure scope to committee membership; auditors must accept the committee composition and slashing logic. For each option, the proving frequency must be aligned with regulatory reporting cadence; daily proofs match common derivative reporting expectations.

## Recommendation

### Default

For institutional derivatives among bilateral or named counterparties on a daily settlement cadence, default to **ZK + Shielded Pool** on a privacy L2 ([Aztec](../vendors/aztec.md)) or L1 shielded pool ([Railgun](../vendors/railgun.md)) with privacy-aware ERC-6123 wrappers. Selective disclosure runs through regulator viewing keys; oracle quorum gates daily price inputs.

### Decision factors

- If derivatives are structured products or multi-asset baskets, choose **co-SNARK** and accept the MPC committee dependency.
- If derivative logic is computation-heavy (Asian options, exotic payoffs) and per-balance ACL granularity is required, choose **FHE**.
- If circuit complexity exceeds practical proving budgets for plain ZK, choose **co-SNARK** or **FHE** depending on the dominant constraint.

### Hybrid

Run vanilla swaps and forwards through ZK + Shielded Pool for production maturity and counterparty privacy; route structured products through co-SNARK for the same counterparty set. Settlement coordination across both rails uses ERC-7573 where derivative legs cross networks. Compliance gating (KYC attestation) sits at the shielded-pool boundary as an attestation-gated deposit.

## Open questions

1. **Circuit Complexity Ceiling.** Path-dependent multi-underlying derivatives may exceed practical proof budgets; the threshold is product-specific and unresolved.
2. **Cross-Jurisdictional Disclosure Standards.** Standardization of selective-disclosure formats across MiCA, GENIUS, and national regimes is incomplete.
3. **Liquidity Fragmentation.** Impact of privacy requirements on market maker participation and price discovery is unmeasured.
4. **Key Recovery.** Institutional-grade key management for long-lived derivative positions; rotation under shielding is unresolved.
5. **DeFi Interoperability.** Standards for private derivatives interaction with broader DeFi (e.g., AMMs, lending) are absent.

## See also

- **Standards:** [ERC-6123](https://eips.ethereum.org/EIPS/eip-6123), [ERC-7573](https://ercs.ethereum.org/ERCS/erc-7573)
- **Patterns:** [Shielding](../patterns/pattern-shielding.md), [Regulatory Disclosure Keys & Proofs](../patterns/pattern-regulatory-disclosure-keys-proofs.md), [co-SNARKs](../patterns/pattern-co-snark.md), [Private Shared State (FHE)](../patterns/pattern-private-shared-state-fhe.md), [Private Stablecoin Shielded Payments](../patterns/pattern-private-stablecoin-shielded-payments.md), [ICMA BDT Data Model](../patterns/pattern-icma-bdt-data-model.md), [DvP via ERC-7573](../patterns/pattern-dvp-erc7573.md)
- **Vendors:** [Railgun](../vendors/railgun.md), [Aztec](../vendors/aztec.md), [Zama](../vendors/zama.md), [Fhenix](../vendors/fhenix.md), [TACEO Merces](../vendors/taceo-merces.md), [Orion Finance](../vendors/orion-finance.md)
- **Regulatory:** [eWpG](../jurisdictions/de-eWpG.md), [MiCA](../jurisdictions/eu-MiCA.md)
- **Related approaches:** [Private Bonds](approach-private-bonds.md), [Private Trade Settlement](approach-private-trade-settlement.md), [Atomic DvP Settlement](approach-dvp-atomic-settlement.md)
