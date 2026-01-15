# Changelog

All notable changes to the IPTF Map are documented here.

## [Unreleased]

### Added
- [Fhenix](vendors/fhenix.md) vendor (FHE)
- [Private transaction broadcasting](patterns/pattern-private-transaction-broadcasting.md) (#43)
- [TEE-based privacy](patterns/pattern-tee-based-privacy.md) (#44)
- [Threshold encrypted mempool](patterns/pattern-threshold-encrypted-mempool.md) (#45)
- CI/CD pattern validation workflow (#40)
- [Q1 2026 PRD](PRD-IPTF-PUBLIC-Q1-2026.md) with sprint planning (#39)

### Fixed
- Required frontmatter fields across all patterns (#42)

## [0.2.0] - 2025-12-19

### Added
- [TEE key manager](patterns/pattern-tee-key-manager.md) (#33)
- [EIL](patterns/pattern-eil.md) (Encrypted Inline Ledger)
- [FOCIL-EIP7805](patterns/pattern-focil-eip7805.md)
- [Lean Ethereum](patterns/pattern-lean-ethereum.md)
- [OIF](patterns/pattern-oif.md) (Optimized Integrity Framework)
- [Noir private contracts](patterns/pattern-noir-private-contracts.md) (#21)
- [Paladin](vendors/paladin.md) (#19)
- [State Labs](vendors/StateLabs.md) (Tx Shield, OpenTMP LLM, Collab-Key) (#7)
- [Soda Labs](vendors/soda-labs.md)
- [Miden](vendors/miden.md) docs (#18)
- [Private broadcasting](approaches/approach-private-broadcasting.md) (#6)
- [Private bonds approach](approaches/approach-private-bonds.md)
- [EU Data Protection](jurisdictions/eu-data-protection.md) (#8)
- [GLOSSARY.md](GLOSSARY.md) (#5)

### Changed
- Split patterns directory into patterns + approaches (#2)
- [DvP ERC-7573](patterns/pattern-dvp-erc7573.md) updates (#31)
- [Private-auth](use-cases/private-auth.md): added revocation, zk-TLS mechanism
- Glossary: clarified core privacy concepts (#29)
- ZKsync naming standardization (#20)

## [0.1.0] - 2025-10-06

### Added
- Initial repository import with 62 files
- 20+ privacy patterns (ZK, MPC, TEE, stealth addresses, etc.)
- 5 use cases: [private-auth](use-cases/private-auth.md), [private-bonds](use-cases/private-bonds.md), [private-derivatives](use-cases/private-derivatives.md), [private-rwa-tokenization](use-cases/private-rwa-tokenization.md), [private-stablecoins](use-cases/private-stablecoins.md)
- 6 domain overviews: [custody](domains/custody.md), [data-oracles](domains/data-oracles.md), [funds-assets](domains/funds-assets.md), [identity-compliance](domains/identity-compliance.md), [payments](domains/payments.md), [trading](domains/trading.md)
- 4 jurisdictions: [DE eWpG](jurisdictions/de-eWpG.md), [EU MiCA](jurisdictions/eu-MiCA.md), [Banking Secrecy](jurisdictions/int-banking-secrecy.md), [US SEC](jurisdictions/us-SEC.md)
- 9 vendor profiles: [Aztec](vendors/aztec.md), [Chainlink ACE](vendors/chainlink-ace.md), [Curvy](vendors/curvy.md), [Fireblocks](vendors/fireblocks.md), [Miden](vendors/miden.md), [PrivacyPools](vendors/privacypools.md), [Railgun](vendors/railgun.md), [Renegade](vendors/renegade.md)
- [GLOSSARY.md](GLOSSARY.md) with standardized terminology
- CC0 public domain license
