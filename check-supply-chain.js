const fs = require('fs');
const path = require('path');

const root = process.cwd();
const lockPath = path.join(root, 'pnpm-lock.yaml');
const packageJsonGlobs = [
  path.join(root, 'package.json'),
  path.join(root, 'backend', 'package.json'),
  path.join(root, 'mobile', 'package.json'),
];

const blockedLockPatterns = [
  { pattern: /(^|\s)axios@1\.14\.1(?::|\s|$)/m, label: 'axios@1.14.1' },
  { pattern: /(^|\s)plain-crypto-js@/m, label: 'plain-crypto-js (any version)' },
];

const blockedManifestPatterns = [
  { pattern: /"axios"\s*:\s*"[^"]*1\.14\.1[^"]*"/m, label: 'axios@1.14.1 in package.json' },
  { pattern: /"plain-crypto-js"\s*:/m, label: 'plain-crypto-js in package.json' },
];

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (_error) {
    return '';
  }
}

const findings = [];

const lockContent = readFileSafe(lockPath);
for (const { pattern, label } of blockedLockPatterns) {
  if (pattern.test(lockContent)) {
    findings.push(`${label} found in pnpm-lock.yaml`);
  }
}

for (const pkgPath of packageJsonGlobs) {
  const content = readFileSafe(pkgPath);
  for (const { pattern, label } of blockedManifestPatterns) {
    if (pattern.test(content)) {
      findings.push(`${label} in ${path.relative(root, pkgPath)}`);
    }
  }
}

if (findings.length > 0) {
  console.error('Supply-chain guard failed:\n- ' + findings.join('\n- '));
  process.exit(1);
}

console.log('Supply-chain guard passed: no blocked axios/plain-crypto-js signatures found.');
