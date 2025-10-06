---
title: "Vendor: Curvy"
status: draft
maturity: production
---

# Curvy - Privacy Layer for Token Transfer Routing and Settlement

## What it is

Curvy is a smart-contract-/wallet-based privacy layer for ERC-20 transfers (and other tokens) on EVM chains.  
It introduces **stealth addresses**, **view keys**, and **one-time addresses per transaction** to break linkability of sender-recipient pairs, while preserving usability.

## Fits with patterns (names only)

- Pattern: Private ISO 20022 Messaging & Settlement
- Pattern: Shielded-Pool Atomic Swap (ZK-HTLC)
- Pattern: ZK Shielded Balances for Derivatives
- Pattern: Confidential ERC-20

## Not a substitute for

- Not a full privacy rail: it does **not** hide amounts or token types inherently.
- Not a shielded pool or private balance scheme. Observers may see transfer amounts on-chain.
- Not a cross-chain atomic settlement mechanism (atomic DvP still requires more infrastructure).

## Architecture

- **Stealth addresses:**

  - Each transaction uses a uniquely derived address so that observers cannot easily link them to the same owner.
  - Behind the scenes: sender uses recipient’s **public view key** + shared secret derivation to compute a stealth address.

- **View key / Spend key model:**

  - Curvy wallet generates two key pairs: a _view key_ (private, used to detect funds intended for the user) and a _spend key_ (private, used to control and spend funds).
  - Public parts of view/spend keys are exposed to enable stealth address derivation.

- **Fast detection via view tags:**

  - Wallets do not scan all chain activity; they use lightweight view tags (small identifier bits embedded in transactions) to tell whether a transaction might belong to them, then use view key to check.

- **Sender workflow:**

  1. Sender obtains recipient’s public view key or Curvy ID.
  2. Computes shared secret → stealth address.
  3. Sends ERC-20 token to stealth address.

- **Recipient workflow:**
  1. Wallet uses private view key + view tag filtering to notice the stealth address transaction.
  2. Use private spend key to access funds.

## Privacy domains

- **Address unlinkability**: Multiple transfers use distinct stealth addresses → very hard to link transactions to the same base identity.
- **Routing privacy**: Curvy adds routing/mixing in wallet flows (though not full on-chain mixing by default).
- **Optional compliance / audit**: Users can expose view keys to auditors/regulators to show their transaction history without revealing spend control.

## Enterprise demand and use cases

- Users / individuals who want simple obfuscated transfers.
- DeFi participants concerned about on-chain linkage.
- Institutions exploring privacy for tokenized funds / internal transfers; may use Curvy for the “send privately” option in tooling, though amount privacy is still an issue.

## Technical details

- Smart contract layer: ERC-20 tokens are transferred to stealth addresses (regular addresses; each stealth address is a fresh EOA or contract?), so transfers still show amount and token.
- Key derivation: uses shared secret (Diffie-Hellman-style) between sender’s ephemeral keys and recipient’s view key to compute stealth address.
- View tag: bits/tags in transaction metadata or approximate hash prefix to filter relevant stealth addresses efficiently.
- No zero-knowledge proofs for amount privacy in current version (per docs).

## Strengths

- Strong unlinkability on addresses / sender-recipient mapping.
- Excellent UX: automatic stealth address generation, view key handling, minimal friction.
- Multichain support: helps privacy across various EVM chains.
- Optional audit via view key exposure.

## Risks and open questions

- **Amount visibility**: the amounts being transferred still public → competitive exposure remains.
- **Stealth address reuse risks**: if the same stealth address is reused (or patterns leak), unlinkability suffers.
- **View tag leakage**: leaks possible via view tag sizes or patterns (if weak entropy, too small tags).
- **Regulatory acceptance**: whether view-key sharing or optional audit is strong enough for institutional compliance.
- **No built-in atomic DvP**: doesn’t enforce settlement linkage across chains or between ISO instructions.

## Links

- [Curvy Docs: How Privacy Works](https://docs.curvy.box/how-privacy-works-in-curvy.html)
- [Curvy Website](https://www.curvy.box/)
