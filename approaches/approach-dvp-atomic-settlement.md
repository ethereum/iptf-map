---
title: "Approach: Atomic DvP Settlement"
status: draft
last_reviewed: 2026-05-05

use_case: private-bonds
related_use_cases: [private-derivatives, private-corporate-bonds, private-government-debt, private-rwa-tokenization]

primary_patterns:
  - pattern-dvp-erc7573
  - pattern-commit-and-prove
supporting_patterns:
  - pattern-erc3643-rwa
  - pattern-mpc-custody
  - pattern-private-pvp-stablecoins-erc7573
  - pattern-tee-zk-settlement

iptf_pocs:
  folder: pocs/private-trade-settlement
  requirements: pocs/private-trade-settlement/REQUIREMENTS.md
  pocs:
    - name: "TEE+ZK Cross-Chain Swap"
      sub_approach: "Conditional Transfer with Oracle"
      spec: pocs/private-trade-settlement/tee_swap/SPEC.md
      status: implemented

open_source_implementations:
  - url: https://github.com/finos/finos
    description: "FINOS reference implementations for cross-chain DvP (ERC-7573)"
    language: Solidity
---

# Approach: Atomic DvP Settlement

## Problem framing

### Scenario

An asset manager sells a EUR 1M corporate bond position to a bank on an L2 network. Both parties want assurance that the bond and the EURC payment exchange atomically: either both legs settle or neither does, with deterministic recovery if a leg fails. The same primitive must serve derivatives margin and termination flows.

### Requirements

- Both legs complete atomically or neither does; no partial settlement
- Counterparty risk is structurally eliminated (assets in escrow, not held by the other party)
- Deterministic conditions and timeouts; clear failure semantics for legal review
- Composable with EIP-6123 derivative lifecycle and ERC-3643 securities

### Constraints

- Single-network atomicity is inherent in transaction execution; cross-network atomicity requires trusted intermediaries or oracles
- Capital is locked during the settlement window; lockup duration is a design parameter
- Escrow contracts are practically immutable in production; upgrades imply migration

## Approaches

### Hash Time-Locked Contracts (HTLC)

```yaml
maturity: prototyped
context: i2i
crops: { cr: high, o: yes, p: partial, s: high }
uses_patterns: [pattern-dvp-erc7573]
example_vendors: []
```

**Summary:** Payment and asset are each locked to a hash; revealing the preimage releases both legs.

**How it works:** The seller generates secret S and shares H(S). The buyer locks payment with H(S) and timeout T1; the seller locks the asset with H(S) and timeout T2 < T1. The seller reveals S to claim payment, which makes S public; the buyer uses S to claim the asset before T1. If S is never revealed, both sides refund at their respective timeouts.

**Trust assumptions:**
- Hash function preimage resistance
- L1 (or L2) consensus for transaction inclusion within timeout windows
- No trusted third party

**Threat model:**
- Network congestion at the timeout boundary can strand a leg
- T2 < T1 ordering must hold; mis-parameterization breaks atomicity
- Free-option problem: the holder of S chooses whether to reveal, which has implicit option value

**Works best when:**
- Counterparties are unknown or untrusted
- Single-network atomic swaps where capital lockup is acceptable
- Cross-chain atomic swaps where each chain supports HTLC

**Avoid when:**
- Free-option exposure must be eliminated (use escrow instead)
- Assets do not tolerate the lockup window required by safe timeout margins

### Escrow with Dual Approval

```yaml
maturity: prototyped
context: i2i
crops: { cr: medium, o: yes, p: partial, s: high }
uses_patterns: [pattern-mpc-custody, pattern-erc3643-rwa]
example_vendors: []
```

**Summary:** Both legs are deposited to an escrow contract; release requires approvals from both parties or, on dispute, an arbitrator decision.

**How it works:** The escrow holds both legs atomically. After deposits and off-chain or oracle-attested condition verification, both parties sign a release transaction; the escrow atomically swaps the legs. A configurable dispute window allows arbitration before final release.

**Trust assumptions:**
- Escrow contract correctness (audited, ideally formally verified)
- Arbitrator (if invoked) is trusted by both parties
- Oracle correctness if external conditions gate release

**Threat model:**
- Counterparty refuses to sign release; recovery via arbitrator or timeout
- Arbitrator collusion or compromise distorts disputed releases
- Escrow bug results in asset loss; mitigated by audits and insurance

