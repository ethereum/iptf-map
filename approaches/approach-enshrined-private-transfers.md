# Approach: Enshrined Private Transfers

**Use Case Links:** [Private Stablecoins](../use-cases/private-stablecoins.md), [Private Payments](../use-cases/private-payments.md)

**High-level goal:** A single canonical L1 privacy pool — upgraded via hard fork, authorized via wallet-signed intent transactions — that makes private transfers a default Ethereum primitive with the same security model as public transfers. This approach includes a [live demo](https://private.facet.org/), a [draft spec](https://hackmd.io/@tomlehman/enshrined-privacy-pool-eip), and [open source code](https://github.com/0xFacet/facet-private-demo).

## Overview

### Problem Interaction

Private transfers on Ethereum face three reinforcing problems:

1. **No wallet integration.** Privacy protocols work, but no mainstream wallet has integrated private transfers. Users must use separate "privacy wallets," keeping usage niche. There is no standard for how wallets should authorize private spends. Vitalik [called for exactly this](https://ethereum-magicians.org/t/a-maximally-simple-l1-privacy-roadmap/23459) — wallets should have a shielded balance and a "send from shielded balance" option, without requiring a separate privacy wallet. Today this still doesn't exist.
2. **Anonymity set fragmentation.** Privacy depends on the size of the crowd you're hiding in. Multiple competing pools (Railgun, Privacy Pools, future entrants) split users across incompatible systems, degrading privacy for everyone.
3. **Governance risk.** App-level privacy pools require an upgrade mechanism, which means a privileged path (multisig, governance token, admin key) that can change the rules. Even well-governed pools ask users to trust that upgrade path. L2-hosted pools inherit the L2's governance risk. Public ETH transfers don't require this trust.

These problems interact: fragmentation persists partly because there's no standard, and no standard sticks because there's no Schelling point. For privacy specifically, the Schelling point must also eliminate governance risk — users are depositing funds into a system whose entire value proposition is minimizing trust, and a privileged upgrade path contradicts that.

### Key Constraints

- Must work with existing wallets (MetaMask, hardware wallets) before native integration
- Must support ETH and arbitrary ERC-20s
- Compliance must be optional and user-initiated, never protocol-enforced
- Must not introduce consensus-level risk (no infinite-mint vectors)
- Upgrade mechanism must have L1-grade security (no on-chain governance)

### TLDR for Different Personas

- **Business:** One way to send money privately on L1 — same security as public transfers, compatible with compliance when needed
- **Technical:** System contract with UTXO notes, intent-transaction authorization, ZK spend proofs, and optional compliance proofs — upgradeable only by hard fork
- **Legal:** Full privacy by default; proof of innocence and issuer viewing keys available for regulated counterparties, never enforced on all users

## Architecture and Design Choices

### Intent Transaction Standard

A user authorizes a private transfer by signing an **intent transaction** — an ordinary EIP-1559 transaction that encodes the token, amount, and recipient, signed on a dedicated "intent chain" ID.

Two types:

1. **ETH transfers:** empty calldata, `value` is the amount, `to` is the recipient.
2. **ERC-20 transfers:** calldata is a standard `transfer(to, amount)` call, `value` is 0, `to` is the token contract.

A ZK proof demonstrates that the signature is valid and the sender owns sufficient funds inside the pool — without revealing the sender's identity or which notes were spent. The signed intent transaction is used only as private witness data; it is never broadcast.

This standard is independently useful — any privacy pool could adopt it. It gives wallets one interface to target regardless of which pool is used.

**Why reuse EIP-1559 signing?** Every existing wallet already knows how to produce this signature. No wallet changes, no new signing flows, no new transaction types. The wallet thinks it's signing a normal send on an unfamiliar network.

### Server-Side Proving (Adoption Bridge)

Client-side proof generation requires wallet integration. Before that exists, a **Privacy RPC** bridges the gap:

1. Wallet signs an intent transaction (thinks it's a normal send on an unfamiliar chain)
2. Wallet submits to a Privacy RPC endpoint instead of a real chain
3. RPC intercepts the signed intent, generates the ZK proof server-side, submits a real L1 transaction to the pool contract

The RPC sees the transfer details but cannot spend the user's funds. This is a weaker privacy model than client-side proving — mitigable via TEEs or MPC. Advanced users can self-host. This works today with MetaMask, hardware wallets, and any EIP-1559-capable signer, without any wallet changes.

The goal is to prove user demand and give wallets a reason to integrate the standard natively.

Prior art: the concept of a privacy-enabling RPC was first proposed by the [Nullmask team](https://nullmask.io/).

### System Contract (Enshrinement)

The core element is a privacy pool system contract deployed at a fixed address, in the style of [EIP-4788](https://eips.ethereum.org/EIPS/eip-4788):

- **Proxy upgradeable only by hard fork.** No admin key, no governance token, no multisig.
- **UTXO note commitments and spent nullifiers.** Standard shielded pool structure.
- **Address-to-viewing-key mapping.** Lets users send to normal Ethereum addresses/ENS names without a separate "privacy address."
- **Extensible authorization circuits.** The design supports adding new circuits (P-256 for passkeys, post-quantum signatures) sharing the same note tree, each deployed via hard fork.

**Why a system contract over deeper protocol integration?** A system contract contains the blast radius. A bug in the ZK scheme can at worst compromise funds held in the pool — via theft or lock — without affecting consensus or other contracts. Compare [EIP-7503](https://eips.ethereum.org/EIPS/eip-7503) (Zero-Knowledge Wormholes), which could mint infinite ETH if exploited.

**On ZK risk.** This design asks Ethereum to take on ZK-scheme risk it doesn't currently carry. A critical bug could compromise every asset in the pool. But the alternative for users isn't "no ZK risk" — it's depositing into an app-level pool with the same ZK risk plus governance risk on top. Enshrinement doesn't eliminate ZK risk; it eliminates governance risk from a category of system people are already using.

**Unresolved operational concerns:**

- Incident response path for circuit failures (how to pause/recover without an admin key)
- Migration mechanics for compromised or obsolete proving systems
- Backward compatibility policy for old notes/nullifiers across hard fork upgrades

### Compliance Layer (Optional, User-Initiated)

Design philosophy: full privacy by default, with compliance layered on top by those who need it, never enforced by the protocol.

**Proof of innocence.** Builds on [Privacy Pools research](https://privacypools.com/whitepaper.pdf). Every note carries a cryptographic label tracing its lineage to the original deposit(s). Association Set Providers (ASPs) publish sets of deposit labels they consider clean. A user can prove their note's ancestry resolves entirely to clean deposits — without revealing which deposits are theirs. This proof is optional, separate from the spend proof, and not enforced by the pool contract. Regulated counterparties can require it; everyone else ignores it.

**Issuer viewing keys.** Token issuers (e.g., Circle for USDC) can register a viewing key on-chain. The circuit encrypts transaction details for that token to the issuer's key. Scope is strictly per-token — Circle sees USDC movements and nothing else. ETH and tokens without a registered issuer key get full privacy with no visibility.

Both mechanisms are opt-out. A user who wants unconditional privacy simply doesn't generate a proof of innocence and uses tokens without issuer keys.

## More Details

### Trade-offs

**Enshrinement vs app-level pools:**

- **Enshrinement:** Eliminates governance risk, provides Schelling point for wallets, carries ZK-scheme risk at the protocol level
- **App-level:** No protocol-level ZK risk, but governance risk on upgrade path, anonymity set fragmentation across competing pools

**Server-side vs client-side proving:**

- **Server-side (Privacy RPC):** Works with existing wallets today, weaker privacy (RPC sees transfer details), mitigable via TEE/MPC
- **Client-side:** Full privacy, requires wallet integration, better long-term target

**System contract vs native state (EIP-7503-style):**

- **System contract:** Contained blast radius (pool funds only), no consensus impact from ZK bugs
- **Native state:** Potentially better UX/composability, but ZK bug = infinite mint = catastrophic consensus failure

**Issuer viewing keys:**

- **With:** Reduces issuer incentive to blacklist the pool contract, enables institutional adoption of privacy
- **Without:** Simpler system, but risk of adversarial response from major stablecoin issuers

### Open Questions

1. **Anonymity set migration:** How do users of existing pools (Railgun, Privacy Pools) migrate into the enshrined pool? What happens during the transition period where the anonymity set is still small?

2. **ASP governance:** Who runs Association Set Providers? What happens when ASPs disagree on which deposits are clean? Can ASPs be captured by regulators to effectively deanonymize users?

3. **L2 privacy pools as alternative:** L2s with validity proofs and immutable contracts could offer a similar governance profile to enshrinement. How does this compare?

4. **Circuit upgrade cadence:** How frequently can authorization circuits be added/updated via hard fork? Is the Ethereum hard fork cadence fast enough for cryptographic evolution?

5. **Multi-asset pool design:** Does one pool hold all assets, or is there a pool-per-token? What are the anonymity set implications of each?

6. **Privacy RPC trust requirements:** What exact trust and privacy guarantees must a Privacy RPC satisfy for mainstream wallet listing?

7. **Emergency circuit faults:** How should protocol upgrades handle emergency ZK circuit failures without permanent fund lock?

### Suggested Rollout Path

1. Deploy intent standard plus Privacy RPC bridge to prove demand and gather UX feedback.
2. Drive wallet-native client-side proving using observed demand.
3. Propose enshrined system-contract path for canonical L1 private transfers.

### Alternative Approaches Considered

**Hybrid L1/L2 model** (as in [Private Payments approach](../approaches/approach-private-payments.md)):

- Survey multiple privacy approaches, deploy across L1 and L2
- Trade-off: More flexibility, but anonymity set fragmentation and governance risk persist

**Privacy L2 only:**

- Move all private transfers to a dedicated privacy rollup (Aztec, etc.)
- Trade-off: Lower costs, but inherits L2 governance risk and requires bridging

## Links and Notes

- **Article:** [Ethereum Should Enshrine Private Transfers](https://x.com/dumbnamenumbers/status/2026112985215758547)
- **Spec:** [Enshrined Privacy Pool EIP (draft)](https://hackmd.io/@tomlehman/enshrined-privacy-pool-eip)
- **Demo:** [private.facet.org](https://private.facet.org/)
- **Code:** [0xFacet/facet-private-demo](https://github.com/0xFacet/facet-private-demo)
- **Standards:** [EIP-4788](https://eips.ethereum.org/EIPS/eip-4788), [EIP-7503](https://eips.ethereum.org/EIPS/eip-7503), [EIP-1559](https://eips.ethereum.org/EIPS/eip-1559)
- **Research:** [Privacy Pools whitepaper](https://privacypools.com/whitepaper.pdf), [Vitalik's L1 Privacy Roadmap](https://ethereum-magicians.org/t/a-maximally-simple-l1-privacy-roadmap/23459)
- **Prior art:** [Nullmask](https://nullmask.io/) (privacy-enabling RPC concept)
- **Patterns:** [L1 ZK Commitment Pool](../patterns/pattern-l1-zk-commitment-pool.md), [Shielded ERC-20 Transfers](../patterns/pattern-shielding.md), [Selective Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md)
- **Vendors:** [PrivacyPools](../vendors/privacypools.md)
- **Related Approaches:** [Private Payments](../approaches/approach-private-payments.md)
