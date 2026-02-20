---
title: "Pattern: TEE-Based Privacy"
status: draft
maturity: pilot
layer: offchain
privacy_goal: Protect computation and data confidentiality via hardware-isolated execution
assumptions: Hardware vendor trust, attestation infrastructure, physical security of deployment environment
last_reviewed: 2026-02-13
works-best-when:
  - Confidential computation needed with lower latency than ZK proofs
  - Parties accept hardware trust assumptions over cryptographic-only solutions
  - Institutional-grade infrastructure with known operators and vendors
avoid-when:
  - Threat model includes nation-state physical access or supply-chain compromise
  - Full trustlessness required (prefer ZK or MPC alternatives)
  - Long-term secrets that outlive hardware security lifecycle
dependencies:
  [Intel SGX, AMD SEV-SNP, AWS Nitro Enclaves, Azure Confidential Computing]
---

## Intent

Use Trusted Execution Environments (TEEs) to isolate sensitive computation from the host operating system, hypervisor, and operator. TEEs provide hardware-enforced confidentiality and integrity for code and data during execution, enabling privacy-preserving operations without exposing plaintext to infrastructure providers.

This is a foundational pattern describing TEE trust models and failure modes. Specific applications (key management, settlement, matching) build on this foundation.

## Ingredients

- **Hardware Platforms** (two categories with different trust models):
  - _CPU-encrypted (hardware TEEs)_: Memory encrypted by the CPU itself; protects data even from the host OS and hypervisor
    - **[Intel SGX](https://www.intel.com/content/www/us/en/architecture-and-technology/software-guard-extensions.html)**: Process-level enclaves, 90–128 MB encrypted memory (EPC). Attestation rooted in Intel signing keys
    - **[AMD SEV-SNP](https://www.amd.com/en/developer/sev.html)**: VM-level isolation with full memory encryption and integrity. Attestation rooted in AMD signing keys
  - _Hypervisor-isolated (VM TEEs)_: Isolation enforced by a minimal hypervisor; no CPU-level memory encryption
    - **[AWS Nitro Enclaves](https://aws.amazon.com/ec2/nitro/nitro-enclaves/)**: Isolated VMs with no persistent storage, no network access. Attestation signed by AWS root CA
    - **[Azure Confidential Computing](https://azure.microsoft.com/en-us/solutions/confidential-compute/)**: Offers both SGX and SEV-SNP; also provides attestation-as-a-service
  - **ARM TrustZone**: Mobile/embedded TEE (less common in institutional settings)

- **Attestation Infrastructure**:
  - Remote attestation services (Intel IAS/DCAP, AMD KDS, AWS Nitro attestation)
  - Attestation verification logic (on-chain or off-chain)
  - Measurement registries for approved code/configurations

- **Operational Requirements**:
  - Secure provisioning and sealing key management
  - Firmware/TCB update policies
  - Physical security of hosting environment
  - Incident response runbooks

## Trust Model

### Who Must Be Trusted

| Entity                 | Trust Requirement                     | Mitigation                                                   |
| ---------------------- | ------------------------------------- | ------------------------------------------------------------ |
| **Hardware Vendor**    | Correct implementation, no backdoors  | Vendor reputation, third-party audits, multi-vendor strategy |
| **Firmware/Microcode** | No vulnerabilities, timely patches    | TCB recovery, update policies, attestation checks            |
| **Cloud Provider**     | Physical security, correct hypervisor | Contractual obligations, attestation, multi-cloud            |
| **Operator**           | Correct deployment, no tampering      | Remote attestation, sealed secrets, audit logs               |
| **Code Author**        | Correct enclave logic                 | Open source, audits, formal verification                     |

### Platform Threat Model Comparison

|                           | CPU-encrypted (SGX, SEV)                                  | Hypervisor-isolated (Nitro)          |
| ------------------------- | --------------------------------------------------------- | ------------------------------------ |
| **Protects from**         | Host OS, hypervisor, cloud provider                       | Parent instance, other tenants       |
| **Does NOT protect from** | CPU manufacturer (holds master keys)                      | Cloud provider (controls hypervisor) |
| **Memory encryption**     | CPU silicon                                               | None (hypervisor boundary only)      |
| **Attestation root**      | CPU manufacturer signing keys                             | Cloud provider root CA               |
| **Side-channel exposure** | High (CPU-level: Spectre, cache timing)                   | Lower (VM boundary)                  |
| **Institutional analogy** | "Programmable enclave" (weaker than HSM — see note below) | "Locked-down VM you can't SSH into"  |

For institutions already trusting a cloud provider with their infrastructure, hypervisor-isolated TEEs are operationally simpler. When protection _from_ the cloud provider is needed, CPU-encrypted TEEs are required.

> **TEE ≠ HSM.** HSMs provide physical tamper resistance (EAL5–7), dedicated silicon, and minimal firmware surface. TEEs offer general-purpose computation with logical isolation but share the CPU die, lack physical tamper resistance (EAL2–4), and have a larger attack surface with documented side-channel history. Contractual controls (NDA, audit rights, SLAs) partially mitigate this gap but do not close it. Treat TEEs as complementary to HSMs, not replacements.

### What TEEs Protect

- **Confidentiality**: Data and code encrypted in memory; inaccessible to host OS/hypervisor
- **Integrity**: Tamper detection via hardware measurements and attestation
- **Isolation**: Execution separated from other processes and privileged software

### What TEEs Do NOT Protect

- **Availability**: Host can deny service, power off, or refuse to schedule enclave
- **I/O Channel Control**: Host operator controls all enclave communication (e.g., vsock) and can intercept, reorder, drop, replay, and inject messages — even without reading enclave memory
- **Communication Metadata**: Packet sizes, processing duration, and connection patterns remain visible even with encrypted payloads, leaking operation types
- **Side Channels**: Timing, cache, power, and speculative execution leaks remain possible without constant-time cryptography and platform-specific mitigations
- **Physical Attacks**: Sophisticated attackers with hardware access may extract secrets
- **Supply Chain**: Compromised hardware from manufacturing may have backdoors

## Protocol (concise)

1. **Provision**: Deploy TEE workload with measured code image; generate or import secrets.
2. **Attest**: TEE produces attestation report; verifier checks measurement against expected values.
3. **Establish Trust**: Clients verify attestation before sending sensitive data.
4. **Execute**: TEE processes confidential data; results encrypted before leaving enclave.
5. **Audit**: Log attestation events and operations for compliance; seal state for persistence.
6. **Rotate/Upgrade**: Update code or firmware; re-attest; migrate sealed state if needed.

## Failure Modes

| Failure Mode                            | Description                                                                             | Impact                                               | Mitigation                                                                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Supply Chain Compromise**             | Backdoored hardware from manufacturing                                                  | Complete confidentiality loss                        | Multi-vendor, hardware audits, attestation checks                                                                             |
| **Firmware Vulnerability**              | Exploitable bugs in microcode/firmware                                                  | Enclave escape, secret extraction                    | TCB recovery, rapid patching, version policies                                                                                |
| **Side-Channel Attack**                 | Cache timing, Spectre/Meltdown variants                                                 | Partial secret leakage                               | Constant-time code, partitioning, updates                                                                                     |
| **Rollback Attack**                     | Replay of old sealed state                                                              | Policy bypass, double-spend                          | Monotonic counters, external anchoring                                                                                        |
| **Denial of Service**                   | Host refuses to run enclave                                                             | Availability loss                                    | Redundancy, fallback procedures, SLAs                                                                                         |
| **I/O Manipulation**                    | Operator intercepts, reorders, or injects messages on the channel | Data corruption, front-running, censorship | Authenticated channels with sequence numbers, ZK proofs of execution, multi-operator setups |
| **Incomplete Attestation Verification** | Client skips certificate chain or platform register validation    | Code substitution while attestation appears valid | Validate full certificate chain to vendor root CA, check all platform registers, use nonce freshness |
| **Key Exfiltration**                    | Bug in enclave code leaks secrets                                                       | Complete compromise                                  | Audits, formal verification, minimal TCB                                                                                      |

## Guarantees

- **Confidentiality**: Protected from host/operator under stated trust assumptions
- **Integrity**: Attestation proves code and configuration match expectations
- **Auditability**: Attestation logs provide verifiable execution history
- **Portability**: Secrets can be sealed and migrated between attested enclaves

## Trade-offs

- **Hardware Dependency**: Locked to specific vendors; supply constraints possible
- **Trust Surface**: Larger than pure cryptographic solutions; hardware/firmware vulnerabilities affect all deployments
- **Performance**: Fast execution but limited memory (SGX); context switches have overhead
- **Lifecycle**: Hardware security erodes over time as attacks improve; plan for migration
- **Regulatory Uncertainty**: Some regulators may not accept "black box" execution for audit purposes

## When TEEs Are Appropriate

| Use Case                  | TEE Fit    | Notes                                                  |
| ------------------------- | ---------- | ------------------------------------------------------ |
| Hot key management        | Good       | Faster than MPC; acceptable trust for operational keys |
| Private matching engine   | Good       | Real-time performance; ZK too slow for orderbooks      |
| Bridge/oracle relayer     | Acceptable | Defense in depth with other controls                   |
| Long-term custody         | Poor       | Prefer MPC or cold storage for years-long secrets      |
| Regulatory-critical audit | Uncertain  | Depends on regulator acceptance                        |

## Defense Layers

A TEE alone is insufficient for high-value production workloads. Each layer reduces the trust surface:

| Layer                    | Composition                                                                            | What it adds                                                                                                                                                                                                                                                                          |
| ------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TEE only**             | Single enclave, single operator                                                        | Memory isolation. Vulnerable to operator I/O manipulation, side-channels, single point of compromise. Suitable for pilots and low-value operations only                                                                                                                               |
| **TEE + Threshold Keys** | Key material distributed across multiple TEE instances operated by independent parties | No single compromise yields full key. Minimum viable for production custody and coordination                                                                                                                                                                                          |
| **TEE + ZK**             | TEE executes, produces ZK proof verified on-chain                                      | Mitigates operator I/O manipulation: even if the operator tampers with inputs/outputs, the ZK proof will not verify unless execution was correct. Removes dependency on attestation infrastructure for verifiability (see [Hybrid TEE + ZK Settlement](pattern-tee-zk-settlement.md)) |
| **TEE + Threshold + ZK** | Full defense in depth                                                                  | Threshold trust, cryptographic verifiability, hardware isolation as complementary layers                                                                                                                                                                                              |

> **GPU TEEs**: For compute-intensive workloads offloaded to GPU (ZK proving, ML inference), GPU confidential computing (e.g., NVIDIA H100) extends the TEE boundary to accelerators. GPU attestation should be verified within the CPU TEE before offloading sensitive data.

## Example

**Confidential Order Matching**

1. Exchange deploys matching engine inside AWS Nitro Enclave.
2. Traders verify attestation showing approved matching code.
3. Orders submitted encrypted; decrypted only inside enclave.
4. Matching occurs privately; only fills are published.
5. Attestation logs prove matching logic was not tampered with.
6. Auditors can verify code measurements without seeing order flow.

## See also

- [TEE Key Manager](pattern-tee-key-manager.md) - Specific application for custody
- [Hybrid TEE + ZK Settlement](pattern-tee-zk-settlement.md) - TEE execution with ZK verification
- [MPC Custody](pattern-mpc-custody.md) - Cryptographic alternative to TEE key management
- [Verifiable Attestation](pattern-verifiable-attestation.md) - On-chain attestation verification

## See also (external)

- Bluethroat Labs TEE Security Handbook: https://docs.bluethroatlabs.com/
- Confidential Computing Consortium (Linux Foundation): https://confidentialcomputing.io/
- awesome-tee-blockchain (curated resource list): https://github.com/dineshpinto/awesome-tee-blockchain
- TEE security research: https://tee.dev/
