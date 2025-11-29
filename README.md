# ProVideoEditor

ProVideoEditor est une application de montage vidéo professionnelle (Electron + React) optimisée pour des machines grand public.  
**Fonctionnalités clés :** timeline multipiste, courbes de vitesse, zoom dynamique, rendu GPU, export H.264/H.265/ProRes, OAuth2 Google, RGPD.

## Quickstart (dev)
1. `git clone https://github.com/ton-compte/provideoeditor.git`
2. `cd provideoeditor`
3. `pnpm install` (ou `npm install`)
4. `pnpm --filter electron-app dev` (lance l’app en mode dev)

## Architecture
- Frontend : React + TypeScript (Vite)
- Backend local : Node.js (Express) pour orchestration FFmpeg
- Stockage : SQLite pour métad
