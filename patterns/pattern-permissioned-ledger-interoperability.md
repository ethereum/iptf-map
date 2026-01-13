---
title: "Pattern: Permissioned Ledger Interoperability"
status: draft
maturity: pilot
works-best-when:
  - Multiple financial institutions each operate their own permissioned ledger but require atomic cross-ledger settlement
  - Regulatory constraints prevent moving all participants onto a single shared chain
avoid-when:
  - Use cases require fully open participation on public blockchains
  - Applications depend on composability with EVM/ZK ecosystems
dependencies: [DAML, ISO20022, EAS, custom sync protocols]
---

## Intent

Enable atomic transactions and data exchange across distinct permissioned ledgers, so that institutions can interoperate without exposing all contract state or migrating to a single ledger.

## Ingredients

- Permissioned ledgers (e.g., Canton domains, Corda networks, Hyperledger Fabric instances)
- Synchronization protocol to coordinate transaction commits across domains
- Smart contract language (DAML or equivalent)
- Governance model for validator/participant nodes
- Selective disclosure mechanisms for regulators

## Protocol (concise)

1. Parties deploy applications/contracts on separate permissioned ledgers.
2. Each ledger operates its own consensus and privacy domain.
3. A synchronization protocol links ledgers for cross-domain transactions.
4. Parties agree on transaction terms (e.g., bond delivery vs. cash payment).
5. Domains validate locally, then exchange commitments.
6. Protocol ensures atomic commit: either all domains finalize or none do.
7. Regulators can access relevant state via scoped disclosure.

## Guarantees

- **Atomicity**: cross-ledger operations settle consistently or abort.
- **Privacy**: only counterparties see transaction state; other domains are unaware.
- **Regulatory audit**: scoped access for supervisory entities.

## Trade-offs

- **Performance**: synchronization adds latency vs. single-ledger settlement.
- **Complexity**: requires harmonization of governance and protocol standards.
- **Interoperability limits**: not natively composable with public-chain DeFi.
- **Failure modes**: stalled domain halts atomic settlement.

## Example

- Bank A issues a bond on Ledger X.
- Investor B holds cash tokens on Ledger Y.
- Both ledgers participate in a Canton synchronization protocol.
- Transaction: Investor B buys €10m of bonds, payment vs. delivery.
- Ledger X transfers bond tokens, Ledger Y transfers cash tokens.
- Atomic commit finalizes on both ledgers, with regulators able to view audit trail.

## See also

- Pattern: [DvP ERC-7573](../patterns/pattern-dvp-erc7573.md)
- Pattern: [Private ISO20022](../patterns/pattern-private-iso20022.md)
- Pattern: [Crypto-Registry Bridge eWpG-EAS](../patterns/pattern-crypto-registry-bridge-ewpg-eas.md)
