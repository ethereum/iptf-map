# Atomic DvP Settlement

> Approach for atomic delivery-versus-payment settlement, applicable to
> [Private Bonds](../use-cases/private-bonds.md) and
> [Private Derivatives](../use-cases/private-derivatives.md).

## Overview

Settlement risk occurs when one party delivers an asset without receiving payment, or vice versa. This approach documents multiple mechanisms for achieving atomic settlement where both legs complete or neither does, eliminating counterparty risk.

**Relationship to [Atomic DvP via ERC-7573](../patterns/pattern-dvp-erc7573.md)**: The ERC-7573 pattern specifically addresses cross-network coordination using the ERC-7573 standard. This approach is more general, documenting the core atomicity mechanisms (HTLCs, escrow, oracles) that work on single networks or can be composed with ERC-7573 for cross-network scenarios.

### TLDR for different personas

- **Business**: Eliminates settlement risk - both legs complete or neither does. Reduces counterparty exposure and enables trustless settlement with unknown parties.
- **Technical**: Multiple implementation options: HTLCs for trustless atomic swaps, escrow with dual approval for institutional workflows, oracle-based for event-driven settlement. Can integrate with EIP-6123 for derivatives.
- **Legal**: Clear failure modes and timeout behaviors for dispute resolution. Deterministic outcomes based on explicit conditions. Automatic recovery paths when settlement fails.

## Architecture and Design Choices

### Payment Locking Mechanisms

#### Hash Time-Locked Contracts (HTLC)

| Aspect | Description |
|--------|-------------|
| **Mechanism** | Payment locked with hash; released when preimage revealed |
| **Atomicity** | Preimage revelation unlocks both legs simultaneously |
| **Timeout** | Automatic refund if preimage not revealed within window |
| **Use Case** | Cross-chain atomic swaps, trustless counterparties |

```
1. Seller generates secret S, shares hash H(S)
2. Buyer locks payment with H(S) and timeout T1
3. Seller locks asset with H(S) and timeout T2 (T2 < T1)
4. Seller reveals S to claim payment
5. Buyer uses S to claim asset
```

#### Escrow with Dual Approval

| Aspect | Description |
|--------|-------------|
| **Mechanism** | Both parties must approve release; dispute goes to arbitrator |
| **Atomicity** | Escrow holds both legs until mutual approval |
| **Timeout** | Configurable dispute window before arbitration |
| **Use Case** | Known counterparties, institutional settlement |

```
1. Both parties deposit to escrow contract
2. Settlement conditions verified (off-chain or oracle)
3. Both parties sign release transaction
4. Escrow atomically transfers both legs
```

#### Conditional Transfer with Oracle

| Aspect | Description |
|--------|-------------|
| **Mechanism** | Oracle attests to external condition; triggers settlement |
| **Atomicity** | Single oracle call triggers both transfers |
| **Timeout** | Fallback if oracle unresponsive |
| **Use Case** | Event-driven settlement, derivatives, real-world triggers |

```
1. Asset and payment locked in escrow
2. Oracle monitors external condition (price, event, confirmation)
3. Oracle submits attestation when condition met
4. Escrow executes atomic swap based on attestation
```

### Escrow Conditions

#### Time-Based Conditions

| Condition | Description | Example |
|-----------|-------------|---------|
| **Settlement Date** | Release on specific timestamp | T+2 bond settlement |
| **Lock Period** | Minimum hold before release allowed | Vesting schedules |
| **Expiry** | Automatic return if not settled by deadline | Failed trade cleanup |

#### Event-Based Conditions

| Condition | Description | Example |
|-----------|-------------|---------|
| **Payment Confirmation** | Release when payment finality confirmed | Bank transfer clearing |
| **Regulatory Approval** | Release when compliance check passes | Cross-border settlement |
| **Multi-sig Threshold** | Release when N-of-M parties approve | Committee settlement |

#### Value-Based Conditions

| Condition | Description | Example |
|-----------|-------------|---------|
| **Price Bounds** | Settlement only if price within range | Limit orders |
| **Collateral Ratio** | Release only if collateralization maintained | Margin calls |
| **Net Settlement** | Batch and net multiple obligations | Clearing house |

