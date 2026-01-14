---
title: "Pattern: zk-TLS"
status: draft
maturity: PoC
layer: offchain
privacy_goal: Export verifiable identity/data from web2 systems via ZK proofs on TLS transcripts
assumptions: TLSNotary or similar, trusted Notary for TLS session, ZK prover for transcript
last_reviewed: 2026-01-14
works-best-when:
  - data needs to be captured using a website
avoid-when:
  - data can be exported using API
dependencies:
---

## Intent

Enable **data/identity export** from a website.  
zk-TLS let investors generate verifiable identities from their existing web2 data.

## Ingredients

- **Cryptography**: [zk-TLS](https://eprint.iacr.org/2023/964), e.g. TLSNotary)
- **Infra**: Offchain website, trusted Notary
- **Standards**: Can tie into ERC-3643 (identity claims), [attestations](pattern-verifiable-attestation.md), ERC-7573 for settlement

## Protocol (concise)

1. Investor jointly run a TLS session with a Notary to obtain a TLS transcript (of relevant data or identity attributes) signed by the Notary
2. Investor generates a zk proof on the signed TLS transcript
3. Proof can be verified by a regulator, counterparty, or onchain contract.

## Guarantees

- Prove attributes of an investor stored at a web2 system
- Preserve trade secrets and client privacy.
- Anchor proofs or state commitments onchain if required.

## Trade-offs

- Notary must be trusted (can be the institution that wants access to the identity data)

## Examples

- **Compliance**: Bank + investor prove AML/KYC checks using investor's existing data without sharing raw data.
- **Shared state**: Consortium of custodians maintain a private ledger offchain, publish commitment  and identity proof to L1.

## See also

- TLS Notary: https://tlsnotary.org/
