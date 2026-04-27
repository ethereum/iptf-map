---
title: "Resilient Disbursement Rails"
primary_domain: Payments
secondary_domain: Identity
---

## 1) Use Case

Deliver private humanitarian disbursements to recipients in adversarial jurisdictions, with off-ramp unlinkability as the primary cryptographic requirement. Recipients hold tamper-resistant smartcards with no client-side ZK proving capability, intermittent or absent internet connectivity, and a high probability of device loss or seizure. Every party in the path between funder and recipient (implementing partner, identity-layer operator, relay, custodian, exchange) is assumed to eventually be breached, compelled, or inherited by a hostile successor.

## 2) Additional Business Context

Cash and Voucher Assistance (CVA) is a standard humanitarian modality. Major donors and implementers including ICRC, UN agencies, and the [CALP Network](https://www.calpnetwork.org/) ship CVA at scale; the [Sphere Handbook](https://spherestandards.org/) sets minimum standards across cash, voucher, and in-kind modalities; the [ICRC Handbook on Data Protection in Humanitarian Action (2nd ed, 2020)](https://www.icrc.org/en/data-protection-humanitarian-action-handbook) is the authoritative guide on data protection in humanitarian operations.

The threat model is grounded in the 2013 to 2026 public record: eleven distinct adversary capabilities have been used against humanitarian recipients, refugees, dissidents, and civil-society actors (full incident catalog in Notes And Links). The identification pivot in every documented prosecution that used financial surveillance was a KYC'd exchange account, a merchant identifier visible to a domestic bank, or a subpoena'd exchange record; no public prosecution pivoted on pure on-chain clustering to identify a specific person.

**Related work and deployments:**

- **Voucher and CVA programs:** WFP SCOPE (Yemen), UNHCR cash assistance, ICRC cash transfer programming
- **Privacy infrastructure already at production:** [Railgun](https://railgun.org/) with [Private Proofs of Innocence](https://www.railgun.org/) on Ethereum mainnet, the [Tor](https://www.torproject.org/) network
- **Recipient-device prior art:** [Keycard](https://keycard.tech/) (open-source secure-element wallet), shipping EAL4+ AVA_VAN.5 secure elements (IDEMIA, Infineon, NXP, G+D)
- **Sibling protocol:** [Resilient Identity Continuity](resilient-identity-continuity.md) provides the `IResilientIdentity` enrollment layer that this use case depends on

## 3) Actors

Funder (humanitarian donor or program operator) · Recipient (beneficiary in target jurisdiction) · Implementing Partner (field distribution and recipient enrollment) · Identity Layer Operator (publishes per-epoch cohort roots; organizationally separate from the implementing partner) · Relay Operator (decrypts vouchers and submits SNARK-bearing claim transactions) · Off-Ramp (local agent network, MTO, or exchange; outside the protocol's trust boundary) · Adversary (state actor, successor regime, compelled intermediary)

## 4) Problems

### Problem 1: Compelled-partner data transfer and successor-regime database inheritance

The implementing partner that handles field enrollment and distribution holds beneficiary records that have been the dominant compelled-disclosure surface in the public record (Rohingya, Yemen WFP SCOPE, Thailand). Database inheritance after state transition has been documented in Afghanistan 2021, Syria December 2024, Ukraine occupied territories, and Iraq Mosul 2014 to 2017. A protocol that relies on the implementing partner's database surviving the threat surface is not viable.

**Requirements:**

- **Must:** No central beneficiary list at the on-chain funder layer; per-epoch identity layer that produces only commitments, not direct identity-to-claim mappings
- **Must:** Organizational separation between the identity-layer operator and the implementing partner running field distribution, enforced through distinct legal entities, jurisdictions, personnel, and infrastructure
- **Must:** Forward secrecy on per-epoch signing keys so a successor regime seizing current state cannot retroactively identify past claimants
- **Must hide:** Recipient-to-claim mapping at every component the adversary can compel
- **Public OK:** Aggregated cohort root, cohort size, round headers, claim transactions
- **Constraints:** Re-enrollment after device loss must not recreate a compellable beneficiary registry

### Problem 2: Off-ramp KYC linkage and chain-trace identification

Russia's FBK prosecutions (100+ cases), the Nobitex 2025 KYC dump, the Israeli NBCTF freeze of 189 accounts, and 260+ China OTC cases all combined on-chain trace with off-ramp KYC to identify specific individuals. The off-ramp KYC pivot is the dominant deanonymization vector when chain analytics by itself is insufficient.

**Requirements:**

- **Must hide:** Linkage between recipient identity and any individual disbursement event at the on-chain layer
- **Must:** Recipient receives funds at addresses unpredictable to chain observers without holding the recipient's secret
- **Must:** k-anonymity within a shielded pool's association set, with `k` large enough to render the off-ramp KYC pivot non-actionable
- **Must:** Recipient retains multiple independent redemption paths (multiple relays, jurisdictionally diverse)
- **Public OK:** Round-level aggregates; pool-level anonymity-set size
- **Constraints:** Off-ramp behavior is outside the protocol; the protocol provides unlinkability only up to the unshield event

### Problem 3: Account freezes, wholesale rail de-risking, and weaponized civil identity

Account freezes at scale (Nigeria EndSARS 2020, Belarus 2020 to 2024, Iran Mahsa Amini 2022 to 2023, Turkey Bank Asya 2016) and wholesale rail de-risking (Somali MTO 2013 to 2015, Afghanistan WU/MG 2021, Muslim charity de-banking 2014 to 2022) demonstrate that traditional rails fail under sustained political pressure. Weaponized state civil-identity data (Xinjiang IJOP, Turkey ByLock, India Aadhaar in Jharkhand, Pakistan NADRA) shows that identity-layer dependencies on state-issued artifacts collapse when the state is the adversary.

**Requirements:**

- **Must:** Recipient continues to receive funds when traditional rails are denied or frozen wholesale
- **Must not:** Bind enrollment to any state-issued civil-identity artifact (national ID, biometric registration, refugee-registration number) as the authoritative primitive
- **Must:** Identity layer interface is opaque (any conforming implementation works); implementing partner is replaceable; relays are permissionless
- **Public OK:** Identity layer's commitment publication; relay roster
- **Constraints:** Some operating jurisdictions deny all Ethereum-capable transports concurrently; the protocol does not route around jurisdiction-wide denial of every path

### Problem 4: Device seizure, cyber-breach, targeted spyware, physical observation

Mobile forensics (HIIDE Afghanistan 2021, Cellebrite in Hong Kong and Belarus) extract material from nominally tamper-resistant devices under specific conditions. Cyber breaches of humanitarian infrastructure (ICRC 2022, UN Geneva 2019, UNICEF Agora 2019, USAID Nobelium 2021) hand adversaries archives of beneficiary data. Targeted spyware (Pegasus, Predator, QuaDream) compromises aid workers, journalists, and human-rights defenders. Physical observation at distribution points (Xinjiang IJOP mosque-attendance tracking, Syria mukhabarat bread-line monitoring, Rohingya camp watcher networks) deanonymizes recipients without breaking any cryptographic property.

**Requirements:**

- **Must:** Tamper-resistant recipient device (EAL4+ AVA_VAN.5 baseline) with cryptographic-grade secure erase between epochs
- **Must:** Forward secrecy on per-epoch keys so seizure at epoch `i+1` does not expose past claims (forward secrecy is on the epoch hash chain; long-lived recipient secrets remain a bounded-seizure residual)
- **Must:** No persistent beneficiary-identifying data on infrastructure that can be cyber-breached at the on-chain layer
- **Must:** Issuer-backed re-enrollment after device loss; retired identity excluded from future cohort roots
- **Should:** Mesh delivery to reduce temporal correlation between physical recipient presence and on-chain claim
- **Constraints:** The protocol does not address watcher networks at distribution points; physical operational security (site selection, agent vetting) is a separate deployment layer
- **Constraints:** Recipient coercion (rubber-hose) produces a valid voucher indistinguishable from a voluntary one; duress-key constructions are out of scope

## 5) Recommended Approaches

| Challenge | Strategy | Key Property |
| --- | --- | --- |
| Compelled-partner separation | Organizational + cryptographic separation between identity layer and field distribution | Co-located deployments collapse the threat-model coverage |
| Off-ramp unlinkability | Recipient-derived destinations + shielded-pool unshield + relay-side anonymous transport | k-anonymity within the pool's association set bounds the off-ramp KYC pivot |
| Recipient device under seizure | Forward-secure hash chain on smartcard + transactional secure-erase + issuer-backed re-enrollment | Past-claim unlinkability holds against an adversary whose disclosure channel is the seized card and public on-chain data |
| Recipient ZK-incapable | Relay-mediated proving with submitter-bound public input | Front-runner who lifts a proof off the mempool cannot re-submit; relay sees voucher contents but no recipient identity |
| Recipient offline | Mesh / store-and-forward voucher submission with source-fingerprinting mitigations | End-to-end (recipient-to-relay) confidentiality; transport tolerates high latency |

See [Approach: Private Payments, Section G](../approaches/approach-private-payments.md#g-resilient-disbursement-rails-adversarial-jurisdiction-recipients) for detailed architecture and trade-offs.

## 6) Open Questions

1. **Relay economic recovery model:** The protocol specification declares this out of scope. Each candidate (commission encoded in round header, L2 settlement to amortize gas, funder reimbursement off-protocol) has distinct privacy consequences; without a follow-on document the protocol is not production-shippable.
2. **On-card audit-friendly view-key extension:** Recipient-derived destinations have no view-key split. Can a view-only credential be added without re-introducing an interactive sender step or a published recipient pubkey?
3. **Smartcard supply-chain attestation:** Reproducible builds, multi-party signing of applet-loading keys, perso-bureau personnel vetting. What attestation suffices for donor-policy CC composite evaluation?
4. **Cross-cohort metadata leakage:** Funder identity, cohort-size evolution, and round cadence fingerprint deployments. How aggressively should funders rotate on-chain identities or pool multiple programs?
5. **Forced-withdrawal interaction with stealth destinations:** When relays are unavailable and the recipient must use an L1 escape hatch, can the recipient still hit an unlinkable destination, or does forced exit collapse to a publicly visible destination?
6. **Re-enrollment authenticator compellability:** Realistic authenticators (biometric re-capture, community attestation graph, document fallback, recovery-token registry) each recreate a party that holds compellable state somewhere. What mechanism minimizes this surface in practice?

## 7) Notes And Links

- **Spec:** Resilient Disbursement Rails Protocol Specification (April 2026, draft)
- **PoC:** Forthcoming (sibling to the [Resilient Private Identity PoC](https://github.com/ethereum/iptf-pocs/tree/master/pocs/private-identity/resilient-private-identity))
- **Sibling Use Case:** [Resilient Identity Continuity](resilient-identity-continuity.md)
- **Approach:** [Private Payments, Section G](../approaches/approach-private-payments.md#g-resilient-disbursement-rails-adversarial-jurisdiction-recipients); identity-layer dependency: [Private Identity, Section F](../approaches/approach-private-identity.md#f-issuer-independent-enrollment-via-distributed-oprf)
- **Standards:** [RFC 6979](https://www.rfc-editor.org/rfc/rfc6979) (deterministic ECDSA), [EIP-2](https://eips.ethereum.org/EIPS/eip-2) (canonical-s), [NIST SP 800-88](https://csrc.nist.gov/publications/detail/sp/800-88/rev-1/final) (media sanitization), [BSI-CC-PP-0084](https://www.bsi.bund.de/dok/CC-PP-0084) (smartcard SE protection profile)
- **Related Patterns:** [Forward-Secure Signatures](../patterns/pattern-forward-secure-signatures.md), [Recipient-Derived Receive Addresses](../patterns/pattern-recipient-derived-receive-addresses.md), [Relay-Mediated Proving](../patterns/pattern-relay-mediated-proving.md), [Mesh Store-and-Forward Submission](../patterns/pattern-mesh-store-forward-submission.md), [Shielding](../patterns/pattern-shielding.md), [Network-Level Anonymity](../patterns/pattern-network-anonymity.md), [Proof of Innocence](../patterns/pattern-proof-of-innocence.md), [Forced Withdrawal](../patterns/pattern-forced-withdrawal.md), [Private MTP Auth](../patterns/pattern-private-mtp-auth.md)
- **Humanitarian References:** [CALP Network: Programme Quality Toolbox](https://www.calpnetwork.org/), [Sphere Handbook: Cash/Voucher Minimum Standards](https://spherestandards.org/), [ICRC Handbook on Data Protection in Humanitarian Action (2nd ed, 2020)](https://www.icrc.org/en/data-protection-humanitarian-action-handbook)
- **Adversary Capability Catalog (2013 to 2026):** Compiled in the protocol specification's threat model. Full incident catalog spans Rohingya 2018 to 2021, Yemen WFP SCOPE 2019, Thailand 2023 to 2024, Afghanistan 2021, Syria December 2024, Ukraine occupied territories 2022+, Iraq Mosul 2014 to 2017, Kraken IRS John Doe 2023, Coinbase transparency reports 2022 to 2023, Russia FBK donor prosecutions, ICRC 2022, UN Geneva 2019, UNICEF Agora 2019, USAID Nobelium 2021, Nigeria EndSARS 2020, Belarus 2020 to 2024, Iran Mahsa Amini 2022 to 2023, Turkey Bank Asya 2016, Somali MTO 2013 to 2015, Afghanistan WU/MG 2021, Muslim charity de-banking 2014 to 2022, Russia FBK 100+ prosecutions, Nobitex 2025 KYC dump, Israeli NBCTF 189 accounts, China OTC 260+ cases, Pegasus, Predator, QuaDream, HIIDE Afghanistan 2021, Cellebrite in Hong Kong and Belarus, Xinjiang IJOP, Turkey ByLock, India Aadhaar (Jharkhand), Pakistan NADRA
- **Allies:** Humanitarian donors and implementers (ICRC, UN agencies, NGO consortia), [CALP Network](https://www.calpnetwork.org/), privacy infrastructure operators ([Railgun](https://railgun.org/), [Privacy Pools](https://privacypools.com/), [Hinkal](https://hinkal.pro/), [Tor Project](https://www.torproject.org/), [Nym](https://nymtech.net/), [Briar](https://briarproject.org/), [Meshtastic](https://meshtastic.org/))
