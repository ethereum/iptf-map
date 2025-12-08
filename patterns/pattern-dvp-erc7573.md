---
title: "Pattern: Atomic DvP via ERC-7573 (cross-network)"
status: ready
maturity: pilot
works-best-when:
  - Asset side and payment side live on different networks (L1/L2 or sidechains).
avoid-when:
  - Both sides already settle on the same network with simple on-chain transfers.
dependencies:
  - ERC-7573 locking contract (asset side)
  - ERC-7573 decryption contract (payment side)
  - Stateless decryption oracle on the payment network
---

## Intent

Enable atomic Delivery-versus-Payment (DvP) across two networks using ERC-7573, so that either the asset is delivered and payment is completed, or the asset returns to the seller.  
The pattern targets institutions that need cross-network settlement with clear behaviour, auditability, and optional privacy.

In this pattern:
- **asset side** = the tokenised security or collateral being delivered
- **payment side** = the token used for payment (for example, a stablecoin or tokenised deposit)
- **decryption oracle** = a service on the payment network that, for each trade, decrypts one of two outcome keys based on the actual payment result; the asset contract then uses that key to decide whether to deliver or reclaim

## Ingredients

- **Standards**
  - ERC-7573 locking contract on the asset network
  - ERC-7573 decryption contract on the payment network
  - Oracle proxy and callback contracts (per ERC-7573)

- **Infra**
  - Asset network where the security or collateral is issued
  - Payment network that holds the payment token
  - Stateless decryption oracle implementation (single or multi-operator)

- **Off-chain**
  - Trade negotiation or order system that assigns a shared trade identifier
  - A component that creates and distributes two outcome keys per trade (success / failure) and keeps them off-chain
  - Monitoring and logging for contracts and oracle

## Protocol (concise)

1. **Agree trade off-chain**  
   Two institutions agree on asset, quantity, payment token, amount, a shared trade identifier `T`, and a latest time to settle or unwind. They record `T` and the terms in their internal systems.

2. **Lock the asset with outcome keys**  
   For trade `T`, the trade-setup system provides two outcome keys (one meaning “deliver to buyer”, one meaning “return to seller”).  
   The seller locks the asset in the ERC-7573 locking contract on the asset network under `T`, registering hashed values of these two keys. The keys themselves stay off-chain.

3. **Register the payment**  
   On the payment network, the buyer registers `T` and the payment details in the ERC-7573 decryption contract, along with encrypted forms of the same two outcome keys: one to use if the payment succeeds, one if it fails or is cancelled.

4. **Execute payment and call the oracle**  
   The buyer executes the payment through the decryption contract. The contract checks the payment against the registered details for `T` and then asks the decryption oracle to decrypt the encrypted key that matches the actual outcome (success or failure).  
   The oracle decrypts and returns that outcome key to the decryption contract.

5. **Settle on the asset side**  
   An authorised party submits the outcome key for `T` to the locking contract on the asset network. The contract verifies it against the registered values and either:
   - delivers the locked asset to the buyer (payment succeeded), or
   - lets the seller reclaim the asset (payment failed, was cancelled, or never completed in time).  

   If no valid outcome key is submitted before the latest time, the seller uses the reclaim path.

## Privacy Extensions

Standard ERC-7573 provides atomic settlement but no privacy. For institutional use cases requiring confidentiality:

- **Multi-operator oracle**  
  Run the decryption oracle with several independent operators and require a threshold of them to cooperate before an outcome key is released.

- **Minimal on-chain trade data**  
  Keep full trade terms (price, size, counterparties) in internal systems; on-chain, store only a trade identifier and a short reference that links back to those records.

- **Private or proof-based payment layer**  
  Use a network or rollup for the payment side that hides detailed balances but can provide a clear “payment completed / not completed” result for each trade identifier.

These extensions do not change how ERC-7573 contracts decide outcomes: the asset contract still receives an outcome key and either delivers the asset or allows reclaim.

## Guarantees

- **Atomic settlement**  
  For each trade, both asset and payment settle together, or the asset is reclaimed by the seller; one-sided settlement is not an intended state.

- **Defined failure behaviour**  
  If the payment fails, is cancelled, no outcome key is released, or the latest time passes, the contracts expose a predictable reclaim path for the seller.

- **Optional privacy**  
  With minimal on-chain trade data and a private or proof-based payment layer, observers see that a trade settled or not without seeing full terms, while institutions can still disclose details off-chain when required.

## Trade-offs

- **Oracle governance**  
  Institutions must agree who runs the oracle, how its keys are managed, and how incidents (downtime, misconfiguration) are handled.

- **Latency and cost**  
  Settlement depends on payment finality, oracle processing, and any proof generation, adding delay and cost relative to same-network transfers.

- **Integration effort**  
  Internal systems must handle outcome keys, track trade identifiers, listen to events on both networks, and reconcile them with internal ledgers.

- **Failure and dispute handling**  
  Exceptional cases (incorrect parameters, operational errors, regulatory holds) still require documented off-chain procedures.

## Example

- Bank A issues a tokenised bond on Ethereum L1 (asset side).  
- Bank B holds EURC stablecoin on an L2 rollup (payment side).  
- They agree off-chain on trade id `T`, bond quantity, payment amount, and a latest settlement time.  
- Bank A locks the bond in the ERC-7573 locking contract on L1 under `T`.  
- Bank B registers `T` and executes the EURC payment via the ERC-7573 decryption contract on the rollup; the oracle releases the success outcome key for `T`.  
- That key is submitted to the L1 locking contract, which transfers the bond to Bank B. If the payment had failed or been cancelled, the failure outcome key would have been used instead and Bank A would reclaim the bond.

## See also

- [Private Trade Settlement](../approaches/approach-private-trade-settlement.md)
- [Commit and Prove](pattern-commit-and-prove.md)
- [MPC Custody](pattern-mpc-custody.md)
- [Selective Disclosure](pattern-regulatory-disclosure-keys-proofs.md)
- [ERC-7573 spec](https://ercs.ethereum.org/ERCS/erc-7573)
