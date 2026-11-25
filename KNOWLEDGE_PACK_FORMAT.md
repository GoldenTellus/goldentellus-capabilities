# Knowledge Pack Format

A knowledge pack is a small, desensitized bundle of reusable question/answer,
FAQ, rule, terminology or capability-catalog entries extracted from SNAO
deployments. Packs live under `knowledge/<pack-id>/` and are distributed as
signed release bundles.

Packs never contain raw conversations, customer names, user ids, tenant ids,
phone numbers, emails, amounts, file names or internal hosts. Those are removed
on the customer side, re-checked by the vendor relay, and checked again during
curation.

## Directory layout

```
knowledge/
└── <pack-id>/
    ├── README.md          # what it is, provenance, usage
    ├── LICENSE            # per-pack license (CC-BY-4.0 by default)
    ├── manifest.yaml      # metadata and counts
    └── entries.json       # the entries
```

Run `node scripts/validate-pack.mjs` before opening a PR; CI runs the same
validator on every pull request.

## manifest.yaml

```yaml
pack_id: "snao-community-2026-11"   # must equal the directory name
schema: "snao.knowledge-pack/1"
protocol_version: 1                 # SNAO contribution protocol version
generated_at: "2026-11-25T13:54:12.854Z"
license: "CC-BY-4.0"
entries: 5
max_k: 1                            # max independent deployments per entry; null = capabilities only
single_source: true                  # required when max_k < 2
counts:
  capabilities: 4
  faq: 1
```

`counts` must add up to `entries`, and each value must match the number of
entries of that category in `entries.json`.

## entries.json

```json
{
  "schema": "snao.knowledge-pack.entries/1",
  "pack_id": "snao-community-2026-11",
  "entries": [
    {
      "entry_id": "sha256:243ab6c2861548937dcbd5eed95a76f3",
      "category": "faq",
      "payload": { "question": "合同盖章流程？", "answer": "先走法务审核，再由行政盖章并归档。" },
      "tags": ["流程"],
      "confidence": 80,
      "k": 1
    }
  ]
}
```

### Categories and payload fields

| category | payload fields | notes |
|---|---|---|
| `qa` | `question`, `answer` | approved enterprise knowledge |
| `faq` | `question`, `answer` | repeated questions, `k` = deployments it appeared in |
| `rules` | `question`, `rule` | review/gate rules; the question is a short label |
| `terms` | `term`, `definition` | glossary entries |
| `capabilities` | `question`, `answer` | global capability catalog ids; `k` is `null` |

`entry_id` is `sha256:` plus 32 hex characters over the normalised payload, so
the same content dedupes across packs and deployments.

### k-anonymity

`k` is the number of independent deployments that supplied the same entry.
Non-capability entries should have `k >= 2` before they are published. A pack
with `max_k < 2` is a **single-source** pack and must set
`single_source: true`; it exists only to exercise the pipeline or to share
content the source owner explicitly approved for publication.

## Adding a pack

Knowledge packs are produced by the vendor curation pipeline, not written by
hand:

1. A deployment submits a desensitized pack to the vendor relay.
2. The vendor pulls, rejects leaking batches, dedupes and applies k-anonymity.
3. An `inbox/<pack-id>` branch opens a PR with `knowledge/<pack-id>/`.
4. After review and merge, the vendor signs a self-contained bundle and
   publishes it as a release (see `SIGNING.md`).

If you are proposing a new pack, open an issue first. Do not paste raw customer
content into an issue or a pull request.
