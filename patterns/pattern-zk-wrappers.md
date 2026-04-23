---
title: "Pattern: ZK Wrappers"
status: draft
maturity: pilot
layer: offchain
privacy_goal: Verify a pre-existing off-chain signature inside a ZK circuit so holders prove credential attributes without revealing the credential
assumptions: Signed credential from a prior issuance (passport, ID, DKIM-signed email, attestation), circuit implementing the issuer's signature and hash, published issuer public keys
last_reviewed: 2026-04-23
works-best-when:
  - A signed credential already exists in a PKI or web2 system
  - The signature scheme and issuer public keys are stable and publicly retrievable
  - Holder wants to prove attributes without revealing credential content or identity
avoid-when:
  - The credential source has an API and a TLS or API proof is sufficient (see [zk-TLS](pattern-zk-tls.md))
  - Attributes change frequently and no on-chain freshness anchor exists
  - Signature primitive has no practical in-circuit implementation
dependencies: [RFC 8017, FIPS 186-5, RFC 6376, ICAO 9303]
context: both
crops_profile:
  cr: medium
  os: partial
  privacy: full
  security: medium
---

## Intent

Verify an off-chain digital signature over an existing credential inside a ZK circuit. The verifier learns that a valid signature exists and that chosen predicates hold over the signed payload, and nothing else.

## Ingredients

- **Signature verification in-circuit**: RSA-PKCS1v1.5 and RSA-PSS (up to 4096-bit), ECDSA over P-256 / P-521 / Brainpool curves, EdDSA.
- **Hash primitive**: SHA-256, SHA-384, SHA-512 depending on credential format.
- **Issuer public key source**: passport CSCA master list, UIDAI RSA key, DKIM DNS records, EAS issuer address, W3C VC issuer DID.
- **Proof system**: Noir with Barretenberg (UltraHonk over BN254), Circom with Groth16, Halo2, SP1 zkVM.
- **Public inputs**: issuer key identifier, predicate result, optional scope-bound nullifier.

## Protocol (concise)

1. Holder obtains the signed credential. Examples: NFC read of a passport's SOD, DKIM-signed email in a mailbox, attestation fetched from EAS.
2. Holder loads the credential, the signature, and the issuer public key into the prover. The key is either a public input or compiled into the circuit.
3. Circuit verifies the signature over the payload, parses the relevant fields, and evaluates predicates such as nationality equals X, domain equals Y, age is at least N.
4. Prover outputs a proof with public inputs for the predicate result, issuer key identifier, and optional nullifier binding the proof to a verification context.
5. Verifier contract or service checks the proof and accepts the predicate. No credential bytes cross the wire.

## Guarantees

- **Hides**: credential content, signature bytes, full signed payload, and the holder's direct link to the issuer.
- **Proves**: a valid signature from a specific issuer key over a payload satisfying the declared predicates.
- **Selective disclosure**: predicates reveal only the chosen attributes (nationality, age threshold, domain) while the remaining credential fields stay hidden.
- **I2I**: the wrapped credential is usually a KYC document, national ID, or regulated attestation with a published issuer key. Counterparties accept the zero-knowledge proof instead of the raw document.
- **I2U**: holders prove attributes like age, jurisdiction, or email domain to any verifier without exposing the source credential.

## Trade-offs

- Circuits for non-arithmetic-friendly primitives are large. RSA-4096 with SHA-512, or ECDSA over P-521 emulated in BN254, reach millions of constraints. Proof generation on mobile is feasible but not cheap.
- The issuer still controls new issuance. Existing signed credentials remain provable after issuer failure, but revocation and refresh depend on the issuer unless paired with an on-chain anchor. See [Resilient Identity Continuity](../use-cases/resilient-identity-continuity.md).
- Post-quantum exposure: RSA and ECDSA are broken by a CRQC. A wrapped signature is as weak as its underlying scheme. See [Post-Quantum Threats](../domains/post-quantum.md).
- Trusted setup depends on the proof system. Groth16 is per-circuit with ceremony requirements; UltraHonk and Halo2 are transparent.
- Issuer key rotation is a liveness risk. Circuits or on-chain registries need to accept the new key without invalidating historical proofs.

## Example

An investor proves OFAC non-sanctioned status to an issuance contract using a [ZKPassport](https://zkpassport.id/) proof over the passport SOD signature, RSA-4096 with SHA-512 or ECDSA over a Brainpool curve depending on the issuing state. The contract receives public inputs `{country is X, sanctions list non-member, issuer key fingerprint}` and accepts. No passport data, name, or date of birth is revealed.

## See also

- [zk-TLS](pattern-zk-tls.md): transcript proofs for web2 data that is not pre-signed out-of-band.
- [Verifiable Attestation](pattern-verifiable-attestation.md): on-chain issuer signatures that a ZK wrapper can shrink to a selective-disclosure proof.
- [ZK-KYC / ML + ONCHAINID](pattern-zk-kyc-ml-id-erc734-735.md), [vOPRF Nullifiers](pattern-voprf-nullifiers.md), [Selective Disclosure](pattern-regulatory-disclosure-keys-proofs.md).
- Implementations: [ZKPassport](https://zkpassport.id/) (Noir, UltraHonk), [Self](https://self.xyz/), [Anon Aadhaar](https://github.com/anon-aadhaar) (Circom, Groth16), [zkEmail](https://prove.email/) (Circom, Noir, SP1), [OpenAC](https://eprint.iacr.org/2026/251) (transparent, no trusted setup), [zk-creds (Rosenberg et al. 2023)](https://eprint.iacr.org/2022/878).