**Works best when:**
- Known counterparties with established legal relationships
- Settlement involves human-in-the-loop conditions or off-chain verification
- Dispute-resolution paths must be explicit for legal review

**Avoid when:**
- Trustless settlement is required and arbitrator dependency is unacceptable
- Settlement must be sub-second; arbitration adds latency

### Conditional Transfer with Oracle

```yaml
maturity: prototyped
context: i2i
crops: { cr: medium, o: partial, p: partial, s: medium }
uses_patterns: [pattern-dvp-erc7573, pattern-private-pvp-stablecoins-erc7573, pattern-tee-zk-settlement]
poc_spec: pocs/private-trade-settlement/tee_swap/SPEC.md
example_vendors: []
```

**Summary:** Asset and payment are locked; an oracle attests to an external condition; attestation triggers atomic settlement.

**How it works:** Both legs are deposited into escrow with a condition predicate (price bound, regulatory event, payment confirmation). An oracle monitors the condition and submits an attestation when it is met; the escrow validates the attestation and executes the atomic swap. A fallback path handles oracle non-response.

**Trust assumptions:**
- Oracle integrity (single oracle or quorum, depending on design)
- Condition specification is unambiguous and enforceable
- Fallback path is funded and reachable

**Threat model:**
- Oracle compromise or compelled disclosure misroutes settlement
- Condition ambiguity drives disputes; mitigated by precise specification and arbitration
- Oracle outage blocks settlement; mitigated by multi-oracle quorum and manual fallback

**Works best when:**
- Settlement is event-driven (derivatives expiry, cross-network payment confirmation)
- Cross-network DvP is needed and ERC-7573 oracle is acceptable
- Condition can be expressed as a verifiable attestation

**Avoid when:**
- Trusted oracle is incompatible with the threat model
- Conditions cannot be specified precisely enough for unambiguous attestation

