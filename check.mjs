// node check.mjs — run before you open a pull request

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ID = /^[a-z][a-z0-9-]{1,38}[a-z0-9]$/;
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9a-z.-]+)?$/i;
const IMAGE = /\.(?:png|svg|webp)$/i;
const REQUIRED = ['id', 'name', 'version', 'description', 'author'];

const problems = [];
const fail = (where, what) => problems.push(`${where}: ${what}`);

const index = JSON.parse(readFileSync('index.json', 'utf-8'));
if (index.version !== 1) fail('index.json', 'version must be 1');

const listed = new Set();

for (const entry of index.plugins ?? []) {
  const m = entry.manifest ?? {};
  const where = `index.json → ${m.id ?? '?'}`;

  if (!ID.test(m.id ?? '')) { fail(where, 'id must be lowercase letters, digits and hyphens'); continue; }
  if (listed.has(m.id)) fail(where, 'listed twice');
  listed.add(m.id);

  for (const key of REQUIRED) if (!m[key]) fail(where, `${key} is missing`);
  if (!SEMVER.test(m.version ?? '')) fail(where, 'version must be semver, like 1.0.0');
  if (entry.path !== `plugins/${m.id}`) fail(where, `path should be plugins/${m.id}`);

  const dir = entry.path;
  if (!existsSync(dir)) { fail(where, `${dir} does not exist`); continue; }

  const shipped = join(dir, 'plugin.json');
  if (!existsSync(shipped)) { fail(where, 'plugin.json is missing'); continue; }

  const own = JSON.parse(readFileSync(shipped, 'utf-8'));
  if (own.id !== m.id) fail(where, `plugin.json says id "${own.id}"`);
  if (own.version !== m.version) fail(where, `plugin.json says version ${own.version}, the index says ${m.version}`);
  if (own.description !== m.description) fail(where, 'the description differs from plugin.json');

  if (!existsSync(join(dir, 'README.md'))) fail(where, 'README.md is missing');
  if (!own.main && !own.lib && !own.theme) fail(where, 'a plugin needs main, lib or theme');

  for (const key of ['main', 'lib']) {
    if (own[key] && !existsSync(join(dir, own[key]))) fail(where, `${key} names ${own[key]}, which is not there`);
  }
  if (own.icon && IMAGE.test(own.icon) && !existsSync(join(dir, own.icon))) {
    fail(where, `icon names ${own.icon}, which is not there`);
  }
  if (own.icon && !IMAGE.test(own.icon) && own.icon.length > 8) {
    fail(where, 'an icon is one or two characters, or a png, svg or webp the plugin ships');
  }
}

for (const dir of readdirSync('plugins', { withFileTypes: true })) {
  if (dir.isDirectory() && !listed.has(dir.name)) fail(`plugins/${dir.name}`, 'is not in index.json');
}

if (problems.length === 0) {
  console.log(`ok — ${listed.size} plugins`);
} else {
  for (const p of problems) console.error(`✗ ${p}`);
  process.exit(1);
}
