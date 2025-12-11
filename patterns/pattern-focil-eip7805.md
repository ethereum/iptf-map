---
title: "Pattern: FOCIL - Fork-Choice Enforced Inclusion Lists"
status: draft
maturity: not yet recommended
rollout-plan: glamsterdam or later forks
works-best-when:
  - Censorship resistance is critical
  - Block builders concentrate power and may censor transactions
  - Same-slot transaction inclusion guarantees needed
avoid-when:
  - Mempool visibility of transaction details is unacceptableh
dependencies: [EIP-7805]
---

## Intent

FOCIL (Fork-Choice Enforced Inclusion Lists) is an EIP that enables a committee of 16 validators to force-include transactions in blocks, preventing censorship by sophisticated block builders. FOCIL itself does not provide privacy, transactions remain fully visible in the public mempool and on-chain. It only guarantees that transactions cannot be censored once submitted to the mempool.

## Protocol (concise)

1. Committee Selection (Slot N), a committee of 16 validators is selected for slot N to build ILs for slot N+1
2. IL Construction (t=0-8s), committee members monitor the public mempool and construct ILs (max 8 KiB) containing transactions they want force-included
3. IL Broadcasting (t=8s), Committee members gossip their signed ILs over the P2P network after processing slot N's block
4. View Freeze (t=9s), All validators freeze their view of ILs; no new ILs accepted after this deadline; equivocation detection active
5. Block Building (t=11s), Builder for slot N+1 collects all ILs and updates execution payload to include IL transactions (anywhere in block)
6. Block Proposal (Slot N+1, t=0s), Proposer broadcasts block with IL transactions included
7. Attestation (t=4s), Attesters verify all non-equivocated IL transactions are included (or invalid); only attest if satisfied
8. Fork-Choice Enforcement, Blocks failing to satisfy ILs receive no attestations and cannot become canonical

## Guarantees

- **Censorship Resistance Under Builder Centralization:** 1-out-of-16 honesty assumption—single honest IL committee member prevents transaction censorship by decoupling block building from validation
- **Same-Slot:** No delay—constraints for slot N+1 include transactions from slot N (vs 1-slot delay in forward ILs)
- **Anywhere-in-Block:** Builder chooses transaction placement, reducing incentive for side channels
- **Fork-Choice Enforced:** Non-compliant blocks cannot achieve finality; attesters reject blocks not satisfying ILs
- **No Privacy:** Transaction details remain fully visible in mempool and on-chain

## Trade-offs

- **Performance:** Additional bandwidth for IL gossip (up to 16 × 8 KiB per slot); potential O(n²) validity checks if naively implemented
- **Liveness Risk:** Builder must be well-connected to IL committee; insufficient time between view freeze (t=9s) and block broadcast risks missed ILs
- **Equivocation Handling:** P2P rule allows forwarding up to 2 ILs per committee member; equivocators ignored but bandwidth can double in worst case
- **No Direct Incentives:** Relies on altruistic behavior—no explicit rewards for IL committee members
- **Complexity:** Requires consensus layer fork-choice changes, execution layer validation, and coordinated P2P network updates

## Example

**Institutional Payment Censorship Resistance (No Privacy):**

1. Bank A submits stablecoin payment transaction (€5M EURC transfer) to public mempool at t=0s of slot N, transaction details fully visible to all observers
2. IL committee member (validator 42) sees Bank A's public transaction and includes it in their IL, broadcasts at t=8s
3. View freezes at t=9s—all validators store validator 42's IL containing Bank A's payment
4. Builder for slot N+1 collects IL at t=11s, verifies Bank A has sufficient balance/correct nonce, includes payment in block
5. Attesters at t=4s verify Bank A's payment is in block (or invalid); all attest to block
6. Result: Even if builder wants to censor Bank A (OFAC compliance, MEV extraction, competitive intelligence), fork-choice enforcement prevents censorship
7. Privacy impact: NONE, amount (€5M), counterparty, and timing remain publicly visible throughout the process

**Note:** For privacy-preserving institutional payments, FOCIL must be combined with other patterns like [Private Stablecoin Shielded Payments](./pattern-private-stablecoin-shielded-payments.md) or [Privacy L2s](./pattern-privacy-l2s.md).

## See also

- [Pre-trade Privacy (Shutter/SUAVE)](./pattern-pretrade-privacy-shutter-suave.md) — complementary pattern for hiding transaction content before inclusion
- [EIP-7547](https://eips.ethereum.org/EIPS/eip-7547) — forward inclusion lists (1-slot delay vs same-slot in FOCIL)
- [Private Payments Approach](../approaches/approach-private-payments.md) — FOCIL ensures inclusion; private payments hide content
- [Verifiable Attestation](./pattern-verifiable-attestation.md) — attesters validate IL satisfaction before attesting
