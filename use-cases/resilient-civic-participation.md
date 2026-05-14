---
title: "Resilient Civic Participation"
primary_domain: Governance
secondary_domain: identity
---

## 1) Use Case

Run credentialed petitions where signatures prove eligibility under a stated criterion. Repository-governance ballots and employee-organising lists fit the same shape. Who signed has to stay private, both within a petition and across any future ones, and the outcome has to remain checkable years after the host platform shuts down. Existing platforms either publish the signed list or route eligibility through an operator; either way, the operator staying cooperative is what holds it together. Extends [Resilient Identity Continuity](resilient-identity-continuity.md) from the credential layer to the petition layer.

## 2) Additional Business Context

The European Citizens' Initiative ([ECI](https://citizens-initiative.europa.eu/)) requires 1M signatures across at least seven member states with per-state minima; today's signature-collection workflows lean on operator-mediated identity attestations and publish per-state statements as outcome evidence. Repository governance ballots on GitHub Discussions and DAO snapshots collapse eligibility to operator-side membership checks. Workplace organising-list collection in jurisdictions with explicit retaliation risk reproduces the same problem against a hostile-employer threat model. In every case, the operator step is where the compelled-disclosure pressure lands.

**Related work and prior art:**

- **Anonymous credential signaling:** [Semaphore](https://semaphore.pse.dev/), [MACI](https://maci.pse.dev/), [zk-creds (Rosenberg et al., 2023)](https://eprint.iacr.org/2022/878), [zk-promises (Shih et al., 2024)](https://eprint.iacr.org/2024/1260).
- **Petition mechanisms:** [ECI](https://citizens-initiative.europa.eu/); operator-mediated petition platforms ([Change.org](https://www.change.org/), [Avaaz](https://secure.avaaz.org/)).
- **Sibling use case:** [Resilient Identity Continuity](resilient-identity-continuity.md), which provides the credential layer.

## 3) Actors

Signer (eligible person who wants to support a petition) · Organizer (campaign, committee, or working group running it) · Credential Issuer (whoever issued the attestations that establish eligibility: a government registry, an employer, a prior identity provider, an organisation) · Verifier (anyone needing to confirm the outcome later: auditor, regulator, journalist, court, member of the public) · Adversary (subpoena issuer, successor regime, hostile employer, breach actor)

## 4) Problems

### Problem 1: Operator-mediated eligibility collapses under compelled disclosure

Existing petition platforms record signer identity, plus the evidence that established eligibility (passport scans, residency declarations, login records), in operator-held storage. A subpoena exposes it. So does a successor regime inheriting the database, or a breach exfiltrating it. In any of those, the public learns who signed which petition.

**Requirements:**

- **Must hide:** signer identity, the evidence that established eligibility, and any attribute about the signer beyond whether they met the eligibility criterion
- **Must not require:** any operator's continued cooperation for eligibility to remain checkable after the petition closes
- **Public OK:** the eligibility criterion the petition was run against, the count of signatures meeting it
- **Constraints:** eligibility is fixed at petition registration so a person made eligible after the petition opens cannot retroactively be counted

### Problem 2: Signer-level unlinkability under long-term retention

Someone might support several petitions over many years: data protection one year, labour rights the next, environmental policy a decade later. Their signatures should not be linkable to each other or back to them, even by an adversary who archives every petition's public record indefinitely. Retaliation risk for an individual signer doesn't expire, so the privacy guarantee can't either.

**Requirements:**

- **Must hide:** the link between any signer's identity and any signature they cast
- **Must hide:** the link between any two signatures by the same signer across different petitions
- **Public OK:** the count of signatures per petition, and per eligibility class where the petition declares one (e.g., per member state for ECI)
- **Constraints:** the property has to hold against an adversary who archives every petition's public record indefinitely. The achievable privacy is bounded by the population satisfying the petition's eligibility criterion

### Problem 3: Outcome verifiability after platform shutdown

The petitions that matter most outlive their hosts. A regulator, court, journalist, or future organising committee has to be able to confirm both the overall outcome and the per-class results decades after the petition closes, reading from durable public record. Publishing just an aggregate count forces the reader to trust whoever did the counting. Requiring any specific party to remain online to verify fails the moment that party shuts down.

**Requirements:**

- **Must:** the overall outcome and any per-class results are recoverable from durable public record alone
- **Must:** the outcome corresponds to the same eligibility criterion and class thresholds the Organizer published when the petition opened
- **Must not:** depend on the continued existence or cooperation of the Organizer, the Credential Issuer, or any operator
- **Public OK:** the petition's published parameters and its final outcome

### Problem 4: Forward secrecy under device seizure

A signer's device is seized after they have already supported several petitions. Without further precaution, the material on the device that enabled those past signatures lets an adversary reconstruct exactly which petitions the signer joined. For a whistleblower, dissident, or workplace organiser, the privacy guarantee collapses retroactively, after the seizure.

**Requirements:**

- **Must:** material on the signer's device that enabled past signatures is unrecoverable from any later snapshot of that device
- **Must:** the property holds against an adversary with full forensic access to the seized device
- **Must:** the signer can continue to sign future petitions from the same device; past participation remains unrecoverable
- **Constraints:** the device must be able to destroy past signing material before reuse; consumer storage media that retain prior writes (copy-on-write filesystems, SSDs without [TRIM](https://en.wikipedia.org/wiki/Trim_(computing))) degrade this property. Backups of signing material defeat the protection relative to whatever the backup contains

## 5) Recommended Approaches

| Challenge | Key Property |
| --- | --- |
| Operator-mediated eligibility | Eligibility checkable from durable public record alone, no operator in the path |
| Signer-level unlinkability | No correlation possible across petitions beyond the criterion-matching population |
| Outcome verifiability after shutdown | A future verifier needs the durable public record |
| Forward secrecy under seizure | Past participation unrecoverable from any later device snapshot |

See [**Approach: Civic Participation**](../approaches/approach-civic-participation.md) for detailed architecture and trade-offs.

## 6) Open Questions

1. **Anonymity-set sizing under criterion breadth.** The achievable privacy is bounded by how many people satisfy the petition's eligibility criterion intersected with its class partition. What floor on this population is the threshold for accepting a petition, and how does an Organizer estimate it without surveying eligible signers?
2. **Cross-petition criterion fingerprinting.** A signer who participates in multiple petitions exposes themselves to the intersection of all the criteria they meet; the privacy floor narrows with each additional petition. What disclosure or batching strategies bound this without breaking the use case?
3. **Petition durability over time.** Petitions whose signing windows are long, or whose outcome must remain re-verifiable across decades, exceed the retention windows of cheap public storage. How is durable archival paid for and operated without re-introducing an operator dependency?
4. **Class-binding semantics for non-jurisdictional partitions.** Per-member-state thresholds (ECI) are straightforward. For repository governance (per-team thresholds) or workplace organising (per-shift thresholds), what eligibility templates handle the partition without leaking signer identity?
5. **Multi-device signing under one credential.** A signer who uses several devices needs an unambiguous, retaliation-safe way to sign from each. What is the deployment guidance for organisations whose signers operate multiple devices?

## 7) Notes And Links

- **Spec:** Resilient Civic Participation Protocol Specification (draft, 2026-05)
- **Sibling Use Case:** [Resilient Identity Continuity](resilient-identity-continuity.md) (provides the credential layer)
- **Approach:** [Civic Participation](../approaches/approach-civic-participation.md)
- **Prior Art:** [Semaphore](https://semaphore.pse.dev/), [MACI](https://maci.pse.dev/), [zk-creds](https://eprint.iacr.org/2022/878), [zk-promises](https://eprint.iacr.org/2024/1260), [OpenAC](https://eprint.iacr.org/2026/251)
- **Petition Mechanisms:** [European Citizens' Initiative](https://citizens-initiative.europa.eu/), [Change.org](https://www.change.org/), [Avaaz](https://secure.avaaz.org/)
