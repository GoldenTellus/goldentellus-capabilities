#!/usr/bin/env node
/**
 * Validate knowledge packs in this repository. Zero dependencies.
 *
 * Usage:
 *   node scripts/validate-pack.mjs                 # validate every knowledge/<pack>
 *   node scripts/validate-pack.mjs knowledge/x ... # validate selected packs
 *
 * Exits 1 when a pack is missing files, has a bad schema, leaks identifiers or
 * breaks k-anonymity rules. CI runs the same command on every pull request.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const CATEGORIES = {
  qa: ['question', 'answer'],
  faq: ['question', 'answer'],
  rules: ['question', 'rule'],
  terms: ['term', 'definition'],
  capabilities: ['question', 'answer'],
};
const REQUIRED_FILES = ['README.md', 'LICENSE', 'manifest.yaml', 'entries.json'];
const PLACEHOLDER = /<[^>\n]{1,20}>/g;

const errors = [];
const warnings = [];
const fail = (pack, message) => errors.push(`${pack}: ${message}`);
const warn = (pack, message) => warnings.push(`${pack}: ${message}`);

function parseManifest(text) {
  const out = { counts: {} };
  let inCounts = false;
  for (const raw of text.split('\n')) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const indented = /^\s+/.test(raw);
    const line = raw.trim();
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    const value = rawValue.replace(/^"(.*)"$/, '$1').trim();
    if (!indented) {
      inCounts = key === 'counts';
      if (inCounts) out.counts = {};
      else out[key] = value;
      continue;
    }
    if (inCounts) out.counts[key] = Number(value);
  }
  return out;
}

const LEAKS = [
  [/\btenant_hash\b/i, 'tenant_hash field'],
  [/\b1[3-9]\d{9}\b/, 'phone number'],
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, 'email'],
  [/\b\d{17}[\dXx]\b/, 'id card number'],
  [/\b\d{16,19}\b/, 'long digit run (bank card?)'],
  [/(?:¥|￥|\$|USD|CNY|RMB)|\d+(?:\.\d+)?\s*(?:万元|元|块|美元)/, 'currency amount'],
  [/\.(?:pdf|docx?|xlsx?|pptx?|csv|tsv|png|jpe?g|gif|zip|rar|7z)\b/i, 'file name'],
  [/\bhttps?:\/\/|www\./, 'url'],
  [/(?:我司|本公司|我们公司|咱们公司)/, 'company self-reference'],
  [/\bu_[a-z0-9]{4,}\b/, 'user id'],
];

function scanLeaks(pack, text, where) {
  const source = text.replace(PLACEHOLDER, ' ');
  for (const [pattern, label] of LEAKS) {
    if (pattern.test(source)) fail(pack, `${where} still contains a ${label}`);
  }
}

function validatePack(dir) {
  const name = dir.split('/').pop();
  for (const file of REQUIRED_FILES) {
    if (!existsSync(join(dir, file))) {
      fail(name, `missing ${file}`);
      return { entries: 0 };
    }
  }

  const manifestText = readFileSync(join(dir, 'manifest.yaml'), 'utf8');
  const manifest = parseManifest(manifestText);
  if (manifest.pack_id !== name) fail(name, `manifest pack_id "${manifest.pack_id}" does not match the directory`);
  if (manifest.schema !== 'snao.knowledge-pack/1') fail(name, `schema must be snao.knowledge-pack/1`);
  if (!Number.isInteger(Number(manifest.protocol_version)) || Number(manifest.protocol_version) < 1) {
    fail(name, 'protocol_version must be a positive integer');
  }
  if (!manifest.license) fail(name, 'license is required');
  const declaredEntries = Number(manifest.entries);
  const maxK = manifest.max_k === undefined || manifest.max_k === '' || manifest.max_k === 'null' ? null : Number(manifest.max_k);
  if (maxK !== null && (!Number.isInteger(maxK) || maxK < 1)) fail(name, 'max_k must be a positive integer or null');
  if (maxK !== null && maxK < 2 && manifest.single_source !== 'true') {
    fail(name, 'max_k < 2 requires single_source: true');
  }

  let doc;
  try {
    doc = JSON.parse(readFileSync(join(dir, 'entries.json'), 'utf8'));
  } catch (error) {
    fail(name, `entries.json is not valid JSON (${error.message})`);
    return { entries: 0 };
  }
  if (doc.schema !== 'snao.knowledge-pack.entries/1') fail(name, 'entries schema must be snao.knowledge-pack.entries/1');
  if (doc.pack_id !== name) fail(name, 'entries pack_id does not match the directory');
  if (!Array.isArray(doc.entries)) {
    fail(name, 'entries must be an array');
    return { entries: 0 };
  }
  if (declaredEntries !== doc.entries.length) fail(name, `manifest entries ${declaredEntries} != actual ${doc.entries.length}`);

  const counts = {};
  const seen = new Set();
  for (const [index, entry] of doc.entries.entries()) {
    const where = `entry ${index}`;
    if (!entry || typeof entry !== 'object') {
      fail(name, `${where} is not an object`);
      continue;
    }
    if (!/^sha256:[0-9a-f]{32}$/.test(String(entry.entry_id ?? ''))) fail(name, `${where} has an invalid entry_id`);
    if (seen.has(entry.entry_id)) fail(name, `${where} duplicates ${entry.entry_id}`);
    seen.add(entry.entry_id);
    const fields = CATEGORIES[entry.category];
    if (!fields) {
      fail(name, `${where} has unknown category "${entry.category}"`);
      continue;
    }
    counts[entry.category] = (counts[entry.category] ?? 0) + 1;
    const keys = Object.keys(entry.payload ?? {});
    if (keys.length !== fields.length || !fields.every((field) => keys.includes(field))) {
      fail(name, `${where} payload must have exactly ${fields.join(', ')}`);
    }
    for (const field of fields) {
      const value = entry.payload?.[field];
      if (typeof value !== 'string' || !value.trim() || value.length > 4000) {
        fail(name, `${where}.${field} must be a non-empty string under 4000 chars`);
      }
    }
    if (!Array.isArray(entry.tags)) fail(name, `${where}.tags must be an array`);
    if (typeof entry.confidence !== 'number' || entry.confidence < 0 || entry.confidence > 100) {
      fail(name, `${where}.confidence must be 0-100`);
    }
    if (entry.category === 'capabilities') {
      if (entry.k !== null) fail(name, `${where}.k must be null for capabilities`);
    } else {
      if (!Number.isInteger(entry.k) || entry.k < 1) fail(name, `${where}.k must be a positive integer`);
      if (maxK !== null && entry.k > maxK) warn(name, `${where}.k ${entry.k} is above max_k ${maxK}`);
      if (maxK !== null && maxK >= 2 && entry.k < 2) fail(name, `${where}.k must be >= 2`);
    }
    scanLeaks(name, JSON.stringify(entry.payload), where);
    scanLeaks(name, JSON.stringify(entry.tags ?? []), `${where}.tags`);
  }

  for (const [category, count] of Object.entries(manifest.counts ?? {})) {
    if ((counts[category] ?? 0) !== count) fail(name, `manifest counts.${category} ${count} != actual ${counts[category] ?? 0}`);
  }
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  if (total !== doc.entries.length) fail(name, 'counts do not add up to entries');
  for (const file of ['README.md', 'LICENSE']) {
    const body = readFileSync(join(dir, file), 'utf8');
    if (!body.trim()) fail(name, `${file} is empty`);
  }
  scanLeaks(name, readFileSync(join(dir, 'README.md'), 'utf8'), 'README.md');
  return { entries: doc.entries.length, counts, maxK };
}

const args = process.argv.slice(2);
let dirs = [];
if (args.length > 0) {
  dirs = args.map((arg) => resolve(arg));
} else {
  const knowledge = join(process.cwd(), 'knowledge');
  if (existsSync(knowledge)) {
    dirs = readdirSync(knowledge)
      .map((name) => join(knowledge, name))
      .filter((path) => statSync(path).isDirectory());
  }
}

if (dirs.length === 0) {
  console.log('no knowledge packs found; nothing to validate');
  process.exit(0);
}

let totalEntries = 0;
for (const dir of dirs) {
  const result = validatePack(dir);
  totalEntries += result.entries ?? 0;
}

for (const message of warnings) console.warn(`warn: ${message}`);
for (const message of errors) console.error(`error: ${message}`);

if (errors.length > 0) {
  console.error(`\n${errors.length} error(s) in ${dirs.length} pack(s)`);
  process.exit(1);
}

console.log(`validated ${dirs.length} pack(s), ${totalEntries} entries, no leaks detected`);
