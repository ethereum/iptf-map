---
title: "Approach: Private Money Market Funds"
status: draft
last_reviewed: 2026-05-05

use_case: private-money-market-funds
related_use_cases: [private-stablecoins, private-treasuries, private-rwa-tokenization]

primary_patterns:
  - pattern-shielding
  - pattern-regulatory-disclosure-keys-proofs
supporting_patterns:
  - pattern-private-vaults
  - pattern-compliance-monitoring
  - pattern-verifiable-attestation
  - pattern-private-shared-state-fhe
  - pattern-tee-based-privacy
  - pattern-tee-key-manager

open_source_implementations:
  - url: https://github.com/Railgun-Privacy/contract
    description: "Railgun shielded pool"
    language: Solidity
---

# Approach: Private Money Market Funds

## Problem framing

### Scenario

A treasurer subscribes USD 50M USDC to a tokenized T-bill money market fund. Position size, redemption timing, and yield attribution must be hidden from competitors and other fund participants. Fund NAV must be publicly verifiable on a daily or intraday cadence and must remain verifiable even if the fund operator goes offline; redemptions must continue without interruption under stress.

### Requirements

- Daily or intraday NAV computation with verifiable correctness
- SEC Rule 2a-7 (US) and ESMA MMFR (EU) compliance: gates, liquidity fees, concentration limits
- Atomic subscription and redemption settlement (no partial fills)
- Yield attribution provably correct per investor without revealing positions
- Operator-independent solvency: NAV verifiable by a threshold subset, not the operator

### Constraints

- Threshold opening (t-of-n) by independent custodians or auditors must be administratively feasible
- Periodic full-audit checkpoints must run off the critical path of subscription/redemption
- Fund-circuit hash registered immutably at deployment; circuit upgrades imply migration
- Compliance gates (Rule 2a-7 liquidity ratio, concentration limits) must be enforceable without revealing individual positions

## Approaches

### ZK Shielded Commitments

```yaml
maturity: prototyped
context: i2i
crops: { cr: high, o: yes, p: full, s: high }
uses_patterns: [pattern-shielding, pattern-regulatory-disclosure-keys-proofs, pattern-verifiable-attestation, pattern-compliance-monitoring]
example_vendors: [paladin, railgun, privacypools]
```

**Summary:** Share positions are shielded UTXO commitments; a running `total_shares` commitment is updated per transaction; NAV opens via threshold key holders independent of the operator.

**How it works:** Each position is a commitment to (attestation hash, share count, entry NAV). Subscription mints a position commitment and increments a running Pedersen commitment to `total_shares`; redemption nullifies the position and decrements the running total. ZK circuits enforce conservation, gate logic (Rule 2a-7 liquidity ratio, concentration), and yield-attribution constraints. NAV is computed by any t-of-n threshold key holders opening `total_shares` and multiplying by an oracle price-per-share; a periodic full-audit checkpoint verifies the running total against all active positions, off the redemption critical path.

**Trust assumptions:**
- L1 / L2 consensus and verifier contract correctness
- Threshold custodian / auditor set (t-of-n) for NAV opening; operator does not participate in the threshold
- Oracle integrity for per-share price (single oracle or quorum)

**Threat model:**
- Adversary observes L1 / L2; cannot break ZK soundness
- Threshold compromise (t collusions) reveals NAV but not individual positions
- Oracle compromise distorts NAV; mitigated by quorum
- Periodic full-audit catches running-total drift from circuit bugs

**Works best when:**
- Operator independence is a hard requirement (regulator, donor policy, internal governance)
- Daily or intraday NAV cadence matches the proving budget
- Threshold custodian / auditor administration is feasible

**Avoid when:**
- Yield logic is complex enough that circuit complexity exceeds practical bounds
- Threshold administration overhead (key rotation, custodian onboarding) is unacceptable

**Implementation notes:** PoC uses Railgun-class shielded pool primitives. Compliance gates encoded as ZK public outputs (e.g., post-redemption liquidity ratio > 30%); regulator scope via per-position view keys logged through EAS. Yield attribution uses pro-rata share-of-total computation: each redeemer proves `my_shares / total_shares * total_yield = entitled_amount`.

### FHE Encrypted Balances

```yaml
maturity: prototyped
context: i2i
crops: { cr: medium, o: partial, p: partial, s: medium }
uses_patterns: [pattern-private-shared-state-fhe, pattern-compliance-monitoring]
example_vendors: [zama, fhenix, orion-finance]
```

**Summary:** Balances are FHE ciphertexts on an FHE-enabled L2; NAV is computed homomorphically; threshold key holders decrypt for publication.

