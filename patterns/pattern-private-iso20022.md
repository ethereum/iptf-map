---
title: "Pattern: Private ISO 20022 Messaging & Settlement"
status: draft
maturity: concept
type: standard
layer: hybrid
last_reviewed: 2026-04-22

works-best-when:
  - Institutions already exchange ISO 20022 messages (pacs.008, pacs.009, pacs.002, camt.\*).
  - On-chain settlement (ERC-20, tokenized deposits) must link to existing ISO or correspondent banking workflows.
  - Regulators require selective audit, not full transparency.

avoid-when:
  - Institutions are not ISO-native (retail or DeFi-native apps).
  - Privacy is not a requirement and a public stablecoin is acceptable.

context: i2i

crops_profile:
  cr: medium
  o: partial
  p: full
  s: medium

crops_context:
  cr: "Reaches `high` when settlement runs on a single-chain shielded pool without a trusted relayer or gatekeeper. Drops to `low` when the private rail is operator-controlled or depends on a proprietary coprocessor with no open submission path."
  o: "ISO 20022 schemas are open and widely adopted. SWIFT infrastructure is licensed and proprietary. The settlement rail determines overall openness: an open shielded pool improves the score, a proprietary FHE coprocessor degrades it. Reaches `yes` only when every component, including the ISO extension carriers and the settlement rail, is open-source."
  p: "Cash-leg amounts and counterparties are hidden on-chain. The ISO instruction layer is off-chain and covered by existing bank-to-bank confidentiality practice. Metadata at intermediaries (correspondent banks that pass the message without understanding the extension) may still leak timing or existence."
  s: "Rides on the settlement rail's cryptography (zero-knowledge proofs, FHE, threshold keys) and on signing conventions agreed between banks. Reaches `high` when signing algorithms, PKI, and the ISO extension registration are formally published and jointly governed."

post_quantum:
  risk: high
  vector: "Cash-leg settlement rail typically uses EC-based zero-knowledge proofs (Groth16, PLONK/KZG) or pairing-based threshold encryption, all broken by CRQC. HNDL risk is high because correspondent-banking payloads are archived for years."
  mitigation: "Migrate the settlement rail to STARK-based shielded pools with hash commitments; use lattice-based threshold encryption for any encrypted message envelopes."

visibility:
  counterparty: [amounts, terms, identities]
  chain: [message_type, commitment, status]
  regulator: [full_tx with view keys]
  public: []

standards: [ISO-20022, ERC-20, ERC-3643, ERC-7573]

related_patterns:
  composes_with: [pattern-shielding, pattern-privacy-l2s, pattern-dvp-erc7573, pattern-regulatory-disclosure-keys-proofs]
  see_also: [pattern-crypto-registry-bridge-ewpg-eas, pattern-permissioned-ledger-interoperability]

open_source_implementations: []
---

## Intent

Coordinate private ERC-20 settlements between banks using ISO 20022 as the instruction layer. The ISO message binds to the on-chain cash leg, while the cash leg itself settles privately via a shielded mechanism (privacy L2, shielded pool, or confidential token) with regulator-only visibility.

## Components

- ISO 20022 schema and envelopes: pacs.008, pacs.009, pacs.002, camt.\* messages plus the `<SplmtryData>` extension mechanism used to carry commitments and proofs.
- Message commitment `C_msg`: hash of the canonical ISO message used to bind the settlement on-chain to the off-chain instruction.
- Private settlement rail: a shielded pool, a confidential token layer, or a privacy L2 that performs the cash-leg transfer with amounts and counterparties hidden on-chain.
- Rollup or validium anchor for minimal on-chain metadata (message type, coarse time bucket, status).
- Off-chain services: ISO parsing and canonicalization (XML to canonical JSON), KMS for bank and regulator keys, and a selective-disclosure service.
- Settlement controller: optional permissioned actor that authorizes confidential transfers on a permissioned confidential-token rail.

The shielded pool details live in `pattern-shielding`; the privacy L2 option in `pattern-privacy-l2s`; DvP coupling in `pattern-dvp-erc7573`.

