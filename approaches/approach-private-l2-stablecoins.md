# Approach: Private Stablecoin Payments on Private L2s

Related to:

- [private-stablecoins](../use-cases/private-stablecoins.md)

## Overview

Institutions need a way to **transfer value privately** using stablecoins on public blockchains — hiding transaction details such as **amounts, payees, and counterparties** while preserving **regulatory auditability**.

This enables confidential treasury operations, margin movements, and settlement between regulated entities.

**Private Layer-2s** (e.g., Aztec, Fhenix, Zama-based rollups) allow these transfers to occur **privately across institutions**, while still benefiting from Ethereum’s settlement guarantees.  
They can also integrate with **traditional financial networks** — for example, by deploying interpreter contracts on private L2s that bridge on-chain transfers with **SWIFT messages** (ISO20022), custodial systems, or off-chain accounting frameworks.

### TLDR for Personas

- **Business**: Enable private value transfers between institutions; hide trade flows or margin movements from competitors.
- **Technical**: Deploy stablecoin contracts and settlement logic on private L2s; (optional) integrate with ERC-7573 for atomic DvP/PvP; (optional) write **SWIFT ISO20022 interpreter** contracts.
- **Legal/Compliance**: Allow regulator access through logged viewing keys, attestations, or proof-based disclosures.

---

## Architecture and Design Choices

- **Privacy Layer**: Deploy or use stablecoin contracts on privacy-enabled L2s (e.g., Aztec, Fhenix, Zama-based).
- **Settlement Layer**: Can rely on simple ERC-20 transfers within the private L2, or optionally use ERC-7573 for atomic DvP/PvP across assets.
- **Eligibility / Access Control**: Leverage ERC-3643 for whitelisting and KYC-compliant onboarding.
- **Auditability**: Use EAS or on-chain attestations for regulator proofs and disclosure logging.

**Design Considerations**

- How private is the rollup? (encrypted calldata, off-chain viewing keys, hybrid modes)
- Does the rollup preserve ERC-20 composability and bridging?
- What data remains public (state commitments, fees, etc.)?

See also:

- [`pattern-iso20022.md`](../patterns/pattern-shielding.md)
- [`pattern-private-l2s.md`](../patterns/pattern-private-l2s.md)

---

## More Details

### Trade-offs

- Higher transaction latency and costs due to encryption/ZK proofs.
- Limited composability between private and public domains.
- Operational complexity in regulator key management and disclosures.

### Open Questions

- What privacy baseline should be required for institutional deployments?
- How to ensure consistent interoperability between private and public chains?

---

## Example

- A regulated fund transfers collateralized USDC between desks on a private L2 (e.g., Aztec).  
  Regulators can later audit through EAS-logged proof disclosures, while competitors cannot observe flows.

---

## Links and Notes

- [Aztec Docs](https://docs.aztec.network/)
- [Zama Confidential ERC-20](https://www.zama.ai/post/confidential-erc-20-tokens-using-homomorphic-encryption)
- [Fhenix Overview](https://blog.arbitrum.io/fhenix-private-computation/)
