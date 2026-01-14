---
title: "Pattern: zk-KYC/ML + ONCHAINID (ERC-734-735)"
status: draft
maturity: PoC
layer: hybrid
privacy_goal: Public verifiable identity onboarding via ZK proofs of KYC/AML compliance
assumptions: ERC-734/735 identity framework, zk-KYC/ML prover (EZKL), zk-TLS or compliant EOA proofs
last_reviewed: 2026-01-14
works-best-when:
- need public verifiability of identities onboarding (perhaps for instant settlement)
avoid-when:
- can do whitelisting based on signatures of authorized parties
dependencies: [ERC-734, ERC-735]
---

## Intent
Allows onboarding identities such as ERC-734/735 in a public verfiable manner for instant onchain settlement

## Ingredients
- ERC-734/735
- zk-KYC/ML such as EZKL

## Protocol (concise)
- Investor obtains a zk proof of KYC/AML identities from offchain system using zk-TLS or zk proof of compliant EOA ownership
- Claims in ERC-734/735 are zk-proofs of regulatory compliance above (instead of signatures from authorized entities)

## Guarantees
- Compliance of regulatory framework upon identities onboarding
- Instant settlement (even with public sample it automates the settlement)

## Trade-offs
- 

## Example
- Bank issues an id for an investor, needs to generate a proof of KYC/AML of the investor;

## See also
N/A
