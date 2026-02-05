---
title: "Pattern: Threshold Encrypted Mempool"
status: draft
maturity: pilot
layer: L1
privacy_goal: Hide transaction content until block inclusion via threshold encryption
assumptions: Honest threshold committee (k-of-n), timely key release, compatible block builder
last_reviewed: 2026-01-14
works-best-when:
  - MEV protection required at protocol level
  - Users cannot or prefer not to trust private relays
  - Censorship resistance combined with pre-trade privacy needed
avoid-when:
  - Committee liveness requirements unacceptable
  - Decryption latency incompatible with use case
  - Single trusted party acceptable (simpler private relay)
dependencies: [Threshold cryptography, Distributed key generation, Block builder integration]
---

## Intent

> **Sub-pattern of [Private Transaction Broadcasting](pattern-private-transaction-broadcasting.md)** — This pattern provides detailed coverage of threshold encryption specifically. See the parent pattern for alternative approaches (private relays, TEE-based builders).

Prevent MEV extraction by encrypting transaction content before mempool submission, with decryption occurring only after block ordering is committed. A distributed committee holds threshold key shares; no single party can decrypt prematurely. This provides cryptographic (not trust-based) protection against front-running while maintaining censorship resistance.

## Ingredients

- **Cryptographic Primitives**:
  - **Threshold encryption**: k-of-n scheme where k committee members must cooperate to decrypt
  - **Distributed Key Generation (DKG)**: Committee jointly generates threshold public key without any party knowing full private key
  - **Identity-Based Encryption (IBE)** or **timelock encryption**: Optional variants for slot-based decryption

- **Infrastructure**:
  - **Keyper committee**: Distributed set of key holders (validators, independent operators, or DAOs)
  - **Sequencer/proposer integration**: Block builder must support encrypted transaction inclusion
  - **Decryption oracle**: Publishes decryption keys after inclusion commitment

- **Standards**:
  - No ERC standard yet; Shutter uses custom protocol
  - Compatible with ERC-20, ERC-7573, and other token standards at application layer

## Protocol (concise)

### Encryption Phase

1. **Committee setup**: Keypers run DKG to generate threshold public key `PK` and individual key shares `sk_i`.
2. **Key publication**: Threshold public key `PK` published; users encrypt transactions with `PK`.
3. **Transaction encryption**: User encrypts transaction `tx` as `E(PK, tx)` and submits to mempool.
4. **Encrypted inclusion**: Block builder includes `E(PK, tx)` in block without seeing contents.

### Decryption Phase

5. **Inclusion commitment**: Block is proposed/finalized with encrypted transactions.
6. **Decryption key release**: After slot commitment, k-of-n keypers release decryption key shares.
7. **Key aggregation**: Shares combined to produce decryption key `DK` for that slot/block.
8. **Transaction reveal**: `DK` decrypts all transactions in block; execution proceeds with revealed content.

## Committee Assumptions

| Assumption | Requirement | Failure Impact |
|------------|-------------|----------------|
| **Honest threshold** | At least k of n keypers are honest | <k honest → premature decryption possible |
| **Liveness** | k keypers must be online to release keys | <k online → transactions stuck encrypted |
| **No collusion** | Keypers don't collude with block builders | Collusion → MEV extraction possible |
| **Timely release** | Keys released promptly after commitment | Delayed release → execution delays |

### Committee Models

| Model | Trust Distribution | Example |
|-------|-------------------|---------|
| **Validator subset** | Tied to consensus security | Shutter on Gnosis Chain |
| **Independent operators** | Separate from validators | Dedicated keyper network |
| **DAO-elected** | Community governance | Threshold signature DAOs |
| **Rotating committee** | Time-bounded participation | Epoch-based rotation |

## Guarantees

- **Pre-inclusion privacy**: Transaction content hidden from all observers until block commitment
- **Cryptographic enforcement**: No single party can decrypt; requires threshold cooperation
- **Censorship resistance**: Encrypted transactions can be included without content inspection
- **MEV prevention**: Front-running, sandwich attacks impossible without decryption
- **Auditability**: Post-decryption, full transaction history is public and verifiable

## Trade-offs

- **Latency**: Decryption adds delay after block inclusion (typically <1 second)
- **Liveness dependency**: If <k keypers online, encrypted transactions cannot execute
- **Committee trust**: Security degrades to k-of-n assumption; not fully trustless
- **Complexity**: Additional infrastructure (DKG, keyper network, decryption oracle)
- **Metadata leakage**: Transaction size, gas limit, sender address may still be visible
- **Incomplete coverage**: Only protects mempool phase; post-decryption MEV still possible

## Failure Modes

| Failure | Description | Impact | Mitigation |
|---------|-------------|--------|------------|
| **Threshold breach** | <k honest keypers | Premature decryption, MEV extraction | Increase k, diverse keyper set |
| **Liveness failure** | <k keypers online | Stuck transactions | Redundant keypers, timeout fallback |
| **Key leakage** | Keyper share compromised | Reduced threshold security | Key rotation, secure enclaves |
| **Collusion** | Keypers collude with builders | MEV extraction | Economic penalties, reputation |
| **DKG failure** | Key generation compromised | Invalid threshold key | Verifiable DKG, ceremony audits |

## Example

**Shutter on Gnosis Chain**

1. Gnosis validators run Shutter keyper nodes alongside consensus clients.
2. DKG produces threshold public key for each epoch.
3. User encrypts DEX swap with epoch's public key, submits to mempool.
4. Validator includes encrypted transaction in block without seeing swap details.
5. After block finalization, keypers release decryption key shares.
6. Swap is decrypted and executed; no front-running possible during mempool phase.
7. Result: User gets fair execution price without MEV extraction.

**Institutional Settlement**

1. Bank A encrypts $100M stablecoin transfer with threshold key.
2. Transaction included in block; competitors cannot see amount or destination.
3. After block commitment, decryption reveals transfer.
4. Settlement executes with no advance warning to market.
5. Regulator can audit full transaction post-decryption.

## Comparison with Alternatives

| Approach | Trust Model | Latency | MEV Protection |
|----------|-------------|---------|----------------|
| **Threshold encrypted mempool** | k-of-n committee | +decryption delay | Cryptographic |
| **Private relay (Flashbots)** | Single relay operator | Minimal | Trust-based |
| **Timelock encryption** | Time-based, no committee | Fixed delay | Cryptographic |
| **TEE-based builders** | Hardware vendor | Minimal | Hardware trust |

## See also

- [Private Transaction Broadcasting](pattern-private-transaction-broadcasting.md) - Broader MEV protection overview
- [Pre-trade Privacy (Shutter/SUAVE)](pattern-pretrade-privacy-encryption.md) - RFQ-focused pre-trade privacy
- [FOCIL Inclusion Lists](pattern-focil-eip7805.md) - Censorship resistance complement
- [Vendor: Shutter](../vendors/shutter.md) - Primary implementation

## See also (external)

- Shutter Network: https://shutter.network/
- Shutter docs: https://docs.shutter.network/
- Threshold encryption primer: https://blog.shutter.network/introducing-shutter-network-combating-frontrunning-and-malicious-mev-using-threshold-cryptography/
- Gnosis Shutter integration: https://docs.gnosischain.com/about/specs/shutter/
