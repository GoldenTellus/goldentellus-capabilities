# Knowledge packs

Each directory here is one desensitized knowledge pack, produced by the SNAO
contribution pipeline and reviewed before merge.

```
knowledge/<pack-id>/
├── README.md
├── LICENSE
├── manifest.yaml
└── entries.json
```

See [KNOWLEDGE_PACK_FORMAT.md](../KNOWLEDGE_PACK_FORMAT.md) for the schema and
[../SIGNING.md](../SIGNING.md) for how packs are signed and installed.

Run `node scripts/validate-pack.mjs` before pushing. Do not add raw customer
content, names, ids, amounts, hosts or file names.
