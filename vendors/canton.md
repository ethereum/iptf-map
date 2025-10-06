---
title: "Vendor: Canton"
status: draft
---

# Digital Asset – Canton Network (Interoperable Permissioned DLT)

## What it is

Canton is a permissioned distributed ledger network developed by [Digital Asset](https://www.digitalasset.com/). It enables financial institutions to run interoperable applications on separate blockchains that can synchronize and interoperate securely. Canton is designed to support regulated markets, including issuance and settlement of tokenized securities.

## Fits with patterns (names only)

- [Permissioned Ledger Interoperability](../patterns/pattern-permissioned-ledger-interoperability.md)

## Not a substitute for

- Public chain settlement with open participation
- General-purpose privacy-preserving computation (ZK/FHE)

## Architecture

Canton connects multiple independent “Canton domains,” each an instance of a DAML-based ledger. Domains enforce a common synchronization protocol to ensure atomic transaction settlement across applications without revealing unnecessary data. Each domain has validators responsible for consensus and data availability, while privacy is enforced by restricting data distribution to parties directly involved in a contract.

## Privacy domains (if applicable)

- Data minimization: only relevant counterparties see contract state
- Domain isolation: private domains can maintain confidentiality while interoperating selectively
- Regulatory visibility: domains can provide regulators selective access

## Enterprise demand and use cases

Adopted by banks, exchanges, and market infrastructures (e.g., Deutsche Börse, Goldman Sachs). Use cases include tokenized bond issuance, cross-entity settlement, repo and derivatives trading, and asset servicing workflows. Buyer profiles are financial institutions with requirements for interoperability and regulatory alignment.

## Technical details

- DAML smart contract language
- Canton synchronization protocol for cross-domain atomicity
- Permissioned consensus operated by financial institutions
- Interoperability across separate regulated networks
- Granular privacy via contract-level data scoping

## Strengths

- Interoperability across permissioned ledgers without centralization
- Fine-grained data privacy at contract level
- Backed by established financial institutions and integrated with existing infrastructure

## Risks and open questions

- Limited to DAML ecosystem; not natively interoperable with EVM/ZK ecosystems
- Relies on permissioned governance; openness and resilience depend on participants
- Adoption may be constrained by competing institutional DLT platforms

## Links

- [Canton Network](https://www.canton.network)
- [Digital Asset](https://www.digitalasset.com)
- [Canton Technical Overview](https://www.canton.network/technology)
