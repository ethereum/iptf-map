## Glossary

### Core Privacy Concepts

**Commitment**: Hash binding note contents (value, secrets); stored on-chain without revealing contents

**Nullifier**: Unique tag derived from note secret; marks note as spent, prevents double-spending

**Note**: Off-chain record encoding value + secrets; only commitment stored on-chain

**Stealth Address**: Ephemeral address derived per-transaction to prevent address reuse

**View Key**: Cryptographic key allowing selective decryption of encrypted state without spending authority

### Blockchain Architecture

**Data Availability (DA)**: Where transaction/state data is stored for verification and reconstruction

**Sequencer**: L2 operator that orders transactions and produces batches

**Prover**: Entity that generates validity proofs for L2 state transitions (can see private state)

**Relayer**: Third party that submits transactions on behalf of users to hide identity

**Paymaster**: ERC-4337 entity that sponsors gas for UserOperations

### L2 Categories

**Scaling Rollup**: ZK rollup focused on throughput/cost; state public within L2 (ZKsync, Scroll)

**Privacy Rollup**: ZK rollup designed for encrypted/private state (Aztec)

**Validium**: Validity proofs on L1; data availability off-chain

**Volition**: Hybrid model allowing per-transaction choice between on-chain and off-chain DA

### Institutional/TradFi Terms

**DvP (Delivery vs Payment)**: Atomic settlement ensuring asset delivery only if payment occurs

**PvP (Payment vs Payment)**: Atomic exchange of two payment obligations

**TCA (Transaction Cost Analysis)**: Post-trade analysis of execution quality and slippage

**AoR (Audit on Request)**: Selective disclosure mechanism generating compliance reports on-demand

**RFQ (Request for Quote)**: OTC trading workflow where market makers provide quotes privately

**Best Execution**: Obligation to obtain most favorable terms when executing client orders

### Standards & Protocols

**[ERC-3643](https://eips.ethereum.org/EIPS/eip-3643)**: Ethereum standard for permissioned tokenized securities with built-in compliance framework

**[ERC-7573](https://ercs.ethereum.org/ERCS/erc-7573)**: Standard for conditional cross-chain settlement coordination

**[EIP-6123](https://eips.ethereum.org/EIPS/eip-6123)**: Ethereum standard for derivatives contracts with automated lifecycle management

**[EIP-5564](https://eips.ethereum.org/EIPS/eip-5564)**: Stealth address standard for unlinkable payments

**[ISO 20022](https://www.iso20022.org/)**: International messaging standard for financial services communication

**[ICMA BDT](https://www.icmagroup.org/market-practice-and-regulatory-policy/repo-and-collateral-markets/legal-documentation/global-master-repurchase-agreement-gmra/)**: International Capital Market Association Bond Data Taxonomy for standardized bond information

### Privacy Technologies

**FHE (Fully Homomorphic Encryption)**: Cryptographic technique allowing computation on encrypted data

**Zero-knowledge Proof**: A proof that reveals no more information than the validity of the statement it supports.

**SNARK/STARK**: Zero-knowledge proof systems (Succinct Non-interactive Arguments of Knowledge/Scalable Transparent Arguments of Knowledge)

**Co-SNARK**: Collaborative zero-knowledge proofs where multiple parties jointly prove properties

**Shielded Pool**: Privacy mechanism using cryptographic commitments to hide transaction details

**Confidential Contract**: Smart contract that operates on encrypted state while maintaining verifiability

**Circom/Groth16**: Popular zero-knowledge proof system and domain-specific language

**PLONK**: Zero-knowledge proof system with universal trusted setup

**TEE (Trusted Execution Environment)**: Hardware-based secure computation environment

**MPC (Multi-Party Computation)**: Cryptographic technique for joint computation without revealing inputs

### Identity & Compliance

**ONCHAINID**: Decentralized identity system used by ERC-3643 for KYC/eligibility verification

**KYC/AML**: Know Your Customer/Anti-Money Laundering regulatory compliance requirements

**EAS (Ethereum Attestation Service)**: Protocol for creating and verifying on-chain attestations

**Crypto-Registry**: Regulatory registry for digital asset compliance (eWpG requirement)

**Merkle Tree**: Cryptographic data structure for efficient membership proofs

### Regulatory Frameworks

**eWpG**: German Electronic Securities Act regulating tokenized securities

**MiCA**: EU Markets in Crypto-Assets regulation

**GENIUS Act**: US legislative framework for digital asset regulation

### Infrastructure

**Oracle**: External data provider for blockchain smart contracts

**Custodian**: Financial institution responsible for safeguarding digital assets
