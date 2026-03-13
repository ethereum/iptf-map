---
title: "Pattern: Safe Proof Delegation"
status: draft
maturity: PoC
layer: L1
privacy_goal: Delegate proof generation to an untrusted prover without trusting it with funds
assumptions: Intent-based authorization, ZK proof system, two-secret key model
last_reviewed: 2026-03-13
works-best-when:
  - Users cannot generate ZK proofs locally (mobile, hardware wallets).
  - A server-side prover or Privacy RPC bridges the gap before native wallet support.
  - Delegation must be revocable without moving funds.
avoid-when:
  - Client-side proving is already available and performant.
  - The prover seeing transaction details is unacceptable even temporarily.
dependencies:
  - ZK proof system (commitments/nullifiers)
  - Poseidon hash (intent digest)
  - EIP-8182 (draft)
---

## Intent

Let a user delegate ZK proof generation to an external prover — a Privacy RPC, a hardware accelerator, or a third-party service — without giving that prover the ability to forge, redirect, or overspend. The user signs a **canonical intent digest** that binds every material parameter; the prover can only produce a valid proof that executes exactly that intent.

## Ingredients

- **Canonical intent digest**: Poseidon hash binding all material parameters (operation kind, token, recipient, amount, nonce, expiry, chain ID, and additional fields like policy version and pool address per the current EIP-8182 draft)
- **Two-secret key model**: immutable `nullifierKey` (controls spending) + rotatable `viewingSecret` (controls note decryption)
- **Intent nullifier set**: separate on-chain nullifier set preventing intent replay
- **ZK circuit**: verifies the signed intent and witness data, outputs a spend proof

## Protocol (concise)

1. **User signs intent.** Wallet computes the canonical intent digest and signs it. The digest binds all material parameters (see Ingredients). This is never broadcast.
2. **User sends to prover.** The signed intent plus witness data (note openings, Merkle paths, keys) are transmitted to the prover over an encrypted channel.
3. **Prover generates proof.** The prover runs the ZK circuit. The circuit checks: signature matches `authorizingAddress`, all parameters match the intent digest, notes are valid, and value is conserved.
4. **Prover submits on-chain.** The proof and public inputs go to the pool contract. The contract verifies the proof, consumes note nullifiers, and records the intent nullifier to prevent replay.
5. **Prover boundaries enforced.** The prover **can** see transaction details and choose submission timing. The prover **cannot** change the recipient, amount, or token — any deviation invalidates the proof. Expiry limits the prover's timing window.
6. **Revoke forward visibility.** User rotates `viewingSecret`, generating a new viewing key. The former prover can no longer decrypt future note memos. The immutable `nullifierKey` means existing notes remain spendable without migration.

## Guarantees

- **No fund custody.** The prover never holds keys that can unilaterally spend. Every spend requires a user-signed intent.
- **Tamper-proof intents.** Modifying any parameter (recipient, amount, token) breaks the proof.
- **Replay prevention.** Intent nullifiers form a separate set; each signed intent can execute exactly once.
- **Revocable delegation.** Rotating `viewingSecret` cuts off a former prover's ability to see new notes without affecting spendability.

## Trade-offs

- **Prover sees plaintext.** The prover learns transaction details (amount, recipient, token). Mitigable via TEE-hosted provers or MPC proving, at higher complexity.
- **Liveness dependency.** If the prover is offline, the user cannot transact until they switch provers or generate proofs locally.
- **Expiry tuning.** Too short and transactions fail before submission; too long and a compromised prover has a wider replay-like window (though still bound to the exact intent parameters).
- **Viewing key rotation cost.** After rotation, the wallet must retain prior `viewingSecret` values to decrypt notes encrypted under older keys. Notes received during or before the transition window are only recoverable with the corresponding old secret. The new key only covers notes encrypted after rotation.

## Example

- Alice uses a mobile wallet that cannot generate ZK proofs. She signs an intent to send 100 USDC to Bob, with a 10-minute expiry. Her Privacy RPC generates the proof and submits it on-chain within 3 minutes. The RPC sees the transfer details but cannot redirect funds. When Alice later switches to a different RPC provider, she rotates her viewing key — the old provider can no longer decrypt her future note memos.

## See also

- [L1 ZK Commitment Pool](pattern-l1-zk-commitment-pool.md) - the pool contract this delegation targets
- [Shielded ERC-20 Transfers](pattern-shielding.md) - general shielded transfer mechanics
- [Permissionless Spend Auth](pattern-permissionless-spend-auth.md) - inner/outer circuit split this delegation composes with
- [EIP-8182 (draft)](https://github.com/ethereum/EIPs/pull/11373)
