---
title: "Pattern: Aztec Noir Private Contracts"
status: ready
maturity: pilot
layer: L2
privacy_goal: Enable composable private and public state in single contracts via ZK proofs
assumptions: Aztec rollup infrastructure, client-side proving capability (8GB RAM), Barretenberg prover
last_reviewed: 2026-01-14
works-best-when:
  - Applications need composable private and public state in a single contract
  - Developers want privacy without abandoning familiar programming paradigms
  - Use cases require selective privacy layers around existing DeFi protocols
avoid-when:
  - Application requires low-latency execution (client-side proving adds overhead)
  - Team lacks capacity to adopt new tooling and non-Solidity development
  - Simple shielding or anonymity is sufficient (lighter alternatives exist)
dependencies: [Aztec Protocol, Noir, Barretenberg Prover]
---

## Intent

Noir is the DSL developed by Aztec, enable developers to write Ethereum-compatible smart contracts that blend transparent public logic with confidential private computations, using a Rust-like language that compiles to zero-knowledge circuits verified on Aztec's privacy-preserving rollup.

## Ingredients

- Aztec Protocol (private rollup)
- ACIR (Abstract Circuit Intermediate Representation)
- Aztec Sandbox or Testnet node (Docker-based), Ethereum L1 for settlement
- Noir DSL for contract logic, TypeScript for client-side integration via `@aztec/aztec.js`
- Proving Backend: Barretenberg (ZK backend, modular and backend-agnostic)
- `aztec` CLI, `nargo` CLI for Noir project management, Node.js/Yarn for dApp development
- Client-side proof generation (CPU-intensive, 8GB RAM minimum recommended)

## Protocol

1. Write Contract: Developer writes smart contract in Noir (`.nr` files) with both private and public functions
2. Compile to ACIR: Noir compiler translates contract logic into Abstract Circuit Intermediate Representation
3. Deploy to Aztec: Contract deployed to Aztec rollup (testnet or mainnet)
4. Client Execution: User executes private function locally, generating zero-knowledge proof of correct execution
5. Submit Proof: Client submits proof and public inputs to Aztec sequencer
6. Verification: Aztec rollup verifies proof on-chain using Barretenberg verifier
7. State Update: Private state updated in encrypted form, public state updated transparently
8. L1 Settlement: Batch of transactions periodically settled to Ethereum L1 with validity proof

## Guarantees

**Privacy:**

- Private state remains encrypted and hidden from sequencers and observers
- Private function logic and inputs/outputs are not revealed on-chain
- Public and private logic can be composed in the same contract

**Correctness:**

- Zero-knowledge proofs guarantee computational integrity without revealing private data
- Validity proofs ensure state transitions follow contract rules

**Atomicity:**

- Transactions are atomic within the Aztec rollup execution environment
- L1 finality achieved through periodic batch settlement with validity proofs

**Audit & Observability:**

- Public state and function calls remain transparent and auditable
- Private state can support selective disclosure through viewing keys or ZK proofs
- Contract logic is open-source and auditable in Noir
- Private logs enable encrypted event emission for note discovery and auditing

**Private Logs**

- Encrypted logs enable private event emission and while maintaining confidentiality
- Recipients scan encrypted onchain logs to identify private transactions meant for them. This is known as **note discovery**.
- Only parties with decryption keys can read log contents; observers see encrypted data only

## Trade-offs

**Performance:**

- Client-side proving is CPU-intensive, adding latency compared to Solidity execution
- Proof generation time depends on circuit complexity and hardware capabilities
- Barretenberg optimizations and parallel proving are reducing this overhead

**Developer Experience:**

- Requires learning Noir DSL (though syntax is Rust-inspired and developer-friendly)
- Cannot directly reuse Solidity contracts or tooling
- Standard Ethereum functions must be reimplemented in Noir or imported from community libraries

**Ecosystem Maturity:**

- Noir ecosystem is rapidly growing but less mature than Solidity
- Some primitives and libraries still need to be built or ported
- Limited production deployments compared to established L2s

**Mitigations:**

- Use Aztec as privacy bridge to existing DeFi without full rewrites
- Leverage growing [Awesome Noir](https://github.com/noir-lang/awesome-noir) ecosystem for shared libraries
- Start with selective privacy layers, expand as tooling matures
- Optimize circuit design to minimize proving time

## Example

**Private Corporate Stablecoin Transfer:**

1. Bank A shields $10M USDC on Aztec, receiving private notes
2. Bank A pays Bank B $2M privately - client generates ZK proof of sufficient balance
3. Transaction emits encrypted log; only Bank B can decrypt and discover the payment
4. Aztec network verifies proof and updates balances - observers only see verification occurred, not amounts or parties
5. Bank B can now spend their $2M privately; Bank A's remaining $8M position stays hidden

## See also

- [Pattern: Privacy L2s](pattern-privacy-l2s.md) - General privacy rollup architectures
- [Pattern: ZK Shielded Balances](pattern-zk-shielded-balances.md) - Balance privacy for derivatives
- [Pattern: Co-SNARK](pattern-co-snark.md) - Multi-party ZK proofs for compliance
- [Vendor: Aztec Network](../vendors/aztec.md) - Aztec protocol details
- [Approach: Private Bonds](../approaches/approach-private-bonds.md) - Tokenized securities with privacy
- [Approach: Private Derivatives](../approaches/approach-private-derivatives.md) - Private derivatives trading

**Links:**

- [Aztec Documentation](https://docs.aztec.network)
- [Noir Language](https://noir-lang.org)
- [Aztec.js SDK](https://www.npmjs.com/package/@aztec/aztec.js)
- [Awesome Noir](https://github.com/noir-lang/awesome-noir)
- [Nethermind's Noir Deep Dive](https://www.nethermind.io/blog/our-first-deep-dive-into-noir-what-zk-auditors-learned)
