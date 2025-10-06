---
title: "Pattern: zk-SPV (Succinct Cross-Chain Verification)"
status: draft
maturity: research
works-best-when:
  - Assets/contracts must verify events on another EVM chain.
  - Institutions require strong DvP atomicity across ledgers.
avoid-when:
  - Both legs can be settled on a single rollup/L1.
  - Consensus rules of the target chain are unstable or rapidly evolving.
dependencies:
  - zkSNARK/zkSTARK system (Groth16, Halo2, SP1, RiscZero)
  - Target chain consensus encoding (Ethereum PoS, IBFT, etc.)
---

## Intent

Restore **true atomicity across chains** by proving on Chain A that a transaction finalized on Chain B.  
A zk-SPV proof convinces Chain A that _“tx X was finalized on Chain B under consensus Y”_ without replaying all headers or trusting a relayer.

## Ingredients

- **Proof system:** zkSNARK/zkSTARK for succinct verification.
- **Consensus logic in-circuit:** target chain’s header validity rules.
- **Inclusion proof:** Merkle proof linking tx/receipt → receipts root in block header.
- **Verifier contract:** deployed on the verifying chain.

## Protocol (concise)

1. User/prover gathers:
   - Block header `H` from Chain B.
   - Merkle proof of tx/receipt inclusion in `H`.
   - Finality evidence (e.g. sync-committee signatures).
2. Prover constructs zk proof:
   - “`H` is valid under Chain B’s consensus.
   - Tx/receipt R is included in `H`.
   - `H` is finalized (per consensus rules).”
3. Submit `(proof, publicInputs)` to verifier on Chain A.
4. Chain A contract accepts R as finalized on Chain B.

## Guarantees

- **Strong atomicity enabler:** Chain A contract can condition its execution on proof that a counter-leg finalized on Chain B.
- **Succinctness:** verify in ~200k gas instead of replaying 1000+ headers.
- **Trustless:** no relayer trust required, only proof validity.

## Trade-offs

- Heavy prover costs (minutes on today’s zkVMs).
- Consensus changes require circuit updates.
- Still inherits security assumptions of target chain’s consensus.

## Example

- Private DvP between Chain A and Chain B:
  - Each leg locked in shielded pools under relation R.
  - Each side finalizes only after verifying a zk-SPV proof that the counter-leg finalized on the other chain.
  - Yields **both privacy and true atomicity**.

## Variants

- **Asymmetric:** only one side checks zk-SPV, other trusts relayer.
- **Hub-and-spoke:** use Ethereum L1 as common verification hub for L2s.
- **Optimistic:** relayers post claims, zk-SPV used on dispute.

## See also

- pattern-zk-htlc.md
- pattern-commit-and-prove.md
- pattern-dvp-erc7573.md
- pattern-aztec-privacy-l2-erc7573.md
