---
title: "Vendor: Nethermind"
status: ready
---

# Nethermind - Privacy Engineering and Compliant Infrastructure for Institutional Ethereum

## What it is

Nethermind is an Ethereum core engineering company behind one of the network's leading execution clients (~30% of validators). Its privacy practice builds shielded pools with compliance proofs, ZK verifiers for confidential tokens, compliant private-token solutions on EVM chains, and compliance-aware transaction inclusion for institutions.

Nethermind is an engineering firm rather than a single protocol: institutions engage it to design, build, and audit confidential systems on open frameworks, from the execution layer up to the application layer.

## Fits with patterns

- [Shielding](../patterns/pattern-shielding.md)
- [Selective Disclosure (Viewing Keys + Zero-Knowledge Proofs)](../patterns/pattern-regulatory-disclosure-keys-proofs.md)
- [ZK Proof Systems](../patterns/pattern-zk-proof-systems.md)
- [Private Stablecoin Shielded Payments](../patterns/pattern-private-stablecoin-shielded-payments.md)

## Not a substitute for

- Privacy L2 or app-chain (Nethermind integrates and evaluates these rather than operating one)
- Custody platform or wallet infrastructure

## Architecture

Nethermind's privacy work spans four layers of the stack:

- **Base layer.** The Nethermind execution client runs around 30% of Ethereum validators; privacy and compliance work builds on operating this infrastructure in production.
- **Application layer.** Shielded-pool implementations for ERC-20 transfers: note commitments, Merkle membership proofs, and nullifiers, extended with compliance mechanisms (ZK-proved KYC-gated access, association sets, viewing keys for auditors). Reference build documented publicly; Stellar variant open-sourced (Circom circuits, Groth16).
- **Verifier engineering.** Implemented the UltraHonk verifier behind Stellar's Confidential Tokens developer preview (Noir proofs verified on-chain; hidden balances and amounts with auditor view keys and selective disclosure). The same verifier and circuit expertise applies to EVM deployments.
- **Compliant infrastructure.** With UBS, completed two proofs of concept on public Ethereum (announced June 2026): an Ethereum node configurable with institution-specific compliance and risk rules (allowlists, contract-interaction blocking), and a component routing approved transaction bundles through relays directly to selected builders for reliable inclusion - no protocol changes required.
- **Compliant private tokens on EVM.** Solutions for compliant private transfers built on open-source EVM privacy frameworks: compliant-token integrations including an ERC-3643 (T-REX) example, and nullifier/ZK design for privacy-preserving UTXO tokens.

## Enterprise demand and use cases

- UBS: joint compliance proofs of concept on public Ethereum completed and publicly announced (June 2026); continued collaboration on node operation and compliant transaction inclusion.
- Typical engagements: banks and custodians tokenizing assets (gold, deposits, funds) who need market-facing confidentiality plus bank-internal need-to-know controls; buyer profile is a Head of Digital Assets navigating risk, compliance, and technology governance.
- Deutsche Bank and Nethermind have publicly examined ZKPs for privacy, compliance, and solvency applications.

## Technical details

- Proof stacks in production or public PoC: Circom/Groth16 (Stellar private payments PoC), Noir/UltraHonk (Stellar Confidential Tokens verifier), Plonkish system verification.
- Compliance mechanisms implemented or evaluated: ZK-proved KYC-gated pool access, association sets, proof-of-innocence-style exclusion, auditor viewing keys.
- Identity integration: mapping institutional identity systems (OpenID/JWT) and role-based access control onto on-chain key management and custodian-held accounts, so existing bank entitlement rules carry over to on-chain assets.
- Assurance practice: dedicated ZK security audit team (Noir language deep dives, anonymous governance, zk-oracles); formal verification of the ZKsync verifier and CertiPlonk for ZK-circuit verification.
- Cryptography research group: post-quantum signatures for Ethereum, lattice cryptography, zkML.

## Strengths

- Full-stack coverage: the same organization runs core Ethereum infrastructure, builds privacy applications, and audits ZK systems.
- Compliance-first privacy: every privacy build pairs confidentiality with a concrete disclosure/compliance mechanism, matching how regulated institutions deploy.
- Publicly verified institutional delivery (UBS announcement, Stellar developer preview, Bank of England DLT Innovation Challenge participation via the Scottish Centre of Excellence consortium).
- Open-source track record across client, research, and privacy PoCs.

## Risks and open questions

- Engineering company, not a protocol: resulting systems build on open frameworks (Noir, Circom, open-source EVM privacy layers) rather than a proprietary Nethermind network.
- Parts of the institutional compliance-middleware productization are not yet publicly announced; scope and packaging still forming.
- Compliant transaction-inclusion work is early (PoC stage, tested on testnets; no live transactions yet).

## Links

- Nethermind: <https://www.nethermind.io/>
- Institutional privacy series (part 1): <https://www.nethermind.io/blog/institutional-privacy-on-public-blockchains-technical-foundations-challenges-and-the-path-to-adoption>
- UBS x Nethermind compliance PoCs (June 2026): <https://www.ubs.com/global/en/media/display-page-ndp/en-20260623-nethermind.html>
- Stellar Confidential Tokens developer preview: <https://stellar.org/blog/developers/developer-preview-confidential-tokens-on-stellar>
- Stellar private payments PoC (open source): <https://github.com/NethermindEth/stellar-private-payments>
- ZK audits and security: <https://www.nethermind.io/zk-audits-and-zero-knowledge-security>
- Nethermind Research: <https://www.nethermind.io/nethermind-research>
