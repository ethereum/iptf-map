---
title: "Pattern: Stealth Addresses"
status: draft
maturity: PoC
works-best-when:
  - Sender and receiver want to hide address linkages on a public chain.
  - Amount privacy is less critical than unlinkability of counterparties.
avoid-when:
  - Strong amount confidentiality is required (use shielded pools or confidential tokens).
  - Institutions require regulator keys / scoped audit by default.
dependencies:
  - [ERC-20](https://eips.ethereum.org/EIPS/eip-20)
  - [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) (optional, account abstraction for wallet UX)
  - [EIP-5564](https://eips.ethereum.org/EIPS/eip-5564) (Ethereum Stealth Addresses draft)
---

## Intent

Enable unlinkable transfers by deriving a **one-time destination address per transaction** using cryptographic Diffie–Hellman (shared secret) between sender and receiver keys.  
Observers see the transfer to a fresh address, but only the receiver can detect and spend from it.

---

## Ingredients

- **Standards**: ERC-20 (token transfers), optional EIP-5564 for standardized stealth addresses.
- **Infra**: base L1/L2 chain; compatible wallets implementing view keys and spend keys.
- **Off-chain services**: none required, but directory/registry may help with publishing public view keys.

---

## Protocol (concise)

1. Receiver publishes a **public view key** (part of a stealth keypair).
2. Sender generates an **ephemeral key**, computes shared secret with receiver’s view key.
3. Derive a one-time **stealth address** from the secret.
4. Sender transfers ERC-20 tokens (or ETH) to the stealth address.
5. Receiver scans chain with their **private view key**, detects funds destined for them.
6. Receiver uses their **spend key** to access/control funds.
7. Optionally: receiver can disclose full transaction set to auditors via view key export.

---

## Guarantees

- **Hides**: direct link between sender and receiver; on-chain observers see only fresh addresses.
- **Does not hide**: transfer amounts or token type.
- **Audit**: receiver can share view keys for retrospective audit; no mandatory regulator path.
- **Finality**: same as base L1/L2 ERC-20 transfer finality.

---

## Trade-offs

- **Performance/UX**: requires wallets to manage extra key material (view/spend keys, stealth derivations).
- **Scanning cost**: receivers must scan chain for potential stealth addresses (mitigated with view tags).
- **Amount leakage**: visible amounts still expose competitive data.
- **Regulatory fit**: no built-in scoped regulator access; relies on voluntary disclosure.
- **Interoperability**: limited unless EIP-5564 or similar standards are widely adopted.

---

## Example

- Bank A owes Bank B €10m (tokenized ERC-20 stablecoin).
- Bank B publishes a public view key in its directory entry.
- Bank A derives a stealth address for Bank B using the shared secret, transfers 10m EURC to it.
- On-chain: looks like a transfer to a random fresh address.
- Bank B’s wallet detects the funds via its view key, then moves them to a custodian wallet.
- For audit, Bank B can later disclose the view key to regulators.

---

## See also

- pattern-private-iso20022.md (messaging integration with stealth/hidden settlement)
- pattern-aztec-privacy-l2-erc7573.md (shielded pool settlement)
- pattern-confidential-erc20-fhe-l2-erc7573.md (amount-hiding tokens)
