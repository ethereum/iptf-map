---
title: "Pattern: Attestation verifiable on-chain"
status: ready
maturity: production
layer: hybrid
privacy_goal: Verify claims about identities/credentials on-chain with minimal data disclosure
assumptions: Trusted issuers (banks, KYC providers), EAS/ONCHAINID infrastructure, wallet support
last_reviewed: 2026-01-14
works-best-when:
  - Some logic has to be embedded onchain and relies on off-chain attested data
  - A user wants to prove a statement about his identity (membership, KYC,...)
avoid-when:
  - No trusted issuer available or issuer centralization is unacceptable
  - Simple token gating is sufficient (attestations add complexity for basic access control)
dependencies: [EAS, ONCHAINID, W3C-VC]
---

## Intent

Enable smart contracts to verify claims about identities, credentials, or off-chain data without exposing unnecessary information. Attestations are issued off-chain and verified on-chain to prove statements (KYC status, accreditation, membership) while minimizing data disclosure.

## Ingredients

- **Standards:** EAS (Ethereum Attestation Service), W3C Verifiable Credentials, ONCHAINID (ERC-734/735), EIP-712 for typed data signing
- **Infra:** Ethereum L1/L2 for attestation registry, wallet support for signing/verifying credentials
- **Off-chain:** Issuer services (banks, KYC providers, regulators), credential storage (IPFS, private databases)
- **Optional:** ZK wrappers (prove a well formed signature for selective disclosure)

## Protocol (concise)

1. **Issuance:** Trusted issuer (bank, KYC provider) creates signed attestation about subject (investor accredited, passed KYC)
2. **Storage:** Attestation stored off-chain or on-chain registry (EAS, ONCHAINID smart contract)
3. **Presentation:** User presents attestation to smart contract requiring credential verification
4. **Verification:** Contract verifies issuer signature and checks attestation validity (not expired, not revoked)
5. **Access Grant:** If valid, contract grants access (allows trade, unlocks funds, enables function call)

## Guarantees

- **Privacy:**

  - Minimal disclosure: only necessary claims verified on-chain (e.g., "is accredited" not full financial details)
  - With ZK wrappers: can prove properties without revealing attestation content
  - Issuer identity typically public (necessary for trust), but subject can use pseudonymous addresses

- **Correctness:**

  - Cryptographic signatures ensure attestations cannot be forged
  - On-chain verification prevents unauthorized access
  - Revocation mechanisms allow issuers to invalidate compromised credentials

- **Auditability:**

  - Attestation issuance events logged on-chain (EAS) or via off-chain logs
  - Smart contract access checks create audit trail of credential usage
  - Regulators can verify issuer credentials and revocation status

## Trade-offs

- Performance: On-chain verification adds gas cost for signature checks and registry lookups. ZK proof verification increases preprocessing cost but improves privacy and reduces on-chain gas.
- Infrastructure: Relies on trusted issuers for attestation quality. Issuers' keys needs to be mapped (e.g., on-chain PKI).
- Privacy: On-chain verification reveals which contracts user interacts with and transaction timing. Mitigate using privacy L2s or ZK proofs.
- Standards: Multiple competing standards (EAS, W3C VC, ONCHAINID) limit cross-chain portability. Use adapters or multi-standard support.

## Example

**Institutional Bond Trading with KYC Attestations:**

1. Bank A obtains accredited investor attestation from KYC provider, signed and registered in EAS
2. Bank A wants to purchase tokenized bond requiring accredited investor status
3. Bank A presents attestation to bond smart contract, which verifies KYC provider signature
4. Contract checks attestation not expired or revoked, confirms Bank A meets requirements
5. Bond transfer executes automatically after successful verification

## See also

- [Pattern: ZK KYC/ML ID (ERC-734/735)](pattern-zk-kyc-ml-id-erc734-735.md) - Zero-knowledge identity verification
- [Pattern: Regulatory Disclosure Keys/Proofs](pattern-regulatory-disclosure-keys-proofs.md) - Selective disclosure mechanisms
- [Pattern: ERC-3643 RWA](pattern-erc3643-rwa.md) - Permissioned securities with identity management
- [Approach: Private Bonds](../approaches/approach-private-bonds.md) - Tokenized securities with compliance
- [Domain: Identity & Compliance](../domains/identity-compliance.md) - Identity infrastructure overview
- [EAS (Ethereum Attestation Service)](https://attest.sh/) - On-chain attestation protocol
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) - Standard for digital credentials
- [ONCHAINID (ERC-734/735)](https://github.com/onchain-id/solidity) - Identity and claims management
- [EIP-712](https://eips.ethereum.org/EIPS/eip-712) - Typed structured data hashing and signing
