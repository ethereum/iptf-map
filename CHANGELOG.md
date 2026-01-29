# Changelog

All notable changes to the IPTF Map are documented here.

## [Unreleased]

### Added

- feat(use-case): [Private Read](use-cases/private-read.md) - blockchain query privacy (stub)
- feat(use-case): [Private Corporate Bonds](use-cases/private-corporate-bonds.md) - capital formation privacy (stub)
- feat(use-case): [Private Government Debt](use-cases/private-government-debt.md) - sovereign/municipal bonds (stub)
- feat(use-case): [Private FX](use-cases/private-fx.md) - cross-border settlement privacy (stub)
- feat(use-case): [Private Stocks](use-cases/private-stocks.md) - tokenized equity (stub)
- feat(use-case): [Private Commodities](use-cases/private-commodities.md) - commodity trading (stub)
- feat(use-case): [Private Repo](use-cases/private-repo.md) - repurchase agreements (stub)
- feat(use-case): [Private Money Market Funds](use-cases/private-money-market-funds.md) - yield-bearing funds (stub)
- feat(use-case): [Private Treasuries](use-cases/private-treasuries.md) - corporate treasury (stub)
- feat(use-case): [Private Payments](use-cases/private-payments.md) - payment rails (stub)
- feat(use-case): [Private Oracles](use-cases/private-oracles.md) - data feed privacy (stub)
- feat(use-case): [Private Messaging](use-cases/private-messaging.md) - interbank communication (stub)
- feat(pattern): [L2 Privacy Evaluation Framework](patterns/pattern-l2-privacy-evaluation.md) - Methodology for institutions to compare privacy L2s (PR-011)
- feat(pattern): [Cross-chain Privacy Bridge](patterns/pattern-cross-chain-privacy-bridge.md) - Bridge assets between chains while preserving privacy
- feat(pattern): [vOPRF Nullifiers](patterns/pattern-voprf-nullifiers.md) - Threshold vOPRF-based nullifier generation for credentials/signals ([#61](https://github.com/ethereum/iptf-map/pull/61))
- feat(ci): Enhanced AI content quality guardrails ([#58](https://github.com/ethereum/iptf-map/issues/58))
  - Vale prose linter with custom IPTF styles for marketing language, hedging, and terminology
  - GLOSSARY.md term consistency checker (`scripts/check-terminology.js`)
  - Extended validation to all content types (vendors, use-cases, approaches, jurisdictions)
  - JSON Schema validation for frontmatter
  - Husky pre-commit hooks with lint-staged
  - LLM-based content review tool (`scripts/llm-review.js`)
- feat(approach): [White-label infrastructure deployment](approaches/approach-white-label-deployment.md) ([#55](https://github.com/ethereum/iptf-map/pull/55))
- feat(approach): [Atomic DvP Settlement](approaches/approach-dvp-atomic-settlement.md) ([#56](https://github.com/ethereum/iptf-map/pull/56))
- feat(pattern): [Modular Privacy Stack](patterns/pattern-modular-privacy-stack.md) - Four-layer privacy architecture ([#54](https://github.com/ethereum/iptf-map/pull/54))
- feat(pattern): [Hybrid public-private modes](patterns/pattern-hybrid-public-private-modes.md)
- feat(pattern): [Private transaction broadcasting](patterns/pattern-private-transaction-broadcasting.md) ([#43](https://github.com/ethereum/iptf-map/pull/43))
- feat(pattern): [TEE-based privacy](patterns/pattern-tee-based-privacy.md) ([#44](https://github.com/ethereum/iptf-map/pull/44))
- feat(pattern): [Threshold encrypted mempool](patterns/pattern-threshold-encrypted-mempool.md) ([#45](https://github.com/ethereum/iptf-map/pull/45))
- feat(vendor): [Fhenix](vendors/fhenix.md) - FHE privacy ([#32](https://github.com/ethereum/iptf-map/pull/32))
- feat(vendor): [Space and Time](vendors/space-and-time.md) ([#46](https://github.com/ethereum/iptf-map/pull/46))
- feat(ci): Pattern validation workflow ([#40](https://github.com/ethereum/iptf-map/pull/40))
- feat(approach): [Private bond PoC](approaches/approach-private-bonds.md) updates ([#47](https://github.com/ethereum/iptf-map/pull/47))
- docs: [Q1 2026 PRD](PRD-IPTF-PUBLIC-Q1-2026.md) with sprint planning ([#39](https://github.com/ethereum/iptf-map/pull/39))
- docs: [CHANGELOG.md](CHANGELOG.md) and weekly summary script ([#49](https://github.com/ethereum/iptf-map/pull/49))
- docs: [weekly-updates](weekly-updates/) directory ([#59](https://github.com/ethereum/iptf-map/pull/59))
- docs(prd): Sprint 6 for client-side proving and compliance
- docs(prd): Source citations for accuracy verification findings
- docs(prd): Sprint 1 completion and accuracy findings
- docs(prd): GitHub issue traceability and missing deliverables
- chore: Claude Code project configuration ([#36](https://github.com/ethereum/iptf-map/pull/36))

### Fixed

- fix(pattern): Required frontmatter fields across all patterns ([#42](https://github.com/ethereum/iptf-map/pull/42))

## [0.2.0] - 2025-12-19 (End of Year)

### Added

- feat(pattern): [TEE key manager](patterns/pattern-tee-key-manager.md) ([#33](https://github.com/ethereum/iptf-map/pull/33))
- feat(pattern): [EIL](patterns/pattern-eil.md) - Encrypted Inline Ledger ([#26](https://github.com/ethereum/iptf-map/pull/26))
- feat(pattern): [FOCIL-EIP7805](patterns/pattern-focil-eip7805.md) ([#26](https://github.com/ethereum/iptf-map/pull/26))
- feat(pattern): [Lean Ethereum](patterns/pattern-lean-ethereum.md) ([#26](https://github.com/ethereum/iptf-map/pull/26))
- feat(pattern): [OIF](patterns/pattern-oif.md) - Optimized Integrity Framework ([#26](https://github.com/ethereum/iptf-map/pull/26))
- feat(pattern): [Noir private contracts](patterns/pattern-noir-private-contracts.md) ([#21](https://github.com/ethereum/iptf-map/pull/21))
- feat(vendor): [Paladin](vendors/paladin.md) ([#19](https://github.com/ethereum/iptf-map/pull/19))
- feat(vendor): [State Labs](vendors/StateLabs.md) - Tx Shield, OpenTMP LLM, Collab-Key ([#7](https://github.com/ethereum/iptf-map/pull/7))
- feat(vendor): [Soda Labs](vendors/soda-labs.md)
- feat(vendor): [Miden](vendors/miden.md) docs ([#18](https://github.com/ethereum/iptf-map/pull/18))
- feat(approach): [Private broadcasting](approaches/approach-private-broadcasting.md) ([#6](https://github.com/ethereum/iptf-map/pull/6))
- feat(approach): [Private bonds](approaches/approach-private-bonds.md)
- feat(jurisdiction): [EU Data Protection](jurisdictions/eu-data-protection.md) ([#8](https://github.com/ethereum/iptf-map/pull/8))
- docs: [GLOSSARY.md](GLOSSARY.md) - privacy terminology ([#5](https://github.com/ethereum/iptf-map/pull/5))

### Changed

- refactor: Split patterns directory into patterns + approaches ([#2](https://github.com/ethereum/iptf-map/pull/2))

### Fixed

- fix(pattern): [DvP ERC-7573](patterns/pattern-dvp-erc7573.md) updates ([#31](https://github.com/ethereum/iptf-map/pull/31))
- fix(use-case): [Private-auth](use-cases/private-auth.md) - revocation, zk-TLS mechanism
- fix(docs): Glossary - clarified core privacy concepts ([#29](https://github.com/ethereum/iptf-map/pull/29))
- fix(docs): ZKsync naming standardization ([#20](https://github.com/ethereum/iptf-map/pull/20))

## [0.1.0] - 2025-10-06 (MVP)

### Added

- feat: Initial repository import with 62 files
- feat(pattern): 20+ privacy patterns (ZK, MPC, TEE, stealth addresses, etc.)
- feat(use-case): [private-auth](use-cases/private-auth.md)
- feat(use-case): [private-bonds](use-cases/private-bonds.md)
- feat(use-case): [private-derivatives](use-cases/private-derivatives.md)
- feat(use-case): [private-rwa-tokenization](use-cases/private-rwa-tokenization.md)
- feat(use-case): [private-stablecoins](use-cases/private-stablecoins.md)
- feat(domain): [custody](domains/custody.md)
- feat(domain): [data-oracles](domains/data-oracles.md)
- feat(domain): [funds-assets](domains/funds-assets.md)
- feat(domain): [identity-compliance](domains/identity-compliance.md)
- feat(domain): [payments](domains/payments.md)
- feat(domain): [trading](domains/trading.md)
- feat(jurisdiction): [DE eWpG](jurisdictions/de-eWpG.md)
- feat(jurisdiction): [EU MiCA](jurisdictions/eu-MiCA.md)
- feat(jurisdiction): [Banking Secrecy](jurisdictions/int-banking-secrecy.md)
- feat(jurisdiction): [US SEC](jurisdictions/us-SEC.md)
- feat(vendor): [Aztec](vendors/aztec.md)
- feat(vendor): [Chainlink ACE](vendors/chainlink-ace.md)
- feat(vendor): [Curvy](vendors/curvy.md)
- feat(vendor): [Fireblocks](vendors/fireblocks.md)
- feat(vendor): [Miden](vendors/miden.md)
- feat(vendor): [PrivacyPools](vendors/privacypools.md)
- feat(vendor): [Railgun](vendors/railgun.md)
- feat(vendor): [Renegade](vendors/renegade.md)
- docs: [GLOSSARY.md](GLOSSARY.md) with standardized terminology
- docs: CC0 public domain license

[Unreleased]: https://github.com/ethereum/iptf-map/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/ethereum/iptf-map/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ethereum/iptf-map/releases/tag/v0.1.0
