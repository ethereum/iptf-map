# Contributing to IPTF Map

## How to Contribute

### Adding a Vendor/Protocol

1. Check the [vendors directory](./vendors/) - don't duplicate existing ones
2. Create a new file: `vendors/your-protocol.md`
3. Use the [template](./vendors/_template.md)
4. Submit a Pull Request using the vendor template

### Adding an Enterprise Use Case

1. Check [use-cases](./use-cases/) and [approaches](./approaches/) directories first
2. Create a new file describing your use case
3. Submit a Pull Request using the use-case [template](./use-cases/_template.md)

## Simple Rules

- **Be accurate** - no marketing, just facts
- **Check for duplicates** - don't add what's already there
- **Include working links** - make sure documentation works
- **Use semantic commits** - helps us track changes

**Semantic commit types:**

- `feat:` - New vendor, pattern, use case, or approach
- `fix:` - Corrections to existing content
- `docs:` - Documentation updates
- `refactor:` - Reorganizing content without changing meaning
- `chore:` - Maintenance tasks

## Changelog

When adding new patterns, vendors, or significant changes:

1. Add an entry to `[Unreleased]` section in [CHANGELOG.md](./CHANGELOG.md)
2. Include a markdown link to the new file
3. Reference the PR number: `(#123)`

Example entry:

```markdown
- [New pattern name](patterns/pattern-slug.md) (#123)
```

### Weekly Summaries

Generate a weekly summary for sharing:

```bash
./scripts/weekly-summary.sh           # Last 7 days
./scripts/weekly-summary.sh 2026-01-08 2026-01-15  # Custom range
```

## CROPS Evaluation

CROPS are the four non-negotiable properties defined by the Ethereum Foundation. They are indivisible: a solution that satisfies three out of four is not CROPS-aligned.

| Letter | Property                  | Definition                                                           |
| ------ | ------------------------- | -------------------------------------------------------------------- |
| **CR** | **Censorship Resistance** | No actor can selectively exclude valid use or break functionality    |
| **O**  | **Open source**           | No privileged code or hidden specifications                          |
| **P**  | **Privacy**               | User data is not exposed beyond necessity or against their interests |
| **S**  | **Security**              | Things do what they claim to do, no more and no less                 |

### Censorship Resistance (CR)

| Score      | Meaning                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `high`     | Permissionless access; no single party can exclude a user; inclusion or exit is guaranteed at the protocol level                                       |
| `medium`   | Access is gated, but users retain a credible independent path to participate or exit without institutional approval                                    |
| `low`      | Access is gated and exclusion is feasible in practice; user exits exist but are weak, delayed, or operationally constrained                            |
| `negative` | The pattern introduces a direct censorship vector (e.g., freeze, blacklist, approval gate, revocation power, or admin control over user participation) |

In I2U contexts, `medium` requires a concrete user escape path such as forced withdrawal, credential portability, or an L1 exit. Without that, the institution is the effective point of control over user participation.

If the answer to the first two bellow questions is “yes” and the fallback is not independently enforceable, the score should usually be `low` or `negative`.

Use these to justify the score in one or two lines:

- Can one identifiable actor stop the user from participating?
- Can one identifiable actor stop the user from exiting?
- Is there a non-custodial or protocol-enforced fallback?
- Does the fallback work without institutional/operator approval?
- Is exclusion exceptional and transparent, or built into normal operation?

### Open source (OS)

| Score     | Meaning                                                                                                           |
| --------- | ----------------------------------------------------------------------------------------------------------------- |
| `yes`     | Fully open source, publicly auditable, forkable; no proprietary black boxes in the critical path                  |
| `partial` | Core logic is open; some components (prover, oracle, bridge) are proprietary or source-available but not forkable |
| `no`      | Closed source or significant proprietary components in the critical path                                          |

In I2U contexts, ask whether the _end user_ can verify what code the institution runs on their behalf. "Open source" does not guarantee user-side auditability if the institution deploys opaque modifications. Requires an explicit open license (e.g., MIT, Apache 2.0, GPL, CC0); source-available or proprietary licenses do not qualify.

### Privacy (P)

| Score    | Meaning                                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| `high`   | Strong cryptographic guarantees; privacy holds under honest-but-curious operators; minimal trust assumptions |
| `medium` | Privacy preserved against external observers; the operator or institution can see user data                  |
| `low`    | Privacy is primarily marketing; meaningful data is visible to the institution or infrastructure operators    |

In I2U contexts, privacy from public observers is the baseline. Ask separately whether user data (financial activity, identity claims, voting choices, KYC records) is hidden from the institution operating the system, and under what conditions the institution can access it.

### Security (S)

| Score    | Meaning                                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `high`   | Well-established cryptographic assumptions or protocol-level decentralization; no single point of failure; no privileged upgrade path                   |
| `medium` | Security relies on operational trust assumptions (e.g., honest-majority MPC, TEE attestation, trusted setup) or has upgrade risk; not yet battle-tested |
| `low`    | Weak or deprecated cryptographic assumptions; centralized trust; significant upgrade or key management risk                                             |

For **patterns**: the score reflects the nature and strength of the underlying security guarantees — cryptographic assumptions, decentralization model, and known weaknesses. Document the specific assumptions (e.g., discrete log hardness, SGX attestation trust, honest-majority threshold, formal verification) in the pattern body under Trade-offs.

For **vendors/products**: the score combines the cryptographic assumptions of the underlying primitives with operational factors — formal audit status, upgrade key controls, admin key scope, incident history, and bug bounty program.

In I2U contexts, security also covers what the institution cannot do to the user unilaterally — not just what the system does correctly.

## Getting Help

- Open an issue for questions
- Use GitHub Discussions for broader topics
