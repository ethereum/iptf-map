---
title: "Pattern: Immutable Guarantees"
status: ready
maturity: concept
type: standard
layer: hybrid
last_reviewed: 2026-06-18

works-best-when:
  - An institutional deployment uses admin keys, upgradeable contracts, or governance roles that could in principle be turned against users.
  - End users or auditors need a definitive answer to which properties hold regardless of admin action, governance vote, or upgrade.
  - The deployment must satisfy non-custodial criteria for regulators or platform listings (L2Beat Stage 1 or higher).

avoid-when:
  - The contract is fully immutable with no admin surface; this pattern adds no value over the deployment itself.
  - Regulatory regime mandates operator override for freeze, clawback, or balance disclosure on every asset; immutable guarantees conflict with that posture by construction.

context: both
context_differentiation:
  i2i: "Between institutions, immutable guarantees bind counterparty admin scope. Even if one side's keys are compromised or its governance turns hostile, the other side can settle, exit, and audit without the compromised party's cooperation. Legal recourse binds the residual risk, but immutability removes the highest-impact unilateral actions from the table."
  i2u: "For end users, immutable guarantees are the substitute for the legal recourse they do not have. The operator holds structural power; the user has no contract, no negotiating position, and no way to enforce promises. The CROPS rubric requires that the user's exit, ownership, and privacy guarantees be enforced by code that no admin action can reach. Operational parameters (fees, sanctions list, paused flag) may still be upgradeable; safety invariants may not."

crops_profile:
  cr: high
  o: yes
  p: partial
  s: high

crops_context:
  cr: "Reaches `high` only when the immutable invariants include the withdrawal path itself. If withdrawal logic sits behind an upgradeable proxy, the rating collapses regardless of how many other invariants are immutable. Drops to `medium` when timelocks exist but exit windows are shorter than the maximum withdrawal latency."
  o: "Requires public, verifiable bytecode and a published invariant set tied to specific contract addresses or verifier instances. Drops to `partial` when the immutable contracts are public but the proxy boundary (which selectors are upgradeable) is not documented."
  p: "Preserves the privacy guarantees of the underlying primitive; does not add privacy on its own. Reaches `full` only when paired with a primitive whose privacy property is itself one of the immutable invariants (no break-glass key escrow, no admin-reachable viewing key)."
  s: "Replaces trust in admin discipline with trust in code review of a narrower surface. The constrained proxy boundary becomes the high-stakes audit target. Rides on the soundness of whatever invariants are claimed, the deployed bytecode actually matching the published source, and a non-censoring L1 inclusion path."

post_quantum:
  risk: medium
  vector: "Immutable verifiers freeze the proof system in place. A BN254 verifier deployed today cannot be swapped out when a cryptographically relevant quantum computer arrives; users are locked into the original cryptography for the lifetime of the deployment."
  mitigation: "Anticipate PQ at deployment time with STARK-based or hash-based verifiers, or design a hybrid verifier interface where adding a post-quantum proof system is itself one of the operational (upgradeable) parameters while the existing classical verifier remains immutable for legacy notes."

standards: [EIP-1967]

related_patterns:
  composes_with: [pattern-forced-withdrawal, pattern-permissionless-spend-auth]
  see_also: [pattern-l2-privacy-evaluation, pattern-modular-privacy-stack, pattern-hybrid-public-private-modes]
---

## Intent

An institutional deployment with admin keys, upgrade authority, and compliance controls cannot be analyzed by what the operator promises to do. It must be analyzed by which properties are enforced by deployed code, append-only state, and L1 consensus, independent of any admin path. This pattern is the discipline of separating mutable operational parameters from immutable safety invariants, then publishing a specific list of properties (each tied to a contract, verifier, or consensus rule) that survive a hostile operator, a coerced institution, or full admin key compromise.

## Components

- Immutable core contracts hold the safety invariants. Typical members: the ZK verifier, the nullifier registry, the withdrawal logic, and the commitment-tree root storage. Deployed without upgrade authority and never proxied.
- Constrained proxy boundary is a deliberately narrow upgradeable surface for operational parameters (fee rate, sanctions list root, per-asset paused flag, KYC root). The set of upgradeable function selectors is fixed at deployment and documented.
- Timelock with mandatory exit window gates every change behind the constrained proxy. The exit window must be at least the maximum user withdrawal latency, so that any user can exit at the old rules before the new ones bind.
- Append-only commitment structure (Merkle root extension, no re-rooting) so history cannot be rewritten by upgrade.
- Published invariant set lists each guaranteed property with a pointer to the immutable contract or verifier that enforces it. Auditable by reading deployed bytecode, not by reading documentation.

