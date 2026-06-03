# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Udemy microfrontend (MFE) learning project using **Webpack 5 Module Federation**. It is a monorepo of four independent apps with no shared root package.json or workspace tooling — each app manages its own dependencies.

| App | Framework | Role |
|---|---|---|
| `container` | React 17 + react-router-dom | Shell/host that composes all remote MFEs |
| `marketing` | React 17 + react-router-dom | Remote MFE for marketing/landing pages |
| `auth` | React 17 + react-router-dom | Remote MFE for sign-in/sign-up |
| `dashboard` | Vue 3 + PrimeVue + Chart.js | Remote MFE for dashboard (different framework) |

## Commands

All commands must be run from within the individual app directory (e.g., `cd container`).

```bash
# Start dev server (only dashboard has this wired up so far)
npm start          # webpack serve --config config/webpack.dev.js

# Production build (only dashboard has this wired up so far)
npm run build      # webpack --config config/webpack.prod.js

# Install dependencies (do this in each app separately)
npm install
```

The `container`, `marketing`, and `auth` apps have no `start` or `build` scripts yet — they need to be added with appropriate webpack config files.

## Architecture

### Module Federation
Webpack 5's Module Federation plugin is the integration mechanism. The `container` app is the **host** and loads the other three as **remotes** at runtime. Each remote exposes its root component (or router) via the Module Federation `exposes` config. The container's webpack config declares each remote with a URL pointing to its running dev server.

### Typical Port Conventions (Webpack Dev Server)
- `container`: 8080
- `marketing`: 8081
- `auth`: 8082
- `dashboard`: 8083

These are conventional for this course pattern — check each app's `webpack.dev.js` once created.

### Routing
`container` uses `react-router-dom` v5 and owns the top-level routing. Each remote MFE uses a **memory router** internally (not a browser router) so it does not conflict with the container's browser history. The container passes routing control down to a remote by rendering it at a specific path prefix.

### Cross-Framework Integration
`dashboard` uses Vue 3 while the rest use React. The container mounts Vue remotes by wrapping them in a React component that manually calls `createApp(...).mount(el)` on a ref element, and calls `app.unmount()` on cleanup.

### Shared Dependencies
To avoid bundling React/Vue twice, the Module Federation `shared` config in each `webpack.*.js` declares `react`, `react-dom`, `vue`, etc. as shared singletons. The container is typically the authoritative version provider; remotes set `eager: false`.

### Config File Pattern
Each app has a `config/` directory with at least:
- `webpack.common.js` — shared rules (Babel, CSS, file loaders)
- `webpack.dev.js` — merges common, sets `mode: 'development'`, configures `devServer` and ModuleFederationPlugin with localhost remote URLs
- `webpack.prod.js` — merges common, sets `mode: 'production'`, configures ModuleFederationPlugin with production CDN/S3 remote URLs

### Dashboard-Specific
`dashboard` uses Vue SFCs (`.vue` files), so `vue-loader` and `@vue/compiler-sfc` are required. It also uses PrimeVue component library with PrimeFlex (utility CSS) and PrimeIcons, and renders charts via `chart.js` 3.x.
