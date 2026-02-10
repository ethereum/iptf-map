---
title: "Pattern: Compliance Monitoring"
status: draft
maturity: pilot
layer: hybrid
privacy_goal: Screen transactions for regulatory compliance while preserving privacy through selective disclosure
assumptions: Compliance oracle or screening service, threshold-based alerting, regulatory disclosure infrastructure
last_reviewed: 2026-02-03
works-best-when:
  - Institution must monitor transactions for AML/sanctions compliance
  - Privacy is required but regulators need audit capability
  - Real-time screening is mandatory before settlement
avoid-when:
  - Full transparency is acceptable (no privacy requirement)
  - Jurisdiction has no transaction monitoring requirements
dependencies: [EAS, threshold-KMS, compliance-oracle]
---

## Intent

Enable institutions to monitor private transactions for regulatory compliance (AML, sanctions, fraud) without exposing transaction details to unauthorized parties. Balance privacy preservation with auditability through selective screening approaches and tiered disclosure.

## Ingredients

- **Standards:** EAS for audit logging, ERC-3643 for permissioned tokens (requires privacy extension — ONCHAINID is not privacy-preserving today; see [ERC-3643 RWA pattern](pattern-erc3643-rwa.md#trade-offs)), W3C Verifiable Credentials for compliance attestations
- **Infra:** Compliance oracle (Chainalysis, Elliptic, or internal), threshold KMS for viewing keys, L2 with privacy features
- **Off-chain:** Screening service, alert management system, case management workflow, regulatory reporting interface

## Protocol (concise)

1. **Pre-screening:** Before transaction submission, sender's compliance node checks recipient against sanctions lists and internal policies
2. **Commit phase:** Transaction submitted with encrypted payload; compliance oracle receives viewing key or ZK proof of compliance
3. **Screen:** Oracle verifies transaction against AML rules without seeing full details (amount ranges, counterparty risk scores)
4. **Alert or Clear:** If screening passes, transaction proceeds; if flagged, alert generated with severity level
5. **Escalation:** High-severity alerts trigger hold and manual review; low-severity logged for batch review
6. **Settlement:** Cleared transactions settle; flagged transactions held pending resolution
7. **Audit trail:** All screening decisions logged to EAS with timestamps and rule versions
8. **Reporting:** Periodic compliance reports generated from audit logs for regulators

## Guarantees

- **Privacy:**
  - Transaction details visible only to compliance function and authorized parties
  - Screening can use ZK proofs (prove amount < threshold without revealing amount)
  - Counterparty identities protected from public view

- **Compliance:**
  - All transactions screened against current sanctions lists
  - Configurable rule engine supports jurisdiction-specific requirements
  - Immutable audit trail proves due diligence

- **Auditability:**
  - Regulator can request disclosure via viewing keys (see [Selective Disclosure](pattern-regulatory-disclosure-keys-proofs.md))
  - Screening decisions timestamped and signed
  - Alert resolution workflow fully logged

## Trade-offs

| Aspect | Trade-off | Mitigation |
|--------|-----------|------------|
| **Latency** | Real-time screening adds 100-500ms per transaction | Batch screening for low-risk flows; parallel screening |
| **Privacy leak** | Compliance oracle sees some transaction metadata | Use ZK proofs for screening; minimize oracle data access |
| **False positives** | Overly strict rules block legitimate transactions | Tiered thresholds; human review for edge cases |
| **Oracle trust** | Centralized compliance oracle is a privacy risk | Threshold oracle with multiple providers; TEE-based screening |
| **Cost** | Screening services charge per-transaction fees | Volume discounts; internal screening for high-frequency flows |

## Alert Thresholds (Reference)

| Severity | Trigger | Response Time | Action |
|----------|---------|---------------|--------|
| **Critical** | Sanctioned entity match | Immediate | Block transaction, notify compliance officer |
| **High** | Amount > jurisdiction threshold | < 1 hour | Hold for manual review |
| **Medium** | Unusual pattern detected | < 24 hours | Flag for batch review |
| **Low** | Minor policy deviation | Next business day | Log and monitor |

## Example

**Private Bond Settlement with Compliance Screening:**

1. Bank A initiates €5M bond purchase from Bank B on privacy L2
2. Bank A's compliance node pre-screens Bank B against sanctions list (clear)
3. Transaction submitted with encrypted amount; compliance oracle receives ZK proof that amount is within reporting threshold
4. Oracle verifies proof, checks counterparty risk score (medium), clears transaction
5. Settlement executes; audit log records: timestamp, screening version, result (cleared), proof hash
6. Monthly report aggregates cleared transactions for regulatory filing

**Flagged Transaction Flow:**

1. Corporation X initiates transfer to newly onboarded counterparty
2. Pre-screening detects counterparty jurisdiction requires enhanced due diligence
3. Alert (severity: High) generated; transaction held in pending state
4. Compliance officer reviews counterparty documentation, approves with note
5. Transaction released; audit log includes officer ID, approval timestamp, justification hash

## See also

- [Selective Disclosure (Viewing Keys + ZK Proofs)](pattern-regulatory-disclosure-keys-proofs.md) - On-demand regulator access
- [Verifiable Attestation](pattern-verifiable-attestation.md) - On-chain credential verification
- [ERC-3643 RWA](pattern-erc3643-rwa.md) - Permissioned tokens with identity
- [ZK KYC/ML ID](pattern-zk-kyc-ml-id-erc734-735.md) - Zero-knowledge identity verification
- [Payment Policy Enforcement](pattern-payment-policy-enforcement.md) - Policy controls for payments
- [Approach: Private Bonds](../approaches/approach-private-bonds.md) - End-to-end compliant bond issuance

## External References

- [FATF Travel Rule Guidance](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Guidance-rba-virtual-assets-2021.html) - AML requirements for virtual assets
- [Chainalysis Compliance](https://www.chainalysis.com/solutions/compliance/) - Transaction screening provider
- [Elliptic](https://www.elliptic.co/) - Blockchain analytics and compliance
