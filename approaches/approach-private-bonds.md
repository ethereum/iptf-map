---
title: "Approach: Private Bond Issuance & Trading"
status: draft
last_reviewed: 2026-05-05

use_case: private-bonds
related_use_cases: [private-corporate-bonds, private-government-debt]

primary_patterns:
  - pattern-shielding
  - pattern-privacy-l2s
  - pattern-co-snark
  - pattern-icma-bdt-data-model
supporting_patterns:
  - pattern-private-stablecoin-shielded-payments
  - pattern-private-shared-state-fhe
  - pattern-user-controlled-viewing-keys
  - pattern-regulatory-disclosure-keys-proofs
  - pattern-verifiable-attestation
  - pattern-proof-of-innocence

iptf_pocs:
  folder: pocs/private-bond
  requirements: pocs/private-bond/REQUIREMENTS.md
  pocs:
    - name: "Custom UTXO"
      sub_approach: "UTXO Shielded Notes"
      spec: pocs/private-bond/custom-utxo/SPEC.md
      status: benchmarked
    - name: "Privacy L2 (Aztec)"
      sub_approach: "Privacy L2"
      spec: pocs/private-bond/privacy-l2/SPEC.md
      status: implemented
    - name: "FHE (Zama)"
      sub_approach: "FHE Coprocessor"
      spec: pocs/private-bond/fhe/SPEC.md
      status: implemented

open_source_implementations:
  - url: https://github.com/Railgun-Privacy/contract
    description: "Railgun (UTXO shielded pool, production volume)"
    language: Solidity
  - url: https://github.com/AztecProtocol/aztec-packages
    description: "Aztec privacy-native L2"
    language: TypeScript / Noir
  - url: https://github.com/0xMiden/miden-base
    description: "Miden client-side ZK rollup"
    language: Rust
---

# Approach: Private Bond Issuance & Trading

## Problem framing

### Scenario

A bank issues a EUR 100M corporate bond series with private allocation amounts to 50 institutional investors and operates an active secondary market with RFQ-based price discovery. The bank needs hidden positions and trade sizes, atomic same-chain DvP against EURC, jurisdiction-specific selective disclosure (eWpG, MiCA), and an automated 24/7 market with daily settlement.

### Requirements

- Hide volumes, prices, positions to prevent front-running and competitive intelligence gathering
- Selective disclosure for eWpG, MiCA, and crypto-registry verification
- Atomic same-chain DvP with minutes-level finality
- Pre-trade privacy for RFQ flows and order routing
- Coupon and lifecycle events run privately

### Constraints

- Production timeline of 1-2 years with proven infrastructure
- Cross-chain DvP requires trusted relayer or bridge; out of scope for primary path
- Must compose with existing crypto-registries and custodial infrastructure
- Deployment must satisfy ICMA BDT data-model expectations for bond identifiers

## Approaches

### UTXO Shielded Notes

```yaml
maturity: production
context: i2i
crops: { cr: high, o: yes, p: full, s: high }
uses_patterns: [pattern-shielding, pattern-private-stablecoin-shielded-payments, pattern-icma-bdt-data-model, pattern-regulatory-disclosure-keys-proofs]
poc_spec: pocs/private-bond/custom-utxo/SPEC.md
example_vendors: [paladin, railgun]
```

**Summary:** Bonds modelled as UTXO notes with hidden amount and owner; transfers via JoinSplit ZK circuits; per-note viewing keys for selective disclosure.

**How it works:** A note commits to (asset, amount, owner_pk) via a Pedersen or Poseidon hash and lives in a Merkle tree. Spending a note publishes a nullifier and creates new commitments through a ZK proof; the verifier contract checks Merkle membership, nullifier uniqueness, and balance preservation. Issuance is a global note split; redemption is a burn proof. Identity is dual: a transport address (gas, KYC) plus a shielded keypair (spending + viewing).

**Trust assumptions:**
- L1 consensus and the verifier contract
- Gas relayer for liveness on private withdrawals
- Issuer for the global-note-to-holder-notes split at issuance
- Trusted setup is not required (UltraHonk)

