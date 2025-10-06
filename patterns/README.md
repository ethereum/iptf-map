# Patterns

**What this is.** Short, reusable solution cards for common architectures (e.g., confidential ERC-20 on L2, atomic DvP). Each card is 1–2 screens using a consistent structure so teams can compare options fast.

**TODO: This folder needs to be refactored, deduped and populated more** See [PR #46](https://github.com/ethereum/iptf-pm/pull/46) for some work

**How to use.** When a design is repeatable, add `pattern-*.md` using the template below. Keep it concise: intent → protocol → guarantees → trade-offs. Cross-link related patterns and any live PoCs.
- Template: [`_template.md`](./_template.md)
- Naming: `pattern-<slug>.md` (kebab-case)
- Status flow: `draft` → `ready` (update `maturity` as you pilot/ship)

---

## Patterns to consider (stubs)
(Add later; 1–2 screens each.)
- `pattern-secondary-market-rfq-batched-settlement.md` — Private RFQ + **batch settle** (cost/leakage win).
- `pattern-key-management-threshold-kms.md` — **Threshold keys**, rotation, escrow, emergency revoke.
- `pattern-cash-leg-eur-stablecoin-vs-mmf.md` — **EURC vs tokenized MMF/deposit tokens** for cash leg.
- `pattern-derivative-daily-settlement-erc6123.md` — Daily accrual/settlement semantics.
- `pattern-performance-batching-blob-costing.md` — Batching, blobs, proof cadence, SLOs.
- `pattern-eligibility-attestations-eas-erc3643.md` — EAS + ERC-3643 eligibility/KYC flows.
- `pattern-policy-data-classification.md` — Map ICMA BDT fields → **Public / Confidential / Reg-only**.

---

## Adjacency patterns (useful, but not sufficient alone)
Neutral notes on approaches folks often suggest; pair them with core patterns as needed.
- `pattern-adj-railgun-shielded-transactions.md` — Shielded DeFi; lacks issuer lifecycle, enforced regulator access, DvP.
- `pattern-adj-private-consortium-ledger.md` — Strong closed-network privacy; trade-offs vs public settlement/composability.
- `pattern-adj-htlc-cross-domain-swap.md` — Simple atomic swaps; brittle for regulated cross-domain DvP.
- `pattern-adj-delayed-post-trade-reporting.md` — Batch reports; needs on-demand audit & anchors to fit bonds.

> For vendors that complement patterns (compliance orchestration, enterprise privacy stacks, etc.), see **`/vendors/README.md`**. Keep vendor notes neutral and link *back* to patterns (not vice-versa).
