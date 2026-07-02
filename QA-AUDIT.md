# IPTF Map - Q2 2026 QA Audit

> **Goal:** Every content file in the map read and reviewed by a human. Main targets: slop and incoherences.
> **Period:** Q2 2026 (April - June)
> **Where:** All audit work happens on the `feat/audit` branch ([PR #130](https://github.com/ethereum/iptf-map/pull/130)).

## How the audit works (claim and reveal)

Use this tracker to avoid duplicate reviews. Claim before you review.

1. **Pull first:** `git pull origin feat/audit` to see the latest claims.
2. **Claim a batch:** pick 5-10 `pending` files (or a whole small section). Flip their rows to `claimed`, add your GitHub handle and the date in the Claimed column. Commit and push immediately so the claim is visible to others.
3. **Review the files** on this branch, against the checklist below.
4. **Small problems** (typos, wording, small incoherences): fix them directly. Commit the content fix together with the tracker flip to `ok`, and note what you fixed.
5. **Big problems** (needs refactor, structural incoherence, doubtful content): flip the row to `needs-fix`, open a GitHub issue and link it in the Notes column. Flip to `ok` once the issue is resolved.
6. **Uncertainties** (you cannot verify a notion or construction): add a row to [Open Questions](#open-questions) so it gets resolved or escalated before the audit closes.

**Stale claims:** a `claimed` row untouched for 7+ days may be reclaimed by someone else.

### Status legend

| Status | Meaning |
|--------|---------|
| `pending` | Not yet claimed |
| `claimed` | Someone is reviewing it (see Reviewer and Claimed columns) |
| `ok` | Reviewed, fine as is or fixed inline |
| `needs-fix` | Reviewed, big issue flagged, resolution tracked in Notes |
| `deprecated` | File removed or content obsolete |

### What to check per file

The mechanical checks (frontmatter, word limits, link validity) are covered by `npm run validate` and CI. The human pass is for what scripts cannot catch:

- [ ] **Technical accuracy**: mechanisms are described correctly, no fabricated or unverifiable claims, no outdated statements presented as current
- [ ] **Internal coherence**: frontmatter matches the body, sections do not contradict each other, the example actually illustrates the pattern
- [ ] **Cross-doc coherence**: links point to the right documents and make sense in context, terminology matches [GLOSSARY.md](GLOSSARY.md), no contradictions with related patterns/approaches
- [ ] **Slop**: generic filler, vague attributions ("experts agree", "many institutions"), marketing tone, unsupported superlatives, lists that pad instead of inform
- [ ] **Template conformance**: content follows its directory `_template.md` in structure and intent

---

## Progress Summary

| Section | Total | OK | Claimed | Needs Fix | Deprecated | Pending |
|---------|-------|----|---------|-----------|------------|---------|
| Patterns | 70 | 69 | 0 | 0 | 1 | 0 |
| Use Cases | 23 | 23 | 0 | 0 | 0 | 0 |
| Approaches | 10 | 10 | 0 | 0 | 0 | 0 |
| Domains | 8 | 8 | 0 | 0 | 0 | 0 |
| Jurisdictions | 7 | 7 | 0 | 0 | 0 | 0 |
| Vendors | 24 | 24 | 0 | 0 | 0 | 0 |
| **Total** | **142** | **141** | **0** | **0** | **1** | **0** |

---

## CodeRabbit review follow-up (PR #130, 2026-06-29)

Post-audit corrections from the CodeRabbit review pass, content/style only, no new content. See the [PR #130](https://github.com/ethereum/iptf-map/pull/130) conversation for the full triage and the dismissed/deferred comments.

- **approaches/approach-dvp-atomic-settlement.md**, standards line: ERC-3643 is Final (was "both still Draft"); ERC-6123 stays Draft. Cleared a Vale "only" on the constraints line.
- **approaches/approach-private-identity.md**, TACEO:OPRF "currently in public beta" to "live in production"; "brought on chain" to "on-chain".
- **patterns/pattern-lean-ethereum.md**, client-team count "Eight" to "Multiple … as of mid-2026": leanroadmap.org lists ~9 teams, is evolving, and states no fixed total, so a specific number risks going stale. (Supersedes the "15 to 8 per roadmap" note in the Patterns table.)
- **patterns/pattern-cross-chain-privacy-bridge.md**, "maximum privacy" to "privacy on both sender and receiver ends"; dropped a stray "only".
- **patterns/pattern-recipient-derived-receive-addresses.md**, added `type: standard` (optional field; makes the pattern kind explicit).
- **jurisdictions/us-SEC.md**, relabeled the second "See also" link: it is a public submission to the SEC's Crypto Task Force, not an SEC-authored proposal.
- **use-cases/resilient-civic-participation.md**, **use-cases/private-identity.md**, **scripts/schemas/use-case.json**, domain taxonomy: `Governance` to canonical `Civic Coordination & Governance` (schema enum + both use-cases).

Tooling/config (not content files): reverted `vendors/_template.md` to master (keeps `## CROPS profile` documented in the template); relaxed the `.coderabbit.yaml` vendor CROPS rule to optional (no longer enforced, populating CROPS in the cards is deferred); updated the `.coderabbit.yaml` jurisdiction path instructions to the current `At a Glance / What to Watch / See also` structure. Remaining vendor-card comments (marketing/typo, Privacy domains) are deferred and answered on the PR.

- 2026-07-01 humanizer pass (oskarth, rymnc): removed em-dashes map-wide, reduced this tracker's arrow notation to "to", de-bolded jurisdiction prose and folded the "Posture:" endings into sentences, broke up the long legal-review paragraphs, and refreshed the Railgun figure in [approach-private-bonds.md](approaches/approach-private-bonds.md) to ~USD 5b (2026) per the [Dune dashboard](https://dune.com/railgun_project/railgun) (supersedes the ~$4b (2025) bonds-row note below).

---

## Patterns (70)

| # | File | Status | Reviewer | Claimed | Reviewed | Notes |
|---|------|--------|----------|---------|----------|-------|
| 1 | [pattern-blob-anchored-state-with-dispute.md](patterns/pattern-blob-anchored-state-with-dispute.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | De-bolded; EIP-4844/0x0A params + barretenberg verified; status to ready |
| 2 | [pattern-co-snark.md](patterns/pattern-co-snark.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Reviewed, clean; status to ready |
| 3 | [pattern-commit-and-prove.md](patterns/pattern-commit-and-prove.md) | `ok` | Meyanis95 | 2026-06-15 | 2026-06-15 | Retitled to cross-chain settlement; status to ready |
| 4 | [pattern-compliance-monitoring.md](patterns/pattern-compliance-monitoring.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | maturity testnet to concept (no impls, generic); dropped ERC-3643 from standards (kept in composes_with); softened latency figure; status to ready |
| 5 | [pattern-cross-chain-privacy-bridge.md](patterns/pattern-cross-chain-privacy-bridge.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | maturity testnet to concept; fixed broken EIP-7281 link to ERC-7281 (migrated to ERCs); folded non-template Variants into Trade-offs; status to ready |
| 6 | [pattern-crypto-registry-bridge-ewpg-eas.md](patterns/pattern-crypto-registry-bridge-ewpg-eas.md) | `ok` | Meyanis95 | 2026-06-15 | 2026-06-15 | Title register to registry (matches filename) |
| 7 | [pattern-dvp-erc7573.md](patterns/pattern-dvp-erc7573.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | standards EIP-7573 to ERC-7573 (naming); reviewed clean (already ready); last_reviewed bumped |
| 8 | [pattern-eil.md](patterns/pattern-eil.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Reviewed clean; RIP-7859 / eil-sdk / ethresearch verified; status to ready |
| 9 | [pattern-erc3643-rwa.md](patterns/pattern-erc3643-rwa.md) | `ok` | Meyanis95 | 2026-06-15 | 2026-06-15 | Removed unverified ERC-8056 refs; status to ready |
| 10 | [pattern-focil-eip7805.md](patterns/pattern-focil-eip7805.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Protocol role tags [sequencer] to consensus/committee/validator/builder/proposer/attester; all params (16, 8 KiB, timings) verified vs EIP-7805; status to ready |
| 11 | [pattern-forced-withdrawal.md](patterns/pattern-forced-withdrawal.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Dropped disputed proving-time figures; gas qualified to Groth16; arXiv 86%/129 stat verified; status to ready |
| 12 | [pattern-forward-secure-pseudorandom-tree.md](patterns/pattern-forward-secure-pseudorandom-tree.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | De-bolded; eprint 2001/035 + Poseidon 2019/458 verified; status to ready |
| 13 | [pattern-forward-secure-signatures.md](patterns/pattern-forward-secure-signatures.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | De-bolded; dead Bellare-Miner link to eprint 1999/016; status to ready |
| 14 | [pattern-hybrid-public-private-modes.md](patterns/pattern-hybrid-public-private-modes.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Reviewed clean (standards/links verified); status to ready |
| 15 | [pattern-icma-bdt-data-model.md](patterns/pattern-icma-bdt-data-model.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Privacy badge full to none (schema is not a privacy mechanism) |
| 16 | [pattern-immutable-guarantees.md](patterns/pattern-immutable-guarantees.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Reviewed clean; arXiv 2512.12732 86%/129 verified; status to ready |
| 17 | [pattern-l2-encrypted-offchain-audit.md](patterns/pattern-l2-encrypted-offchain-audit.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Trimmed unjustified ERC-3643 from standards |
| 18 | [pattern-l2-privacy-evaluation.md](patterns/pattern-l2-privacy-evaluation.md) | `deprecated` | Meyanis95 | 2026-06-24 | 2026-06-24 | Removed from the map (Open Q2): evaluation framework, not a reusable primitive; inbound see_also + RFP refs cleaned (historical CHANGELOG entry left intact) |
| 19 | [pattern-lean-ethereum.md](patterns/pattern-lean-ethereum.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Fixed client-team count (15 to 8 per roadmap) + removed unsourced 2030 date; 1-ETH/PQ-sigs/zkVM verified; status to ready (CR follow-up 2026-06-29: count to "multiple", roadmap ~9 and evolving) |
| 20 | [pattern-mesh-store-forward-submission.md](patterns/pattern-mesh-store-forward-submission.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Bridgefy is MIT-licensed (fixed "commercial"); status to ready; maturity raised as Open Q |
| 21 | [pattern-mixnet-anonymity.md](patterns/pattern-mixnet-anonymity.md) | `ok` | Meyanis95 | 2026-06-15 | 2026-06-15 | Reviewed; status to ready |
| 22 | [pattern-modular-privacy-stack.md](patterns/pattern-modular-privacy-stack.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | attest.sh to attest.org; sub_patterns + links verified; status to ready |
| 23 | [pattern-mpc-custody.md](patterns/pattern-mpc-custody.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Swapped ZenGo repo to klaytn-thresh-wallet (2-party); reworded "regulated-grade"; status to ready |
| 24 | [pattern-native-account-abstraction.md](patterns/pattern-native-account-abstraction.md) | `ok` | Meyanis95 | 2026-06-15 | 2026-06-15 | Reviewed; status to ready |
| 25 | [pattern-network-anonymity.md](patterns/pattern-network-anonymity.md) | `ok` | Meyanis95 | 2026-06-15 | 2026-06-15 | Reviewed; status to ready |
| 26 | [pattern-noir-private-contracts.md](patterns/pattern-noir-private-contracts.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Dropped unverified 8GB RAM figure; last_reviewed bumped (already ready) |
| 27 | [pattern-oif.md](patterns/pattern-oif.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Title Intent to Intents; noted mostly-draft standards + openintents.xyz; status to ready |
| 28 | [pattern-onion-routing.md](patterns/pattern-onion-routing.md) | `ok` | Meyanis95 | 2026-06-15 | 2026-06-15 | Reviewed; status to ready |
| 29 | [pattern-origin-locked-confidential-ledger.md](patterns/pattern-origin-locked-confidential-ledger.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Softened ElGamal to "e.g." and MPC to threshold cryptography (threshold IBE) to match cited Fairblock design; status to ready |
| 30 | [pattern-permissioned-ledger-interoperability.md](patterns/pattern-permissioned-ledger-interoperability.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Besu privacy groups deprecated+removed (noted) & repo to besu-eth/besu; DAML to Daml + dropped from standards; status to ready |
| 31 | [pattern-permissionless-spend-auth.md](patterns/pattern-permissionless-spend-auth.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | EIP-8182 link to published; content matches EIP-8182; status to ready |
| 32 | [pattern-plasma-stateless-privacy.md](patterns/pattern-plasma-stateless-privacy.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Fixed wrong eprint cites: removed 2023/1670 (actually a PSI paper); Intmax2 2025/021 to 2023/1082; status to ready |
| 33 | [pattern-pretrade-privacy-encryption.md](patterns/pattern-pretrade-privacy-encryption.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Marked suave-geth as archived (2025) |
| 34 | [pattern-privacy-l2s.md](patterns/pattern-privacy-l2s.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Removed Aleo (L1) + fhEVM refs; kept production (Aztec); status to ready; FHE framing raised as Open Q |
| 35 | [pattern-private-information-retrieval.md](patterns/pattern-private-information-retrieval.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Fixed wrong Respire eprint (2024/187 to 2024/1165); SimplePIR/FrodoPIR cites + 5 repos verified; status to ready |
| 36 | [pattern-private-iso20022.md](patterns/pattern-private-iso20022.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Reviewed; pacs/camt + BIC + SplmtryData verified. iso20022.org See-also links unverifiable (bot-blocked) to Open Q3; status to ready |
| 37 | [pattern-private-mtp-auth.md](patterns/pattern-private-mtp-auth.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Dropped irrelevant EIP-7573 (DvP) from standards; kept ERC-3643+ERC-735; repos verified; status to ready |
| 38 | [pattern-private-pvp-stablecoins-erc7573.md](patterns/pattern-private-pvp-stablecoins-erc7573.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Fixed ERC-7573 See-also title ( to Conditional-upon-Transfer-Decryption for DvP); status to ready |
| 39 | [pattern-private-set-intersection-circuit.md](patterns/pattern-private-set-intersection-circuit.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Fixed Huang citation year (2012 to 2011); status to ready |
| 40 | [pattern-private-set-intersection-dh.md](patterns/pattern-private-set-intersection-dh.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Reviewed, clean; status to ready |
| 41 | [pattern-private-set-intersection-fhe.md](patterns/pattern-private-set-intersection-fhe.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Reviewed, clean; status to ready |
| 42 | [pattern-private-set-intersection-oprf.md](patterns/pattern-private-set-intersection-oprf.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Removed mis-listed OpenMined (ECDH) impl; status to ready |
| 43 | [pattern-private-shared-state-cosnark.md](patterns/pattern-private-shared-state-cosnark.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Reviewed, clean; status to ready |
| 44 | [pattern-private-shared-state-fhe.md](patterns/pattern-private-shared-state-fhe.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Reviewed, clean (Zama=coprocessor framing); status to ready |
| 45 | [pattern-private-shared-state-tee.md](patterns/pattern-private-shared-state-tee.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Reviewed, clean; status to ready |
| 46 | [pattern-private-stablecoin-shielded-payments.md](patterns/pattern-private-stablecoin-shielded-payments.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Reviewed; FHE/Zama kept (coprocessor framing) |
| 47 | [pattern-private-transaction-broadcasting.md](patterns/pattern-private-transaction-broadcasting.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | shielding alternative_to to composes_with; MEV-Boost/Shutter claims confirmed; status to ready |
| 48 | [pattern-private-vaults.md](patterns/pattern-private-vaults.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Reviewed, clean (fhevm + aztec repos verified active); status to ready |
| 49 | [pattern-proof-of-innocence.md](patterns/pattern-proof-of-innocence.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Expanded PPOI acronym; repos confirmed; status to ready |
| 50 | [pattern-recipient-derived-receive-addresses.md](patterns/pattern-recipient-derived-receive-addresses.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | De-bolded; HMAC/secp256k1/EIP-5564 refs verified; status to ready |
| 51 | [pattern-regulatory-disclosure-keys-proofs.md](patterns/pattern-regulatory-disclosure-keys-proofs.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Title to Title Case |
| 52 | [pattern-relay-mediated-proving.md](patterns/pattern-relay-mediated-proving.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | De-bolded; Noir/plonky2/aztec repos + submitter-binding logic verified; status to ready |
| 53 | [pattern-safe-proof-delegation.md](patterns/pattern-safe-proof-delegation.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | EIP-8182 link draft PR to published EIP (merged 2026-03-17); intent-digest/output-secret refs verified; status to ready |
| 54 | [pattern-shielding.md](patterns/pattern-shielding.md) | `ok` | Meyanis95 | 2026-06-15 | 2026-06-15 | Dropped ERC-3643 from standards; added hardened-pool refs |
| 55 | [pattern-social-recovery.md](patterns/pattern-social-recovery.md) | `ok` | Meyanis95 | 2026-06-15 | 2026-06-15 | Removed bold + inline i2u/i2i; Protocol role tags; status to ready |
| 56 | [pattern-stealth-addresses.md](patterns/pattern-stealth-addresses.md) | `ok` | Meyanis95 | 2026-06-15 | 2026-06-15 | Reviewed, clean; status to ready |
| 57 | [pattern-tee-based-privacy.md](patterns/pattern-tee-based-privacy.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Corrected HSM EAL claim (most are EAL4+); status to ready |
| 58 | [pattern-tee-key-manager.md](patterns/pattern-tee-key-manager.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Reviewed, clean; status to ready |
| 59 | [pattern-tee-network-anonymity.md](patterns/pattern-tee-network-anonymity.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Reviewed clean; Flashnet design + rfps link verified; status to ready |
| 60 | [pattern-tee-zk-settlement.md](patterns/pattern-tee-zk-settlement.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Softened unverifiable 10-50% overhead; See-also left as bare heading per review (CI-required); status to ready |
| 61 | [pattern-threshold-encrypted-mempool.md](patterns/pattern-threshold-encrypted-mempool.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Title to Title Case; moved last_reviewed into identity block; emptied irrelevant standards; status to ready |
| 62 | [pattern-tls-payment-bridge.md](patterns/pattern-tls-payment-bridge.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Title to Title Case; TLSNotary repo + PIX/UPI verified; status to ready |
| 63 | [pattern-user-controlled-viewing-keys.md](patterns/pattern-user-controlled-viewing-keys.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Reviewed, clean; status to ready |
| 64 | [pattern-verifiable-attestation.md](patterns/pattern-verifiable-attestation.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Title to Verifiable Attestation (matches slug); last_reviewed bumped (already ready) |
| 65 | [pattern-voprf-nullifiers.md](patterns/pattern-voprf-nullifiers.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Reviewed, clean; status to ready |
| 66 | [pattern-zk-kyc-ml-id-erc734-735.md](patterns/pattern-zk-kyc-ml-id-erc734-735.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Reviewed, clean; status to ready |
| 67 | [pattern-zk-promises.md](patterns/pattern-zk-promises.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Reviewed clean; eprint 2024/1260 + USENIX (Shih) + ZK podcast 389 cites verified; status to ready |
| 68 | [pattern-zk-proof-systems.md](patterns/pattern-zk-proof-systems.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Reviewed clean; comparison table + co-snark 2021/1530 + arkworks/Plonky3/stone repos verified; status to ready |
| 69 | [pattern-zk-tls.md](patterns/pattern-zk-tls.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Fixed "iEEE" to "IEEE"; status to ready |
| 70 | [pattern-zk-wrappers.md](patterns/pattern-zk-wrappers.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 | Normalized to template (de-bold, role tags, frontmatter migrated); PQ vector adds proof-system exposure; zk-creds cite fixed; status to ready |

## Use Cases (23)

| # | File | Status | Reviewer | Claimed | Reviewed | Notes |
|---|------|--------|----------|---------|----------|-------|
| 1 | [private-bonds.md](use-cases/private-bonds.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Private iptf-pm umbrella link to public iptf-pocs ref; EIP-6123 to ERC-6123 |
| 2 | [private-commodities.md](use-cases/private-commodities.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Reviewed clean |
| 3 | [private-corporate-bonds.md](use-cases/private-corporate-bonds.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | EIP-6123 to ERC-6123 |
| 4 | [private-derivatives.md](use-cases/private-derivatives.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Reviewed clean (ERC-6123 naming already correct) |
| 5 | [private-fx.md](use-cases/private-fx.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Softened unverified "99% USD-backed stablecoins" (sources: >90%) |
| 6 | [private-government-debt.md](use-cases/private-government-debt.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Reviewed clean; EPIC link to Open Q4 |
| 7 | [private-identity.md](use-cases/private-identity.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | World ID 25M+ to 18M+ verified humans; ERC-7943/OpenAC(2026/251)/ZKPassport verified |
| 8 | [private-messaging.md](use-cases/private-messaging.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Dropped duplicated Bloomberg open-question |
| 9 | [private-money-market-funds.md](use-cases/private-money-market-funds.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Linked existing Approach (was "Approach TBD"); trimmed vague cost-reduction slop |
| 10 | [private-oracles.md](use-cases/private-oracles.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | domain Data Oracles to Data & Oracles; removed duplicated "default private" note |
| 11 | [private-payments.md](use-cases/private-payments.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Reviewed clean; EPIC link to Open Q4 |
| 12 | [private-procurement.md](use-cases/private-procurement.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Reviewed clean; EPIC link to Open Q4 |
| 13 | [private-read.md](use-cases/private-read.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | domain Data Oracles to Data & Oracles; status to ready; RFP link verified |
| 14 | [private-registry.md](use-cases/private-registry.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Reviewed clean; status to ready; EPIC link to Open Q4 |
| 15 | [private-repo.md](use-cases/private-repo.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Corrected flash-loan analogy to over-collateralized lending; status to ready |
| 16 | [private-rwa-tokenization.md](use-cases/private-rwa-tokenization.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | RWA figures: scope note (DefiLlama vs Coinbase) + fixed $15.801b precision; ERC-7943 verified real (Final) |
| 17 | [private-stablecoins.md](use-cases/private-stablecoins.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Reviewed clean (ERC-7573 ercs links + GENIUS/MiCA refs ok) |
| 18 | [private-stocks.md](use-cases/private-stocks.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | CLARITY Act refined (passed House Jul 2025; tokenized securities); status to ready |
| 19 | [private-supply-chain.md](use-cases/private-supply-chain.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Reviewed clean; status to ready; EPIC link to Open Q4 |
| 20 | [private-treasuries.md](use-cases/private-treasuries.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Reviewed clean; status to ready |
| 21 | [resilient-civic-participation.md](use-cases/resilient-civic-participation.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | domain labels to Title Case (Governance / Identity & Compliance) |
| 22 | [resilient-disbursement-rails.md](use-cases/resilient-disbursement-rails.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | domain secondary to Identity & Compliance; fixed stale approach #anchors (Section F/G) |
| 23 | [resilient-identity-continuity.md](use-cases/resilient-identity-continuity.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | domain to Identity & Compliance (dropped redundant secondary); fixed #anchor; zk-promises 2025 to 2024; World ID 25M+ to 18M+ |

## Approaches (10)

| # | File | Status | Reviewer | Claimed | Reviewed | Notes |
|---|------|--------|----------|---------|----------|-------|
| 1 | [approach-civic-participation.md](approaches/approach-civic-participation.md) | `ok` | Meyanis95 | 2026-06-24 | 2026-06-24 | Reviewed clean; EIP-4844 retention math (4096 epochs ≈ 18d), UltraHonk/BN254, FOCIL/EIP-7805 refs verified; status to ready |
| 2 | [approach-dvp-atomic-settlement.md](approaches/approach-dvp-atomic-settlement.md) | `ok` | Meyanis95 | 2026-06-24 | 2026-06-24 | **Fixed HTLC timeout ordering** (`T2 < T1` to `T2 > T1`, 3×): secret-revealer's leg must expire last, old ordering let a malicious seller refund the asset at T2 and still claim payment (verified vs Tier Nolan). EIP-6123 to ERC-6123 (5×); status to ready. **Review 2026-06-24** (plannotator): reframed in place, HTLC demoted to cross-chain primitive (privacy to none), constraints corrected to native L1 atomicity, personas/recommendation reworked; out-of-scope ERC-6123 lifecycle table removed + 6123/3643 made optional; FINOS to chatch HTLC repo; added pattern-shielding (incl. zk-tee poc) |
| 3 | [approach-private-bonds.md](approaches/approach-private-bonds.md) | `ok` | Meyanis95 | 2026-06-24 | 2026-06-24 | TACEO co-SNARK re-tiered `3-of-3 (no tolerance)` to honest-majority 3-party (matches co-snark pattern + payments card + TACEO REP3/Shamir); Railgun `>$4b` to `~$4b (2025)`; de-duped privacy phrasing; status to ready. **Review 2026-06-24** (plannotator): UTXO threat model rewritten to real threats (circuit-soundness bug, loss of local note state, relayer/issuer censorship) |
| 4 | [approach-private-broadcasting.md](approaches/approach-private-broadcasting.md) | `ok` | Meyanis95 | 2026-06-24 | 2026-06-24 | SUAVE/suave-geth marked archived (May 2025 to BuilderNet) in impls list + 2 prose refs; ey.md#nightfall-v4 anchor verified; status to ready |
| 5 | [approach-private-derivatives.md](approaches/approach-private-derivatives.md) | `ok` | Meyanis95 | 2026-06-24 | 2026-06-24 | TACEO `3-of-3` to honest-majority (as bonds); dropped garbled "MiFID II under MiCA" to "MiFID II"; de-duped privacy phrasing; status to ready |
| 6 | [approach-private-identity.md](approaches/approach-private-identity.md) | `ok` | Meyanis95 | 2026-06-24 | 2026-06-24 | TACEO OPRF to `live in production` (CR follow-up 2026-06-29 superseded the earlier `public beta` fix; approach maturity stays `prototyped`); removed dangling `A-E`/`A-D` letter refs; ZKPassport 120+ countries & Aztec-sale OFAC/Swiss/EU/UK claims verified (stand); status to ready |
| 7 | [approach-private-money-market-funds.md](approaches/approach-private-money-market-funds.md) | `ok` | Meyanis95 | 2026-06-24 | 2026-06-24 | Rule 2a-7 example `liquidity ratio > 30%` to `weekly liquid assets ≥ 50%` (2023 amendments, compliance Apr 2024); status to ready |
| 8 | [approach-private-payments.md](approaches/approach-private-payments.md) | `ok` | Meyanis95 | 2026-06-24 | 2026-06-24 | Removed dangling `Sections A-C` ref to named rails; PoC benchmarks + honest-majority MPC framing already correct; status to ready |
| 9 | [approach-private-trade-settlement.md](approaches/approach-private-trade-settlement.md) | `ok` | Meyanis95 | 2026-06-24 | 2026-06-24 | EIP-7683 to ERC-7683 (4×); 5 sub-approach CROPS/maturity + cross-refs verified; status to ready |
| 10 | [approach-white-label-deployment.md](approaches/approach-white-label-deployment.md) | `ok` | Meyanis95 | 2026-06-24 | 2026-06-24 | Removed broken `related_use_cases` slug `private-trade-settlement` (that's an approach, no such use-case); DIY-Validium/RISC Zero refs verified; status to ready |

## Domains (8)

| # | File | Status | Reviewer | Claimed | Reviewed | Notes |
|---|------|--------|----------|---------|----------|-------|
| 1 | [custody.md](domains/custody.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 |  |
| 2 | [data-oracles.md](domains/data-oracles.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 |  |
| 3 | [funds-assets.md](domains/funds-assets.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 |  |
| 4 | [governance.md](domains/governance.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 |  |
| 5 | [identity-compliance.md](domains/identity-compliance.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 |  |
| 6 | [payments.md](domains/payments.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 |  |
| 7 | [post-quantum.md](domains/post-quantum.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 |  |
| 8 | [trading.md](domains/trading.md) | `ok` | Meyanis95 | 2026-06-18 | 2026-06-18 |  |

## Jurisdictions (7)

| # | File | Status | Reviewer | Claimed | Reviewed | Notes |
|---|------|--------|----------|---------|----------|-------|
| 1 | [cn-crypto-ban.md](jurisdictions/cn-crypto-ban.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Reshaped 478 to 180w; status in-review to ready; cut prescriptive + privacy sections |
| 2 | [de-eWpG.md](jurisdictions/de-eWpG.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Reshaped 457 to 155w; region EU/Germany to EU; cut playbooks + Glossary; added See also |
| 3 | [eu-data-protection.md](jurisdictions/eu-data-protection.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Reshaped 354 to 178w; title gained Jurisdiction: prefix; cut Enterprise Opportunities |
| 4 | [eu-MiCA.md](jurisdictions/eu-MiCA.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Reshaped 761 to 154w; cut 6 per-domain compliance playbooks |
| 5 | [hk-crypto-licensing.md](jurisdictions/hk-crypto-licensing.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Reshaped 564 to 160w; fixed duplicate heading; status in-review to ready |
| 6 | [int-banking-secrecy.md](jurisdictions/int-banking-secrecy.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Reshaped 522 to 183w; title +Jurisdiction:; region to Global; cut operational advice |
| 7 | [us-SEC.md](jurisdictions/us-SEC.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Reshaped 511 to 190w; cut Howey/GENIUS/per-domain playbooks |

## Vendors (24)

| # | File | Status | Reviewer | Claimed | Reviewed | Notes |
|---|------|--------|----------|---------|----------|-------|
| 1 | [aztec.md](vendors/aztec.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | maturity `production (Ignition Chain)` to `production` |
| 2 | [chainlink-ace.md](vendors/chainlink-ace.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Heading placeholders stripped |
| 3 | [curvy.md](vendors/curvy.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Heading placeholders stripped |
| 4 | [ey.md](vendors/ey.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | status `production` to `ready`; **flagged**: non-standard two-product card (Nightfall v4 / Starlight) left for vendor |
| 5 | [fairblock.md](vendors/fairblock.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Heading suffix stripped; extra Selective-disclosure section kept |
| 6 | [fhenix.md](vendors/fhenix.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Title `Product Fhenix` to `Fhenix`; placeholders stripped |
| 7 | [fireblocks.md](vendors/fireblocks.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Heading placeholders stripped |
| 8 | [flashbots.md](vendors/flashbots.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Restructured Overview-scheme to template (no claim changes) |
| 9 | [hinkal.md](vendors/hinkal.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Heading placeholders stripped |
| 10 | [iexec.md](vendors/iexec.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Reviewed; maturity `mainnet` now valid (schema) |
| 11 | [miden.md](vendors/miden.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Title `Vendor/Pattern:` to `Vendor:` |
| 12 | [orion-finance.md](vendors/orion-finance.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Reviewed; maturity `testnet` now valid |
| 13 | [paladin.md](vendors/paladin.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Placeholders stripped; missing Privacy domains (recommended) to vendor |
| 14 | [peer.md](vendors/peer.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Removed inline CROPS profile; placeholders stripped |
| 15 | [privacypools.md](vendors/privacypools.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Heading placeholders stripped |
| 16 | [railgun.md](vendors/railgun.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Heading placeholders stripped |
| 17 | [renegade.md](vendors/renegade.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Heading placeholders stripped |
| 18 | [shutter.md](vendors/shutter.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Restructured Overview-scheme to template (no claim changes) |
| 19 | [soda-labs.md](vendors/soda-labs.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | maturity verbose to `mainnet`; removed `<br>` from H1 |
| 20 | [space-and-time.md](vendors/space-and-time.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Reviewed; maturity `mainnet` now valid |
| 21 | [taceo-merces.md](vendors/taceo-merces.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Reviewed; maturity `testnet` now valid |
| 22 | [tx-shield.md](vendors/tx-shield.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | status `published` to `ready`; Fits to links (dropped 4 broken refs; `erc5753` to `erc7573` typo fixed) |
| 23 | [zama.md](vendors/zama.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Reviewed; maturity `testnet` now valid |
| 24 | [zksync.md](vendors/zksync.md) | `ok` | Meyanis95 | 2026-06-19 | 2026-06-19 | Heading placeholders stripped |

---

## Structural / Meta Checks

These are one-time checks on the overall map integrity:

| Check | Status | Reviewer | Date | Notes |
|-------|--------|----------|------|-------|
| GLOSSARY.md - all terms accurate | `ok` | Meyanis95 | 2026-06-24 | glossary definitions reviewed/accurate; per-card terminology-variant consistency (e.g. ZK proof to zero-knowledge proof, ERC3643 to ERC-3643; 18 hits/11 files, mostly vendors) is a known separate backlog |
| README.md - navigation links valid | `ok` | Meyanis95 | 2026-06-24 | all 8 root nav links resolve |
| CONTRIBUTING.md - up to date | `ok` | Meyanis95 | 2026-06-24 | CROPS rubric retained (used by patterns/approaches); vendor docs keep CROPS as a curation guideline, no change needed (Q6) |
| All internal cross-links resolve | `ok` | Meyanis95 | 2026-06-24 | content links resolve after l2-eval cleanup; intentional non-resolving refs left as-is, template/example placeholders (rfps/_template.md, CONTRIBUTING.md), historical CHANGELOG release links to since-removed content (l2-eval/survey/weekly-updates; past releases are immutable), QA-AUDIT deprecated-row link (tracker bookkeeping) |
| No orphan files (unreferenced content) | `ok` | Meyanis95 | 2026-06-24 | reviewed, prose-link "orphans" are mostly frontmatter/README-reachable (taxonomy); approach-white-label-deployment flagged for a use-case backlink (backlog) |
| Frontmatter schema validation passes | `ok` | Meyanis95 | 2026-06-24 | `validate-patterns.js` passes (only content word-count warnings) |
| Vale linting passes on all files | `ok` | Meyanis95 | 2026-06-24 | 0 errors; ~196 advisory warnings (IPTF.Marketing / IPTF.Terminology) to prose-sweep backlog |

---

## Open Questions

Questions, uncertainties, or decisions that surface during the audit. Resolve or escalate before closing the audit.

| # | Question | Raised by | Date | Related file(s) | Resolution |
|---|----------|-----------|------|------------------|------------|
| 1 | Is `maturity: production` applied consistently? It sits on an offchain pattern with no mainnet usage (mesh) and recent frameworks (OIF). What is the rubric for non-onchain patterns? | Meyanis95 | 2026-06-17 | [pattern-mesh-store-forward-submission.md](patterns/pattern-mesh-store-forward-submission.md), [pattern-oif.md](patterns/pattern-oif.md) | 2026-06-18: related data point, compliance-monitoring + cross-chain-privacy-bridge re-tiered testnet to concept (empty impls, generic archetypes). Production-tier rubric for non-onchain patterns still open. **Resolved 2026-06-24:** rubric = judge the primitive's maturity in the Ethereum context, mesh-store-forward-submission `production` to `concept` (no Ethereum-context implementation); OIF kept `production` (ERC-7683 intents live via Across/UniswapX). |
| 2 | Should `pattern-l2-privacy-evaluation` stay in `patterns/` or move to `approaches/` (or a methodology doc)? It is an evaluation framework (crops_profile `n/a`, table-driven), not a reusable privacy primitive, the card self-flags this. | Meyanis95 | 2026-06-18 | pattern-l2-privacy-evaluation.md _(removed)_ | **Resolved 2026-06-24:** removed from the map (maintainer decision). Cleaned 3 `see_also` refs + 2 rfp-benchmark-dashboard links; tracker row 18 to `deprecated`. Historical CHANGELOG [0.3.0] entry left intact (past releases are immutable). |
| 3 | `private-iso20022` See-also links to iso20022.org (message-definitions, `supplementary_data.page`) could not be verified, iso20022.org blocks automated fetchers (curl 000, WebFetch timeout) and the `.page` URL looks legacy. Needs a manual browser check, or repoint to the iso20022.org catalogue root. | Meyanis95 | 2026-06-18 | [pattern-private-iso20022.md](patterns/pattern-private-iso20022.md) | **Resolved 2026-06-24:** kept the message-definitions link; repointed the legacy `supplementary_data.page` link to the iso20022.org catalogue root (stable). |
| 4 | EPIC map demo link (`epic-webapp.vercel.app`) is referenced from 7 use-cases but is a Vercel preview URL (linkrot risk). Repoint to a stable/canonical URL, or confirm this is the canonical partner location. | Meyanis95 | 2026-06-19 | private-government-debt, private-payments, private-identity, private-registry, private-oracles, private-procurement, private-supply-chain | **Resolved 2026-06-24:** `epic-webapp.vercel.app` confirmed canonical by maintainer; kept across the 7 use-cases. |
| 5 | Use-case `status`: the 14 former stubs are now `ready`, but the 9 complete/resilient files carry no `status` and the use-case `_template.md` omits it. Standardize (add `status: ready` to all + document in template) or keep `status` optional? | Meyanis95 | 2026-06-19 | [use-cases/_template.md](use-cases/_template.md) | Resolved 2026-06-19: `status: ready` on all 23 + added to `_template.md`; titles also normalized (unquoted, `(ERC-6123)` dropped from derivatives title) |
| 6 | Dropped `## CROPS profile` from the vendor template + removed peer's inline CROPS (per decision), but the vendor [README](vendors/README.md) and [CONTRIBUTING § CROPS Evaluation](CONTRIBUTING.md#crops-evaluation) still present CROPS as the core vendor-evaluation framework. Reconcile the README/CONTRIBUTING, or reintroduce CROPS in another form? | Meyanis95 | 2026-06-19 | [vendors/README.md](vendors/README.md), [CONTRIBUTING.md](CONTRIBUTING.md) | **Resolved 2026-06-24:** keep CROPS as a curation guideline in the vendor docs (vendors/README + CONTRIBUTING left intact). The reconciliation is the already-completed drop of the *per-card* CROPS profile from the vendor template; the docs may reference CROPS as a selection guideline without per-card scoring. |
| 7 | Some approaches list `primary_patterns` that no sub-approach `uses_patterns` references, dvp-atomic-settlement (`pattern-commit-and-prove`), private-payments (`pattern-private-iso20022`, `pattern-private-stablecoin-shielded-payments`). The template's subset rule is satisfied, but a *primary* pattern unused by every sub-approach is odd. Demote to supporting, or accept primaries as thematic anchors? | Meyanis95 | 2026-06-24 | [approach-dvp-atomic-settlement.md](approaches/approach-dvp-atomic-settlement.md), [approach-private-payments.md](approaches/approach-private-payments.md) | **Resolved 2026-06-24:** demoted the unused primaries to supporting, dvp (commit-and-prove); payments (private-iso20022, private-stablecoin-shielded-payments). |
| 8 | Throughput figures in co-SNARK / FHE sub-approaches (`~200 TPS` co-SNARK, `500-1000 TPS` FHE in bonds; PoC benchmarks in payments) are stated as fact but trace to IPTF PoCs / vendor claims and were not independently verifiable in this pass. Add explicit sourcing or qualify as PoC-measured? Also: "Trusted setup is not required (UltraHonk)" recurs map-wide but UltraHonk uses a universal KZG SRS, precise wording is "no per-circuit trusted setup". | Meyanis95 | 2026-06-24 | [approach-private-bonds.md](approaches/approach-private-bonds.md), [approach-private-derivatives.md](approaches/approach-private-derivatives.md) | **Resolved 2026-06-24:** qualified co-SNARK ~200 TPS (TACEO-reported) + FHE 500-1000 TPS (vendor-reported) in bonds/derivatives; fixed "trusted setup not required (UltraHonk)" to "no per-circuit trusted setup (universal KZG SRS)" in bonds + payments; corrected the zk-wrappers UltraHonk transparency claim. |