**Threat model:**
- Adversary observing L1 cannot break ZK soundness; metadata leakage at deposit/withdraw boundaries is the practical exposure
- Issuer compromise at issuance produces incorrect holder allocations
- Per-note viewing-key compromise scopes damage to that note

**Works best when:**
- Production maturity matters and proven infrastructure (Railgun, Paladin) is available
- Strongest privacy is required (amounts, counterparties, and addresses through gas relayer)
- Institutional vendor support reduces in-house circuit work

**Avoid when:**
- ZK toolchain is unavailable to the issuer
- Coupon logic requires complex computation that does not map cleanly to circuits

**Implementation notes:** PoC implements UTXO with Noir / UltraHonk; multi-token transfers require same-token circuit constraints, so per-pool deployments are the working assumption. Compliance hooks via attestation-gated entry (ZK proof of KYC Merkle inclusion) and per-note viewing keys.

### Privacy L2

```yaml
maturity: prototyped
context: i2i
crops: { cr: medium, o: partial, p: full, s: medium }
uses_patterns: [pattern-privacy-l2s, pattern-user-controlled-viewing-keys]
poc_spec: pocs/private-bond/privacy-l2/SPEC.md
example_vendors: [aztec, miden]
```

**Summary:** Bonds as native private notes inside a privacy-native rollup; protocol-level privacy without dedicated circuit work.

**How it works:** Aztec exposes private notes and contracts as first-class primitives; bond issuance, transfer, and coupon logic run in private functions with client-side proving. Incoming Viewing Keys (IVKs) provide account-level read access; nullifier keys are app-siloed for damage containment.

**Trust assumptions:**
- Sequencer for ordering (currently centralized in early deployments)
- Bridge contract for L1 settlement
- Aztec proving system soundness

**Threat model:**
- Sequencer outage or censorship; rollup escape paths leak linkage during forced exit
- Bridge boundary leaks deposit and withdraw amounts
- IVK compromise reveals all account-level flows

**Works best when:**
- Bond logic is complex (coupons, lifecycle) and benefits from native privacy primitives
- Throughput needs justify L2 economics
- Decentralization roadmap of the rollup is acceptable to the issuer

**Avoid when:**
- Production deployment is needed before the rollup hits its decentralization milestones
- Sequencer trust is incompatible with the issuer's risk model

### co-SNARKs (MPC Coprocessor)

```yaml
maturity: prototyped
context: i2i
crops: { cr: medium, o: partial, p: partial, s: medium }
uses_patterns: [pattern-co-snark]
example_vendors: [taceo-merces]
```

**Summary:** A 3-party MPC committee holds secret-shared balances offchain and produces collaborative Groth16 proofs that the chain verifies.

**How it works:** Bond state lives offchain under MPC sharing; institutional senders submit shares, the committee computes the transition under MPC, and emits a co-SNARK on chain. Account-model simplicity is preserved at the application layer; addresses remain visible.

**Trust assumptions:**
- 3-of-3 honest nodes (no threshold tolerance in current TACEO design)
- Co-SNARK soundness
- Committee liveness

**Threat model:**
- Single node compromise breaks confidentiality
- Counterparty addresses leak; only amount confidentiality is provided
- Batch latency creates a settlement window

**Works best when:**
- Institutional custodial models are acceptable
- Amount confidentiality is sufficient and counterparty privacy is not required
- Throughput target matches batched proving (~200 TPS)

**Avoid when:**
- Threshold-honest assumption among MPC nodes is incompatible with the threat model
- Sender or receiver anonymity is required

### FHE Coprocessor

```yaml
maturity: prototyped
context: i2i
crops: { cr: medium, o: partial, p: partial, s: medium }
uses_patterns: [pattern-private-shared-state-fhe]
poc_spec: pocs/private-bond/fhe/SPEC.md
example_vendors: [zama, fhenix]
```

**Summary:** Encrypted balances under FHE with a threshold-decryption network; computation happens directly on ciphertexts.

**How it works:** Balances are FHE ciphertexts; bond transfers and coupon arithmetic run homomorphically. A threshold network holds decryption shares; ACL grants gate read access on a per-balance basis. The chain stores ciphertexts and ACL state.

**Trust assumptions:**
- t-of-n threshold network for decryption keys
- FHE library implementation correctness
- ACL model adoption by all bond participants

