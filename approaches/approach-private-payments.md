# Approach: Private Payments

**Use Case Links:** [Private Stablecoins](../use-cases/private-stablecoins.md), [Resilient Disbursement Rails](../use-cases/resilient-disbursement-rails.md)

**High-level goal:** Enable confidential payment transfers using stablecoins and other digital assets while hiding amounts, counterparties, and transaction patterns, with selective regulatory disclosure capabilities. Extends to humanitarian disbursement under adversarial-jurisdiction threat models.

## Overview

### Problem Interaction

Private payment systems address five interconnected challenges:

1. **Operational Privacy**: Treasury operations, payment flows, and settlement patterns reveal competitive intelligence when visible on-chain
2. **Security vs Cost Trade-offs**: L1 provides maximum security but higher costs, while L2s offer efficiency but different trust assumptions
3. **Regulatory Compliance**: Financial institutions require auditability and selective disclosure capabilities across varying jurisdictions
4. **User Onboarding**: Institutions need practical paths to onboard their users (corporates, funds, counterparties) onto private stablecoin infrastructure while integrating with existing fiat rails and compliance workflows
5. **Resilience under adversarial jurisdiction**: Off-ramp unlinkability and forward secrecy when intermediaries may be breached, compelled, or inherited by a hostile successor

The first four assume cooperative counterparties; the fifth does not. When intermediaries become the adversary's pivot, the architecture minimizes what each party holds rather than relying on key-management hygiene.

### Key Constraints

**Universal:**

- Must work with existing stablecoin infrastructure (USDC, EURC, etc.)
- Integration with existing payment rails (SWIFT, ISO20022) and custodial systems
- Selective disclosure must meet varying regulatory requirements across jurisdictions
- Support for high-frequency institutional operations with predictable costs
- Composability with broader DeFi and settlement infrastructure

**Hostile Operating Environment:**

- EAL4+ AVA_VAN.5 smartcard envelope (no client-side ZK proving capability)
- Intermittent or absent internet connectivity at the recipient
- High probability of recipient device loss or seizure
- Organizational separation between identity-layer operator and field-distribution partner
- No central beneficiary list at the funder layer

### TLDR for Different Personas

- **Business:** Execute private treasury operations with regulatory compliance. Humanitarian programs survive partner compromise and recipient device seizure.
- **Technical:** Privacy-preserving payment infrastructure (L1 shielding or privacy L2s with selective disclosure). For adversarial jurisdictions: forward-secure signing, recipient-derived destinations, mesh delivery, and relay-mediated proving over a shielded pool.
- **Legal:** Regulatory compliance through controlled access mechanisms while protecting commercial confidentiality. For humanitarian disbursement, the protocol minimizes data each party holds, so compelled disclosure cannot reveal state the party never had.

## Architecture and Design Choices

### Privacy Approaches by Tier