**How it works:** Subscriptions encrypt the share count under the FHE network's keys; balances are stored as ciphertexts with ACL-based read access. NAV is computed under encryption (sum of ciphertexts × per-share price); a t-of-n threshold network decrypts the result for posting on chain. Yield attribution runs as homomorphic arithmetic; gate logic uses encrypted comparisons.

**Trust assumptions:**
- t-of-n threshold network for FHE decryption keys
- FHE library implementation correctness
- ACL grants honored by all participants

**Threat model:**
- Threshold compromise reveals all balances
- No revocation per ciphertext; ACL revocation requires re-encryption on balance update
- Shared throughput across all FHE applications on the network is a bottleneck

**Works best when:**
- Yield logic is complex (path-dependent strategies) and benefits from homomorphic arithmetic
- Per-balance ACL granularity matches the disclosure model
- Threshold-network trust is acceptable to all custodians

**Avoid when:**
- Operator independence requires that no single network be load-bearing
- Throughput pressure across all FHE applications is unacceptable

### TEE Enclave

```yaml
maturity: prototyped
context: i2i
crops: { cr: medium, o: no, p: full, s: low }
uses_patterns: [pattern-tee-based-privacy, pattern-tee-key-manager, pattern-compliance-monitoring]
example_vendors: []
```

**Summary:** Positions sealed inside a TEE enclave; NAV computed in the clear internally; remote-attested results posted on chain.

**How it works:** Subscriptions are encrypted to the enclave's attested public key; the enclave maintains positions in cleartext memory. NAV computation, gate enforcement, and yield attribution all run inside the enclave; the enclave signs results under its attested key. Selective disclosure runs through enclave-mediated views: regulators submit signed queries, the enclave returns scoped responses.

**Trust assumptions:**
- TEE vendor and remote-attestation chain (Intel TDX, AMD SEV, AWS Nitro, Azure CC)
- Cloud co-tenant isolation
- Enclave software supply chain (reproducible build, multi-party signing)

**Threat model:**
- Side-channel and microarchitectural attacks against the enclave class
- Vendor compromise or compelled disclosure of attestation keys
- Enclave software vulnerabilities expose all fund state to a single-party adversary

**Works best when:**
- Near-term deployment is needed and ZK / FHE proving costs are prohibitive
- Hardware trust is already accepted by custodians
- Enclave reproducibility and signing pipeline are operationalized

**Avoid when:**
- Threat model includes nation-state-class side-channel adversaries
- Operator independence requires that no single hardware vendor be load-bearing

## Comparison

| Axis | ZK Shielded Commitments | FHE Encrypted Balances | TEE Enclave |
|---|---|---|---|
| **Maturity** | prototyped | prototyped | prototyped |
| **Context** | i2i | i2i | i2i |
| **CROPS** | CR:hi O:y P:full S:hi | CR:med O:part P:part S:med | CR:med O:no P:full S:lo |
| **Trust model** | Math + threshold (t-of-n) for NAV opening | Threshold (t-of-n) decryption | Hardware vendor + supply chain |
| **Privacy scope** | Amounts + addresses | Amounts only; addresses public | Amounts + addresses (inside enclave) |
| **Performance** | Constant per tx; periodic full-audit scales with positions | Heaviest compute; shared throughput | Cheapest; near-instant |
| **Operator req.** | None (relayer optional) | Yes (threshold network) | Yes (enclave host) |
| **Cost class** | Medium-high | Medium | Low |
| **Regulatory fit** | Strong (per-position view keys, EAS-logged) | Strong (per-balance ACL, no revocation) | Conditional (vendor attestation) |
| **Failure modes** | Threshold compromise; circuit bugs; oracle compromise | Threshold compromise; no revocation; throughput | Side-channel; vendor compromise; enclave outage |

## Persona perspectives

### Business perspective

For a yield-bearing tokenized treasury product where operator-independent NAV verification is the load-bearing property, **ZK Shielded Commitments** is the right default: positions and redemptions are private, the running-total commitment is opened by a threshold subset of custodians and auditors who do not include the operator, and the fund continues to function under operator outage. **FHE** suits funds with complex yield logic (multi-strategy MMFs, dynamic allocation) where homomorphic arithmetic removes circuit-design overhead; the trade-off is reliance on the FHE network for both decryption and throughput. **TEE** is a viable PoC starting point and a near-term production option for funds whose custodians already accept hardware-rooted trust.

### Technical perspective

