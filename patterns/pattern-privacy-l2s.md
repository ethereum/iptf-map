---
title: "Pattern: Private L2s"
status: draft
maturity: PoC
layer: L2
privacy_goal: Execute financial logic with private state enabling confidential value and unlinkable identity
assumptions: Privacy-native rollup (ZK or FHE), L1 bridge contracts, viewing key infrastructure
last_reviewed: 2026-01-14
works-best-when:
  - Strong privacy is required beyond value-hiding: identity unlinkability, programmable access.
  - Institutions want to embed compliance hooks (view keys, audit proofs).
avoid-when:
  - You need conservative, battle-tested infra on Ethereum L1 today.
  - Overhead is unjustified if only minimal value privacy is needed.
dependencies:
  - L1 bridge contracts
  - Viewing key infra / off-chain attestations
---

## Intent

Use a **privacy-native rollup** (ZK or FHE-based) to execute financial logic with private state, enabling both **confidential value** and **unlinkable identity flows**.

## Ingredients

- **Standards**: ERC-20/3643 (bridged); ERC-7573 optional for settlement
- **Infra**:
  - ZK rollups: Aztec, Aleo, Lita, Miden
  - FHE rollups: Zama/fhEVM, Inco
- **Off-chain**: Key management, regulator view proofs

## Protocol (concise)

1. Bridge assets from L1 to privacy L2 via deposit contract.
2. Assets converted to private notes/commitments on the L2.
3. Execute transactions privately within L2 (amounts, senders, receivers shielded).
4. Generate ZK proofs (or FHE computations) for state transitions.
5. Optionally couple with ERC-7573 for atomic DvP/PvP settlement.
6. Provide viewing keys or disclosure proofs to regulators as needed.
7. Exit to L1 via withdrawal with proof of valid state.

## Guarantees

- **Private transactions**: Transaction details (amounts, senders, receivers) are shielded within the L2.
- **Private state**: Balances and contract state are stored as encrypted commitments/notes.
- **Interoperability with L1 state**: Rollup state roots anchor on L1, enabling bridging and settlement with L1 assets.

## Trade-offs

- **Maturity risks**: Most private L2s are early-stage, limited production deployments.
- **Migration/bridging required**: Assets and apps must move from L1 or other L2s; adds friction.
- **New attack surfaces**: Viewing key compromise, bridge exploits.
- **Regulatory auditability uncertain**: While selective disclosure is possible, no standardized frameworks exist yet for regulator access or compliance proofs.

## Example

- Bond issuance + settlement on Aztec notes.
- FHE L2 running private credit risk models with encrypted inputs.

## See also

- Aztec docs: https://docs.aztec.network/
- Aleo: https://aleo.org/
- Zama fhEVM: https://docs.zama.org/fhevm
- Miden: https://miden.xyz/
