---
title: "Pattern: Private ISO 20022 Messaging & Settlement"
status: draft
maturity: research
works-best-when:
  - Institutions already exchange ISO 20022 messages (pacs.008/009/002, camt.\*).
  - On-chain settlement (ERC-20, tokenized deposits) must link to SWIFT/ISO workflows.
  - Regulators require selective audit, not full transparency.
avoid-when:
  - Institutions are not ISO-native (retail/DeFi-native apps).
  - Privacy is not a requirement (public stablecoins acceptable).
dependencies:
  - ISO 20022 schema (pacs.008/009/002, camt.\*)
  - ERC-20 / ERC-3643 (tokenized cash/RWA)
  - Optional: ERC-7573 (conditional settlement), ZK proof system
---

## Intent

Coordinate **private ERC-20 settlements** between banks using ISO 20022 as the instruction layer.  
ISO messages are linked to the cash leg, while the **cash leg itself settles privately** via a shielded mechanism (privacy L2 / shielded pool / confidential token) with regulator-only visibility.

---

## Ingredients

- **Standards**:
  - [ISO 20022 schema](https://www.iso20022.org/iso-20022-message-definitions) (pacs.008/009/002, camt.\*)
  - [ERC-20](https://eips.ethereum.org/EIPS/eip-20) / [ERC-3643](https://eips.ethereum.org/EIPS/eip-3643) (tokenized cash/RWA)
  - (Optional)[ERC-7573](https://eips.ethereum.org/EIPS/eip-7573) (conditional settlement / atomic coupling)
- **Infra**
  - Privacy settlement rail: **shielded pool** (e.g., Aztec/Railgun/Penumbra) **or** **confidential token** (e.g., fhEVM-style)
  - Rollup/validium for anchoring minimal metadata (msg type, status, coarse time bucket)
- **Off-chain**
  - ISO parsing/normalization (XML → canonical JSON)
  - KMS for bank/regulator keys; selective-disclosure service

---

## Protocol (private cash-leg variants)

### A1. Shielded Pool Settlement

1. Anchor minimal ISO metadata (e.g., `msgType`, `timeBucket`) and a **message commitment** `C_msg` on-chain.
2. Wrap/mint the ERC-20 into a **shielded pool** and hold balances as **notes**.
3. Execute a **shielded transfer** from Bank A’s note to Bank B’s note, **binding** the transfer to `C_msg` (e.g., include `C_msg` in the spend circuit).
4. Regulator holds **view keys** for scoped audits (amounts/parties/routes if needed).

### A2. Confidential Token Settlement (permissioned L2)

1. Anchor minimal ISO metadata + `C_msg`.
2. Use a **confidential ERC-20** where balances and amounts are encrypted.
3. Settlement controller authorizes a **confidential transfer** (encrypted state update) referencing `C_msg`.
4. Regulator can view via scoped keys or field-level selective reveal.

### A3. Single-Domain Private Settle (roll-in, settle, roll-out)

1. Temporarily bridge both legs to a **common privacy L2** (e.g.; Aztec).
2. Perform a **single-tx shielded DvP/PvP** referencing `C_msg`.
3. Bridge assets back to their origin chains as needed.

---

## Guarantees

- **Privacy:** cash-leg amounts and counterparties are hidden on-chain (B1/B2/B3).
- **Integrity & linkage:** settlement references `C_msg` so the cash leg is cryptographically linked to the ISO instruction.
- **Auditability:** regulator can decrypt selected fields or use view keys to audit shielded transfers.
- **Interoperability:** ISO schema provides consistent mapping across banks/corridors.

---

## Trade-offs

- Privacy rails (B1/B2) introduce **infra complexity** (shielded circuits or confidential VM) and **key governance**.
- **Signing convention** (algorithm, PKI) must be agreed (full ISO hash vs reduced settlement tuple) for on-chain authorization.
- **Cross-chain atomicity** (if the two legs span different chains) requires [**zk-SPV**](../patterns/pattern-zk-spv.md) or **single-domain execution** (B3).

---

## Example

- Bank A issues `pacs.008` “pay 10m EURC from DEUTDEFFXXX → BNPAFRPPXXX”.
- Off-chain: compute `C_msg` from the canonical ISO message.
- **B1:** Wrap EURC into a shielded pool, execute a note-to-note transfer bound to `C_msg`.  
  **or B2:** Call confidential-token transfer (encrypted state), referencing `C_msg`.  
  **or B3:** Bridge to a shared privacy L2, do one-tx shielded DvP, bridge out.
- Regulator later audits via view keys / selective disclosure.

---

## See also

- pattern-aztec-privacy-l2-erc7573.md / pattern-confidential-erc20-fhe-l2-erc7573.md (privacy rails)
- pattern-dvp-erc7573.md (conditional coupling)
- pattern-zk-spv.md (strong cross-chain atomicity)
