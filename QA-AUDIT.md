# IPTF Map - Q2 2026 QA Audit

> **Goal:** Verify every content file in the map for accuracy, completeness, and consistency.
> **Period:** Q2 2026 (April - June)

## How to use this tracker

For each file, update the row when audited:

| Column | Values |
|--------|--------|
| **Status** | `pending` / `ok` / `needs-fix` / `deprecated` |
| **Reviewer** | GitHub handle of who audited it |
| **Date** | Date of review (YYYY-MM-DD) |
| **Notes** | Brief issues found or "LGTM" |

**What to check per file:**
- [ ] Frontmatter is complete and valid (required fields present)
- [ ] Content follows its directory template
- [ ] Cross-references (links to other patterns, approaches, vendors) are valid
- [ ] Terminology matches GLOSSARY.md
- [ ] Tone is factual and neutral (no marketing language)
- [ ] Content is technically accurate and up-to-date
- [ ] Word count within limits (patterns: warn >800, error >1500)

---

## Progress Summary

| Section | Total | OK | Needs Fix | Deprecated | Pending |
|---------|-------|----|-----------|------------|---------|
| Patterns | 54 | 0 | 0 | 0 | 54 |
| Use Cases | 20 | 0 | 0 | 0 | 20 |
| Approaches | 10 | 0 | 0 | 0 | 10 |
| Domains | 7 | 0 | 0 | 0 | 7 |
| Jurisdictions | 7 | 0 | 0 | 0 | 7 |
| Vendors | 23 | 0 | 0 | 0 | 23 |
| **Total** | **121** | **0** | **0** | **0** | **121** |

---

## Patterns (54)

