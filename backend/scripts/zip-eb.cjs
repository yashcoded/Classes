/**
 * Build backend-eb-upload.zip for Elastic Beanstalk (Docker).
 * Windows Compress-Archive uses backslashes in ZIP entries; Linux unzip on EB fails.
 * This uses tar -a (Windows) or zip (macOS/Linux) so paths use forward slashes.
 */
const { execSync } = require('child_process');
const path = require('path');

const backendDir = path.join(__dirname, '..');
const outZip = path.join(backendDir, '..', 'backend-eb-upload.zip');

const required = ['Dockerfile', 'package.json', 'package-lock.json', 'dist'];
for (const name of required) {
  const p = path.join(backendDir, name);
  const fs = require('fs');
  if (!fs.existsSync(p)) {
    console.error(`Missing ${name}. Run: pnpm run build`);
    process.exit(1);
  }
}

const outQuoted = JSON.stringify(outZip);
if (process.platform === 'win32') {
  execSync(
    `tar.exe -a -c -f ${outQuoted} Dockerfile package.json package-lock.json dist`,
    { cwd: backendDir, stdio: 'inherit', shell: true },
  );
} else {
  execSync(`zip -r ${outQuoted} Dockerfile package.json package-lock.json dist`, {
    cwd: backendDir,
    stdio: 'inherit',
    shell: true,
  });
}

console.log(`Created ${outZip}`);
