---
title: "Pattern: Social Recovery"
status: draft
maturity: production
layer: hybrid
privacy_goal: Restore account control or identity anchor through a guardian quorum without issuer or custodian involvement
assumptions: Smart-contract account or identity anchor exposes an owner-rotation entry point, guardian set fixed before key loss, on-chain timelock for cancellation
last_reviewed: 2026-04-23
works-best-when:
  - The signing key can be lost or compromised independently of the account contract
  - Holder has durable out-of-band trust relationships (devices, hardware wallets, institutions, email or SMS services)
  - A rotation window of hours to weeks is acceptable
avoid-when:
  - Holder cannot nominate independent guardians they trust more than a plausible attacker
  - Recovery must finalize without a cancellation window
  - Guardian set cannot be kept current
dependencies: [ERC-4337, EIP-7702, smart-contract account with owner-rotation hook]
context: both
crops_profile:
  cr: medium
  os: yes
  privacy: partial
  security: medium
---

## Intent

Let a quorum of guardians authorize rotation of the signing key or enrollment anchor for an account or identity. A holder recovers after key loss or compromise without the original issuer, custodian, or centralized service.

## Ingredients

- **Recoverable account**: smart-contract wallet or identity anchor with an owner-rotation function gated on a quorum signature. ERC-4337 accounts and EIP-7702 delegated EOAs both fit.
- **Guardian set**: N guardians stored on-chain or as a Merkle commitment. Guardians can be EOAs, hardware wallets, institutional keys, an m-of-n Safe, or managed email and SMS attestation services.
- **Threshold policy**: M-of-N quorum, with M large enough to resist expected collusion.
- **Timelock**: cancelable security window between proposal and finalization.
- **Optional ZK guardian proof**: membership proof over a guardian commitment so the guardian set is not exposed on-chain. See [Verum Lotus](https://github.com/verumlotus/social-recovery-wallet).

## Protocol (concise)

1. **Setup**. Holder registers N guardians and threshold M on the account or identity anchor.
2. **Initiate**. On key loss, M guardians sign a recovery proposal naming the new owner key or new enrollment commitment.
3. **Timelock**. Contract records the proposal and starts the security window. The current owner, if reachable, can cancel. Deployed windows range from 36 hours ([Argent on-chain recovery](https://support.argent.xyz/hc/en-us/articles/360007338877-How-to-recover-my-wallet-with-guardians-onchain-complete-guide)) to 14 days ([Candide module default on Safe](https://safefoundation.org/blog/introducing-candides-social-recovery)).
4. **Finalize**. After the window passes, anyone can execute the rotation. The new owner takes control and the prior signing key is revoked.
5. **Audit**. The rotation event, guardian signatures, and new owner are logged. A rotation counter or nullifier prevents replay of the same proposal.

## Guarantees

- **Recovery path** with no issuer, custodian, or centralized service in the loop.
- **Cancelable rotation**: the timelock gives the holder a window to block unauthorized proposals if the original key is still reachable.
- **I2U**: guardians are the user's chosen trust graph. Email and SMS services work as guardians alongside personal devices.
- **I2I**: guardians are other institutional keys or an internal MPC quorum tied to governance policy.
- **Identity anchor variant**: in the issuer-independent enrollment flow, guardians authorize rotation of the enrollment key bound to the on-chain commitment, not of a credential. See [Approach: Private Identity, Section F](../approaches/approach-private-identity.md#f-issuer-independent-enrollment-via-distributed-oprf).

## Trade-offs

- **Guardian collusion**. A compromised quorum can force a malicious rotation. The timelock and holder cancellation are the defenses.
- **Stale sets**. Guardian membership degrades if the holder does not keep it current. Lost or captured guardians reduce effective security without any on-chain signal.
- **Privacy of the social graph**. By default, the guardian set is visible on-chain. ZK-guardian variants hide identities until recovery, raising privacy toward `full` at the cost of circuit overhead.
- **Timelock is a direct trade**. Longer windows give stronger cancellation guarantees and worse recovery responsiveness. 36 hours favors live holders; 14 days favors defense against silent key theft.
- **Anti-coercion for identity recovery is open**. See [Resilient Identity Continuity open questions](../use-cases/resilient-identity-continuity.md#6-open-questions).
- **Post-quantum exposure**. Guardian signatures inherit the exposure of their signing schemes. See [Post-Quantum Threats](../domains/post-quantum.md).

## Example

A holder loses their phone. Three of five nominated guardians, two friends' wallets and one hardware wallet, sign an on-chain recovery proposal naming a new device key. A 48-hour timelock runs; no cancellation arrives. The account contract rotates the owner. Funds, permissions, and on-chain history are preserved. No service provider participated.

## See also

- [MPC Custody](pattern-mpc-custody.md): threshold-signing alternative for institutional custody, where recovery is a policy-engine decision rather than a guardian quorum.
- [Native Account Abstraction](pattern-native-account-abstraction.md): EIP-8141 validation frames let recovery logic live in the account itself.
- [Safe Proof Delegation](pattern-safe-proof-delegation.md): rotate authorization without moving funds.
- Implementations: [Argent / Ready](https://www.ready.co/), [Candide social recovery module for Safe](https://safefoundation.org/blog/introducing-candides-social-recovery), [zkEmail account recovery](https://prove.email/) (live on Safe and Clave mainnet).
- Prior art: [Vitalik on social recovery (2021)](https://vitalik.eth.limo/general/2021/01/11/recovery.html).
