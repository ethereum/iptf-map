---
title: "Pattern: Cross-Chain Privacy Bridge"
status: draft
maturity: PoC
layer: hybrid
privacy_goal: Move assets between chains while preserving privacy on the destination
assumptions: Destination chain has shielded pool or private execution; bridge trust model accepted
last_reviewed: 2026-01-22
works-best-when:
  - Moving assets between domains while minimizing linkability
  - Destination has shielded pool or private execution environment
  - Explicit bridge trust assumptions are acceptable
avoid-when:
  - Both legs on same domain (use internal transfer)
  - Destination lacks privacy primitive (no benefit to bridge privacy)
  - Regulatory requirements demand end-to-end public transparency
dependencies:
  - Source-domain escrow contract (lock or burn)
  - Destination-domain mint contract integrated with shielded pool
  - Cross-domain verification mechanism (operator/optimistic/ZK/light client)
---

## Intent

Move assets between chains while preserving privacy on the destination by minting shielded notes whose ownership is not linkable to the source-domain depositor.

**Note:** Full sender/amount privacy requires privacy primitives on source chain or pre-bridge anonymization (e.g., deposit through existing shielded pool before bridging). Without this, the source-side lock transaction reveals depositor address and amount.

## Ingredients

- **Source escrow:** Lock-mint or burn-unlock contract on origin chain
- **Destination privacy primitive:** Shielded pool with commitments + nullifiers (e.g., Aztec, Railgun, Privacy Pools)
- **Cross-domain message:** Event/log attesting to deposit; inclusion proof
- **Verification mechanism:** Operator signature, optimistic challenge, ZK proof, or light client
- **Relayer infrastructure:** Submit proofs on destination without linking depositor (fee model matters)
- **Optional compliance hooks:** View keys for auditors, screening gates, deposit limits

## Protocol

1. **Deposit intent** — User generates destination note commitment `C = hash(value, recipient_pubkey, randomness)`. Does not reveal recipient on source chain.

2. **Source escrow** — Lock or burn assets in source contract. Emit event containing `(amount, C, nonce)`. This step is typically public on source chain.

3. **Finality evidence** — Obtain proof that source escrow finalized:
   - *Custodial:* Operator signature
   - *MPC/TSS:* Threshold signature from committee
   - *Optimistic:* Relayer claim + challenge period
   - *ZK:* Succinct proof of source consensus + inclusion (zk-SPV)
   - *Light client:* Verify source headers on destination
   - *TEE:* Attested enclave signature

4. **Destination mint** — Submit finality evidence to destination bridge contract. Contract verifies, then mints note into shielded pool with commitment `C`.

5. **Private spend** — Recipient proves ownership of `C` via nullifier reveal, spends privately within destination pool. Standard shielded-pool semantics apply.

6. **Return path (optional)** — Burn shielded note on destination, prove burn finality on source, unlock escrowed assets. Return leg can also be private if source supports it.

7. **Recovery/expiry** — If mint never completes within timeout, depositor can reclaim from source escrow (requires proof of non-mint or governance override).

## Guarantees

- **Recipient privacy:** Destination recipient not revealed on source chain (commitment hides identity)
- **Sender privacy:** Destination observers cannot link recipient to source depositor (requires relayer that doesn't leak depositor, timing obfuscation)
- **Amount privacy:** If destination uses confidential amounts or fixed denominations
- **Integrity:** No double-mint (replay protected by nullifier or nonce tracking); conservation of value across domains
- **Auditor access:** View keys or compliance proofs can selectively reveal to authorized parties

**NOT guaranteed:**
- Instant atomic settlement — this is a two-phase commit workflow
- Source-side sender privacy — without pre-bridge mixing, depositor is visible

## Trade-offs

### Trust Model Comparison

| Model | What you trust | Latency | Cost | Typical risk |
|-------|----------------|---------|------|--------------|
| Custodial | Single operator honesty | Low | Low | Theft, censorship |
| MPC/TSS | Threshold of signers | Low-Med | Medium | Key compromise if threshold breached |
| Optimistic | At least one honest watcher | Med-High | Medium | Delayed finality, griefing |
| ZK (zk-SPV) | Proof system soundness + verifier | Medium | High | Prover DoS, circuit bugs |
| Light client | Destination verifies source consensus | Medium | Medium | Fork handling, header availability |
| TEE-assisted | Enclave attestation validity | Low | Medium | Side-channel attacks, vendor trust |

### Failure Modes

**Privacy leakage:**
- Amount correlation — exact deposit amounts visible on source
- Timing correlation — deposit/mint timing reveals linkage
- Fee linkage — if depositor pays relayer fees directly
- Metadata — IP addresses, transaction ordering, gas patterns

**Bridge correctness:**
- Reorg handling — source finality assumptions may be violated
- Replay/double-mint — must track processed deposits (nullifier set)
- Cross-domain confusion — wrong chain ID, token mismatch

**Liveness/censorship:**
- Operator refuses relay — user needs alternative submission path
- Griefing via spam — deposits that are never minted, locking funds
- Destination chain censorship — mint transactions blocked

**Key/governance risks:**
- Threshold key compromise — TSS/MPC signers collude
- View key misuse — auditors leak or sell data
- Upgrade attacks — malicious contract upgrades

## Example

An institution holds tokenized bonds on Ethereum L1 and wants to enable private secondary-market trading.

1. **Deposit:** Institution deposits 100 bond tokens into source escrow, specifying destination commitment `C` (no recipient revealed on L1)
2. **Finality:** After L1 finality (~12 min), optimistic bridge posts claim on privacy L2
3. **Mint:** After challenge period (e.g., 1 hour), L2 mints shielded note for commitment `C`
4. **Trade:** Bond holder trades privately within L2 shielded pool — counterparties and amounts hidden
5. **Exit:** When redeeming, burn shielded note on L2, prove burn to L1, unlock from escrow

Privacy achieved: L2 trading activity not linkable to original L1 depositor (assuming proper relayer usage and timing delays).

## Variants

- **Pre-bridge mixing:** Deposit through source-chain shielded pool first, then bridge — achieves full sender privacy
- **Hub-and-spoke:** Use L1 as verification hub; L2s prove deposits via L1 bridge contract
- **Privacy-to-privacy:** Both source and destination have shielded pools — maximum privacy but complex verification
- **Asymmetric:** Only one direction is private (e.g., public L1 → private L2)

## See also

- [pattern-zk-spv.md](pattern-zk-spv.md) — ZK verification of cross-chain finality
- [pattern-zk-htlc.md](pattern-zk-htlc.md) — Atomic swaps with privacy
- [pattern-permissioned-ledger-interoperability.md](pattern-permissioned-ledger-interoperability.md) — Enterprise ledger sync
- [pattern-privacy-l2s.md](pattern-privacy-l2s.md) — Destination privacy environments
- [pattern-zk-shielded-balances.md](pattern-zk-shielded-balances.md) — Commitment/nullifier pools
