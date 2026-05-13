---
title: "Approach: Civic Participation"
status: draft
last_reviewed: 2026-05-13

use_case: resilient-civic-participation
related_use_cases: [resilient-identity-continuity]

primary_patterns:
  - pattern-forward-secure-pseudorandom-tree
  - pattern-blob-anchored-state-with-dispute
  - pattern-private-mtp-auth
  - pattern-zk-proof-systems
  - pattern-verifiable-attestation
supporting_patterns:
  - pattern-network-anonymity
  - pattern-focil-eip7805
  - pattern-relay-mediated-proving

open_source_implementations:
  - url: https://github.com/AztecProtocol/barretenberg
    description: "Barretenberg / UltraHonk (proving system targeted by the protocol's signer, batch, and resolution SNARKs)"
    language: C++/Rust
---

# Approach: Civic Participation

## Problem framing

### Scenario

An organising committee runs a European Citizens' Initiative needing 1M signatures across seven member states with per-state minima, and faces subpoena exposure in the petition's home jurisdiction. The committee cannot retain a signer database that outlives the petition window. Eligibility rides on EU residency and member-state attribution. Beyond that, participation has to stay unlinkable across petitions, and the outcome has to remain verifiable from L1 state after the committee dissolves. The same shape covers repository governance ballots and workplace organising lists without modification.

### Requirements

- Each signature proves eligibility under an issuer-pinned credential root with no operator in the verification path
- Signer-level participation is unlinkable across petitions and to any L1 / blob-archive observer
- The petition's outcome bit and per-class component bits are re-verifiable from L1 state alone after the host platform shuts down
- Past per-slot signer state is unrecoverable from any future device snapshot under one-way PRG security
- Mandatory class-binding partitions the threshold check by jurisdiction or group (member states for ECI, teams for repository governance, shifts for workplace organising)

### Constraints

- The signing window must close inside the EIP-4844 default blob retention (4096 epochs, about 18 days) for the dispute path to operate against every published batch without voluntary-archiver dependency
- The signer's device must honour overwrite-in-place semantics for forward secrecy; copy-on-write filesystems and SSDs without [TRIM](https://en.wikipedia.org/wiki/Trim_(computing)) degrade the bound
- Sybil resistance is delegated to the credential layer ([Resilient Identity Continuity](../use-cases/resilient-identity-continuity.md) or compatible) and not redesigned per petition
- Network-layer anonymity for signer-to-relayer submissions is delegated to Tor or an equivalent anonymity network

## Approaches

### Resilient Civic Participation Protocol

```yaml
maturity: concept
context: both
crops: { cr: high, o: yes, p: full, s: high }
uses_patterns: [pattern-forward-secure-pseudorandom-tree, pattern-blob-anchored-state-with-dispute, pattern-private-mtp-auth, pattern-zk-proof-systems, pattern-verifiable-attestation, pattern-relay-mediated-proving, pattern-network-anonymity, pattern-focil-eip7805]
example_vendors: []
```

**Summary:** A credentialed petition protocol. Per-signer forward-secure ratcheting feeds blob-anchored signature batches, and a resolution SNARK emits the outcome bit and per-class bits from chain state.

**How it works:** At credential enrollment the signer commits to a forward-secure pseudorandom tree bound through the credential. A Registry contract assigns each petition a slot; to sign, the signer proves credential membership, slot consumption, and the eligibility predicate inside a signer SNARK, then ratchets past the slot. Relayers aggregate signer proofs into a batch SNARK and publish the records on an EIP-4844 blob; the on-chain Registry advances its root. A bounded dispute window admits per-position challenges over the blob via the point-evaluation precompile under a closed violation taxonomy. After the window opens, any Resolver computes the resolution SNARK and claims the escrowed bounty.