The audit target shifts: the constrained proxy is now the high-stakes surface, because any path from a proxy selector to a structural storage slot breaks the whole guarantee.

## Protocol

1. [issuer] Enumerate every admin-callable function and every storage slot. Label each one operational or structural.
2. [issuer] Deploy structural logic to a non-upgradeable contract. Verify post-deployment that no admin role on any related contract holds a path that can mutate the structural state.
3. [issuer] Deploy operational parameters behind a constrained proxy whose upgrade selectors are restricted to the operational set. EIP-1967 storage layout, with the implementation slot itself gated by a timelock.
4. [issuer] Configure the timelock: delay greater than or equal to the user withdrawal latency, with a mandatory exit window during which the prior implementation remains callable.
5. [issuer] Publish the invariant set. Each line names a property and the address that enforces it.
6. [auditor] Verify by reading deployed bytecode and proxy admin storage that no path from any admin role can alter the listed invariants. Re-derive independently from the documentation.
7. [user] On any upgrade announcement, decide within the exit window whether to remain or to exit at the old rules.

## Guarantees & threat model

Each guarantee must point to a specific immutable contract or verifier; a guarantee without a code-level anchor is not part of this pattern.

Typical guarantees:

- No upgrade can prevent withdrawal of in-flight funds. Withdrawal contract and verifier are immutable; the nullifier registry is append-only.
- No admin function can reveal a shielded balance retroactively. No key-escrow selector exists in the immutable surface; no operational parameter can install one later.
- No governance vote can disable nullifier checks. The nullifier registry is immutable, so double-spend bypass is unreachable.
- Users have at least T days between upgrade announcement and binding effect, with the prior implementation callable throughout the window.

Threat model:

- Full compromise of every admin key (multisig, governance, emergency role) at once.
- Hostile governance vote that targets a specific user or class of users.
- Coercion of the deploying institution by a state actor or third party.
- Non-censoring L1 inclusion path for exit transactions.
- Out of scope: bugs in the immutable code itself; this pattern moves trust to code review of a narrow surface, it does not eliminate trust. Social-layer attacks on the published invariant set (issuer publishes an invariant that does not match deployed bytecode) are out of scope but detectable by auditors.

## Trade-offs

- Reduced operational flexibility. Fixing a bug inside an immutable invariant requires a parallel deployment and a user-initiated migration; users who do not migrate live with the original bug indefinitely.
- Regulatory tension. Regulators may want override capability for freeze, clawback, or balance disclosure. Immutable guarantees make these impossible by construction. The institution can offer compliance via the operational surface (sanctions list root, paused flag) but cannot offer unilateral seizure.
- Audit cost concentrates at the proxy boundary. Every selector reachable through the constrained proxy must be reviewed for whether it can transitively reach a structural slot. A single missed selector breaks the whole guarantee.
- Post-quantum lock-in. Immutable verifiers cannot be swapped when CRQC arrives; the original cryptographic assumptions hold for the lifetime of the deployment. See [Post-Quantum Threats](../domains/post-quantum.md) and the hybrid-verifier mitigation in the frontmatter.
- Migration friction. Each new version is effectively a parallel pool with its own anonymity set, so improvements cannot be back-applied to existing positions.

## Example

A bank deploys a private payment L2 with retail end users. Immutable contracts hold the ZK verifier, the nullifier registry, the withdrawal logic, and the commitment tree root storage. A constrained proxy, behind a 14-day timelock with a 21-day exit window, holds the fee rate, the sanctions list Merkle root, and the per-asset paused flag.

The published invariant set is four lines, each pinned to a deployed address: no admin can move notes (nullifier registry, immutable), reveal balances (verifier, no key-escrow selector), prevent withdrawal (withdrawal contract, callable independent of the paused flag), or re-root the commitment tree (append-only).

A regulator orders the bank to freeze a specific user. The bank can flip the global paused flag (operational), but the user still calls the immutable withdrawal contract directly because the invariant declares it independent of the paused flag. The freeze affects new deposits, not in-flight exits. Unilateral seizure, reveal, and history rewrites are not reachable from any admin path.

## See also

- [L2Beat Stages Framework](https://l2beat.com/stages): maturity classification distinguishing operational upgrades from invariant violations.
- [Ethical Risk Analysis of L2 Rollups (2025)](https://arxiv.org/html/2512.12732v1): documents that 86% of 129 L2 projects allow instant contract upgrades without exit windows, illustrating the gap this pattern is meant to close.
- [EIP-1967](https://eips.ethereum.org/EIPS/eip-1967): standardized proxy storage slots; the constrained proxy boundary builds on this.
