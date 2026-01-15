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

## Getting Help

- Open an issue for questions
- Use GitHub Discussions for broader topics
