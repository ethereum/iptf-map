---
title: "Pattern: Private Stablecoin Shielded Payments"
status: ready
maturity: pilot
works-best-when:
  - Cash leg must be private (amounts + counterparties) with selective disclosure.
  - You need Ethereum‑native tooling (L2/app‑chain) and interop with PvP or DvP.
avoid-when:
  - Public transparency is required by design, or batch netting off‑chain suffices.
dependencies: [ERC-20, ERC-3643, ERC-7573, EAS]
---

## Intent
Provide **stakeholder‑only** stablecoin transfers on Ethereum (L2/app‑chain acceptable) with **view‑key/proof‑based disclosure** for regulators and auditors, and the ability to compose atomically with asset legs (DvP) or other cash legs (PvP).

## Ingredients
- **Standards:** [ERC‑20](https://eips.ethereum.org/EIPS/eip-20) (cash), optional [ERC‑3643](https://eips.ethereum.org/EIPS/eip-3643) (holder gating), [ERC‑7573](https://ercs.ethereum.org/ERCS/erc-7573) (atomic settlement triggers), [EAS](https://attest.org/) (audit/attestations).
- **Infra:** Privacy L2/app‑chain:
  - **Programmable privacy (ZK):** [Aztec](https://docs.aztec.network/) — private notes + view keys.
  - **FHE approaches:** [Zama fhEVM](https://www.zama.ai/post/confidential-erc-20-tokens-using-homomorphic-encryption), [Fhenix L2/coFHE](https://www.fhenix.io/) (encrypted balances/amounts). Note that FHE alone doesn't provide sender/receiver anonymity, needs to be paired with with **[ERC-5564 Stealth Addresses](https://eips.ethereum.org/EIPS/eip-5564)** (or equivalent) to hide payer/payee identities.
- **Wallet/KMS:** Custodial or MPC; issuer admin keys for freeze/blacklist if mandated.
- **Optional:** L1 anchoring of encrypted audit log; oracles for cutoffs.

## Protocol (concise)
1. **Gate access (optional):** KYC issuers/custodians attest allow‑listed participants via [EAS](https://attest.org/) and/or enforce via [ERC‑3643](https://eips.ethereum.org/EIPS/eip-3643).
2. **Mint/Wrap:** Issuer mints native private‑mode stablecoin or wraps ERC‑20 into confidential form (ZK/FHE).
3. **Shielded transfer:** Payer creates a private transfer (encrypted note); only payer, payee (and permitted auditor) can view **amount + counterparty**.
4. **Selective disclosure:** Auditor/regulator obtains scoped view via viewing key or ZK proof; access is logged (EAS attestation).
5. **(Optional) Atomicity:** Couple with asset leg via [ERC‑7573](https://ercs.ethereum.org/ERCS/erc-7573) for DvP, or with other cash leg for PvP.
6. **(Optional) Anchor & archive:** Post commitment roots/hashes to L1; store encrypted append‑only audit trail off‑chain.

## Guarantees
- **Hides:** amounts, counterparties, and memos from non‑participants; reveals only to stakeholders.
- **Atomicity:** DvP (cash↔asset) or PvP (cash↔cash) when combined with ERC‑7573.
- **Auditability:** Verifiable access events via EAS; issuer controls for policy enforcement.

## Trade-offs
- **Cost/latency:** Private proofs (ZK/FHE) add overhead; choose L2/app‑chain accordingly.
- **DX:** Non‑EVM L2s (e.g., Aztec) require new tooling (Noir); FHE stacks may rely on co‑processors/oracles.
- **Leakage:** Timing/ordering metadata may persist; mitigate with batching/delayed anchors.
- **Non‑fit:** **Stealth addresses** ([ERC‑5564](https://eips.ethereum.org/EIPS/eip-5564)) hide recipients but **do not** provide issuer‑level policy or full cash‑flow privacy alone.

## Example
- A dealer pays weekend margin in a **private USDC‑like** token on a privacy L2; the venue receives funds without public leakage; the regulator gets read‑only access via a time‑bound viewing key; the payment leg participates in an **ERC‑7573** PvP with EUR stablecoin or DvP with tokenized UST collateral.

## See also
- `pattern-dvp-erc7573.md` · `pattern-l2-encrypted-offchain-audit.md` · `pattern-aztec-privacy-l2-erc7573.md` · `pattern-confidential-erc20-fhe-l2-erc7573.md`

## Prior art / references
- Canton weekend repo (USDC cash leg, atomic settlement): [press](https://www.canton.network/canton-network-press-releases/digital-asset-complete-on-chain-us-treasury-financing)
- Aztec programmable privacy: [docs](https://docs.aztec.network/)
- Zama confidential ERC‑20: [post](https://www.zama.ai/post/confidential-erc-20-tokens-using-homomorphic-encryption)
- Fhenix encrypted computation (coFHE): [overview](https://blog.arbitrum.io/fhenix-private-computation/)