**Threat model:**
- Threshold compromise reveals ciphertexts
- No revocation per ciphertext; revocation requires a re-encryption / re-grant on balance update
- Shared throughput (500-1000 TPS) is a network-wide bottleneck

**Works best when:**
- Bond logic involves complex calculations (coupon accruals, derivatives) that map naturally to FHE
- Per-balance ACL granularity is required by the disclosure model
- Custodial threshold-network model is acceptable

**Avoid when:**
- High throughput is required and the deployment cannot tolerate shared-network bottlenecks
- Revocation per disclosure is a hard requirement

## Comparison

| Axis | UTXO Shielded Notes | Privacy L2 | co-SNARKs | FHE |
|---|---|---|---|---|
| **Maturity** | production | prototyped | prototyped | prototyped |
| **Context** | i2i | i2i | i2i | i2i |
| **CROPS** | CR:hi O:y P:full S:hi | CR:med O:part P:full S:med | CR:med O:part P:part S:med | CR:med O:part P:part S:med |
| **Trust model** | Self-custody (L1 + ZK) | Sequencer + bridge | 3-of-3 MPC nodes honest | t-of-n threshold network |
| **Privacy scope** | Amounts + addresses (via gas relayer) | Amounts + addresses (account level) | Amounts only; addresses public | Amounts only; addresses public |
| **Performance** | High gas, chain-dependent throughput | L2-internal fees, unknown TPS | ~95K gas/tx batched, ~200 TPS | ~300K gas/tx, 500-1000 TPS shared |
| **Operator req.** | No (gas relayer optional) | Yes (sequencer) | Yes (MPC committee) | Yes (threshold network) |
| **Cost class** | High (L1 verify) | Low (L2-internal) | Low (batched) | Medium |
| **Regulatory fit** | Strong (per-note view keys) | Strong (IVKs, app-siloed nullifiers) | Strong for known counterparty | Strong (per-balance ACL) |
| **Failure modes** | Relayer censor; metadata at boundaries | Sequencer outage; bridge exploit | Single-node compromise; batch latency | Threshold compromise; no revocation per ciphertext |

## Persona perspectives

### Business perspective

For institutional bond issuance and trading at scale, UTXO Shielded Notes is the right default: production maturity (Railgun > USD 4b lifetime volume), white-label vendor coverage (Paladin), strongest privacy (amounts, counterparties, and addresses via gas relayer), and a regulatory story built on per-note viewing keys that maps cleanly onto eWpG and MiCA disclosure regimes. Privacy L2 wins where bond logic is complex (coupons, structured lifecycle) because it removes circuit-engineering work, but the issuer must accept the rollup's decentralization timeline. co-SNARKs and FHE fit specific institutional contexts: bilateral or club-mode markets where address visibility is acceptable, or coupon-heavy products where homomorphic arithmetic is the natural model.

### Technical perspective

Engineering effort scales by approach. UTXO Shielded Notes requires deploying a verifier and shipping a ZK toolchain, but mature vendor implementations remove the circuit-design burden. Privacy L2 trades sequencer dependency for native primitives, removing in-house circuit work but adding bridge integration. co-SNARKs requires running or contracting an MPC committee with operational discipline; throughput is bounded by batch cadence. FHE simplifies the programming model for complex bond logic but inherits shared throughput limits across all FHE applications on the network. PoC results across all three IPTF implementations confirm that selective-disclosure semantics work in each model; the architectural choice is driven by trust topology and bond-logic complexity.

### Legal & risk perspective

UTXO Shielded Notes carries the cleanest disclosure story for eWpG / MiCA: per-note viewing keys grant scoped access, nullifier publication provides a verifiable audit fingerprint, and crypto-registry verification can be integrated through attestation-gated entry. Privacy L2 (Aztec) provides account-level IVKs, coarser than UTXO but app-siloed for damage containment. co-SNARKs offers MPC-based disclosure that satisfies many institutional auditors but ties scope to committee membership. FHE provides per-balance ACL but cannot revoke a ciphertext after grant; revocation requires balance updates, which complicates the audit-trail story. For each option, jurisdictional review must validate the disclosure interface against the local registry's compliance expectations.

