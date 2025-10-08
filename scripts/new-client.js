#!/usr/bin/env node
/**
 * EAS | TrueView Portal - Client Scaffolder
 * Usage:
 *   node scripts/new-client.js --id client-123 --name "Client Name" --email client@example.com
 *   npm run new:client -- --id client-123 --name "Client Name" --email client@example.com
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

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 60);
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function writeText(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function main() {
  const args = parseArgs(process.argv);
  const idArg = args.id || args.client || args.slug;
  const name = args.name || 'New Client';
  const email = args.email || 'client@example.com';

  if (!idArg) {
    console.error('Error: --id is required (e.g., --id acme-construction)');
    process.exit(1);
  }

  const clientId = slugify(idArg);
  const root = process.cwd();
  const clientsRoot = path.join(root, 'clients');
  const clientDir = path.join(clientsRoot, clientId);

  if (fs.existsSync(clientDir)) {
    console.error(`Client already exists: ${clientDir}`);
    process.exit(1);
  }

  // Structure
  const dirs = [
    clientDir,
    path.join(clientDir, 'images'),
    path.join(clientDir, 'images', 'raw'),
    path.join(clientDir, 'images', 'processed'),
    path.join(clientDir, 'maps'),
    path.join(clientDir, 'models'),
    path.join(clientDir, 'reports'),
    path.join(clientDir, 'videos'),
    path.join(clientDir, 'exports'),
    path.join(clientDir, '360'),
  ];

  dirs.forEach(ensureDir);

  // Ensure git tracks empty dirs
  dirs.forEach((d) => {
    try {
      const keep = path.join(d, '.gitkeep');
      if (!fs.existsSync(keep)) fs.writeFileSync(keep, '', 'utf8');
    } catch {}
  });

  // Metadata
  const meta = {
    id: clientId,
    name,
    email,
    createdAt: new Date().toISOString(),
    structure: {
      images: ['raw', 'processed'],
      maps: true,
      models: true,
      reports: true,
      videos: true,
      exports: true,
      '360': true
    }
  };
  writeJSON(path.join(clientDir, 'client.json'), meta);

  // Readme
  writeText(
    path.join(clientDir, 'README.md'),
    `# ${name} (ID: ${clientId})\n\n` +
      `This folder contains deliverables for ${name}.\n\n` +
      `Structure:\n\n` +
      `- images/\n` +
      `  - raw/\n` +
      `  - processed/\n` +
      `- maps/\n` +
      `- models/\n` +
      `- reports/\n` +
      `- videos/\n` +
      `- exports/\n` +
      `- 360/\n\n` +
      `Metadata file: client.json\n`
  );

  // Placeholder index.json for images to integrate with gallery later
  const imagesIndex = {
    thumbs: [],
    items: []
  };
  writeJSON(path.join(clientDir, 'images', 'index.json'), imagesIndex);

  console.log(`✅ Created client folder: ${clientDir}`);
  console.log('   Add images to images/processed for HD gallery, or update images/index.json');
}

main();
