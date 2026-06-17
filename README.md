# sdet

An npm workspaces monorepo with three workspaces:

| Workspace | Package        | Description                                        |
| --------- | -------------- | -------------------------------------------------- |
| `shared`  | `@sdet/shared` | Common types/objects shared by the api and client. |
| `api`     | `@sdet/api`    | Node.js (Express) application serving the API.     |
| `client`  | `@sdet/client` | React application (Vite).                          |

Both `api` and `client` depend on `@sdet/shared`, so request/response
contracts live in a single source of truth.

## Requirements

- Node.js >= 20

## Install

```bash
npm install
```

This installs all workspaces and links `@sdet/shared` into `api` and `client`.

## Develop

```bash
npm run dev
```

This builds `@sdet/shared`, then runs (concurrently):

- `shared` in watch mode (`tsc -w`)
- `api` at http://localhost:3001
- `client` at http://localhost:5173 (proxies `/api/*` to the api)

Run a single workspace instead:

```bash
npm run dev:api
npm run dev:client
```

## Build

```bash
npm run build
```

Builds `shared`, then `api`, then `client` in order.
