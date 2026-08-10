import { gzipSync } from 'node:zlib';
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const distDir = resolve(import.meta.dirname, '../dist/ng-ui');
const reportDir = resolve(import.meta.dirname, '../dist/bundle-stats');
const reportFile = join(reportDir, 'ng-ui.html');

function collectFiles(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(full, acc);
    } else if (/\.(mjs|js|cjs|css)$/.test(entry.name) && !entry.name.endsWith('.map')) {
      acc.push(full);
    }
  }
  return acc;
}

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

const files = collectFiles(distDir)
  .map((file) => {
    const buffer = readFileSync(file);
    const raw = buffer.length;
    return {
      name: relative(distDir, file).replaceAll('\\', '/'),
      raw,
      gzip: gzipSync(buffer).length,
    };
  })
  .sort((a, b) => b.raw - a.raw);

const total = files.reduce((sum, f) => sum + f.raw, 0);
const totalGzip = files.reduce((sum, f) => sum + f.gzip, 0);
const top = files.slice(0, 25);

const rows = top
  .map(
    (f, i) => `
    <tr>
      <td class="num">${i + 1}</td>
      <td class="name">${f.name}</td>
      <td class="num">${formatSize(f.raw)}</td>
      <td class="num">${formatSize(f.gzip)}</td>
      <td>
        <div class="bar-wrap"><div class="bar" style="width:${((f.raw / total) * 100).toFixed(2)}%"></div></div>
      </td>
      <td class="num">${((f.raw / total) * 100).toFixed(2)}%</td>
    </tr>`,
  )
  .join('\n');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>ng-ui bundle size report</title>
<style>
  :root { --bg: #0f172a; --panel: #1e293b; --fg: #e2e8f0; --muted: #94a3b8; --accent: #14b8a6; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 32px; background: var(--bg); color: var(--fg); font-family: ui-sans-serif, system-ui, sans-serif; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .sub { color: var(--muted); margin: 0 0 24px; font-size: 13px; }
  .summary { display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap; }
  .card { background: var(--panel); border: 1px solid #334155; border-radius: 12px; padding: 16px 20px; }
  .card .value { font-size: 24px; font-weight: 600; color: var(--accent); }
  .card .label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
  table { width: 100%; border-collapse: collapse; background: var(--panel); border-radius: 12px; overflow: hidden; }
  th, td { padding: 10px 14px; text-align: left; font-size: 13px; border-bottom: 1px solid #334155; }
  th { color: var(--muted); font-weight: 500; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
  td.name { font-family: ui-monospace, monospace; word-break: break-all; }
  .bar-wrap { background: #0f172a; border-radius: 4px; height: 8px; overflow: hidden; min-width: 120px; }
  .bar { height: 100%; background: var(--accent); }
  tr:last-child td { border-bottom: none; }
  .foot { margin-top: 16px; color: var(--muted); font-size: 12px; }
</style>
</head>
<body>
  <h1>ng-ui bundle size report</h1>
  <p class="sub">@emc-dev/ng-ui — generated from dist/ng-ui</p>
  <div class="summary">
    <div class="card"><div class="value">${formatSize(total)}</div><div class="label">Total raw</div></div>
    <div class="card"><div class="value">${formatSize(totalGzip)}</div><div class="label">Total gzip</div></div>
    <div class="card"><div class="value">${files.length}</div><div class="label">Files</div></div>
  </div>
  <table>
    <thead><tr><th>#</th><th>File</th><th class="num">Raw</th><th class="num">Gzip</th><th>Share</th><th class="num">%</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="foot">Top ${top.length} of ${files.length} files. Full attribution per dependency requires source-level tooling; this report is the bundle-level baseline for the split decision.</p>
</body>
</html>
`;

mkdirSync(reportDir, { recursive: true });
writeFileSync(reportFile, html);

console.log(`ng-ui bundle analysis`);
console.log(`  total raw  : ${formatSize(total)} (${files.length} files)`);
console.log(`  total gzip : ${formatSize(totalGzip)}`);
for (const f of top.slice(0, 10)) {
  console.log(`  ${f.raw.toString().padStart(9)} B  ${formatSize(f.gzip).padStart(8)}  ${f.name}`);
}
console.log(`  report     : ${reportFile}`);
