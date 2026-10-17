# Capability Manifest Format (Simplified)

This document describes the **public subset** of the SNAO Capability Manifest format. Use it to understand how capabilities are structured in this repository, but **you don't need SNAO to use these capabilities** — they're packaged in universal formats (MCP, Claude Skill, OpenAPI, standalone scripts).

---

## Core Structure

```yaml
Capability:
  capability_id: "tool-salesforce-connector"    # Unique identifier
  kind: "tool"                                  # tool | skill | knowledge_pack | external_role
  version: "1.2.0"                              # Semantic versioning
  
  # Human-readable metadata
  name: "Salesforce Connector"
  description: "Query and update Salesforce CRM records"
  
  # Trust and permissions
  trust:
    execution_class: "executable"              # declarative | executable | composite
    required_scopes: ["crm:read", "crm:write"]
    egress: ["*.salesforce.com", "*.force.com"]  # Allowed domains
    secret_refs: ["salesforce_api_key"]          # Required credentials
  
  # Kind-specific configuration
  spec:
    # For tools: OpenAPI spec, MCP server config, etc.
    # For skills: Prompt templates, RAG configuration, etc.
    # For knowledge packs: Vector store schema
    # For external roles: Persona configuration
```

---

## Fields Explained

### `capability_id`

Globally unique identifier. Format: `{kind}-{kebab-case-name}`

Examples:
- `tool-salesforce-connector`
- `skill-doc-summary`
- `knowledge-manufacturing-sop`
- `role-lead-capture`

### `kind`

The type of capability. Determines how it's executed and what goes in `spec`.

| Kind | Purpose | Example |
|---|---|---|
| **tool** | Call external APIs | Database query, CRM lookup, file operations |
| **skill** | Orchestrate prompts + retrieval | Document summarization, meeting notes, data analysis |
| **knowledge_pack** | Domain knowledge for RAG | Industry SOPs, compliance rules, product catalogs |
| **external_role** | Customer-facing bot persona | Lead capture, customer service, partner portal |

### `trust` Block

Defines permissions and security requirements.

#### `execution_class`

| Class | Meaning |审批 Requirement |
|---|---|---|
| **declarative** | No code execution, only prompts and retrieval | Low; often auto-approved |
| **executable** | Runs code, calls APIs | Medium; requires permission review |
| **composite** | Orchestrates multiple capabilities | High; requires full trust chain review |

#### `required_scopes`

Permissions needed to run this capability. Common scopes:

- `context:read` — Read company knowledge base
- `context:write` — Write to knowledge base
- `workspace:read` — Read shared workspace documents
- `workspace:write` — Write to workspace
- `crm:read` / `crm:write` — CRM operations
- `db:read` / `db:write` — Database operations
- `file:read` / `file:write` — File system access

#### `egress`

List of allowed external domains. If a capability tries to contact a domain not on this list, it's blocked.

Examples:
- `["*.salesforce.com"]` — Only Salesforce
- `["api.example.com", "cdn.example.com"]` — Specific subdomains
- `["*"]` — Any domain (use sparingly, requires strict approval)

#### `secret_refs`

List of required credentials. The capability declares what it needs, but never hardcodes secrets.

Examples:
- `["salesforce_api_key"]`
- `["database_password", "smtp_password"]`

---

## `spec` Block (Kind-Specific)

### For Tools (`kind: tool`)

```yaml
spec:
  # Preferred: reference an OpenAPI spec file
  openapi: "openapi/spec.yaml"
  
  # Or inline MCP server configuration
  mcp:
    command: "node"
    args: ["mcp/index.js"]
```

### For Skills (`kind: skill`)

```yaml
spec:
  # Prompt template
  prompt_template: |
    You are a document summarizer. Summarize the following document:
    
    {document_content}
  
  # RAG configuration (if skill retrieves knowledge)
  rag:
    retrieval_method: "semantic_search"
    chunk_size: 512
    top_k: 5
```

### For Knowledge Packs (`kind: knowledge_pack`)

```yaml
spec:
  # Vector store schema
  vector_store:
    embedding_model: "text-embedding-3-small"
    dimension: 1536
  
  # Source documents
  sources:
    - "knowledge/manufacturing-sop/**/*.md"
```

### For External Roles (`kind: external_role`)

```yaml
spec:
  # Persona configuration
  persona:
    name: "Lead Capture Bot"
    tone: "friendly, professional"
    forbidden_topics: ["pricing", "unreleased products"]
  
  # What information to collect
  collect_fields:
    - {name: "industry", required: true}
    - {name: "company_size"}
    - {name: "contact_email", pii: true}
  
  # When to hand off to a human
  handoff:
    trigger: "intent_score >= 0.7"
    handoff_to: "role:sales"
```

---

## Full Example

```yaml
Capability:
  capability_id: "tool-database-query"
  kind: "tool"
  version: "2.1.0"
  
  name: "PostgreSQL Database Query"
  description: "Execute read-only SQL queries against PostgreSQL"
  
  trust:
    execution_class: "executable"
    required_scopes: ["db:read"]
    egress: ["db.internal.example.com"]
    secret_refs: ["postgres_connection_string"]
    
    cost_profile:
      inference_cost: "low"
      frequency: "high"
    
    resources:
      timeout: "30s"
      memory: "128Mi"
  
  spec:
    openapi: "openapi/spec.yaml"
    
    mcp:
      command: "node"
      args: ["mcp/index.js"]
      env:
        POSTGRES_HOST: "${POSTGRES_HOST}"
        POSTGRES_DB: "${POSTGRES_DB}"
```

---

## What's Not Here

This format is a **simplified subset** of the internal SNAO Manifest. We've omitted:

- Multi-tenant isolation fields (`tenant_id`, `scope`)
- Publisher verification (`publisher_id`, `signature`)
- Approval workflow fields (`lifecycle`, `policy_checked`)
- Dependency resolution (`deps`, `version_range`)
- Lifecycle management (`deprecated`, `replaced_by`)

These are handled internally by SNAO. If you're using capabilities from this repository in other environments, you only need the fields shown above.

---

## Further Reading

- **Full SNAO architecture**: See `SNAO_Framework_v1.0.md` (§4 Capability System)
- **Using capabilities without SNAO**: Check the README of each capability — they're packaged in universal formats
- **Contributing new capabilities**: See [CONTRIBUTING.md](CONTRIBUTING.md)
