---
title: "Pattern: Atomic DvP Settlement"
status: draft
maturity: pilot
layer: L2
privacy_goal: Ensure asset delivery occurs if and only if payment completes, with configurable escrow conditions
assumptions: Both legs on same network or coordinated networks, escrow contract deployed, settlement finality available
last_reviewed: 2026-01-16
works-best-when:
  - Asset and payment legs settle on the same network or L2
  - Clear escrow conditions can be defined upfront
  - Counterparties need guaranteed atomicity without trusted intermediaries
avoid-when:
  - Complex multi-leg settlement requiring orchestration across many networks
  - Regulatory requirements mandate human intervention in settlement
  - One leg lacks programmable settlement capability
dependencies: [Escrow contract, ERC-20/ERC-721 tokens, Optional: ERC-7573, EIP-6123]
---

## Intent

Guarantee that delivery of an asset and corresponding payment either both complete or both fail, eliminating settlement risk where one party delivers without receiving payment. This pattern documents the core locking and escrow mechanisms that enable atomic settlement, applicable to securities, derivatives, and tokenized assets.

## Ingredients

- **Standards**
  - ERC-20 or ERC-721 for asset and payment tokens
  - ERC-7573 for cross-network coordination (optional)
  - EIP-6123 for derivative lifecycle integration (optional)

- **Escrow Infrastructure**
  - Escrow smart contract with conditional release logic
  - Time-lock or hash-lock primitives
  - Event listeners for settlement triggers

- **Settlement Components**
  - Asset token contract (security, bond, derivative position)
  - Payment token contract (stablecoin, tokenized deposit, CBDC)
  - Settlement coordinator (on-chain or hybrid)

## Payment Locking Mechanisms

### Hash Time-Locked Contracts (HTLC)

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

### Escrow with Dual Approval

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

### Conditional Transfer with Oracle

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

## Escrow Conditions

### Time-Based Conditions

| Condition | Description | Example |
|-----------|-------------|---------|
| **Settlement Date** | Release on specific timestamp | T+2 bond settlement |
| **Lock Period** | Minimum hold before release allowed | Vesting schedules |
| **Expiry** | Automatic return if not settled by deadline | Failed trade cleanup |

### Event-Based Conditions

| Condition | Description | Example |
|-----------|-------------|---------|
| **Payment Confirmation** | Release when payment finality confirmed | Bank transfer clearing |
| **Regulatory Approval** | Release when compliance check passes | Cross-border settlement |
| **Multi-sig Threshold** | Release when N-of-M parties approve | Committee settlement |

### Value-Based Conditions

| Condition | Description | Example |
|-----------|-------------|---------|
| **Price Bounds** | Settlement only if price within range | Limit orders |
| **Collateral Ratio** | Release only if collateralization maintained | Margin calls |
| **Net Settlement** | Batch and net multiple obligations | Clearing house |

## Protocol (concise)

1. **Agree**: Counterparties agree on asset, payment amount, escrow conditions, and timeout parameters.
2. **Lock Asset**: Seller transfers asset to escrow contract with release conditions.
3. **Lock Payment**: Buyer transfers payment to escrow contract with matching conditions.
4. **Verify**: Escrow contract (or oracle) verifies all conditions are met.
5. **Settle**: If conditions satisfied, escrow atomically transfers asset to buyer, payment to seller.
6. **Timeout**: If conditions not met by deadline, escrow returns assets to original owners.

## Integration with EIP-6123 (Derivatives)

For derivative contracts using EIP-6123 lifecycle management:

| Lifecycle Event | DvP Integration |
|-----------------|-----------------|
| **Trade Confirmation** | Lock initial margin in escrow |
| **Valuation Update** | Adjust escrow based on mark-to-market |
| **Margin Call** | Conditional release requires margin top-up |
| **Settlement** | Final exchange of payment vs position closure |
| **Early Termination** | Escrow handles close-out netting |

## Guarantees

- **Settlement Atomicity**: Both legs complete or neither completes; no partial settlement
- **Counterparty Risk Elimination**: Assets locked in escrow, not held by counterparty
- **Deterministic Outcomes**: Clear conditions define exactly when settlement occurs
- **Timeout Safety**: Automatic recovery path if settlement conditions not met

## Trade-offs

- **Capital Lockup**: Assets locked during settlement window reduce liquidity
- **Condition Complexity**: Complex conditions increase gas costs and audit surface
- **Oracle Dependency**: Event-based conditions require trusted oracle infrastructure
- **Timing Risks**: Network congestion may cause timeout before legitimate settlement
- **Upgrade Constraints**: Escrow contract immutability limits future modifications

## Failure Modes

| Failure | Impact | Mitigation |
|---------|--------|------------|
| **Oracle failure** | Settlement blocked | Multi-oracle consensus, manual fallback |
| **Network congestion** | Timeout before settlement | Generous timeout windows, priority fees |
| **Escrow bug** | Asset loss | Formal verification, audits, insurance |
| **Counterparty disappears** | Delayed recovery | Automatic timeout refunds |
| **Condition ambiguity** | Disputed settlement | Precise condition specification, arbitration |

## Example

**Bond Purchase with Tokenized Deposit**

1. Asset Manager A sells €1M corporate bond to Bank B on L2 network.
2. A locks bond tokens in escrow contract with conditions: release to B if €1M EURC received, timeout in 24 hours.
3. B locks €1M EURC in same escrow with matching trade ID.
4. Escrow verifies both legs present and conditions aligned.
5. Escrow atomically transfers: bond to B, EURC to A.
6. If B had not deposited EURC within 24 hours, A would reclaim bond via timeout.

## See also

- [Atomic DvP via ERC-7573](pattern-dvp-erc7573.md) - Cross-network DvP coordination
- [ERC-3643 RWA Tokenization](pattern-erc3643-rwa.md) - Compliant security tokens
- [MPC Custody](pattern-mpc-custody.md) - Secure key management for escrow
- [Commit and Prove](pattern-commit-and-prove.md) - Privacy-preserving condition verification
- [EIP-6123 spec](https://eips.ethereum.org/EIPS/eip-6123) - Smart Derivative Contract standard
- [ERC-7573 spec](https://ercs.ethereum.org/ERCS/erc-7573) - Cross-network settlement standard
