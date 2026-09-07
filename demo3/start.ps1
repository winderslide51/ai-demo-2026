# Lance l'API (3001) et l'UI (5173) — Ctrl+C pour arrêter les deux
if (-not (Test-Path node_modules)) { npm install }
npm run dev