The dominant engineering question is the NAV-proof model. ZK with a running `total_shares` commitment keeps per-transaction proving constant and pushes full-audit cost off the critical path; circuit complexity for gate enforcement and yield attribution is the ceiling. FHE simplifies the programming model but inherits shared-throughput limits and per-ciphertext revocation gaps. TEE eliminates both proving cost and revocation issues but introduces a hardware trust chain and side-channel surface that auditors must accept. Threshold custody administration (key rotation, custodian onboarding, t parameter selection) is non-trivial across all three.

### Legal & risk perspective

ZK Shielded Commitments carries the cleanest disclosure story for SEC Rule 2a-7 and ESMA MMFR: per-position view keys give regulators scoped access; ZK public outputs prove gate compliance (liquidity ratio, concentration) without revealing positions; EAS-logged disclosures provide a verifiable trail. FHE provides per-balance ACL granularity, but the no-revocation gap requires policy: balance updates must trigger ACL re-grant or the disclosure model relies on append-only audit logs. TEE-based disclosure is mediated by the enclave; auditor acceptance depends on enclave-code reproducibility, multi-party signing, and the vendor governance model. For each option, threshold custodian composition (independence from the operator, jurisdictional diversity) is the structural risk control.

## Recommendation

### Default

For institutional-grade private money market funds where operator-independent NAV is required, default to **ZK Shielded Commitments** with a Pedersen running-total opened by a t-of-n threshold of custodians and auditors who do not include the fund operator. Periodic full-audit checkpoints run off the redemption critical path. Selective disclosure runs through per-position view keys logged via EAS; gate compliance is encoded as ZK public outputs.

### Decision factors

- If yield logic is complex (multi-strategy, path-dependent) and per-balance ACL granularity is required, choose **FHE Encrypted Balances**.
- If near-term deployment is required and custodians already accept hardware-rooted trust, choose **TEE Enclave** as a PoC or transitional path.
- If operator independence cannot be administered through threshold custody, none of the three approaches removes the trust assumption, re-scope the requirement.

### Hybrid

Run primary NAV through ZK Shielded Commitments; use TEE for high-frequency intraday yield strategies that exceed practical proving budgets, with the TEE output committed back into the ZK running total at the next checkpoint. FHE handles complex strategy attribution where the dominant operation is homomorphic arithmetic. Compliance gating runs uniformly through the regulator-disclosure-keys pattern across all rails.

## Open questions

1. **Yield-cohort attribution.** Balancing fungible-share privacy against the complexity of attributing yield across different entry-NAV cohorts; pro-rata is the working assumption but other models may better serve specific products.
2. **Peer-to-peer share trading.** Shielded MMF shares traded peer-to-peer with privately enforced NAV-based pricing; integration with shielded DvP is unresolved.
3. **Mixed-currency underlying.** Hiding currency exposure when the underlying basket spans multiple currencies; oracle and ACL design are unresolved.
4. **MMF-as-cash-equivalent.** Whether shielded MMF shares can serve as the cash leg in DvP for other instruments.

## See also

- **Standards:** [EAS](https://attest.org/), [ERC-3643](https://eips.ethereum.org/EIPS/eip-3643)
- **Regulations:** [SEC Rule 2a-7](https://www.sec.gov/rules-regulations/2010/02/money-market-fund-reform), [ESMA MMFR](https://www.esma.europa.eu/data-reporting/mmfr-reporting)
- **Patterns:** [Shielding](../patterns/pattern-shielding.md), [Private Vaults](../patterns/pattern-private-vaults.md), [Regulatory Disclosure Keys & Proofs](../patterns/pattern-regulatory-disclosure-keys-proofs.md), [Compliance Monitoring](../patterns/pattern-compliance-monitoring.md), [Verifiable Attestation](../patterns/pattern-verifiable-attestation.md), [Private Shared State (FHE)](../patterns/pattern-private-shared-state-fhe.md), [TEE-Based Privacy](../patterns/pattern-tee-based-privacy.md), [TEE Key Manager](../patterns/pattern-tee-key-manager.md)
- **Vendors:** ZK ([Paladin](../vendors/paladin.md), [Railgun](../vendors/railgun.md), [Privacy Pools](../vendors/privacypools.md)); FHE ([Zama](../vendors/zama.md), [Fhenix](../vendors/fhenix.md), [Orion Finance](../vendors/orion-finance.md)); MPC / Garbled Circuit ([Soda Labs](../vendors/soda-labs.md))
- **Related approaches:** [Private Bonds](approach-private-bonds.md), [Atomic DvP Settlement](approach-dvp-atomic-settlement.md)
