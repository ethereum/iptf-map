---
title: "Vendor: State Labs"
status: draft
---

# State Labs – Privacy-Preserving Infrastructure

State Labs develops regulated privacy-preserving infrastructure for institutional payments (Tx-Shield), private AI collaboration (OpenTMP LLM), and MPC-TSS key management (Collab-Key). 
State Labs’ three core solutions — **Tx-Shield**, **OpenTMP LLM**, and **Collab-Key** — address compliance, compute, and custody privacy challenges faced by regulated institutions.

---

## What it is
State Labs builds modular privacy layers/solutions for institutional finance and AI systems:
- **Tx Shield** — a regulated private payment layer/solution built on MPC-based encryption and threshold key control.  
It enables confidential settlement for stablecoins, RWAs, and bonds while ensuring regulator-auditable transparency.  
Transactions are visible only to stakeholders, while regulators can access details through granted audit keys.

- **OpenTMP LLM** — is a distributed edge AI training and inference framework designed for privacy-preserving large-language model collaboration. It combines federated learning and multi-party computation (MPC-FL) to keep data local while enabling encrypted aggregation and joint model updates. It powers collaborative, effcient, secure, and governable AI training across distributed environments.

- **Collab-Key** — is a high-performance MPC-TSS framework supporting both two-party and multi-party ECDSA signing.  
It ensures that no single participant ever reconstructs a full private key, providing cryptographic resilience and institutional-grade security.  
The system integrates seamlessly with existing KMS and client applications for fast, production-grade signing.

Each module can operate independently or as part of a unified privacy-preserving stack across payments, compute, and custody.

---

## Fits with patterns (names only)

Tx-Shield:
- Private Payments  
- Regulated Settlement  
- Compliance Infrastructure  


OpenTMP LLM:
- Federated Learning  
- Collaborative AI  
- Secure Inference  


Collab-Key:
- Custody / Key Management  
- Threshold Signatures  
- Distributed Signing Infrastructure  

---

## Not a substitute for

Tx-Shield:
- Non-compliant on-chain transfer systems  
- Centralized custodial payment rails  


OpenTMP LLM:
- Centralized AI model training pipelines  
- Non-encrypted data-sharing frameworks  


Collab-Key:
- Single-key custodial wallets  
- Hardware-based key storage only 

---

## Architecture
### Tx-Shield
Implements a high performance MPC-based private payment layer with threshold key control and an audit-key protocol for regulator visibility.  
Only sender, receiver i.e. stakers, and authorized regulators can access encrypted transaction details.  
Optimized MPC execution enables high performance (~10k TPS).

### OpenTMP LLM
Distributed AI architecture using federated learning and multi-party computation （MPC-FL) with threshold-secure aggregation.  
Supports edge acceleration, model distillation, quantization, and joint model governance.  

### Collab-Key
MPC-TSS signing system supporting both 2PC and multi-party ECDSA protocols.  
Ensures that private keys are never reconstructed in full.  
Integrates seamlessly with institutional KMS systems and APIs.

---

## Privacy domains (if applicable)
- Private Payments / Compliance Infrastructure  
- Collaborative AI / Federated Learning Privacy  
- Custody / Key Management  

---

## Enterprise demand and use cases
Tx-Shield:
- Institutional settlement for stablecoins, tokenized RWAs, and bonds on-chain.  
- Ideal for financial institutions needing confidentiality and compliance together.

OpenTMP LLM: 
- Privacy-preserving AI model training and inferences for enterprises and regulated sectors, such as healthcare, finance, and government. 

Collab-Key:
Institutional wallets, custodians, and enterprise-grade signing infrastructure needing fault-tolerant and secure key management.  

---

## Technical details
Tx-Shield:
- MPC-based encryption, threshold key control (TSS), high-throughput multi-party computation.

OpenTMP LLM: 
- MPC-FL, Distributed Learning, Edge AI Acceleration, SFT, RLHF.  

Collab-Key:
- MPC-TSS (ECDSA 2PC / multi-party), Threshold Signatures, Secure Key Generation.   

---

## Strengths
Tx-Shield:
- Combines institutional privacy and regulatory compliance  
- High performance (~10k TPS)  
- Fine-grained regulator audit access through cryptographic keys  

OpenTMP LLM: 
- Keeps data local during training and inference  
- Enables joint model ownership and governance  
- High efficiency through edge AI optimization  

Collab-Key:
- Eliminates single-party key reconstruction  
- Integrates seamlessly with KMS and signing APIs  
- Backed by peer-reviewed research from *USENIX Security 2025*  
1. *Improved Secure Two-party Computation from a Geometric Perspective* (USENIX Security 2025)
2. *Achilles: A Formal Framework of Leaking Secrets from Signature Schemes via Rowhammer* (USENIX Security 2025, Honorable Mentions)

---

## Risks and open questions
Tx-Shield:
- Governance over regulator audit keys  
- Integration complexity across different blockchain environments  

OpenTMP LLM:
- Coordination complexity in multi-party settings  
- Trade-offs between model performance and full encryption overhead 

Collab-Key:
- Performance scaling with increased party count  
- Implementation complexity across heterogeneous custody systems  

---

## Links
Website: [https://statelabs.ai](https://statelabs.ai)  
Contact: [joezyx@statelabs.ai](mailto:joezyx@statelabs.ai) | [kyle@statelabs.ai](mailto:kyle@statelabs.ai)  | [haiyangxue@smu.edu.sg](mailto:haiyangxue@smu.edu.sg)
Papers:  
- [USENIX Security 2025 – Guo et al.](https://www.usenix.org/system/files/usenixsecurity25-guo-hao-improved.pdf)  
- [USENIX Security 2025 – Liang et al.](https://www.usenix.org/system/files/usenixsecurity25-liang-achilles.pdf)
