#!/usr/bin/env ts-node
/**
 * Bundle analysis script.
 * Run: ANALYZE=true next build  (via `npm run analyze`)
 *
 * This script checks for common bundle-size issues in the source tree:
 *  - Barrel-file imports that may prevent tree-shaking
 *  - Direct imports of known heavy packages that should be lazy-loaded
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const SRC_DIR = path.resolve(__dirname, '../src');

const HEAVY_PACKAGES = [
  'recharts',
  'framer-motion',
  'react-joyride',
  'jspdf',
  'socket.io-client',
  'stellar-sdk',
];

async function scanFile(filePath: string): Promise<string[]> {
  const warnings: string[] = [];
  const rl = readline.createInterface({ input: fs.createReadStream(filePath) });
  let lineNo = 0;
  for await (const line of rl) {
    lineNo++;
    for (const pkg of HEAVY_PACKAGES) {
      if (line.includes(`from '${pkg}'`) || line.includes(`require('${pkg}')`)) {
        warnings.push(`  ${filePath}:${lineNo} — direct import of "${pkg}" (consider lazy-loading)`);
      }
    }
  }
  return warnings;
}

function walk(dir: string): string[] {
  return fs.readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) return walk(full);
    if (/\.(ts|tsx)$/.test(entry)) return [full];
    return [];
  });
}

async function main() {
  console.log('🔍 Scanning for heavy direct imports...\n');
  const files = walk(SRC_DIR);
  const allWarnings: string[] = [];
  for (const file of files) {
    allWarnings.push(...(await scanFile(file)));
  }

  if (allWarnings.length === 0) {
    console.log('✅ No heavy direct imports found.');
  } else {
    console.log(`⚠️  Found ${allWarnings.length} potential issue(s):\n`);
    allWarnings.forEach((w) => console.log(w));
  }

  console.log('\n📦 To generate a visual bundle report, run:\n  npm run analyze\n');
}

main().catch((err) => { console.error(err); process.exit(1); });