## Protocol

The pattern admits three variants for the cash leg. They share steps 1 to 3 and diverge at settlement.

1. [user] Bank A issues an ISO 20022 message (e.g., `pacs.008` for a customer credit transfer) to Bank B.
2. [user] Off-chain, both banks compute `C_msg` from the canonical form of the ISO message.
3. [contract] Minimal ISO metadata and `C_msg` are anchored on a rollup or validium.
4. [contract] Variant A: the cash-leg ERC-20 is wrapped into a shielded pool and held as notes. A shielded transfer executes from Bank A's note to Bank B's note with `C_msg` bound inside the spend circuit.
5. [contract] Variant B: a confidential ERC-20 with encrypted balances executes a confidential transfer authorized by the settlement controller, referencing `C_msg`.
6. [contract] Variant C: both cash legs are temporarily bridged to a shared privacy L2. A single shielded DvP or PvP transaction referencing `C_msg` executes, then assets bridge back to their origin chains.
7. [regulator] The supervisor holds view keys for scoped audits (amounts, parties, routes as needed) and can decrypt selected fields or inspect shielded transfers.

The commitment and any zero-knowledge proof can be embedded in the ISO message using `<SplmtryData>`, with `<PlcAndNm>` pointing to the extended element. ISO 20022's "can ignore" semantics mean intermediaries that do not support the extension process the message normally, while endpoints that understand it verify the proof.

## Guarantees & threat model

Guarantees:

- Privacy: cash-leg amounts and counterparties are hidden on-chain.
- Integrity and linkage: settlement references `C_msg` so the cash leg is cryptographically tied to the ISO instruction.
- Auditability: regulators can decrypt selected fields or use view keys to audit shielded transfers.
- Interoperability: ISO schema provides consistent mapping across banks and corridors.

Threat model:

- Settlement rail soundness (zero-knowledge proof system, FHE scheme, or confidential VM).
- Signing-convention agreement between banks. Algorithm choice, PKI, and canonicalization (full ISO hash versus reduced settlement tuple) must be jointly specified.
- Cross-chain atomicity under partition. Variants A and B can strand one leg if the two sides sit on different chains without an atomic bridge; variant C mitigates via single-domain execution but introduces bridge risk.
- Intermediate-correspondent exposure. Non-participating intermediaries pass the message unchanged but cannot verify the proof in transit, so they must trust endpoints to catch invalid extensions.
- Regulator key custody. Compromised view keys expose historical audit scope.

## Trade-offs

- The private rails in variants A and B add infra complexity (shielded circuits or confidential VM) and require key governance.
- Cross-chain atomicity requires zk-SPV-style bridges or single-domain execution. Two-chain designs without an atomic bridge can fail partially.
- Incremental rollout via `<SplmtryData>` "can ignore" semantics works but limits correspondent-chain visibility until endpoints upgrade.
- Formalizing the extension requires a Change Request to the relevant ISO SEG to register an Extension `MessageDefinition` for proof data as a first-class component; without this, adoption remains bilateral.

## Example

- Bank A issues `pacs.008` to pay 10m EURC from `DEUTDEFFXXX` to `BNPAFRPPXXX`.
- Off-chain, both banks compute `C_msg` from the canonical ISO message.
- Variant A: EURC is wrapped into a shielded pool and a note-to-note transfer bound to `C_msg` executes.
- Variant B: a confidential-token transfer with encrypted state references `C_msg`.
- Variant C: both legs bridge to a shared privacy L2, a single shielded DvP executes referencing `C_msg`, and assets bridge out.
- The supervisor later audits via view keys and selective disclosure.

## See also

- [ISO 20022 message definitions](https://www.iso20022.org/iso-20022-message-definitions)
- [ISO 20022 `<SplmtryData>` extension mechanism](https://www.iso20022.org/supplementary_data.page)
- [ERC-7573 (conditional settlement)](https://eips.ethereum.org/EIPS/eip-7573)
- [ERC-3643 (tokenized RWA)](https://eips.ethereum.org/EIPS/eip-3643)
