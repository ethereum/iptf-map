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
