# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Udemy microfrontend (MFE) learning project using **Webpack 5 Module Federation**. The apps live under `packages/` in a git repository, but there is **no root `package.json` or workspace tooling** — each app manages its own dependencies and is built/served independently.

| App | Framework | Role | Status |
|---|---|---|---|
| `container` | React 17 + react-router-dom v5 | Shell/host that composes the remote MFEs | ✅ wired |
| `marketing` | React 17 + react-router-dom v5 | Remote MFE for marketing/landing pages | ✅ wired |
| `auth` | React 17 (planned) | Remote MFE for sign-in/sign-up | 🚧 planned |
| `dashboard` | Vue 3 + PrimeVue + Chart.js (planned) | Remote MFE for dashboard (different framework) | 🚧 planned |

### Current status (what actually exists)

- **`container`** ✅ — host on port 8080. Has `start`/`build` scripts, all three webpack configs, and consumes the marketing remote.
- **`marketing`** ✅ — remote on port 8081. Has `start`/`build` scripts, all three webpack configs, and exposes `./MarketingApp`.
- **`auth`** 🚧 — placeholder only: `package.json` + `node_modules`. No `src/`, no `config/`, no `start`/`build` scripts.
- **`dashboard`** 🚧 — placeholder: `package.json` declares `start`/`build` scripts, but there is **no `config/` and no `src/`**, so those scripts currently fail. The Vue setup below is the intended design, not yet built.

## Commands

All commands must be run from within the individual app directory (e.g., `cd container`).

```bash
# Start dev server (works in container and marketing)
npm start          # webpack serve --config config/webpack.dev.js

# Production build (works in container and marketing)
npm run build      # webpack --config config/webpack.prod.js

# Install dependencies (do this in each app separately)
npm install
```

- `container` and `marketing` have working `start` / `build`.
- `dashboard`'s `start`/`build` scripts exist but reference `config/webpack.{dev,prod}.js` files that don't exist yet, so they fail until those configs are added.
- `auth` has no `start`/`build` scripts yet.

To run the wired MFE setup, start **both** `marketing` (8081) and `container` (8080) — the container loads marketing's `remoteEntry.js` at startup, so the marketing dev server must be running.

### Git hooks (lint + format on commit)

A dependency-free `pre-commit` hook lives in `.githooks/` and is wired via
`core.hooksPath`. On a fresh clone, enable it once:

```bash
bash scripts/setup-hooks.sh   # sets core.hooksPath=.githooks + chmods the scripts
```

On every commit it runs Prettier (`--write`) and ESLint (`--fix`) over the
**staged files of each changed package** (using that package's local config),
re-stages the fixes, and **aborts the commit** if ESLint reports an error it
cannot auto-fix. Logic lives in `scripts/format-file.sh` (shared helper).

A Claude Code `PostToolUse` hook (`.claude/settings.json` →
`.claude/hooks/format-after-edit.sh`) applies the same formatting to files Claude
edits during a session. After first creating/changing `.claude/settings.json`,
open `/hooks` once (or restart) so Claude Code reloads it.

## Architecture

### Module Federation
Webpack 5's Module Federation plugin is the integration mechanism. `container` is the **host** and loads remotes at runtime. Currently the only wired remote is `marketing`, which exposes `./MarketingApp` → `./src/bootstrap` via the `exposes` config. The container declares the remote in its webpack config:

- dev: `marketing: 'marketing@http://localhost:8081/remoteEntry.js'`
- prod: `marketing@${PRODUCTION_DOMAIN}/marketing/remoteEntry.js`

The container consumes the remote in `container/src/components/MarketingApp.js`: a React component that holds a `useRef`, and in `useEffect` calls the remote's exported `mount(ref.current)` to render the marketing app into that div. `marketing/src/bootstrap.js` exports `mount(el)` (and auto-mounts to `#_marketing-dev-root` when run standalone in development).

Remotes for `auth` and `dashboard` are planned but not yet declared/built.

### Port Conventions (Webpack Dev Server)
- `container`: 8080 (active)
- `marketing`: 8081 (active)
- `auth`: 8082 (planned)
- `dashboard`: 8083 (planned)

### Dev-server cross-origin (CORP) gotcha
`webpack-dev-server@5` stamps responses with `Cross-Origin-Resource-Policy: same-origin` by default. Because the container (`:8080`) loads the remote's `remoteEntry.js` from a different origin (`:8081`), the browser blocks it and webpack reports `ScriptExternalLoadError` / "Loading script failed" — even though the file is served fine (HTTP 200).

Fix already in place in `marketing/config/webpack.dev.js` `devServer.headers`:

```js
headers: {
  'Access-Control-Allow-Origin': '*',
  'Cross-Origin-Resource-Policy': 'cross-origin',
},
```

Any new remote dev server (`auth`, `dashboard`) needs the same headers.

### Routing
`container` uses `react-router-dom` v5 and owns top-level routing. **Currently** `marketing/src/App.js` renders a `BrowserRouter` internally. The intended next step (per the course) is to switch remotes to a **memory/history router** so they don't conflict with the container's browser history — this is **planned, not yet implemented**.

### Shared Dependencies
Each `webpack.*.js` sets `shared: packageJson.dependencies` — i.e. it shares the app's entire `dependencies` object (react, react-dom, react-router-dom, @material-ui/*). It does **not** currently use curated per-package singletons with explicit `singleton: true` / `eager: false` / `requiredVersion` flags. If singleton/version conflicts arise, switching to explicit `shared: { react: { singleton: true }, ... }` is the more typical pattern.

### Cross-Framework Integration (planned)
`dashboard` is intended to use Vue 3 while the rest use React. The plan is for the container to mount the Vue remote by wrapping it in a React component that calls `createApp(...).mount(el)` on a ref element and `app.unmount()` on cleanup. Not yet built.

### Config File Pattern
Each wired app has a `config/` directory with:
- `webpack.common.js` — shared rules (Babel via `babel-loader` with `@babel/preset-react` + `@babel/preset-env`). For `container`, `html-webpack-plugin` is registered here; for `marketing` it's registered inline in the dev/prod configs.
- `webpack.dev.js` — merges common, `mode: 'development'`, `devServer` config + `ModuleFederationPlugin` with localhost remote URLs.
- `webpack.prod.js` — merges common, `mode: 'production'`, `output.filename: '[name].[contenthash].js'` + `ModuleFederationPlugin` with the production domain (env-driven via `PRODUCTION_DOMAIN`).

### Dashboard-Specific (planned)
When built, `dashboard` will use Vue SFCs (`.vue` files), requiring `vue-loader` and `@vue/compiler-sfc`. It also pulls in PrimeVue (with PrimeFlex utility CSS and PrimeIcons) and renders charts via `chart.js` 3.x. These deps are already in `dashboard/package.json`, but no source/config exists yet.
