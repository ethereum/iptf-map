---
title: "Pattern: Private PvP (cash↔cash) Settlement via ERC‑7573"
status: draft
maturity: PoC
works-best-when:
  - Two permissioned/regulated stablecoins (same L2 or cross‑L2) must settle **atomically** with **amount privacy**.
  - FX or cross‑issuer settlement requires on‑chain finality sensing and pricing.
avoid-when:
  - Bilateral netting/off‑chain wires suffice; or HTLC timeouts are acceptable.
dependencies: [ERC-7573, EAS, Chainlink Data Feeds, optional CCIP]
---

## Intent
Enable **atomic PvP (cash↔cash)** between two stablecoins while preserving **stakeholder‑only visibility** and providing **verifiable settlement** and **audit trails**—without relying on HTLC timeouts.

## Ingredients
- **Standards:** [ERC‑7573](https://ercs.ethereum.org/ERCS/erc-7573) on each leg; [EAS](https://attest.org/) for disclosure/audit attestations.
- **Oracles:** **FX/price feeds** for settlement checks (e.g., [Chainlink Data Feeds](https://docs.chain.link/data-feeds/price-feeds)).
- **Infra:** Same L2/app‑chain or cross‑L2; finality sensing/relayer if cross‑domain.
- **(Optional) Interop:** [Chainlink CCIP](https://docs.chain.link/ccip) for cross‑chain messaging/token movement where appropriate.
- **Privacy layer:** Each stablecoin uses shielded transfers (ZK/FHE) or lives on a privacy L2 (see related pattern).

## Protocol (concise)
1. **Quote & terms:** Parties agree PvP notional and FX rate (if cross‑currency), referenced via oracle feed ID.
2. **Prepare escrows:** Each side escrows shielded stablecoin under **ERC‑7573** conditions: "release if other leg finalized at or above X units per oracle at T."
3. **Finalize leg A:** Detect finality on A's chain; produce proof/message to leg B.
4. **Release leg B:** Upon proof and price check, B's escrow releases to counterparty.
5. **Symmetric completion:** Both legs either settle or both revert; on failure, runbooks handle retry/cancel.
6. **Selective disclosure:** Log regulator access via **EAS** attestations; no public amounts leaked.

## Guarantees
- **Atomicity:** True cash↔cash atomic settlement; no HTLC timeouts.
- **Privacy:** Amounts and counterparties remain private to stakeholders; only oracle verdicts and minimal anchors are public.
- **Audit:** Disclosures are scoped and logged (EAS); replayable proofs of settlement.

## Trade-offs
- **Oracle trust:** FX checks rely on oracle security and update cadence.
- **Complexity:** Cross‑L2 finality sensing and failure handling add ops overhead.
- **Liquidity:** Fragmentation across issuers/L2s; consider market‑making facilities.

## Example
- **USDc(L2‑A)** ↔ **EURc(L2‑B)**: Bank A pays USDc; Bank B pays EURc. **ERC‑7573** escrows on both sides reference **EUR/USD** price feed. When A's transfer finalizes and oracle confirms rate within tolerance, B's leg releases atomically; selective disclosure granted to auditor for both legs.

## See also
- `pattern-private-stablecoin-shielded-payments.md`
- `pattern-dvp-erc7573.md`
- `pattern-l2-encrypted-offchain-audit.md`

## References
- ERC‑7573 spec: <https://ercs.ethereum.org/ERCS/erc-7573>
- Chainlink Data Feeds (FX): <https://docs.chain.link/data-feeds/price-feeds>
- Chainlink CCIP (messaging): <https://docs.chain.link/ccip>