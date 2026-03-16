| Title | Status |
| :---- | :---- |
| Vendor: Partisia Blockchain | draft |

# Partisia Blockchain – Private Smart Contracts using Secure Multi-Party Computation

# What it is

Partisia Blockchain (PBC) is a layer-1 blockchain with a cross-chain bridge to Ethereum that allows for customizable MPC (multi-party computation) as a service to the Ethereum network. MPC is enabled as an integrated, first level citizen with orchestration of the computation through a combination of Ethereum and Partisia Blockchain smart contracts.   

PBC is a semi-permissioned blockchain, where all nodes (blockproducers, oracle,  
and MPC) have undergone a formal KYC check. PBC allows users to write  
regular smart contracts in Rust.

# Fits Patterns

- [MPC Custody](https://github.com/ethereum/iptf-map/blob/master/patterns/pattern-mpc-custody.md)  
- [Private Shared State](https://github.com/ethereum/iptf-map/blob/master/patterns/pattern-private-shared-state.md)  
- [Shielding](https://github.com/ethereum/iptf-map/blob/master/patterns/pattern-shielding.md)  
- [Pattern-hybrid-public-private-modes](https://github.com/ethereum/iptf-map/blob/master/patterns/pattern-hybrid-public-private-modes.md)  
- [Pattern-l2-privacy-evaluation](https://github.com/ethereum/iptf-map/blob/master/patterns/pattern-l2-privacy-evaluation.md)  
- P[attern-modular-privacy-stack](https://github.com/ethereum/iptf-map/blob/master/patterns/pattern-modular-privacy-stack.md)  
- [Pattern-permissioned-ledger-interoperability](https://github.com/ethereum/iptf-map/blob/master/patterns/pattern-permissioned-ledger-interoperability.md)  
- [Pattern-pretrade-privacy-encryption](https://github.com/ethereum/iptf-map/blob/master/patterns/pattern-pretrade-privacy-encryption.md)  
- [Pattern-private-pvp-stablecoins-erc7573](https://github.com/ethereum/iptf-map/blob/master/patterns/pattern-private-pvp-stablecoins-erc7573.md)  
- [Pattern-private-stablecoin-shielded-payments](https://github.com/ethereum/iptf-map/blob/master/patterns/pattern-private-stablecoin-shielded-payments.md)  
- [Pattern-private-vaults](https://github.com/ethereum/iptf-map/blob/master/patterns/pattern-private-vaults.md)


# Not a substitute for

- ZKp based techniques where data must be verifiable unconditionally and non-interactively.  
- TEE  
- FHE

# Architecture

PBC’s private smart contract feature is enabled by a four-party, threshold one, MPC protocol. When deploying a private smart contract, the user can specify requirements for jurisdiction etc. which is then used when picking the set of KYC’ed nodes that are tasked with keeping the computation state secret, as well as running the MPC. PBC’s execution engine feature can be used to further control which nodes run the computation, as well as what the MPC protocol looks like.

Access to MPC from Ethereum is available through a MPC backed, collateralized cross-chain bridge between Ethereum and Partisia Blockchain

Gas for the MPC computation is payable in Eth or USDT, usually bridged into Partisia Blockchain

More details on Crosschain can be found here \- [https://partisiablockchain.gitlab.io/documentation/smart-contracts/pbc-as-second-layer/partisia-blockchain-as-second-layer.html](https://partisiablockchain.gitlab.io/documentation/smart-contracts/pbc-as-second-layer/partisia-blockchain-as-second-layer.html)

More details on Gas in Partisia can be found here \- [https://partisiablockchain.gitlab.io/documentation/pbc-fundamentals/byoc/byoc.html](https://partisiablockchain.gitlab.io/documentation/pbc-fundamentals/byoc/byoc.html) 

# Privacy domains (if applicable)

- Programmable privacy allowing Turing complete computations  
- MPC orchestrated using a combination of Ethereum and Partisia Blockchain

# Enterprise demand and use cases

- Compliant shielded transactions   
- Programmable MPC key custody for enterprise custody  
- Analysis of secret data (health care, AML, Credit rating, supply chain, etc)  
- MPC based secret bid auctions for RWA, Orderbooks, etc      
- Hybrid Public / Private blockchain model  
- Private Shared State for financial organization (and others)  
- Selective Disclosure

# Technical details

- Four party, one corruption, actively secure MPC protocol with guaranteed output.  
- Smart contract language (both public and private) is a subset of rust.  
- Public smart contracts are compiled to WASM; private smart contracts are compiled to a custom circuit-like language.

# Strengths

- Native protocols built in for MPC as well as fully programmable extendable protocol platform  
- Cross chain bridge enabling orchestration of Multi-party Computation (MPC) on Ethereum, with gas payable using USDT or ETH.   

# Risks and open questions

- One threat model supported out of the box (four parties, one corruption)  
- Current network supports GDPR compliance.  Other regions require additional node buildout  
- Unique integration to Ethereum.  Not an L2 but also not a side-chain.    
- Protocol based.  Not CPU intensive like TEE or FHE but sensitive to network usage.

# Links

- [https://partisiablockchain.gitlab.io/documentation/index.html](https://partisiablockchain.gitlab.io/documentation/index.html)  
- [https://gitlab.com/partisiablockchain/language/example-contracts](https://gitlab.com/partisiablockchain/language/example-contracts)  
- [https://partisiablockchain.gitlab.io/documentation/smart-contracts/pbc-as-second-layer/partisia-blockchain-as-second-layer.html](https://partisiablockchain.gitlab.io/documentation/smart-contracts/pbc-as-second-layer/partisia-blockchain-as-second-layer.html) 

[^1]:  Institutional Privacy Task Force
