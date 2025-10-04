#!/usr/bin/env node
// Simple local dev runner: Frontend (Next) + Gateway BFF in parallel
const { spawn } = require('child_process');

function run(cmd, args, name) {
  const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], shell: true });
  const prefix = '[' + name + ']';
  p.stdout.on('data', (d) => process.stdout.write(prefix + ' ' + d));
  p.stderr.on('data', (d) => process.stderr.write(prefix + ' ' + d));
  p.on('close', (code) => console.log(prefix + ' exited with code ' + code));
  return p;
}

const frontend = run('npx', ['next', 'dev', 'apps/frontend', '-p', '3000'], 'frontend');
const bff = run('npm', ['run', 'dev', '-w', 'apps/gateway-bff'], 'gateway-bff');

function shutdown() {
  frontend.kill();
  bff.kill();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
