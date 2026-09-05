#!/usr/bin/env node
/**
 * import 路徑大小寫檢查。
 *
 * 開發環境是 Windows（檔案系統不分大小寫），CI 與正式環境是 Linux（分大小寫）。
 * 因此 import "@/frontend/components/DatePicker/DatePicker.scss" 在本機可以跑，
 * 但實際目錄是 Datepicker/，到了 CI 就會建置失敗 —— 而且本機完全重現不出來。
 *
 * 這支腳本逐段比對 import 路徑與磁碟上的真實名稱，在本機就能抓出同樣的問題。
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');

/** 遞迴列出目錄下的所有檔案 */
const walk = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
};

/** 逐段檢查路徑的大小寫是否與磁碟完全一致 */
const existsExact = (target) => {
  let current = ROOT;
  for (const segment of path.relative(ROOT, target).split(path.sep)) {
    let entries;
    try {
      entries = fs.readdirSync(current);
    } catch {
      return false;
    }
    if (!entries.includes(segment)) return false;
    current = path.join(current, segment);
  }
  return true;
};

/** vite.config.js 中 resolve.alias 的對應 */
const resolveSpecifier = (spec, fromFile) => {
  if (spec.startsWith('@/')) return path.join(SRC, spec.slice(2));
  if (spec.startsWith('.')) return path.resolve(path.dirname(fromFile), spec);
  return null; // node_modules，不在檢查範圍
};

const CANDIDATE_SUFFIXES = ['', '.js', '.jsx', '.mjs', '.json', '.scss', '.css', '/index.js', '/index.jsx'];

const problems = [];

for (const file of walk(SRC).filter((f) => /\.(js|jsx|mjs)$/.test(f))) {
  const code = fs.readFileSync(file, 'utf8');
  const importPattern = /(?:from\s*|import\s*|import\(\s*)['"]([^'"]+)['"]/g;
  let match;

  while ((match = importPattern.exec(code)) !== null) {
    const spec = match[1];
    const base = resolveSpecifier(spec, file);
    if (!base) continue;

    const resolved = CANDIDATE_SUFFIXES.map((suffix) => base + suffix).find((p) => fs.existsSync(p));

    if (!resolved) {
      problems.push({ file, spec, reason: '找不到對應檔案' });
    } else if (!existsExact(resolved)) {
      problems.push({ file, spec, reason: '大小寫與磁碟上的實際名稱不符' });
    }
  }
}

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

if (problems.length === 0) {
  console.log('✔ 所有 import 路徑都與磁碟上的實際名稱一致');
} else {
  console.error(`✖ 發現 ${problems.length} 個問題（在 Linux / CI 上會導致建置失敗）：\n`);
  for (const { file, spec, reason } of problems) {
    console.error(`  ${rel(file)}`);
    console.error(`    import "${spec}"  ->  ${reason}\n`);
  }
  process.exit(1);
}