**Trust assumptions:**
- Credential-layer Sybil resistance, delegated to [Resilient Identity Continuity](../use-cases/resilient-identity-continuity.md) or compatible
- L1 consensus, the Registry contract, and EIP-4844 blob availability through the dispute window
- Proving-system soundness (UltraHonk over BN254 KZG)
- Censorship-resistant inclusion, augmented by FOCIL ([EIP-7805](https://eips.ethereum.org/EIPS/eip-7805)) where deployed

**Threat model:**
- Passive L1 and blob-archive adversary; cross-petition linkage reduces to PRG security
- Compelled disclosure of Organizer, Relayer, Resolver, or Disputant yields only public on-chain state
- Signer device seizure after a signing slot; past per-slot values are unrecoverable under one-way PRG security
- Out of scope: live device compromise during signing; signer-side backups; transport-layer fingerprinting that beats the chosen anonymity network

**Works best when:**
- Compelled disclosure, successor-regime inheritance, or breach of operator state is in the threat model
- The petition's signing window can close inside the EIP-4844 retention margin so dispute coverage is uniform across batches
- Sybil resistance can be delegated to an issuer-pinned credential root with a 30-day minimum age

**Avoid when:**
- The deployment lacks an on-chain credential layer compatible with attribute commitments
- The signing window exceeds the EIP-4844 retention margin and voluntary blob archival is not in scope
- The signer-device fleet cannot honour overwrite-in-place storage semantics

## Comparison

| Axis | Resilient Civic Participation Protocol |
|---|---|
| **Maturity** | concept |
| **Context** | both |
| **CROPS** | CR:hi O:y P:full S:hi |
| **Trust model** | Credential issuer + L1 + blob availability |
| **Privacy scope** | Signer unlinkability within credential class; forward secrecy past slot |
| **Performance** | Batched signature aggregation; one resolution SNARK per petition |
| **Operator req.** | No (permissionless Organizer / Relayer / Resolver) |
| **Cost class** | Low (amortised per-signature; bounty pays resolution) |
| **Regulatory fit** | Strong for outcomes-only audit; credential-layer audit lives at the issuer |
| **Failure modes** | Dispute-window margin under-sizing; FSRT seed backup defeats forward secrecy |

## Persona perspectives

### Business perspective

Petitions, repository governance ballots, and employee organising lists fail the same way: the host platform retains a signer database that outlives the campaign, and that database becomes the compelled-disclosure surface. The Resilient Civic Participation Protocol checks eligibility against a stated credential, keeps signer participation unlinkable across petitions, and lets a future verifier reconstruct the outcome from L1 state after the platform shuts down. The committee escrows a bounty; Resolvers compete for it by computing the resolution SNARK, which emits the outcome bit and per-class component bits as public inputs. The deploying institution holds no signer roster and no compelled-disclosure surface. Cost moves from per-signer operator overhead to amortised batch publication plus a one-time bounty. Operator-mediated platforms apply where no credential layer is available or the deployment cannot accept the EIP-4844 retention boundary.

### Technical perspective

Engineering effort concentrates at five surfaces: the signer client with its forward-secure tree, the signer SNARK with credential-membership and predicate gadgets, the batch SNARK with cross-field decomposition between the proving curve and the blob field, the Registry contract holding roots and the bounty escrow, and the resolution SNARK over the full leaf set. The proving stack is Noir over UltraHonk, the same toolchain Aztec and several institutional pilots already build against; the blob path and dispute precompile are stock EIP-4844.

### Legal & risk perspective

This is a perspective for legal review by the deploying institution, not legal advice. Legal exposure concentrates at the credential issuer (a separate use case, [Resilient Identity Continuity](../use-cases/resilient-identity-continuity.md)) and the Organizer's predicate-selection policy, which determines what attribute predicates the signer SNARK enforces. The on-chain footprint is the Registry's per-signature nullifier, identity tag, and class tag carried over an EIP-4844 blob whose retention is finite; the durable record is the resolution SNARK and its public inputs. Whether the resolution SNARK satisfies admissibility or auditability for a specific regulatory regime is a per-jurisdiction question; the document does not claim sufficiency for any specific regime. Compelled disclosure of any non-Signer role (Organizer, Relayer, Resolver, Disputant) yields only public on-chain state.

## Recommendation

### Default

For petitions whose threat model includes compelled disclosure, successor-regime inheritance, or operator breach, default to the **Resilient Civic Participation Protocol**. Durability and dispute coverage come from the bounty-funded Resolver and the on-chain Registry; the deploying institution carries no signer roster after the petition closes.

### Decision factors

- If the deployment lacks a credential layer compatible with attribute commitments, the protocol is not deployable; use an operator-mediated platform until a credential layer is in place.
- If the signing window exceeds the EIP-4844 retention margin and voluntary archival is not in scope, the dispute path loses coverage on late batches; shorten the window or use a per-signature on-chain alternative.
- If signer devices cannot honour overwrite-in-place storage (copy-on-write filesystems, SSDs without [TRIM](https://en.wikipedia.org/wiki/Trim_(computing))), forward secrecy degrades against forensic adversaries.

## Open questions

1. **Resolver-side blob archival economics.** Petitions whose signing windows approach the 18-day EIP-4844 retention force Resolvers to archive blob payloads voluntarily. What is the production model, and how is it priced into bounty parameters?
2. **Predicate-match-count estimation without surveying the credential tree.** Organizers must size predicates so the match count, intersected with the class partition, meets the deployment's privacy floor. What is the analytical or sampling tool for this estimate that does not itself expose credential-tree structure?
3. **Slot exhaustion redeployment cadence.** The 24-bit global slot counter bounds protocol lifetime. What is the deployment-policy schedule for redeployment under a fresh contract instance, and how is signer-side re-enrollment cost amortised (issuer-side coordination, batched re-enrollment windows)?
4. **Anti-coercion under predicate disclosure.** Signers in adversarial-employer or adversarial-jurisdiction settings may be compelled to sign or to abstain. Coercion-resistant resolution (MACI-style key-change) is out of scope in this protocol's reference design. What is the integration point: pre-signing key registration, in-circuit coercion-resistance gadget, or a deployment-policy layer that selects a coercion-resistant variant?
