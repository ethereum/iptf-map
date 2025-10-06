# Approach: Private Stablecoin Payments via Shielding

Related to:

- [private-stablecoins](../use-cases/private-stablecoins.md)

## Overview

Institutions need a way to **transfer value privately** using stablecoins on public blockchains — hiding transaction details such as **amounts, payees, and counterparties** while preserving **regulatory auditability**.
This enables confidential treasury operations, margin movements, and settlement between regulated entities.

Shielded stablecoin transfers allow value to move **privately across institutions**, and can extend naturally to **DvP/PvP** use cases when combined with atomic settlement standards.

### TLDR for Personas

- **Business**: Enable private value transfers between institutions; hide trade flows or margin movements from competitors.
- **Technical**: Wrap stablecoin in a shielded ERC-20; (optional) combine with ERC-7573 for atomic DvP/PvP settlement.
- **Legal/Compliance**: Allow regulator access through logged viewing keys or proof-based disclosures.

## Architecture and Design Choices

- **Shielding**: Use `pattern-shielding.md`.
- **Settlement**: Atomic PvP (cash↔cash) or DvP (cash↔asset) via ERC-7573.
- **Eligibility**: ERC-3643 for whitelisting participants.
- **Audit**: EAS attestations log disclosures.

## More Details

- **Trade-offs**
  - Higher cost/latency from ZK/FHE proofs.
  - Privacy L2s may not support ERC-20 composability out-of-the-box.
  - Must integrate regulator access governance.
- **Open Questions**
  - Standardize regulator access semantics?
  - How to integrate shielding with existing stablecoin issuers?

## Example

- Dealer pays weekend repo margin in shielded USDC on Aztec. Counterparty sees funds, regulator later audits via EAS-logged disclosure.

## Links and Notes

- Canton weekend repo: https://www.canton.network/canton-network-press-releases/digital-asset-complete-on-chain-us-treasury-financing
- Aztec docs: https://docs.aztec.network/
- Zama confidential ERC-20: https://www.zama.ai/post/confidential-erc-20-tokens-using-homomorphic-encryption
- Fhenix overview: https://blog.arbitrum.io/fhenix-private-computation/