| Approach | Privacy | Cost | Trust Model | Maturity | Key Deployment |
| --- | --- | --- | --- | --- | --- |
| [L1 Shielded Payments](#a-l1-shielded-payments) | Anonymity (amounts may leak) | High L1 gas | L1 consensus only | Production | Railgun + PPoI |
| [Privacy L2](#b-privacy-l2) | Full (amounts + identities) | L2 fees | L2 sequencer | Production / pilot | Aztec, Fhenix |
| [Stateless Plasma](#c-stateless-plasma) | Full + minimal on-chain | Lowest, operator-amortized | Operator + L1 anchor | PoC | Intmax2 |
| [TEE-Based Privacy](#d-tee-based-privacy) | Full | Variable | Hardware vendor | Pilot | AWS Nitro, Azure CC |
| [MPC-Based Privacy](#e-mpc-based-privacy) | Amount-only (counterparties public) | MPC overhead | Honest majority | PoC | TACEO Merces |
| [Hybrid L1/L2 (Recommended)](#f-hybrid-l1l2-model-recommended) | Full + selective disclosure | Mixed | Multi-layer | Pilot | Aztec + Railgun + ISO 20022 |
| [Resilient Disbursement Rails](#g-resilient-disbursement-rails-adversarial-jurisdiction-recipients) | Full + forward-secure + off-ramp unlinkable | Relay-mediated | Multi-relay + smartcard + IResilientIdentity | Spec draft | Forthcoming PoC |

---

### A. L1 Shielded Payments

**Primary Pattern:** [Shielded ERC-20 Transfers](../patterns/pattern-shielding.md)

Maximum security using Ethereum L1 consensus, with commitment/nullifier schemes (Railgun-style) shielding ERC-20 balances. Provides anonymity (unlinkable addresses) but limited privacy. Transaction amounts and patterns may still leak through metadata. Operator-free at the protocol layer; private transactions depend on a gas relayer to avoid linking the sender's funded address.

**When to use:** Anonymity-focused use cases, high-value transfers, deployments that require maximum settlement security and accept higher gas cost.
**Limitations:** No native amount confidentiality; relayer dependency for private withdrawal; verification gas at ~2.6M per claim at current circuit sizes.

### B. Privacy L2

**Primary Pattern:** [Private L2s](../patterns/pattern-privacy-l2s.md)

Full privacy with hidden state and confidential transfers on a privacy-native rollup (Aztec, Fhenix-FHE). Lower costs and higher throughput for frequent operations. Complete transaction confidentiality including amounts, counterparties, and patterns.

**When to use:** Comprehensive institutional needs requiring amount + counterparty privacy at high frequency.
**Limitations:** Sequencer centralization in current deployments; bridge complexity; viewing-key compromise as a new attack surface.

### C. Stateless Plasma

**Primary Pattern:** [Stateless Plasma Privacy](../patterns/pattern-plasma-stateless-privacy.md)

Client-side proving with minimal on-chain data. Users custody their own transaction data, and chain observers see only commitments (Intmax-style). Best for high-volume flows where on-chain footprint and amortized cost matter.

**When to use:** Institutional clients with infrastructure to manage their own state; minimal L1 footprint required.
**Limitations:** Exit delays; user data custody responsibility; operator liveness dependency for block production and proof aggregation.

### D. TEE-Based Privacy

**Primary Pattern:** [TEE-Based Privacy](../patterns/pattern-tee-based-privacy.md)

Trusted Execution Environment handles sensitive computation privately. Can enable private matching, settlement, or custody operations. Acceptable when the institutional trust model already includes hardware vendors.

**When to use:** Near-term deployment; institutional risk model accepts hardware trust assumptions.
**Limitations:** Hardware trust; vendor dependency; side-channel risks across cloud co-tenants.

### E. MPC-Based Privacy

**Primary Pattern:** [co-SNARKs (Collaborative Proving)](../patterns/pattern-co-snark.md)
**See also:** [TACEO Merces](../vendors/taceo-merces.md)

Multi-party computation nodes jointly process transactions without any single party seeing plaintext, combined with co-SNARKs for on-chain verification of private state transitions.

**When to use:** Amount confidentiality where counterparty relationships are already known (e.g., bilateral settlement between known counterparties).
**Limitations:** No sender/receiver anonymity. Addresses remain public on-chain; honest-majority assumption among proving nodes.

### F. Hybrid L1/L2 Model (Recommended)

**Primary Patterns:** [Private Stablecoin Shielded Payments](../patterns/pattern-private-stablecoin-shielded-payments.md), [Private ISO20022](../patterns/pattern-private-iso20022.md), [Selective Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md)
**Supporting Patterns:** [User-Controlled Viewing Keys](../patterns/pattern-user-controlled-viewing-keys.md), [Verifiable Attestation](../patterns/pattern-verifiable-attestation.md), [Forced Withdrawal](../patterns/pattern-forced-withdrawal.md)

The recommended architecture for institutional treasury and payment operations: tier the privacy stack across L1 and L2 so high-value transfers get L1 settlement guarantees while frequent operations run on a privacy L2.

#### Core Components:

1. **Multi-Tier Payment Infrastructure**
   - L1 Shielding: High-value transfers using shielded pools (Railgun-style commitment/nullifier)
   - Privacy L2: Frequent operations on privacy-native rollups (Aztec, Fhenix)
   - Cross-tier bridges: Secure movement between L1 and L2 privacy domains

2. **Selective Disclosure Layer**
   - [User-controlled viewing keys](../patterns/pattern-user-controlled-viewing-keys.md) for I2U contexts where the user retains key custody
   - Regulator viewing keys for scoped audit access
   - Time-bound, threshold-controlled disclosure mechanisms
   - [Attestation logging](../patterns/pattern-verifiable-attestation.md) for compliance trails (EAS, W3C VC, or ONCHAINID)
   - Encrypted audit logs with selective decryption

3. **Traditional Rail Integration**
   - ISO20022 message interpreters for SWIFT compatibility
   - Privacy-preserving bridges to traditional payment systems
   - Encrypted metadata for regulatory reporting

4. **Multi-Asset Support**
   - Support for multiple stablecoins (USDC, EURC, etc.)
   - Cross-currency private transfers and conversions
   - Integration with existing stablecoin compliance frameworks

### G. Resilient Disbursement Rails (Adversarial-Jurisdiction Recipients)

**Use Case:** [Resilient Disbursement Rails](../use-cases/resilient-disbursement-rails.md)
**Primary Patterns:** [Forward-Secure Signatures](../patterns/pattern-forward-secure-signatures.md), [Recipient-Derived Receive Addresses](../patterns/pattern-recipient-derived-receive-addresses.md), [Relay-Mediated Proving](../patterns/pattern-relay-mediated-proving.md), [Mesh Store-and-Forward Submission](../patterns/pattern-mesh-store-forward-submission.md)
**Supporting Patterns:** [Shielding](../patterns/pattern-shielding.md), [Private MTP Auth](../patterns/pattern-private-mtp-auth.md), [Network Anonymity](../patterns/pattern-network-anonymity.md), [Proof of Innocence](../patterns/pattern-proof-of-innocence.md), [Forced Withdrawal](../patterns/pattern-forced-withdrawal.md), [Verifiable Attestation](../patterns/pattern-verifiable-attestation.md)
**Identity Layer Dependency:** [Approach: Private Identity, Section F](approach-private-identity.md#f-issuer-independent-enrollment-via-distributed-oprf) (`IResilientIdentity` interface)

Adversarial-jurisdiction model: a humanitarian funder disburses to recipients whose envelope is a tamper-resistant smartcard with no client-side ZK, intermittent internet, and high seizure probability; every party in the path may be breached, compelled, or inherited by a hostile successor. Off-ramp unlinkability is the primary cryptographic requirement.

The composition: forward-secure signing on the smartcard so per-epoch keys cannot be recovered from a seized card; on-card recipient-derived destinations (no published view-key step); relay-mediated proving with submitter-bound public input that defeats proof-stealing front-running; mesh store-and-forward from offline companion devices to relays.

Settlement orchestrates over shielded pools: the funder atomically shields the round total under a multisig-signed header; the claim contract unshields per-recipient under a single-use nullifier. Cohort attestation uses ECDSA-pubkey leaves so the smartcard signs ECDSA only; in-circuit Poseidon hashing happens at the relay. Relay submissions go through Tor or Nym with rotating EOAs funded via shielded unshield.

**Trust separations.** `IResilientIdentity` operator and implementing partner must be distinct legal entities, jurisdictions, and personnel; co-located deployments collapse coverage. Relay-set floors: pilot N≥8 / ≥2 operators / ≥2 jurisdictions; production N≥16 / ≥4 operators / ≥3 jurisdictions.

**When to use:** Programs where compelled-partner transfer, successor-regime inheritance, or off-ramp KYC pivots are documented threats.
**Deployment:** PoC forthcoming. Production dependencies: Tor, Briar, Meshtastic, EAL4+ secure elements, Noir + UltraHonk. Research-grade: forward-secure smartcard applet, mesh-to-Ethereum relay software, ECDSA-in-SNARK verifier.
**Limitations:** Relay economic recovery model unresolved; long-lived per-card secret exposes past and future destinations on card seizure; on-card destination derivation has no view-key audit channel; within-epoch per-relay linkability bounded but not cryptographically eliminated.

---

### PoC Validation

Two approaches were implemented as proof-of-concept: an L1 shielded pool (UTXO model with Noir/[UltraHonk](https://github.com/AztecProtocol/barretenberg)) and a Plasma/Intmax2 stateless rollup ([Plonky2](https://github.com/0xPolygonZero/plonky2)). Both use dual-key architecture (spending + viewing) and attestation-gated entry via zero-knowledge proof of KYC. These cover Sections A and C above; B / D / E / F have separate deployment evidence; G is at spec stage with PoC forthcoming.

> **Note:** Benchmarks below are indicative measurements from PoC testing, not production reference numbers. Implementers should run their own benchmarks with domain-specific configuration.

**Reference Implementation:** [Private Payment PoC](https://github.com/ethereum/iptf-pocs/tree/master/pocs/private-payment)

#### Comparison

| Dimension | Shielded Pool (L1) | Plasma/Intmax2 (L2) |
|---|---|---|
| **Proving system** | UltraHonk | Plonky2 |
| **Trusted setup** | No  | No |
| **Gas: deposit** | ~155K | ~137K (user) |
| **Gas: transfer** | ~181K + ~2.6M verification | Off-chain (configurable fee by operator) |
| **Gas: withdraw** | ~47K + ~2.6M verification | ~343k (operator, amortized across senders) |
| **Gas: batch** | N/A | ~255K (operator, amortized across senders) |
| **Proof gen (client)** | 410-991ms | 5.9-9.8s (user) |
| **Proof gen (operator)** | N/A | 42-49s |
| **Operator required** | No | Yes |

#### Cross-Cutting Findings

- **Dual-key architecture** (spending + viewing) works in both models, confirming selective disclosure is practical without granting transfer authority
- **Attestation-gated entry** via zero-knowledge proof of Merkle tree inclusion is feasible (MAX_ATTESTATION_TREE_DEPTH=20, supporting ~1M participants, configurable for larger participants, but increases proving time)
- **Network timing correlation** is unmitigated in both approaches; see [Network-Level Anonymity](../patterns/pattern-network-anonymity.md) for mitigation patterns
- **Withdrawal to fresh addresses** requires a gas relayer since the recipient address may not have ETH for gas. Users can always withdraw directly (sacrificing privacy), but private withdrawal depends on relayer liveness and willingness to relay
- **Multi-token transfers** require same-token constraints in circuits, confirming per-token shielded pools and liquidity fragmentation concerns
- **Forced withdrawal fallback**: when relayers are unavailable or censoring, users need a way to bypass them and withdraw via an L1 escape hatch contract directly. See [Forced Withdrawal](../patterns/pattern-forced-withdrawal.md); privacy is weaker during forced exit (timing and destination address visible on-chain) but funds stay recoverable
- **PlasmaBlind** (folding-scheme-based stateless plasma) is an emerging alternative to Plonky2 recursive proofs; see [PSE research](https://pse.dev/mastermap/ptr)

### Vendor Recommendations

**Primary Infrastructure:**

- **L1 Shielding:** [Railgun](../vendors/railgun.md) for mature UTXO-style privacy pools
- **Privacy L2:** [Aztec Network](../vendors/aztec.md) for native confidential transfers, [Fhenix](../vendors/fhenix.md) for FHE-based payments
- **Stateless Plasma:** [Intmax](https://www.intmax.io/) for client-side proving with minimal on-chain footprint
- **Traditional Integration:** SWIFT network adapters, ISO20022 processors

**Alternative Approaches:**

- **FHE Approach:** [Zama](../vendors/zama.md) fhEVM for homomorphic stablecoin operations
- **TEE Approach:** AWS Nitro Enclaves, Azure Confidential Computing for issuer-side privacy
- **MPC + ZK Approach:** [TACEO Merces](../vendors/taceo-merces.md) uses MPC + ZK for private stablecoin transfers, counterparty relationship is public
- **HE + ZK + IBE Approach:** [Fairblock](../vendors/fairblock.md) connects EVM escrowed assets to an encrypted layer and ZK-verified confidential transfers, with scoped selective disclosure for audits and compliance.

**Adversarial-Jurisdiction (Section G):**

- **Transport:** [Briar](https://briarproject.org/) (Bluetooth LE + Tor), [Meshtastic](https://meshtastic.org/) (LoRa), [Tor](https://www.torproject.org/), [Nym](https://nymtech.net/)
- **Smartcards:** Keycard-class EAL4+ AVA_VAN.5 secure elements (IDEMIA, Infineon, NXP, G+D)
- **Relay proving:** [Noir](https://noir-lang.org/) + [Barretenberg UltraHonk](https://github.com/AztecProtocol/barretenberg) for ECDSA-in-SNARK

### Implementation Strategy

**Phase 1: Core Payment Privacy**

- Deploy chosen privacy infrastructure (L1 shielding or privacy L2)
- Integrate major stablecoins (USDC, EURC)
- Basic selective disclosure mechanisms

**Phase 2: Regulatory & Compliance**

- Viewing key management infrastructure
- SWIFT/ISO20022 message integration
- Multi-jurisdiction compliance features

**Phase 3: Ecosystem Integration**

- Cross-tier bridging (L1 ↔ L2)
- Multi-currency private conversions
- Integration with broader settlement infrastructure
- Institutional custody and risk management system integration

**Phase 4: Adversarial-Jurisdiction Disbursement**

- Smartcard applet (forward-secure hash chain, transactional erase), mesh-to-Ethereum relay software with submitter-bound proof generation, and round-factory contract performing atomic shield
- Deployment-gate audits across applet, circuit, verifier, and claim contract; attestation of organizational separation between identity-layer operator and field-distribution partner; relay-set roster meeting size and jurisdictional-diversity floors

## More Details

### Trade-offs

**L1 Shielding vs L2 Privacy:**

- **L1 Shielding:** Maximum security, anonymity focus, established infrastructure, higher costs
- **L2 Privacy:** Complete privacy (amounts + identities), lower costs, better UX for frequent payments
- **Recommendation:** L2 privacy for comprehensive institutional needs, L1 shielding for anonymity-focused use cases

**ZK vs FHE for Privacy:**

- **ZK Approach:** Lower operational costs, mature tooling, proven regulatory acceptance
- **FHE Approach:** More flexible computation, higher costs, emerging technology
- **Recommendation:** ZK for basic payments, FHE for complex payment logic

**Operator Complexity:**

- **Shielded Pool:** No protocol-level operator needed; users interact directly with L1 contracts. Private transactions depend on a first/third-party gas relayer to avoid linking the sender's funded address
- **Plasma/Intmax2:** Requires operator infrastructure for block building, proving, and withdrawal processing
- **Consideration:** Operator economics and liveness guarantees must be addressed for production deployment
- **Liveness fallback:** L2-based private payment solutions must implement [Forced Withdrawal](../patterns/pattern-forced-withdrawal.md) so users can recover funds on L1 when the operator is unresponsive. Plasma/Intmax2 already supports this via the L1 anchor contract's exit game (users submit a zero-knowledge proof of sufficient balance). L1 shielded pools (e.g., Railgun) do not need a separate escape hatch since users interact with L1 directly

**Institutional Treasury vs. Adversarial-Jurisdiction Disbursement:**

| Dimension | Institutional Treasury (A-F) | Adversarial-Jurisdiction (G) |
| --- | --- | --- |
| Counterparty | Cooperative | Adversarial; every party eventually compelled or breached |
| Recipient envelope | Modern wallet / HSM / KMS | EAL4+ smartcard, no internet, no client-side ZK |
| Transport | IP, optionally Tor/Nym | Mesh / store-and-forward + Tor or Nym at relay |
| Proof generation | Client-side | Relay-mediated, submitter-bound |
| Off-ramp | KYC'd venue acceptable | Unlinkability is the primary requirement |
| Regulatory disclosure | Selective, viewing-key based | Architectural minimization at funder layer |

### Open Questions

**Partially Resolved by PoC:**

1. **Stablecoin Issuer Integration:** Attestation-gated entry (zero-knowledge proof of KYC) demonstrates a viable compliance gating mechanism. Remaining: freeze/denylist integration within shielded pools.

2. **Liquidity Fragmentation:** Multi-token transfers require same-token constraints in circuits, confirming per-token shielded pools. Remaining: cross-pool atomic swaps and multi-asset circuit designs.

3. **Operational Recovery (key loss, business continuity):** Dual-key architecture (spending + viewing) enables balance inspection via viewing key even when spending key is in cold storage or lost. Remaining: full business continuity workflows and key rotation under shielding.

**Unresolved (Sections A-F):**

4. **Cross-Jurisdiction Standards:** Standardization of selective disclosure formats across different regulatory regimes?

5. **Traditional Rail Integration:** Technical standards for SWIFT/ISO20022 integration with privacy infrastructure?

6. **Verification Gas Viability:** At ~2.6M gas per on-chain verification for shielded pools, what payment volume threshold makes L2 amortization necessary?

7. **Network Timing Correlation:** Some approaches leak timing metadata. What is the acceptable latency overhead for [network anonymity](../patterns/pattern-network-anonymity.md) mitigations?

**Section G, Adversarial-Jurisdiction:**

8. **Relay economic recovery:** Spec out of scope. Each candidate (commission, L2 settlement, funder reimbursement) has distinct privacy consequences.

9. **Audit-friendly view-key extension:** Recipient-derived destinations have no view-key split; can a view-only credential be added without an interactive sender step?

10. **Smartcard supply-chain attestation:** Reproducible builds, multi-party applet-key signing, perso-bureau vetting; what satisfies donor-policy CC composite evaluation?

11. **Cross-cohort metadata leakage:** Funder identity, cohort-size evolution, and round cadence fingerprint deployments; how aggressively should funders rotate identities or pool programs?

12. **Forced-withdrawal interaction:** During an L1 escape hatch, can the recipient still hit an unlinkable destination, or does forced exit collapse to a public address? See [Forced Withdrawal](../patterns/pattern-forced-withdrawal.md).

### Alternative Approaches Considered

**Mixing Services**

- Use case: Simple payment privacy without institutional compliance
- Trade-off: Lower complexity vs reduced regulatory acceptance
- Consideration: Regulatory compliance challenges

## Example Scenarios

### Corporate Treasury Operations

- Multinational corporation needs daily operational payments ($1-5M) between subsidiaries
- Privacy: Payment amounts and corporate cash flow patterns confidential
- Compliance: Tax reporting and transfer pricing documentation
- Implementation: Privacy L2 for frequent transfers with periodic L1 settlement

### Adversarial-Jurisdiction Disbursement

- Humanitarian funder atomically shields a round total and emits a multisig-signed header; recipients receive it out-of-band (SMS, printed QR, mesh)
- Recipient's smartcard signs an offline voucher under its per-epoch ECDSA key bound to the round and on-card destination; the companion device encrypts to a relay's current key and submits via Briar or Meshtastic, fanning out to k < N relays
- A relay generates the cohort-membership SNARK with submitter binding and submits through Tor; the claim contract verifies and unshields to the destination, where the recipient redeems via a local agent network
- Threat coverage: no central beneficiary list at the funder layer (compelled-partner pivot cuts off); forward-secure epoch keys block retroactive successor-regime identification; off-ramp KYC pivot is bounded by the shielded pool's association-set k-anonymity and recipient relay diversity

## Links and Notes

- **Standards:** [ERC-3643](https://eips.ethereum.org/EIPS/eip-3643), [ERC-7573](https://ercs.ethereum.org/ERCS/erc-7573), [ISO 20022](https://www.iso20022.org/), [ERC-20](https://ercs.ethereum.org/ERCS/erc-20), [RFC 6979](https://www.rfc-editor.org/rfc/rfc6979) (deterministic ECDSA), [EIP-2](https://eips.ethereum.org/EIPS/eip-2) (canonical-s), [NIST SP 800-88](https://csrc.nist.gov/publications/detail/sp/800-88/rev-1/final) (media sanitization), [BSI-CC-PP-0084](https://www.bsi.bund.de/dok/CC-PP-0084) (smartcard SE protection profile)
- **Infrastructure:** [Railgun](https://railgun.org/), [Aztec Network](https://docs.aztec.network/), [Zama fhEVM](https://docs.zama.org/fhevm), [Intmax](https://www.intmax.io/), [Briar](https://briarproject.org/), [Meshtastic](https://meshtastic.org/), [Keycard](https://keycard.tech/), [Noir](https://noir-lang.org/), [Barretenberg UltraHonk](https://github.com/AztecProtocol/barretenberg)
- **Patterns:** [Shielding](../patterns/pattern-shielding.md), [Privacy L2s](../patterns/pattern-privacy-l2s.md), [Stateless Plasma Privacy](../patterns/pattern-plasma-stateless-privacy.md), [TEE-Based Privacy](../patterns/pattern-tee-based-privacy.md), [co-SNARKs](../patterns/pattern-co-snark.md), [Private Stablecoin Shielded Payments](../patterns/pattern-private-stablecoin-shielded-payments.md), [Private ISO20022](../patterns/pattern-private-iso20022.md), [Selective Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md), [User-Controlled Viewing Keys](../patterns/pattern-user-controlled-viewing-keys.md), [Verifiable Attestation](../patterns/pattern-verifiable-attestation.md), [Network-Level Anonymity](../patterns/pattern-network-anonymity.md), [Forced Withdrawal](../patterns/pattern-forced-withdrawal.md), [Forward-Secure Signatures](../patterns/pattern-forward-secure-signatures.md), [Recipient-Derived Receive Addresses](../patterns/pattern-recipient-derived-receive-addresses.md), [Relay-Mediated Proving](../patterns/pattern-relay-mediated-proving.md), [Mesh Store-and-Forward Submission](../patterns/pattern-mesh-store-forward-submission.md), [Private MTP Auth](../patterns/pattern-private-mtp-auth.md), [Proof of Innocence](../patterns/pattern-proof-of-innocence.md)
- **Regulatory:** [MiCA Framework](../jurisdictions/eu-MiCA.md), [SEC - GENIUS Act](../jurisdictions/us-SEC.md). Humanitarian: [CALP Network](https://www.calpnetwork.org/), [Sphere Handbook](https://spherestandards.org/), [ICRC Data Protection in Humanitarian Action Handbook (2nd ed, 2020)](https://www.icrc.org/en/data-protection-humanitarian-action-handbook)
- **Related Approaches:** [Private Trade Settlement](../approaches/approach-private-trade-settlement.md), [Private Derivatives](../approaches/approach-private-derivatives.md), [Private Identity](../approaches/approach-private-identity.md) (sibling for `IResilientIdentity`)
- **Reference Implementation:** [Private Payment PoC](https://github.com/ethereum/iptf-pocs/tree/master/pocs/private-payment); RDR PoC: forthcoming
