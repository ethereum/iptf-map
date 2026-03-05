---
title: "Vendor: Privacy Pools"
status: draft
maturity: production
---

# Privacy Pools – Smart Contract Protocol for Compliance-Friendly Privacy

## What it is

Privacy Pools is a smart contract protocol deployed on Ethereum mainnet that enables private transactions with built-in compliance signaling. Users deposit into a shielded pool (commitments + nullifiers) and, on withdrawal, prove that their funds belong to (or do not belong to) a specific **association set** defined by an Association Set Provider (ASP). This creates a **separating equilibrium**: honest users can voluntarily demonstrate compliance while retaining transactional privacy.

The protocol is developed and operated by [0xbow](https://0xbow.io), with the v1 deployment live on Ethereum L1 since 2025.

## Fits with patterns (names only)

- Pattern: L1 ZK Commitment Pool
- Pattern: Shielded ERC-20 Transfers
- Pattern: Regulatory Disclosure Keys & Proofs
- Pattern: Compliance Monitoring

## Not a substitute for

- Not a full rollup or scalability solution (operates as L1 smart contracts).
- Not an identity system (relies on external KYC/credential providers for association set construction).
- Not a universal compliance layer (compliance scope depends on ASP set construction and policies).
- Not a general-purpose shielded token system (v1 supports ETH only; ERC-20 support planned for v2).

## Architecture

- **Execution model**: Commitment + nullifier scheme in a Merkle tree, similar to Tornado Cash but extended with association set verification.
- **Contract architecture**: Upgradeable proxy pattern with an Entrypoint contract routing to asset-specific pool contracts.
  - Mainnet Entrypoint (Proxy): `0x6818809EefCe719E480a7526D76bD3e561526b46`
  - Mainnet ETH Pool: `0xF241d57C6DebAe225c0F2e6eA1529373C9A9C9fB`
- **Association sets**: Subsets of deposits defined by a Merkle root; users prove membership of their deposit in both the global deposit tree and the association set tree.
- **Proof system**: zk-SNARKs (Groth16) — double Merkle-branch check (global root + association set root).
- **Association Set Providers (ASPs)**: Off-chain entities (currently 0xbow on Ethereum and Brevis on BNB Chain) that define, compute, and publish association sets. Sets are constructed by screening deposits against sanctions lists, chain analytics, and configurable compliance policies.
- **Relayer**: Third parties operate relayers that submit withdrawal transactions on behalf of users, preventing the withdrawal address from being linked to the depositor's gas-paying address.
- **Data availability**: Commitments and proofs recorded on-chain; association set roots published on-chain; full set data available off-chain.

## Privacy domains

- **Membership proofs**: "My withdrawal came from one of these known-good deposits."
- **Exclusion proofs**: "My withdrawal did not come from these known-bad deposits."
- **Bilateral direct proofs**: User can reveal the exact deposit-withdrawal link to a specific counterparty if required (e.g., for tax reporting or institutional compliance).
- **Sequential proofs**: Funds passing through multiple hands can be re-proved at each step against current association sets.
- **Viewing keys (auditor access)**: Per-account symmetric keys (XChaCha20-Poly1305, derived via HKDF) that grant read-only access to a user's shielded transaction history. Auditor data is embedded on-chain per withdrawal as an encrypted payload (tag + ciphertext), where the tag is a Poseidon hash enabling efficient event discovery without revealing the underlying data. Currently live on the StarkNet v1 deployment; EVM v1 support planned. Enables compliance teams, auditors, and institutional back-offices to verify transaction history without requiring the user's spending keys.

## Enterprise demand and use cases

- **Centralised exchanges**: Private withdrawals (users withdraw to a shielded address, breaking the on-chain link between exchange hot wallet and destination), private deposits (users deposit from shielded balance without revealing source), private P2P transfers between exchange accounts, and yield on shielded balances. Integration model ranges from additive (opt-in privacy feature) to privacy-by-default for all user transfers.
- **Wallet providers**: Shielded swaps (swap between assets without exposing portfolio), private P2P transfers and payment requests, cross-chain privacy (shield on one chain, unshield on another), and yield on idle shielded balances. SDK integration via `shield()`, `withdraw()`, `transfer()`, and `swap()` methods.
- **Institutional custody providers**: Private vendor payments, private treasury movements (move funds between operational wallets without exposing internal structure), private cross-entity settlements, private payroll, and yield on shielded reserves. Enterprise features include MPC/multisig compatibility, inverted authorisation model (spending keys held by custodian, view keys shared with compliance), hardware wallet support, key rotation and recovery, and ragequit non-custodial guarantee.
- **Compliance and audit**: View keys enable compliance teams to verify the full transaction history of a shielded account without requiring spending authority. Planned standalone auditor portal (audit.privacypools.com) for view-key-based read-only access to shielded balances and transaction graphs.
- **OTC desks**: Private settlement of large block trades without broadcasting trade direction, size, or counterparty information on-chain.
- **Policy pilots**: Cited in the Buterin, Soleimani, Schär et al. 2023 paper as the canonical model for aligning on-chain privacy with AML compliance. The v1 mainnet deployment is the production implementation of this model.

## Technical details

- **Proof circuit**: Double Merkle-branch verification — the withdrawal proof demonstrates:
  1. Knowledge of a valid note (commitment preimage) in the global deposit tree.
  2. Membership (or exclusion) of that note in the association set tree.
  3. Correct nullifier derivation to prevent double-spending.
- **Association set construction** follows configurable rules:
  - _Inclusion-based_: Only deposits passing compliance screening are included (v1 default — 0xbow screens against sanctions lists and chain analytics).
  - _Exclusion-based_: All deposits except those flagged as high-risk.
  - _Hybrid_: Future support for KYC tokens, proof-of-personhood, or credential-gated sets.
- **Gas costs**: Withdrawal proofs are ~2M gas due to on-chain Groth16 verification + Merkle path checks.
- **Relayer model**: Users submit withdrawal requests to a relayer, which pays gas and submits the transaction. This hides the recipient's address from being the gas payer, strengthening unlinkability.

## Strengths

- **Production L1 compliance-friendly shielded pool**: Sole live implementation of the association set model on Ethereum mainnet.
- **Separating equilibrium**: Honest users can prove compliance; dishonest users cannot forge association set membership proofs.
- **Flexible compliance**: Different ASPs can define different sets for different jurisdictions or policies, without requiring protocol changes.
- **Voluntary proofs**: No mandatory global allowlisting, no centralized backdoors. Users choose when and to whom they prove compliance, including optional viewing key sharing for audit purposes.
- **Aligned with academic foundation**: Direct implementation of the Buterin/Soleimani/Schär model, which has broad recognition in policy and regulatory discussions.

## Risks and open questions

- **Privacy depends on set size**: Small pools or narrowly defined association sets reduce the anonymity set. Pool growth is critical for privacy guarantees.
- **ETH only in v1**: No ERC-20 support yet; ERC-20 shielding planned for v2.
- **No native cross-chain support**: L1 only; no bridging to L2 shielded pools.
- **Relayer trust**: The relayer can observe the withdrawal request (though it cannot link to the deposit without the user's secret). Relayer decentralization is a future goal.
- **Groth16 trusted setup**: Requires a ceremony for zk-SNARK parameters; the security of the proof system depends on at least one honest participant in the setup ceremony.

## Links

- [Privacy Pools Core (v1 contracts, circuits, SDK, relayer)](https://github.com/0xbow-io/privacy-pools-core)
- [Privacy Pools Website](https://privacypools.com)
- [0xbow](https://0xbow.io)
- [SSRN Paper: Blockchain Privacy and Regulatory Compliance (Buterin, Soleimani, Schär et al., 2023)](https://ssrn.com/abstract=4563364)
- [Vitalik blog: What do I think about biometric proof of personhood? (Privacy Pools context)](https://vitalik.eth.limo/general/2023/09/06/privacy.html)
- [Mainnet Entrypoint on Etherscan](https://etherscan.io/address/0x6818809EefCe719E480a7526D76bD3e561526b46)
