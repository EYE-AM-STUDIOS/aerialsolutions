# Clients Folder

This directory stores per-client deliverables for the EDIS TrueView Portal.

Scaffold a new client:

- Using npm script:
  npm run new:client -- --id acme-construction --name "ACME Construction" --email pm@acme.com

- Directly with Node:
  node scripts/new-client.js --id acme-construction --name "ACME Construction" --email pm@acme.com

Structure created per client:

- images/
  - raw/
  - processed/
  - index.json (optional metadata for gallery)
- maps/
- models/
- reports/
- videos/
- exports/
- 360/
- client.json (basic metadata)

Notes:
- Place final high-res images in images/processed for the dashboard gallery.
- You can customize images/index.json to control captions and ordering.
- The script also adds .gitkeep files so empty directories are tracked in Git.
