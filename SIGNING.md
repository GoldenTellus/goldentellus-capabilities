# Signing and Verification

Knowledge packs are distributed as **signed, self-contained bundles**. A
deployment only installs a pack after the signature, every file hash and the
compatibility fields pass.

The relay that receives contributions **never signs** and cannot alter a pack.
Only the vendor holds the release private key.

## Pinned public key

The trust anchor is `keys/network.pub` in this repository, an Ed25519 public key
(SPKI PEM). Its `key_id` is the first 16 hex characters of the SHA-256 of the
PEM. Deployments pin the same key locally (SNAO: `ops/network.pub`).

## Bundle format

`snao.network.bundle/1`

```json
{
  "schema": "snao.network.bundle/1",
  "pack_id": "snao-community-2026-11",
  "version": "2026.11.1",
  "created_at": "2026-11-25T13:57:00.000Z",
  "protocol_version": 1,
  "min_kernel": "0.1.0",
  "key_id": "1cd3e3a7708a4950",
  "files": [
    { "path": "manifest.yaml", "sha256": "...", "bytes": 203 },
    { "path": "entries.json", "sha256": "...", "bytes": 2487 },
    { "path": "README.md", "sha256": "...", "bytes": 1307 },
    { "path": "LICENSE", "sha256": "...", "bytes": 281 }
  ],
  "entries_sha256": "...",
  "contents": { "manifest.yaml": "...", "entries.json": "...", "README.md": "...", "LICENSE": "..." },
  "signature": "base64(Ed25519(canonicalJson(bundle without signature)))"
}
```

The signature covers every field except `signature`, including `contents`. The
file list lets an installer verify each extracted file independently.

## What the installer checks

1. `schema` is `snao.network.bundle/1` and `signature` is present.
2. Ed25519 signature over canonical JSON with the pinned key.
3. Each file's `sha256` and byte length match its content.
4. `protocol_version` is not newer than the installer's protocol.
5. `min_kernel` is not newer than the installer's kernel version.

Any failure aborts the install; partial installs are not kept.

## Release convention

- Tag: `<pack-id>-v<version>` (for example `snao-community-2026-11-v2026.11.1`)
- Asset: `<pack-id>-v<version>.bundle.json`
- One release per pack version; a new version is a new tag.

With SNAO:

```bash
npm run pack -- verify <bundle>.json
npm run pack -- install <bundle>.json
npm run pack -- pull https://github.com/GoldenTellus/goldentellus-capabilities/releases/download/<tag>/<bundle>.json
npm run pack -- rollback --pack-id <pack-id>
```

Installation keeps `current` and `previous`; rollback swaps them. Install and
rollback are recorded in the SNAO Event Journal.

## Key rotation

Rotating the key invalidates every previously published bundle. The steps are:

1. Generate a new key pair and update `keys/network.pub` (and
   `ops/network.pub` in SNAO) in the same change.
2. Publish the new `key_id` in `SIGNING.md`.
3. Re-sign and re-release every supported pack version.
4. Deployments update the pinned key before pulling the new bundles.

Never publish a private key, a `.p8`, or a key file with credentials. If a key
is exposed, follow `SECURITY.md`.
