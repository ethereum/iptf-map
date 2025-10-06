---
title: "Pattern: co-SNARK for Compliance Check"
status: draft
maturity: PoC
works-best-when:
- institutions don't have full data transparency and need additional private data from investors or another collaborating institutions
avoid-when:
- institutions have full access to data
dependencies: co-SNARK
---

## Intent
Selectively disclosure is impossible if institutions don't have access to the data needed for the compliance proof, co-SNARK allows institutions collaboratively generate the necessary proof

## Ingredients
- Co-SNARK such as TACEO (https://core.taceo.io/articles/mpc-kyc/)

## Protocol (concise)
- institutions prepare private compliance model
- investors prepare private financial data
- institutions run co-SNARK with investors/others to prove compliance over private model on private data

## Guarantees
- Prove compliance while keep trade secret among participants
- Instant settlement

## Trade-offs
- Additional infrastructure with high communication cost scaling with the number of participants
- Can run delegated co-SNARK but need additional trust assumption

## Example
- Bank A and Bank B disclose some compliance towards regulator

## See also
- pattern-zk-kyc-ml-id-erc734-735.md
