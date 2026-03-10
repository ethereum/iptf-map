---
title: "Pattern: <short name>"
status: draft|ready
maturity: PoC|pilot|prod
works-best-when: <bulleted, 1–3 lines>
avoid-when: <bulleted, 1–3 lines>
dependencies: [ERC-3643, EIP-7573, EAS, ...]
crops_profile:
  cr: high|medium|low|none       # censorship resistance impact
  os: yes|partial|no             # open source and free (source availability, forkability, exit paths)
  privacy: full|partial|none     # privacy guarantees (who sees what — see CONTRIBUTING.md § Privacy)
  security: high|medium|low       # strength of security guarantees (see CROPS.md)
  context: i2i|i2u|both          # applicable relationship type
---

## Intent
One short paragraph: the job this pattern does.

## Ingredients
- Standards/ER(C|IP)s
- Infra (L1/L2, wallets, oracles)
- Off-chain services (KMS, registry, RFQ, etc.)

## Protocol (concise)
Numbered steps (5–8 max) from intent → settlement/audit.

## Guarantees
- What it hides / proves
- Atomicity / finality
- Audit & ops signal

## Trade-offs
- Performance / cost / DX notes
- Failure modes & mitigations

## Example
“Bank A sells €5m zero-coupon to Bank B…” — 3–5 bullets showing flow.

## See also
Cross-link to related pattern cards.