| # | File | Status | Reviewer | Date | Notes |
|---|------|--------|----------|------|-------|
| 1 | [pattern-co-snark.md](patterns/pattern-co-snark.md) | `pending` | | | |
| 2 | [pattern-commit-and-prove.md](patterns/pattern-commit-and-prove.md) | `pending` | | | |
| 3 | [pattern-compliance-monitoring.md](patterns/pattern-compliance-monitoring.md) | `pending` | | | |
| 4 | [pattern-cross-chain-privacy-bridge.md](patterns/pattern-cross-chain-privacy-bridge.md) | `pending` | | | |
| 5 | [pattern-crypto-registry-bridge-ewpg-eas.md](patterns/pattern-crypto-registry-bridge-ewpg-eas.md) | `pending` | | | |
| 6 | [pattern-dvp-erc7573.md](patterns/pattern-dvp-erc7573.md) | `pending` | | | |
| 7 | [pattern-eil.md](patterns/pattern-eil.md) | `pending` | | | |
| 8 | [pattern-erc3643-rwa.md](patterns/pattern-erc3643-rwa.md) | `pending` | | | |
| 9 | [pattern-focil-eip7805.md](patterns/pattern-focil-eip7805.md) | `pending` | | | |
| 10 | [pattern-hybrid-public-private-modes.md](patterns/pattern-hybrid-public-private-modes.md) | `pending` | | | |
| 11 | [pattern-icma-bdt-data-model.md](patterns/pattern-icma-bdt-data-model.md) | `pending` | | | |
| 12 | [pattern-l2-encrypted-offchain-audit.md](patterns/pattern-l2-encrypted-offchain-audit.md) | `pending` | | | |
| 13 | [pattern-l2-privacy-evaluation.md](patterns/pattern-l2-privacy-evaluation.md) | `pending` | | | |
| 14 | [pattern-lean-ethereum.md](patterns/pattern-lean-ethereum.md) | `pending` | | | |
| 15 | [pattern-modular-privacy-stack.md](patterns/pattern-modular-privacy-stack.md) | `pending` | | | |
| 16 | [pattern-mpc-custody.md](patterns/pattern-mpc-custody.md) | `pending` | | | |
| 17 | [pattern-native-account-abstraction.md](patterns/pattern-native-account-abstraction.md) | `pending` | | | |
| 18 | [pattern-network-anonymity.md](patterns/pattern-network-anonymity.md) | `pending` | | | |
| 19 | [pattern-noir-private-contracts.md](patterns/pattern-noir-private-contracts.md) | `pending` | | | |
| 20 | [pattern-oif.md](patterns/pattern-oif.md) | `pending` | | | |
| 21 | [pattern-origin-locked-confidential-ledger.md](patterns/pattern-origin-locked-confidential-ledger.md) | `pending` | | | |
| 22 | [pattern-permissioned-ledger-interoperability.md](patterns/pattern-permissioned-ledger-interoperability.md) | `pending` | | | |
| 23 | [pattern-permissionless-spend-auth.md](patterns/pattern-permissionless-spend-auth.md) | `pending` | | | |
| 24 | [pattern-plasma-stateless-privacy.md](patterns/pattern-plasma-stateless-privacy.md) | `pending` | | | |
| 25 | [pattern-pretrade-privacy-encryption.md](patterns/pattern-pretrade-privacy-encryption.md) | `pending` | | | |
| 26 | [pattern-privacy-l2s.md](patterns/pattern-privacy-l2s.md) | `pending` | | | |
| 27 | [pattern-private-iso20022.md](patterns/pattern-private-iso20022.md) | `pending` | | | |
| 28 | [pattern-private-mtp-auth.md](patterns/pattern-private-mtp-auth.md) | `pending` | | | |
| 29 | [pattern-private-pvp-stablecoins-erc7573.md](patterns/pattern-private-pvp-stablecoins-erc7573.md) | `pending` | | | |
| 30 | [pattern-private-set-intersection-circuit.md](patterns/pattern-private-set-intersection-circuit.md) | `pending` | | | |
| 31 | [pattern-private-set-intersection-dh.md](patterns/pattern-private-set-intersection-dh.md) | `pending` | | | |
| 32 | [pattern-private-set-intersection-fhe.md](patterns/pattern-private-set-intersection-fhe.md) | `pending` | | | |
| 33 | [pattern-private-set-intersection-oprf.md](patterns/pattern-private-set-intersection-oprf.md) | `pending` | | | |
| 34 | [pattern-private-shared-state-cosnark.md](patterns/pattern-private-shared-state-cosnark.md) | `pending` | | | |
| 35 | [pattern-private-shared-state-fhe.md](patterns/pattern-private-shared-state-fhe.md) | `pending` | | | |
| 36 | [pattern-private-shared-state-tee.md](patterns/pattern-private-shared-state-tee.md) | `pending` | | | |
| 37 | [pattern-private-stablecoin-shielded-payments.md](patterns/pattern-private-stablecoin-shielded-payments.md) | `pending` | | | |
| 38 | [pattern-private-transaction-broadcasting.md](patterns/pattern-private-transaction-broadcasting.md) | `pending` | | | |
| 39 | [pattern-private-vaults.md](patterns/pattern-private-vaults.md) | `pending` | | | |
| 40 | [pattern-regulatory-disclosure-keys-proofs.md](patterns/pattern-regulatory-disclosure-keys-proofs.md) | `pending` | | | |
| 41 | [pattern-safe-proof-delegation.md](patterns/pattern-safe-proof-delegation.md) | `pending` | | | |
| 42 | [pattern-shielding.md](patterns/pattern-shielding.md) | `pending` | | | |
| 43 | [pattern-stealth-addresses.md](patterns/pattern-stealth-addresses.md) | `pending` | | | |
| 44 | [pattern-tee-based-privacy.md](patterns/pattern-tee-based-privacy.md) | `pending` | | | |
| 45 | [pattern-tee-key-manager.md](patterns/pattern-tee-key-manager.md) | `pending` | | | |
| 46 | [pattern-tee-network-anonymity.md](patterns/pattern-tee-network-anonymity.md) | `pending` | | | |
| 47 | [pattern-tee-zk-settlement.md](patterns/pattern-tee-zk-settlement.md) | `pending` | | | |
| 48 | [pattern-threshold-encrypted-mempool.md](patterns/pattern-threshold-encrypted-mempool.md) | `pending` | | | |
| 49 | [pattern-tls-payment-bridge.md](patterns/pattern-tls-payment-bridge.md) | `pending` | | | |
| 50 | [pattern-verifiable-attestation.md](patterns/pattern-verifiable-attestation.md) | `pending` | | | |
| 51 | [pattern-voprf-nullifiers.md](patterns/pattern-voprf-nullifiers.md) | `pending` | | | |
| 52 | [pattern-zk-kyc-ml-id-erc734-735.md](patterns/pattern-zk-kyc-ml-id-erc734-735.md) | `pending` | | | |
| 53 | [pattern-zk-proof-systems.md](patterns/pattern-zk-proof-systems.md) | `pending` | | | |
| 54 | [pattern-zk-tls.md](patterns/pattern-zk-tls.md) | `pending` | | | |

