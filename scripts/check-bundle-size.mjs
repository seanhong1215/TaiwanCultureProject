#!/usr/bin/env node
/**
 * 首屏 bundle 體積守門員。
 *
 * 拆分前整站是單一 2 MB 的 JS，任何人加一個大套件都不會有人發現。
 * 這支腳本在 CI 建置後跑，只計算 index.html 真正會「同步下載」的
 * JS / CSS（entry + modulepreload + stylesheet），超過門檻就讓 CI 失敗。
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const DIST = 'dist';
const BUDGET_GZIP_KB = 400;

const indexHtml = path.join(DIST, 'index.html');
if (!fs.existsSync(indexHtml)) {
  console.error(`找不到 ${indexHtml}，請先執行 npm run build`);
  process.exit(1);
}

const html = fs.readFileSync(indexHtml, 'utf8');
const assets = [...new Set([...html.matchAll(/assets\/([\w.-]+\.(?:js|css))/g)].map((m) => m[1]))];

let rawBytes = 0;
let gzipBytes = 0;
const rows = [];

for (const name of assets) {
  const buffer = fs.readFileSync(path.join(DIST, 'assets', name));
  const gzip = zlib.gzipSync(buffer).length;
  rawBytes += buffer.length;
  gzipBytes += gzip;
  rows.push({ name, raw: buffer.length, gzip });
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

rows.sort((a, b) => b.gzip - a.gzip);
console.log('首屏同步載入的資產：\n');
for (const row of rows) {
  console.log(`  ${row.name.padEnd(36)} ${kb(row.raw).padStart(10)}  (gzip ${kb(row.gzip)})`);
}

const gzipKb = gzipBytes / 1024;
console.log(`\n  合計 ${kb(rawBytes)}，gzip 後 ${kb(gzipBytes)}`);
console.log(`  預算 ${BUDGET_GZIP_KB} kB (gzip)\n`);

if (gzipKb > BUDGET_GZIP_KB) {
  console.error(`✖ 首屏 bundle 超出預算 ${(gzipKb - BUDGET_GZIP_KB).toFixed(1)} kB`);
  console.error('  請確認新加入的套件是否應該改為路由層 lazy load，或加進 vite.config.js 的 manualChunks。');
  process.exit(1);
}

console.log('✔ 首屏 bundle 在預算內');
