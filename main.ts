// Hearth — hand-in program for the make.fun household-budget bounty.
//
// Node 22, standard library only. It takes this repository's app/ and
// screenshots/ folders, copies them into the output directory, and writes
// dossier.json there with the vendored make.fun library — the summary the
// judge reads (screenshots, first-load files and bytes, and the source).
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { buildDossier } from './vendor/makefun-frontend.ts';
import { copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// The scorer's own caps, from the kit's gate: app/ holds at most 993
// files and directories and 16 MiB; at most 4 screenshots of 256 KiB;
// the dossier text is capped at 160 KiB. We check before we hand in,
// so a too-big entry fails here instead of at the gate.
const APP_MAX_ENTRIES = 993;
const APP_MAX_BYTES = 16 * 1024 * 1024;
const SHOTS_MAX = 4;
const SHOTS_MAX_BYTES = 256 * 1024;
const TEXT_MAX_BYTES = 163840;

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

function fail(message) {
  throw new Error('hearth main.ts: ' + message);
}

// Walk a directory and return every entry below it, files and folders,
// with their sizes. Symbolic links are refused outright: the gate only
// accepts plain files and directories.
function walk(dir, base) {
  const found = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const rel = base ? base + '/' + name : name;
    const info = lstatSync(path);
    if (info.isSymbolicLink()) fail('symbolic link not allowed: ' + rel);
    if (info.isDirectory()) {
      found.push({ rel, bytes: 0, dir: true });
      found.push(...walk(path, rel));
    } else if (info.isFile()) {
      found.push({ rel, bytes: info.size, dir: false });
    } else {
      fail('not a plain file or directory: ' + rel);
    }
  }
  return found;
}

function copyTree(srcDir, destDir) {
  const entries = walk(srcDir, '');
  const files = entries.filter((e) => !e.dir);
  const totalBytes = files.reduce((sum, f) => sum + f.bytes, 0);
  if (entries.length > APP_MAX_ENTRIES) {
    fail('app/ has ' + entries.length + ' entries, over the cap of ' + APP_MAX_ENTRIES);
  }
  if (totalBytes > APP_MAX_BYTES) {
    fail('app/ is ' + totalBytes + ' bytes, over the cap of ' + APP_MAX_BYTES);
  }
  mkdirSync(destDir, { recursive: true });
  for (const file of files) {
    const dest = join(destDir, file.rel);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(join(srcDir, file.rel), dest);
  }
  return { files: files.length, bytes: totalBytes };
}

function checkScreenshots(dir) {
  if (!existsSync(dir)) return { files: 0 };
  const names = readdirSync(dir).filter((n) => !n.startsWith('.'));
  if (names.length === 0 || names.length > SHOTS_MAX) {
    fail('screenshots/ must hold 1 to ' + SHOTS_MAX + ' images, found ' + names.length);
  }
  for (const name of names) {
    const path = join(dir, name);
    if (!statSync(path).isFile()) fail('screenshot is not a file: ' + name);
    if (statSync(path).size > SHOTS_MAX_BYTES) {
      fail('screenshot over 256 KiB: ' + name);
    }
    if (!/^[A-Za-z0-9._-]+$/.test(name) || name.startsWith('-')) {
      fail('screenshot name not allowed: ' + name);
    }
  }
  return { files: names.length };
}

const appSrc = join(repoRoot, 'app');
const shotsSrc = join(repoRoot, 'screenshots');
if (!existsSync(join(appSrc, 'index.html'))) fail('app/index.html is missing');

mkdirSync(outDir, { recursive: true });
const app = copyTree(appSrc, join(outDir, 'app'));
const shots = checkScreenshots(shotsSrc);
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
for (const name of readdirSync(shotsSrc)) {
  if (name.startsWith('.')) continue;
  copyFileSync(join(shotsSrc, name), join(outDir, 'screenshots', name));
}

const dossier = buildDossier(outDir, {
  text_max_bytes: TEXT_MAX_BYTES,
  screenshots: { max: SHOTS_MAX, max_bytes: SHOTS_MAX_BYTES },
  app_max_files: APP_MAX_ENTRIES,
  app_max_bytes: APP_MAX_BYTES,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

console.log(
  'hearth: handed in ' + app.files + ' app files (' + app.bytes + ' bytes), ' +
  shots.files + ' screenshots, dossier ' + Buffer.byteLength(dossier, 'utf8') + ' bytes -> ' + outDir,
);
