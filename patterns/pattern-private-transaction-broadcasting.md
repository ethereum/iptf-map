---
title: "Pattern: Private Transaction Broadcasting"
status: draft
maturity: pilot
layer: hybrid
privacy_goal: Prevent MEV extraction and intent leakage during transaction submission
assumptions: Private relay/builder infrastructure or threshold encryption committee available
last_reviewed: 2026-01-14
works-best-when:
  - Transaction content must not leak before block inclusion
  - MEV protection is required for large institutional trades
  - Competitive intelligence exposure is a concern
avoid-when:
  - Public transparency is required by policy or regulation
  - Immediate inclusion guarantees are critical (private routes may have lower priority)
dependencies: [Flashbots Protect, Shutter Network, SUAVE]
---

## Intent

Hide transaction content from the public mempool to prevent front-running, sandwich attacks, and competitive intelligence extraction. Transactions are submitted through private channels and only become visible after block inclusion, eliminating the window where adversaries can observe and exploit pending trades.

## Ingredients

- **Standards**: None required (infrastructure-level pattern)
- **Infra**:
  - Private transaction relays (Flashbots Protect, MEV Blocker)
  - Encrypted mempools with threshold decryption (Shutter Network)
  - Intent-based execution pools (SUAVE)
- **Off-chain**:
  - RPC endpoint configuration for private submission
  - Optional: bundle submission for atomic multi-tx execution
  - Wallet/custody integration for private RPC routing

## Protocol (concise)

### Variant A: Private Relay (Flashbots Protect)

1. User signs transaction locally with standard tooling.
2. Submit transaction to private RPC endpoint instead of public mempool.
3. Relay forwards to participating block builders under NDA/protocol rules.
4. Builder includes transaction in block without broadcasting to public mempool.
5. Transaction appears on-chain only after block confirmation.
6. Optional: MEV-Share returns portion of extracted value to user if MEV occurred.

### Variant B: Encrypted Mempool (Shutter)

1. User encrypts transaction payload using threshold public key.
2. Encrypted transaction submitted to mempool (content hidden, metadata visible).
3. Transaction included in block by builder/proposer.
4. After inclusion commitment, threshold committee decrypts transaction.
5. Decrypted transaction executed; content revealed only post-inclusion.
6. Front-running prevented as content was hidden during ordering phase.

## Guarantees

- **Hides**: Transaction content (to, value, calldata) from public mempool observers during pending phase.
- **Prevents**: Front-running, sandwich attacks, just-in-time liquidity attacks, intent signaling to competitors.
- **Does not hide**: Transaction details after on-chain inclusion; sender address may still be visible depending on implementation.
- **Atomicity**: Same as underlying L1/L2; private submission does not change execution semantics.
- **Censorship**: Private relays may refuse transactions; fallback to public mempool available.

## Trade-offs

- **Trust model**:
  - Flashbots: Trust that relay/builders honor privacy commitments (reputational + contractual enforcement).
  - Shutter: Trust threshold committee (cryptographic enforcement, k-of-n threshold security).
- **Latency**: May add 10-100ms for relay routing; encrypted mempool adds decryption step.
- **Inclusion priority**: Private transactions may have lower priority than direct builder submissions.
- **Coverage**: MEV-Boost covers ~90% of Ethereum blocks; Flashbots relay handles ~70% of MEV-Boost blocks.
- **Failure mode**: If private relay unavailable, transaction can fallback to public mempool (losing privacy) or fail (losing liveness).
- **Cost**: Some private relay services charge fees or take MEV share; Shutter requires threshold committee infrastructure.

## Example

**Institutional Stablecoin Transfer**

1. Bank A needs to transfer $50M USDC to Bank B for settlement.
2. Submitting to public mempool would signal large transfer intent to competitors and MEV searchers.
3. Bank A configures custody system to route through Flashbots Protect RPC.
4. Transaction submitted privately; not visible in any public mempool explorer.
5. Block builder includes transaction in next block.
6. Competitors and MEV bots see the transfer only after on-chain confirmation.
7. Result: No front-running, no sandwich attacks, no advance warning to market.

**RFQ Settlement with Encrypted Mempool**

1. Dealer wins RFQ to sell 1000 ETH to institutional buyer.
2. Settlement transaction encrypted using Shutter threshold key.
3. Encrypted payload submitted to Gnosis Chain mempool.
4. Validators include encrypted transaction in block.
5. After block finalization, threshold committee decrypts and executes.
6. Competing dealers cannot front-run or copy trade.

## Performance Characteristics

- **Network**: Ethereum L1, Gnosis Chain (Shutter), L2s with private mempool support
- **Latency**: +10-100ms vs public mempool submission
- **Cost**: Varies by provider; Flashbots Protect is free, MEV-Share takes percentage
- **Coverage**: ~90% of Ethereum blocks use MEV-Boost relays; Shutter live on Gnosis
- **Failure rate**: <1% relay unavailability; fallback paths available

## See also

- [Pre-trade Privacy (Shutter/SUAVE)](pattern-pretrade-privacy-encryption.md)
- [FOCIL Inclusion Lists](pattern-focil-eip7805.md) - Censorship resistance complement
- [Vendor: Flashbots](../vendors/flashbots.md)
- [Vendor: Shutter](../vendors/shutter.md)
- [Approach: Private Broadcasting](../approaches/approach-private-broadcasting.md)

## See also (external)

- Flashbots Protect: https://docs.flashbots.net/flashbots-protect/overview
- Flashbots MEV-Share: https://docs.flashbots.net/flashbots-mev-share/overview
- Shutter Network: https://docs.shutter.network/
- MEV Blocker: https://mevblocker.io/
- SUAVE: https://writings.flashbots.net/the-future-of-mev-is-suave
