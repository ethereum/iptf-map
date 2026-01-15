# Changelog

All notable changes to the IPTF Map are documented here.

## [Unreleased]

### feat(pattern)
- [Private transaction broadcasting](patterns/pattern-private-transaction-broadcasting.md) (#43)
- [TEE-based privacy](patterns/pattern-tee-based-privacy.md) (#44)
- [Threshold encrypted mempool](patterns/pattern-threshold-encrypted-mempool.md) (#45)

### feat(vendor)
- [Fhenix](vendors/fhenix.md) - FHE privacy (#32)

### feat(ci)
- Pattern validation workflow (#40)

### docs
- [Q1 2026 PRD](PRD-IPTF-PUBLIC-Q1-2026.md) with sprint planning (#39)

### fix(pattern)
- Required frontmatter fields across all patterns (#42)

---

## [0.2.0] - 2025-12-19

### feat(pattern)
- [TEE key manager](patterns/pattern-tee-key-manager.md) (#33)
- [EIL](patterns/pattern-eil.md) - Encrypted Inline Ledger (#26)
- [FOCIL-EIP7805](patterns/pattern-focil-eip7805.md) (#26)
- [Lean Ethereum](patterns/pattern-lean-ethereum.md) (#26)
- [OIF](patterns/pattern-oif.md) - Optimized Integrity Framework (#26)
- [Noir private contracts](patterns/pattern-noir-private-contracts.md) (#21)

### feat(vendor)
- [Paladin](vendors/paladin.md) (#19)
- [State Labs](vendors/StateLabs.md) - Tx Shield, OpenTMP LLM, Collab-Key (#7)
- [Soda Labs](vendors/soda-labs.md)
- [Miden](vendors/miden.md) docs (#18)

### feat(approach)
- [Private broadcasting](approaches/approach-private-broadcasting.md) (#6)
- [Private bonds](approaches/approach-private-bonds.md)

### feat(jurisdiction)
- [EU Data Protection](jurisdictions/eu-data-protection.md) (#8)

### docs
- [GLOSSARY.md](GLOSSARY.md) - privacy terminology (#5)

### refactor
- Split patterns directory into patterns + approaches (#2)

### fix(pattern)
- [DvP ERC-7573](patterns/pattern-dvp-erc7573.md) updates (#31)
- [Private-auth](use-cases/private-auth.md): revocation, zk-TLS mechanism

### fix(docs)
- Glossary: clarified core privacy concepts (#29)
- ZKsync naming standardization (#20)

---

## [0.1.0] - 2025-10-06

### feat
- Initial repository import with 62 files

### feat(pattern)
- 20+ privacy patterns (ZK, MPC, TEE, stealth addresses, etc.)

### feat(use-case)
- [private-auth](use-cases/private-auth.md)
- [private-bonds](use-cases/private-bonds.md)
- [private-derivatives](use-cases/private-derivatives.md)
- [private-rwa-tokenization](use-cases/private-rwa-tokenization.md)
- [private-stablecoins](use-cases/private-stablecoins.md)

### feat(domain)
- [custody](domains/custody.md)
- [data-oracles](domains/data-oracles.md)
- [funds-assets](domains/funds-assets.md)
- [identity-compliance](domains/identity-compliance.md)
- [payments](domains/payments.md)
- [trading](domains/trading.md)

### feat(jurisdiction)
- [DE eWpG](jurisdictions/de-eWpG.md)
- [EU MiCA](jurisdictions/eu-MiCA.md)
- [Banking Secrecy](jurisdictions/int-banking-secrecy.md)
- [US SEC](jurisdictions/us-SEC.md)

### feat(vendor)
- [Aztec](vendors/aztec.md)
- [Chainlink ACE](vendors/chainlink-ace.md)
- [Curvy](vendors/curvy.md)
- [Fireblocks](vendors/fireblocks.md)
- [Miden](vendors/miden.md)
- [PrivacyPools](vendors/privacypools.md)
- [Railgun](vendors/railgun.md)
- [Renegade](vendors/renegade.md)

### docs
- [GLOSSARY.md](GLOSSARY.md) with standardized terminology
- CC0 public domain license

---

[Unreleased]: https://github.com/ethereum/iptf-map/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/ethereum/iptf-map/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ethereum/iptf-map/releases/tag/v0.1.0
