---
title: "Vendor: Collab-Key"
status: draft
---

# State Labs – Collab-Key (MPC-TSS Key Management)

## What it is
Collab-Key is a high-performance MPC-TSS framework supporting both two-party and multi-party ECDSA signing.  
It ensures that no single participant ever reconstructs a full private key, providing cryptographic resilience and institutional-grade security.  
The system integrates seamlessly with existing KMS and client applications for fast, production-grade signing.

## Fits with patterns (names only)
- Custody / Key Management  
- Threshold Signatures  
- Distributed Signing Infrastructure  

## Not a substitute for
- Single-key custodial wallets  
- Hardware-based key storage only  

## Architecture
Keys are generated and used collaboratively via secure computation and threshold signatures (MPC-TSS).  
Supports 2PC and multi-party ECDSA protocols, ensuring private keys are never reconstructed in full.  

## Privacy domains (if applicable)
Custody / Key Management  

## Enterprise demand and use cases
Institutional wallets, custodians, and enterprise-grade signing infrastructure needing fault-tolerant and secure key management.  

## Technical details
MPC-TSS (ECDSA 2PC / multi-party), Threshold Signatures, Secure Key Generation.  

## Strengths
- Eliminates single-party key reconstruction  
- Integrates seamlessly with KMS and signing APIs  
- Backed by peer-reviewed research from *USENIX Security 2025*  
1. *Improved Secure Two-party Computation from a Geometric Perspective* (USENIX Security 2025)
2. *Achilles: A Formal Framework of Leaking Secrets from Signature Schemes via Rowhammer* (USENIX Security 2025, Honorable Mentions)

## Risks and open questions
- Performance scaling with increased party count  
- Implementation complexity across heterogeneous custody systems  

## Links
Website: [https://statelabs.ai](https://statelabs.ai) | [https://www.usenix.org/system/files/usenixsecurity25-guo-hao-improved.pdf] | [https://www.usenix.org/system/files/usenixsecurity25-liang-achilles.pdf]
Contact: [joezyx@statelabs.ai](mailto:joezyx@statelabs.ai) | [kyle@statelabs.ai](mailto:kyle@statelabs.ai) | [haiyangxue@smu.edu.sg](mailto:haiyangxue@smu.edu.sg)

