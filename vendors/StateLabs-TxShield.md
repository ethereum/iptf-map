---
title: "Vendor: Tx Shield"
status: draft
---

# State Labs – Tx-Shield (Private Payments)

## What it is
Tx Shield is a regulated private payment layer/solution built on MPC-based encryption and threshold key control.  
It enables confidential settlement for stablecoins, RWAs, and bonds while ensuring regulator-auditable transparency.  
Transactions are visible only to stakeholders, while regulators can access details through granted audit keys.

## Fits with patterns (names only)
- Private Payments  
- Regulated Settlement  
- Compliance Infrastructure  

## Not a substitute for
- Non-compliant on-chain transfer systems  
- Centralized custodial payment rails  

## Architecture
High-performance MPC execution layer implementing an audit-key protocol for regulator access.  
Only sender, receiver, and authorized regulators can view encrypted transaction details.  
Optimized MPC execution achieves ~10k TPS throughput.

## Privacy domains (if applicable)
Private Payments / Compliance Infrastructure  

## Enterprise demand and use cases
Institutional settlement for stablecoins, tokenized RWAs, and bonds on-chain.  
Ideal for financial institutions needing confidentiality and compliance together.

## Technical details
MPC-based encryption, threshold key control (TSS), high-throughput multi-party computation.

## Strengths
- Combines institutional privacy and regulatory compliance  
- High performance (~10k TPS)  
- Fine-grained regulator audit access through cryptographic keys  

## Risks and open questions
- Governance over regulator audit keys  
- Integration complexity across different blockchain environments  

## Links
Website: [https://statelabs.ai](https://statelabs.ai)  
Contact: [joezyx@statelabs.ai](mailto:joezyx@statelabs.ai) | [kyle@statelabs.ai](mailto:kyle@statelabs.ai)
