import { readFileSync, writeFileSync } from 'node:fs';

const pkgPath = new URL('../dist/ng-ui/package.json', import.meta.url);
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

pkg.exports['./styles.css'] = './styles.css';
pkg.exports['./src/lib/styles/theme.css'] = './src/lib/styles/theme.css';

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
