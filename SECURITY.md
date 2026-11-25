# Security

## Reporting a leak or a bad pack

If a pack contains customer data, a secret, or content that should not be
public, **do not open a public issue**. Use GitHub's private vulnerability
reporting (Security → Advisories → Report a vulnerability) and include:

- pack id and entry id
- what looks wrong (without pasting the sensitive value)
- whether the pack was already released

We will remove the pack from `main` and from future releases, rotate the
signing key if needed, and publish a short advisory. Merged Git history cannot
be rewritten, so removal stops future distribution only.

## What must never be committed

- raw conversations, documents, attachments or screenshots
- names, phone numbers, emails, national ids, bank cards, salaries or amounts
- tenant ids, tenant hashes, user ids or machine names
- credentials, tokens, private keys, `.env` files
- internal hostnames, URLs or file paths

Packs are checked three times (client, relay, curation) and again by CI. If CI
fails on a leak, fix the source and regenerate the pack; do not edit around the
validator.

## Signing key

The release private key is held by the vendor only. The public key is
`keys/network.pub`. Relay servers never sign and never hold the private key.
See [SIGNING.md](SIGNING.md).
