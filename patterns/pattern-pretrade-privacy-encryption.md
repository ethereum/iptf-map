---
title: "Pattern: Pre-trade privacy (Shutter/SUAVE/private RFQ)"
status: ready
maturity: pilot
layer: hybrid
privacy_goal: Prevent front-running and information leakage via encrypted order submission
assumptions: Encrypted mempool (Shutter) or private builders (SUAVE), allow-listed counterparties
last_reviewed: 2026-01-14
works-best-when:
  - RFQ/secondary trading must not leak intent, size, or price pre-inclusion.
avoid-when:
  - You accept public mempool visibility of orders.
dependencies:
  - Encrypted mempool (Shutter) or private builders (SUAVE)
  - RFQ service
context: both
crops_profile:
  cr: low
  os: partial
  privacy: partial
  security: low
---

## Intent
Prevent **front-running and information leakage** by routing quotes/orders via **encrypted/private submission**; then settle with confidential tokens.

## Ingredients
- **Infra**: Shutter/SUAVE, allow-listed counterparties
- **Off-chain**: RFQ broker, audit of quote requests

## Protocol (concise)
1. Buyer emits RFQ off-chain; quotes returned privately.
2. Winning order submitted via encrypted route for inclusion.
3. Settlement occurs on privacy L2/L1 pool; amounts remain hidden.

## Guarantees
- No public mempool leakage of intent/size/price.
- Auditable RFQ lifecycle.

## Trade-offs
- Additional infra dependency; fallback path required.
- Latency/availability tied to privacy routing.
- **CROPS context (both)**: CR could reach `high` if threshold committee selection becomes permissionless via stake-weighted rotation. OS improves to `yes` by open-sourcing all encryption and decryption logic under copyleft. Privacy could reach `full` by encrypting quotes end-to-end until settlement confirmation, not just during the pre-trade phase. Security could reach `high` by hardening collusion resistance through key compartmentalization across independent operators. In I2I, encrypted order flow prevents counterparties and intermediaries from front-running institutional block trades. In I2U, threshold encryption protects retail orders from MEV extraction by builders or relayers.
- **Post-quantum exposure**: threshold encryption schemes (Shutter/commit-reveal) may rely on pairings broken by CRQC. Mitigation: lattice-based threshold encryption. See [Post-Quantum Threats](../domains/post-quantum.md).

## Example
- Three quotes received; best quote settles; unfilled quotes remain undisclosed.

## See also
- pattern-confidential-erc20-fhe-l2-erc7573.md · pattern-secondary-market-rfq-batched-settlement.md

## See also (external)
- Shutter docs: https://docs.shutter.network/docs/shutter/research/the_road_towards_an_encrypted_mempool_on_ethereum
- Flashbots · SUAVE overview: https://writings.flashbots.net/the-future-of-mev-is-suave
- Flashbots docs hub: https://docs.flashbots.net/