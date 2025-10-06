---
title: "Pattern: Programmable-privacy L2 (Aztec) + ERC-7573"
status: draft
maturity: PoC
works-best-when:
  - You want privacy as a first-class programming model with viewing keys.
  - Aztec privacy additionally include identity privacy, i.e. unlinkability, not just value privacy.
avoid-when:
  - You need GA mainnet today with conservative dependencies only.
  - May be overkill and introduce overhead if only value privacy is needed.
dependencies:
  - Aztec L2
  - ERC-7573
  - EAS
---

## Intent
Use a **privacy L2** where private notes and viewing keys are native; settle cash↔asset **atomically** with ERC-7573.

## Ingredients
- **Standards**: ERC-7573; permissioning semantics ported from ERC-3643
- **Infra**: Aztec L2; Fiat (USD, EUR, etc) stablecoin on L1/L2
- **Off-chain**: Key management; attestations for access

## Protocol (concise)
1. Whitelist investors; issue bond as private notes.
2. RFQ → private tx → settlement on Aztec.
3. Regulator access via view keys or ZK proofs; log access.

## Guarantees
- Strong privacy UX/DX; expressive ZK programmability.
- Atomic settlement via ERC-7573.

## Trade-offs
- Platform timelines/maturity risks.
- Migration planning required.

## Example
- Same trade flow as confidential ERC-20, but balances are native private notes.

## See also
- pattern-confidential-erc20-fhe-l2-erc7573.md · pattern-dvp-erc7573.md

## See also (external)
- Aztec docs: https://docs.aztec.network/
- ERC-7573 spec: https://ercs.ethereum.org/ERCS/erc-7573