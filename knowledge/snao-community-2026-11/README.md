# snao-community-2026-11

Community knowledge pack curated from SNAO deployments.

- Entries: 5 (capabilities 4, faq 1)
- Sources: single source (owner-approved)
- Generated: 2026-11-25T14:02:23.906Z
- License: CC-BY-4.0

## What is inside

`entries.json` is a list of desensitized question/answer or rule entries.
Names, phone numbers, emails, ids, amounts, file names and internal hosts were
removed before submission; the vendor re-scanned every entry on receipt and
again on curation. No tenant id, user id or raw conversation is included.

## Format

```json
{
  "schema": "snao.knowledge-pack.entries/1",
  "pack_id": "snao-community-2026-11",
  "entries": [
    { "entry_id": "sha256:...", "category": "faq", "payload": { "question": "...", "answer": "..." }, "tags": [], "confidence": 80, "k": 1 }
  ]
}
```

Categories: `qa`, `faq`, `rules`, `terms`, `capabilities`.

## How it is produced

1. Each deployment signs and submits a desensitized pack to the vendor relay.
2. The relay rejects packs that still contain PII or customer-specific values.
3. The vendor dedupes by `entry_id`, applies k-anonymity (default k>=2 per
   non-capability entry), and a human reviews the batch.
4. Accepted entries land here; a signed release can be pulled offline.

Do not add raw customer content to this pack.
