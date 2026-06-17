# IPTF Map - Q2 2026 QA Audit

> **Goal:** Every content file in the map read and reviewed by a human. Main targets: slop and incoherences.
> **Period:** Q2 2026 (April - June)
> **Where:** All audit work happens on the `feat/audit` branch ([PR #130](https://github.com/ethereum/iptf-map/pull/130)).

## How the audit works (claim and reveal)

The tracker below is the single source of truth for who is reviewing what. Claim before you review so nobody duplicates work.

1. **Pull first:** `git pull origin feat/audit` to see the latest claims.
2. **Claim a batch:** pick 5-10 `pending` files (or a whole small section). Flip their rows to `claimed`, add your GitHub handle and the date in the Claimed column. Commit and push immediately so the claim is visible to others.
3. **Review the files** on this branch, against the checklist below.
4. **Small problems** (typos, wording, small incoherences): fix them directly. Commit the content fix together with the tracker flip to `ok`, and note what you fixed.
5. **Big problems** (needs refactor, structural incoherence, doubtful content): flip the row to `needs-fix`, open a GitHub issue and link it in the Notes column. Flip to `ok` once the issue is resolved.
6. **Uncertainties** (you cannot verify a notion or construction): add a row to [Open Questions](#open-questions) so it gets resolved or escalated before the audit closes.

**Stale claims:** a `claimed` row untouched for 7+ days may be reclaimed by someone else.

**Keeping the tracker in sync:** `node scripts/audit-sync.js` checks the file list against `origin/master` (run `git fetch origin master` first); `node scripts/audit-sync.js --sync` adds new files as `pending` and recomputes the summary without touching existing review data. CI runs the check on every push to `feat/audit`.

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
| Patterns | 70 | 20 | 0 | 0 | 0 | 50 |
| Use Cases | 23 | 0 | 0 | 0 | 0 | 23 |
| Approaches | 10 | 0 | 0 | 0 | 0 | 10 |
| Domains | 8 | 0 | 0 | 0 | 0 | 8 |
| Jurisdictions | 7 | 0 | 0 | 0 | 0 | 7 |
| Vendors | 24 | 0 | 0 | 0 | 0 | 24 |
| **Total** | **142** | **20** | **0** | **0** | **0** | **122** |

---

## Patterns (70)

| # | File | Status | Reviewer | Claimed | Reviewed | Notes |
|---|------|--------|----------|---------|----------|-------|
| 1 | [pattern-blob-anchored-state-with-dispute.md](patterns/pattern-blob-anchored-state-with-dispute.md) | `pending` |  |  |  |  |
| 2 | [pattern-co-snark.md](patterns/pattern-co-snark.md) | `pending` |  |  |  |  |
| 3 | [pattern-commit-and-prove.md](patterns/pattern-commit-and-prove.md) | `ok` | Meyanis95 | 2026-06-15 | 2026-06-15 | Retitled to cross-chain settlement; status→ready |
| 4 | [pattern-compliance-monitoring.md](patterns/pattern-compliance-monitoring.md) | `pending` |  |  |  |  |
| 5 | [pattern-cross-chain-privacy-bridge.md](patterns/pattern-cross-chain-privacy-bridge.md) | `pending` |  |  |  |  |
| 6 | [pattern-crypto-registry-bridge-ewpg-eas.md](patterns/pattern-crypto-registry-bridge-ewpg-eas.md) | `ok` | Meyanis95 | 2026-06-15 | 2026-06-15 | Title register→registry (matches filename) |
| 7 | [pattern-dvp-erc7573.md](patterns/pattern-dvp-erc7573.md) | `pending` |  |  |  |  |
| 8 | [pattern-eil.md](patterns/pattern-eil.md) | `pending` |  |  |  |  |
| 9 | [pattern-erc3643-rwa.md](patterns/pattern-erc3643-rwa.md) | `ok` | Meyanis95 | 2026-06-15 | 2026-06-15 | Removed unverified ERC-8056 refs; status→ready |
| 10 | [pattern-focil-eip7805.md](patterns/pattern-focil-eip7805.md) | `pending` |  |  |  |  |
| 11 | [pattern-forced-withdrawal.md](patterns/pattern-forced-withdrawal.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Dropped disputed proving-time figures; gas qualified to Groth16; arXiv 86%/129 stat verified; status→ready |
| 12 | [pattern-forward-secure-pseudorandom-tree.md](patterns/pattern-forward-secure-pseudorandom-tree.md) | `pending` |  |  |  |  |
| 13 | [pattern-forward-secure-signatures.md](patterns/pattern-forward-secure-signatures.md) | `pending` |  |  |  |  |
| 14 | [pattern-hybrid-public-private-modes.md](patterns/pattern-hybrid-public-private-modes.md) | `pending` |  |  |  |  |
| 15 | [pattern-icma-bdt-data-model.md](patterns/pattern-icma-bdt-data-model.md) | `pending` |  |  |  |  |
| 16 | [pattern-immutable-guarantees.md](patterns/pattern-immutable-guarantees.md) | `pending` |  |  |  |  |
| 17 | [pattern-l2-encrypted-offchain-audit.md](patterns/pattern-l2-encrypted-offchain-audit.md) | `pending` |  |  |  |  |
| 18 | [pattern-l2-privacy-evaluation.md](patterns/pattern-l2-privacy-evaluation.md) | `pending` |  |  |  |  |
| 19 | [pattern-lean-ethereum.md](patterns/pattern-lean-ethereum.md) | `pending` |  |  |  |  |
| 20 | [pattern-mesh-store-forward-submission.md](patterns/pattern-mesh-store-forward-submission.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Bridgefy is MIT-licensed (fixed "commercial"); status→ready; maturity raised as Open Q |
| 21 | [pattern-mixnet-anonymity.md](patterns/pattern-mixnet-anonymity.md) | `ok` | Meyanis95 | 2026-06-15 | 2026-06-15 | Reviewed; status→ready |
| 22 | [pattern-modular-privacy-stack.md](patterns/pattern-modular-privacy-stack.md) | `pending` |  |  |  |  |
| 23 | [pattern-mpc-custody.md](patterns/pattern-mpc-custody.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Swapped ZenGo repo→klaytn-thresh-wallet (2-party); reworded "regulated-grade"; status→ready |
| 24 | [pattern-native-account-abstraction.md](patterns/pattern-native-account-abstraction.md) | `ok` | Meyanis95 | 2026-06-15 | 2026-06-15 | Reviewed; status→ready |
| 25 | [pattern-network-anonymity.md](patterns/pattern-network-anonymity.md) | `ok` | Meyanis95 | 2026-06-15 | 2026-06-15 | Reviewed; status→ready |
| 26 | [pattern-noir-private-contracts.md](patterns/pattern-noir-private-contracts.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Dropped unverified 8GB RAM figure; last_reviewed bumped (already ready) |
| 27 | [pattern-oif.md](patterns/pattern-oif.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Title Intent→Intents; noted mostly-draft standards + openintents.xyz; status→ready |
| 28 | [pattern-onion-routing.md](patterns/pattern-onion-routing.md) | `ok` | Meyanis95 | 2026-06-15 | 2026-06-15 | Reviewed; status→ready |
| 29 | [pattern-origin-locked-confidential-ledger.md](patterns/pattern-origin-locked-confidential-ledger.md) | `pending` |  |  |  |  |
| 30 | [pattern-permissioned-ledger-interoperability.md](patterns/pattern-permissioned-ledger-interoperability.md) | `pending` |  |  |  |  |
| 31 | [pattern-permissionless-spend-auth.md](patterns/pattern-permissionless-spend-auth.md) | `pending` |  |  |  |  |
| 32 | [pattern-plasma-stateless-privacy.md](patterns/pattern-plasma-stateless-privacy.md) | `pending` |  |  |  |  |
| 33 | [pattern-pretrade-privacy-encryption.md](patterns/pattern-pretrade-privacy-encryption.md) | `pending` |  |  |  |  |
| 34 | [pattern-privacy-l2s.md](patterns/pattern-privacy-l2s.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Removed Aleo (L1) + fhEVM refs; kept production (Aztec); status→ready; FHE framing raised as Open Q |
| 35 | [pattern-private-information-retrieval.md](patterns/pattern-private-information-retrieval.md) | `pending` |  |  |  |  |
| 36 | [pattern-private-iso20022.md](patterns/pattern-private-iso20022.md) | `pending` |  |  |  |  |
| 37 | [pattern-private-mtp-auth.md](patterns/pattern-private-mtp-auth.md) | `pending` |  |  |  |  |
| 38 | [pattern-private-pvp-stablecoins-erc7573.md](patterns/pattern-private-pvp-stablecoins-erc7573.md) | `pending` |  |  |  |  |
| 39 | [pattern-private-set-intersection-circuit.md](patterns/pattern-private-set-intersection-circuit.md) | `pending` |  |  |  |  |
| 40 | [pattern-private-set-intersection-dh.md](patterns/pattern-private-set-intersection-dh.md) | `pending` |  |  |  |  |
| 41 | [pattern-private-set-intersection-fhe.md](patterns/pattern-private-set-intersection-fhe.md) | `pending` |  |  |  |  |
| 42 | [pattern-private-set-intersection-oprf.md](patterns/pattern-private-set-intersection-oprf.md) | `pending` |  |  |  |  |
| 43 | [pattern-private-shared-state-cosnark.md](patterns/pattern-private-shared-state-cosnark.md) | `pending` |  |  |  |  |
| 44 | [pattern-private-shared-state-fhe.md](patterns/pattern-private-shared-state-fhe.md) | `pending` |  |  |  |  |
| 45 | [pattern-private-shared-state-tee.md](patterns/pattern-private-shared-state-tee.md) | `pending` |  |  |  |  |
| 46 | [pattern-private-stablecoin-shielded-payments.md](patterns/pattern-private-stablecoin-shielded-payments.md) | `pending` |  |  |  |  |
| 47 | [pattern-private-transaction-broadcasting.md](patterns/pattern-private-transaction-broadcasting.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | shielding alternative_to→composes_with; MEV-Boost/Shutter claims confirmed; status→ready |
| 48 | [pattern-private-vaults.md](patterns/pattern-private-vaults.md) | `pending` |  |  |  |  |
| 49 | [pattern-proof-of-innocence.md](patterns/pattern-proof-of-innocence.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Expanded PPOI acronym; repos confirmed; status→ready |
| 50 | [pattern-recipient-derived-receive-addresses.md](patterns/pattern-recipient-derived-receive-addresses.md) | `pending` |  |  |  |  |
| 51 | [pattern-regulatory-disclosure-keys-proofs.md](patterns/pattern-regulatory-disclosure-keys-proofs.md) | `pending` |  |  |  |  |
| 52 | [pattern-relay-mediated-proving.md](patterns/pattern-relay-mediated-proving.md) | `pending` |  |  |  |  |
| 53 | [pattern-safe-proof-delegation.md](patterns/pattern-safe-proof-delegation.md) | `pending` |  |  |  |  |
| 54 | [pattern-shielding.md](patterns/pattern-shielding.md) | `ok` | Meyanis95 | 2026-06-15 | 2026-06-15 | Dropped ERC-3643 from standards; added hardened-pool refs |
| 55 | [pattern-social-recovery.md](patterns/pattern-social-recovery.md) | `ok` | Meyanis95 | 2026-06-15 | 2026-06-15 | Removed bold + inline i2u/i2i; Protocol role tags; status→ready |
| 56 | [pattern-stealth-addresses.md](patterns/pattern-stealth-addresses.md) | `ok` | Meyanis95 | 2026-06-15 | 2026-06-15 | Reviewed, clean; status→ready |
| 57 | [pattern-tee-based-privacy.md](patterns/pattern-tee-based-privacy.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Corrected HSM EAL claim (most are EAL4+); status→ready |
| 58 | [pattern-tee-key-manager.md](patterns/pattern-tee-key-manager.md) | `pending` |  |  |  |  |
| 59 | [pattern-tee-network-anonymity.md](patterns/pattern-tee-network-anonymity.md) | `pending` |  |  |  |  |
| 60 | [pattern-tee-zk-settlement.md](patterns/pattern-tee-zk-settlement.md) | `pending` |  |  |  |  |
| 61 | [pattern-threshold-encrypted-mempool.md](patterns/pattern-threshold-encrypted-mempool.md) | `pending` |  |  |  |  |
| 62 | [pattern-tls-payment-bridge.md](patterns/pattern-tls-payment-bridge.md) | `pending` |  |  |  |  |
| 63 | [pattern-user-controlled-viewing-keys.md](patterns/pattern-user-controlled-viewing-keys.md) | `pending` |  |  |  |  |
| 64 | [pattern-verifiable-attestation.md](patterns/pattern-verifiable-attestation.md) | `ok` | Meyanis95 | 2026-06-17 | 2026-06-17 | Title→Verifiable Attestation (matches slug); last_reviewed bumped (already ready) |
| 65 | [pattern-voprf-nullifiers.md](patterns/pattern-voprf-nullifiers.md) | `pending` |  |  |  |  |
| 66 | [pattern-zk-kyc-ml-id-erc734-735.md](patterns/pattern-zk-kyc-ml-id-erc734-735.md) | `pending` |  |  |  |  |
| 67 | [pattern-zk-promises.md](patterns/pattern-zk-promises.md) | `pending` |  |  |  |  |
| 68 | [pattern-zk-proof-systems.md](patterns/pattern-zk-proof-systems.md) | `pending` |  |  |  |  |
| 69 | [pattern-zk-tls.md](patterns/pattern-zk-tls.md) | `pending` |  |  |  |  |
| 70 | [pattern-zk-wrappers.md](patterns/pattern-zk-wrappers.md) | `pending` |  |  |  |  |

## Use Cases (23)

| # | File | Status | Reviewer | Claimed | Reviewed | Notes |
|---|------|--------|----------|---------|----------|-------|
| 1 | [private-bonds.md](use-cases/private-bonds.md) | `pending` |  |  |  |  |
| 2 | [private-commodities.md](use-cases/private-commodities.md) | `pending` |  |  |  |  |
| 3 | [private-corporate-bonds.md](use-cases/private-corporate-bonds.md) | `pending` |  |  |  |  |
| 4 | [private-derivatives.md](use-cases/private-derivatives.md) | `pending` |  |  |  |  |
| 5 | [private-fx.md](use-cases/private-fx.md) | `pending` |  |  |  |  |
| 6 | [private-government-debt.md](use-cases/private-government-debt.md) | `pending` |  |  |  |  |
| 7 | [private-identity.md](use-cases/private-identity.md) | `pending` |  |  |  |  |
| 8 | [private-messaging.md](use-cases/private-messaging.md) | `pending` |  |  |  |  |
| 9 | [private-money-market-funds.md](use-cases/private-money-market-funds.md) | `pending` |  |  |  |  |
| 10 | [private-oracles.md](use-cases/private-oracles.md) | `pending` |  |  |  |  |
| 11 | [private-payments.md](use-cases/private-payments.md) | `pending` |  |  |  |  |
| 12 | [private-procurement.md](use-cases/private-procurement.md) | `pending` |  |  |  |  |
| 13 | [private-read.md](use-cases/private-read.md) | `pending` |  |  |  |  |
| 14 | [private-registry.md](use-cases/private-registry.md) | `pending` |  |  |  |  |
| 15 | [private-repo.md](use-cases/private-repo.md) | `pending` |  |  |  |  |
| 16 | [private-rwa-tokenization.md](use-cases/private-rwa-tokenization.md) | `pending` |  |  |  |  |
| 17 | [private-stablecoins.md](use-cases/private-stablecoins.md) | `pending` |  |  |  |  |
| 18 | [private-stocks.md](use-cases/private-stocks.md) | `pending` |  |  |  |  |
| 19 | [private-supply-chain.md](use-cases/private-supply-chain.md) | `pending` |  |  |  |  |
| 20 | [private-treasuries.md](use-cases/private-treasuries.md) | `pending` |  |  |  |  |
| 21 | [resilient-civic-participation.md](use-cases/resilient-civic-participation.md) | `pending` |  |  |  |  |
| 22 | [resilient-disbursement-rails.md](use-cases/resilient-disbursement-rails.md) | `pending` |  |  |  |  |
| 23 | [resilient-identity-continuity.md](use-cases/resilient-identity-continuity.md) | `pending` |  |  |  |  |

## Approaches (10)

| # | File | Status | Reviewer | Claimed | Reviewed | Notes |
|---|------|--------|----------|---------|----------|-------|
| 1 | [approach-civic-participation.md](approaches/approach-civic-participation.md) | `pending` |  |  |  |  |
| 2 | [approach-dvp-atomic-settlement.md](approaches/approach-dvp-atomic-settlement.md) | `pending` |  |  |  |  |
| 3 | [approach-private-bonds.md](approaches/approach-private-bonds.md) | `pending` |  |  |  |  |
| 4 | [approach-private-broadcasting.md](approaches/approach-private-broadcasting.md) | `pending` |  |  |  |  |
| 5 | [approach-private-derivatives.md](approaches/approach-private-derivatives.md) | `pending` |  |  |  |  |
| 6 | [approach-private-identity.md](approaches/approach-private-identity.md) | `pending` |  |  |  |  |
| 7 | [approach-private-money-market-funds.md](approaches/approach-private-money-market-funds.md) | `pending` |  |  |  |  |
| 8 | [approach-private-payments.md](approaches/approach-private-payments.md) | `pending` |  |  |  |  |
| 9 | [approach-private-trade-settlement.md](approaches/approach-private-trade-settlement.md) | `pending` |  |  |  |  |
| 10 | [approach-white-label-deployment.md](approaches/approach-white-label-deployment.md) | `pending` |  |  |  |  |

## Domains (8)

| # | File | Status | Reviewer | Claimed | Reviewed | Notes |
|---|------|--------|----------|---------|----------|-------|
| 1 | [custody.md](domains/custody.md) | `pending` |  |  |  |  |
| 2 | [data-oracles.md](domains/data-oracles.md) | `pending` |  |  |  |  |
| 3 | [funds-assets.md](domains/funds-assets.md) | `pending` |  |  |  |  |
| 4 | [governance.md](domains/governance.md) | `pending` |  |  |  |  |
| 5 | [identity-compliance.md](domains/identity-compliance.md) | `pending` |  |  |  |  |
| 6 | [payments.md](domains/payments.md) | `pending` |  |  |  |  |
| 7 | [post-quantum.md](domains/post-quantum.md) | `pending` |  |  |  |  |
| 8 | [trading.md](domains/trading.md) | `pending` |  |  |  |  |

## Jurisdictions (7)

| # | File | Status | Reviewer | Claimed | Reviewed | Notes |
|---|------|--------|----------|---------|----------|-------|
| 1 | [cn-crypto-ban.md](jurisdictions/cn-crypto-ban.md) | `pending` |  |  |  |  |
| 2 | [de-eWpG.md](jurisdictions/de-eWpG.md) | `pending` |  |  |  |  |
| 3 | [eu-data-protection.md](jurisdictions/eu-data-protection.md) | `pending` |  |  |  |  |
| 4 | [eu-MiCA.md](jurisdictions/eu-MiCA.md) | `pending` |  |  |  |  |
| 5 | [hk-crypto-licensing.md](jurisdictions/hk-crypto-licensing.md) | `pending` |  |  |  |  |
| 6 | [int-banking-secrecy.md](jurisdictions/int-banking-secrecy.md) | `pending` |  |  |  |  |
| 7 | [us-SEC.md](jurisdictions/us-SEC.md) | `pending` |  |  |  |  |

## Vendors (24)

| # | File | Status | Reviewer | Claimed | Reviewed | Notes |
|---|------|--------|----------|---------|----------|-------|
| 1 | [aztec.md](vendors/aztec.md) | `pending` |  |  |  |  |
| 2 | [chainlink-ace.md](vendors/chainlink-ace.md) | `pending` |  |  |  |  |
| 3 | [curvy.md](vendors/curvy.md) | `pending` |  |  |  |  |
| 4 | [ey.md](vendors/ey.md) | `pending` |  |  |  |  |
| 5 | [fairblock.md](vendors/fairblock.md) | `pending` |  |  |  |  |
| 6 | [fhenix.md](vendors/fhenix.md) | `pending` |  |  |  |  |
| 7 | [fireblocks.md](vendors/fireblocks.md) | `pending` |  |  |  |  |
| 8 | [flashbots.md](vendors/flashbots.md) | `pending` |  |  |  |  |
| 9 | [hinkal.md](vendors/hinkal.md) | `pending` |  |  |  |  |
| 10 | [iexec.md](vendors/iexec.md) | `pending` |  |  |  |  |
| 11 | [miden.md](vendors/miden.md) | `pending` |  |  |  |  |
| 12 | [orion-finance.md](vendors/orion-finance.md) | `pending` |  |  |  |  |
| 13 | [paladin.md](vendors/paladin.md) | `pending` |  |  |  |  |
| 14 | [peer.md](vendors/peer.md) | `pending` |  |  |  |  |
| 15 | [privacypools.md](vendors/privacypools.md) | `pending` |  |  |  |  |
| 16 | [railgun.md](vendors/railgun.md) | `pending` |  |  |  |  |
| 17 | [renegade.md](vendors/renegade.md) | `pending` |  |  |  |  |
| 18 | [shutter.md](vendors/shutter.md) | `pending` |  |  |  |  |
| 19 | [soda-labs.md](vendors/soda-labs.md) | `pending` |  |  |  |  |
| 20 | [space-and-time.md](vendors/space-and-time.md) | `pending` |  |  |  |  |
| 21 | [taceo-merces.md](vendors/taceo-merces.md) | `pending` |  |  |  |  |
| 22 | [tx-shield.md](vendors/tx-shield.md) | `pending` |  |  |  |  |
| 23 | [zama.md](vendors/zama.md) | `pending` |  |  |  |  |
| 24 | [zksync.md](vendors/zksync.md) | `pending` |  |  |  |  |

---

## Structural / Meta Checks

These are one-time checks on the overall map integrity:

| Check | Status | Reviewer | Date | Notes |
|-------|--------|----------|------|-------|
| GLOSSARY.md - all terms accurate | `pending` | | | |
| README.md - navigation links valid | `pending` | | | |
| CONTRIBUTING.md - up to date | `pending` | | | |
| All internal cross-links resolve | `pending` | | | |
| No orphan files (unreferenced content) | `pending` | | | |
| Frontmatter schema validation passes | `pending` | | | |
| Vale linting passes on all files | `pending` | | | |

---

## Open Questions

Questions, uncertainties, or decisions that surface during the audit. Resolve or escalate before closing the audit.

| # | Question | Raised by | Date | Related file(s) | Resolution |
|---|----------|-----------|------|------------------|------------|
| 1 | Is `maturity: production` applied consistently? It sits on an offchain pattern with no mainnet usage (mesh) and recent frameworks (OIF). What is the rubric for non-onchain patterns? | Meyanis95 | 2026-06-17 | [pattern-mesh-store-forward-submission.md](patterns/pattern-mesh-store-forward-submission.md), [pattern-oif.md](patterns/pattern-oif.md) | |
| 2 | Should the FHE-rollup framing be removed from privacy-l2s entirely (Intent, Components, Protocol, post_quantum), not just the fhEVM links? fhEVM was flagged as "not a privacy L2". | Meyanis95 | 2026-06-17 | [pattern-privacy-l2s.md](patterns/pattern-privacy-l2s.md) | |
