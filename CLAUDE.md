# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tore is a desktop application built on the Electron-Egg framework. It uses Electron for the main process and Vue 3 for the renderer. The frontend communicates with the backend primarily via Socket.IO on port 7070.

## Commands

```bash
# Development
npm run dev                # Full dev mode (frontend + electron)
npm run dev-frontend       # Frontend only (Vite on port 8080)
npm run dev-electron       # Electron only

# Build
npm run build              # Full build: frontend → electron → encrypt
npm run build-w            # Windows installer (NSIS)
npm run build-m            # macOS (Intel)
npm run build-m-arm64      # macOS (ARM64)
npm run build-l            # Linux (AppImage)

# Frontend testing (run from /frontend)
cd frontend
npm run test               # Vitest
npm run test:ui            # Vitest with UI
npm run test:coverage      # Coverage report

# Native module rebuild
npm run re-sqlite          # Rebuild better-sqlite3 for current Electron
```

## Architecture

```
electron/                  # Main process (Node.js / ee-core framework)
├── main.js               # Entry: creates ElectronEgg app, registers lifecycle
├── config/               # config.default.js, config.local.js, config.prod.js
├── controller/           # Request handlers (routed by Socket.IO cmd path)
├── service/              # Business logic layer
├── db/                   # SQLite data access (better-sqlite3)
└── preload/              # Lifecycle hooks, preload bridge

frontend/                  # Renderer process (Vue 3 SPA)
├── src/
│   ├── api/              # Socket.IO API modules
│   ├── components/       # Reusable Vue components
│   ├── views/            # Page views
│   ├── router/           # Vue Router (hash mode)
│   ├── store/            # Pinia stores
│   ├── utils/            # Utilities (socket-client, cookie, local-storage)
│   ├── i18n/             # zh-CN and en-US translations
│   └── theme/            # Theme system (Less + CSS variables)
├── vite.config.js
└── vitest.config.js

cmd/                       # Electron-builder configs per platform
public/                    # Static assets served by Electron (built frontend lands in public/dist/)
```

## Frontend-Backend Communication

Socket.IO is the primary IPC mechanism. The frontend calls backend controllers via:

```javascript
import socketClient from '@/utils/socket-client';
// Invokes electron/controller/system.js → getMenus()
const result = await socketClient.invoke('controller/system/getMenus', { args });
```

The `cmd` string maps directly to `controller/<file>/<method>`. Responses are returned raw from the controller method (no wrapper envelope).

## Key Conventions

- **UI libraries**: Ant Design Vue (primary) + Element Plus (supplementary)
- **CSS**: Less with theme variables; theme switching via CSS custom properties
- **State**: Pinia stores in `frontend/src/store/modules/`
- **Routing**: Hash-based (`createWebHashHistory`); supports multi-instance tabs (same route opened multiple times with isolated state)
- **Database**: SQLite via better-sqlite3; each table has a dedicated service class in `electron/db/`
- **Config layering**: `config.default.js` → `config.local.js` (dev overrides) → `config.prod.js`
- **Vite alias**: `/@/` resolves to `frontend/src/`
- **i18n**: vue-i18n with locale files in `frontend/src/i18n/lang/`
- **Context isolation disabled**: renderer can access Node.js/Electron APIs directly (no contextBridge required)
