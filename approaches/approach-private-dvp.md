# Approach: Atomic Settlement with Privacy L2s

Related to:

- [private-rwa-tokenization](../use-cases/private-rwa-tokenization.md)
- [private-bonds](../use-cases/private-bonds.md)
- [private-derivatives](../use-cases/private-derivatives.md)

## Overview

Institutions need **both**:

- **Atomic DvP**: prevent partial settlement risk across cash and asset legs.
- **Privacy guarantees**: hide balances, identities, and trades while still enabling compliance.

On their own:

- **ERC-7573** → ensures atomic settlement semantics (safe DvP).
- **Private L2s** (Aztec, Aleo, fhEVM, etc.) → ensure private execution and state.

Combined:

- Institutions can issue and trade programmable private assets while settling **atomically within an L2**, or with **practical atomicity across L1 ↔ L2** using ERC-7573.

**Constraints**:

- Aligning standards across L1/L2.
- Bridging and migration overhead.
- Regulator/compliance flows add complexity (view keys, ZK audit proofs).

---

### TLDR for Personas

- **Business**: Confidential, atomic settlement reduces counterparty + information leakage risk.
- **Technical**: Combine ERC-7573 settlement flows with private L2 execution environments (Aztec, fhEVM, etc.).
- **Legal/Compliance**: Selective regulator access possible, but frameworks are not standardized yet.

---

## Architecture and Design Choices

- **Settlement**: ERC-7573 handles atomic DvP across cash/asset legs.
- **Privacy**: Assets live as private notes / encrypted balances in the L2 (ZK or FHE).
- **Compliance hooks**: Regulator access via ZK proofs, scoped viewing keys, and/or disclosure logs anchored in **EAS**.
- **Ecosystem**:
  - Vendors: Aztec, Aleo, Zama/fhEVM, EAS, stablecoin issuers.
  - Standards: ERC-3643 (eligibility), ERC-7984 (confidential ERC-20), ERC-7573 (DvP), EIP-4844 (blobs for scaling), EAS attestations.
  - Linked patterns: `pattern-dvp-erc7573.md` · `pattern-private-l2s.md`.

---

## More Details

- **Trade-offs**

  - Platform maturity risks (all private L2s in PoC/pilot).
  - Bridging complexity for L1 ↔ L2 interoperability.
  - Unclear governance for regulator access (view keys, proof standards).
  - Cross-network settlements rely on relayers/finality → not strictly synchronous atomicity.
  - If realized with an **fhEVM**, additional latency/cost overhead and delayed finality (optimistic rollup).

- **Open Questions**
  - How to standardize regulator access semantics?
  - How to manage cross-rollup or multi-L2 settlements?
  - Can compliance proofs (e.g. EAS attestations) be enforced natively inside private L2s?

---

## Example

- Bank A sells **€5m bond** to Bank B.
- Onchain only shows A↔B counterparties; trade amount hidden.
- EURC finality on L1 triggers bond settlement on the privacy L2 via ERC-7573.
- Auditor receives a time-boxed view of Trade #42, with disclosure logged in EAS.

---

## Links and Notes

- ERC-7573 spec: https://ercs.ethereum.org/ERCS/erc-7573
- Aztec docs: https://docs.aztec.network/
- Aleo: https://aleo.org/
- Zama fhEVM: https://zama.ai/fhevm
- ERC-3643: https://docs.erc3643.org/erc-3643
- ERC-7984 (Confidential ERC-20): https://docs.openzeppelin.com/confidential-contracts/0.2/token
- EIP-4844: https://eips.ethereum.org/EIPS/eip-4844
- EAS docs: https://easscan.org/docs
