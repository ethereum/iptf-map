---
title: "Pattern: White-Label Infrastructure Deployment"
status: draft
maturity: pilot
layer: hybrid
privacy_goal: Enable institutions to operate branded privacy infrastructure without building from scratch
assumptions: Vendor relationship for base technology, dedicated operational team, Ethereum mainnet connectivity
last_reviewed: 2026-01-16
works-best-when:
  - Institution needs production-grade privacy infrastructure quickly
  - Regulatory requirements demand dedicated/isolated infrastructure
  - Brand identity or customer trust requires institution-operated systems
avoid-when:
  - Shared infrastructure (public L2, existing network) meets requirements
  - Institution lacks operational capacity for infrastructure management
  - Cost sensitivity prohibits dedicated deployment overhead
dependencies: [Privacy L2 technology, Node infrastructure, Key management, Monitoring stack]
---

## Intent

Enable institutions to deploy and operate dedicated privacy infrastructure—such as privacy-focused L2 networks, confidential computing clusters, or private transaction relays—based on vendor-provided technology but under institution control. This provides production-ready privacy capabilities without the multi-year investment of building from scratch, while maintaining operational sovereignty and brand identity.

## Ingredients

- **Base Technology Layer**:
  - Privacy L2 stack (e.g., Aztec, Polygon Miden, or ZK rollup framework)
  - Confidential computing infrastructure (TEE clusters, FHE nodes)
  - Private transaction relay or sequencer software

- **Infrastructure Components**:
  - Dedicated validator/sequencer nodes (cloud or on-premise)
  - Data availability layer (shared or dedicated)
  - Bridge contracts to Ethereum mainnet
  - RPC endpoints and API gateway

- **Operational Stack**:
  - Monitoring and alerting (Prometheus, Grafana, PagerDuty)
  - Key management (HSM, MPC, or TEE-based)
  - Deployment automation (Terraform, Kubernetes, Ansible)
  - Incident response runbooks

- **Governance Framework**:
  - Upgrade authorization process
  - Parameter change controls
  - Emergency response procedures
  - Vendor coordination protocols

## Governance Models

### Model A: Vendor-Managed Upgrades

| Aspect | Description |
|--------|-------------|
| **Control** | Vendor proposes and executes upgrades on schedule |
| **Institution Role** | Review, test in staging, approve deployment window |
| **Pros** | Lower operational burden, vendor expertise |
| **Cons** | Less control, dependency on vendor timeline |
| **Best For** | Institutions prioritizing time-to-market over control |

### Model B: Institution-Controlled Upgrades

| Aspect | Description |
|--------|-------------|
| **Control** | Institution decides when/whether to apply vendor releases |
| **Institution Role** | Full upgrade lifecycle ownership |
| **Pros** | Maximum control, custom testing cycles |
| **Cons** | Higher operational burden, may lag security patches |
| **Best For** | Regulated institutions requiring change control |

### Model C: Consortium Governance

| Aspect | Description |
|--------|-------------|
| **Control** | Multiple institutions jointly govern shared infrastructure |
| **Institution Role** | Voting member on upgrade decisions |
| **Pros** | Shared costs, collective security review |
| **Cons** | Slower decision-making, consensus required |
| **Best For** | Industry utilities, shared market infrastructure |

## Protocol (concise)

1. **Select**: Evaluate vendor technology stack against requirements; negotiate licensing and support terms.
2. **Design**: Define deployment architecture (cloud/on-prem), governance model, and operational responsibilities.
3. **Deploy**: Provision infrastructure; deploy base technology; configure monitoring and alerting.
4. **Integrate**: Connect to Ethereum mainnet via bridge; integrate with institution systems (custody, compliance).
5. **Brand**: Apply institution branding to user-facing components; configure custom domains and certificates.
6. **Operate**: Run production workloads; manage incidents; coordinate with vendor on issues.
7. **Upgrade**: Apply vendor releases per governance model; maintain staging environment for testing.
8. **Evolve**: Periodically reassess build-vs-buy; consider migration paths as technology matures.

## Upgrade Paths

### Within Vendor Stack

| Upgrade Type | Process | Risk Level |
|--------------|---------|------------|
| **Patch** | Apply directly after staging test | Low |
| **Minor** | Test migration in staging; schedule maintenance window | Medium |
| **Major** | Full regression testing; user communication; possible data migration | High |

### Technology Migration

When underlying technology becomes obsolete or better alternatives emerge:

1. **Dual-Run Period**: Operate old and new systems in parallel
2. **State Migration**: Export/import user balances and contract state
3. **Bridge Transition**: Redirect bridge contracts to new system
4. **Sunset**: Decommission old infrastructure after migration complete

### Exit Strategies

| Scenario | Approach |
|----------|----------|
| **Vendor discontinues product** | Negotiate source code escrow; plan migration |
| **Better technology emerges** | Evaluate migration cost vs. benefit |
| **Regulatory change** | Assess compliance gap; remediate or migrate |
| **Institution strategy shift** | Graceful wind-down with user notification |

## Guarantees

- **Operational Sovereignty**: Institution controls deployment, data, and user relationships
- **Technology Access**: Production-ready privacy infrastructure without R&D investment
- **Upgrade Control**: Governance model determines change velocity and risk tolerance
- **Exit Options**: State migration paths preserve user assets if technology changes

## Trade-offs

- **Cost vs. Control**: Dedicated infrastructure has higher TCO than shared networks; offset by sovereignty
- **Vendor Lock-In**: Deep integration creates switching costs; mitigate with escrow and migration planning
- **Operational Burden**: Requires skilled team for 24/7 operations; consider managed services tier
- **Feature Lag**: Custom deployments may not receive latest features immediately; negotiate roadmap visibility
- **Ecosystem Effects**: Dedicated network has less liquidity and fewer users than public alternatives

## Failure Modes

| Failure | Impact | Mitigation |
|---------|--------|------------|
| **Vendor bankruptcy** | No updates, potential orphaned tech | Source escrow, multi-vendor strategy |
| **Key personnel departure** | Knowledge loss, operational risk | Documentation, cross-training, vendor support |
| **Security vulnerability** | System compromise | Rapid patching process, security monitoring |
| **Regulatory prohibition** | Forced shutdown | Geographic redundancy, compliance monitoring |
| **Bridge exploit** | Asset loss | Insurance, bridge security audits, rate limits |

## Example

**Bank X Private Settlement Network**

1. Bank X licenses privacy L2 technology from Vendor Y for internal settlement.
2. Infrastructure deployed in Bank X's cloud tenancy with dedicated sequencer.
3. Bridge contract deployed to Ethereum mainnet; Bank X controls admin keys.
4. Internal trading desks onboarded to private settlement network.
5. Quarterly upgrade cycle: Vendor Y provides releases; Bank X tests and deploys.
6. After 2 years, Bank X evaluates migration to next-gen technology; dual-run period begins.

## See also

- [Modular Privacy Stack](pattern-modular-privacy-stack.md) - Composable privacy layer architecture
- [TEE-Based Privacy](pattern-tee-based-privacy.md) - Confidential computing infrastructure option
- [Privacy L2s](pattern-privacy-l2s.md) - L2 technologies suitable for white-label deployment
- [Hybrid Public-Private Modes](pattern-hybrid-public-private-modes.md) - Mode switching for compliance
