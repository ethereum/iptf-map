---
title: "Pattern: TLS Payment Bridge"
status: draft
maturity: PoC
layer: hybrid
privacy_goal: Prove a fiat payment occurred without revealing full bank or payment account details
assumptions: TLSNotary or similar notarization protocol, instant payment rail with TLS-accessible confirmation, onchain escrow contract
last_reviewed: 2026-03-20
works-best-when:
  - instant payment rails are available (PIX, UPI, Venmo, Revolut)
  - peer-to-peer fiat-to-crypto swaps without custodial intermediary
  - onramping to stablecoins or other onchain assets from fiat
avoid-when:
  - payment rail has no TLS-accessible confirmation endpoint
  - high-value institutional settlement requiring formal clearing
dependencies: []
context: i2u
crops_profile:
  cr: medium
  os: partial
  privacy: partial
  security: medium
---

## Intent

Enable **trust-minimized fiat-to-onchain swaps** by combining instant payment rails with zk-TLS proofs. A taker proves they completed a fiat payment by generating a zero-knowledge proof over the payment provider's TLS response, which an onchain escrow contract verifies before releasing crypto to the taker.

## Ingredients

- **Cryptography**: [zk-TLS](pattern-zk-tls.md) (e.g. [TLSNotary](https://github.com/tlsnotary/tlsn)) for proving payment confirmation
- **Infra**: Instant payment rail (PIX, UPI, Venmo, Revolut), onchain escrow smart contract, peer-to-peer orderbook or matching engine
- **Verification**: Direct onchain proof verification, or offchain via [TEE](pattern-tee-based-privacy.md) attestation service (validates proofs and emits signed attestations checked onchain)
- **Standards**: ERC-20 (escrowed asset), EIP-712 (typed attestations), optional ERC-7573 for structured settlement

## Protocol (concise)

1. **Liquidity provider** deposits crypto (e.g. USDC) into an onchain escrow contract and publishes an order specifying accepted payment rails and exchange rate.
2. **Taker** selects an order and locks intent onchain, committing to the swap parameters.
3. Taker sends fiat payment to the liquidity provider via the specified instant payment rail.
4. Taker runs a TLS session with the payment provider (jointly with a Notary) and generates a **zk-TLS proof** attesting that the payment confirmation was received — without revealing full account details.
5. Proof is verified — either directly onchain, or offchain by a TEE attestation service that emits a signed EIP-712 payment attestation checked by an onchain verifier.
6. On successful verification, the escrow **releases** the crypto asset to the taker.

## Guarantees

- **No custodial intermediary**: Swap settles peer-to-peer; the escrow contract is the sole trusted onchain component.
- **Payment privacy**: The zk-TLS proof reveals the necessary payment attributes (amount, status) — full bank details, account numbers, and transaction metadata remain hidden.
- **Atomic settlement**: Crypto is locked in escrow before fiat payment; release is conditional on proof verification. If no valid proof is submitted within the timeout, funds return to the liquidity provider.
- **Audit**: Proof artifacts can be stored offchain for dispute resolution.

## Trade-offs

- **Notary trust**: The TLS notarization requires a trusted Notary to co-sign the TLS session. A malicious or unavailable Notary can block proof generation.
- **TEE trust (if used)**: Offchain TEE attestation introduces hardware trust assumptions — side-channel attacks or firmware vulnerabilities could compromise attestation integrity.
- **Payment rail dependency**: Availability and latency depend on the fiat payment rail. Downtime or API changes can break proof generation.
- **Proof latency**: Generating zk-TLS proofs is computationally expensive; end-to-end swap time includes proof generation overhead (seconds to minutes).
- **CROPS context (I2U)**: Primarily consumer-facing. Notary selection and payment rail coverage vary by geography. Open-source tooling (TLSNotary) exists but notary infrastructure may not be fully open.
- **Post-quantum exposure**: Inherits zk-TLS vulnerability — MPC/2PC operates on ECDH key exchange broken by CRQC; ML-KEM handshake in MPC/2PC is unsolved. See [Post-Quantum Threats](../domains/post-quantum.md).

## Example

- **Venmo-to-USDC swap**: Alice wants to buy 100 USDC. Bob has listed 100 USDC in the escrow at 1:1 rate, accepting Venmo.
- Alice locks intent onchain, then sends $100 to Bob via Venmo.
- Alice opens Venmo's payment confirmation page in a TLSNotary-enabled browser extension, generating a zero-knowledge proof that Venmo confirmed a $100 payment to Bob.
- Alice submits the proof to the escrow contract, which verifies the payment amount and recipient match the order.
- The contract releases 100 USDC to Alice's wallet. Bob received $100 via Venmo.

## See also

- [Pattern: zk-TLS](pattern-zk-tls.md) — the underlying data-export primitive this pattern builds on
- [Pattern: TEE-Based Privacy](pattern-tee-based-privacy.md) — TEE attestation as offchain verification layer
- [Pattern: Shielding](pattern-shielding.md) — can be combined to shield the received crypto after the swap
- [Post-Quantum Threats](../domains/post-quantum.md) — PQ risk inherited from zk-TLS
