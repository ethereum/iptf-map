# Approach: White-Label Infrastructure Deployment

**Related Pattern:** [Modular Privacy Stack](../patterns/pattern-modular-privacy-stack.md)

**High-level goal:** Enable institutions to deploy and operate dedicated privacy infrastructure under their own control and branding, using vendor-provided technology rather than building from scratch.

## Overview

### Problem Interaction

White-label deployment addresses three interconnected institutional challenges:

1. **Time-to-Market**: Building privacy infrastructure from scratch requires years of R&D; licensing vendor technology provides production-ready capabilities
2. **Operational Sovereignty**: Regulatory requirements or customer trust may demand dedicated, institution-operated infrastructure rather than shared public networks
3. **Vendor Dependency**: Deep technology integration creates switching costs and continuity risks that must be managed through governance and exit planning

These problems interact because institutions need sophisticated privacy technology quickly, but taking on vendor dependencies introduces operational and strategic risks. The solution requires governance frameworks that balance speed-to-market against long-term flexibility.

### Key Constraints

- Vendor relationship required for base technology licensing and support
- Dedicated operational team for 24/7 infrastructure management
- Ethereum mainnet connectivity for settlement and bridging
- Compliance with institutional change management requirements

### TLDR for Different Personas

- **Business:** Get production-grade privacy infrastructure without multi-year R&D, while maintaining brand identity and customer relationships
- **Technical:** Deploy [Modular Privacy Stack](../patterns/pattern-modular-privacy-stack.md) layers using vendor technology; select governance model for upgrades
- **Legal:** Negotiate licensing, source escrow, and exit rights; ensure regulatory compliance for dedicated infrastructure

## Architecture and Design Choices

### Foundation: Modular Privacy Stack

White-label deployments should implement the [Modular Privacy Stack](../patterns/pattern-modular-privacy-stack.md) architecture, selecting vendor components for each layer:

| Layer | Role | Vendor Options |
|-------|------|----------------|
| **Data** | Encrypted storage, DA | Off-chain stores, EigenDA, Celestia |
| **Execution** | Private computation | [Aztec](../vendors/aztec.md), [Miden](../vendors/miden.md), [Fhenix](../vendors/fhenix.md), TEE clusters |
| **Settlement** | Finality, atomicity | Ethereum L1, L2 rollups |
| **Disclosure** | Regulatory access | View keys, ZK proofs, [EAS attestations](../patterns/pattern-regulatory-disclosure-keys-proofs.md) |

This modular approach enables:
- Independent upgrades per layer without full system migration
- Swap vendors for specific layers as technology evolves
- Mix institution-operated and vendor-managed components

### Related Patterns

The following patterns from the Modular Privacy Stack provide building blocks:

- **Data Layer:** [L2 Encrypted Off-chain Audit](../patterns/pattern-l2-encrypted-offchain-audit.md)
- **Execution Layer:** [TEE-Based Privacy](../patterns/pattern-tee-based-privacy.md), [Privacy L2s](../patterns/pattern-privacy-l2s.md)
- **Settlement Layer:** [Atomic DvP via ERC-7573](../patterns/pattern-dvp-erc7573.md)
- **Disclosure Layer:** [Selective Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md)
- **Cross-cutting:** [Hybrid Public-Private Modes](../patterns/pattern-hybrid-public-private-modes.md)

### Governance Models

| Model | Control | Best For |
|-------|---------|----------|
| **Vendor-Managed** | Vendor proposes/executes upgrades; institution approves window | Time-to-market priority |
| **Institution-Controlled** | Institution owns full upgrade lifecycle | Regulated change control |
| **Consortium** | Multiple institutions jointly govern | Shared market infrastructure |

### Infrastructure Components

- **Compute:** Dedicated validator/sequencer nodes (cloud or on-premise)
- **Data:** DA layer (shared or dedicated)
- **Connectivity:** Bridge contracts to Ethereum mainnet, RPC endpoints
- **Operations:** Monitoring (Prometheus/Grafana), key management (HSM/MPC), deployment automation

## More Details

### Upgrade Paths

**Within vendor stack:**
- Patch: Apply after staging test (low risk)
- Minor: Schedule maintenance window (medium risk)
- Major: Full regression, user communication, possible data migration (high risk)

**Technology migration (when underlying tech becomes obsolete):**
1. Dual-run period with old and new systems
2. State migration (export/import balances and contract state)
3. Bridge transition to new system
4. Sunset old infrastructure

### Exit Strategies

| Scenario | Approach |
|----------|----------|
| Vendor discontinues product | Source code escrow; plan migration |
| Better technology emerges | Evaluate migration cost vs. benefit |
| Regulatory change | Assess compliance gap; remediate or migrate |
| Strategy shift | Graceful wind-down with user notification |

### Trade-offs

- **Cost vs. Control:** Dedicated infrastructure has higher TCO than shared networks
- **Vendor Lock-In:** Mitigate with escrow and migration planning per Modular Privacy Stack layer boundaries
- **Operational Burden:** Consider managed services tier for non-critical layers
- **Ecosystem Effects:** Dedicated network has less liquidity than public alternatives

### Failure Modes

| Failure | Mitigation |
|---------|------------|
| Vendor bankruptcy | Source escrow, multi-vendor strategy across layers |
| Key personnel departure | Documentation, cross-training, vendor support |
| Security vulnerability | Rapid patching process, per-layer isolation |
| Bridge exploit | Insurance, security audits, rate limits |

## Example

**Bank X Private Settlement Network**

1. Bank X licenses [Aztec](../vendors/aztec.md) technology for Execution layer
2. Deploys [Modular Privacy Stack](../patterns/pattern-modular-privacy-stack.md): off-chain encrypted Data, Aztec Execution, Ethereum L1 Settlement, view-key Disclosure
3. Infrastructure in Bank X's cloud tenancy with dedicated sequencer
4. Bridge contract deployed to mainnet; Bank X controls admin keys
5. Quarterly upgrade cycle per Institution-Controlled governance model
6. Layer independence allows future migration of Execution layer to [Miden](../vendors/miden.md) without touching other layers

## Links and Notes

- [Modular Privacy Stack](../patterns/pattern-modular-privacy-stack.md) - Foundation architecture
- [TEE-Based Privacy](../patterns/pattern-tee-based-privacy.md) - Execution layer option
- [Privacy L2s](../patterns/pattern-privacy-l2s.md) - L2 technologies for deployment
- [Hybrid Public-Private Modes](../patterns/pattern-hybrid-public-private-modes.md) - Mode switching for compliance
- [Aztec](../vendors/aztec.md), [Miden](../vendors/miden.md), [Fhenix](../vendors/fhenix.md) - Execution layer vendors
