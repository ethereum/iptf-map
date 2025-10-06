---
title: "Pattern: Confidential ERC-20 on privacy L2 (FHE) + ERC-7573 DvP"
status: ready
maturity: pilot
works-best-when:
  - Identities can be public but amounts/positions must be private.
  - Daily (or intraday) settlement economics matter.
avoid-when:
  - You must run entirely on L1 or cannot operate an fhEVM-style co-processor.
dependencies:
  - ERC-3643
  - ERC-7984
  - ERC-7573
  - EIP-4844
  - EAS
---

## Intent
Issue/trade a permissioned bond whose **balances and transfer amounts are encrypted** on a privacy-enabled EVM (FHE). Keep bank identities public, hide figures. Settle cash↔asset **atomically** via ERC-7573.

## Ingredients
- **Standards**: ERC-3643 (eligibility), ERC-7984 (confidential ERC-20), ERC-7573 (DvP)
- **Infra**: Privacy L2 with fhEVM; EUR stablecoin on L1/L2
- **Off-chain**: KMS/threshold keys; EAS for KYC/access logs

## Protocol (concise)
1. Whitelist investors (ERC-3643) with EAS attestations.
2. Wrap bond as **confidential ERC-20**; encrypted balances/amounts.
3. RFQ off-chain (optionally encrypted route).
4. Escrow cash and asset legs.
5. **ERC-7573** finalizes **atomically**; failures revert both legs.
6. Regulator access via scoped viewing keys or predicate proofs; log via EAS.

## Guarantees
- Hides amounts/positions; identities remain public.
- Atomic DvP across domains.
- Auditable, scoped regulator disclosure.

## Trade-offs
- FHE adds latency/cost; requires batching and key governance.
- L2 dependency and fhEVM maturity.
- Delayed finality due to optimistic rollup style (FHE doesn't offer validity proof for instant settlement).

## Example
- A sells **€5m** to B; chain shows A↔B only, no figures.
- EURC finality triggers bond settlement via ERC-7573.
- Auditor receives time-boxed view of Trade #42; disclosure logged.

## See also
- pattern-dvp-erc7573.md · pattern-pretrade-privacy-shutter-suave.md · pattern-regulatory-disclosure-keys-proofs.md

## See also (external)
- ERC-3643: https://docs.erc3643.org/erc-3643
- ERC-7984 (OpenZeppelin Confidential): https://docs.openzeppelin.com/confidential-contracts/0.2/token
- ERC-7573: https://ercs.ethereum.org/ERCS/erc-7573
- EIP-4844 (blobs): https://eips.ethereum.org/EIPS/eip-4844
- EAS docs: https://easscan.org/docs