**Implementation notes:** PoC at [TEE+ZK Cross-Chain Swap](https://github.com/ethereum/iptf-pocs/tree/master/pocs/private-trade-settlement/tee_swap) implements the oracle-attested variant where a TEE coordinator stands in for the oracle, generates a zero-knowledge proof of correct execution, and reveals stealth keys on success. See [Approach: Private Trade Settlement, TEE+ZK Coordination](approach-private-trade-settlement.md) for the same primitive in cross-network context. Common escrow-condition shapes:

| Class | Example |
|---|---|
| Time-based | Settlement date (T+2 bond settlement); lock period (vesting); expiry (failed-trade cleanup) |
| Event-based | Payment finality confirmation; regulatory approval; multi-sig threshold approval |
| Value-based | Price-bound limit orders; collateral-ratio margin calls; net settlement against batched obligations |

For derivative contracts using EIP-6123 lifecycle management, the DvP integration maps onto each lifecycle event:

| EIP-6123 lifecycle event | DvP integration |
|---|---|
| Trade confirmation | Lock initial margin in escrow |
| Valuation update | Adjust escrow based on mark-to-market |
| Margin call | Conditional release requires margin top-up |
| Settlement | Final exchange of payment vs position closure |
| Early termination | Escrow handles close-out netting |

## Comparison

| Axis | HTLC | Escrow with Dual Approval | Conditional Transfer with Oracle |
|---|---|---|---|
| **Maturity** | prototyped | prototyped | prototyped |
| **Context** | i2i | i2i | i2i |
| **CROPS** | CR:hi O:y P:part S:hi | CR:med O:y P:part S:hi | CR:med O:part P:part S:med |
| **Trust model** | Trustless (hash + timeout) | Counterparties + arbitrator | Oracle |
| **Privacy scope** | Public escrow contract; preimage and timing visible | Public escrow; party identities visible | Public escrow + oracle attestation |
| **Performance** | Two transactions per leg | Deposit + dual signature + release | Deposit + attestation + release |
| **Operator req.** | None | Arbitrator on dispute | Oracle (single or quorum) |
| **Cost class** | Low | Medium (dispute path) | Medium (oracle infra) |
| **Regulatory fit** | Strong for trustless contexts | Strong with named arbitrator | Conditional on oracle governance |
| **Failure modes** | Network congestion at timeout; free-option | Counterparty stalls; arbitrator compromise | Oracle outage or compromise |

## Persona perspectives

### Business perspective

For institutional bond settlement among known counterparties, **Escrow with Dual Approval** is the right default: it matches the human-in-the-loop nature of traditional settlement, accommodates compliance and operational checks before release, and provides an explicit dispute path that legal review can rely on. **HTLC** suits trustless contexts (cross-chain atomic swaps, dealer-to-dealer settlement with no prior relationship) but exposes a free-option problem that institutional desks penalize. **Oracle-based settlement** wins for event-driven flows (derivatives expiry, cross-network DvP via ERC-7573) where the trigger is external; the operational burden is the oracle governance rather than the contract itself.

### Technical perspective

HTLC is the simplest contract surface but the trickiest to parameterize: T2 < T1 with margins for network congestion is load-bearing, and incident response on a stalled leg has no recovery path beyond timeout. Escrow contracts are larger but easier to reason about: deposit, verify, release, refund, with clear state machines for each branch. Oracle-based settlement adds the oracle-integration surface (push vs pull, single vs quorum, fallback semantics) and inherits the attestation infrastructure's failure modes. Cross-network atomicity is the open frontier: ERC-7573 is the working draft, but trustless cross-chain DvP remains unresolved.

### Legal & risk perspective

HTLC offers the cleanest deterministic outcome, preimage revealed or timeout, which legal teams can document precisely. Escrow with named arbitrator maps onto existing arbitration frameworks (LCIA, ICC) and is the natural fit when counterparties already have a legal relationship. Oracle-based settlement requires legal classification of the oracle's role (data provider, attestation issuer, fiduciary?) and audit access to the oracle's evidence trail. For each option, the dispute and recovery path must be modelled explicitly: timeout refund, arbitrator decision, oracle non-response, escrow bug.

## Recommendation

### Default

For institutional bond and derivative DvP among known counterparties on a single network, default to **Escrow with Dual Approval**, integrated with ERC-3643 for security tokens and EIP-6123 for derivative lifecycle. The arbitration path is named in the trade documentation; the oracle (if invoked) is scoped to specific external triggers (e.g., regulatory approval, payment finality).

### Decision factors

- If counterparties are unknown or trust is structurally absent, choose **HTLC** and accept the free-option exposure.
- If settlement is event-driven and the trigger is external (derivatives expiry, cross-network payment), choose **Conditional Transfer with Oracle**, ideally via ERC-7573.
- If cross-network atomicity is required, plan to compose **HTLC** or **Oracle**-based settlement with ERC-7573 coordination; trustless cross-chain DvP remains an open problem.

### Hybrid

Bond DvP can run primary settlement through Escrow with Dual Approval and fall back to a timed unilateral refund path on counterparty non-response, with an oracle attesting to payment finality on an external rail. Derivatives lifecycle (EIP-6123) calls into the same escrow for margin lock and final settlement, with the oracle gating margin calls and termination events.

## Open questions

1. **Trustless cross-network DvP.** Without a trusted oracle or intermediary, cross-chain atomicity is unsolved; ERC-7573 acknowledges this as an open problem.
2. **Free-option pricing.** HTLC's free-option problem is well-known but underpriced in institutional contexts; how should it be hedged or contractually offset?
3. **Oracle governance for institutional DvP.** What governance model satisfies regulator audit expectations for ERC-7573 oracles?
4. **Privacy of escrow state.** Standard escrow contracts publish trade IDs and party identities; privacy-preserving DvP requires composing with shielded pools or [Commit and Prove](../patterns/pattern-commit-and-prove.md).
5. **Settlement-window calibration.** Network congestion margins for HTLC timeouts and escrow dispute windows are deployment-specific; no canonical guidance.

## See also

### Related patterns

- [Atomic DvP via ERC-7573](../patterns/pattern-dvp-erc7573.md) - Cross-network DvP coordination
- [ERC-3643 RWA Tokenization](../patterns/pattern-erc3643-rwa.md) - Compliant security tokens
- [MPC Custody](../patterns/pattern-mpc-custody.md) - Secure key management for escrow
- [Commit and Prove](../patterns/pattern-commit-and-prove.md) - Privacy-preserving condition verification
- [Private PvP Stablecoins via ERC-7573](../patterns/pattern-private-pvp-stablecoins-erc7573.md)

### References

- [EIP-6123 spec](https://eips.ethereum.org/EIPS/eip-6123) - Smart Derivative Contract standard
- [ERC-7573 spec](https://ercs.ethereum.org/ERCS/erc-7573) - Cross-network settlement standard
