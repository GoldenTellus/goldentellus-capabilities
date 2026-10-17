# Contributing to GoldenTellus Capabilities

Thank you for considering contributing! This repository is a catalog of production-ready capabilities extracted from real enterprise deployments.

## What We Accept

**Good candidates for contribution:**

- Tools that connect to widely-used services (CRMs, databases, file systems, communication platforms)
- Skills that solve common enterprise workflows (document processing, data analysis, meeting automation)
- Knowledge packs for specific domains (legal, medical, finance, manufacturing)
- External roles for customer-facing scenarios (lead capture, customer service, partner portals)

**We prioritize:**

- **Battle-tested**: Has been used in at least one production deployment
- **Universal format**: Packaged as MCP server, Claude Skill, OpenAPI spec, or standalone script
- **Self-contained**: Minimal dependencies, clear configuration, no proprietary lock-in

**We generally decline:**

- Experimental or proof-of-concept code
- Capabilities that only work with a single proprietary platform (unless it's very widely adopted)
- Anything that requires a complex setup or deep knowledge of SNAO internals

## Contribution Process

### 1. Propose First

Before writing code, open an issue describing:

- What problem does this capability solve?
- What format(s) will you provide (MCP, Claude Skill, OpenAPI, standalone)?
- Have you deployed this in production? Where and for how long?

We'll review and confirm whether it fits the catalog.

### 2. Structure Your Capability

Use this directory layout:

```
capabilities/
└── [tools|skills|knowledge|external-roles]/
    └── your-capability-name/
        ├── README.md               # Required: usage, config, examples
        ├── LICENSE                 # Required: MIT, Apache 2.0, or compatible
        ├── mcp/                    # If providing MCP format
        │   ├── package.json
        │   ├── index.js
        │   └── README.md
        ├── claude-skill/           # If providing Claude Skill format
        │   ├── skill.json
        │   └── README.md
        ├── openapi/                # If providing OpenAPI format
        │   └── spec.yaml
        └── standalone/             # If providing standalone script
            ├── cli.js (or cli.py)
            └── README.md
```

**Each format directory must have its own README** explaining how to install and use that specific format.

### 3. Write Clear Documentation

Your top-level README.md should include:

- **What it does** (one-sentence summary)
- **When to use it** (concrete scenarios)
- **Quick start** (copy-paste commands to get running)
- **Configuration** (all required environment variables, API keys, etc.)
- **Examples** (at least 2 real usage examples with input/output)
- **Known limitations** (rate limits, unsupported features, quirks)

### 4. Test Locally

Before submitting:

- Run your capability against the target service (don't submit untested code)
- Verify all configuration steps in your README work on a clean machine
- If providing MCP: test it works with Claude Desktop
- If providing Claude Skill: test it with `@anthropic-ai/sdk`

### 5. Submit a Pull Request

- One capability per PR
- PR title: `Add [capability-name]: [one-line description]`
- PR description: Link to the proposal issue, summarize what you built, mention production usage

We'll review within 5 business days.

## Quality Standards

Every capability must meet these minimums:

| Criterion | Requirement |
|---|---|
| **README completeness** | Must have all sections above (what, when, quick start, config, examples, limitations) |
| **Format coverage** | At least 1 universal format (MCP / Claude Skill / OpenAPI / standalone) |
| **Error handling** | Graceful failures with clear error messages (not just stack traces) |
| **Security** | No hardcoded secrets; all credentials via environment variables or config files |
| **License clarity** | Every directory has a LICENSE file; license is OSI-approved |
| **Production evidence** | Must cite at least one real deployment (in PR description or README) |

## Review Criteria

When we review your PR, we check:

1. **Does it solve a real problem?** (Not just "cool tech demo")
2. **Is it self-contained?** (Doesn't require complex SNAO setup)
3. **Can someone use it in 5 minutes?** (Quick start works as written)
4. **Is it safe?** (No obvious security holes, credentials handled properly)
5. **Is it maintained?** (You commit to fixing breaking changes for 6 months)

## Maintenance Expectations

Once your capability is merged:

- **You own it for 6 months minimum**. Respond to issues, fix breaking changes from upstream services.
- If you can't maintain it anymore, notify us. We'll find a new owner or mark it deprecated.
- We'll notify you when upstream APIs change (e.g., MCP protocol updates, Claude SDK changes). You have 30 days to update.

## Code of Conduct

- Be respectful and professional
- Assume good intent
- Provide constructive feedback
- Credit prior work and collaborators

## Questions?

Open an issue or reach out at [community contact TBD].
