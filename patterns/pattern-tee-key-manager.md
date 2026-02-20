---
title: "Pattern: TEE key manager"
status: draft
maturity: pilot
layer: offchain
privacy_goal: Isolate private keys in TEE with policy-bound signing; no on-chain transaction privacy
assumptions: Attested TEE hardware (SGX/SEV), attestation verification service, KMS for bootstrapping
last_reviewed: 2026-01-14
works-best-when:
  - Institutions need hot or warm keys with stronger isolation than software-only wallets.
  - TEE operator and hardware vendor are known and contractually bound.
avoid-when:
  - Key security must not depend on specific hardware vendors or cloud operators.
  - The threat model includes strong physical or microarchitectural side-channel attackers against the TEE.
dependencies:
  - Attested TEEs (Intel SGX/AMD SEV)
---

## Intent

Use an attested trusted execution environment (TEE) as a key manager for institutional Ethereum keys.  
Keys are generated or imported inside a TEE workload (an enclave or confidential VM, depending on the platform) that enforces signing policy and produces signatures while keeping private key material isolated from the host and operator.  
External systems bind the signer public key and policy hash to an approved attested measurement/configuration via an attestation verifier; on-chain registries (or EAS) may record this binding for audit, but are not themselves the verifier.

## Ingredients

- **Standards**
  - TEE attestation formats and reports (for example, [Intel SGX DCAP / ECDSA quotes](https://www.intel.com/content/dam/develop/public/us/en/documents/intel-sgx-dcap-ecdsa-orientation.pdf), [AMD SEV-SNP attestation reports](https://www.amd.com/content/dam/amd/en/documents/developer/lss-snp-attestation.pdf)).
  - Optional: [Ethereum Attestation Service (EAS)](https://docs.attest.org/) entries for measurement/config and policy hash (audit log).
  - Ethereum assets or keys under custody (for example,[ERC-3643](https://www.erc3643.org/), EOAs on secp256k1, validator signing keys on BLS).  

- **Infra**
  - Certified TEE hardware in secure data centres or cloud environments.
  - Attestation verification service that validates attestation reports (and platform configuration policy) and registers approved signer public keys and measurements/configuration.
  - Registry (on-chain or off-chain) that maps approved signer keys to institutions and policies.

- **Off-chain**
  - KMS or HSM used only for bootstrapping and controlled key migration into the TEE (if importing legacy keys is required).
  - Internal approvals / policy system that feeds rules into the TEE.
  - Monitoring for TEE health, firmware/TCB status, and attestation freshness.

## Protocol (concise)

1. **Provision and attest**
   - Deploy the key-manager as a TEE workload (enclave or confidential VM) with a well-defined, attested initial image and configuration (e.g., debug disabled, accepted TCB/firmware levels).
   - The TEE produces an attestation report with code measurement and platform configuration.
   - The attestation service verifies the report and registers the signer public key and measurement/configuration in a registry.

2. **Generate or import keys**
   - For new keys, generate key pairs inside the TEE **only if** the platform provides a cryptographically strong entropy source available to the TEE at generation time; otherwise, import keys (or derive keys from an external root under a controlled process).  
     - Store key material using platform-specific protected persistence (e.g., sealing or hardware-rooted encryption), with explicit anti-rollback/versioning when policy depends on mutable state.  
     - If the environment allows cloning or snapshot restore, treat first-boot entropy and key uniqueness as an explicit requirement (or disable keygen and require controlled import).
   - For existing keys, a one-time controlled import moves keys into the TEE over an authenticated channel using key-wrapping. Decommissioning legacy storage is an operational control; true “revocation” usually requires rotating assets/permissions away from the old key.

3. **Configure policy**
   - Institution defines signing policy (assets, destinations, limits, required approvals).
   - Policy is loaded into the TEE over an authenticated channel and stored as protected state (with an explicit version number).
   - A hash of the active policy can be anchored in EAS or the registry for auditability.

4. **Submit signing requests**
   - Client systems send unsigned transactions or messages plus context (purpose, approvals, limits) to the TEE over an authenticated, encrypted channel.
   - The TEE reconstructs signing intent from the request and context (e.g., chainId, to, value, calldata hash, nonce rules, validity window).

5. **Enforce policy and sign**
   - The TEE checks the request against stored policy and current protected state (for example, daily limits, replay protection, approval thresholds).
   - If the request passes, the TEE signs with the protected key and returns the signature.
   - If it fails, the TEE returns a clear rejection without exposing key material.

6. **Audit and rotate**
   - For key events (creation, import, rotation, policy change), write an append-only record **signed by the TEE-held key**; optionally publish its hash to EAS for audit. The linkage to a measurement/configuration is established by the attestation verifier that approved the signer key.
   - Rotation generates new keys inside the TEE, updates dependent systems, and retires old keys; protected state (including versioning / anti-rollback) is updated accordingly.

## Guarantees

- **Key confidentiality under TEE assumptions**
  - If TEE isolation holds and attestation verification correctly excludes unsafe configurations, the host OS, hypervisor, and operator should not be able to directly read plaintext private keys from the protected execution context.
  - Any key state stored outside the TEE is encrypted via platform-specific protected persistence (e.g., sealing or hardware-rooted encryption). Rollback resistance and portability depend on the platform and your anti-rollback design.
  - Key confidentiality does not imply key unpredictability/uniqueness unless key generation uses a strong entropy source available to the TEE.
  - Network metadata, traffic patterns, and timing remain visible; microarchitectural side-channels are not solved by default. Treat them as in-scope unless you have platform-specific mitigations and validation.

- **Policy-bound signing**
  - The TEE only signs requests that satisfy the attested code and protected policy.
  - This depends on correct parsing and explicit domain separation (e.g., [EIP-155](https://eips.ethereum.org/EIPS/eip-155) for transactions, [EIP-712](https://eips.ethereum.org/EIPS/eip-712) for structured messages); avoid “sign arbitrary bytes” interfaces.
  - An attacker who can submit signing requests but cannot change TEE code, configuration, or registry entries **should not** be able to cause signatures that violate configured rules, assuming correct parsing, domain separation, and policy implementation.

- **Attested signer identity**
  - Approved signer public keys are tied (by the verifier’s acceptance policy), via remote attestation, to a specific measurement and platform configuration.
  - Without forging attestation or compromising the verifier/registry, an attacker cannot impersonate the key manager.

- **Auditable lifecycle**
  - Key generation, import, rotation, and policy changes can be linked to an approved configuration through the verifier/registry, supporting compliance reviews and incident response without revealing private keys.

## Trade-offs

- **Trust surface**
  - Security depends on the TEE vendor (silicon, microcode, attestation roots/keys), the operator (physical security, provisioning, availability, and I/O channel control), and TEE code (correct, non-malicious policy logic), plus the attestation verifier and registry.
  - These are stronger trust assumptions than fully trust-minimised custody (for example, MPC without hardware trust anchors) and must be reflected in risk assessments.
  - TEE key isolation provides weaker guarantees than HSM custody (no physical tamper resistance, larger attack surface, documented side-channel history). In institutional settings, contractual controls with TEE operators partially mitigate this gap. Treat TEE key managers as complementary to HSMs, not replacements.

- **Attack and failure modes**
  - Supply-chain or firmware compromise can break TEE isolation or allow forged/meaningless attestation.
  - Microarchitectural and side-channel attacks (cache, speculative execution, etc.) can leak keys or policy state until platforms are patched or mitigated.
  - Rollback or snapshot attacks can restore older protected state to bypass limits or replay approvals if anti-rollback and logging are missing or misused.
  - Misconfiguration of secure boot, attestation checks, or debug controls, or bugs in TEE or policy code, can lead to incorrect or over-broad signing while attestation still appears valid.

- **Operational and performance limits**
  - Secure provisioning, protected-state handling, monitoring, re-attestation, key rotation, and incident response runbooks are required; loss or corruption of protected state without a recovery plan can render keys unusable.
  - TEE execution and policy checks add latency and cap throughput, making this pattern better suited to treasury, validator, and institutional flows than very high-frequency trading.

- **Single-TEE limitation**
  - A single TEE instance is a single point of compromise. For production custody, threshold key distribution across multiple TEE instances operated by independent parties is recommended. Single-TEE deployments are acceptable for pilot use or warm/operational keys with limited exposure.
  - See [TEE-Based Privacy — Defense Layers](pattern-tee-based-privacy.md#defense-layers) for the layered security model.

## Example

- A bank runs a TEE key manager for its Ethereum treasury and [ERC-3643](https://www.erc3643.org/) instruments.
- Keys are generated inside the TEE where the platform provides strong entropy; policy restricts transfers to approved counterparties and daily limits.
- Treasury operators use an internal system that submits unsigned transactions and approvals (e.g., signed attestations) bound to signing intent.
- The TEE checks policy, signs approved transactions, and returns signatures for broadcast without exposing private keys outside the TEE.

## See also

- Pattern: [MPC Custody](./pattern-mpc-custody.md)
- Pattern: [TEE ZK Settlement](./pattern-tee-zk-settlement.md)
- Pattern: [Verifiable Attestation](./pattern-verifiable-attestation.md)