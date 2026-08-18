# Bodies of work (git-evidenced)

Each entry maps to one `resume.json` `work[]` employer. Use outcome lines as tailoring source material; keep JSON dates and metrics as canonical.

---

## defi.app

### `defi-polymarket` — Polymarket and prediction markets

**Employer:** defi.app  
**Repos:** `defi-app-api-backend`  
**Paths:** `app/providers/polymarket/`, `app/services/prediction/`  
**Active:** 2026-01 to 2026-02 (733 total commits in api-backend, 2025-06 to 2026-02)

**Outcomes (reframable bullets):**

- Built Polymarket integration as a first-class execution provider: deposit quotes, Relay-based deposits, provider abstraction, and test coverage.
- Added Polymarket CLOB proxy endpoints so client flows could reach exchange APIs through a controlled backend surface.
- Shipped prediction-market user preferences: starred tags, skipped markets, and persistence (`user_to_prediction_market_tag`).
- Hardened prediction-market operations: market-close notifications, enrollment limits, and latency fixes on the notification path.

**Evidence (representative commits):**

| SHA | Subject |
|-----|---------|
| `0479165e3` | Adds Polymarket integration |
| `470486c2f` | Refactors Polymarket integration as provider |
| `73dfc3eaf` | Adds Polymarket deposit quote endpoint |
| `7df492b15` | Adds Polymarket deposit via Relay |
| `1df81c821` | Adds Polymarket CLOB proxy endpoints |
| `b6286258f` | Adds Polymarket market tracking |
| `f8a387a17` | Adds Polymarket tag tracking |
| `3c8dda215` | chore: prediction markets (#6616) |
| `8bc60cc0a` | fix(prediction): harden market close notifications |
| `fd82ad917` | fix(prediction): reduce polymarket notification path latency |

**JD keywords:** Polymarket, CLOB, prediction market, market close, partner API, proxy endpoints, Relay, integrator

---

### `defi-bundler-4337` — ERC-4337 bundler and UserOperation lifecycle

**Employer:** defi.app  
**Repos:** `defi-app-api-backend`  
**Paths:** `app/services/bundler/` (218 of your touched paths)  
**Active:** 2025-12 to 2026-02

**Outcomes:**

- Operated internal ERC-4337 bundler infrastructure: UserOp submission, receipt retrieval, MEV-protection paths, and production error classification.
- Added `eth_getUserOperationReceipt` endpoint and improved receipt retrieval with MEV-aware handling.
- Tuned bundler latency (RPC `getLogs`, client deduplication, logging verbosity) and nonce mitigation on Base.

**Evidence:**

| SHA | Subject |
|-----|---------|
| `3f5220137` | Adds eth_getUserOperationReceipt endpoint |
| `989628ca9` | Improves userOp receipt retrieval with MEV protection |
| `c4836e8ab` | Improves userOp receipt retrieval and tx handling |
| `a0bd5d423` | chore: latency optimisation |
| `efbc339ec` | feat: base nonce mitigation (#6368) |
| `3ddee39ba` | Reduces verbosity of bundler logs |

**JD keywords:** ERC-4337, bundler, UserOperation, EntryPoint, MEV, sponsorship, account abstraction

---

### `defi-solana-execution` — Solana paymaster, Jito, Jupiter

**Employer:** defi.app  
**Repos:** `defi-app-api-backend`  
**Paths:** `app/services/solana/`, route/swap fee logic  
**Active:** 2026-01 to 2026-02

**Outcomes:**

- Owned Solana sponsorship and paymaster loss detection, including Jito-mode Jupiter fee calculation and ATA/CPI validation.
- Restored and maintained Solana sponsorship flows alongside EVM execution.
- Treasury monitoring and paymaster close-refund accounting.

**Evidence:**

| SHA | Subject |
|-----|---------|
| `75c3958c7` | chore: restore solana sponsorship (#6579) |
| `8d4e7e309` | Improves Solana paymaster loss detection |
| `ad46df292` | Refines Jito mode Jupiter fee calculation |
| `52cd37944` | Enhances CPI ATA creation validation |
| `22fb02418` | fix(sol): account for paymaster close refunds |

**JD keywords:** Solana, Jito, Jupiter, paymaster, sponsorship, ATA, cross-chain

---

### `defi-route-providers` — Multi-provider routing and execution

**Employer:** defi.app  
**Repos:** `defi-app-api-backend`  
**Paths:** `app/services/route/`, `app/services/simulation/`, `app/services/caching/`  
**Active:** 2025-12 to 2026-02

**Outcomes:**

- Standardized external swap and bridge providers behind shared route/execution APIs (aligns with JSON: LiFi, Jupiter, 1inch, Odos, Mayan, LayerZero, Relay).
- Extended execution surface for prediction markets, Crossmint buys, and cross-chain swap labelling.
- Pre-confirm simulations and post-action validation for safer execution paths.

**Evidence:**

| SHA | Subject |
|-----|---------|
| `57cd2740c` | feat: after-action preconfirm simulations (#6625) |
| `7df492b15` | Adds Polymarket deposit via Relay |
| `d106811b7` | chore: adds Crossmint buy label and cross chain swap flag (#6649) |
| `0526b9c33` | Refactors label handling for swap quotes |

**JD keywords:** routing, execution, simulation, Relay, Crossmint, provider integration, quote API

---

### `defi-revenue-ops` — Revenue share and operational reliability

**Employer:** defi.app  
**Repos:** `defi-app-api-backend`  
**Paths:** `app/services/revenue-share/`, referral emitters  
**Active:** 2025-12 to 2026-03

**Outcomes:**

- Built referral revenue ledger and automated payout flows.
- Revenue-share bridge minimums and on-chain claims handling.
- Outage alert throttling for production operations.

**Evidence:**

| SHA | Subject |
|-----|---------|
| `bdbbd0078` | feat: implement referral revenue ledger emitters (#6340) |
| `cc2b9dc80` | feat: dev 5592 automate referral revenue payout (#6373) |
| `7877eebc5` | fix(revenue-share): use on-chain claims |
| `e2c5ba99d` | feat: Outage Alerts: Throttle alert frequency (#6666) |

**JD keywords:** revenue, referral, ledger, operations, alerts

---

### `defi-recovery` — Fund recovery SPA

**Employer:** defi.app  
**Repos:** `recovery`  
**Paths:** `src/lib/`, bundler URL construction  
**Active:** 2025-12 to 2026-03 (26 commits)

**Outcomes:**

- Built a standalone fund-recovery SPA with dynamic bundler URL construction and UserOperation reliability improvements.
- Added multi-chain support (Optimism, Polygon, HyperEVM, Abstract) and production gas tuning.

**Evidence:**

| SHA | Subject |
|-----|---------|
| `08a8c3d` | Dynamically constructs bundler URL |
| `c1dde73` | Improves user operation reliability |
| `6813a57` | Adds support for Optimism, Polygon, and HyperEvm |
| `099f45b` | chore: add abstract |

**JD keywords:** recovery, bundler, UserOperation, multi-chain, WalletConnect

---

### `defi-execution-general` — High-volume execution (JSON-aligned)

**Employer:** defi.app  
**Note:** Volume and success-rate metrics live in `resume.json` only. Git corpus supports *themes* below; do not invent new numbers.

**Corpus themes that support JSON claims:** bundler (`defi-bundler-4337`), route providers (`defi-route-providers`), Solana (`defi-solana-execution`), Polymarket (`defi-polymarket`).

---

## Biconomy

### `bico-abstractjs` — @biconomy/abstractjs SDK

**Employer:** Biconomy  
**Repos:** `abstractjs`  
**Paths:** `src/sdk/clients/`, `src/sdk/account/`, `src/sdk/modules/smartSessionsValidator/`  
**Active:** 2024-03 to 2025-06 (242 commits)

**Outcomes:**

- Designed and built AbstractJS from scaffolding through production: viem-inspired clients, bundler/paymaster modules, chain-agnostic tests, and size/coverage CI.
- Shipped MEE (multi-chain execution) decorators, fusion gas handling, ecosystem integration, and multichain smart sessions.
- EIP-7702 support and explorer error handling for production integrators.

**Evidence:**

| SHA | Subject |
|-----|---------|
| `848761c5` | chore: add scaffolding |
| `ba5c590c` | feat: bundler first draft (#16) |
| `d5cfd884` | chore: paymaster first draft (#19) |
| `ddf74c6a` | feat: 7702 tidy (#69) (#70) |
| `133805ce` | feat: multichain sessions (#73) |
| `13f3fef1` | feat: ecosystem integration |

**JD keywords:** TypeScript SDK, viem, smart account, ERC-4337, modular clients, npm, abstractjs

---

### `bico-client-sdk` — biconomy-client-sdk (predecessor)

**Employer:** Biconomy  
**Repos:** `biconomy-client-sdk`  
**Paths:** `packages/account/`, `packages/bundler/`, `packages/paymaster/`, `packages/modules/`  
**Active:** 2023-12 to 2024-10 (357 commits)

**Outcomes:**

- Led SDK package evolution: multichain testing, paymaster/bundler clients, smart sessions, Nexus imports, and testing framework.
- Improved bundler URL handling, gas estimate endpoints, and default wait intervals for production integrators.
- Removed legacy node client paths and refactored package boundaries.

**Evidence:**

| SHA | Subject |
|-----|---------|
| `317f986b` | Resolved DEVX-388 (early ownership) |
| `ecc86e2c` | Multichain testing support |
| `678a5ccc` | feat: testing framework (#561) |
| `1a85cb67` | chore: add paymaster (#566) |
| `b2a3e28c` | chore: test support for smart sessions (#565) |
| `4d418313` | Feat/remove node client (#588) |

**JD keywords:** account abstraction, SDK, bundler, paymaster, smart sessions, testing

---

### `bico-gas-estimations` — EntryPoint gas estimations package

**Employer:** Biconomy  
**Repos:** `entry-point-gas-estimations`  
**Active:** 2025-01 (22 commits)

**Outcomes:**

- Built `@biconomy/gas-estimations`: simulation and estimation of ERC-4337 UserOperation gas limits with state-override aware RPC usage.
- Modernised tooling (ESM/CJS, Biome, Codecov, CI test suite).

**Evidence:**

| SHA | Subject |
|-----|---------|
| `e094443` | chore: add full suite of tests too cicd |
| (modernise tooling PR #51) | chore: modernise tooling — ESM/CJS, Biome, Codecov |

**JD keywords:** gas estimation, UserOperation, ERC-4337, simulation, viem

---

### `bico-aa-errors` — Live SDK error catalog

**Employer:** Biconomy  
**Repos:** `aa-errors`  
**Paths:** `docs/errors.json`  
**Active:** 2024-03 to 2024-10 (31 commits)

**Outcomes:**

- Maintained centralized AA error documentation consumed at runtime by the SDK for structured troubleshooting (regex-matched KnownErrors).
- Expanded error coverage as new failure modes appeared in production integrator flows.

**Evidence:**

| SHA | Subject |
|-----|---------|
| `2c1f875` | chore: add missing errors |
| Multiple | Update errors.json (2024-05 through 2024-08) |

**JD keywords:** error handling, SDK DX, troubleshooting, structured errors, documentation

---

### `bico-docs` — Integrator documentation (Docusaurus + Vocs)

**Employer:** Biconomy  
**Repos:** `docs`, `documentation`, `abstract-docs`  
**Active:** 2024-02 to 2025-05 (~180 commits combined)

**Outcomes:**

- Authored Biconomy Docusaurus docs: sessions, signers (EOA, Safe), bundler API, distributed sessions, DAN helpers.
- Migrated and extended Vocs documentation: passkey tutorials, smart sessions enable mode, getUserOperationReceipt, AbstractJS SDK reference.
- Partner-facing tutorials for gasless transactions, batch transactions, and fusion demos.

**Evidence:**

| SHA | Subject |
|-----|---------|
| `e621abb` | chore: distributed sessions (docs) |
| `7f0d41e` | chore: add e2e tests to cicd (documentation) |
| `9b2eea1` | feat: v2 migration fix (abstract-docs) |
| `1b52006` | chore: fix batched router contract address (#342) |

**JD keywords:** technical writing, integrator docs, tutorials, sessions, passkeys, developer experience

---

### `bico-sessions-7702` — Smart sessions, fusion, EIP-7702

**Employer:** Biconomy  
**Repos:** `abstractjs`, `ecosystem`, `examples`  
**Active:** 2025-02 to 2025-05

**Outcomes:**

- Smart sessions enable mode, composability modules, and test-network (ecosystem) deployments for integrator validation.
- Fusion and smart-sessions Next.js demos; on-chain flow checks in examples repo.

**Evidence:**

| SHA | Subject |
|-----|---------|
| `26b5234` | chore: smart sessions enable mode (ecosystem) |
| `8fe0f51` | feat: fusion demo (#8) (examples) |
| `ddf74c6a` | feat: 7702 tidy (abstractjs) |

**JD keywords:** smart sessions, EIP-7702, fusion, composability, demo apps

---

### `bico-use-aa` — React hooks for AA

**Employer:** Biconomy  
**Repos:** `use-aa`  
**Paths:** `src/hooks/`, `src/actions/`  
**Active:** 2024-02 to 2024-08 (53 commits)

**Outcomes:**

- Built and shipped `useAA` React hooks and Storybook surfaces for gas estimation, sponsorship, and distributed sessions.
- Published gh-pages demos and semver releases for frontend integrators.

**Evidence:**

| SHA | Subject |
|-----|---------|
| `817dcaa` | feat: distributed sessions (#26) |
| `95c5e7c` | chore: sponsorship (#27) |
| `e88603a` | feat: gas estimate |

**JD keywords:** React, hooks, frontend SDK, Storybook, sponsorship

---

### `bico-examples-ecosystem` — Examples and test network

**Employer:** Biconomy  
**Repos:** `examples`, `ecosystem`  
**Active:** 2024-11 to 2025-05

**Outcomes:**

- Kept quickstart and fusion examples current with SDK migrations.
- Built test-network (`ecosystem`) package for Nexus deployments, composability modules, and vitest coverage.

**Evidence:**

| SHA | Subject |
|-----|---------|
| `f0391ae` | feat: first draft complete (ecosystem) |
| `5f5bc03` | chore: bring examples up to date (#9) |

**JD keywords:** examples, quickstart, testnet, integrator onboarding

---

### `bico-nexus` — Nexus contracts (limited)

**Employer:** Biconomy  
**Repos:** `nexus`  
**Active:** 2024-08 to 2024-12 (11 commits)

**Outcomes:**

- Hardhat deploy script fixes and dynamic deploy support; dependency maintenance only.

**Evidence:** `0abeca0` feat/dynamic-deploy (#146)

**Note:** Low authored volume; prefer abstractjs/client-sdk themes for Nexus-adjacent roles.

---

## Enso Finance

### `enso-link-backend` — Shortcuts Link GraphQL API

**Employer:** Enso Finance  
**Repos:** `link-backend`  
**Paths:** `src/shortcuts/router/`, `src/metadata/`, `src/positions/`  
**Active:** 2023-04 to 2023-11 (169 commits)

**Outcomes:**

- Built and operated the Link Backend GraphQL API for optimal token-to-token routes across the Shortcuts registry.
- Metadata pipelines: base tokens, DeFi tokens, positions, underlying checks, and cache-manager performance work.
- Admin tooling, sanitisation endpoints, and cron/verification fixes for production routing quality.

**Evidence:**

| SHA | Subject |
|-----|---------|
| `94792c2` | cache-manager (#287) |
| `7681dc4` | Check underlyings |
| `5c12ef7` | Sanitise endpoint (#272) |
| `d73de0f` | Admin (#278) |

**JD keywords:** GraphQL, routing, DeFi, metadata, API, shortcuts

---

### `enso-shortcuts-sdk` — Shortcuts TypeScript SDK

**Employer:** Enso Finance  
**Repos:** `shortcuts-sdk`  
**Paths:** `src/`, `src/wallet/simulation/`, `src/translator/`  
**Active:** 2022-06 to 2023-06 (113 commits)

**Outcomes:**

- SDK features: balances service, wallet simulation, transfer/withdrawal flows, human-readable indices, and translator utilities.
- Documentation generation for SDK classes and modules.

**Evidence:**

| SHA | Subject |
|-----|---------|
| `5d01660` | Balances service (#175) |
| `c0ea6fe` | Feature/transfer from >transfer (#152) |
| `f403e5f` | Human readable indices (#145) |

**JD keywords:** TypeScript SDK, DeFi shortcuts, simulation, wallet integration

---

### `enso-subgraph` — Graph indexing

**Employer:** Enso Finance  
**Repos:** `enso-subgraph`  
**Note:** Zero authored commits in local clone. Cite `resume.json` Enso bullet on Graph Protocol indexing only; do not add git-evidenced bullets from this repo.

---

## CoinFLEX

### `coinflex-markets` — Markets / trader frontend (`coinflex_trader`)

**Employer:** CoinFLEX  
**Repos:** `markets` (Bitbucket: `coinflex` org; package name `coinflex_trader`)  
**Paths (expected layout):** `src/components/`, `src/store/`, `src/services/`, `src/providers/`  
**Scan note:** Local checkout at `Workspace/markets` has an **empty `.git` directory** and **no source files** (only config, `yarn.lock`, and `bitbucket-pipelines.yml` remain). **No commit SHAs available.** Evidence below is from surviving repo metadata only; aligns with `resume.json` CoinFLEX role (2019–2021).

**Outcomes (reframable bullets; do not invent metrics):**

- Worked on CoinFLEX's React/TypeScript **markets and trader UI** (`coinflex_trader`), deployed to `stgmarkets.coinflex.com`, `trade.coinflex.com`, and related CoinFLEX S3/CloudFront environments.
- Stack included **TradingView** charting (private `coinflex/tradingview` dependency), Redux + redux-saga, react-intl i18n, Cypress e2e tests, and Storybook component work.
- CI/CD via Bitbucket Pipelines: build, test (`yarn test`), translation pull, and staged/production deploys to CoinFLEX trading domains.

**Evidence (non-git):**

| Source | Detail |
|--------|--------|
| `yarn-error.log` npm manifest | Package `coinflex_trader` v1.0.1; React 16, TypeScript, TradingView, antd, redux-saga |
| `bitbucket-pipelines.yml` | Deploy targets: `stgmarkets.coinflex.com`, `trade.coinflex.com`, `stgtrade.coinflex.com`, `dev*.coinflex.com` |
| Directory layout | `src/components`, `store`, `services`, `schemas`, `cypress`, `.storybook` (trading-app structure) |

**JD keywords:** trading UI, exchange, derivatives, TradingView, order book, markets frontend, production CI/CD, CoinFLEX

**Tailoring guidance:** Use to strengthen exchange/trading-domain fit (e.g. Polymarket, market-maker roles) alongside `resume.json` CoinFLEX bullets. Do not claim specific features without git or JSON evidence.
