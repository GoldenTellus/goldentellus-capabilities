# GoldenTellus Capabilities

Production-ready tools, skills, and integrations — extracted from real enterprise deployments, open-sourced for developers.

## What Are Capabilities?

Capabilities are composable building blocks for AI applications. Each one solves a specific problem:

- **Tool**: Connect to external APIs (CRM, databases, file systems)
- **Skill**: Orchestrate tasks with prompts and retrieval (document summarization, meeting notes)
- **Knowledge Pack**: Domain-specific knowledge for RAG
- **External Role**: Configurable bot personas for customer-facing interactions

Every capability here has been deployed in production, refined through real usage, and vetted for quality.

## Using These Capabilities

Each capability is packaged in **universal formats** so you can use them immediately:

| Format | Use When | Examples in This Repo |
|---|---|---|
| **MCP Server** | You want a tool that works with Claude Desktop, Cline, or any MCP-compatible client | `tools/*/mcp/` |
| **Claude Skill** | You're building with Anthropic's agent framework | `skills/*/claude-skill/` |
| **OpenAPI Spec** | You need a REST API description for your own agent | `tools/*/openapi/` |
| **Standalone Script** | You want to run it directly without dependencies | `tools/*/standalone/` |

**You don't need SNAO to use these.** Pick the format that fits your stack.

## Repository Structure

```
capabilities/
├── tools/           # External API connectors
│   └── example-crm/
│       ├── mcp/              # MCP server implementation
│       ├── openapi/          # OpenAPI 3.1 spec
│       ├── standalone/       # CLI script version
│       └── README.md
├── skills/          # Task orchestration with prompts + RAG
│   └── doc-summary/
│       ├── claude-skill/     # Claude Skill package
│       ├── standalone/       # Script version
│       └── README.md
├── knowledge/       # Domain knowledge packs
└── external-roles/  # Customer-facing bot configurations
```

## Quick Start

### Using a Tool (MCP Example)

```bash
# Install the MCP server
cd capabilities/tools/example-crm/mcp
npm install

# Configure Claude Desktop
# Add this to your MCP config:
{
  "mcpServers": {
    "example-crm": {
      "command": "node",
      "args": ["/path/to/capabilities/tools/example-crm/mcp/index.js"]
    }
  }
}
```

### Using a Skill (Claude Skill Example)

```bash
cd capabilities/skills/doc-summary/claude-skill
npm install
npx @anthropic-ai/sdk skills add .
```

## Contributing

We're actively adding capabilities from our SNAO deployments. To contribute:

1. Each capability must include at least one universal format (MCP, Claude Skill, OpenAPI, or standalone script)
2. Include a clear README with usage examples and configuration options
3. Test it in at least one real deployment before submitting

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Behind the Scenes: SNAO

These capabilities are extracted from **SNAO** (Space-Native Agent Organization), a multi-tenant platform for deploying AI in enterprises. SNAO handles:

- **Trust & security**: Scope-based permissions, egress control, credential vaults
- **Governance**: Approval workflows, audit trails, cross-tenant isolation
- **Knowledge evolution**: Extract reusable knowledge from work sessions, vet quality, promote globally

Learn more at [goldentellus.com](https://goldentellus.com)

## License

Each capability is licensed individually (see LICENSE in each directory). Most are MIT or Apache 2.0.
