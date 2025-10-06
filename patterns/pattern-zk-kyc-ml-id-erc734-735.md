---
title: "Pattern: zk-KYC/ML + ONCHAINID (ERC-734-735)"
status: draft
maturity: PoC
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
- Claims in ERC-734/735 are zk-proofs of regulatory compliance (instead of signatures from authorized entities)

## Guarantees
- Compliance of regulatory framework upon identities onboarding
- Instant settlement (even with public sample it automates the settlement)

## Trade-offs
- 

## Example
- Bank A issues an id for an investor, needs to generate a proof of KYC/AML of the investor;

## See also
N/A
