---
title: "Pattern: vOPRF Nullifiers"
status: draft
maturity: PoC
layer: hybrid
privacy_goal: Generate deterministic, scope-bound nullifiers without revealing identifiers or enabling offline linkage from client key compromise
assumptions: Threshold MPC network for vOPRF, client-side blinding, on-chain nullifier registry
last_reviewed: 2026-01-22
works-best-when:
  - You need deterministic per-scope nullifiers (or pseudonyms) for credentials/signals without revealing the underlying identifier.
  - You want to limit the damage from client key compromise—without the server key, an attacker cannot reconstruct past nullifiers offline from a leaked client secret alone.
  - You can operate (or rely on) a threshold service with clear governance, uptime, and abuse controls.
avoid-when:
  - A simple local nullifier (hash of user secret + scope) is sufficient and compromise/linkage is acceptable.
  - You cannot tolerate an online dependency (latency, availability, or regional deployment requirements).
  - You cannot establish an acceptable trust/compliance posture for the threshold committee or operator set.
dependencies:
  - vOPRF implementation (e.g., IETF OPRF/VOPRF constructions in prime-order groups).
  - Threshold/MPC or threshold signature infrastructure (t-of-n) to hold the server key without a single custodian.
  - A nullifier registry / replay protection mechanism in the target system (contract or service).
---

## Intent

Generate deterministic, scope-bound nullifiers for credential and signal mechanisms using a verifiable OPRF (vOPRF),
optionally thresholdized, so that nullifier generation is not solely determined by a single client secret and can be
verified for correctness.

On public networks, deterministic nullifiers derived solely from client secrets create a linkability risk: the same nullifier for a given scope reveals the same underlying user, and a leaked client secret allows offline reconstruction of all past nullifiers. A vOPRF adds a server-side component that breaks this offline linkability while preserving determinism for legitimate use.

This pattern is about "nullifier generation as a service" that preserves privacy of the input while allowing a
deterministic output that can be used for one-per-scope limits, anti-replay, or persistent pseudonyms.

## Ingredients

- Client-side input framing:
  - A stable identifier: credential_id, membership secret, device key, or issuer-provided handle.
  - A scope/context: service_id, action_id, epoch/time-bucket, chain_id, contract_id.
  - Domain separation: explicit tags to prevent cross-protocol reuse.
- vOPRF service:
  - Server public key (for verifiability) and a private key held by a committee/service.
  - Threshold/MPC variant (recommended) so no single node holds the full key.
  - Abuse controls: authentication gates, rate limits, and logging policy.
- Client blinding/unblinding:
  - Hash-to-curve and blind/unblind operations per the chosen vOPRF instantiation.
- Integration points (credential/signal mechanisms):
  - Credential usage: "one claim per credential per scope" using a nullifier registry.
  - Rate limiting: "k actions per epoch" using time-bucketed scopes.
  - Signals: "same user across sessions" (persistent pseudonym) without revealing the base identifier.
- Optional verification packaging:
  - Include a proof that the output corresponds to the advertised server public key.
  - Optionally include a ZK proof that the vOPRF input was well-formed (e.g., derived from a valid credential)
    without revealing the credential_id.

## Protocol

1. Define scope and input x:
   - x = Hash(tag || base_id || scope || epoch || chain_context)
   - Choose scope so outputs are linkable only where intended (service-specific, action-specific, or epoch-specific).
2. Blind:
   - Client hashes x to a curve point and blinds it with a random scalar r.
   - Client sends the blinded point plus any required metadata (scope, epoch, rate-limit token) to the service.
3. Threshold evaluation (service side):
   - Each committee node evaluates its share on the blinded input.
   - Responses are combined once t shares are available; the client receives the combined blinded evaluation.
4. Verifiability check (client side):
   - Client verifies the service proof that the evaluation corresponds to the service public key.
   - If verification fails, the client discards the result.
5. Unblind and derive seed:
   - Client unblinds using r to obtain y = vOPRF(k, x).
   - Client derives a seed: seed = Hash(tag2 || y || scope || chain_context).
6. Derive the nullifier:
   - nullifier = Hash(tag3 || seed)
   - Optionally derive multiple values: (nullifier, pseudonym, encryption_key) by domain-separated hashing.
7. Register / use:
   - Submit nullifier to a registry (on-chain or off-chain) to prevent double-use, or attach it to a proof/credential
     presentation as the anti-replay handle.
   - If required, prove in ZK that nullifier was derived from a valid credential and the correct scope.

## Guarantees

- Determinism (per scope):
  - Same (base_id, scope, epoch, chain_context) yields the same nullifier.
- Input privacy against the service (in the vOPRF model):
  - The service does not learn x (or base_id) from the blinded request.
- Output correctness (verifiable):
  - The client can verify the response corresponds to the service public key (reduces "malicious server returns junk").
- Reduced offline linkage from client compromise (qualified):
  - If only the client secret/base_id is leaked, an attacker cannot reconstruct vOPRF outputs offline without access to
    the service and the full input framing.
- Not guaranteed:
  - If an attacker who compromises the client can also query the service with the same inputs, they can regenerate the
    same nullifiers (determinism is the feature). Mitigate with scoped epochs, access controls, and/or proof-of-eligibility.
  - If the threshold committee is fully compromised (>= t colluding), outputs can be computed by the adversary.

## Trade-offs

- Online dependency:
  - Adds latency and availability requirements; failure of the service can block nullifier generation.
- Trust model:
  - Threshold/MPC reduces single-operator custody but introduces committee governance and collusion assumptions.
- Abuse and DoS surface:
  - Attackers can spam evaluation requests; require gating, fees, quotas, or proof-of-eligibility to request evaluation.
- Privacy and linkage tuning is delicate:
  - Too-broad scope (e.g., same input across services) creates unwanted cross-service linkability.
  - Too-narrow scope (e.g., per-action randomness) may defeat the purpose of rate limiting or replay prevention.
- Key management:
  - Requires ceremony/DSKG, resharing, rotation, and incident response. Rotation interacts with determinism:
    changing keys changes outputs unless versioned (key_id included in input framing).

## Example

A KYC issuer provides users a credential with an internal credential_id. A service wants:
(a) "one active session per user per day" and (b) no disclosure of identity.

- Scope design:
  - scope = Hash("service-A" || "daily-session" || day_bucket)
- Client request:
  - x = Hash(tag || credential_id || scope || chain_id || contract_id)
  - Client runs vOPRF with the service committee and derives nullifier.
- Enforcement:
  - The contract (or API) checks the nullifier has not been seen for that day_bucket and registers it.

Common mappings (examples):

| Mechanism type        | Typical base_id       | Typical scope input                    | Nullifier purpose                  |
|----------------------|-----------------------|----------------------------------------|-----------------------------------|
| Credential usage      | credential_id         | action_id + service_id                 | prevent double-claim              |
| Rate limiting         | membership secret     | service_id + time_bucket               | cap actions per period            |
| Anonymous voting      | eligibility handle    | election_id                            | one vote per eligible voter       |
| Persistent pseudonym  | stable user handle    | service_id                             | link sessions within one service  |

## See also

- [pattern-private-mtp-auth.md](pattern-private-mtp-auth.md)
- [pattern-verifiable-attestation.md](pattern-verifiable-attestation.md)
- [RFC 9497](https://www.rfc-editor.org/rfc/rfc9497.html) (OPRF/VOPRF)
- [RFC 9576](https://www.rfc-editor.org/rfc/rfc9576.html) (Privacy Pass architecture)
- [TACEO:OPRF](https://core.taceo.io/articles/taceo-oprf/) (threshold vOPRF / MPC service)
