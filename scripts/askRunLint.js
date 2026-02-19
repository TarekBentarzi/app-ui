#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const pkgPath = path.join(process.cwd(), 'package.json');
let pkg;
try {
  pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
} catch (e) {
  console.log('No package.json found in this package.');
  process.exit(0);
}

const lintScripts = Object.keys(pkg.scripts || {}).filter((k) => k.startsWith('lint'));
if (lintScripts.length === 0) {
  console.log('Tests finished. No lint script found in this package.');
  console.log('Suggestion: add a `lint` or `lint:*` script (e.g. `lint:eslint` or `lint:typescript:console`).');
  process.exit(0);
}

const scriptToRun = lintScripts.includes('lint') ? 'lint' : lintScripts[0];

if (!process.stdin.isTTY) {
  console.log(`Tests finished. To run the linter, run: npm run ${scriptToRun}`);
  process.exit(0);
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question(`Tests finished. Do you want to run \`npm run ${scriptToRun}\` now? (y/N) `, (answer) => {
  rl.close();
  if (answer.trim().toLowerCase().startsWith('y')) {
    console.log(`Running npm run ${scriptToRun}...`);
    const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', scriptToRun], { stdio: 'inherit' });
    child.on('exit', (code) => process.exit(code));
  } else {
    console.log('Skipping lint.');
    process.exit(0);
  }
});
