#!/usr/bin/env node
/**
 * Activate client portal access after HoneyBook deposit confirmation.
 * Usage:
 *   node scripts/activate-client.js --id <clientId> --deposit true --status active
 */
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      args[key] = val;
    }
  }
  return args;
}

function main() {
  const { id, status, deposit } = parseArgs(process.argv);
  if (!id) {
    console.error('Error: --id <clientId> is required');
    process.exit(1);
  }
  const cfgPath = path.join(process.cwd(), 'clients', 'config.json');
  if (!fs.existsSync(cfgPath)) {
    console.error('clients/config.json not found');
    process.exit(1);
  }
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  cfg.clients = cfg.clients || [];
  const idx = cfg.clients.findIndex(c => c.id === id);
  if (idx === -1) {
    console.error(`Client '${id}' not found in config`);
    process.exit(1);
  }
  const client = cfg.clients[idx];
  if (typeof deposit !== 'undefined') {
    client.depositReceived = deposit === true || deposit === 'true' || deposit === '1';
  }
  if (status) {
    client.status = status;
  }
  if (client.depositReceived && client.status === 'active') {
    client.activatedAt = new Date().toISOString();
  }
  fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
  console.log(`✅ Updated client ${id}: depositReceived=${client.depositReceived}, status=${client.status}`);
}

main();