## Use Cases (20)

| # | File | Status | Reviewer | Date | Notes |
|---|------|--------|----------|------|-------|
| 1 | [private-bonds.md](use-cases/private-bonds.md) | `pending` | | | |
| 2 | [private-commodities.md](use-cases/private-commodities.md) | `pending` | | | |
| 3 | [private-corporate-bonds.md](use-cases/private-corporate-bonds.md) | `pending` | | | |
| 4 | [private-derivatives.md](use-cases/private-derivatives.md) | `pending` | | | |
| 5 | [private-fx.md](use-cases/private-fx.md) | `pending` | | | |
| 6 | [private-government-debt.md](use-cases/private-government-debt.md) | `pending` | | | |
| 7 | [private-identity.md](use-cases/private-identity.md) | `pending` | | | |
| 8 | [private-messaging.md](use-cases/private-messaging.md) | `pending` | | | |
| 9 | [private-money-market-funds.md](use-cases/private-money-market-funds.md) | `pending` | | | |
| 10 | [private-oracles.md](use-cases/private-oracles.md) | `pending` | | | |
| 11 | [private-payments.md](use-cases/private-payments.md) | `pending` | | | |
| 12 | [private-procurement.md](use-cases/private-procurement.md) | `pending` | | | |
| 13 | [private-read.md](use-cases/private-read.md) | `pending` | | | |
| 14 | [private-registry.md](use-cases/private-registry.md) | `pending` | | | |
| 15 | [private-repo.md](use-cases/private-repo.md) | `pending` | | | |
| 16 | [private-rwa-tokenization.md](use-cases/private-rwa-tokenization.md) | `pending` | | | |
| 17 | [private-stablecoins.md](use-cases/private-stablecoins.md) | `pending` | | | |
| 18 | [private-stocks.md](use-cases/private-stocks.md) | `pending` | | | |
| 19 | [private-supply-chain.md](use-cases/private-supply-chain.md) | `pending` | | | |
| 20 | [private-treasuries.md](use-cases/private-treasuries.md) | `pending` | | | |

## Approaches (10)

| # | File | Status | Reviewer | Date | Notes |
|---|------|--------|----------|------|-------|
| 1 | [approach-dvp-atomic-settlement.md](approaches/approach-dvp-atomic-settlement.md) | `pending` | | | |
| 2 | [approach-privacy-standards-survey.md](approaches/approach-privacy-standards-survey.md) | `pending` | | | |
| 3 | [approach-private-bonds.md](approaches/approach-private-bonds.md) | `pending` | | | |
| 4 | [approach-private-broadcasting.md](approaches/approach-private-broadcasting.md) | `pending` | | | |
| 5 | [approach-private-derivatives.md](approaches/approach-private-derivatives.md) | `pending` | | | |
| 6 | [approach-private-identity.md](approaches/approach-private-identity.md) | `pending` | | | |
| 7 | [approach-private-money-market-funds.md](approaches/approach-private-money-market-funds.md) | `pending` | | | |
| 8 | [approach-private-payments.md](approaches/approach-private-payments.md) | `pending` | | | |
| 9 | [approach-private-trade-settlement.md](approaches/approach-private-trade-settlement.md) | `pending` | | | |
| 10 | [approach-white-label-deployment.md](approaches/approach-white-label-deployment.md) | `pending` | | | |

## Domains (7)