## Recommendation

### Default

For institutional bond issuance and trading on a 1-2 year production timeline, default to **UTXO Shielded Notes** with [Paladin](../vendors/paladin.md) or [Railgun](../vendors/railgun.md) as the underlying shielded pool. This is the only category with production maturity, vendor coverage, and a disclosure interface that has been mapped onto eWpG / MiCA expectations.

### Decision factors

- If bond logic is dominated by coupon and lifecycle arithmetic that is awkward in circuits, choose **Privacy L2** (Aztec, Miden) and accept the rollup-decentralization timeline.
- If counterparties are bilateral or named (e.g., dealer-to-dealer), and address visibility is acceptable, choose **co-SNARKs** (TACEO Merces) for MPC-based disclosure with simpler programming.
- If per-balance ACL granularity is mandated by the disclosure model and complex computation is needed, choose **FHE** (Zama, Fhenix) and plan for shared-throughput bottlenecks.

### Hybrid

Issuance can run through UTXO with a vendor-provided shielded pool; secondary trading can route through a Privacy L2 with a bridge to the L1 pool, amortizing high-frequency trades while keeping settlement security on L1 for primary issuance and large trades. Compliance gating (KYC attestation, crypto-registry verification) sits at the boundary as an attestation-gated deposit.

## Open questions

1. **Multi-Asset Bond Support.** Tranches, multiple currencies, or collateral types within shielded note systems require either per-tranche pools or extended circuit constraints; unresolved.
2. **Coupon Payment Mechanisms.** Patterns for automated, privacy-preserving coupon distribution to shielded bondholders are emergent; no canonical solution.
3. **Cross-Chain Settlement.** Beyond same-chain atomic DvP, acceptable trust models for cross-chain bond settlement (relayers, bridges, messaging) are unsettled.
4. **Secondary Market Structure.** Private RFQ systems with sufficient price discovery; unresolved at the standard level.
5. **Pre-Trade Privacy.** The boundary between order-flow privacy and post-trade confidentiality differs by market; no standard answer.
6. **Market Data & Analytics.** Bond pricing, yield curves, and analytics under transaction privacy require either trusted publishers or zk-statistics; unresolved.
7. **Regulatory Standards.** Standardization of selective-disclosure formats for eWpG / MiCA across jurisdictions is incomplete.
8. **Legacy Integration.** Bridges between on-chain privacy and traditional bond settlement (Euroclear, Clearstream, MarketAxess) are absent.

## See also

- **Reference Implementation:** [Private Bond PoC](https://github.com/ethereum/iptf-pocs/tree/master/pocs/private-bond) (Custom UTXO, Aztec L2, Zama FHE)
- **Maturity status (Feb 2026):** UTXO (production: Railgun), Privacy L2s (testnet/2026: Aztec Ignition, Miden), co-SNARKs (testnet: TACEO Base / Arc), FHE (testnet: Zama, Fhenix)
- **Standards:** [ICMA BDT](https://www.icmagroup.org/market-practice-and-regulatory-policy/repo-and-collateral-markets/legal-documentation/global-master-repurchase-agreement-gmra/)
- **Research:** [Private Tokenized Securities with UTXO Model](https://eprint.iacr.org/2025/1715.pdf)
- **Regulations:** [eWpG](../jurisdictions/de-eWpG.md), [MiCA](../jurisdictions/eu-MiCA.md)
- **Vendors:** UTXO ([Paladin](../vendors/paladin.md), [Railgun](https://railgun.org/)); Privacy L2 ([Aztec](../vendors/aztec.md), [Miden](../vendors/miden.md)); co-SNARKs ([TACEO Merces](../vendors/taceo-merces.md)); FHE ([Zama](../vendors/zama.md), [Fhenix](../vendors/fhenix.md))
- **Related patterns:** [co-SNARKs](../patterns/pattern-co-snark.md), [Shielding](../patterns/pattern-shielding.md), [User-Controlled Viewing Keys](../patterns/pattern-user-controlled-viewing-keys.md)
- **Related approaches:** [Private DvP / Atomic Settlement](approach-dvp-atomic-settlement.md), [Private Derivatives](approach-private-derivatives.md)