### Integration with EIP-6123 (Derivatives)

For derivative contracts using EIP-6123 lifecycle management:

| Lifecycle Event | DvP Integration |
|-----------------|-----------------|
| **Trade Confirmation** | Lock initial margin in escrow |
| **Valuation Update** | Adjust escrow based on mark-to-market |
| **Margin Call** | Conditional release requires margin top-up |
| **Settlement** | Final exchange of payment vs position closure |
| **Early Termination** | Escrow handles close-out netting |

### Protocol Flow

1. **Agree**: Counterparties agree on asset, payment amount, escrow conditions, and timeout parameters.
2. **Lock Asset**: Seller transfers asset to escrow contract with release conditions.
3. **Lock Payment**: Buyer transfers payment to escrow contract with matching conditions.
4. **Verify**: Escrow contract (or oracle) verifies all conditions are met.
5. **Settle**: If conditions satisfied, escrow atomically transfers asset to buyer, payment to seller.
6. **Timeout**: If conditions not met by deadline, escrow returns assets to original owners.

### Recommended Components

- **Standards**: ERC-20 or ERC-721 for asset and payment tokens; ERC-7573 for cross-network coordination; EIP-6123 for derivative lifecycle
- **Infrastructure**: Escrow smart contract with conditional release logic; time-lock or hash-lock primitives; event listeners for settlement triggers
- **Settlement**: Asset token contract (security, bond, derivative position); payment token contract (stablecoin, tokenized deposit, CBDC); settlement coordinator (on-chain or hybrid)

## Trade-offs and Open Questions

### Guarantees

- **Settlement Atomicity**: Both legs complete or neither completes; no partial settlement
- **Counterparty Risk Elimination**: Assets locked in escrow, not held by counterparty
- **Deterministic Outcomes**: Clear conditions define exactly when settlement occurs
- **Timeout Safety**: Automatic recovery path if settlement conditions not met

### Trade-offs

- **Capital Lockup**: Assets locked during settlement window reduce liquidity
- **Condition Complexity**: Complex conditions increase gas costs and audit surface
- **Oracle Dependency**: Event-based conditions require trusted oracle infrastructure
- **Timing Risks**: Network congestion may cause timeout before legitimate settlement
- **Upgrade Constraints**: Escrow contract immutability limits future modifications

### Failure Modes

| Failure | Impact | Mitigation |
|---------|--------|------------|
| **Oracle failure** | Settlement blocked | Multi-oracle consensus, manual fallback |
| **Network congestion** | Timeout before settlement | Generous timeout windows, priority fees |
| **Escrow bug** | Asset loss | Formal verification, audits, insurance |
| **Counterparty disappears** | Delayed recovery | Automatic timeout refunds |
| **Condition ambiguity** | Disputed settlement | Precise condition specification, arbitration |

### Example: Bond Purchase with Tokenized Deposit

1. Asset Manager A sells €1M corporate bond to Bank B on L2 network.
2. A locks bond tokens in escrow contract with conditions: release to B if €1M EURC received, timeout in 24 hours.
3. B locks €1M EURC in same escrow with matching trade ID.
4. Escrow verifies both legs present and conditions aligned.
5. Escrow atomically transfers: bond to B, EURC to A.
6. If B had not deposited EURC within 24 hours, A would reclaim bond via timeout.

## Links and Notes

### Related Patterns

- [Atomic DvP via ERC-7573](../patterns/pattern-dvp-erc7573.md) - Cross-network DvP coordination
- [ERC-3643 RWA Tokenization](../patterns/pattern-erc3643-rwa.md) - Compliant security tokens
- [MPC Custody](../patterns/pattern-mpc-custody.md) - Secure key management for escrow
- [Commit and Prove](../patterns/pattern-commit-and-prove.md) - Privacy-preserving condition verification

### References

- [EIP-6123 spec](https://eips.ethereum.org/EIPS/eip-6123) - Smart Derivative Contract standard
- [ERC-7573 spec](https://ercs.ethereum.org/ERCS/erc-7573) - Cross-network settlement standard