| # | File | Status | Reviewer | Date | Notes |
|---|------|--------|----------|------|-------|
| 1 | [custody.md](domains/custody.md) | `pending` | | | |
| 2 | [data-oracles.md](domains/data-oracles.md) | `pending` | | | |
| 3 | [funds-assets.md](domains/funds-assets.md) | `pending` | | | |
| 4 | [identity-compliance.md](domains/identity-compliance.md) | `pending` | | | |
| 5 | [payments.md](domains/payments.md) | `pending` | | | |
| 6 | [post-quantum.md](domains/post-quantum.md) | `pending` | | | |
| 7 | [trading.md](domains/trading.md) | `pending` | | | |

## Jurisdictions (7)

| # | File | Status | Reviewer | Date | Notes |
|---|------|--------|----------|------|-------|
| 1 | [cn-crypto-ban.md](jurisdictions/cn-crypto-ban.md) | `pending` | | | |
| 2 | [de-eWpG.md](jurisdictions/de-eWpG.md) | `pending` | | | |
| 3 | [eu-MiCA.md](jurisdictions/eu-MiCA.md) | `pending` | | | |
| 4 | [eu-data-protection.md](jurisdictions/eu-data-protection.md) | `pending` | | | |
| 5 | [hk-crypto-licensing.md](jurisdictions/hk-crypto-licensing.md) | `pending` | | | |
| 6 | [int-banking-secrecy.md](jurisdictions/int-banking-secrecy.md) | `pending` | | | |
| 7 | [us-SEC.md](jurisdictions/us-SEC.md) | `pending` | | | |

## Vendors (23)

| # | File | Status | Reviewer | Date | Notes |
|---|------|--------|----------|------|-------|
| 1 | [aztec.md](vendors/aztec.md) | `pending` | | | |
| 2 | [chainlink-ace.md](vendors/chainlink-ace.md) | `pending` | | | |
| 3 | [curvy.md](vendors/curvy.md) | `pending` | | | |
| 4 | [ey.md](vendors/ey.md) | `pending` | | | |
| 5 | [fairblock.md](vendors/fairblock.md) | `pending` | | | |
| 6 | [fhenix.md](vendors/fhenix.md) | `pending` | | | |
| 7 | [fireblocks.md](vendors/fireblocks.md) | `pending` | | | |
| 8 | [flashbots.md](vendors/flashbots.md) | `pending` | | | |
| 9 | [iexec.md](vendors/iexec.md) | `pending` | | | |
| 10 | [miden.md](vendors/miden.md) | `pending` | | | |
| 11 | [orion-finance.md](vendors/orion-finance.md) | `pending` | | | |
| 12 | [paladin.md](vendors/paladin.md) | `pending` | | | |
| 13 | [peer.md](vendors/peer.md) | `pending` | | | |
| 14 | [privacypools.md](vendors/privacypools.md) | `pending` | | | |
| 15 | [railgun.md](vendors/railgun.md) | `pending` | | | |
| 16 | [renegade.md](vendors/renegade.md) | `pending` | | | |
| 17 | [shutter.md](vendors/shutter.md) | `pending` | | | |
| 18 | [soda-labs.md](vendors/soda-labs.md) | `pending` | | | |
| 19 | [space-and-time.md](vendors/space-and-time.md) | `pending` | | | |
| 20 | [taceo-merces.md](vendors/taceo-merces.md) | `pending` | | | |
| 21 | [tx-shield.md](vendors/tx-shield.md) | `pending` | | | |
| 22 | [zama.md](vendors/zama.md) | `pending` | | | |
| 23 | [zksync.md](vendors/zksync.md) | `pending` | | | |

---

## Structural / Meta Checks

These are one-time checks on the overall map integrity:

| Check | Status | Reviewer | Date | Notes |
|-------|--------|----------|------|-------|
| GLOSSARY.md - all terms accurate | `pending` | | | |
| README.md - navigation links valid | `pending` | | | |
| CONTRIBUTING.md - up to date | `pending` | | | |
| All internal cross-links resolve | `pending` | | | |
| No orphan files (unreferenced content) | `pending` | | | |
| Frontmatter schema validation passes | `pending` | | | |
| Vale linting passes on all files | `pending` | | | |

---

## Open Questions

Questions, uncertainties, or decisions that surface during the audit. Resolve or escalate before closing the audit.

| # | Question | Raised by | Date | Related file(s) | Resolution |
|---|----------|-----------|------|------------------|------------|
| | | | | | |
