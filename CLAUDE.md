# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

AI Chat Beat is a Manifest V3 Chrome extension that records DeepSeek chat activity. It intercepts the DeepSeek page's chat XHRs, normalizes chat requests, and sends metrics and logs to local Victoria Metrics and Victoria Logs instances. The extension is a vanilla TypeScript project built with Vite and `@crxjs/vite-plugin`; there is no frontend framework.

## Common commands

Install dependencies:

```sh
npm install
```

Build and type-check the production extension into `build/`:

```sh
npm run build
```

Build the development extension (also runs TypeScript checking):

```sh
npm run dev
```

Start the development client and reload server together:

```sh
npm run dev:all
```

The development client watches `src/` and `popup.html`, rebuilds the extension, and the development server watches `build/` and sends a WebSocket reload message to the service worker. Load `build/` as an unpacked extension from `chrome://extensions/`; refresh the extension manually if needed. The service worker, popup, and page DevTools are the relevant debugging consoles for their respective contexts.

Run the development pieces separately when needed:

```sh
npm run dev:client
npm run dev:server
```

Start the local monitoring stack (Victoria Metrics, Victoria Logs, and Grafana):

```sh
npm run start:monitor
```

This command assumes the three executables are installed and available on `PATH`. The scripts currently use Windows-specific data paths under `D:\app\`; update `package.json` for another machine or operating system. `bat/start_monitor.bat` is the Windows startup helper.

Other available scripts:

```sh
npm run preview   # preview the last Vite build
npm run fmt       # format TypeScript, JSON, CSS/SCSS, and Markdown with Prettier
npm run zip       # build and package build/ as an extension archive
```

There is currently no test runner, test directory, lint script, or single-test command configured in `package.json`. Use `npm run build` as the repository's normal compile/type-check validation unless a test setup is added.

## Architecture

- **Build and extension entry points:** `vite.config.ts` configures the CRX Vite plugin, emits to `build/`, and treats `src/contentScript/injected.ts` as an additional Rollup entry. `src/manifest.ts` defines the MV3 manifest, permissions, DeepSeek match patterns, popup, service worker, and web-accessible injected script. `popup.html` is the popup entry document.
- **Page interception:** `src/contentScript/injected.ts` runs in the page context. It wraps `XMLHttpRequest.open/send`, recognizes DeepSeek chat-completion/edit and session-fetch endpoints using `src/contentScript/util.ts`, and posts normalized interception events on `window`.
- **Content-script bridge:** `src/contentScript/index.ts` runs in the isolated content-script context. It injects the page script, forwards session-map and chat events between `window` and the extension runtime, adapts raw DeepSeek responses through `src/adapters/deepseekAdapter.ts`, and restores messages cached in page `localStorage` after an earlier runtime failure.
- **Service worker:** `src/background/index.ts` receives typed runtime messages, writes the session map to `chrome.storage.local`, reports chat data through the metric and log adapters, restores failed reports on startup, and optionally stores complete chat history when `RESOTRE_CHAT_CHROME_LOCAL` is enabled. `src/background/dev-client.ts` connects development builds to the WebSocket reload server; `src/background/util.ts` contains the optional full-history store.
- **Adapter/reporting layer:** `src/adapters/deepseekAdapter.ts` validates and converts DeepSeek payloads to `StorePayload`/session-map types. `MetricAdapter.ts` aggregates normal chat events into a short-lived `chat_requests_total` counter or sends imported data without aggregation. `logAdatper.ts` converts prompts into log records. Shared reporting, session-name lookup, error boundaries, and retry queues live in `src/adapters/utils.ts`.
- **Persistence and recovery:** page-context failures use the project `localStorage` wrapper (`src/utils/localStorage.ts`); failed metrics/logs use `chrome.storage.local`. The service worker retries persisted reports when it starts. Storage keys and message/platform contracts are centralized in `src/types/index.ts` and related type files; keep those contracts aligned when changing the bridge.
- **Popup:** `src/popup/index.ts` exports `fullChatHistory` as JSON and imports a JSON file for non-aggregated metric/log reporting. `public/storage/schema.json` documents the managed storage shape.
- **Local monitoring:** extension reports use `http://127.0.0.1:8428/api/v1/import` for Victoria Metrics and `http://127.0.0.1:9428/insert/jsonline` for Victoria Logs. `scripts/monitor-metric-reporter.ts` wraps Victoria Metrics and forwards metric-process error lines to Victoria Logs. `scripts/dev-server.ts` provides the build-watch WebSocket reload server.

## Development conventions specific to this repository

- TypeScript is strict, uses ES modules and bundler resolution, and disallows unused locals/parameters. Formatting follows `.prettierrc`: single quotes, no semicolons, trailing commas, two-space indentation, and LF endings.
- Keep messages between page context, content script, and service worker in the enums/interfaces under `src/types/` rather than introducing ad hoc string contracts.
- DeepSeek response shapes are isolated in adapters. Endpoint-specific parsing belongs in `src/adapters/deepseekAdapter.ts`; reporting and retry behavior belongs in the reporting adapters, not in the interception bridge.
- The extension's stable ID depends on the `key` in `src/manifest.ts`. Production packaging requires the corresponding private `.pem` file locally (ignored by Git); do not replace the key casually. The manifest's key is generated/managed outside normal source changes.

## 用户拒绝修改时的交互规则

当用户拒绝了某次文件修改时，你必须主动追问以下信息：

1. 拒绝的具体原因是什么？
2. 修改方向需要做哪些调整？
3. 是否需要先展示新的方案再执行？

在获得用户明确的调整意见之前，不要发起新的写入请求。
